export class BoardListener {
    constructor(kanban) {
        this.kanban = kanban;
        this.boardInstance = kanban.board;
        this.addTaskInstance = kanban.addTask || null;
        this.activateListeners();
    }

    activateListeners() {
        this.boardListenerAddTask('add');
        this.boardListenerDropAreas('add');
        this.boardListenerMisc('add');
    }

    deactivateAllListenersBoard() {
        this.boardListenerAddTask('remove');
        this.boardListenerDropAreas('remove');
        this.boardListenerMisc('remove');
        this.deactivateDragDrop();
        this.deactivateOverlayListeners();
        this.deactivateDeleteResponseListeners();
        this.deactivateEditTaskListeners();
    }

    boardListenerAddTask(action) {
        const addTaskBtn = document.getElementById("addTaskBtn");
        const addTaskBtnDesktop = document.getElementById("addTaskBtnDesktop");
        const addTaskPlus = document.querySelectorAll('.taskCategoryIcon');

        if (action === "add") {
            addTaskBtn?.addEventListener('click', this.handleAddTaskBtnClick);
            addTaskBtnDesktop?.addEventListener('click', this.handleAddTaskBtnClick);
            addTaskPlus?.forEach((element) => {
                element.addEventListener('click', this.handleAddTaskBtnClick);
            });
        } else if (action === "remove") {
            addTaskBtn?.removeEventListener('click', this.handleAddTaskBtnClick);
            addTaskBtnDesktop?.removeEventListener('click', this.handleAddTaskBtnClick);
            addTaskPlus?.forEach((element) => {
                element.removeEventListener('click', this.handleAddTaskBtnClick);
            });
        };
    }


    boardListenerDropAreas(action) {
        const toDoContainer = document.getElementById('toDo-container');
        const inProgressContainer = document.getElementById('inProgress-container');
        const awaitFeedbackContainer = document.getElementById('awaitFeedback-container');
        const doneContainer = document.getElementById('done-container');
        const dropTargetContainer = [toDoContainer, inProgressContainer, awaitFeedbackContainer, doneContainer];

        dropTargetContainer.forEach((container) => {
            if (action === "add") {
                container?.addEventListener('drop', this.handleDrop);
                container?.addEventListener('dragover', this.handleDragAreas);
                container?.addEventListener('dragleave', this.handleDragAreas);
            } else if (action === "remove") {
                container?.removeEventListener('drop', this.handleDrop);
                container?.removeEventListener('dragover', this.handleDragAreas);
                container?.removeEventListener('dragleave', this.handleDragAreas);
            }
        });
    }

    boardListenerMisc(action) {
        const searchInput = document.getElementById("searchInput");

        if (action === "add") {
            searchInput?.addEventListener('input', this.handleSearchInput);
        } else if (action === "remove") {
            searchInput?.removeEventListener('input', this.handleSearchInput);
        }
    }


    handleAddTaskBtnClick = (event) => {
        if (event.target.id === "addTaskInProgress") this.boardInstance.checkScreenWidth("inProgress");
        else if (event.target.id === "addTaskFeedback") this.boardInstance.checkScreenWidth("awaitFeedback");
        else this.boardInstance.checkScreenWidth("toDo");
    };


    handleSearchInput = () => {
        const searchInput = document.getElementById("searchInput");
        this.boardInstance.searchTasks(searchInput.value);
    };


    dragDrop() {
        document.querySelectorAll(".todoContainer").forEach((todoContainer) => {
            todoContainer.addEventListener('click', this.handleToDos);
            todoContainer.addEventListener('dragstart', this.handleToDos);
            todoContainer.addEventListener('dragend', this.handleToDos);
        });
    }


    deactivateDragDrop() {
        document.querySelectorAll(".todoContainer").forEach((todoContainer) => {
            todoContainer.removeEventListener('click', this.handleToDos);
            todoContainer.removeEventListener("dragstart", this.handleToDos);
            todoContainer.removeEventListener("dragend", this.handleToDos);
        });
    }

    //NOTE - Overlay listeners and handlers for the board page

    activateOverlayListeners() {
        this.boardListenerOverlayButtons("add");
        this.boardListenerOverlaySubtasks("add");
        window.addEventListener('click', this.handleOverlayOutsideClick);
    }


