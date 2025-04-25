/**
 * Handles all board event listeners (add task, drag & drop, overlays, edit/delete modals).
 */
export class BoardListener {
    //NOTE - Properties
    /** @type {object} Kanban app instance. */
    kanban;
    /** @type {object} Board instance. */
    boardInstance;
    /** @type {object|null} AddTask instance. */
    addTaskInstance;

    //NOTE - Constructor & Initialization
    /**
     * Creates a BoardListener instance.
     * @param {object} kanban - Kanban app instance
     */
    constructor(kanban) {
        this.kanban = kanban;
        this.boardInstance = kanban.board;
        this.addTaskInstance = kanban.addTask || null;
        this.activateListeners();
    }

    //NOTE - Master Listener Control
    /**
     * Activates all board listeners.
     * @returns {void}
     */
    activateListeners() {
        this.boardListenerAddTask('add');
        this.boardListenerDropAreas('add');
        this.boardListenerMisc('add');
    }

    /**
     * Deactivates all board listeners.
     * @returns {void}
     */
    deactivateAllListenersBoard() {
        this.boardListenerAddTask('remove');
        this.boardListenerDropAreas('remove');
        this.boardListenerMisc('remove');
        this.deactivateDragDrop();
        this.deactivateOverlayListeners();
        this.deactivateDeleteResponseListeners();
        this.deactivateEditTaskListeners();
    }

    //NOTE - Add Task Button Listeners
    /**
     * Adds or removes listeners for add task buttons.
     * @param {string} action - 'add' or 'remove'
     * @returns {void}
     */
    boardListenerAddTask(action) {
        const addTaskBtn = document.getElementById("addTaskBtn");
        const addTaskBtnDesktop = document.getElementById("addTaskBtnDesktop");
        const addTaskPlus = document.querySelectorAll('.taskCategoryIcon');
        if (action === "add") {
            addTaskBtn?.addEventListener('click', this.handleAddTaskBtnClick);
            addTaskBtnDesktop?.addEventListener('click', this.handleAddTaskBtnClick);
            addTaskPlus?.forEach((el) => el.addEventListener('click', this.handleAddTaskBtnClick));
        } else if (action === "remove") {
            addTaskBtn?.removeEventListener('click', this.handleAddTaskBtnClick);
            addTaskBtnDesktop?.removeEventListener('click', this.handleAddTaskBtnClick);
            addTaskPlus?.forEach((el) => el.removeEventListener('click', this.handleAddTaskBtnClick));
        }
    }

