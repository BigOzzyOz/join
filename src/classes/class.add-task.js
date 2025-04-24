import { AddTaskHtml } from "./html/class.html-add-task.js";
import { Subtask } from "./class.subtask.js";
import { Task } from "./class.task.js";

/**
 * Represents the Add Task functionality, managing the creation and editing of tasks.
 */
export class AddTask {
    //NOTE Properties

    /** @type {import('./class.kanban.js').Kanban} Reference to the main Kanban instance. */
    kanban;
    /** @type {import('./class.contact.js').Contact[]} Array of contacts assigned to the current task. */
    assignedContacts = [];
    /** @type {string} The currently selected priority for the task ('urgent', 'medium', 'low'). */
    currentPrio = 'medium';
    /** @type {AddTaskHtml} Instance for handling HTML generation related to adding tasks. */
    html;

    /**
     * Creates an instance of AddTask.
     * @param {import('./class.kanban.js').Kanban} kanban - The main Kanban instance.
     */
    constructor(kanban) {
        this.kanban = kanban;
        this.assignedContacts = [];
        this.currentPrio = 'medium';
        this.html = new AddTaskHtml(kanban);
    }

    //NOTE Assign/Dropdown/Contact Methods

    /**
     * Toggles the visibility of the assign contacts dropdown menu.
     * Opens or closes the dropdown based on its current state.
     * @async
     * @returns {void}
     */
    toggleDropdown = async () => {
        document.getElementById('assignDropdown').classList.toggle('open');
        document.getElementById('assignSearch').classList.contains('contactsAssignStandard') ? await this.openAssignDropdown() : this.closeAssignDropdown();
        this.kanban.toggleClass('assignSearch', 'contactsAssignStandard', 'contactsAssignOpen');
    };

    /**
     * Opens the assign contacts dropdown, populates it with sorted contacts,
     * and sets up necessary event listeners.
     * @async
     * @returns {void}
     */
    async openAssignDropdown() {
        const searchInput = document.getElementById('assignSearch');
        const contactsContainer = document.getElementById('contactsToAssign');
        const contactsSorted = [...this.kanban.contacts].sort((a, b) => a.name.localeCompare(b.name));
        contactsContainer.innerHTML = contactsSorted.map(c => c.html.htmlRenderContactsAssign(this.assignedContacts)).join('');
        document.getElementById('assignDropArrow').style.transform = 'rotate(180deg)';
        searchInput.value = '';
        searchInput.removeAttribute('readonly');
        this.kanban.activateListenerAddTask('openAssignDropdown');
    }

    /**
     * Closes the assign contacts dropdown, clears its content,
     * and resets the search input.
     * @returns {void}
     */
    closeAssignDropdown() {
        let searchInput = document.getElementById('assignSearch');
        let contactsContainer = document.getElementById('contactsToAssign');
        contactsContainer.innerHTML = '';
        document.getElementById('assignDropArrow').style.transform = 'rotate(0deg)';
        searchInput.value = 'Select contacts to assign';
        searchInput.setAttribute('readonly', true);
        this.kanban.deactivateListenerAddTask('closeAssignDropdown');
    };

    /**
     * Toggles the visibility of the category selection dropdown.
     * @param {string} value - The value to set in the input field when closing the dropdown.
     * @returns {void}
     */
    toggleCategoryDropdown(value) {
        let input = document.getElementById('categoryInput');
        let wrapper = document.getElementById('selectWrapper');
        let arrow = document.getElementById('categoryDropArrow');
        input.value = wrapper.classList.contains('select-wrapperOpen') ? value : '';
        document.getElementById('selectWrapper').classList.toggle('select-wrapperOpen');
        wrapper.classList.contains('select-wrapperOpen') ? arrow.style.transform = 'rotate(180deg)' : arrow.style.transform = 'rotate(0deg)';
    }

