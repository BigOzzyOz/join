import { ContactsPageHtml } from "./html/class.html-contacts-page.js";
import { Contact } from "./class.contact.js";

export class ContactsPage {
    //NOTE - Properties

    kanban;
    html;
    currentLetter = '';
    currentLetterId = '';
    editId = -1;

    //NOTE - Constructor & Initialization

    constructor(kanban) {
        this.kanban = kanban;
        this.html = new ContactsPageHtml(kanban);
    }

    async initContacts() {
        this.renderContactList();
    }

    //NOTE - Rendering Logic

    renderContactList() {
        const contactListElement = document.getElementById('contactsGeneral');
        if (!contactListElement) {
            console.error("Element with ID 'contactsGeneral' not found.");
            return;
        }

        const sortedContacts = [...this.kanban.contacts].sort((a, b) => a.name.localeCompare(b.name));

        this.currentLetter = '';
        this.currentLetterId = '';
        contactListElement.innerHTML = this.html.htmlRenderAddContact();

        for (let contact of sortedContacts) {
            if (!(contact instanceof Contact)) contact = new Contact(contact);
            this.renderContactLetter(contact);
            const contactSection = document.getElementById(this.currentLetterId);
            if (contactSection) {
                contactSection.innerHTML += contact.html.htmlRenderGeneral(this.kanban.currentUser?.id);
            } else {
                console.warn(`Contact section element '${this.currentLetterId}' not found.`);
            }
        }
        this.kanban.activateListenersContacts();
    }

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

    renderContactsDetails(contactId = this.editId) {
        const detailsElement = document.getElementById('contactsDetail');
        if (!detailsElement) {
            console.error("Element with ID 'contactsDetail' not found.");
            return;
        }

        this.editId = contactId;
        let contact = this.kanban.contacts.find(c => c.id === this.editId);

        if (!contact) {
            detailsElement.innerHTML = this.html.htmlRenderContactDetailsEmpty();
        } else {
            if (!(contact instanceof Contact)) contact = new Contact(contact);
            detailsElement.innerHTML = contact.html.htmlRenderContactDetails();
        }

        this.setActiveContact(contactId);
        this.kanban.activateListenersContactsDetails();
    }

    refreshPage() {
        const contactsDetail = document.getElementById('contactsDetail');

        this.currentLetter = '';
        this.currentLetterId = '';

        if (contactsDetail && contactsDetail.classList.contains('tt0')) {
            this.kanban.toggleClass('contactsDetail', 'tt0', 'tty100');
        }

        this.renderContactList();

        this.renderContactsDetails(this.editId);
    }

    setActiveContact(id = this.editId) {
        const contactElementId = `contact${id}`;
        const activeContactElement = document.querySelector('.activeContact');
        const contactElement = document.getElementById(contactElementId);

        if (activeContactElement) {
            activeContactElement.classList.remove('activeContact');
        }
        if (contactElement) {
            contactElement.classList.add('activeContact');
        }
    }

    //NOTE - CRUD Operations

