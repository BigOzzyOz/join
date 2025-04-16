// import { activeTab, contacts, setActiveTab, postDataToDatabase, setTasks, updateDataInDatabase } from "../script.js"; // Dependencies to be managed
// import { closeModal } from "./board2.js"; // Dependency to be managed
// import { handleAssignContact } from "./board-listener.js"; // Listener logic, belongs elsewhere
// import { activateSubtaskListeners, deactivateSubtaskListeners } from "./addTask-listener.js"; // Listener logic, belongs elsewhere
// import { htmlRenderContactsAssign, generateSaveSubtaskHTML } from "./addTaskTemplate.js"; // HTML Templates, belong elsewhere (HtmlAddTask, HtmlSubtask)
// import { ContactHtml } from "../src/classes/class.contactHtml.js"; // HTML Template dependency

export class AddTask {
    constructor() {
        this.assignedContacts = [];
        this.currentPrio = 'medium';
        this.addedSubtasks = []; // Holds temporary subtasks {text: '...', status: 'todo'}
        this.isAssignDropdownOpen = false;
        this.isCategoryDropdownOpen = false;
        this.currentTaskToEditId = null; // To know if we are editing or adding
        // TODO: Add references to required DOM elements if needed
    }

    // --- Dropdown Logic ---

    /**
     * Toggles the assignment dropdown menu open or closed.
     */
    async toggleDropdown() {
        const dropdown = document.getElementById('assignDropdown');
        const input = document.getElementById('addAssigned');
        const arrow = document.getElementById('assignArrow');
        const searchInput = document.getElementById('assignSearch');

        if (this.isAssignDropdownOpen) {
            this.closeAssignDropdown();
        } else {
            await this.openAssignDropdown();
            input.classList.add('inputFieldFocus');
            arrow.classList.add('rotateArrow');
            dropdown.classList.remove('d-none');
            searchInput.focus();
            this.isAssignDropdownOpen = true;
            // activateOutsideCheck('assignDropdownContainer', this.closeAssignDropdown.bind(this)); // Listener logic
        }
    }

    /**
     * Opens the assignment dropdown menu.
     */
    async openAssignDropdown() {
        // Dependency: contacts (global or passed), HtmlAddTask class instance
        const dropdown = document.getElementById('assignDropdown');
        dropdown.innerHTML = ''; // Clear previous content
        // const sortedContacts = contacts.sort((a, b) => a.name.localeCompare(b.name)); // Assuming contacts is available
        // sortedContacts.forEach(contact => {
        //     dropdown.innerHTML += htmlRenderContactsAssign(contact); // Use HtmlAddTask method
        // });
        // Add listeners for checkboxes // Listener logic
    }

    /**
     * Closes the assignment dropdown menu.
     */
    closeAssignDropdown() {
        const dropdown = document.getElementById('assignDropdown');
        const input = document.getElementById('addAssigned');
        const arrow = document.getElementById('assignArrow');
        const searchInput = document.getElementById('assignSearch');

        if (dropdown) dropdown.classList.add('d-none');
        if (input) input.classList.remove('inputFieldFocus');
        if (arrow) arrow.classList.remove('rotateArrow');
        if (searchInput) searchInput.value = ''; // Clear search
        this.isAssignDropdownOpen = false;
        // Remove outside click listener // Listener logic
        // Remove checkbox listeners // Listener logic
        this.renderAssignedContacts(); // Update icons below input
    }

    /**
     * Filters contacts in the dropdown based on search input.
     * @param {Event} event - The input event.
     */
    assignSearchInput(event) {
        // Dependency: contacts (global or passed), HtmlAddTask class instance
        const searchTerm = event.target.value.toLowerCase();
        const dropdown = document.getElementById('assignDropdown');
        dropdown.innerHTML = '';
        // const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(searchTerm));
        // filteredContacts.sort((a, b) => a.name.localeCompare(b.name));
        // filteredContacts.forEach(contact => {
        //     dropdown.innerHTML += htmlRenderContactsAssign(contact); // Use HtmlAddTask method
        // });
        // Re-add listeners // Listener logic
    }

