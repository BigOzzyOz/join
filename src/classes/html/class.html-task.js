// Helper function (consider moving to a utility class/file or make private static)
function formatDate(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

export class TaskHtml {
    //NOTE - Properties
    task;
    id;
    title;
    description;
    category;
    date;
    prio;
    status;
    assignedTo;
    subtasks;

    //NOTE - Constructor
    constructor(task) {
        this.task = task;
        this.id = task.id;
        this.title = task.title;
        this.description = task.description;
        this.category = task.category;
        this.date = task.date;
        this.prio = task.prio;
        this.status = task.status;
        this.assignedTo = task.assignedTo;
        this.subtasks = task.subtasks;
    }

    //NOTE - Board Card HTML Generation

    generateTodoHTML() {
        const safeTitle = this.title ? this.title.replace(/</g, "&lt;").replace(/>/g, "&gt;") : 'No Title';
        const safeDescription = this.description ? this.description.replace(/</g, "&lt;").replace(/>/g, "&gt;") : '';

        return /*html*/`
        <div draggable="true" class="boardTask" id="${this.id}" data-id="${this.id}"> {/* Added data-id */}
            ${this.generateCategoryHTML()}
            ${this.generateTitleHTML(safeTitle)}
            ${this.generateDescriptionHTML(safeDescription)} 
            ${this.generateSubtasksProgressHTML()}
            <div class="boardTaskFooter">
                ${this.generateAssignedToCardHTML()}
                ${this.generatePrioHTML()}
            </div>
        </div>
        `;
    }

    generateTitleHTML(safeTitle) {
        return /*html*/`
            <h4>${safeTitle}</h4>
        `;
    }

    generateDescriptionHTML(safeDescription) {
        return /*html*/`
            <span class="boardTaskDescription">${safeDescription}</span>
        `;
    }


    generateSubtasksProgressHTML() {
        if (!this.subtasks || this.subtasks.length === 0) {
            return '<div class="boardTaskSubtasksPlaceholder"></div>';
        }
        let checkedSubtasks = this.subtasks.filter(sub => sub.status === 'checked').length;
        let progress = (checkedSubtasks / this.subtasks.length) * 100;
        return /*html*/`
            <div class="boardTaskSubtasks">
                <div class="boardTaskSubtasksProgressBar">
                    <div class="boardTaskSubtasksProgress" id="subtaskProgress-${this.id}" style="width: ${progress}%"></div>
                </div>
                <span>${checkedSubtasks}/${this.subtasks.length} Subtasks</span>
            </div>
        `;
    }

    generateAssignedToCardHTML() {
        let assignedToHTML = '';
        if (this.assignedTo && this.assignedTo.length > 0) {
            this.assignedTo.forEach(user => {
                assignedToHTML += user.profilePic ? user.profilePic : `<div class="profilePicDefault">${user.firstLetters || '?'}</div>`;
            });
        }
        return /*html*/`
            <div class="boardTaskAssignedTo">
                ${assignedToHTML || ''}
            </div>
        `;
    }

    //NOTE - Overlay HTML Generation

    generateOpenOverlayHTML() {
        const formattedDate = formatDate(this.date);
        const safeTitle = this.title ? this.title.replace(/</g, "&lt;").replace(/>/g, "&gt;") : 'No Title';
        const safeDescription = this.description ? this.description.replace(/</g, "&lt;").replace(/>/g, "&gt;") : 'No Description';

        return /*html*/`
        <div class="boardTaskOverlayContent" data-task-id="${this.id}">
            <img class="closeBtn" src="../assets/icons/close.svg" alt="Close"> 
            ${this.generateCategoryHTML()}
            <h1>${safeTitle}</h1>
            <span>${safeDescription}</span>
            <div class="boardTaskOverlayInfo"><span>Due date:</span><span>${formattedDate || 'No date'}</span></div>
            <div class="boardTaskOverlayInfo"><span>Priority:</span><div class="boardTaskOverlayPrio">${this.prio ? this.prio.charAt(0).toUpperCase() + this.prio.slice(1) : 'Medium'} ${this.generatePrioHTML()}</div></div>
            ${this.generateModalAssignedToHTML()}
            ${this.generateModalSubtasksHTML()}
            <div class="boardTaskOverlayBtns">
                <div class="boardTaskOverlayBtn" data-action="delete">
                    <img src="../assets/icons/delete.svg" alt="Delete">Delete
                </div>
                <div class="boardTaskOverlaySeperator"></div>
                <div class="boardTaskOverlayBtn" data-action="edit">
                    <img src="../assets/icons/pencilDarkBlue.svg" alt="Edit">Edit
                </div>
            </div>
        </div>
        `;
    }

    generateModalAssignedToHTML() {
        let assignedToHTML = '';
        if (this.assignedTo && this.assignedTo.length > 0) {
            this.assignedTo.forEach(user => {
                const profilePic = user.profilePic ? user.profilePic : `<div class="profilePicDefault">${user.firstLetters || '?'}</div>`;
                const safeName = user.name ? user.name.replace(/</g, "&lt;").replace(/>/g, "&gt;") : 'Unknown User';
                assignedToHTML += /*html*/`
                    <div class="boardTaskOverlayAssignedUser">
                        ${profilePic}
                        <span>${safeName}</span>
                    </div>
                `;
            });
        } else {
            assignedToHTML = '<span>No contacts assigned.</span>';
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

    generateModalSubtasksHTML() {
        let subtasksHTML = '';
        if (this.subtasks && this.subtasks.length > 0) {
            this.subtasks.forEach((subtask) => {
                const isChecked = subtask.status === 'checked';
                const checkboxSrc = isChecked ? '../assets/icons/checkboxChecked.svg' : '../assets/icons/checkbox.svg';
                const safeText = subtask.text ? subtask.text.replace(/</g, "&lt;").replace(/>/g, "&gt;") : 'No text';
                subtasksHTML += /*html*/`
                    <div class="boardTaskOverlaySubtask">
                        <img class="subtaskCheckbox" data-sub-id="${subtask.id}" src="${checkboxSrc}" alt="Toggle subtask"> 
                        <span>${safeText}</span>
                    </div>
                `;
            });
        } else {
            subtasksHTML = '<span>No subtasks added.</span>';
        }
        return /*html*/`
            <div class="boardTaskOverlayInfo">
                <span>Subtasks:</span>
                <div class="boardTaskOverlaySubtasks">
                    ${subtasksHTML}
                </div>
            </div>
        `;
    }

    //NOTE - Common HTML Parts

    generateCategoryHTML() {
        const safeCategory = this.category ? this.category.replace(/</g, "&lt;").replace(/>/g, "&gt;") : 'No Category';
        const categoryClass = safeCategory.toLowerCase().replace(/\s+/g, '-');
        return /*html*/`
            <div class="boardTaskHeadline boardTaskHeadline-${categoryClass}">${safeCategory}</div>
        `;
    }

    generatePrioHTML() {
        let prioIconSrc = '';
        let prioText = 'Medium';
        switch (this.prio) {
            case 'urgent':
                prioIconSrc = '../assets/icons/prioUrgent.svg';
                prioText = 'Urgent';
                break;
            case 'medium':
                prioIconSrc = '../assets/icons/prioMedium.svg';
                prioText = 'Medium';
                break;
            case 'low':
                prioIconSrc = '../assets/icons/prioLow.svg';
                prioText = 'Low';
                break;
            default:
                prioIconSrc = '../assets/icons/prioMedium.svg';
        }
        return /*html*/`
            <img src="${prioIconSrc}" alt="${prioText} priority">
        `;
    }
}