    //NOTE - Drop Area Listeners
    /**
     * Adds or removes listeners for board drop areas.
     * @param {string} action - 'add' or 'remove'
     * @returns {void}
     */
    boardListenerDropAreas(action) {
        const ids = ['toDo-container', 'inProgress-container', 'awaitFeedback-container', 'done-container'];
        ids.map(id => document.getElementById(id)).forEach((container) => {
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

    //NOTE - Misc Listeners
    /**
     * Adds or removes listeners for misc board elements (e.g. search input).
     * @param {string} action - 'add' or 'remove'
     * @returns {void}
     */
    boardListenerMisc(action) {
        const searchInput = document.getElementById("searchInput");
        if (action === "add") searchInput?.addEventListener('input', this.handleSearchInput);
        else if (action === "remove") searchInput?.removeEventListener('input', this.handleSearchInput);
    }

    //NOTE - Add Task Button Handler
    /**
     * Handles add task button clicks.
     * @param {Event} event
     * @returns {void}
     */
    handleAddTaskBtnClick = (event) => {
        if (event.target.id === "addTaskInProgress") this.boardInstance.checkScreenWidth("inProgress");
        else if (event.target.id === "addTaskFeedback") this.boardInstance.checkScreenWidth("awaitFeedback");
        else this.boardInstance.checkScreenWidth("toDo");
    };

    //NOTE - Search Input Handler
    /**
     * Handles search input changes.
     * @returns {void}
     */
    handleSearchInput = () => {
        const searchInput = document.getElementById("searchInput");
        this.boardInstance.searchTasks(searchInput.value);
    };

    //NOTE - Drag & Drop Listeners
    /**
     * Adds drag & drop listeners to all todo containers.
     * @returns {void}
     */
    dragDrop() {
        document.querySelectorAll(".todoContainer").forEach((el) => {
            el.addEventListener('click', this.handleToDos);
            el.addEventListener('dragstart', this.handleToDos);
            el.addEventListener('dragend', this.handleToDos);
        });
    }

    /**
     * Removes drag & drop listeners from all todo containers.
     * @returns {void}
     */
    deactivateDragDrop() {
        document.querySelectorAll(".todoContainer").forEach((el) => {
            el.removeEventListener('click', this.handleToDos);
            el.removeEventListener("dragstart", this.handleToDos);
            el.removeEventListener("dragend", this.handleToDos);
        });
    }

    //NOTE - Overlay Listeners
    /**
     * Activates overlay listeners for the board page.
     * @returns {void}
     */
    activateOverlayListeners() {
        this.boardListenerOverlayButtons("add");
        this.boardListenerOverlaySubtasks("add");
        window.addEventListener('click', this.handleOverlayOutsideClick);
    }

    /**
     * Deactivates overlay listeners for the board page.
     * @returns {void}
     */
    deactivateOverlayListeners() {
        this.boardListenerOverlayButtons("remove");
        this.boardListenerOverlaySubtasks("remove");
        window.removeEventListener('click', this.handleOverlayOutsideClick);
    }

    /**
     * Adds or removes listeners for overlay buttons.
     * @param {string} action - 'add' or 'remove'
     * @returns {void}
     */
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

    /**
     * Adds or removes listeners for overlay subtasks.
     * @param {string} action - 'add' or 'remove'
     * @returns {void}
     */
    boardListenerOverlaySubtasks(action) {
        const subtasks = document.querySelectorAll('.modalSubtasksSingle');
        if (action === "add") subtasks?.forEach(subtask => subtask.addEventListener('click', this.handleSubtaskClick));
        else if (action === "remove") subtasks?.forEach(subtask => subtask.removeEventListener('click', this.handleSubtaskClick));
    }

    /**
     * Handles subtask click in overlay.
     * @param {Event} event
     * @returns {void}
     */
    handleSubtaskClick = (event) => {
        const subtaskIndex = event.target.closest('.modalSubtasksSingle').dataset.subtaskindex;
        const taskId = event.target.closest('#modalContainer').dataset.id;
        this.boardInstance.updateSubtaskStatus(taskId, subtaskIndex);
    };

    /**
     * Handles edit button click in overlay.
     * @param {Event} event
     * @returns {void}
     */
    handleOverlayEditClick = (event) => {
        const taskId = event.target.closest('#modalContainer').dataset.id;
        this.boardInstance.enableTaskEdit(taskId);
    };

    /**
     * Handles delete button click in overlay.
     * @param {Event} event
     * @returns {void}
     */
    handleOverlayDeleteClick = (event) => {
        const taskId = event.target.closest('#modalContainer').dataset.id;
        this.kanban.toggleClass('deleteResponse', 'ts0', 'ts1');
        document.getElementById('deleteResponse').innerHTML = this.boardInstance.html.openDeleteTaskSureHtml(taskId);
        this.kanban.activateOutsideCheck(event, 'deleteResponse', 'ts0', 'ts1');
        this.activateDeleteResponseListeners();
    };

    /**
     * Handles outside click to close overlays.
     * @param {Event} event
     * @returns {void}
     */
    handleOverlayOutsideClick = (event) => {
        const overlay = document.getElementById("overlay");
        const addTaskOverlay = document.getElementById("addTaskOverlay");
        if (event.target === overlay || event.target === addTaskOverlay) {
            this.boardInstance.closeModal();
            this.kanban.closeAddTaskInstance();
        }
    };

    //NOTE - Delete Response Listeners
    /**
     * Activates listeners for the delete response modal.
     * @returns {void}
     */
    activateDeleteResponseListeners() {
        const deleteTaskForm = document.getElementById("deleteTaskForm");
        const cancelBtn = document.getElementById("deleteTaskNo");
        deleteTaskForm?.addEventListener('submit', this.handleDeleteTaskFormSubmit);
        cancelBtn?.addEventListener('click', this.handleDeleteTaskNo);
    }

    /**
     * Deactivates listeners for the delete response modal.
     * @returns {void}
     */
    deactivateDeleteResponseListeners() {
        const deleteTaskForm = document.getElementById("deleteTaskForm");
        const cancelBtn = document.getElementById("deleteTaskNo");
        deleteTaskForm?.removeEventListener('submit', this.handleDeleteTaskFormSubmit);
        cancelBtn?.removeEventListener('click', this.handleDeleteTaskNo);
    }

    /**
     * Handles delete task form submit.
     * @param {Event} event
     * @returns {void}
     */
    handleDeleteTaskFormSubmit = (event) => {
        event.preventDefault();
        const taskId = event.target.dataset.id;
        this.deactivateDeleteResponseListeners();
        this.boardInstance.deleteTaskSure(taskId);
    };

    /**
     * Handles cancel button click in delete modal.
     * @param {Event} event
     * @returns {void}
     */
    handleDeleteTaskNo = (event) => {
        event.preventDefault();
        this.kanban.toggleClass('deleteResponse', 'ts0', 'ts1');
        this.deactivateDeleteResponseListeners();
    };

    //NOTE - Edit Task Listeners
    /**
     * Activates listeners for the edit task modal.
     * @returns {void}
     */
    activateEditTaskListeners() {
        this.boardListenerEditTaskGeneral("add");
        this.boardListenerEditTaskAssignMenu("add");
        this.boardListenerEditTaskSubtasks("add");
        this.kanban.activateListenerAddTask('subtask');
    }

    /**
     * Deactivates listeners for the edit task modal.
     * @returns {void}
     */
    deactivateEditTaskListeners() {
        this.boardListenerEditTaskGeneral("remove");
        this.boardListenerEditTaskAssignMenu("remove");
        this.boardListenerEditTaskSubtasks("remove");
        this.kanban.deactivateListenerAddTask('subtask');
    }

    /**
     * Adds or removes listeners for edit task general elements.
     * @param {string} action - 'add' or 'remove'
     * @returns {void}
     */
    boardListenerEditTaskGeneral(action) {
        const editTaskForm = document.getElementById("editTaskForm");
        const closebtn = document.getElementById("editTaskCloseBtn");
        const prio = document.querySelectorAll('.prioBtn');
        if (action === "add") {
            editTaskForm?.addEventListener('submit', this.handleEditTaskFormSubmit);
            closebtn?.addEventListener('click', this.boardInstance.closeModal);
            prio?.forEach((el) => el.addEventListener('click', this.handlePrioClick));
        } else if (action === "remove") {
            editTaskForm?.removeEventListener('submit', this.handleEditTaskFormSubmit);
            closebtn?.removeEventListener('click', this.boardInstance.closeModal);
            prio?.forEach((el) => el.removeEventListener('click', this.handlePrioClick));
        }
    }

    /**
     * Adds or removes listeners for edit task assign menu.
     * @param {string} action - 'add' or 'remove'
     * @returns {void}
     */
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

    /**
     * Adds or removes listeners for edit task subtasks.
     * @param {string} action - 'add' or 'remove'
     * @returns {void}
     */
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

    /**
     * Handles edit task form submit.
     * @param {Event} event
     * @returns {Promise<void>}
     */
    handleEditTaskFormSubmit = async (event) => {
        event.preventDefault();
        const taskId = event.target.closest('#editTaskForm').dataset.id;
        if (this.addTaskInstance.formValidation()) await this.boardInstance.saveEditedTask(taskId);
    };

    /**
     * Handles priority button click in edit modal.
     * @param {Event} event
     * @returns {void}
     */
    handlePrioClick = (event) => {
        const prioElement = event.target.closest('.prioBtn');
        if (!prioElement) return;
        this.kanban.addTask.setPrio(prioElement);
    };

    //NOTE - Drag & Drop Init
    /**
     * Initializes drag & drop listeners and updates board columns.
     * @returns {void}
     */
    initDragDrop() {
        this.deactivateDragDrop();
        this.boardInstance.updateAllTaskCategories();
        this.dragDrop();
    }

    //NOTE - Drop/Drag/ToDo Handlers
    /**
     * Handles drop event on board columns.
     * @param {Event} event
     * @returns {Promise<void>}
     */
    handleDrop = async (event) => {
        event.preventDefault();
        const dropTarget = event.currentTarget.querySelector('.taskDragArea').id;
        await this.boardInstance.moveTo(dropTarget);
    };

    /**
     * Handles dragover/dragleave events on board columns.
     * @param {Event} event
     * @returns {void}
     */
    handleDragAreas = (event) => {
        const dropTarget = event.currentTarget.querySelector('.taskDragArea');
        if (event.type === 'dragover') {
            event.preventDefault();
            dropTarget.classList.add("highlightedBackground");
        } else if (event.type === 'dragleave') {
            if (!dropTarget.contains(event.relatedTarget)) dropTarget.classList.remove("highlightedBackground");
        }
    };

    /**
     * Handles click, dragstart, dragend on todo cards.
     * @param {Event} event
     * @returns {Promise<void>}
     */
    handleToDos = async (event) => {
        const target = event.target.closest(".todoContainer");
        if (!target) return this._logWarn("handleToDos called but no '.todoContainer' found for event target: " + event.target);
        const taskId = target.dataset.id;
        const dragAreas = document.querySelectorAll('.taskDragArea');
        if (event.type === 'dragstart') {
            this.boardInstance.currentDraggedElement = taskId;
            target.classList.add("tilted");
            dragAreas.forEach((zone) => {
                zone.classList.add("highlighted");
                zone.addEventListener('dragenter', () => event.preventDefault());
            });
        } else if (event.type === 'dragend') {
            target.classList.remove("tilted");
            dragAreas.forEach((zone) => {
                zone.classList.remove("highlighted", "highlightedBackground");
                zone.removeEventListener('dragenter', () => event.preventDefault());
            });
            if (this.boardInstance.currentDraggedElement === taskId) this.boardInstance.currentDraggedElement = null;
        } else if (event.type === 'click') {
            await this.boardInstance.openOverlay(taskId);
        }
    };

    //NOTE - Error/Warning Helpers
    /**
     * Logs a warning message.
     * @param {string} msg
     * @returns {void}
     */
    _logWarn(msg) { console.warn(msg); }

    /**
     * Logs an error message.
     * @param {string} msg
     * @returns {void}
     */
    _logError(msg) { console.error(msg); }
}