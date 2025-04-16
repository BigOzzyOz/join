class HtmlTask {
    /**
     * Generates the HTML for a todo item (task card on the board).
     * 
     * @param {Object} element - The todo item object.
     * @param {string} element.id - The ID of the todo item.
     * @param {string} element.category - The category of the todo item.
     * @param {string} element.title - The title of the todo item.
     * @param {string} element.description - The description of the todo item.
     * @param {Array} element.subtasks - The subtasks of the todo item.
     * @param {Array} element.assignedTo - The assigned users to the todo item.
     * @param {string} element.prio - The priority of the todo item.
     * @returns {string} The generated HTML string for the todo item.
     */
    generateTodoHTML(element) {
        // Dependency: generateCategoryHTML, generateTitleHTML, generateDescriptionHTML, 
        //             generateSubtasksHTML, generateAssignedToHTML, generatePrioHTML (now methods of this class)
        return /*html*/`
        <div draggable="true" ondragstart="startDragging('${element.id}')" ondragend="dragEnd()" onclick="openOverlay('${element.id}')" class="boardTask" id="${element.id}">
            ${this.generateCategoryHTML(element.category)}
            ${this.generateTitleHTML(element.title)}
            ${this.generateDescriptionHTML(element.description)}
            ${this.generateSubtasksHTML(element.subtasks, element.id)}
            <div class="boardTaskFooter">
                ${this.generateAssignedToHTML(element.assignedTo)}
                ${this.generatePrioHTML(element.prio)}
            </div>
        </div>
        `;
    }

    /**
     * Generates the HTML for the category badge.
     * 
     * @param {string} category - The category of the todo item.
     * @returns {string} The generated HTML string for the category badge.
     */
    generateCategoryHTML(category) {
        const categoryClass = category.toLowerCase().replace(/\s+/g, '-'); // Example: "User Story" -> "user-story"
        return /*html*/`
            <div class="boardTaskHeadline boardTaskHeadline-${categoryClass}">${category}</div>
        `;
    }

    /**
     * Generates the HTML for the title of the todo item.
     * 
     * @param {string} title - The title of the todo item.
     * @returns {string} The generated HTML string for the title.
     */
    generateTitleHTML(title) {
        return /*html*/`
            <h4>${title}</h4>
        `;
    }

    /**
     * Generates the HTML for the description of the todo item.
     * 
     * @param {string} description - The description of the todo item.
     * @returns {string} The generated HTML string for the description.
     */
    generateDescriptionHTML(description) {
        return /*html*/`
            <span class="boardTaskDescription">${description}</span>
        `;
    }

    /**
     * Generates the HTML for the subtasks progress bar of the todo item.
     * 
     * @param {Array} subtasks - The subtasks of the todo item.
     * @param {string} id - The ID of the todo item.
     * @returns {string} The generated HTML string for the subtasks progress bar.
     */
    generateSubtasksHTML(subtasks, id) {
        if (!subtasks || subtasks.length === 0) {
            return ''; // Return empty string if no subtasks
        }
        let checkedSubtasks = subtasks.filter(task => task.status === 'checked').length;
        let progress = (checkedSubtasks / subtasks.length) * 100;
        return /*html*/`
            <div class="boardTaskSubtasks">
                <div class="boardTaskSubtasksProgressBar">
                    <div class="boardTaskSubtasksProgress" id="subtaskProgress-${id}" style="width: ${progress}%"></div>
                </div>
                <span>${checkedSubtasks}/${subtasks.length} Subtasks</span>
            </div>
        `;
    }

    /**
     * Generates the HTML for the assigned users of the todo item.
     * 
     * @param {Array} assignedTo - The assigned users to the todo item.
     * @returns {string} The generated HTML string for the assigned users.
     */
    generateAssignedToHTML(assignedTo) {
        // Dependency: ContactHtml class (or similar logic for profile pics)
        // NOTE: This assumes assignedTo contains objects with profilePic property.
        //       Might need adjustment based on actual data structure or ContactHtml class usage.
        let assignedToHTML = '';
        if (assignedTo && assignedTo.length > 0) {
            assignedTo.forEach(user => {
                // Assuming user object has a profilePic property generated elsewhere
                assignedToHTML += user.profilePic ? user.profilePic : `<div class="profilePicDefault">${user.name.charAt(0)}</div>`; // Fallback if profilePic is missing
            });
        }
        return /*html*/`
            <div class="boardTaskAssignedTo">
                ${assignedToHTML}
            </div>
        `;
    }

    /**
     * Generates the HTML for the priority icon of the todo item.
     * 
     * @param {string} prio - The priority of the todo item ('urgent', 'medium', 'low').
     * @returns {string} The generated HTML string for the priority icon.
     */
    generatePrioHTML(prio) {
        let prioIconSrc = '';
        switch (prio) {
            case 'urgent':
                prioIconSrc = '../assets/icons/prioUrgent.svg';
                break;
            case 'medium':
                prioIconSrc = '../assets/icons/prioMedium.svg';
                break;
            case 'low':
                prioIconSrc = '../assets/icons/prioLow.svg';
                break;
            default: // Default or fallback icon
                prioIconSrc = '../assets/icons/prioMedium.svg';
        }
        return /*html*/`
            <img src="${prioIconSrc}" alt="${prio} priority">
        `;
    }

    /**
     * Generates the HTML for opening the overlay of a todo item.
     * 
     * @param {Object} element - The todo item object.
     * @param {string} element.id - The ID of the todo item.
     * @param {string} element.category - The category of the todo item.
     * @param {string} element.title - The title of the todo item.
     * @param {string} element.description - The description of the todo item.
     * @param {Array} element.subtasks - The subtasks of the todo item.
     * @param {Array} element.assignedTo - The assigned users to the todo item.
     * @param {string} element.prio - The priority of the todo item.
     * @param {string} element.date - The due date of the todo item.
     * @returns {string} The generated HTML string for the todo item overlay.
     */
    generateOpenOverlayHTML(element) {
        // Dependency: generateModalCategoryHTML, generateModalAssignedToHTML, generateModalSubtasksHTML (now methods of this class)
        //             generatePrioHTML (method of this class)
        //             formatDate (needs to be defined or imported)
        // NOTE: formatDate function is assumed to exist globally or needs to be added/imported.
        const formattedDate = formatDate(element.date); // Assuming formatDate exists
        return /*html*/`
        <div class="boardTaskOverlayContent">
            <img class="closeBtn" onclick="closeModal()" src="../assets/icons/close.svg">
            ${this.generateModalCategoryHTML(element.category)}
            <h1>${element.title}</h1>
            <span>${element.description}</span>
            <div class="boardTaskOverlayInfo"><span>Due date:</span><span>${formattedDate}</span></div>
            <div class="boardTaskOverlayInfo"><span>Priority:</span><div class="boardTaskOverlayPrio">${element.prio.charAt(0).toUpperCase() + element.prio.slice(1)} ${this.generatePrioHTML(element.prio)}</div></div>
            ${this.generateModalAssignedToHTML(element.assignedTo)}
            ${this.generateModalSubtasksHTML(element)}
            <div class="boardTaskOverlayBtns">
                <div class="boardTaskOverlayBtn" onclick="deleteTask('${element.id}')">
                    <img src="../assets/icons/delete.svg">Delete
                </div>
                <div class="boardTaskOverlaySeperator"></div>
                <div class="boardTaskOverlayBtn" onclick="enableTaskEdit('${element.id}')">
                    <img src="../assets/icons/pencilDarkBlue.svg">Edit
                </div>
            </div>
        </div>
        `;
    }

    /**
     * Generates the HTML for the category badge in the modal.
     * 
     * @param {string} category - The category of the todo item.
     * @returns {string} The generated HTML string for the category badge in the modal.
     */
    generateModalCategoryHTML(category) {
        const categoryClass = category.toLowerCase().replace(/\s+/g, '-');
        return /*html*/`
            <div class="boardTaskHeadline boardTaskHeadline-${categoryClass}">${category}</div>
        `;
    }

    /**
     * Generates the HTML for the assigned users in the modal.
     * 
     * @param {Array} assignedTo - The assigned users to the todo item.
     * @returns {string} The generated HTML string for the assigned users in the modal.
     */
    generateModalAssignedToHTML(assignedTo) {
        // Dependency: ContactHtml class (or similar logic for profile pics and names)
        // NOTE: This assumes assignedTo contains objects with profilePic and name properties.
        let assignedToHTML = '';
        if (assignedTo && assignedTo.length > 0) {
            assignedTo.forEach(user => {
                // Assuming user object has profilePic and name properties
                const profilePic = user.profilePic ? user.profilePic : `<div class="profilePicDefault">${user.name.charAt(0)}</div>`; // Fallback
                assignedToHTML += /*html*/`
                    <div class="boardTaskOverlayAssignedUser">
                        ${profilePic}
                        <span>${user.name}</span>
                    </div>
                `;
            });
        }
        return /*html*/`
            <div class="boardTaskOverlayInfo">
                <span>Assigned To:</span>
                <div class="boardTaskOverlayAssignedUsers">
                    ${assignedToHTML}
                </div>
            </div>
        `;
    }

    /**
     * Generates the HTML for the subtasks in the modal.
     * 
     * @param {Object} element - The todo item object.
     * @param {Array} element.subtasks - The subtasks of the todo item.
     * @param {string} element.id - The ID of the todo item.
     * @returns {string} The generated HTML string for the subtasks in the modal.
     */
    generateModalSubtasksHTML(element) {
        if (!element.subtasks || element.subtasks.length === 0) {
            return ''; // Return empty string if no subtasks
        }
        let subtasksHTML = '';
        element.subtasks.forEach((subtask, index) => {
            const isChecked = subtask.status === 'checked';
            const checkboxSrc = isChecked ? '../assets/icons/checkboxChecked.svg' : '../assets/icons/checkbox.svg';
            subtasksHTML += /*html*/`
                <div class="boardTaskOverlaySubtask">
                    <img id="subtaskCheckbox-${index}" onclick="updateSubtaskStatus('${element.id}', ${index})" src="${checkboxSrc}">
                    <span>${subtask.text}</span> 
                </div>
            `;
            // Note: The original code used subtask.subtask, assuming 'text' is the correct property based on generateSaveSubtaskHTML
        });
        return /*html*/`
            <div class="boardTaskOverlayInfo">
                <span>Subtasks:</span>
                <div class="boardTaskOverlaySubtasks">
                    ${subtasksHTML}
                </div>
            </div>
        `;
    }
}

// Helper function (consider moving to a utility class/file later)
function formatDate(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}