// import { assignedContacts } from "../addTask.js"; // Dependency removed from function

export class AddTaskHtml {
    /**
     * Generates HTML for assigning a single contact in the dropdown list.
     * 
     * @param {Object} contact - The contact object.
     * @param {number} contact.id - The ID of the contact.
     * @param {string} contact.name - The name of the contact.
     * @param {string} contact.profilePic - The profile picture HTML of the contact.
     * @param {boolean} isChecked - Whether the contact is currently selected/assigned.
     * @returns {string} The HTML string for the contact assignment row.
     */
    htmlRenderContactsAssign(contact, isChecked) {
        // Note: The check against assignedContacts was removed. 
        // The calling function (in AddTask) should determine the isChecked state.
        const checkedAttribute = isChecked ? 'checked' : '';
        const checkedClass = isChecked ? 'contactAssignChecked' : '';

        return /*html*/`
            <label class="contactAssign ${checkedClass}" data-id="${contact.id}">
                ${contact.profilePic} <!-- Assuming profilePic is pre-generated HTML -->
                <span>${contact.name}</span>
                <input type="checkbox" data-id="${contact.id}" ${checkedAttribute}>
                <img class="contactAssignCheckbox" src="../assets/icons/${isChecked ? 'checkboxChecked' : 'checkbox'}.svg">
            </label>
        `;
    }

