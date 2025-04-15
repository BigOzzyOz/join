// import { contacts, tasks, getDataFromDatabase, updateDataInDatabase, setTasks, toggleLoader, deleteDataFromDatabase } from "../script.js"; // Dependencies
// import { HtmlTask } from "./html/class.html-task.js"; // Dependency
// import { AddTask } from "./class.add-task.js"; // Dependency for opening edit
// import { fetchAddTaskTemplate, generateOpenOverlayHTML, generateTaskEditHTML } from "./boardtemplate.js"; // HTML Templates -> HtmlTask, HtmlAddTask

class Board {
    constructor() {
        this.currentDraggedElement = null;
        this.currentSearchInput = '';
        this.tasks = []; // Holds the tasks for the board
        this.htmlTask = new HtmlTask(); // Instance for generating task HTML
        // this.addTask = new AddTask(); // Instance for editing tasks - might be better managed outside
    }

    // --- Board Initialization and Rendering ---

    /**
     * Initializes the board by fetching tasks and rendering them.
     */
    async initBoard() {
        // Dependency: setTasks (fetches and stores tasks globally or locally)
        // toggleLoader(true); // Dependency
        // await setTasks(); // Load tasks into this.tasks or a shared state
        // this.tasks = tasks; // Assuming tasks is now populated globally or returned
        this.updateBoard();
        // toggleLoader(false); // Dependency
        // initDragDrop(); // Listener setup, belongs in BoardListener
    }

    /**
     * Clears and updates the HTML content of all task columns based on current tasks and search filter.
     */
    updateBoard() {
        // Dependency: DOM elements for columns
        const statuses = ['todo', 'inprogress', 'awaitfeedback', 'done']; // Example statuses
        statuses.forEach(status => {
            const column = document.getElementById(`tasks-${status}`);
            if (column) {
                column.innerHTML = ''; // Clear column
                this.renderTasks(status, column);
            } else {
                console.warn(`Column element 'tasks-${status}' not found.`);
            }
        });
        this.checkEmptyColumns(); // Add placeholders if columns are empty
    }

    /**
     * Renders tasks for a specific status column, applying the search filter.
     * @param {string} status - The status of the tasks to render.
     * @param {HTMLElement} columnElement - The DOM element of the column.
     */
    renderTasks(status, columnElement) {
        // Dependency: HtmlTask instance
        let filteredTasks = this.filterTasks(status);
        filteredTasks = this.applyCurrentSearchFilter(filteredTasks);

        if (filteredTasks.length === 0) {
            // Optionally show a "No tasks" message for this status/filter
        } else {
            filteredTasks.forEach(task => {
                columnElement.innerHTML += this.htmlTask.generateTodoHTML(task);
                // Update progress bar after rendering the task
                this.updateSubtaskProgressBar(task.subtasks, task.id);
            });
        }
    }

    /**
     * Filters the board's tasks by status.
     * @param {string} status - The status to filter by.
     * @returns {Array} An array of tasks matching the status.
     */
    filterTasks(status) {
        return this.tasks.filter(task => task.status === status);
    }

    /**
     * Checks if columns are empty and adds/removes a placeholder message.
     */
    checkEmptyColumns() {
        const statuses = ['todo', 'inprogress', 'awaitfeedback', 'done'];
        statuses.forEach(status => {
            const column = document.getElementById(`tasks-${status}`);
            const placeholder = document.getElementById(`no-tasks-${status}`); // Assuming placeholders have IDs like this
            if (column && placeholder) {
                if (column.children.length === 0) {
                    placeholder.classList.remove('d-none');
                } else {
                    placeholder.classList.add('d-none');
                }
            }
        });
    }


    // --- Search Functionality ---

    /**
     * Filters tasks displayed on the board based on the search input.
     */
    searchTasks() {
        // Dependency: DOM element for search input
        const searchInput = document.getElementById('boardSearchInput');
        this.currentSearchInput = searchInput.value.toLowerCase();
        this.updateBoard(); // Re-render tasks with the new filter
    }

    /**
     * Applies the current search filter to a given list of tasks.
     * @param {Array} tasksToFilter - The array of tasks to filter.
     * @returns {Array} The filtered array of tasks.
     */
    applyCurrentSearchFilter(tasksToFilter) {
        if (!this.currentSearchInput) {
            return tasksToFilter; // No filter applied
        }
        return tasksToFilter.filter(task =>
            task.title.toLowerCase().includes(this.currentSearchInput) ||
            task.description.toLowerCase().includes(this.currentSearchInput)
        );
    }

    // --- Drag and Drop Functionality ---

