import { ContactsPageHtml } from "./html/class.html-contacts-page.js";
import { Contact } from "./class.contact.js";

export class ContactsPage {
    currentLetter = '';
    currentLetterId = '';
    editId = -1;
    constructor(kanban) {
        this.kanban = kanban;
        this.contactsInstance = kanban.contacts || new ContactsPage(kanban);

        this.html = new ContactsPageHtml(kanban);
    }



    async addContacts(id = editId) {
        const name = document.getElementById('addName').value;
        const email = document.getElementById('addMail').value;
        const phone = document.getElementById('addTel').value;
        const newContact = new Contact({ 'name': name, 'email': email, 'phone': phone, 'isUser': false });

        if (this.checkForExistingContact(newContact)) {
            try {
                const response = await this.kanban.db.post(`api/contacts/`, newContact.html.uploadContactObject());
                let newContactResponse = await response.json();
                if (response.status !== 201) {
                    if (response.status === 400) throw new Error("Bad Request");
                    if (response.status === 401) throw new Error("Unauthorized");
                    if (response.status === 403) throw new Error("Forbidden");
                }
                const addedContact = new Contact(newContactResponse);
                this.kanban.contacts.push(pushToContacts(addedContact.contactObject()));
                editId = addedContact.id;
                sessionStorage.setItem('contacts', JSON.stringify(this.kanban.contacts));
                return true;
            } catch (error) {
                console.error(error);
                const errorMessage = document.querySelector('.warning');
            }
        } else return false;
    }


    checkForExistingContact(contact) {
        const existingContact = this.kanban.contacts.find(
            (c) => (c.email === contact.email && c.id !== (contact.id || -1))
        );

        const warningMessage = contact.id ? document.querySelector(".editWarning>p") : document.querySelector(".addWarning>p");
        if (existingContact) {
            warningMessage.classList.remove("d-none");
            return false;
        } else {
            warningMessage.classList.add("d-none");
            return true;
        }
    }


    openEditContacts(event, id) {
        editId = id;
        const contact = this.kanban.contacts.find((c) => c.id === id);
        const nameInput = document.getElementById('editName');
        const emailInput = document.getElementById('editMail');
        const telInput = document.getElementById('editTel');
        const profilePicElement = document.getElementById('editProfilePic');

        nameInput.value = contact.name;
        emailInput.value = contact.email;
        telInput.value = contact.phone;
        profilePicElement.innerHTML = contact.profilePic;

        this.kanban.toggleClass('editContact', 'tt0', 'tty100');
        this.kanban.activateOutsideCheck(event, 'editContact', 'tt0', 'tty100');
        this.kanban.activateListenersContactsEdit();
    }


    async editContacts(id = editId) {
        const contact = this.kanban.contacts.find(c => c.id === id);
        const updatedName = document.getElementById('editName').value;
        const updatedEmail = document.getElementById('editMail').value;
        const updatedPhone = document.getElementById('editTel').value;
        const updatedContact = new Contact({
            'name': updatedName,
            'email': updatedEmail,
            'phone': updatedPhone,
        });

        if (checkForExistingContact(updatedContact)) {
            try {
                const response = await this.kanban.db.patch(`api/contacts/${id}/`, updatedContact);
                if (response.status !== 200) {
                    if (response.status === 400) throw new Error("Bad Request");
                    if (response.status === 401) throw new Error("Unauthorized");
                    if (response.status === 403) throw new Error("Forbidden");
                }
                let updatedContactResponse = await response.json();
                const updatedContactInstance = new Contact(updatedContactResponse);
                const existingContactIndex = this.kanban.contacts.findIndex(c => c.id === id);
                this.kanban.contacts[existingContactIndex] = updatedContactInstance.contactObject();
                sessionStorage.setItem('contacts', JSON.stringify(this.kanban.contacts));
                contact.id === this.kanban.currentUser.id ? this.kanban.db.logout() : this.refreshPage();
                return true;
            } catch (error) {
                console.error(error);
                const errorMessage = document.querySelector('.warning');
            }
            return false;
        }
    }