    /**
     * Handles checking/unchecking a contact for assignment.
     * @param {Event} event - The change event from the checkbox.
     */
    contactAssign(event) {
        // Dependency: contacts (global or passed)
        const checkbox = event.target;
        const contactId = checkbox.dataset.id;
        // const contact = contacts.find(c => c.id == contactId);
        // if (checkbox.checked) {
        //     if (!this.assignedContacts.some(c => c.id == contactId)) {
        //         this.assignedContacts.push(contact);
        //     }
        // } else {
        //     this.assignedContacts = this.assignedContacts.filter(c => c.id != contactId);
        // }
        // Update checkbox style // DOM manipulation
        this.renderAssignedContacts();
    }

    /**
     * Renders the icons of assigned contacts below the input field.
     */
    renderAssignedContacts() {
        // Dependency: HtmlAddTask class instance
        const container = document.getElementById('addAssignedContacts');
        container.innerHTML = '';
        // this.assignedContacts.forEach(contact => {
        //     container.innerHTML += contact.profilePic; // Assuming profilePic HTML is in contact object
        // });
    }

    // --- Category Logic ---

    /**
     * Toggles the category dropdown menu open or closed.
     */
    toggleCategoryDropdown() {
        const dropdown = document.getElementById('categoryDropdown');
        const input = document.getElementById('addCategory');
        const arrow = document.getElementById('categoryArrow');

        if (this.isCategoryDropdownOpen) {
            dropdown.classList.add('d-none');
            input.classList.remove('inputFieldFocus');
            arrow.classList.remove('rotateArrow');
            this.isCategoryDropdownOpen = false;
            // deactivateOutsideCheck(); // Listener logic
        } else {
            dropdown.classList.remove('d-none');
            input.classList.add('inputFieldFocus');
            arrow.classList.add('rotateArrow');
            this.isCategoryDropdownOpen = true;
            // activateOutsideCheck('categoryDropdownContainer', this.toggleCategoryDropdown.bind(this)); // Listener logic
        }
    }

    /**
     * Selects a category from the dropdown.
     * @param {string} category - The selected category text.
     */
    selectCategory(category) {
        document.getElementById('addCategory').value = category;
        this.toggleCategoryDropdown(); // Close dropdown after selection
    }

    // --- Priority Logic ---

    /**
     * Sets the current task priority.
     * @param {string} prio - The priority level ('urgent', 'medium', 'low').
     * @param {Event} event - The click event.
     */
    setPrio(prio, event) {
        this.currentPrio = prio;
        this.updatePrioActiveBtn();
    }

    /**
     * Updates the visual styling of the priority buttons.
     */
    updatePrioActiveBtn() {
        document.querySelectorAll('.addTaskPrioBtn').forEach(btn => {
            btn.classList.remove('addTaskPrioActiveUrgent', 'addTaskPrioActiveMedium', 'addTaskPrioActiveLow');
            const img = btn.querySelector('img');
            if (btn.id === `prio${this.currentPrio.charAt(0).toUpperCase() + this.currentPrio.slice(1)}`) {
                btn.classList.add(`addTaskPrioActive${this.currentPrio.charAt(0).toUpperCase() + this.currentPrio.slice(1)}`);
                img.src = `../assets/icons/prio${this.currentPrio.charAt(0).toUpperCase() + this.currentPrio.slice(1)}White.svg`;
            } else {
                const originalPrio = btn.id.replace('prio', ''); // Urgent, Medium, Low
                img.src = `../assets/icons/prio${originalPrio}.svg`;
            }
        });
    }

    // --- Subtask Logic ---

    /**
     * Switches the subtask input field view to show add/close icons.
     */
    addNewSubtask() {
        document.getElementById('subtaskInputDefaultIcons').classList.add('d-none');
        document.getElementById('subtaskInputActiveIcons').classList.remove('d-none');
        document.getElementById('addSubtask').focus();
    }

    /**
     * Clears the subtask input field and resets its icon view.
     */
    clearSubtaskInput() {
        document.getElementById('addSubtask').value = '';
        document.getElementById('subtaskInputDefaultIcons').classList.remove('d-none');
        document.getElementById('subtaskInputActiveIcons').classList.add('d-none');
    }

