// import { Task } from '../class.task.js'; // Dependency for updateSubtaskStatus logic if moved

class BoardListener {
    /**
     * @param {Board} boardInstance - An instance of the Board class.
     * @param {Task} taskInstance - An instance of the Task class (for subtask updates).
     * @param {AddTaskListener} addTaskListenerInstance - Instance to manage add/edit form listeners.
     */
    constructor(boardInstance, taskInstance, addTaskListenerInstance) {
        this.board = boardInstance;
        this.task = taskInstance; // Needed for updateSubtaskStatus
        this.addTaskListener = addTaskListenerInstance; // To activate/deactivate when editing

        // Bound handlers for board interactions
        this.boundHandleDragStart = this.handleDragStart.bind(this);
        this.boundHandleDragEnd = this.handleDragEnd.bind(this);
        this.boundHandleDragOver = this.handleDragOver.bind(this);
        this.boundHandleDrop = this.handleDrop.bind(this);
        this.boundHandleBoardClick = this.handleBoardClick.bind(this);
        this.boundHandleSearchInput = this.handleSearchInput.bind(this);
        this.boundHandleAddTaskClick = this.handleAddTaskClick.bind(this);

        // Bound handlers for overlay interactions
        this.boundHandleOverlayClick = this.handleOverlayClick.bind(this);
        this.boundHandleOutsideModalClick = this.handleOutsideModalClick.bind(this);

        this.activeModalId = null; // Track which modal is open for outside click
    }

    // --- Board Event Handlers ---

    handleDragStart(event) {
        const taskElement = event.target.closest('.boardTask');
        if (taskElement) {
            this.board.startDragging(taskElement.id);
            event.dataTransfer.setData('text/plain', taskElement.id); // Necessary for Firefox
            event.dataTransfer.effectAllowed = 'move';
        }
    }

    handleDragEnd(event) {
        this.board.dragEnd();
    }

    handleDragOver(event) {
        event.preventDefault(); // Necessary to allow drop
        event.dataTransfer.dropEffect = 'move';
        // Optional: Add visual feedback to the column
        const column = event.currentTarget;
        column.classList.add('drag-over');
        // Remove from others
        document.querySelectorAll('.taskColumnContent.drag-over').forEach(el => {
            if (el !== column) el.classList.remove('drag-over');
        });
    }

    handleDrop(event) {
        event.preventDefault();
        const columnElement = event.currentTarget;
        const status = columnElement.dataset.status; // Assumes columns have data-status attribute
        columnElement.classList.remove('drag-over');
        if (status && this.board.currentDraggedElement) {
            this.board.moveTo(status);
        } else {
            this.board.dragEndCleanup(); // Cleanup even if drop is invalid
        }
    }

    handleBoardClick(event) {
        const taskElement = event.target.closest('.boardTask');
        if (taskElement) {
            this.board.openOverlay(taskElement.id);
        }
    }

    handleSearchInput(event) {
        this.board.searchTasks();
    }

    handleAddTaskClick(event) {
        const button = event.target.closest('.addTaskBtnBoard'); // Selector for Add Task buttons on board
        if (button) {
            const status = button.dataset.status || 'todo'; // Get target status from button
            // Open the Add Task overlay/modal, potentially pre-setting the status
            // This might involve calling a method on the Board or directly manipulating the AddTask instance/overlay
            console.log(`Open Add Task modal for status: ${status}`);
            const addTaskOverlay = document.getElementById('addTaskOverlay');
            if (addTaskOverlay) {
                // Ensure form is clear before showing
                this.addTaskListener.addTask.clearAddTaskForm();
                // Optionally set default status if needed by AddTask logic
                // this.addTaskListener.addTask.setDefaultStatus(status);
                addTaskOverlay.classList.remove('d-none');
                this.addTaskListener.activateAddTaskListeners(); // Activate listeners for the fresh form
                this.addOutsideClickListener('addTaskOverlay');
            }
        }
    }


    // --- Overlay Event Handlers ---

