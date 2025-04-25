import { ContactsPageHtml } from "./html/class.html-contacts-page.js";
import { Contact } from "./class.contact.js";

/**
 * Manages the contacts page, rendering, CRUD, and UI logic.
 */
export class ContactsPage {
    //NOTE Properties
    /** @type {object} Kanban app instance. */
    kanban;
    /** @type {ContactsPageHtml} HTML handler. */
    html;
    /** @type {string} Current letter. */
    currentLetter = '';
    /** @type {string} Current letter ID. */
    currentLetterId = '';
    /** @type {number} Edit contact ID. */
    editId = -1;

    //NOTE Initialization
    /**
     * Creates a ContactsPage instance.
     * @param {object} kanban - Kanban app instance
     */
    constructor(kanban) {
        this.kanban = kanban;
        this.html = new ContactsPageHtml(kanban);
    }

    /**
     * Initializes the contacts page.
     * @returns {Promise<void>}
     */
    async initContacts() { this.renderContactList(); }

    //NOTE Rendering
    /**
     * Renders the contact list.
     * @returns {void}
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
     * Renders a letter section if needed.
     * @param {Contact} contact
     * @returns {void}
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
     * Renders contact details.
     * @param {number} [contactId]
     * @returns {void}
     */
    renderContactsDetails(contactId = this.editId) {
        const details = document.getElementById('contactsDetail');
        if (!details) return this._logError("Element with ID 'contactsDetail' not found.");
        this.editId = contactId;
        let contact = this.kanban.contacts.find(c => c.id === this.editId);
        if (!contact) details.innerHTML = this.html.htmlRenderContactDetailsEmpty();
        else {
            if (!(contact instanceof Contact)) contact = new Contact(contact);
            details.innerHTML = contact.html.htmlRenderContactDetails();
        }
        this.setActiveContact(contactId);
        this.kanban.activateListenersContactsDetails();
    }

    /**
     * Refreshes the contacts page.
     * @returns {void}
     */
    refreshPage() {
        const details = document.getElementById('contactsDetail');
        this.currentLetter = '';
        this.currentLetterId = '';
        if (details && details.classList.contains('tt0')) this.kanban.toggleClass('contactsDetail', 'tt0', 'tty100');
        this.renderContactList();
        this.kanban.activateListenersContacts();
        this.renderContactsDetails(this.editId);
    }

    /**
     * Sets the active contact visually.
     * @param {number} [id]
     * @returns {void}
     */
    setActiveContact(id = this.editId) {
        const contactElementId = `contact${id}`;
        const activeContactElement = document.querySelector('.activeContact');
        const contactElement = document.getElementById(contactElementId);
        if (activeContactElement) activeContactElement.classList.remove('activeContact');
        if (contactElement) contactElement.classList.add('activeContact');
    }

    //NOTE CRUD
    /**
     * Adds a new contact.
     * @returns {Promise<boolean>}
     */
    async addContacts() {
        const { nameInput, emailInput, phoneInput } = this._getAddInputs();
        if (!nameInput || !emailInput || !phoneInput) return this._showWarning('.addWarning>p', 'Form incomplete.') || false;
        const name = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const phone = phoneInput.value.trim();
        if (!name || !email) return this._showWarning('.addWarning>p', 'Name and email are required.') || false;
        const newContactData = { name, email, number: phone, isUser: false };
        if (!this.checkForExistingContact(newContactData, '.addWarning>p')) return false;
        return await this._addContactRequest(newContactData);
    }

