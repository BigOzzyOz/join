export class AddTaskListener {
    constructor(kanban) {
        this.kanban = kanban;
        this.addTaskInstance = kanban.addTask;
        this.boardInstance = kanban.board || null;
    }


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
            subtasksInputContainer?.addEventListener('keypress', addNewSubtask);
            subtaskInputPlus?.addEventListener('click', addNewSubtask);
            subtaskDeleteIcon?.addEventListener('click', clearSubtaskInput);
            subtaskSaveIcon?.addEventListener('click', saveSubtask);
        } else if (action === "remove") {
            subtasksInputContainer?.removeEventListener('keypress', addNewSubtask);
            subtaskInputPlus?.removeEventListener('click', addNewSubtask);
            subtaskDeleteIcon?.removeEventListener('click', clearSubtaskInput);
            subtaskSaveIcon?.removeEventListener('click', saveSubtask);
        }
    }


    addTaskListenerCategory(action) {
        const categoryValue = document.querySelectorAll(".categoryValue");
        if (action === "add") {
            categoryValue?.forEach((element) => element.addEventListener('click', handleWrapperClick));
        } else if (action === "remove") {
            categoryValue?.forEach((element) => element.removeEventListener('click', handleWrapperClick));
        }
    }


    addTaskListenerPrio(action) {
        const prio = document.querySelectorAll('.prioBtn');
        if (action === "add") {
            prio?.forEach((element) => element.addEventListener('click', handlePrioClick));
        } else if (action === "remove") {
            prio?.forEach((element) => element.removeEventListener('click', handlePrioClick));
        }
    }



    addTaskListenerDate(action) {
        const dateInput = document.getElementById("dateInputContainer");
        if (action === "add") {
            dateInput?.addEventListener('click', setActualDate);
        } else if (action === "remove") {
            dateInput?.removeEventListener('click', setActualDate);
        }
    }


    handleSubmitBtnClick(event) {
        event.preventDefault();
        if (formValidation()) pushNewTask();
    }


    handleWrapperClick(event) {
        event.stopPropagation();
        event.preventDefault();
        let category = event.target.closest('.categoryValue').dataset.value;
        toggleCategoryDropdown(category);
    }


    setActualDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('dateInput').setAttribute('min', today);
        document.getElementById('update-date') && document.getElementById('update-date').setAttribute('min', today);
    }


    //NOTE - Subtask listener and handler


    activateSubtaskListeners() {
        const subtaskEditList = document.querySelectorAll('.subtaskEditList');
        const subtaskEditBtns = document.querySelectorAll('.editSubtaskBtns');
        const subtaskDeleteBtns = document.querySelectorAll('.deleteSubtaskBtns');
        subtaskEditList?.forEach((element) => element.addEventListener('dblclick', handleSubtaskList));
        subtaskEditBtns?.forEach((element) => element.addEventListener('click', handleSubtaskList));
        subtaskDeleteBtns?.forEach((element) => element.addEventListener('click', handleSubtaskList));
    }


    deactivateSubtaskListeners() {
        const subtaskEditList = document.querySelectorAll('.subtaskEditList');
        const subtaskEditBtns = document.querySelectorAll('.editSubtaskBtns');
        const subtaskDeleteBtns = document.querySelectorAll('.deleteSubtaskBtns');
        subtaskEditList?.forEach((element) => element.removeEventListener('dblclick', handleSubtaskList));
        subtaskEditBtns?.forEach((element) => element.removeEventListener('click', handleSubtaskList));
        subtaskDeleteBtns?.forEach((element) => element.removeEventListener('click', handleSubtaskList));
    }


    handleSubtaskList({ target, type }) {
        const subtask = target.closest('.subtaskEditList');
        const action = target.closest('img').dataset.action;
        if (type === "dblclick") editSubtask(subtask);
        else if (action === "edit") editSubtask(subtask);
        else if (action === "delete") deleteSubtask(subtask);
    }
}