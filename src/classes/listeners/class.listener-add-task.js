export class AddTaskListener {
    //NOTE Properties

    kanban;
    addTaskInstance;
    boardInstance;

    constructor(kanban) {
        this.kanban = kanban;
        this.addTaskInstance = kanban.addTask;
        this.boardInstance = kanban.board || null;
        this.activateAddTaskListeners();
    }

    //NOTE Listener Activation/Deactivation

    activateAddTaskListeners() {
        this.addTaskListenerGeneral("add");
        this.addTaskListenerAssign("add");
        this.addTaskListenerSubtasks("add");
        this.addTaskListenerCategory("add");
        this.addTaskListenerPrio("add");
        this.addTaskListenerDate("add");
        if (this.boardInstance) {
            window.addEventListener('click', this.boardInstance.handleOverlayOutsideClick);
        }
    }

    deactivateAllAddTaskListeners() {
        this.addTaskListenerGeneral("remove");
        this.addTaskListenerAssign("remove");
        this.addTaskListenerSubtasks("remove");
        this.addTaskListenerCategory("remove");
        this.addTaskListenerPrio("remove");
        this.addTaskListenerDate("remove");
        this.deactivateSubtaskListeners();
        if (this.boardInstance) {
            window.removeEventListener('click', this.boardInstance.handleOverlayOutsideClick);
        }
    }

    addTaskModalListener(action) {
        const closeBtn = document.getElementById("addTaskModalCloseBtn");

        if (action === "add") {
            closeBtn?.addEventListener("click", this.boardInstance.closeModal);

        } else if (action === "remove") {
            closeBtn?.removeEventListener("click", this.boardInstance.closeModal);

        }
    }

    //NOTE Listener Methods (General, Assign, Subtasks, Category, Prio, Date)

    addTaskListenerGeneral(action) {
        const clearBtn = document.getElementById("clearBtn");
        const addTaskForm = document.getElementById("addTaskForm");

        if (action === "add") {
            clearBtn?.addEventListener('click', this.addTaskInstance.clearAddTaskForm);
            addTaskForm?.addEventListener('submit', this.handleSubmitBtnClick);
        } else if (action === "remove") {
            clearBtn?.removeEventListener('click', this.addTaskInstance.clearAddTaskForm);
            addTaskForm?.removeEventListener('submit', this.handleSubmitBtnClick);
        }
    }

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

    addTaskListenerCategory(action) {
        const categoryValue = document.querySelectorAll(".categoryValue");
        if (action === "add") {
            categoryValue?.forEach((element) => element.addEventListener('click', this.handleWrapperClick));
        } else if (action === "remove") {
            categoryValue?.forEach((element) => element.removeEventListener('click', this.handleWrapperClick));
        }
    }

    addTaskListenerPrio(action) {
        const prio = document.querySelectorAll('.prioBtn');
        if (action === "add") {
            prio?.forEach((element) => element.addEventListener('click', this.handlePrioClick));
        } else if (action === "remove") {
            prio?.forEach((element) => element.removeEventListener('click', this.handlePrioClick));
        }
    }

    addTaskListenerDate(action) {
        const dateInput = document.getElementById("dateInputContainer");
        if (action === "add") {
            dateInput?.addEventListener('click', this.setActualDate);
        } else if (action === "remove") {
            dateInput?.removeEventListener('click', this.setActualDate);
        }
    }

    //NOTE Handler Methods

    handleSubmitBtnClick = (event) => {
        event.preventDefault();
        if (this.addTaskInstance.formValidation()) this.addTaskInstance.pushNewTask();
    };

    handleWrapperClick = (event) => {
        event.stopPropagation();
        event.preventDefault();
        let category = event.target.closest('.categoryValue').dataset.value;
        this.addTaskInstance.toggleCategoryDropdown(category);
    };

    handlePrioClick = (event) => {
        const prioElement = event.target.closest('.prioBtn');
        if (!prioElement) return;
        this.addTaskInstance.setPrio(prioElement);
    };

    setActualDate = () => {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('dateInput').setAttribute('min', today);
        document.getElementById('update-date') && document.getElementById('update-date').setAttribute('min', today);
    };

    //NOTE Subtask Listeners & Handlers

    activateSubtaskListeners() {
        const subtaskEditList = document.querySelectorAll('.subtaskEditList');
        const subtaskEditBtns = document.querySelectorAll('.editSubtaskBtns');
        const subtaskDeleteBtns = document.querySelectorAll('.deleteSubtaskBtns');
        subtaskEditList?.forEach((element) => element.addEventListener('dblclick', this.handleSubtaskList));
        subtaskEditBtns?.forEach((element) => element.addEventListener('click', this.handleSubtaskList));
        subtaskDeleteBtns?.forEach((element) => element.addEventListener('click', this.handleSubtaskList));
    }

    deactivateSubtaskListeners() {
        const subtaskEditList = document.querySelectorAll('.subtaskEditList');
        const subtaskEditBtns = document.querySelectorAll('.editSubtaskBtns');
        const subtaskDeleteBtns = document.querySelectorAll('.deleteSubtaskBtns');
        subtaskEditList?.forEach((element) => element.removeEventListener('dblclick', this.handleSubtaskList));
        subtaskEditBtns?.forEach((element) => element.removeEventListener('click', this.handleSubtaskList));
        subtaskDeleteBtns?.forEach((element) => element.removeEventListener('click', this.handleSubtaskList));
    }

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

    //NOTE Assign Contact Listener

    handleAssignContact = (event) => {
        event.preventDefault();
        const contact = event.target.closest('.assignContactToProject').dataset.id;
        this.addTaskInstance.contactAssign(contact);
    };

    addTaskListenerOpenAssignDropdown(action) {
        const contactsAssign = document.querySelectorAll('.assignContactToProject');
        if (action === "add") {
            contactsAssign.forEach((element) => element.addEventListener('click', this.handleAssignContact));//TODO - move to utils
            document.addEventListener('click', this.addTaskInstance.checkOutsideAssign);
        } else if (action === "remove") {
            contactsAssign.forEach((element) => element.removeEventListener('click', this.handleAssignContact));
            document.removeEventListener('click', this.addTaskInstance.checkOutsideAssign);
        }
    }

    //FIXME: Doppelte oder nicht benötigte Methoden ggf. hier ans Ende verschieben
}