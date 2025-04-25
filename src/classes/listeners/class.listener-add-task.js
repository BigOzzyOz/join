export class AddTaskListener {
    //NOTE - Properties
    /** @type {object} Kanban app instance. */
    kanban;
    /** @type {object} AddTask instance. */
    addTaskInstance;
    /** @type {object|null} Board instance. */
    boardInstance;

    //NOTE - Constructor & Initialization
    /**
     * Creates an AddTaskListener instance.
     * @param {object} kanban - Kanban app instance
     */
    constructor(kanban) {
        this.kanban = kanban;
        this.addTaskInstance = kanban.addTask;
        this.boardInstance = kanban.board || null;
        this.activateAddTaskListeners();
    }

    //NOTE - Listener Activation/Deactivation
    /**
     * Activates all add task listeners.
     * @returns {void}
     */
    activateAddTaskListeners() {
        this.addTaskListenerGeneral("add");
        this.addTaskListenerAssign("add");
        this.addTaskListenerSubtasks("add");
        this.addTaskListenerCategory("add");
        this.addTaskListenerPrio("add");
        this.addTaskListenerDate("add");
    }

    /**
     * Deactivates all add task listeners.
     * @returns {void}
     */
    deactivateAllAddTaskListeners() {
        this.addTaskListenerGeneral("remove");
        this.addTaskListenerAssign("remove");
        this.addTaskListenerSubtasks("remove");
        this.addTaskListenerCategory("remove");
        this.addTaskListenerPrio("remove");
        this.addTaskListenerDate("remove");
        this.deactivateSubtaskListeners();
    }

    //NOTE - Listener Methods (General, Assign, Subtasks, Category, Prio, Date)
    /**
     * Adds or removes general listeners for add task modal.
     * @param {string} action - 'add' or 'remove'
     * @returns {void}
     */
    addTaskListenerGeneral(action) {
        const closeBtn = document.getElementById("addTaskModalCloseBtn");
        const clearBtn = document.getElementById("clearBtn");
        const addTaskForm = document.getElementById("addTaskForm");
        if (action === "add") {
            clearBtn?.addEventListener('click', this.addTaskInstance.clearAddTaskForm);
            addTaskForm?.addEventListener('submit', this.handleSubmitBtnClick);
            if (this.boardInstance) closeBtn?.addEventListener('click', this.boardInstance.closeModal);
        } else if (action === "remove") {
            clearBtn?.removeEventListener('click', this.addTaskInstance.clearAddTaskForm);
            addTaskForm?.removeEventListener('submit', this.handleSubmitBtnClick);
            if (this.boardInstance) closeBtn?.removeEventListener('click', this.boardInstance.closeModal);
        }
    }

    /**
     * Adds or removes listeners for assign dropdown.
     * @param {string} action - 'add' or 'remove'
     * @returns {void}
     */
    addTaskListenerAssign(action) {
        const assignSearchInputField = document.getElementById("assignSearch");
        const assignSearchDropdown = document.getElementById("assignDropArrowContainer");
        if (action === "add") {
            assignSearchInputField?.addEventListener('click', this.addTaskInstance.toggleDropdown);
            assignSearchInputField?.addEventListener('input', this.addTaskInstance.assignSearchInput);
            assignSearchDropdown?.addEventListener('click', this.addTaskInstance.toggleDropdown);
        } else if (action === "remove") {
            assignSearchInputField?.removeEventListener('click', this.addTaskInstance.toggleDropdown);
            assignSearchInputField?.removeEventListener('input', this.addTaskInstance.assignSearchInput);
            assignSearchDropdown?.removeEventListener('click', this.addTaskInstance.toggleDropdown);
        }
    }

    /**
     * Adds or removes listeners for subtasks.
     * @param {string} action - 'add' or 'remove'
     * @returns {void}
     */
    addTaskListenerSubtasks(action) {
        const subtasksInputContainer = document.getElementById("subtasksInputContainer");
        const subtaskInputPlus = document.getElementById("subtaskPlusIcon");
        const subtaskDeleteIcon = document.getElementById('subtaskDeleteIcon');
        const subtaskSaveIcon = document.getElementById('subtaskSaveIcon');
        if (action === "add") {
            subtasksInputContainer?.addEventListener('keypress', this.addTaskInstance.addNewSubtask);
            subtaskInputPlus?.addEventListener('click', this.addTaskInstance.addNewSubtask);
            subtaskDeleteIcon?.addEventListener('click', this.addTaskInstance.clearSubtaskInput);
            subtaskSaveIcon?.addEventListener('click', this.addTaskInstance.saveSubtask);
        } else if (action === "remove") {
            subtasksInputContainer?.removeEventListener('keypress', this.addTaskInstance.addNewSubtask);
            subtaskInputPlus?.removeEventListener('click', this.addTaskInstance.addNewSubtask);
            subtaskDeleteIcon?.removeEventListener('click', this.addTaskInstance.clearSubtaskInput);
            subtaskSaveIcon?.removeEventListener('click', this.addTaskInstance.saveSubtask);
        }
    }

    /**
     * Adds or removes listeners for category selection.
     * @param {string} action - 'add' or 'remove'
     * @returns {void}
     */
    addTaskListenerCategory(action) {
        const categoryValue = document.querySelectorAll(".categoryValue");
        if (action === "add") categoryValue?.forEach((element) => element.addEventListener('click', this.handleWrapperClick));
        else if (action === "remove") categoryValue?.forEach((element) => element.removeEventListener('click', this.handleWrapperClick));
    }

    /**
     * Adds or removes listeners for priority buttons.
     * @param {string} action - 'add' or 'remove'
     * @returns {void}
     */
    addTaskListenerPrio(action) {
        const prio = document.querySelectorAll('.prioBtn');
        if (action === "add") prio?.forEach((element) => element.addEventListener('click', this.handlePrioClick));
        else if (action === "remove") prio?.forEach((element) => element.removeEventListener('click', this.handlePrioClick));
    }

    /**
     * Adds or removes listeners for date input.
     * @param {string} action - 'add' or 'remove'
     * @returns {void}
     */
    addTaskListenerDate(action) {
        const dateInput = document.getElementById("dateInputContainer");
        if (action === "add") dateInput?.addEventListener('click', this.setActualDate);
        else if (action === "remove") dateInput?.removeEventListener('click', this.setActualDate);
    }

    //NOTE - Handler Methods
    /**
     * Handles submit button click for add task form.
     * @param {Event} event
     * @returns {void}
     */
    handleSubmitBtnClick = (event) => {
        event.preventDefault();
        if (this.addTaskInstance.formValidation()) this.addTaskInstance.pushNewTask();
    };

    /**
     * Handles click on category wrapper.
     * @param {Event} event
     * @returns {void}
     */
    handleWrapperClick = (event) => {
        event.stopPropagation();
        event.preventDefault();
        let category = event.target.closest('.categoryValue').dataset.value;
        this.addTaskInstance.toggleCategoryDropdown(category);
    };

    /**
     * Handles click on priority button.
     * @param {Event} event
     * @returns {void}
     */
    handlePrioClick = (event) => {
        const prioElement = event.target.closest('.prioBtn');
        if (!prioElement) return;
        this.addTaskInstance.setPrio(prioElement);
    };

    /**
     * Sets the minimum date for the date input to today.
     * @returns {void}
     */
    setActualDate = () => {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('dateInput').setAttribute('min', today);
        document.getElementById('update-date') && document.getElementById('update-date').setAttribute('min', today);
    };

    //NOTE - Subtask Listeners & Handlers
    /**
     * Activates listeners for editing subtasks.
     * @returns {void}
     */
    activateSubtaskListeners() {
        const subtaskEditList = document.querySelectorAll('.subtaskEditList');
        const subtaskEditBtns = document.querySelectorAll('.editSubtaskBtns');
        const subtaskDeleteBtns = document.querySelectorAll('.deleteSubtaskBtns');
        subtaskEditList?.forEach((element) => element.addEventListener('dblclick', this.handleSubtaskList));
        subtaskEditBtns?.forEach((element) => element.addEventListener('click', this.handleSubtaskList));
        subtaskDeleteBtns?.forEach((element) => element.addEventListener('click', this.handleSubtaskList));
    }

    /**
     * Deactivates listeners for editing subtasks.
     * @returns {void}
     */
    deactivateSubtaskListeners() {
        const subtaskEditList = document.querySelectorAll('.subtaskEditList');
        const subtaskEditBtns = document.querySelectorAll('.editSubtaskBtns');
        const subtaskDeleteBtns = document.querySelectorAll('.deleteSubtaskBtns');
        subtaskEditList?.forEach((element) => element.removeEventListener('dblclick', this.handleSubtaskList));
        subtaskEditBtns?.forEach((element) => element.removeEventListener('click', this.handleSubtaskList));
        subtaskDeleteBtns?.forEach((element) => element.removeEventListener('click', this.handleSubtaskList));
    }

    /**
     * Handles subtask list actions (edit/delete).
     * @param {object} param0 - Event object
     * @param {EventTarget} param0.target
     * @param {string} param0.type
     * @returns {void}
     */
    handleSubtaskList = ({ target, type }) => {
        const subtask = target.closest('.subtaskEditList');
        if (type === "dblclick") {
            this.addTaskInstance.editSubtask(subtask);
            return;
        }
        const action = target.closest('img').dataset.action;
        if (action === "edit") this.addTaskInstance.editSubtask(subtask);
        else if (action === "delete") this.addTaskInstance.deleteSubtask(subtask);
    };

    //NOTE - Assign Contact Listener
    /**
     * Handles click on assign contact.
     * @param {Event} event
     * @returns {void}
     */
    handleAssignContact = (event) => {
        event.preventDefault();
        const contact = event.target.closest('.assignContactToProject').dataset.id;
        this.addTaskInstance.contactAssign(contact);
    };

    /**
     * Adds or removes listeners for opening assign dropdown.
     * @param {string} action - 'add' or 'remove'
     * @returns {void}
     */
    addTaskListenerOpenAssignDropdown(action) {
        const contactsAssign = document.querySelectorAll('.assignContactToProject');
        if (action === "add") {
            contactsAssign.forEach((element) => element.addEventListener('click', this.handleAssignContact));
            document.addEventListener('click', this.addTaskInstance.checkOutsideAssign);
        } else if (action === "remove") {
            contactsAssign.forEach((element) => element.removeEventListener('click', this.handleAssignContact));
            document.removeEventListener('click', this.addTaskInstance.checkOutsideAssign);
        }
    }

    //NOTE - Error Handling
    /**
     * Logs an error message.
     * @param {string} msg
     * @returns {void}
     */
    _logError(msg) { console.error(msg); }
}