    /**
     * Edits an existing contact.
     * @param {number} [id]
     * @returns {Promise<boolean>}
     */
    async editContacts(id = this.editId) {
        const contact = this.kanban.contacts.find(c => c.id === id);
        if (!contact) return this._logError(`Contact with ID ${id} not found for editing.`) || false;
        const { nameInput, emailInput, phoneInput } = this._getEditInputs();
        if (!nameInput || !emailInput || !phoneInput) return this._showWarning('.editWarning>p', 'Form incomplete.') || false;
        const updatedName = nameInput.value.trim();
        const updatedEmail = emailInput.value.trim().toLowerCase();
        const updatedPhone = phoneInput.value.trim();
        if (!updatedName || !updatedEmail) return this._showWarning('.editWarning>p', 'Name and email are required.') || false;
        const updatedContactDataForCheck = { id: contact.id, name: updatedName, email: updatedEmail, phone: updatedPhone };
        if (!this.checkForExistingContact(updatedContactDataForCheck, '.editWarning>p')) return false;
        return await this._editContactRequest(contact, id, updatedName, updatedEmail, updatedPhone);
    }

    /**
     * Deletes a contact.
     * @param {number} [id]
     * @returns {Promise<void>}
     */
    deleteContacts = async (id = this.editId) => {
        if (id === -1 || !this.kanban.contacts.some(c => c.id === id)) return this._logWarn(`Attempted to delete invalid contact ID: ${id}`);
        const contactToDelete = this.kanban.contacts.find(c => c.id === id);
        if (contactToDelete?.isUser && contactToDelete.id !== this.kanban.currentUser?.id) return this._showWarning('#deleteResponse .deleteQuestion p', 'You are not allowed to delete this user account!');
        await this._deleteContactRequest(id);
    };

    /**
     * Checks if a contact with the same email exists.
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
     * Shows a warning message.
     * @param {string} selector
     * @param {string} message
     * @returns {void}
     */
    showWarning(selector, message) { this._showWarning(selector, message); }

    //NOTE Modals
    /**
     * Opens add contact modal.
     * @param {Event} event
     * @returns {void}
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
     * Opens edit contact modal.
     * @param {Event} event
     * @param {number} id
     * @returns {void}
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
     * Opens delete contact modal.
     * @param {Event} event
     * @param {number} [id]
     * @returns {void}
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

    //NOTE Error/Warning Helpers
    /**
     * Logs an error.
     * @param {string} msg
     * @returns {void}
     */
    _logError(msg) { console.error(msg); }

    /**
     * Logs a warning.
     * @param {string} msg
     * @returns {void}
     */
    _logWarn(msg) { console.warn(msg); }

    /**
     * Shows a warning.
     * @param {string} selector
     * @param {string} message
     * @returns {void}
     */
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

    //NOTE Input/Modal Helpers
    /**
     * Gets add contact input elements.
     * @returns {{nameInput: HTMLElement, emailInput: HTMLElement, phoneInput: HTMLElement}}
     */
    _getAddInputs() {
        return {
            nameInput: document.getElementById('addName'),
            emailInput: document.getElementById('addMail'),
            phoneInput: document.getElementById('addTel')
        };
    }

    /**
     * Gets edit contact input elements.
     * @returns {{nameInput: HTMLElement, emailInput: HTMLElement, phoneInput: HTMLElement}}
     */
    _getEditInputs() {
        return {
            nameInput: document.getElementById('editName'),
            emailInput: document.getElementById('editMail'),
            phoneInput: document.getElementById('editTel')
        };
    }

    /**
     * Gets add contact modal elements.
     * @returns {{nameInput: HTMLElement, emailInput: HTMLElement, telInput: HTMLElement, warningElement: HTMLElement}}
     */
    _getAddModalElements() {
        return {
            nameInput: document.getElementById('addName'),
            emailInput: document.getElementById('addMail'),
            telInput: document.getElementById('addTel'),
            warningElement: document.querySelector('.addWarning>p')
        };
    }

    /**
     * Gets edit contact modal elements.
     * @returns {{nameInput: HTMLElement, emailInput: HTMLElement, telInput: HTMLElement, profilePicElement: HTMLElement, warningElement: HTMLElement}}
     */
    _getEditModalElements() {
        return {
            nameInput: document.getElementById('editName'),
            emailInput: document.getElementById('editMail'),
            telInput: document.getElementById('editTel'),
            profilePicElement: document.getElementById('editProfilePic'),
            warningElement: document.querySelector('.editWarning>p')
        };
    }

