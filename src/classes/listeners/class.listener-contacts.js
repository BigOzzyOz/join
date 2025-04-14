import { ContactsPage } from '../class.contacts-page.js';

export class ContactsListener {
    constructor(kanban) {
        this.kanban = kanban;
        this.contactsInstance = kanban.contacts || new ContactsPage(kanban);
        this.activateListenersContact();
    }

    //NOTE - Listener and handler functions


    deactivateAllListenersContacts() {
        this.deactivateListeners();
        this.deactivateListenersDetails();
        this.deactivateListenersEdit();
        this.deactivateListenersDelete();
        this.deactivateListenersAdd();
    }



    activateListenersContact() {
        const moreContactsButton = document.getElementById('moreContactsButton');
        const contactsListItem = document.querySelectorAll('.contactListItem');
        moreContactsButton?.addEventListener('click', this.contactsInstance.openAddContacts);
        contactsListItem?.forEach(item => item.addEventListener('click', this.openContactDetails));
    }



    deactivateListeners() {
        const moreContactsButton = document.getElementById('moreContactsButton');
        const contactsListItem = document.querySelectorAll('.contactListItem');
        moreContactsButton?.removeEventListener('click', this.contactsInstance.openAddContacts);
        contactsListItem?.forEach(item => item?.removeEventListener('click', this.openContactDetails));
    }



    openContactDetails(event) {
        const listItem = event.target.closest('li.contactListItem');
        toggleClass('contactsDetail', 'tt0', 'ttx100');
        renderContactsDetails(listItem.dataset.id);
    }



    activateListenersDetails() {
        const backArrowContacts = document.getElementById('backArrow-contacts');
        const editContactBtn = document.getElementById('editContactBtn');
        const deleteContactBtn = document.getElementById('deleteContactBtn');
        const contactsDetailMore = document.getElementById('contactsDetailMore');
        backArrowContacts?.addEventListener('click', closeDetails);
        editContactBtn?.addEventListener('click', openEditContactsButton);
        deleteContactBtn?.addEventListener('click', openDeleteContactsButton);
        contactsDetailMore?.addEventListener('click', contactsDetailsMore);
    }



    deactivateListenersDetails() {
        const backArrowContacts = document.getElementById('backArrow-contacts');
        const editContactBtn = document.getElementById('editContactBtn');
        const deleteContactBtn = document.getElementById('deleteContactBtn');
        const contactDetailsMore = document.getElementById('contactDetailsMore');
        backArrowContacts?.removeEventListener('click', closeDetails);
        editContactBtn?.removeEventListener('click', openEditContactsButton);
        deleteContactBtn?.removeEventListener('click', openDeleteContactsButton);
        contactDetailsMore?.removeEventListener('click', contactsDetailsMore);
    }



    closeDetails() {
        toggleClass('contactsDetail', 'tt0', 'ttx100');
    }



    openDeleteContactsButton(event) {
        const target = event.target.closest('#deleteContactBtn');
        openDeleteContacts(target.dataset.id);
        activateListenersDelete();
    }



    openEditContactsButton(event) {
        const target = event.target.closest('#editContactBtn');
        openEditContacts(event, target.dataset.id);
    }



    contactsDetailsMore(event) {
        toggleClass('editMenu', 'ts0', 'ts1');
        activateOutsideCheck(event, 'editMenu', 'ts1', 'ts0');
    }



    activateListenersAdd() {
        const addContactX = document.querySelectorAll('#addContact .closeX');
        const addInput = document.querySelectorAll('.addInput');
        const addContact = document.querySelector('#addContact form');
        const addContactCancel = document.getElementById('cancelAddContact');
        addContactX?.forEach(b => b.addEventListener('click', closeAddContact));
        addInput?.forEach(input => input.addEventListener('keydown', (e) => e.key === 'Enter' && e.preventDefault()));
        addContact?.addEventListener('submit', submitAddContact);
        addContactCancel?.addEventListener('click', closeAddContact);
    }



    deactivateListenersAdd() {
        const addContactX = document.querySelectorAll('#addContact .closeX');
        const addInput = document.querySelectorAll('.addInput');
        const addContact = document.querySelector('#addContact form');
        const addContactCancel = document.getElementById('cancelAddContact');
        addContactX?.forEach(b => b?.removeEventListener('click', closeAddContact));
        addInput?.forEach(input => input?.removeEventListener('keydown', (e) => e.key === 'Enter' && e.preventDefault()));
        addContact?.removeEventListener('submit', submitAddContact);
        addContactCancel?.removeEventListener('click', closeAddContact);
    }



    closeAddContact() {
        toggleClass('addContact', 'tt0', 'tty100');
        deactivateListenersAdd();
    }



    async submitAddContact(event) {
        event.preventDefault();
        if (await addContacts()) closeAddContact();
        refreshPage();
    }



    activateListenersEdit() {
        const workContactX = document.querySelectorAll('#editContact .closeX');
        const editInput = document.querySelectorAll('.editInput');
        const editContact = document.querySelector('#editContact form');
        const editContactDelete = document.getElementById('editContactDelete');
        workContactX?.forEach(b => b.addEventListener('click', closeEditContact));
        editInput?.forEach(input => input.addEventListener('keydown', (e) => e.key === 'Enter' && e.preventDefault()));
        editContactDelete?.addEventListener('click', openDeleteContacts);
        editContact?.addEventListener('submit', submitEditContact);
    }



    deactivateListenersEdit() {
        const workContactX = document.querySelectorAll('#editContact .closeX');
        const editInput = document.querySelectorAll('.editInput');
        const editContact = document.querySelector('#editContact form');
        const editContactDelete = document.getElementById('editContactDelete');
        workContactX?.forEach(b => b?.removeEventListener('click', closeEditContact));
        editInput?.forEach(input => input?.removeEventListener('keydown', (e) => e.key === 'Enter' && e.preventDefault()));
        editContactDelete?.removeEventListener('click', openDeleteContacts);
        editContact?.removeEventListener('submit', submitEditContact);
    }



    closeEditContact() {
        toggleClass('editContact', 'tt0', 'tty100');
        deactivateListenersEdit();
    }



    async submitEditContact(event) {
        event.preventDefault();
        editContacts();
        if (await editContacts()) closeEditContact();
        refreshPage();
    }



    activateListenersDelete() {
        const deleteResponse = document.querySelector('#deleteResponse form');
        const closeDeleteResponseBtn = document.getElementById('closeDeleteResponse');
        deleteResponse?.addEventListener('submit', submitDeleteContact);
        closeDeleteResponseBtn?.addEventListener('click', closeDeleteResponse);
    }



    deactivateListenersDelete() {
        const deleteResponse = document.querySelector('#deleteResponse form');
        const closeDeleteResponseBtn = document.getElementById('closeDeleteResponse');
        deleteResponse?.removeEventListener('submit', submitDeleteContact);
        closeDeleteResponseBtn?.removeEventListener('click', closeDeleteResponse);
    }



    submitDeleteContact(event) {
        event.preventDefault();
        closeDeleteResponse();
        deleteContacts();
    }



    closeDeleteResponse() {
        toggleClass('deleteResponse', 'ts0', 'ts1');
        deactivateListenersDelete();
    }
}