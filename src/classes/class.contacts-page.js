import { ContactsPageHtml } from "./html/class.html-contacts-page.js";
import { Contact } from "./class.contact.js";

/**
 * Manages the contacts page, rendering, CRUD, and UI logic.
 */
export class ContactsPage {
    //NOTE - Properties
    kanban;
    html;
    currentLetter = '';
    currentLetterId = '';
    editId = -1;

    //NOTE - Constructor & Initialization
    /**
     * @param {object} kanban - Kanban app instance
     */
    constructor(kanban) {
        this.kanban = kanban;
        this.html = new ContactsPageHtml(kanban);
    }

    /**
     * Initialize contacts page.
     */
    async initContacts() {
        this.renderContactList();
    }

    //NOTE - Rendering Logic
    /**
     * Render the contact list.
     */
    renderContactList() {
        const contactList = document.getElementById('contactsGeneral');
        if (!contactList) return this._logError("Element with ID 'contactsGeneral' not found.");
        const sortedContacts = [...this.kanban.contacts].sort((a, b) => a.name.localeCompare(b.name));
        this.currentLetter = '';
        this.currentLetterId = '';
        contactList.innerHTML = this.html.htmlRenderAddContact();
        for (let contact of sortedContacts) {
            if (!(contact instanceof Contact)) contact = new Contact(contact);
            this.renderContactLetter(contact);
            this._renderContactSection(contact);
        }
    }

    /**
     * Render a letter section if needed.
     * @param {Contact} contact
     */
    renderContactLetter(contact) {
        const contactList = document.getElementById('contactsGeneral');
        if (!contactList) return;
        const firstLetter = contact.name[0]?.toUpperCase();
        if (!firstLetter) return;
        if (firstLetter !== this.currentLetter) {
            contactList.innerHTML += this.html.htmlRenderContactLetter(firstLetter);
            this.currentLetter = firstLetter;
            this.currentLetterId = `contactLetter${this.currentLetter}`;
        }
    }

    /**
     * Render contact details.
     * @param {number} contactId
     */
    renderContactsDetails(contactId = this.editId) {
        const details = document.getElementById('contactsDetail');
        if (!details) return this._logError("Element with ID 'contactsDetail' not found.");
        this.editId = contactId;
        let contact = this.kanban.contacts.find(c => c.id === this.editId);
        if (!contact) {
            details.innerHTML = this.html.htmlRenderContactDetailsEmpty();
        } else {
            if (!(contact instanceof Contact)) contact = new Contact(contact);
            details.innerHTML = contact.html.htmlRenderContactDetails();
        }
        this.setActiveContact(contactId);
        this.kanban.activateListenersContactsDetails();
    }

    /**
     * Refresh the contacts page.
     */
    refreshPage() {
        const details = document.getElementById('contactsDetail');
        this.currentLetter = '';
        this.currentLetterId = '';
        if (details && details.classList.contains('tt0')) {
            this.kanban.toggleClass('contactsDetail', 'tt0', 'tty100');
        }
        this.renderContactList();
        this.kanban.activateListenersContacts();
        this.renderContactsDetails(this.editId);
    }

    /**
     * Set the active contact visually.
     * @param {number} id
     */
    setActiveContact(id = this.editId) {
        const contactElementId = `contact${id}`;
        const activeContactElement = document.querySelector('.activeContact');
        const contactElement = document.getElementById(contactElementId);
        if (activeContactElement) activeContactElement.classList.remove('activeContact');
        if (contactElement) contactElement.classList.add('activeContact');
    }

    //NOTE - CRUD Operations
    /**
     * Add a new contact.
     * @returns {Promise<boolean>}
     */
    async addContacts() {
        const { nameInput, emailInput, phoneInput } = this._getAddInputs();
        if (!nameInput || !emailInput || !phoneInput) {
            this._showWarning('.addWarning>p', 'Form incomplete.');
            return false;
        }
        const name = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const phone = phoneInput.value.trim();
        if (!name || !email) {
            this._showWarning('.addWarning>p', 'Name and email are required.');
            return false;
        }
        const newContactData = { name, email, number: phone, isUser: false };
        if (!this.checkForExistingContact(newContactData, '.addWarning>p')) return false;
        return await this._addContactRequest(newContactData);
    }

    /**
     * Edit an existing contact.
     * @param {number} id
     * @returns {Promise<boolean>}
     */
    async editContacts(id = this.editId) {
        const contact = this.kanban.contacts.find(c => c.id === id);
        if (!contact) return this._logError(`Contact with ID ${id} not found for editing.`) || false;
        const { nameInput, emailInput, phoneInput } = this._getEditInputs();
        if (!nameInput || !emailInput || !phoneInput) {
            this._showWarning('.editWarning>p', 'Form incomplete.');
            return false;
        }
        const updatedName = nameInput.value.trim();
        const updatedEmail = emailInput.value.trim().toLowerCase();
        const updatedPhone = phoneInput.value.trim();
        if (!updatedName || !updatedEmail) {
            this._showWarning('.editWarning>p', 'Name and email are required.');
            return false;
        }
        const updatedContactDataForCheck = { id: contact.id, name: updatedName, email: updatedEmail, phone: updatedPhone };
        if (!this.checkForExistingContact(updatedContactDataForCheck, '.editWarning>p')) return false;
        return await this._editContactRequest(contact, id, updatedName, updatedEmail, updatedPhone);
    }