    /**
     * Stores the ID of the task being dragged.
     * @param {string} id - The ID of the task element being dragged.
     */
    startDragging(id) {
        this.currentDraggedElement = id;
        // Optional: Add visual feedback (e.g., class to the dragged element)
        document.getElementById(id)?.classList.add('dragging');
    }

    /**
     * Allows a drop by preventing the default handling of the element.
     * @param {Event} ev - The dragover event.
     */
    allowDrop(ev) {
        ev.preventDefault();
        // Optional: Add visual feedback to the drop target
        // ev.currentTarget.classList.add('drag-over');
    }

    /**
     * Moves the dragged task to the new status/column.
     * @param {string} status - The target status/column.
     */
    async moveTo(status) {
        // Dependency: updateDataInDatabase, setTasks (or update local this.tasks)
        if (this.currentDraggedElement) {
            const task = this.tasks.find(t => t.id === this.currentDraggedElement);
            if (task && task.status !== status) {
                task.status = status;
                try {
                    // toggleLoader(true); // Dependency
                    // await updateDataInDatabase(`${BASE_URL}tasks/${this.currentDraggedElement}.json?auth=${token}`, { status: status }); // Update only status
                    // Update local task state
                    const taskIndex = this.tasks.findIndex(t => t.id === this.currentDraggedElement);
                    if (taskIndex !== -1) {
                        this.tasks[taskIndex].status = status;
                    }
                    // await setTasks(); // Or just update UI if local state is managed
                    this.updateBoard(); // Re-render the board
                    // toggleLoader(false); // Dependency
                } catch (error) {
                    console.error("Error moving task:", error);
                    // Revert task status in local state if needed
                    // toggleLoader(false); // Dependency
                }
            }
            // Clean up visual feedback even if status didn't change
            this.dragEndCleanup();
        }
    }

    /**
     * Handles the end of a drag operation (cleanup).
     */
    dragEnd() {
        this.dragEndCleanup();
    }

    /**
    * Internal helper to remove dragging classes.
    */
    dragEndCleanup() {
        if (this.currentDraggedElement) {
            document.getElementById(this.currentDraggedElement)?.classList.remove('dragging');
        }
        // Remove drag-over class from all potential targets
        document.querySelectorAll('.taskColumnContent').forEach(el => el.classList.remove('drag-over'));
        this.currentDraggedElement = null;
    }

    /**
     * Handles moving tasks between columns on mobile (if specific logic is needed).
     * @param {string} direction - 'left' or 'right'.
     * @param {string} taskId - The ID of the task to move.
     */
    moveToMobile(direction, taskId) {
        // Dependency: tasks array
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const statuses = ['todo', 'inprogress', 'awaitfeedback', 'done'];
        const currentStatusIndex = statuses.indexOf(task.status);
        let newStatusIndex = currentStatusIndex;

        if (direction === 'right' && currentStatusIndex < statuses.length - 1) {
            newStatusIndex++;
        } else if (direction === 'left' && currentStatusIndex > 0) {
            newStatusIndex--;
        }

        if (newStatusIndex !== currentStatusIndex) {
            this.moveTo(statuses[newStatusIndex]); // Reuse moveTo logic
        }
    }


    // --- Task Interaction (Overlay, Edit, Delete) ---

    /**
     * Opens the task detail overlay.
     * @param {string} taskId - The ID of the task to display.
     */
    openOverlay(taskId) {
        // Dependency: tasks array, HtmlTask instance, DOM element for overlay
        const task = this.tasks.find(t => t.id === taskId);
        const overlay = document.getElementById('boardTaskOverlay');
        const overlayContent = document.getElementById('boardTaskOverlayContent'); // Assuming content container

        if (task && overlay && overlayContent) {
            overlayContent.innerHTML = this.htmlTask.generateOpenOverlayHTML(task);
            overlay.classList.remove('d-none');
            // activateOverlayListeners(taskId); // Listener setup, belongs in BoardListener
        } else {
            console.error("Task or overlay elements not found for ID:", taskId);
        }
    }

    /**
    * Opens the Add Task form in edit mode within an overlay.
    * @param {string} taskId - The ID of the task to edit.
    */
    async openEditTaskOverlay(taskId) {
        // Dependency: tasks array, HtmlAddTask instance, AddTask instance, DOM element for overlay
        const task = this.tasks.find(t => t.id === taskId);
        const overlay = document.getElementById('addTaskOverlay'); // Assuming edit uses the add task overlay
        const overlayContent = document.getElementById('addTaskOverlayContent'); // Container within overlay

        if (task && overlay && overlayContent) {
            // const htmlAddTask = new HtmlAddTask(); // Needs instance
            // const addTask = new AddTask(); // Needs instance

            // Generate the form HTML pre-filled with task data
            // overlayContent.innerHTML = htmlAddTask.generateTaskEditHTML(task);

            // Prepare the AddTask instance for editing
            // addTask.enableTaskEdit(taskId); // This populates the form based on IDs

            overlay.classList.remove('d-none');
            // activateEditTaskListeners(taskId); // Listener setup, belongs in BoardListener
            // Close the detail overlay if it was open
            this.closeModal('boardTaskOverlay');
        } else {
            console.error("Task or overlay elements not found for editing ID:", taskId);
        }
    }