    /**
     * Gets the value of an HTML element by its ID.
     * @param {string} id - The ID of the HTML element.
     * @returns {string} The value of the element.
     */
    getId(id) {
        return document.getElementById(id).value;
    }

    /**
     * Sets the array of assigned contacts.
     * @param {import('./class.contact.js').Contact[]} contactsArray - The array of contacts to assign.
     * @returns {void}
     */
    setAssignedContacts(contactsArray) {
        this.assignedContacts = contactsArray;
    }

    /**
     * Checks if a click event occurred outside the assign dropdown menu
     * and closes the dropdown if it did.
     * @param {Event} event - The click event object.
     * @returns {void}
     */
    checkOutsideAssign = ({ target }) => {
        let assignMenu = document.getElementById('assignDropdown');
        if (assignMenu.classList.contains('open') && !assignMenu.contains(target)) {
            this.toggleDropdown();
        };
    };

    /**
     * Filters the contacts displayed in the assign dropdown based on the search input.
     * @returns {void}
     */
    assignSearchInput = () => {
        const searchInput = document.getElementById('assignSearch');
        const contactsContainer = document.getElementById('contactsToAssign');
        const searchText = searchInput.value.toLowerCase();
        const contactsSorted = [...this.kanban.contacts].sort((a, b) => a.name.localeCompare(b.name));
        const filteredContacts = contactsSorted.filter(c => c.name.toLowerCase().includes(searchText));
        contactsContainer.innerHTML = filteredContacts.map(c => c.html.htmlRenderContactsAssign(this.assignedContacts)).join('');
    };

    /**
     * Assigns or unassigns a contact based on the provided ID.
     * Toggles the visual selection state and updates the assigned contacts array.
     * @param {number} id - The ID of the contact to assign/unassign.
     * @returns {void}
     */
    contactAssign(id) {
        const index = this.assignedContacts.findIndex(c => c.id === id);
        const inAssignedContacts = index > -1;
        const contactLabel = document.getElementById(`contact${id}`).parentElement;
        contactLabel.classList.toggle('contactsToAssignCheck', !inAssignedContacts);
        if (inAssignedContacts) this.assignedContacts.splice(index, 1);
        else this.assignedContacts.push(this.kanban.contacts.find(c => c.id === id));
        this.renderAssignedContacts();
    }

    /**
     * Renders the profile pictures of the assigned contacts below the dropdown.
     * Shows a maximum of 5 profile pictures and indicates if more are assigned.
     * @returns {void}
     */
    renderAssignedContacts() {
        let assignedContactsContainer = document.getElementById('contactsAssigned');
        assignedContactsContainer.innerHTML = '';
        for (let i = 0; i < this.assignedContacts.length; i++) {
            const contact = this.assignedContacts[i];
            if (i <= 5) {
                assignedContactsContainer.innerHTML += contact.profilePic;
            } else {
                assignedContactsContainer.innerHTML += this.html.svgProfilePic('#2a3748', `+${this.assignedContacts.length - 5}`);
                break;
            }
        }
    }

    //NOTE Subtask Methods

    /**
     * Handles input events in the subtask input field.
     * Shows/hides the save/clear icons based on input length.
     * Listens for the Enter key to save the subtask.
     * @param {KeyboardEvent} event - The keyboard event object.
     * @returns {void}
     */
    addNewSubtask = (event) => {
        this.handleKeyDown(event);
        const input = document.getElementById('subtaskInput').value.length;
        if (input > -1) {
            document.getElementById('subtaskIconContainer').classList.remove('dNone');
            document.getElementById('subtaskPlusIcon').classList.add('dNone');
        } else {
            document.getElementById('subtaskIconContainer').classList.add('dNone');
            document.getElementById('subtaskPlusIcon').classList.remove('dNone');
        }
    };

    /**
     * Clears the subtask input field.
     * @returns {void}
     */
    clearSubtaskInput = () => {
        document.getElementById('subtaskInput').value = '';
    };