    /**
     * Delete a contact.
     * @param {number} id
     */
    deleteContacts = async (id = this.editId) => {
        if (id === -1 || !this.kanban.contacts.some(c => c.id === id)) {
            this._logWarn(`Attempted to delete invalid contact ID: ${id}`);
            return;
        }
        const contactToDelete = this.kanban.contacts.find(c => c.id === id);
        if (contactToDelete?.isUser && contactToDelete.id !== this.kanban.currentUser?.id) {
            this._showWarning('#deleteResponse .deleteQuestion p', 'You are not allowed to delete this user account!');
            return;
        }
        await this._deleteContactRequest(id);
    };

    //NOTE - Validation
    /**
     * Check if a contact with the same email exists.
     * @param {object} contact
     * @param {string} warningSelector
     * @returns {boolean}
     */
    checkForExistingContact(contact, warningSelector) {
        const warningElement = document.querySelector(warningSelector);
        if (!warningElement) return this._logError(`Warning element not found with selector: ${warningSelector}`) || false;
        const existingContact = this.kanban.contacts.find(
            (c) => (c.email === contact.email && c.id !== (contact.id || -1))
        );
        if (existingContact) {
            warningElement.textContent = 'A contact with this email already exists.';
            warningElement.classList.remove('d-none');
            return false;
        } else {
            warningElement.classList.add('d-none');
            warningElement.textContent = '';
            return true;
        }
    }

    /**
     * Show a warning message.
     * @param {string} selector
     * @param {string} message
     */
    showWarning(selector, message) {
        this._showWarning(selector, message);
    }

    //NOTE - UI Interaction / Modals
    /**
     * Open add contact modal.
     * @param {Event} event
     */
    openAddContacts = (event) => {
        const { nameInput, emailInput, telInput, warningElement } = this._getAddModalElements();
        [nameInput, emailInput, telInput].forEach(input => { if (input) input.value = ''; });
        if (warningElement) warningElement.classList.add('d-none');
        this.kanban.toggleClass('addContact', 'tt0', 'tty100');
        this.kanban.activateListenersContactsAdd();
        this.kanban.activateOutsideCheck(event, 'addContact', 'tt0', 'tty100');
    };

    /**
     * Open edit contact modal.
     * @param {Event} event
     * @param {number} id
     */
    openEditContacts(event, id) {
        this.editId = id;
        const contact = this.kanban.contacts.find((c) => c.id == id);
        if (!contact) return this._logError(`Contact with ID ${id} not found for editing.`);
        const { nameInput, emailInput, telInput, profilePicElement, warningElement } = this._getEditModalElements();
        if (nameInput) nameInput.value = contact.name;
        if (emailInput) emailInput.value = contact.email;
        if (telInput) telInput.value = contact.phone;
        if (profilePicElement) profilePicElement.innerHTML = contact.profilePic || `<div class="initials-placeholder">${contact.firstLetters}</div>`;
        if (warningElement) warningElement.classList.add('d-none');
        this.kanban.toggleClass('editContact', 'tt0', 'tty100');
        this.kanban.activateOutsideCheck(event, 'editContact', 'tt0', 'tty100');
        this.kanban.activateListenersContactsEdit();
    }

    /**
     * Open delete contact modal.
     * @param {Event} event
     * @param {number} id
     */
    openDeleteContacts = (event, id = this.editId) => {
        this.editId = id;
        const responseElement = document.querySelector('#deleteResponse .deleteQuestion p');
        const deleteButton = document.querySelector('#deleteResponse .deleteBtn');
        if (!responseElement || !deleteButton) return this._logError('Delete confirmation modal elements not found.');
        const contact = this.kanban.contacts.find((c) => c.id === id);
        let question;
        let allowDelete = true;
        if (!contact) {
            question = 'This contact no longer exists.';
            allowDelete = false;
        } else if (id == this.kanban.currentUser?.id) {
            question = 'Do you really want to delete your own account?';
        } else if (contact.isUser) {
            question = 'You are not allowed to delete this user account!';
            allowDelete = false;
        } else {
            question = 'Do you really want to delete this contact?';
        }
        responseElement.textContent = question;
        deleteButton.disabled = !allowDelete;
        this.kanban.toggleClass('deleteResponse', 'ts0', 'ttcts1');
        this.kanban.activateOutsideCheck(event, 'deleteResponse', 'ttcts1', 'ts0');
        this.kanban.activateListenersContactsDelete();
    };

    //NOTE --- Private helpers ---