    /**
     * Closes the specified modal/overlay or all if no ID is given.
     * @param {string} [modalId=null] - The ID of the modal to close.
     */
    closeModal(modalId = null) {
        // Dependency: DOM elements for modals
        const modals = modalId ? [document.getElementById(modalId)] : document.querySelectorAll('.modalOverlay'); // Adjust selector if needed

        modals.forEach(modal => {
            if (modal) {
                modal.classList.add('d-none');
                const content = modal.querySelector('.modalContent, .boardTaskOverlayContent, .addTaskOverlayContent'); // Adjust selectors
                if (content) content.innerHTML = ''; // Clear content
            }
        });
        // deactivateOverlayListeners(); // Listener removal, belongs in BoardListener
        // deactivateAllAddTaskListeners(); // Listener removal, belongs in AddTaskListener
    }

    /**
     * Initiates the task deletion process (e.g., shows confirmation).
     * @param {string} taskId - The ID of the task to delete.
     */
    deleteTask(taskId) {
        // Dependency: DOM element for confirmation dialog
        // Show a confirmation dialog (e.g., a custom modal or window.confirm)
        // Store taskId temporarily if needed for the confirmation step
        console.log(`Initiate delete for task: ${taskId}`);
        // Example using confirm:
        if (confirm(`Are you sure you want to delete task ${taskId}?`)) {
            this.deleteTaskSure(taskId);
        }
        // Or: Show custom confirmation modal
        // document.getElementById('deleteConfirmModal').classList.remove('d-none');
        // document.getElementById('confirmDeleteBtn').onclick = () => this.deleteTaskSure(taskId);
    }

    /**
     * Performs the actual deletion after confirmation.
     * @param {string} taskId - The ID of the task to delete.
     */
    async deleteTaskSure(taskId) {
        // Dependency: deleteDataFromDatabase, setTasks (or update local state)
        try {
            // toggleLoader(true); // Dependency
            // await deleteDataFromDatabase(`${BASE_URL}tasks/${taskId}.json?auth=${token}`); // Dependency
            // Remove task from local state
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            // await setTasks(); // Or just update UI
            this.updateBoard();
            this.closeModal(); // Close any open overlays (like detail or confirmation)
            // toggleLoader(false); // Dependency
        } catch (error) {
            console.error("Error deleting task:", error);
            // toggleLoader(false); // Dependency
            // Show error message
        }
    }

    // --- Utility ---

    /**
     * Updates the subtask progress bar for a specific task card.
     * @param {Array} subtasks - The array of subtasks for the task.
     * @param {string} taskId - The ID of the task.
     */
    updateSubtaskProgressBar(subtasks, taskId) {
        // Dependency: DOM element for progress bar
        const progressBar = document.getElementById(`subtaskProgress-${taskId}`);
        if (!progressBar || !subtasks || subtasks.length === 0) {
            // Hide progress bar container if no subtasks?
            const subtaskContainer = progressBar?.closest('.boardTaskSubtasks');
            if (subtaskContainer) subtaskContainer.style.display = 'none';
            return;
        }

        const subtaskContainer = progressBar.closest('.boardTaskSubtasks');
        if (subtaskContainer) subtaskContainer.style.display = ''; // Ensure visible

        const checkedSubtasks = subtasks.filter(task => task.status === 'checked').length;
        const progress = (checkedSubtasks / subtasks.length) * 100;
        progressBar.style.width = `${progress}%`;

        // Update subtask count text
        const countSpan = progressBar.closest('.boardTaskSubtasks').querySelector('span');
        if (countSpan) {
            countSpan.textContent = `${checkedSubtasks}/${subtasks.length} Subtasks`;
        }
    }

    /**
     * Updates the status of a task (used by mobile controls, potentially).
     * @param {string} taskId - The ID of the task.
     * @param {string} newStatus - The new status.
     */
    async updateTaskStatus(taskId, newStatus) {
        // This is essentially the same core logic as moveTo, maybe refactor later
        const task = this.tasks.find(t => t.id === taskId);
        if (task && task.status !== newStatus) {
            await this.moveTo(newStatus); // Reuse moveTo logic
        }
    }
}