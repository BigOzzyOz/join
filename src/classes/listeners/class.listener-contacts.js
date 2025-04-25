export class ContactsListener {
    //NOTE - Properties
    /** @type {object} Kanban app instance. */
    kanban;
    /** @type {object} ContactsPage instance. */
    contactsInstance;

    //NOTE - Constructor & Initialization
    /**
     * Creates a ContactsListener instance.
     * @param {object} kanban - Kanban app instance
     */
    constructor(kanban) {
        this.kanban = kanban;
        this.contactsInstance = kanban.contactsPage;
        if (!this.contactsInstance) {
            this._logError("ContactsPage instance not found in Kanban! Listener cannot be initialized.");
            return;
        }
        this.activateListenersContact();
    }

    //NOTE - Master Listener Control
    /**
     * Deactivates all contact-related listeners.
     * @returns {void}
     */
    deactivateAllListenersContacts() {
        this.deactivateListenersContact();
        this.deactivateListenersDetails();
        this.deactivateListenersAdd();
        this.deactivateListenersEdit();
        this.deactivateListenersDelete();
    }

    //NOTE - Contact List Listeners & Handlers
    /**
     * Activates listeners for the contact list.
     * @returns {void}
     */
    activateListenersContact() {
        const moreContactsButton = document.getElementById('moreContactsButton');
        const contactsListContainer = document.getElementById('contactsGeneral');
        if (moreContactsButton && this.contactsInstance?.openAddContacts) {
            moreContactsButton.addEventListener('click', this.contactsInstance.openAddContacts);
        } else {
            if (!moreContactsButton) this._logError('ContactsListener: #moreContactsButton not found!');
            if (!this.contactsInstance?.openAddContacts) this._logError('ContactsListener: openAddContacts method not found on contactsInstance!');
        }
        contactsListContainer?.addEventListener('click', this.handleContactListClick);
    }

    /**
     * Deactivates listeners for the contact list.
     * @returns {void}
     */
    deactivateListenersContact() {
        const moreContactsButton = document.getElementById('moreContactsButton');
        const contactsListContainer = document.getElementById('contactsGeneral');
        moreContactsButton?.removeEventListener('click', this.contactsInstance.openAddContacts);
        contactsListContainer?.removeEventListener('click', this.handleContactListClick);
    }

    /**
     * Handles click events in the contact list.
     * @param {Event} event
     * @returns {void}
     */
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
    /**
     * Activates listeners for contact details view.
     * @returns {void}
     */
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

    /**
     * Deactivates listeners for contact details view.
     * @returns {void}
     */
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

    /**
     * Handles closing the contact details view.
     * @returns {void}
     */
    handleCloseDetails = () => {
        this.kanban.toggleClass('contactsDetail', 'tt0', 'ttx100');
        this.deactivateListenersDetails();
    };

    /**
     * Handles opening the edit modal from details view.
     * @param {Event} event
     * @returns {void}
     */
    handleOpenEditFromDetails = (event) => {
        const target = event.target.closest('#editContactBtn');
        const contactId = target?.dataset.id;
        if (contactId && this.contactsInstance) this.contactsInstance.openEditContacts(event, contactId);
    };

    /**
     * Handles opening the delete modal from details view.
     * @param {Event} event
     * @returns {void}
     */
    handleOpenDeleteFromDetails = (event) => {
        const target = event.target.closest('#deleteContactBtn');
        const contactId = target?.dataset.id;
        if (contactId && this.contactsInstance) this.contactsInstance.openDeleteContacts(event, contactId);
    };

    /**
     * Handles opening the details more menu.
     * @param {Event} event
     * @returns {void}
     */
    handleDetailsMore = (event) => {
        this.kanban.toggleClass('editMenu', 'ts0', 'ts1');
        this.kanban.activateOutsideCheck(event, 'editMenu', 'ts1', 'ts0');
    };

    //NOTE - Add Contact Modal Listeners & Handlers
    /**
     * Activates listeners for the add contact modal.
     * @returns {void}
     */
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

    /**
     * Deactivates listeners for the add contact modal.
     * @returns {void}
     */
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

    /**
     * Handles closing the add contact modal.
     * @returns {void}
     */
    handleCloseAddContact = () => {
        this.kanban.toggleClass('addContact', 'tt0', 'tty100');
        this.deactivateListenersAdd();
    };

    /**
     * Handles submitting the add contact form.
     * @param {Event} event
     * @returns {Promise<void>}
     */
    handleSubmitAddContact = async (event) => {
        event.preventDefault();
        if (this.contactsInstance) await this.contactsInstance.addContacts();
    };

    //NOTE - Edit Contact Modal Listeners & Handlers
    /**
     * Activates listeners for the edit contact modal.
     * @returns {void}
     */
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

    /**
     * Deactivates listeners for the edit contact modal.
     * @returns {void}
     */
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

    /**
     * Handles closing the edit contact modal.
     * @returns {void}
     */
    handleCloseEditContact = () => {
        this.kanban.toggleClass('editContact', 'tt0', 'tty100');
        this.deactivateListenersEdit();
    };

    /**
     * Handles submitting the edit contact form.
     * @param {Event} event
     * @returns {Promise<void>}
     */
    handleSubmitEditContact = async (event) => {
        event.preventDefault();
        if (this.contactsInstance) await this.contactsInstance.editContacts();
    };

    /**
     * Handles opening the delete modal from edit modal.
     * @param {Event} event
     * @returns {void}
     */
    handleOpenDeleteFromEdit = (event) => {
        if (this.contactsInstance) this.contactsInstance.openDeleteContacts(event);
    };

    //NOTE - Delete Contact Modal Listeners & Handlers
    /**
     * Activates listeners for the delete contact modal.
     * @returns {void}
     */
    activateListenersDelete() {
        const deleteResponseModal = document.getElementById('deleteResponse');
        if (!deleteResponseModal) return;
        const deleteResponseForm = deleteResponseModal.querySelector('form');
        const closeDeleteResponseBtn = deleteResponseModal.querySelector('#closeDeleteResponse');
        deleteResponseForm?.addEventListener('submit', this.handleSubmitDeleteContact);
        closeDeleteResponseBtn?.addEventListener('click', this.handleCloseDeleteResponse);
    }

    /**
     * Deactivates listeners for the delete contact modal.
     * @returns {void}
     */
    deactivateListenersDelete() {
        const deleteResponseModal = document.getElementById('deleteResponse');
        if (!deleteResponseModal) return;
        const deleteResponseForm = deleteResponseModal.querySelector('form');
        const closeDeleteResponseBtn = deleteResponseModal.querySelector('#closeDeleteResponse');
        deleteResponseForm?.removeEventListener('submit', this.handleSubmitDeleteContact);
        closeDeleteResponseBtn?.removeEventListener('click', this.handleCloseDeleteResponse);
    }

    /**
     * Handles submitting the delete contact form.
     * @param {Event} event
     * @returns {Promise<void>}
     */
    handleSubmitDeleteContact = async (event) => {
        event.preventDefault();
        if (this.contactsInstance) await this.contactsInstance.deleteContacts();
    };

    /**
     * Handles closing the delete contact modal.
     * @returns {void}
     */
    handleCloseDeleteResponse = () => {
        this.kanban.toggleClass('deleteResponse', 'ts0', 'ttcts1');
        this.deactivateListenersDelete();
    };

    //NOTE - Helper Functions
    /**
     * Prevents form submission on Enter key press.
     * @param {KeyboardEvent} e
     * @returns {void}
     */
    preventEnterSubmit = (e) => {
        if (e.key === 'Enter') e.preventDefault();
    };

    //NOTE - Error Handling
    /**
     * Logs an error message.
     * @param {string} msg
     * @returns {void}
     */
    _logError(msg) { console.error(msg); }
}