    deactivateOverlayListeners() {
        this.boardListenerOverlayButtons("remove");
        this.boardListenerOverlaySubtasks("remove");
        window.removeEventListener('click', this.handleOverlayOutsideClick);
    }


    boardListenerOverlayButtons(action) {
        const closeBtn = document.getElementById("modalCloseBtn");
        const editBtn = document.getElementById("modalContainerEditBtn");
        const deleteBtn = document.getElementById("modalContainerDeleteBtn");

        if (action === "add") {
            closeBtn?.addEventListener("click", this.boardInstance.closeModal);
            editBtn?.addEventListener('click', this.handleOverlayEditClick);
            deleteBtn?.addEventListener('click', this.handleOverlayDeleteClick);
        } else if (action === "remove") {
            closeBtn?.removeEventListener("click", this.boardInstance.closeModal);
            editBtn?.removeEventListener('click', this.handleOverlayEditClick);
            deleteBtn?.removeEventListener('click', this.handleOverlayDeleteClick);
        }
    }


    boardListenerOverlaySubtasks(action) {
        const subtasks = document.querySelectorAll('.modalSubtasksSingle');
        if (action === "add") {
            subtasks?.forEach(subtask => subtask.addEventListener('click', this.handleSubtaskClick));
        } else if (action === "remove") {
            subtasks?.forEach(subtask => subtask.removeEventListener('click', this.handleSubtaskClick));
        }
    }


    handleSubtaskClick = (event) => {
        const subtaskIndex = event.target.closest('.modalSubtasksSingle').dataset.subtaskindex;
        const taskId = event.target.closest('#modalContainer').dataset.id;
        this.boardInstance.updateSubtaskStatus(taskId, subtaskIndex);
    };


    handleOverlayEditClick(event) {
        const taskId = event.target.closest('#modalContainer').dataset.id;
        //enableTaskEdit(taskId);//TODO - generalize function for task handling in board
    }


    handleOverlayDeleteClick = (event) => {
        const taskId = event.target.closest('#modalContainer').dataset.id;
        this.kanban.toggleClass('deleteResponse', 'ts0', 'ts1');
        document.getElementById('deleteResponse').innerHTML = this.boardInstance.html.openDeleteTaskSureHtml(taskId);
        this.kanban.activateOutsideCheck(event, 'deleteResponse', 'ts0', 'ts1');
        this.activateDeleteResponseListeners();
    };


    handleOverlayOutsideClick = (event) => {
        const overlay = document.getElementById("overlay");
        const addTaskOverlay = document.getElementById("addTaskOverlay");
        if (event.target === overlay || event.target === addTaskOverlay) {
            this.boardInstance.closeModal();
            this.kanban.closeAddTaskInstance();
        }
    };


    //NOTE - Delete Response listeners and handlers for the board page


    activateDeleteResponseListeners() {
        const deleteTaskForm = document.getElementById("deleteTaskForm");
        const cancelBtn = document.getElementById("deleteTaskNo");
        deleteTaskForm?.addEventListener('submit', this.handleDeleteTaskFormSubmit);
        cancelBtn?.addEventListener('click', this.handleDeleteTaskNo);
    }


    deactivateDeleteResponseListeners() {
        const deleteTaskForm = document.getElementById("deleteTaskForm");
        const cancelBtn = document.getElementById("deleteTaskNo");
        deleteTaskForm?.removeEventListener('submit', this.handleDeleteTaskFormSubmit);
        cancelBtn?.removeEventListener('click', this.handleDeleteTaskNo);
    }


    handleDeleteTaskFormSubmit = (event) => {
        event.preventDefault();
        const taskId = event.target.dataset.id;
        this.deactivateDeleteResponseListeners();
        this.boardInstance.deleteTaskSure(taskId);
    };


    handleDeleteTaskNo = (event) => {
        event.preventDefault();
        this.kanban.toggleClass('deleteResponse', 'ts0', 'ts1');
        this.deactivateDeleteResponseListeners();
    };


    //NOTE - Edit Task listeners and handlers for the board page


    activateEditTaskListeners() {
        this.boardListenerEditTaskGeneral("add");
        this.boardListenerEditTaskAssignMenu("add");
        this.boardListenerEditTaskSubtasks("add");
        //this.activateSubtaskListeners();//TODO - centtralize over kanban
    }