    /**
     * Saves the current subtask input to the temporary list.
     */
    saveSubtask() {
        const input = document.getElementById('addSubtask');
        const subtaskText = input.value.trim();
        if (subtaskText) {
            this.addedSubtasks.push({ text: subtaskText, status: 'todo' }); // Assuming 'todo' is the default status
            this.renderSubtasks();
            this.clearSubtaskInput();
            // activateSubtaskListeners(); // Listener logic
        }
    }

    /**
     * Renders the list of temporarily added subtasks.
     */
    renderSubtasks() {
        // Dependency: HtmlSubtask class instance
        const list = document.getElementById('addedSubtasksList');
        list.innerHTML = '';
        // const htmlSubtask = new HtmlSubtask(); // Or get instance
        // this.addedSubtasks.forEach((subtask, index) => {
        //     list.innerHTML += htmlSubtask.generateSaveSubtaskHTML(subtask.text, index);
        // });
    }

    /**
     * Deletes a subtask from the temporary list.
     * @param {number} index - The index of the subtask to delete.
     */
    deleteSubtask(index) {
        this.addedSubtasks.splice(index, 1);
        this.renderSubtasks();
        // If no subtasks left, maybe deactivate listeners // Listener logic
    }

    /**
     * Enables the editing view for a specific subtask in the list.
     * @param {number} index - The index of the subtask to edit.
     */
    editSubtask(index) {
        document.getElementById(`subtaskListId${index}`).classList.add('editSubtask');
        document.getElementById(`subtaskEditContainer${index}`).classList.remove('d-none');
        document.getElementById(`subtaskEditInput${index}`).focus();
    }

    /**
     * Saves the edited text for a subtask in the temporary list.
     * @param {number} index - The index of the subtask being edited.
     */
    saveEditedSubtask(index) {
        const input = document.getElementById(`subtaskEditInput${index}`);
        const newText = input.value.trim();
        if (newText) {
            this.addedSubtasks[index].text = newText;
            this.renderSubtasks(); // Re-render to show updated text and hide edit field
        }
        // No need to explicitly hide edit field if renderSubtasks redraws everything
    }

