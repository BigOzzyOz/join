export class ContactsListener {
    //NOTE - Properties

    kanban;
    contactsInstance;

    //NOTE - Constructor & Initialization

    constructor(kanban) {
        this.kanban = kanban;
        this.contactsInstance = kanban.contactsPage;

        if (!this.contactsInstance) {
            console.error("ContactsPage Instanz nicht in Kanban gefunden! Listener kann nicht korrekt initialisiert werden.");
            return;
        }
        this.activateListenersContact();
    }

    //NOTE - Master Listener Control

    deactivateAllListenersContacts() {
        this.deactivateListenersContact();
        this.deactivateListenersDetails();
        this.deactivateListenersAdd();
        this.deactivateListenersEdit();
        this.deactivateListenersDelete();
    }

    //NOTE - Contact List Listeners & Handlers

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
            if (contactId) {
                this.contactsInstance.renderContactsDetails(contactId);
                this.kanban.toggleClass('contactsDetail', 'tt0', 'ttx100');
            }
        }
    };

    //NOTE - Contact Details Listeners & Handlers

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

    //NOTE - Add Contact Modal Listeners & Handlers

    activateListenersAdd() {
        const addContactModal = document.getElementById('addContact');
        if (!addContactModal) return;

        const addContactX = addContactModal.querySelectorAll('.closeX');
        const addInput = addContactModal.querySelectorAll('.addInput');
        const addContactForm = addContactModal.querySelector('form');
        const addContactCancel = addContactModal.querySelector('#cancelAddContact');

        addContactX?.forEach(b => b.addEventListener('click', this.handleCloseAddContact));
        addInput?.forEach(input => input.addEventListener('keydown', this.preventEnterSubmit));
        addContactForm?.addEventListener('submit', this.handleSubmitAddContact);
        addContactCancel?.addEventListener('click', this.handleCloseAddContact);
    }

    deactivateListenersAdd() {
        const addContactModal = document.getElementById('addContact');
        if (!addContactModal) return;

        const addContactX = addContactModal.querySelectorAll('.closeX');
        const addInput = addContactModal.querySelectorAll('.addInput');
        const addContactForm = addContactModal.querySelector('form');
        const addContactCancel = addContactModal.querySelector('#cancelAddContact');

        addContactX?.forEach(b => b?.removeEventListener('click', this.handleCloseAddContact));
        addInput?.forEach(input => input?.removeEventListener('keydown', this.preventEnterSubmit));
        addContactForm?.removeEventListener('submit', this.handleSubmitAddContact);
        addContactCancel?.removeEventListener('click', this.handleCloseAddContact);
    }

    handleCloseAddContact = () => {
        this.kanban.toggleClass('addContact', 'tt0', 'tty100'); // Hide modal
        this.deactivateListenersAdd(); // Clean up listeners
    };

    handleSubmitAddContact = async (event) => {
        event.preventDefault();
        if (this.contactsInstance) {
            await this.contactsInstance.addContacts();
        }
    };

    //NOTE - Edit Contact Modal Listeners & Handlers

    activateListenersEdit() {
        const editContactModal = document.getElementById('editContact');
        if (!editContactModal) return;

        const workContactX = editContactModal.querySelectorAll('.closeX');
        const editInput = editContactModal.querySelectorAll('.editInput');
        const editContactForm = editContactModal.querySelector('form');
        const editContactDelete = editContactModal.querySelector('#editContactDelete');

        workContactX?.forEach(b => b.addEventListener('click', this.handleCloseEditContact));
        editInput?.forEach(input => input.addEventListener('keydown', this.preventEnterSubmit));
        editContactDelete?.addEventListener('click', this.handleOpenDeleteFromEdit);
        editContactForm?.addEventListener('submit', this.handleSubmitEditContact);
    }

    deactivateListenersEdit() {
        const editContactModal = document.getElementById('editContact');
        if (!editContactModal) return;

        const workContactX = editContactModal.querySelectorAll('.closeX');
        const editInput = editContactModal.querySelectorAll('.editInput');
        const editContactForm = editContactModal.querySelector('form');
        const editContactDelete = editContactModal.querySelector('#editContactDelete');

        workContactX?.forEach(b => b?.removeEventListener('click', this.handleCloseEditContact));
        editInput?.forEach(input => input?.removeEventListener('keydown', this.preventEnterSubmit));
        editContactDelete?.removeEventListener('click', this.handleOpenDeleteFromEdit);
        editContactForm?.removeEventListener('submit', this.handleSubmitEditContact);
    }

    handleCloseEditContact = () => {
        this.kanban.toggleClass('editContact', 'tt0', 'tty100'); // Hide modal
        this.deactivateListenersEdit(); // Clean up listeners
    };

    handleSubmitEditContact = async (event) => {
        event.preventDefault();
        if (this.contactsInstance) {
            await this.contactsInstance.editContacts();
        }
    };

    handleOpenDeleteFromEdit = (event) => {
        if (this.contactsInstance) {
            this.contactsInstance.openDeleteContacts(event);
        }
    };

    //NOTE - Delete Contact Modal Listeners & Handlers

    activateListenersDelete() {
        const deleteResponseModal = document.getElementById('deleteResponse');
        if (!deleteResponseModal) return;

        const deleteResponseForm = deleteResponseModal.querySelector('form');
        const closeDeleteResponseBtn = deleteResponseModal.querySelector('#closeDeleteResponse');

        deleteResponseForm?.addEventListener('submit', this.handleSubmitDeleteContact);
        closeDeleteResponseBtn?.addEventListener('click', this.handleCloseDeleteResponse);
    }

    deactivateListenersDelete() {
        const deleteResponseModal = document.getElementById('deleteResponse');
        if (!deleteResponseModal) return;

        const deleteResponseForm = deleteResponseModal.querySelector('form');
        const closeDeleteResponseBtn = deleteResponseModal.querySelector('#closeDeleteResponse');

        deleteResponseForm?.removeEventListener('submit', this.handleSubmitDeleteContact);
        closeDeleteResponseBtn?.removeEventListener('click', this.handleCloseDeleteResponse);
    }

    handleSubmitDeleteContact = async (event) => {
        event.preventDefault();
        if (this.contactsInstance) {
            await this.contactsInstance.deleteContacts();
        }
    };

    handleCloseDeleteResponse = () => {
        this.kanban.toggleClass('deleteResponse', 'ts0', 'ttcts1');
        this.deactivateListenersDelete();
    };

    //NOTE - Helper Functions
    preventEnterSubmit = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Stop Enter from submitting the form
        }
    };
};