import { ContactsPage } from '../class.contacts-page.js';

export class ContactsListener {
    constructor(kanban) {
        this.kanban = kanban;
        this.contactsInstance = kanban.contactsPage;

        if (!this.contactsInstance) {
            console.error("ContactsPage Instanz nicht in Kanban gefunden! Listener kann nicht korrekt initialisiert werden.");
            return;
        }
    }

    deactivateAllListenersContacts() {
        this.deactivateListenersContact();
        this.deactivateListenersDetails();
        this.deactivateListenersEdit();
        this.deactivateListenersDelete();
        this.deactivateListenersAdd();
    }

    activateListenersContact() {
        const moreContactsButton = document.getElementById('moreContactsButton');
        const contactsListContainer = document.getElementById('contactsGeneral');

        if (moreContactsButton && this.contactsInstance?.openAddContacts) {
            moreContactsButton.addEventListener('click', this.contactsInstance.openAddContacts);
        } else {
            if (!moreContactsButton) console.error('ContactsListener: #moreContactsButton nicht gefunden!');
            if (!this.contactsInstance?.openAddContacts) console.error('ContactsListener: openAddContacts Methode nicht auf contactsInstance gefunden!');
        }

        contactsListContainer?.addEventListener('click', this.handleContactListClick);
    }

    deactivateListenersContact() {
        const moreContactsButton = document.getElementById('moreContactsButton');
        const contactsListContainer = document.getElementById('contactsGeneral');

        moreContactsButton?.removeEventListener('click', this.contactsInstance.openAddContacts);
        contactsListContainer?.removeEventListener('click', this.handleContactListClick);
    }

    handleContactListClick = (event) => {
        const listItem = event.target.closest('li.contactListItem');
        if (listItem && this.contactsInstance) {
            const contactId = listItem.dataset.id;
            this.contactsInstance.renderContactsDetails(contactId);
            this.kanban.toggleClass('contactsDetail', 'tt0', 'ttx100');
        }
    };

    activateListenersDetails() {
        const backArrowContacts = document.getElementById('backArrow-contacts');
        const editContactBtn = document.getElementById('editContactBtn');
        const deleteContactBtn = document.getElementById('deleteContactBtn');
        const contactsDetailMore = document.getElementById('contactsDetailMore');

        backArrowContacts?.addEventListener('click', this.handleCloseDetails);
        editContactBtn?.addEventListener('click', this.handleOpenEditFromDetails);
        deleteContactBtn?.addEventListener('click', this.handleOpenDeleteFromDetails);
        contactsDetailMore?.addEventListener('click', this.handleDetailsMore);
    }

    deactivateListenersDetails() {
        const backArrowContacts = document.getElementById('backArrow-contacts');
        const editContactBtn = document.getElementById('editContactBtn');
        const deleteContactBtn = document.getElementById('deleteContactBtn');
        const contactsDetailMore = document.getElementById('contactsDetailMore');

        backArrowContacts?.removeEventListener('click', this.handleCloseDetails);
        editContactBtn?.removeEventListener('click', this.handleOpenEditFromDetails);
        deleteContactBtn?.removeEventListener('click', this.handleOpenDeleteFromDetails);
        contactsDetailMore?.removeEventListener('click', this.handleDetailsMore);
    }

    handleCloseDetails = () => {
        this.kanban.toggleClass('contactsDetail', 'tt0', 'ttx100');
        this.deactivateListenersDetails();
    };

    handleOpenEditFromDetails = (event) => {
        const target = event.target.closest('#editContactBtn');
        const contactId = target?.dataset.id;
        if (contactId && this.contactsInstance) {
            this.contactsInstance.openEditContacts(event, contactId);
        }
    };

    handleOpenDeleteFromDetails = (event) => {
        const target = event.target.closest('#deleteContactBtn');
        const contactId = target?.dataset.id;
        if (contactId && this.contactsInstance) {
            this.contactsInstance.openDeleteContacts(event, contactId);
        }
    };

    handleDetailsMore = (event) => {
        this.kanban.toggleClass('editMenu', 'ts0', 'ts1');
        this.kanban.activateOutsideCheck(event, 'editMenu', 'ts1', 'ts0');
    };