    //NOTE Section Rendering
    /**
     * Renders a contact section.
     * @param {Contact} contact
     * @returns {void}
     */
    _renderContactSection(contact) {
        const contactSection = document.getElementById(this.currentLetterId);
        if (contactSection) {
            contactSection.innerHTML += contact.html.htmlRenderGeneral(this.kanban.currentUser?.id);
        } else {
            this._logWarn(`Contact section element '${this.currentLetterId}' not found.`);
        }
    }

    //NOTE API Requests
    /**
     * Sends add contact request.
     * @param {object} newContactData
     * @returns {Promise<boolean>}
     */
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

    /**
     * Sends edit contact request.
     * @param {Contact} contact
     * @param {number} id
     * @param {string} updatedName
     * @param {string} updatedEmail
     * @param {string} updatedPhone
     * @returns {Promise<boolean>}
     */
    async _editContactRequest(contact, id, updatedName, updatedEmail, updatedPhone) {
        const updatedContactInstance = this._getUpdatedContact(contact, updatedName, updatedEmail, updatedPhone);
        const uploadData = updatedContactInstance.toContactUploadObject();
        try {
            const response = await this.kanban.db.update(`api/contacts/${id}/`, uploadData);
            if (!response.ok) return await this._handleEditError(response, contact, updatedEmail);
            let updatedContactResponse = await response.json();
            this._updateContactList(id, updatedContactResponse);
            this.editId = updatedContactResponse.id;
            if (contact.id === this.kanban.currentUser?.id && contact.email.toLowerCase() !== updatedEmail) {
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

    /**
     * Returns updated contact instance.
     * @param {Contact} contact
     * @param {string} name
     * @param {string} email
     * @param {string} phone
     * @returns {Contact}
     */
    _getUpdatedContact(contact, name, email, phone) {
        const c = new Contact(contact);
        c.name = name;
        c.email = email;
        c.phone = phone;
        return c;
    }

    /**
     * Handles edit contact API errors.
     * @param {Response} response
     * @param {Contact} contact
     * @param {string} updatedEmail
     * @returns {Promise<boolean>}
     */
    async _handleEditError(response, contact, updatedEmail) {
        if (response.status === 401) { this.kanban.db.logout(); return false; }
        if (response.status === 403) throw new Error('You are not allowed to edit this contact.');
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    /**
     * Updates contact list after edit.
     * @param {number} id
     * @param {object} updatedContactResponse
     * @returns {void}
     */
    _updateContactList(id, updatedContactResponse) {
        const finalUpdatedContact = new Contact(updatedContactResponse);
        const idx = this.kanban.contacts.findIndex(c => c.id === id);
        if (idx !== -1) this.kanban.contacts[idx] = finalUpdatedContact;
        else this.kanban.contacts.push(finalUpdatedContact);
        this.kanban.setContacts(this.kanban.contacts);
    }

    /**
     * Sends delete contact request.
     * @param {number} id
     * @returns {Promise<void>}
     */
    async _deleteContactRequest(id) {
        try {
            const response = await this.kanban.db.delete(`api/contacts/${id}/`);
            if (response.status !== 204) throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
            let newContacts = this.kanban.contacts.filter(c => c.id !== id);
            this.kanban.setContacts(newContacts);
            const wasCurrentUser = (id === this.kanban.currentUser?.id);
            this.editId = -1;
            this.kanban.toggleClass('deleteResponse', 'ttcts1', 'ts0');
            if (wasCurrentUser) this.kanban.db.logout();
            else this.refreshPage();
        } catch (error) {
            this._logError("Error deleting contact: " + error);
            this._showWarning('#deleteResponse .deleteQuestion p', `Error deleting: ${error.message}`);
        }
    }
}