    async addContacts() {
        const nameInput = document.getElementById('addName');
        const emailInput = document.getElementById('addMail');
        const phoneInput = document.getElementById('addTel');

        if (!nameInput || !emailInput || !phoneInput) {
            console.error("Add contact form elements not found.");
            this.showWarning('.addWarning>p', "Formular unvollständig.");
            return false;
        }

        const name = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const phone = phoneInput.value.trim();

        if (!name || !email) {
            this.showWarning('.addWarning>p', "Name und E-Mail sind erforderlich.");
            return false;
        }

        const newContactData = { 'name': name, 'email': email, 'number': phone, 'isUser': false };

        if (!this.checkForExistingContact(newContactData, '.addWarning>p')) {
            return false;
        }

        try {
            const response = await this.kanban.db.post(`api/contacts/`, newContactData);
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
            }
            let newContactResponse = await response.json();

            const addedContact = new Contact(newContactResponse);
            this.kanban.contacts.push(addedContact);
            this.kanban.setContacts(this.kanban.contacts);

            this.editId = addedContact.id;
            this.refreshPage();
            this.kanban.toggleClass('addContact', 'tty100', 'tt0');
            return true;

        } catch (error) {
            console.error("Error adding contact:", error);
            this.showWarning('.addWarning>p', `Fehler beim Hinzufügen: ${error.message}`);
            return false;
        }
    }

    async editContacts(id = this.editId) {
        const contact = this.kanban.contacts.find(c => c.id === id);
        if (!contact) {
            console.error(`Contact with ID ${id} not found for editing.`);
            return false;
        }

        const nameInput = document.getElementById('editName');
        const emailInput = document.getElementById('editMail');
        const phoneInput = document.getElementById('editTel');

        if (!nameInput || !emailInput || !phoneInput) {
            console.error("Edit contact form elements not found.");
            this.showWarning('.editWarning>p', "Formular unvollständig.");
            return false;
        }

        const updatedName = nameInput.value.trim();
        const updatedEmail = emailInput.value.trim().toLowerCase();
        const updatedPhone = phoneInput.value.trim();

        if (!updatedName || !updatedEmail) {
            this.showWarning('.editWarning>p', "Name und E-Mail sind erforderlich.");
            return false;
        }

        const updatedContactDataForCheck = { id: contact.id, name: updatedName, email: updatedEmail, phone: updatedPhone };

        if (!this.checkForExistingContact(updatedContactDataForCheck, '.editWarning>p')) {
            return false;
        }

        const updatedContactInstance = new Contact(contact);
        updatedContactInstance.name = updatedName;
        updatedContactInstance.email = updatedEmail;
        updatedContactInstance.phone = updatedPhone;
        const uploadData = updatedContactInstance.uploadContactObject();

        try {
            const response = await this.kanban.db.update(`api/contacts/${id}/`, uploadData);
            if (!response.ok) {
                if (response.status === 401) {
                    this.kanban.db.logout();
                    return false;
                } if (response.status === 403) throw new Error("You are not allowed to edit this contact.");
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

            if (contact.id === this.kanban.currentUser?.id) {
                this.kanban.db.logout();
            } else {
                this.refreshPage();
                this.kanban.toggleClass('editContact', 'tty100', 'tt0');
            }
            return true;

        } catch (error) {
            console.error("Error editing contact:", error);
            this.showWarning('.editWarning>p', `${error.message}`);
            return false;
        }
    }

    deleteContacts = async (id = this.editId) => {
        if (id === -1 || !this.kanban.contacts.some(c => c.id === id)) {
            console.warn("Attempted to delete invalid contact ID:", id);
            return;
        }
        const contactToDelete = this.kanban.contacts.find(c => c.id === id);
        if (contactToDelete?.isUser && contactToDelete.id !== this.kanban.currentUser?.id) {
            console.warn("Attempted to delete another user account.");
            this.showWarning('#deleteResponse .deleteQuestion p', 'You are not allowed to delete this user\'s account!');
            return;
        }

        try {
            const response = await this.kanban.db.delete(`api/contacts/${id}/`);

            if (response.status !== 204) {
                throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
            }

            const indexToRemove = this.kanban.contacts.findIndex(c => c.id === id);
            if (indexToRemove !== -1) {
                this.kanban.contacts.splice(indexToRemove, 1);
            }
            this.kanban.setContacts(this.kanban.contacts);

            const wasCurrentUser = (id === this.kanban.currentUser?.id);
            this.editId = -1;

            this.kanban.toggleClass('deleteResponse', 'ttcts1', 'ts0');

            if (wasCurrentUser) {
                this.kanban.db.logout();
            } else {
                this.refreshPage();
            }

        } catch (error) {
            console.error("Error deleting contact:", error);
            this.showWarning('#deleteResponse .deleteQuestion p', `Fehler beim Löschen: ${error.message}`);
        }
    };

    //NOTE - Validation

    checkForExistingContact(contact, warningSelector) {
        const warningElement = document.querySelector(warningSelector);
        if (!warningElement) {
            console.error(`Warning element not found with selector: ${warningSelector}`);
            return false;
        }

        const existingContact = this.kanban.contacts.find(
            (c) => (c.email === contact.email && c.id !== (contact.id || -1))
        );

        if (existingContact) {
            warningElement.textContent = "Ein Kontakt mit dieser E-Mail existiert bereits.";
            warningElement.classList.remove("d-none");
            return false;
        } else {
            warningElement.classList.add("d-none");
            warningElement.textContent = "";
            return true;
        }
    }

    showWarning(selector, message) {
        const warningElement = document.querySelector(selector);
        if (warningElement) {
            warningElement.textContent = message;
            warningElement.classList.remove('d-none');
        } else {
            console.error(`Warning element not found: ${selector}`);
            alert(`Warning: ${message}`);
        }
    }

    //NOTE - UI Interaction / Modals

    openAddContacts = (event) => {
        const nameInput = document.getElementById('addName');
        const emailInput = document.getElementById('addMail');
        const telInput = document.getElementById('addTel');
        const warningElement = document.querySelector(".addWarning>p");

        [nameInput, emailInput, telInput].forEach(input => { if (input) input.value = ''; });
        if (warningElement) warningElement.classList.add('d-none');

        this.kanban.toggleClass('addContact', 'tt0', 'tty100');
        this.kanban.activateListenersContactsAdd();
        this.kanban.activateOutsideCheck(event, 'addContact', 'tt0', 'tty100');
    };

    openEditContacts(event, id) {
        this.editId = id;
        const contact = this.kanban.contacts.find((c) => c.id == id);
        if (!contact) {
            console.error(`Contact with ID ${id} not found for editing.`);
            return;
        }

        const nameInput = document.getElementById('editName');
        const emailInput = document.getElementById('editMail');
        const telInput = document.getElementById('editTel');
        const profilePicElement = document.getElementById('editProfilePic');
        const warningElement = document.querySelector(".editWarning>p");

        if (nameInput) nameInput.value = contact.name;
        if (emailInput) emailInput.value = contact.email;
        if (telInput) telInput.value = contact.phone;
        if (profilePicElement) profilePicElement.innerHTML = contact.profilePic || `<div class="initials-placeholder">${contact.firstLetters}</div>`;
        if (warningElement) warningElement.classList.add('d-none');

        this.kanban.toggleClass('editContact', 'tt0', 'tty100');
        this.kanban.activateOutsideCheck(event, 'editContact', 'tt0', 'tty100');
        this.kanban.activateListenersContactsEdit();
    }

    openDeleteContacts = (event, id = this.editId) => {
        this.editId = id;
        const responseElement = document.querySelector('#deleteResponse .deleteQuestion p');
        const deleteButton = document.querySelector('#deleteResponse .deleteBtn');

        if (!responseElement || !deleteButton) {
            console.error("Delete confirmation modal elements not found.");
            return;
        }

        const contact = this.kanban.contacts.find((c) => c.id === id);
        let question;
        let allowDelete = true;

        if (!contact) {
            question = 'Dieser Kontakt existiert nicht mehr.';
            allowDelete = false;
        } else if (id == this.kanban.currentUser?.id) {
            question = 'Möchtest du wirklich dein eigenes Konto löschen?';
        } else if (contact.isUser) {
            question = 'Du darfst das Konto dieses Benutzers nicht löschen!';
            allowDelete = false;
        } else {
            question = 'Möchtest du diesen Kontakt wirklich löschen?';
        }

        responseElement.textContent = question;
        deleteButton.disabled = !allowDelete;

        this.kanban.toggleClass('deleteResponse', 'ts0', 'ttcts1');
        this.kanban.activateOutsideCheck(event, 'deleteResponse', 'ttcts1', 'ts0');
        this.kanban.activateListenersContactsDelete();
    };
}