    activateListenersAdd() {
        const addContactX = document.querySelectorAll('#addContact .closeX');
        const addInput = document.querySelectorAll('.addInput');
        const addContactForm = document.querySelector('#addContact form');
        const addContactCancel = document.getElementById('cancelAddContact');

        addContactX?.forEach(b => b.addEventListener('click', this.handleCloseAddContact));
        addInput?.forEach(input => input.addEventListener('keydown', this.preventEnterSubmit));
        addContactForm?.addEventListener('submit', this.handleSubmitAddContact);
        addContactCancel?.addEventListener('click', this.handleCloseAddContact);
    }

    deactivateListenersAdd() {
        const addContactX = document.querySelectorAll('#addContact .closeX');
        const addInput = document.querySelectorAll('.addInput');
        const addContactForm = document.querySelector('#addContact form');
        const addContactCancel = document.getElementById('cancelAddContact');

        addContactX?.forEach(b => b?.removeEventListener('click', this.handleCloseAddContact));
        addInput?.forEach(input => input?.removeEventListener('keydown', this.preventEnterSubmit));
        addContactForm?.removeEventListener('submit', this.handleSubmitAddContact);
        addContactCancel?.removeEventListener('click', this.handleCloseAddContact);
    }

    handleCloseAddContact = () => {
        this.kanban.toggleClass('addContact', 'tt0', 'tty100');
        this.deactivateListenersAdd();
    };

    handleSubmitAddContact = async (event) => {
        event.preventDefault();
        if (this.contactsInstance) {
            const success = await this.contactsInstance.addContacts();
            if (success) {
                this.handleCloseAddContact();
                this.contactsInstance.refreshPage();
            }
        }
    };

    preventEnterSubmit = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    };

    activateListenersEdit() {
        const workContactX = document.querySelectorAll('#editContact .closeX');
        const editInput = document.querySelectorAll('.editInput');
        const editContactForm = document.querySelector('#editContact form');
        const editContactDelete = document.getElementById('editContactDelete');

        workContactX?.forEach(b => b.addEventListener('click', this.handleCloseEditContact));
        editInput?.forEach(input => input.addEventListener('keydown', this.preventEnterSubmit));
        editContactDelete?.addEventListener('click', this.handleOpenDeleteFromEdit);
        editContactForm?.addEventListener('submit', this.handleSubmitEditContact);
    }

    deactivateListenersEdit() {
        const workContactX = document.querySelectorAll('#editContact .closeX');
        const editInput = document.querySelectorAll('.editInput');
        const editContactForm = document.querySelector('#editContact form');
        const editContactDelete = document.getElementById('editContactDelete');

        workContactX?.forEach(b => b?.removeEventListener('click', this.handleCloseEditContact));
        editInput?.forEach(input => input?.removeEventListener('keydown', this.preventEnterSubmit));
        editContactDelete?.removeEventListener('click', this.handleOpenDeleteFromEdit);
        editContactForm?.removeEventListener('submit', this.handleSubmitEditContact);
    }

    handleCloseEditContact = () => {
        this.kanban.toggleClass('editContact', 'tt0', 'tty100');
        this.deactivateListenersEdit();
    };

    handleSubmitEditContact = async (event) => {
        event.preventDefault();
        if (this.contactsInstance) {
            const success = await this.contactsInstance.editContacts();
            if (success) {
                this.handleCloseEditContact();
            }
        }
    };

    handleOpenDeleteFromEdit = (event) => {
        if (this.contactsInstance) {
            this.contactsInstance.openDeleteContacts(event);
        }
    };

    activateListenersDelete() {
        const deleteResponseForm = document.querySelector('#deleteResponse form');
        const closeDeleteResponseBtn = document.getElementById('closeDeleteResponse');

        deleteResponseForm?.addEventListener('submit', this.handleSubmitDeleteContact);
        closeDeleteResponseBtn?.addEventListener('click', this.handleCloseDeleteResponse);
    }

    deactivateListenersDelete() {
        const deleteResponseForm = document.querySelector('#deleteResponse form');
        const closeDeleteResponseBtn = document.getElementById('closeDeleteResponse');

        deleteResponseForm?.removeEventListener('submit', this.handleSubmitDeleteContact);
        closeDeleteResponseBtn?.removeEventListener('click', this.handleCloseDeleteResponse);
    }

    handleSubmitDeleteContact = async (event) => {
        event.preventDefault();
        if (this.contactsInstance) {
            this.handleCloseDeleteResponse();
            await this.contactsInstance.deleteContacts();
        }
    };

    handleCloseDeleteResponse = () => {
        this.kanban.toggleClass('deleteResponse', 'ts0', 'ts1');
        this.deactivateListenersDelete();
    };
};