    async deleteContacts(id = editId) {
        let response = await this.kanban.db.delete(`api/contacts/${id}/`);
        if (response.status !== 204) {
            console.log(response);
            return;
        };
        this.kanban.contacts.splice(this.kanban.contacts.findIndex(c => c.id == id), 1);
        sessionStorage.setItem('contacts', JSON.stringify(this.kanban.contacts));
        editId = -1;
        id === this.kanban.currentUser.id ? this.kanban.db.logout() : this.refreshPage();
    }


    async initContacts() {
        await this.getContactsData();
        this.renderContactList();
    }



    async getContactsData() {
        const response = await this.kanban.db.get('api/contacts/');
        let loadItem = await response.json();
        this.setContactsArray(loadItem);
        sessionStorage.setItem('contacts', JSON.stringify(this.kanban.contacts));
    }


    setContactsArray(loadItem) {
        this.kanban.setContacts([]);
        for (const contactData of loadItem) {
            if (!contactData) continue;
            const existingContact = this.kanban.contacts.find((c) => c.id === contactData.id);
            if (existingContact) continue;
            const newContact = new Contact(contactData);
            this.kanban.contacts.push(newContact);
        }
    }



    renderContactList() {
        const contactListElement = document.getElementById('contactsGeneral');
        const sortedContacts = [...this.kanban.contacts].sort((a, b) => a.name.localeCompare(b.name));

        contactListElement.innerHTML = this.html.htmlRenderAddContact();

        for (const contact of sortedContacts) {
            this.renderContactLetter(contact);
            const contactSection = document.getElementById(this.currentLetterId);
            contactSection.innerHTML += contact.html.htmlRenderGeneral(this.kanban.currentUser.id);
        }
    }



    renderContactLetter(contact) {
        const contactList = document.getElementById('contactsGeneral');
        const firstLetter = contact.name[0].toUpperCase();
        if (firstLetter !== this.currentLetter) {
            contactList.innerHTML += this.html.htmlRenderContactLetter(firstLetter);
            this.currentLetter = firstLetter;
            this.currentLetterId = `contactLetter${this.currentLetter}`;
        }
    }



    refreshPage() {
        this.currentLetter = '';
        this.currentLetterId = '';
        this.renderContactList();
        this.setActiveContact(editId);
        this.renderContactsDetails(editId);
        this.kanban.activateListenersContacts();
    }



    renderContactsDetails(contactId = '') {
        const detailsElement = document.getElementById('contactsDetail');
        this.editId = contactId;
        const contact = this.kanban.contacts.find(contact => contact.id == this.editId);

        detailsElement.innerHTML = contact && this.editId != -1
            ? contact.html.htmlRenderContactDetails()
            : this.html.htmlRenderContactDetailsEmpty();

        this.setActiveContact(contactId);
        this.kanban.activateListenersContactsDetails();
    }



    setActiveContact(id = editId) {
        const contactElementId = `contact${id}`;
        const activeContactElement = document.querySelector('.activeContact');
        const contactElement = document.getElementById(contactElementId);

        if (activeContactElement) activeContactElement.classList.remove('activeContact');

        if (contactElement) contactElement.classList.add('activeContact');
    }



    openAddContacts(event) {
        const nameInput = document.getElementById('addName');
        const emailInput = document.getElementById('addMail');
        const telInput = document.getElementById('addTel');

        [nameInput, emailInput, telInput].forEach(input => input.value = '');

        this.kanban.toggleClass('addContact', 'tt0', 'tty100');
        this.kanban.activateListenersContactsAdd();
        this.kanban.activateOutsideCheck(event, 'addContact', 'tt0', 'tty100');
    }

    openDeleteContacts(event, id = editId) {
        editId = id;
        const response = document.querySelector('#deleteResponse>.deleteQuestion>p');

        let question;
        if (id === currentUser.id) question = 'Are you sure you want to delete your own account?';
        else if (this.kanban.contacts.find((c) => c.id === id).isUser)
            question = 'You are not allowed to delete this user\'s account!';
        else question = 'Are you sure you want to delete this contact?';

        response.textContent = question;
        this.kanban.toggleClass('deleteResponse', 'ts0', 'ts1');
    }
}