    /**
     * Generates the complete HTML structure for the task editing form (which is the Add Task form).
     * 
     * @param {Object} task - The task object containing data to pre-fill the form.
     * @returns {string} The HTML string for the task edit form.
     */
    generateTaskEditHTML(task) {
        // Dependencies: HtmlSubtask instance/methods, formatDate helper
        // Note: This function generates a large block of HTML representing the Add Task form.
        // It includes inline event handlers (onclick) which should ideally be managed by AddTaskListener.
        // It also duplicates the structure likely found in add_task.html.
        // Consider refactoring to populate a static template instead of generating the whole structure.

        // const htmlSubtask = new HtmlSubtask(); // Needs instance or static methods
        let subtasksHTML = '';
        if (task.subtasks && task.subtasks.length > 0) {
            task.subtasks.forEach((subtask, index) => {
                // Assuming HtmlSubtask has a method to generate the *display* list item for editing
                // For now, using the structure from generateSaveSubtaskHTML as a placeholder
                subtasksHTML += /*html*/` 
                    <li id="subtaskListId${index}">
                        <label class="subtaskListLabel" ondblclick="editSubtask(${index})">
                            <span class="subtaskListLabelText">${subtask.text}</span>
                        </label>
                        <div class="subtaskListIcons">
                            <img class="subtaskListIcon" onclick="editSubtask(${index})" src="../assets/icons/editDark.svg">
                            <div class="subtaskListSeperator"></div>
                            <img class="subtaskListIcon" onclick="deleteSubtask(${index})" src="../assets/icons/delete.svg">
                        </div>
                        <div class="subtaskEditContainer d-none" id="subtaskEditContainer${index}">
                            <input class="subtaskEditInput" id="subtaskEditInput${index}" type="text" value="${subtask.text}">
                            <div class="subtaskEditIcons">
                                <img class="subtaskEditIcon" onclick="deleteSubtask(${index})" src="../assets/icons/delete.svg">
                                <div class="subtaskEditSeperator"></div>
                                <img class="subtaskEditIcon" onclick="saveEditedSubtask(${index})" src="../assets/icons/checkDark.svg">
                            </div>
                        </div>
                    </li>
                 `;
            });
        }

        // Assigned contacts rendering needs logic similar to AddTask.renderAssignedContacts
        let assignedContactsHTML = '';
        if (task.assignedTo && task.assignedTo.length > 0) {
            task.assignedTo.forEach(contact => {
                assignedContactsHTML += contact.profilePic; // Assuming profilePic HTML is available
            });
        }

        // Priority button states need logic similar to AddTask.updatePrioActiveBtn
        const isUrgent = task.prio === 'urgent';
        const isMedium = task.prio === 'medium';
        const isLow = task.prio === 'low';

        return /*html*/`
            <img class="closeBtn" onclick="closeModal()" src="../assets/icons/close.svg">
            <div class="addTaskForm">
                <div class="addTaskInputContainer">
                    <label for="addTitle">Title</label>
                    <input type="text" id="addTitle" placeholder="Enter a title" required value="${task.title}">
                </div>
                <div class="addTaskInputContainer">
                    <label for="addDescription">Description</label>
                    <textarea id="addDescription" placeholder="Enter a Description" required>${task.description}</textarea>
                </div>
                <div class="addTaskInputContainer" id="assignDropdownContainer">
                    <label for="addAssigned">Assigned to</label>
                    <input class="inputField" type="text" id="addAssigned" placeholder="Select contacts to assign" readonly onclick="toggleDropdown()"> <!-- Listener needed -->
                    <img class="inputArrow" id="assignArrow" src="../assets/icons/arrowDropdownDown.svg" onclick="toggleDropdown()"> <!-- Listener needed -->
                    <div class="assignDropdown d-none" id="assignDropdown">
                        <!-- Contacts will be rendered here by AddTask.openAssignDropdown using htmlRenderContactsAssign -->
                    </div>
                    <div class="addAssignedContacts" id="addAssignedContacts">
                        ${assignedContactsHTML} <!-- Render initially assigned contacts -->
                    </div>
                </div>
                <div class="addTaskInputContainer">
                    <label for="addDate">Due date</label>
                    <input type="date" id="addDate" required value="${task.date}">
                </div>
                <div class="addTaskInputContainer">
                    <label>Prio</label>
                    <div class="addTaskPrio">
                        <button class="addTaskPrioBtn ${isUrgent ? 'addTaskPrioActiveUrgent' : ''}" id="prioUrgent" onclick="setPrio('urgent', event)"> <!-- Listener needed -->
                            Urgent <img src="../assets/icons/prioUrgent${isUrgent ? 'White' : ''}.svg">
                        </button>
                        <button class="addTaskPrioBtn ${isMedium ? 'addTaskPrioActiveMedium' : ''}" id="prioMedium" onclick="setPrio('medium', event)"> <!-- Listener needed -->
                            Medium <img src="../assets/icons/prioMedium${isMedium ? 'White' : ''}.svg">
                        </button>
                        <button class="addTaskPrioBtn ${isLow ? 'addTaskPrioActiveLow' : ''}" id="prioLow" onclick="setPrio('low', event)"> <!-- Listener needed -->
                            Low <img src="../assets/icons/prioLow${isLow ? 'White' : ''}.svg">
                        </button>
                    </div>
                </div>
                <div class="addTaskInputContainer" id="categoryDropdownContainer">
                    <label for="addCategory">Category</label>
                    <input class="inputField" type="text" id="addCategory" placeholder="Select task category" required readonly onclick="toggleCategoryDropdown()" value="${task.category}"> <!-- Listener needed -->
                    <img class="inputArrow" id="categoryArrow" src="../assets/icons/arrowDropdownDown.svg" onclick="toggleCategoryDropdown()"> <!-- Listener needed -->
                    <div class="categoryDropdown d-none" id="categoryDropdown">
                        <li onclick="selectCategory('Technical Task')">Technical Task</li> <!-- Listener needed -->
                        <li onclick="selectCategory('User Story')">User Story</li> <!-- Listener needed -->
                    </div>
                </div>
                <div class="addTaskInputContainer">
                    <label for="addSubtask">Subtasks</label>
                    <div class="inputSubtaskContainer">
                        <input type="text" id="addSubtask" placeholder="Add new subtask" onkeydown="handleKeyDown(event)"> <!-- Listener needed -->
                        <div class="subtaskInputIcons" id="subtaskInputDefaultIcons">
                            <img class="subtaskInputIcon" id="subtaskAddIcon" src="../assets/icons/plus.svg" onclick="addNewSubtask()"> <!-- Listener needed -->
                        </div>
                        <div class="subtaskInputIcons d-none" id="subtaskInputActiveIcons">
                            <img class="subtaskInputIcon" id="subtaskClearIcon" src="../assets/icons/close.svg" onclick="clearSubtaskInput()"> <!-- Listener needed -->
                            <div class="subtaskInputSeperator"></div>
                            <img class="subtaskInputIcon" id="subtaskSaveIcon" src="../assets/icons/checkDark.svg" onclick="saveSubtask()"> <!-- Listener needed -->
                        </div>
                    </div>
                    <ul class="addedSubtasksList" id="addedSubtasksList">
                        ${subtasksHTML} <!-- Render initially added subtasks -->
                    </ul>
                </div>
            </div>
            <div class="addTaskBtnContainerEdit"> <!-- Changed container class/id for edit mode? -->
                 <button class="btn" id="saveTaskBtn" onclick="saveEditedTask()"> <!-- Listener needed -->
                    Ok <img src="../assets/icons/checkIconWhite.svg">
                </button>
            </div>
        `;
    }
}

// Helper function (if needed, e.g., formatDate - consider moving to utils)
// function formatDate(dateString) { ... } 