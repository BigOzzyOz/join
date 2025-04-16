class AddTaskListener {
    /**
     * @param {AddTask} addTaskInstance - An instance of the AddTask class.
     */
    constructor(addTaskInstance) {
        this.addTask = addTaskInstance;
        this.boundHandleAssignClick = this.handleAssignClick.bind(this);
        this.boundHandleAssignSearch = this.handleAssignSearch.bind(this);
        this.boundHandleAssignCheckboxChange = this.handleAssignCheckboxChange.bind(this);
        this.boundHandleCategoryClick = this.handleCategoryClick.bind(this);
        this.boundHandleCategorySelect = this.handleCategorySelect.bind(this);
        this.boundHandlePrioClick = this.handlePrioClick.bind(this);
        this.boundHandleSubtaskAddIconClick = this.handleSubtaskAddIconClick.bind(this);
        this.boundHandleSubtaskClearIconClick = this.handleSubtaskClearIconClick.bind(this);
        this.boundHandleSubtaskSaveIconClick = this.handleSubtaskSaveIconClick.bind(this);
        this.boundHandleSubtaskKeydown = this.handleSubtaskKeydown.bind(this);
        this.boundHandleSubtaskListEvents = this.handleSubtaskListEvents.bind(this);
        this.boundHandleFormSubmit = this.handleFormSubmit.bind(this); // Or button click
        this.boundHandleClearForm = this.handleClearForm.bind(this);
        // Add more bound handlers if needed, e.g., for outside clicks
    }

    // --- Handler Methods ---
    // These methods are called by the event listeners and delegate to the AddTask instance.

    handleAssignClick(event) {
        // Prevent closing dropdown if click is inside
        event.stopPropagation();
        this.addTask.toggleDropdown();
    }

    handleAssignSearch(event) {
        this.addTask.assignSearchInput(event);
    }

    handleAssignCheckboxChange(event) {
        this.addTask.contactAssign(event);
    }

    handleCategoryClick(event) {
        event.stopPropagation();
        this.addTask.toggleCategoryDropdown();
    }

    handleCategorySelect(event) {
        if (event.target.tagName === 'LI') {
            this.addTask.selectCategory(event.target.textContent);
        }
    }

    handlePrioClick(event) {
        const button = event.target.closest('.addTaskPrioBtn');
        if (button) {
            const prio = button.id.replace('prio', '').toLowerCase(); // 'urgent', 'medium', 'low'
            this.addTask.setPrio(prio, event);
        }
    }

    handleSubtaskAddIconClick() {
        this.addTask.addNewSubtask();
    }

    handleSubtaskClearIconClick() {
        this.addTask.clearSubtaskInput();
    }

    handleSubtaskSaveIconClick() {
        this.addTask.saveSubtask();
    }

    handleSubtaskKeydown(event) {
        this.addTask.handleKeyDown(event);
    }

    handleSubtaskListEvents(event) {
        const target = event.target;
        const listItem = target.closest('li');
        if (!listItem) return;

        const index = parseInt(listItem.id.replace('subtaskListId', ''), 10);

        if (target.closest('.subtaskListIcon[src*="edit"]')) {
            this.addTask.editSubtask(index);
        } else if (target.closest('.subtaskListIcon[src*="delete"]')) {
            this.addTask.deleteSubtask(index);
        } else if (target.closest('.subtaskEditIcon[src*="delete"]')) {
            this.addTask.deleteSubtask(index); // Same action for delete in edit mode
        } else if (target.closest('.subtaskEditIcon[src*="check"]')) {
            this.addTask.saveEditedSubtask(index);
        } else if (event.type === 'dblclick' && target.closest('.subtaskListLabel')) {
            this.addTask.editSubtask(index);
        }
    }

    handleFormSubmit(event) {
        event.preventDefault(); // Prevent default form submission
        // Determine if adding or editing based on addTask.currentTaskToEditId
        if (this.addTask.currentTaskToEditId) {
            this.addTask.saveEditedTask();
        } else {
            // Determine status based on which button was clicked if multiple submit buttons exist
            // For now, assume default 'todo' or get from button data attribute
            const status = event.target.dataset.status || 'todo';
            this.addTask.pushNewTask(status);
        }
    }

    handleClearForm(event) {
        event.preventDefault(); // Prevent default if it's a button in a form
        this.addTask.clearAddTaskForm();
    }

    // --- Activation/Deactivation ---

    /**
     * Activates all listeners for the add task form.
     */
    activateAddTaskListeners() {
        // Assign Dropdown
        document.getElementById('addAssigned')?.addEventListener('click', this.boundHandleAssignClick);
        document.getElementById('assignArrow')?.addEventListener('click', this.boundHandleAssignClick);
        document.getElementById('assignSearch')?.addEventListener('input', this.boundHandleAssignSearch);
        // Listener for checkboxes needs to be added when dropdown opens or use event delegation
        document.getElementById('assignDropdown')?.addEventListener('change', this.boundHandleAssignCheckboxChange); // Delegation example

        // Category Dropdown
        document.getElementById('addCategory')?.addEventListener('click', this.boundHandleCategoryClick);
        document.getElementById('categoryArrow')?.addEventListener('click', this.boundHandleCategoryClick);
        document.getElementById('categoryDropdown')?.addEventListener('click', this.boundHandleCategorySelect); // Delegation

        // Priority Buttons
        document.getElementById('prioUrgent')?.addEventListener('click', this.boundHandlePrioClick);
        document.getElementById('prioMedium')?.addEventListener('click', this.boundHandlePrioClick);
        document.getElementById('prioLow')?.addEventListener('click', this.boundHandlePrioClick);

        // Subtasks Input
        document.getElementById('subtaskAddIcon')?.addEventListener('click', this.boundHandleSubtaskAddIconClick);
        document.getElementById('subtaskClearIcon')?.addEventListener('click', this.boundHandleSubtaskClearIconClick);
        document.getElementById('subtaskSaveIcon')?.addEventListener('click', this.boundHandleSubtaskSaveIconClick);
        document.getElementById('addSubtask')?.addEventListener('keydown', this.boundHandleSubtaskKeydown);

        // Subtasks List (using event delegation)
        const subtaskList = document.getElementById('addedSubtasksList');
        subtaskList?.addEventListener('click', this.boundHandleSubtaskListEvents);
        subtaskList?.addEventListener('dblclick', this.boundHandleSubtaskListEvents);


        // Form Buttons (assuming buttons have specific IDs)
        document.getElementById('createTaskBtn')?.addEventListener('click', this.boundHandleFormSubmit); // Assuming this is the main submit
        document.getElementById('clearTaskBtn')?.addEventListener('click', this.boundHandleClearForm);

        // TODO: Add listeners for outside clicks to close dropdowns
        // This requires a more robust mechanism, potentially adding a listener to `document`
        // when a dropdown opens and removing it when it closes.
    }

    /**
     * Deactivates all listeners for the add task form.
     */
    deactivateAllAddTaskListeners() {
        // Remove listeners - use the same elements and bound functions
        document.getElementById('addAssigned')?.removeEventListener('click', this.boundHandleAssignClick);
        document.getElementById('assignArrow')?.removeEventListener('click', this.boundHandleAssignClick);
        document.getElementById('assignSearch')?.removeEventListener('input', this.boundHandleAssignSearch);
        document.getElementById('assignDropdown')?.removeEventListener('change', this.boundHandleAssignCheckboxChange);

        document.getElementById('addCategory')?.removeEventListener('click', this.boundHandleCategoryClick);
        document.getElementById('categoryArrow')?.removeEventListener('click', this.boundHandleCategoryClick);
        document.getElementById('categoryDropdown')?.removeEventListener('click', this.boundHandleCategorySelect);

        document.getElementById('prioUrgent')?.removeEventListener('click', this.boundHandlePrioClick);
        document.getElementById('prioMedium')?.removeEventListener('click', this.boundHandlePrioClick);
        document.getElementById('prioLow')?.removeEventListener('click', this.boundHandlePrioClick);

        document.getElementById('subtaskAddIcon')?.removeEventListener('click', this.boundHandleSubtaskAddIconClick);
        document.getElementById('subtaskClearIcon')?.removeEventListener('click', this.boundHandleSubtaskClearIconClick);
        document.getElementById('subtaskSaveIcon')?.removeEventListener('click', this.boundHandleSubtaskSaveIconClick);
        document.getElementById('addSubtask')?.removeEventListener('keydown', this.boundHandleSubtaskKeydown);

        const subtaskList = document.getElementById('addedSubtasksList');
        subtaskList?.removeEventListener('click', this.boundHandleSubtaskListEvents);
        subtaskList?.removeEventListener('dblclick', this.boundHandleSubtaskListEvents);

        document.getElementById('createTaskBtn')?.removeEventListener('click', this.boundHandleFormSubmit);
        document.getElementById('clearTaskBtn')?.removeEventListener('click', this.boundHandleClearForm);

        // TODO: Remove outside click listeners if they were added.
    }
}