    /** @private */
    _logError(msg) { console.error(msg); }
    /** @private */
    _logWarn(msg) { console.warn(msg); }

    /** @private */
    _showWarning(selector, message) {
        const warningElement = document.querySelector(selector);
        if (warningElement) {
            warningElement.textContent = message;
            warningElement.classList.remove('d-none');
        } else {
            this._logError(`Warning element not found: ${selector}`);
            alert(`Warning: ${message}`);
        }
    }

    /** @private */
    _getAddInputs() {
        return {
            nameInput: document.getElementById('addName'),
            emailInput: document.getElementById('addMail'),
            phoneInput: document.getElementById('addTel')
        };
    }
    /** @private */
    _getEditInputs() {
        return {
            nameInput: document.getElementById('editName'),
            emailInput: document.getElementById('editMail'),
            phoneInput: document.getElementById('editTel')
        };
    }
    /** @private */
    _getAddModalElements() {
        return {
            nameInput: document.getElementById('addName'),
            emailInput: document.getElementById('addMail'),
            telInput: document.getElementById('addTel'),
            warningElement: document.querySelector('.addWarning>p')
        };
    }
    /** @private */
    _getEditModalElements() {
        return {
            nameInput: document.getElementById('editName'),
            emailInput: document.getElementById('editMail'),
            telInput: document.getElementById('editTel'),
            profilePicElement: document.getElementById('editProfilePic'),
            warningElement: document.querySelector('.editWarning>p')
        };
    }
    /** @private */
    _renderContactSection(contact) {
        const contactSection = document.getElementById(this.currentLetterId);
        if (contactSection) {
            contactSection.innerHTML += contact.html.htmlRenderGeneral(this.kanban.currentUser?.id);
        } else {
            this._logWarn(`Contact section element '${this.currentLetterId}' not found.`);
        }
    }
    /** @private */
    async _addContactRequest(newContactData) {
        try {
            const response = await this.kanban.db.post(`api/contacts/`, newContactData);
            if (!response.ok) throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
            let newContactResponse = await response.json();
            const addedContact = new Contact(newContactResponse);
            this.kanban.contacts.push(addedContact);
            this.kanban.setContacts(this.kanban.contacts);
            this.editId = addedContact.id;
            this.refreshPage();
            this.kanban.toggleClass('addContact', 'tty100', 'tt0');
            return true;
        } catch (error) {
            this._logError("Error adding contact: " + error);
            this._showWarning('.addWarning>p', `Error adding: ${error.message}`);
            return false;
        }
    }
    /** @private */
    async _editContactRequest(contact, id, updatedName, updatedEmail, updatedPhone) {
        const updatedContactInstance = new Contact(contact);
        updatedContactInstance.name = updatedName;
        updatedContactInstance.email = updatedEmail;
        updatedContactInstance.phone = updatedPhone;
        const uploadData = updatedContactInstance.toContactUploadObject();
        try {
            const response = await this.kanban.db.update(`api/contacts/${id}/`, uploadData);
            if (!response.ok) {
                if (response.status === 401) {
                    this.kanban.db.logout();
                    return false;
                } if (response.status === 403) throw new Error('You are not allowed to edit this contact.');
                else throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
            }
            let updatedContactResponse = await response.json();
            const finalUpdatedContact = new Contact(updatedContactResponse);
            const existingContactIndex = this.kanban.contacts.findIndex(c => c.id === id);
            if (existingContactIndex !== -1) {
                this.kanban.contacts[existingContactIndex] = finalUpdatedContact;
            } else {
                this.kanban.contacts.push(finalUpdatedContact);
            }
            this.kanban.setContacts(this.kanban.contacts);
            this.editId = finalUpdatedContact.id;
            const isCurrentUserAndMailChanged = (contact.id === this.kanban.currentUser?.id && contact.email.toLowerCase() !== updatedEmail);
            if (isCurrentUserAndMailChanged) {
                this.kanban.db.logout();
            } else {
                this.refreshPage();
                this.kanban.toggleClass('editContact', 'tty100', 'tt0');
            }
            return true;
        } catch (error) {
            this._logError("Error editing contact: " + error);
            this._showWarning('.editWarning>p', `${error.message}`);
            return false;
        }
    }
    /** @private */
    async _deleteContactRequest(id) {
        try {
            const response = await this.kanban.db.delete(`api/contacts/${id}/`);
            if (response.status !== 204) throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
            let newContacts = this.kanban.contacts.filter(c => c.id !== id);
            this.kanban.setContacts(newContacts);
            const wasCurrentUser = (id === this.kanban.currentUser?.id);
            this.editId = -1;
            this.kanban.toggleClass('deleteResponse', 'ttcts1', 'ts0');
            if (wasCurrentUser) {
                this.kanban.db.logout();
            } else {
                this.refreshPage();
            }
        } catch (error) {
            this._logError("Error deleting contact: " + error);
            this._showWarning('#deleteResponse .deleteQuestion p', `Error deleting: ${error.message}`);
        }
    }
}