    deactivateEditTaskListeners() {
        this.boardListenerEditTaskGeneral("remove");
        this.boardListenerEditTaskAssignMenu("remove");
        this.boardListenerEditTaskSubtasks("remove");
        //this.deactivateSubtaskListeners();//TODO - centtralize over kanban
    }


    boardListenerEditTaskGeneral(action) {
        const editTaskForm = document.getElementById("editTaskForm");
        const closebtn = document.getElementById("editTaskCloseBtn");
        const prio = document.querySelectorAll('.prioBtn');

        if (action === "add") {
            editTaskForm?.addEventListener('submit', this.handleEditTaskFormSubmit);
            closebtn?.addEventListener('click', this.boardInstance.closeModal);
            prio?.forEach((element) => element.addEventListener('click', this.handlePrioClick));
        } else if (action === "remove") {
            editTaskForm?.removeEventListener('submit', this.handleEditTaskFormSubmit);
            closebtn?.removeEventListener('click', this.boardInstance.closeModal);
            prio?.forEach((element) => element.removeEventListener('click', this.handlePrioClick));
        }
    }


    boardListenerEditTaskAssignMenu(action) {
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


    boardListenerEditTaskSubtasks(action) {
        const subtasksInputContainer = document.getElementById("subtasksInputContainer");
        const subtaskInput = document.getElementById("subtaskInput");
        const subtaskDeleteIcon = document.getElementById('subtaskDeleteIcon');
        const subtaskSaveIcon = document.getElementById('subtaskSaveIcon');

        if (action === "add") {
            subtasksInputContainer?.addEventListener('click', this.addTaskInstance.addNewSubtask);
            subtaskInput?.addEventListener('keypress', this.addTaskInstance.handleKeyDown);
            subtaskDeleteIcon?.addEventListener('click', this.addTaskInstance.clearSubtaskInput);
            subtaskSaveIcon?.addEventListener('click', this.addTaskInstance.saveSubtask);
        } else if (action === "remove") {
            subtasksInputContainer?.removeEventListener('click', this.addTaskInstance.addNewSubtask);
            subtaskInput?.removeEventListener('keypress', this.addTaskInstance.handleKeyDown);
            subtaskDeleteIcon?.removeEventListener('click', this.addTaskInstance.clearSubtaskInput);
            subtaskSaveIcon?.removeEventListener('click', this.addTaskInstance.saveSubtask);
        }
    }


    handleEditTaskFormSubmit = (event) => {
        event.preventDefault();
        const taskId = event.target.closest('#editTaskForm').dataset.id;
        if (formValidation()) saveEditedTask(taskId);
    };


    handlePrioClick = (event) => {
        const prioElement = event.target.closest('.prioBtn');
        if (!prioElement) return;
        setPrio(prioElement);
    };


    initDragDrop() {
        this.deactivateDragDrop();
        this.boardInstance.updateAllTaskCategories();
        this.dragDrop();
    }

    handleDrop = async (event) => {
        event.preventDefault();
        const dropTarget = event.currentTarget.querySelector('.taskDragArea').id;
        await this.boardInstance.moveTo(dropTarget);
    };

    handleDragAreas = (event) => {
        const dropTarget = event.currentTarget.querySelector('.taskDragArea');
        if (event.type === 'dragover') {
            event.preventDefault();
            dropTarget.classList.add("highlightedBackground");
        } else if (event.type === 'dragleave') {
            if (!dropTarget.contains(event.relatedTarget)) {
                dropTarget.classList.remove("highlightedBackground");
            }
        }
    };

    handleToDos = async (event) => {
        const target = event.target.closest(".todoContainer");
        if (!target) {
            console.warn("handleToDos called but no '.todoContainer' found for event target:", event.target);
            return;
        }
        const taskId = target.dataset.id;
        const dragAreas = document.querySelectorAll('.taskDragArea');

        if (event.type === 'dragstart') {
            this.boardInstance.currentDraggedElement = taskId;
            target.classList.add("tilted");
            dragAreas.forEach((zone) => {
                zone.classList.add("highlighted");
            });
        } else if (event.type === 'dragend') {
            target.classList.remove("tilted");
            dragAreas.forEach((zone) => {
                zone.classList.remove("highlighted", "highlightedBackground");
            });
            if (this.boardInstance.currentDraggedElement === taskId) {
                this.boardInstance.currentDraggedElement = null;
            }
        } else if (event.type === 'click') {
            await this.boardInstance.openOverlay(taskId);
        }
    };

}