    handleOverlayClick(event) {
        const target = event.target;
        const overlay = event.currentTarget; // The overlay element itself
        const taskId = overlay.dataset.taskId; // Assumes overlay gets task ID set when opened

        // Close Button
        if (target.closest('.closeBtn')) {
            this.board.closeModal(overlay.id);
            this.removeOutsideClickListener();
            if (overlay.id === 'addTaskOverlay') {
                this.addTaskListener.deactivateAllAddTaskListeners();
            }
            return; // Stop further processing
        }

        // --- Task Detail Overlay Specific ---
        if (overlay.id === 'boardTaskOverlay') {
            // Delete Button
            if (target.closest('.boardTaskOverlayBtn[onclick*="deleteTask"]')) { // Or use a specific class/id
                // Extract taskId from the overlay or button if needed
                const taskElement = overlay.querySelector('.boardTaskOverlayContent'); // Find element with ID if stored there
                const idToDelete = taskElement?.id || taskId; // Get ID
                if (idToDelete) this.board.deleteTask(idToDelete);
            }
            // Edit Button
            else if (target.closest('.boardTaskOverlayBtn[onclick*="enableTaskEdit"]')) { // Or use a specific class/id
                const taskElement = overlay.querySelector('.boardTaskOverlayContent');
                const idToEdit = taskElement?.id || taskId;
                if (idToEdit) {
                    this.board.openEditTaskOverlay(idToEdit); // Board handles opening edit overlay
                    this.removeOutsideClickListener(); // Remove listener for detail overlay
                    this.addOutsideClickListener('addTaskOverlay'); // Add for edit overlay
                }
            }
            // Subtask Checkbox
            else if (target.matches('img[id^="subtaskCheckbox-"]')) {
                const subtaskIndex = parseInt(target.id.replace('subtaskCheckbox-', ''), 10);
                const taskElement = overlay.querySelector('.boardTaskOverlayContent'); // Find element with ID if stored there
                const currentTaskId = taskElement?.id || taskId; // Get ID
                if (currentTaskId !== null && !isNaN(subtaskIndex)) {
                    // Call the method from the Task instance
                    this.task.updateSubtaskStatus(currentTaskId, subtaskIndex)
                        .then(() => {
                            // Optional: Update UI directly or rely on Board update if necessary
                            const isChecked = target.src.includes('Checked');
                            target.src = isChecked ? '../assets/icons/checkbox.svg' : '../assets/icons/checkboxChecked.svg';
                            // Re-calculate progress bar within the overlay if needed
                            // this.board.updateSubtaskProgressBar(...) // Might need access to task data here
                        })
                        .catch(error => console.error("Error updating subtask status:", error));
                }
            }
        }
        // --- Add/Edit Task Overlay Specific ---
        // Most listeners for add/edit are handled by AddTaskListener,
        // but the close button is general, handled above.
    }

    handleOutsideModalClick(event) {
        if (this.activeModalId) {
            const modal = document.getElementById(this.activeModalId);
            // Check if the click is outside the modal content area
            if (modal && !modal.querySelector('.modalContent, .boardTaskOverlayContent, .addTaskOverlayContent')?.contains(event.target)) {
                this.board.closeModal(this.activeModalId);
                this.removeOutsideClickListener();
                if (this.activeModalId === 'addTaskOverlay') {
                    this.addTaskListener.deactivateAllAddTaskListeners();
                }
            }
        }
    }


    // --- Listener Activation/Deactivation ---

    /**
     * Activates all listeners for the board.
     */
    activateBoardListeners() {
        const boardContainer = document.getElementById('boardContainer'); // Main container for tasks
        const searchInput = document.getElementById('boardSearchInput');
        const taskColumns = document.querySelectorAll('.taskColumnContent'); // The droppable areas
        const taskOverlay = document.getElementById('boardTaskOverlay');
        const addTaskOverlay = document.getElementById('addTaskOverlay');
        const addTaskButtons = document.querySelectorAll('.addTaskBtnBoard'); // Add task buttons on board

        // Drag and Drop & Task Clicks (Delegated)
        if (boardContainer) {
            boardContainer.addEventListener('dragstart', this.boundHandleDragStart);
            boardContainer.addEventListener('dragend', this.boundHandleDragEnd);
            boardContainer.addEventListener('click', this.boundHandleBoardClick);
        }

        // Drop Zones
        taskColumns.forEach(column => {
            column.addEventListener('dragover', this.boundHandleDragOver);
            column.addEventListener('drop', this.boundHandleDrop);
            column.addEventListener('dragleave', (e) => e.currentTarget.classList.remove('drag-over')); // Cleanup visual feedback
        });

        // Search
        searchInput?.addEventListener('input', this.boundHandleSearchInput);

        // Overlays (Delegated Clicks)
        taskOverlay?.addEventListener('click', this.boundHandleOverlayClick);
        addTaskOverlay?.addEventListener('click', this.boundHandleOverlayClick); // Handles general clicks like close

        // Add Task Buttons on Board
        addTaskButtons.forEach(button => {
            button.addEventListener('click', this.boundHandleAddTaskClick);
        });

        // Note: AddTaskListener activation is handled when the add/edit overlay is specifically opened.
        // Note: Outside click listener is added dynamically when a modal opens.
    }