    /**
     * Handles the Enter key press in the subtask input field to save the subtask.
     * @param {KeyboardEvent} event - The keydown event.
     */
    handleKeyDown(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission if inside a form
            this.saveSubtask();
        }
    }

    // --- Form Handling & Saving ---

    /**
     * Validates the add task form fields.
     * @returns {boolean} True if the form is valid, false otherwise.
     */
    formValidation() {
        // Dependency: DOM element access
        let isValid = true;
        const title = document.getElementById('addTitle');
        const date = document.getElementById('addDate');
        const category = document.getElementById('addCategory');

        // Simple validation example (add more specific checks as needed)
        if (!title.value.trim()) {
            // Show error message for title
            isValid = false;
        }
        if (!date.value) {
            // Show error message for date
            isValid = false;
        }
        if (!category.value.trim()) {
            // Show error message for category
            isValid = false;
        }
        // Add validation for other fields if necessary

        return isValid;
    }

    /**
     * Gathers task data from the form and saves it as a new task.
     * @param {string} status - The initial status for the new task (e.g., 'todo').
     */
    async pushNewTask(status = 'todo') {
        // Dependency: DOM element access, postDataToDatabase, setTasks, closeModal?
        if (!this.formValidation()) {
            console.error("Form validation failed");
            // Optionally show user feedback
            return;
        }

        const taskData = {
            title: document.getElementById('addTitle').value,
            description: document.getElementById('addDescription').value,
            assignedTo: this.assignedContacts, // Already stored in the instance property
            date: document.getElementById('addDate').value,
            prio: this.currentPrio, // Already stored in the instance property
            category: document.getElementById('addCategory').value,
            subtasks: this.addedSubtasks, // Already stored in the instance property
            status: status
        };

        try {
            // toggleLoader(true); // Dependency
            // const newTask = await postDataToDatabase(`${BASE_URL}tasks.json?auth=${token}`, taskData); // Dependency
            // await setTasks(); // Dependency: Refresh global task list
            // toggleLoader(false); // Dependency
            this.clearAddTaskForm();
            // closeModal('addTaskOverlay'); // Dependency
            // Optionally show success message and redirect or update board
            // changeActive('board'); // Dependency
        } catch (error) {
            console.error("Error pushing new task:", error);
            // toggleLoader(false); // Dependency
            // Show error message to user
        }
    }

    /**
     * Clears all input fields, resets state variables, and updates UI elements.
     */
    clearAddTaskForm() {
        // Dependency: DOM element access
        document.getElementById('addTitle').value = '';
        document.getElementById('addDescription').value = '';
        document.getElementById('addAssigned').value = ''; // Assuming this is just a trigger, not data holder
        document.getElementById('addDate').value = '';
        document.getElementById('addCategory').value = '';
        document.getElementById('addSubtask').value = '';

        this.assignedContacts = [];
        this.addedSubtasks = [];
        this.currentPrio = 'medium'; // Reset to default
        this.currentTaskToEditId = null;

        this.renderAssignedContacts();
        this.renderSubtasks();
        this.updatePrioActiveBtn();
        this.clearSubtaskInput(); // Reset subtask input icons
        if (this.isAssignDropdownOpen) this.closeAssignDropdown();
        if (this.isCategoryDropdownOpen) this.toggleCategoryDropdown(); // Close category dropdown

        // Clear any validation error messages
        // ...
    }

    // --- Task Editing Logic ---

    /**
     * Prepares the Add Task form/overlay for editing an existing task.
     * @param {string} taskId - The ID of the task to edit.
     */
    enableTaskEdit(taskId) {
        // Dependency: tasks (global or passed), DOM element access
        // const task = tasks.find(t => t.id === taskId);
        // if (!task) return;

        this.currentTaskToEditId = taskId; // Set editing mode

        // Populate form fields
        document.getElementById('addTitle').value = task.title;
        document.getElementById('addDescription').value = task.description;
        document.getElementById('addDate').value = task.date;
        document.getElementById('addCategory').value = task.category; // Assuming category is just text

        // Populate assigned contacts
        this.assignedContacts = task.assignedTo ? [...task.assignedTo] : []; // Create a copy
        this.renderAssignedContacts();
        // Need to update the state of checkboxes in the dropdown if it's opened later

        // Populate priority
        this.currentPrio = task.prio;
        this.updatePrioActiveBtn();

        // Populate subtasks
        this.addedSubtasks = task.subtasks ? task.subtasks.map(st => ({ ...st })) : []; // Create copies
        this.renderSubtasks();

        // Show the form/overlay if it's hidden
        // Change submit button text/handler to point to saveEditedTask
        const submitButton = document.getElementById('createTaskBtn'); // Or equivalent
        if (submitButton) {
            submitButton.textContent = 'Save Task';
            // Update onclick or remove old listener and add new one // Listener logic
        }
        // Hide the original task overlay if editing happens in a separate modal
        // document.getElementById('boardTaskOverlay').classList.add('d-none'); // Example
    }

    /**
     * Saves the changes made to an existing task.
     */
    async saveEditedTask() {
        // Dependency: DOM element access, updateDataInDatabase, setTasks, closeModal?
        if (!this.currentTaskToEditId) {
            console.error("No task ID specified for editing.");
            return;
        }
        if (!this.formValidation()) {
            console.error("Form validation failed during edit.");
            return;
        }

        const updatedTaskData = {
            title: document.getElementById('addTitle').value,
            description: document.getElementById('addDescription').value,
            assignedTo: this.assignedContacts,
            date: document.getElementById('addDate').value,
            prio: this.currentPrio,
            category: document.getElementById('addCategory').value,
            subtasks: this.addedSubtasks,
            // status: Keep the original status, it's not edited here
        };

        try {
            // toggleLoader(true); // Dependency
            // await updateDataInDatabase(`${BASE_URL}tasks/${this.currentTaskToEditId}.json?auth=${token}`, updatedTaskData); // Dependency
            // await setTasks(); // Dependency: Refresh global task list
            // toggleLoader(false); // Dependency
            this.clearAddTaskForm(); // Reset form after saving
            // closeModal('addTaskOverlay'); // Close the edit overlay/modal // Dependency
            // updateBoard(); // Refresh the board UI // Dependency
        } catch (error) {
            console.error("Error saving edited task:", error);
            // toggleLoader(false); // Dependency
            // Show error message
        }
    }
}