export class BoardListener {
    constructor(kanban) {
        this.kanban = kanban;
        this.boardInstance = kanban.board;
        this.addTaskInstance = kanban.addTask || null;
        this.category = localStorage.getItem('taskCategory');
        if (category) localStorage.removeItem('taskCategory');
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
        }
    }


    boardListenerDropAreas(action) {
        const toDoContainer = document.getElementById('toDo-container');
        const inProgressContainer = document.getElementById('inProgress-container');
        const awaitFeedbackContainer = document.getElementById('awaitFeedback-container');
        const doneContainer = document.getElementById('done-container');

        if (action === "add") {
            toDoContainer?.addEventListener('drop', this.handleDrop);
            inProgressContainer?.addEventListener('drop', this.handleDrop);
            awaitFeedbackContainer?.addEventListener('drop', this.handleDrop);
            doneContainer?.addEventListener('drop', this.handleDrop);
        } else if (action === "remove") {
            toDoContainer?.removeEventListener('drop', this.handleDrop);
            inProgressContainer?.removeEventListener('drop', this.handleDrop);
            awaitFeedbackContainer?.removeEventListener('drop', this.handleDrop);
            doneContainer?.removeEventListener('drop', this.handleDrop);
        }
    }

    boardListenerMisc(action) {
        const searchInput = document.getElementById("searchInput");
        const container = document.querySelectorAll('.taskCategoryContainer');

        if (action === "add") {
            searchInput?.addEventListener('input', this.handleSearchInput);
            container?.forEach((element) => {
                element.addEventListener('dragover', this.allowDrop);
                element.addEventListener('dragleave', this.dragLeave);
            });
        } else if (action === "remove") {
            searchInput?.removeEventListener('input', this.handleSearchInput);
            container?.forEach((element) => {
                element.removeEventListener('dragover', this.allowDrop);
                element.removeEventListener('dragleave', this.dragLeave);
            });
        }
    }


    handleAddTaskBtnClick = (event) => {
        if (event.target.id === "addTaskInProgress") checkScreenWidth("inProgress");
        else if (event.target.id === "addTaskFeedback") checkScreenWidth("awaitFeedback");
        else checkScreenWidth("toDo");
    };


    handleSearchInput = () => {
        const searchInput = document.getElementById("searchInput");
        searchTasks(searchInput.value);
    };


    dragDrop() {
        document.querySelectorAll(".todoContainer").forEach((todoContainer) => {
            todoContainer.addEventListener('click', this.handleToDoClick);
            todoContainer.addEventListener("dragstart", this.handleDragStart);
            todoContainer.addEventListener("dragend", this.handleDragEnd);
        });
    }


    deactivateDragDrop() {
        document.querySelectorAll(".todoContainer").forEach((todoContainer) => {
            todoContainer.removeEventListener('click', this.handleToDoClick);
            todoContainer.removeEventListener("dragstart", this.handleDragStart);
            todoContainer.removeEventListener("dragend", this.handleDragEnd);
        });
    }


    allowDrop = (event) => {
        const dropTarget = event.target;
        const dropAreas = document.querySelectorAll('.taskDragArea');
        dropAreas.forEach(area => {
            if (area === dropTarget || area.contains(dropTarget)) {
                event.preventDefault();
                area.classList.add('highlightedBackground');
            }
        });
    };


    dragLeave = () => {
        document.querySelectorAll('.taskDragArea').forEach((zone) => {
            zone.classList.remove('highlightedBackground');
        });
    };


    handleDrop = (event) => {
        event.preventDefault();
        moveTo(event.target.id);//TODO - generalize function for task handling in board
    };


    handleToDoClick = (e) => {
        const target = e.target.closest(".todoContainer");
        e.stopPropagation();
        openOverlay(target.id);//TODO - generalize function for task handling in board
    };


    handleDragStart = (e) => {
        e.target.classList.add("tilted");
        this.startDragging(e.target.id);//TODO - generalize function for task handling in board
    };

    handleDragEnd = (e) => {
        e.target.classList.remove("tilted");
        this.dragEnd();
    };


    //NOTE - Overlay listeners and handlers for the board page

    activateOverlayListeners(elementId) {
        this.boardListenerOverlayButtons("add");
        this.boardListenerOverlaySubtasks("add");
    }


    deactivateOverlayListeners() {
        this.boardListenerOverlayButtons("remove");
        this.boardListenerOverlaySubtasks("remove");
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


    handleSubtaskClick(event) {
        const subtaskIndex = event.target.closest('.modalSubtasksSingle').dataset.subtaskindex;
        const taskId = event.target.closest('#modalContainer').dataset.id;
        //updateSubtaskStatus(taskId, subtaskIndex);//TODO - generalize function for task handling in board
    }


    handleOverlayEditClick(event) {
        const taskId = event.target.closest('#modalContainer').dataset.id;
        //enableTaskEdit(taskId);//TODO - generalize function for task handling in board
    }


    handleOverlayDeleteClick(event) {
        const taskId = event.target.closest('#modalContainer').dataset.id;
        //deleteTask(taskId);//TODO - generalize function for task handling in board
        this.kanban.activateOutsideCheck(event, 'deleteResponse', 'ts0', 'ts1');
        this.activateDeleteResponseListeners();
    }


    handleOverlayOutsideClick(event) {
        const overlay = document.getElementById("overlay");
        const addTaskOverlay = document.getElementById("addTaskOverlay");
        if (event.target === overlay || event.target === addTaskOverlay) {
            this.boardInstance.closeModal();
            this.deactivateOverlayListeners();
            //this.deactivateAllAddTaskListeners();//TODO - deactivate over Kanban
        }
    }


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
        //deleteTaskSure(taskId);//TODO - generalize function for task handling in board
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


    handleAssignContact = (event) => {
        event.preventDefault();
        const contact = event.target.closest('.assignContactToProject').dataset.id;
        contactAssign(contact);
    };



    initDragDrop() {
        deactivateDragDrop();
        this.boardInstance.updateAllTaskCategories();
        dragDrop();
    }


    startDragging() {
        document.querySelectorAll(".taskDragArea").forEach((zone) => {
            zone.classList.add("highlighted");
        });
    }


    dragEnd() {
        document.querySelectorAll('.taskDragArea').forEach((zone) => {
            zone.classList.remove('highlighted', 'highlightedBackground');
        });
    }
}