    /**
     * Handles the 'Enter' key press in the subtask input field to save the subtask.
     * @param {KeyboardEvent} event - The keyboard event object.
     * @returns {void}
     */
    handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.saveSubtask();
        }
    };

    /**
     * Saves a new subtask entered in the input field.
     * Creates a Subtask object, generates its HTML, and appends it to the list.
     * Clears the input field and resets icons afterwards.
     * @returns {void}
     */
    saveSubtask = () => {
        let subtaskList = document.getElementById('subtaskList');
        let inputText = document.getElementById('subtaskInput').value.trim();
        if (inputText === '') { return; }
        let index = subtaskList.children.length;
        let subtask = new Subtask({ 'text': inputText, 'status': 'unchecked' });
        let subtaskHTML = subtask.html.generateSaveSubtaskHTML(index);
        let subtaskItem = document.createElement('div');
        subtaskItem.innerHTML = subtaskHTML;
        subtaskList.appendChild(subtaskItem.firstElementChild);
        document.getElementById('subtaskInput').value = '';
        document.getElementById('subtaskIconContainer').classList.add('dNone');
        document.getElementById('subtaskPlusIcon').classList.remove('dNone');
        this.kanban.deactivateListenerAddTask('subtask');
        this.kanban.activateListenerAddTask('subtask');
    };

    /**
     * Enables editing mode for a specific subtask.
     * Hides the subtask text and shows an input field for editing.
     * @param {HTMLElement} editIcon - The edit icon element that was clicked.
     * @returns {void}
     */
    editSubtask(editIcon) {
        let subtaskItem = editIcon.closest('.subtaskEditList');
        let subtaskText = subtaskItem.querySelector('.subtaskItemText');
        let editInput = subtaskItem.querySelector('.editSubtaskInput');
        subtaskText.classList.add('dNone');
        editInput.classList.remove('dNone');
        editInput.focus();
        editInput.addEventListener('blur', () => { this.saveEditedSubtask(subtaskText, editInput); });
        this.kanban.deactivateListenerAddTask('subtask');
        this.kanban.activateListenerAddTask('subtask');
    }

    /**
     * Saves the edited subtask text when the input field loses focus.
     * Updates the subtask text element and hides the input field.
     * @param {HTMLElement} subtaskText - The element displaying the subtask text.
     * @param {HTMLInputElement} editInput - The input field used for editing.
     * @returns {void}
     */
    saveEditedSubtask = (subtaskText, editInput) => {
        subtaskText.textContent = editInput.value.trim();
        subtaskText.classList.remove('dNone');
        editInput.classList.add('dNone');
    };

    /**
     * Deletes a subtask from the list.
     * @param {HTMLElement} deleteIcon - The delete icon element that was clicked.
     * @returns {void}
     */
    deleteSubtask(deleteIcon) {
        let subtaskItem = deleteIcon.closest('.subtaskEditList');
        subtaskItem.remove();
        this.kanban.deactivateListenerAddTask('subtask');
        this.kanban.activateListenerAddTask('subtask');
    }

    /**
     * Clears all subtasks from the subtask list in the UI.
     * @returns {void}
     */
    clearSubtaskList() {
        document.getElementById('subtaskList').innerHTML = '';
    }

    /**
     * Retrieves all subtasks currently listed in the UI.
     * @returns {Array<Object>} An array of subtask objects with 'status' and 'text' properties.
     */
    getSubtasks() {
        const subtaskItems = document.querySelectorAll('.subtaskList .subtaskItemText');
        let subtasks = [];
        subtaskItems.forEach(item => { subtasks.push({ status: "unchecked", text: item.innerText }); });
        return subtasks;
    }

    //NOTE Task Creation & Edit Methods

    /**
     * Creates a new task object from the form data, posts it to the database,
     * adds it to the local Kanban tasks array, and closes the add task modal/view.
     * @async
     * @returns {void}
     */
    async pushNewTask() {
        let data = this.createNewTask();
        let newTask = new Task(data);
        await this.kanban.db.post("api/tasks/", newTask.toTaskUploadObject());
        this.kanban.tasks.push(newTask);
        this.kanban.setTasks(this.kanban.tasks);
        this.closeAddTaskModal();
    }

    /**
     * Gathers data from the add task form fields and creates a task data object.
     * @returns {Object} An object containing all the data for the new task.
     */
    createNewTask() {
        return {
            title: this.getId('taskTitle'),
            description: this.getId('taskDescription'),
            date: this.getId('dateInput'),
            prio: this.currentPrio,
            status: sessionStorage.getItem('taskCategory'),
            subtasks: this.getSubtasks(),
            assignedTo: this.assignedContacts,
            category: document.getElementById('categoryInput').value,
        };
    }


    //NOTE Validation Methods

    /**
     * Validates the required input fields in the add task form.
     * Displays validation messages and styles invalid inputs.
     * Attaches real-time validation listeners if not already present.
     * @returns {boolean} True if the form is valid, false otherwise.
     */
    formValidation = () => {
        const inputs = document.querySelectorAll('.singleInputContainer input[required]');
        let isFormValid = true;
        inputs.forEach(input => {
            const validationText = input.nextElementSibling;
            const isEmpty = input.value.trim() === '';
            this.updateValidationState(input, validationText, isEmpty);
            isFormValid = isEmpty ? false : true;
            this._attachValidationListener(input, validationText); // Attach listener
        });
        return isFormValid;
    };

    /**
     * Updates the validation state (styles and message visibility) for an input field.
     * @param {HTMLInputElement} input - The input element.
     * @param {HTMLElement} validationText - The validation message element.
     * @param {boolean} showError - True to show validation error, false to hide.
     * @returns {void}
     */
    updateValidationState(input, validationText, showError) {
        if (validationText) {
            validationText.style.display = showError ? 'block' : 'none';
        }
        input.classList.toggle('formValidationInputBorder', showError);
    }

    /**
     * Attaches a real-time validation listener to an input field if not already attached.
     * @private
     * @param {HTMLInputElement} input - The input element to attach the listener to.
     * @param {HTMLElement} validationText - The corresponding validation message element.
     * @returns {void}
     */
    _attachValidationListener(input, validationText) {
        if (!input.dataset.validationListenerAttached) {
            input.addEventListener('input', () => {
                const isCurrentlyEmpty = input.value.trim() === '';
                this.updateValidationState(input, validationText, isCurrentlyEmpty);
            });
            input.dataset.validationListenerAttached = 'true'; // Mark listener as attached
        }
    }

    /**
     * Removes validation error styles and messages from required inputs.
     * @private
     * @returns {void}
     */
    _clearValidationStyles() {
        const validatedInputs = document.querySelectorAll('.formValidationInputBorder');
        validatedInputs.forEach(input => {
            input.classList.remove('formValidationInputBorder');
            const validationText = input.nextElementSibling;
            if (validationText && validationText.style.display === 'block') validationText.style.display = 'none';
        });
    }

    //NOTE UI/Modal/Animation Methods

    /**
     * Closes the add task modal or navigates away from the add task page
     * after showing a confirmation animation.
     * @returns {void}
     */
    closeAddTaskModal() {
        if (this.kanban.activeTab == 'add task') {
            this.showTaskAddedAnimation();
            this.kanban.setActive('.menuBtn[href="../html/board.html"]');
            sessionStorage.removeItem('tasks');
        } else {
            this.showTaskAddedAnimation();
            setTimeout(() => this.kanban.activateListenersBoard('dragDrop'), 2000);
        }
    }

    /**
     * Shows the "Task Added" animation.
     * If on the addtask.html page, redirects to board.html after the animation.
     * Otherwise, calls the modal-specific animation function.
     * @returns {void}
     */
    showTaskAddedAnimation() {
        if (window.location.href.endsWith('addtask.html')) {
            this.kanban.toggleClass('taskAddedBtn', 'd-None', 'show');
            setTimeout(() => {
                return window.location.href = "../html/board.html";
            }, 2000);
        } else this.showTaskAddedAnimationModal();
    }

    /**
     * Shows the "Task Added" animation specifically for the modal context.
     * Closes the modal after the animation completes.
     * @returns {void}
     */
    showTaskAddedAnimationModal() {
        this.kanban.toggleClass('taskAddedBtn', 'd-None', 'show');
        setTimeout(() => { this.kanban.board.closeModal(); }, 2000);
    }

    /**
     * Clears all input fields, resets priority selection, subtasks, assigned contacts,
     * category dropdown, and validation styles in the add task form.
     * @returns {void}
     */
    clearAddTaskForm = () => {
        this._clearInputFields();
        this.updatePrioActiveBtn('medium');
        this.clearSubtaskList();
        this.assignedContacts = [];
        this.renderAssignedContacts();
        this._resetCategoryDropdown();
        this._clearValidationStyles();
    };

    /**
     * Clears the main input fields of the add task form.
     * @private
     * @returns {void}
     */
    _clearInputFields() {
        const fields = ['taskTitle', 'taskDescription', 'dateInput', 'subtaskInput', 'categoryInput'];
        fields.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });
    }

    /**
     * Resets the category dropdown to its default state if it's open.
     * @private
     * @returns {void}
     */
    _resetCategoryDropdown() {
        const wrapper = document.getElementById('selectWrapper');
        const arrow = document.getElementById('categoryDropArrow');
        if (wrapper && wrapper.classList.contains('select-wrapperOpen')) {
            wrapper.classList.remove('select-wrapperOpen');
            if (arrow) arrow.style.transform = 'rotate(0deg)';
        }
    }

    //NOTE Priority Methods

    /**
     * Sets the current task priority based on the clicked priority button.
     * @param {HTMLElement} element - The priority button element that was clicked.
     * @returns {void}
     */
    setPrio(element) {
        const prio = element.getAttribute('data-prio');
        this.currentPrio = prio;
        this.updatePrioActiveBtn(prio);
    }

    /**
     * Updates the visual state of all priority buttons, highlighting the selected one.
     * Resets all buttons first, then applies active state to the selected one.
     * @param {string} prio - The priority to set as active ('urgent', 'medium', 'low', or '' to clear).
     * @returns {void}
     */
    updatePrioActiveBtn(prio) {
        const buttons = document.querySelectorAll('.prioBtn');
        buttons.forEach(button => {
            button.classList.remove('prioBtnUrgentActive', 'prioBtnMediumActive', 'prioBtnLowActive');
            const imgs = button.querySelectorAll('img');
            imgs.forEach(img => {
                if (img.src.includes('White')) img.classList.add('hidden');
                else img.classList.remove('hidden');
            });
        });
        this.changeActiveBtn(prio);
    }

    /**
     * Applies the active state styling to the specified priority button.
     * Hides the default icon and shows the white icon for the active button.
     * @param {string} prio - The priority whose button should be activated ('urgent', 'medium', 'low').
     * @returns {void}
     */
    changeActiveBtn(prio) {
        const activeButton = document.querySelector(`.prioBtn[data-prio="${prio}"]`);
        if (activeButton) {
            activeButton.classList.add(`prioBtn${this.capitalize(prio)}Active`);
            const defaultIcon = activeButton.querySelector(`img:not([src*='White'])`);
            if (defaultIcon) defaultIcon.classList.add('hidden');
            const whiteIcon = activeButton.querySelector(`img[src*='${prio}smallWhite']`);
            if (whiteIcon) whiteIcon.classList.remove('hidden');
        }
    }

    /**
     * Capitalizes the first letter of a string.
     * @param {string} str - The string to capitalize.
     * @returns {string}
     */
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    //NOTE Error Handling

    /**
     * Logs an error message.
     * @param {string} msg
     * @returns {void}
     */
    _logError(msg) { console.error(msg); }
}