    /**
     * Deactivates all listeners for the board.
     */
    deactivateBoardListeners() {
        const boardContainer = document.getElementById('boardContainer');
        const searchInput = document.getElementById('boardSearchInput');
        const taskColumns = document.querySelectorAll('.taskColumnContent');
        const taskOverlay = document.getElementById('boardTaskOverlay');
        const addTaskOverlay = document.getElementById('addTaskOverlay');
        const addTaskButtons = document.querySelectorAll('.addTaskBtnBoard');

        // Drag and Drop & Task Clicks
        if (boardContainer) {
            boardContainer.removeEventListener('dragstart', this.boundHandleDragStart);
            boardContainer.removeEventListener('dragend', this.boundHandleDragEnd);
            boardContainer.removeEventListener('click', this.boundHandleBoardClick);
        }

        // Drop Zones
        taskColumns.forEach(column => {
            column.removeEventListener('dragover', this.boundHandleDragOver);
            column.removeEventListener('drop', this.boundHandleDrop);
            column.removeEventListener('dragleave', (e) => e.currentTarget.classList.remove('drag-over'));
        });

        // Search
        searchInput?.removeEventListener('input', this.boundHandleSearchInput);

        // Overlays
        taskOverlay?.removeEventListener('click', this.boundHandleOverlayClick);
        addTaskOverlay?.removeEventListener('click', this.boundHandleOverlayClick);

        // Add Task Buttons on Board
        addTaskButtons.forEach(button => {
            button.removeEventListener('click', this.boundHandleAddTaskClick);
        });


        // Ensure AddTask listeners are deactivated if the overlay might be open
        this.addTaskListener.deactivateAllAddTaskListeners();
        // Ensure outside click listener is removed
        this.removeOutsideClickListener();
    }

    // --- Dynamic Listener Management ---

    /**
     * Adds a listener to the document to detect clicks outside the active modal.
     * @param {string} modalId - The ID of the currently open modal.
     */
    addOutsideClickListener(modalId) {
        this.activeModalId = modalId;
        // Use setTimeout to prevent immediate closing if the click opening the modal bubbles up
        setTimeout(() => {
            document.addEventListener('click', this.boundHandleOutsideModalClick, true); // Use capture phase
        }, 0);
    }

    /**
     * Removes the listener for outside clicks.
     */
    removeOutsideClickListener() {
        this.activeModalId = null;
        document.removeEventListener('click', this.boundHandleOutsideModalClick, true);
    }

    /**
     * Call this when the task detail overlay is opened.
     * @param {string} taskId
     */
    activateOverlayListeners(taskId) {
        const overlay = document.getElementById('boardTaskOverlay');
        if (overlay) {
            overlay.dataset.taskId = taskId; // Store task ID for reference in handler
            this.addOutsideClickListener('boardTaskOverlay');
        }
    }

    /**
     * Call this when the task edit overlay is opened.
     * @param {string} taskId
     */
    activateEditTaskListeners(taskId) {
        const overlay = document.getElementById('addTaskOverlay');
        if (overlay) {
            overlay.dataset.taskId = taskId; // Store task ID
            this.addTaskListener.activateAddTaskListeners(); // Activate form-specific listeners
            this.addOutsideClickListener('addTaskOverlay');
        }
    }

    /**
     * Call this when any overlay is closed.
     */
    deactivateOverlayListeners() {
        // General overlay listeners are removed by deactivateBoardListeners if needed.
        // Specific form listeners are deactivated when closing the add/edit modal.
        this.removeOutsideClickListener();
        // If closing the edit overlay, ensure AddTask listeners are off
        this.addTaskListener.deactivateAllAddTaskListeners();
    }
}