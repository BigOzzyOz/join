/**
 * Represents the HTML structure for a task, including board cards, modals, and edit forms.
 */
export class TaskHtml {
    //NOTE - Properties
    /** @type {Task} The task object associated with this HTML representation. */
    task;

    //NOTE - Constructor & Initialization
    /**
     * Creates an instance of TaskHtml.
     * @param {Task} task - The task object.
     */
    constructor(task) {
        this.task = task;
    }

    //NOTE - Board Card HTML Generation
    /**
     * Generates the complete HTML for a task card on the board.
     * @returns {string} The HTML string for the task card.
     */
    generateTodoHTML() {
        const categoryHTML = this._generateCategoryHTML();
        const titleHTML = this._generateTitleHTML();
        const descriptionHTML = this._generateDescriptionHTML();
        const subtasksHTML = this._generateSubtasksHTML();
        const assignedToHTML = this._generateAssignedToHTML();
        const prioHTML = this._generatePrioHTML();
        return /*html*/ `
              <div draggable="true" id="${this.task.id}" class="todoContainer" data-id="${this.task.id}">
                  <div class="toDoContent">
                      ${categoryHTML}
                      <div class="toDoHeaderContainer">
                          ${titleHTML}
                          ${descriptionHTML}
                      </div>
                      ${subtasksHTML}
                      <div class="toDoContentBottomContainer">
                          <div class="assignedToBadgeContainer">${assignedToHTML}</div>
                          ${prioHTML}
                      </div>
                  </div>
              </div>
          `;
    }

    /**
     * Generates the HTML for the task category badge on the board card.
     * @private
     * @returns {string}
     */
    _generateCategoryHTML() {
        if (this.task.category === 'User Story') return '<div class="userStoryBadge">User Story</div>';
        return '<div class="technicalTaskBadge">Technical Task</div>';
    }

    /**
     * Generates the HTML for the task title on the board card, truncating if necessary.
     * @private
     * @returns {string}
     */
    _generateTitleHTML() {
        const safeTitle = this._sanitize(this.task.title);
        if (safeTitle.length < 20) return `<div class="toDoHeader">${safeTitle}</div>`;
        return `<div class="toDoHeader">${safeTitle.substring(0, 20)}...</div>`;
    }

    /**
     * Generates the HTML for the task description on the board card, truncating if necessary.
     * @private
     * @returns {string}
     */
    _generateDescriptionHTML() {
        const safeDescription = this._sanitize(this.task.description);
        if (safeDescription.length < 60) return `<div class="toDoDescription">${safeDescription}</div>`;
        return `<div class="toDoDescription">${safeDescription.substring(0, 40)}...</div>`;
    }

    /**
     * Generates the HTML for the subtasks progress bar on the board card.
     * @private
     * @returns {string}
     */
    _generateSubtasksHTML() {
        if (!this.task.subtasks || this.task.subtasks.length === 0) return '';
        return /*html*/ `
              <div class="toDoSubtasksContainer">
                  <div class="subtasksProgressbar">
                      <div id="subtasksProgressbarProgress${this.task.id}" class="subtasksProgressbarProgress" style="width: 0%;" role="progressbar"></div>
                  </div>
                  <div id="subtasksProgressbarText${this.task.id}">0/${this.task.subtasks.length} Subtasks</div>
              </div>`;
    }

    /**
     * Generates the HTML for the assigned contacts badges on the board card.
     * Shows a maximum of 4 badges and an indicator for more if needed.
     * @private
     * @returns {string}
     */
    _generateAssignedToHTML() {
        if (!this.task.assignedTo) return '';
        let html = '';
        for (let i = 0; i < Math.min(this.task.assignedTo.length, 4); i++) {
            html += `<div class="assignedToBadge">${this.task.assignedTo[i].profilePic}</div>`;
        }
        if (this.task.assignedTo.length > 4) {
            html += `<div class="assignedToMoreBadge">+${this.task.assignedTo.length - 4}</div>`;
        }
        return html;
    }

    /**
     * Generates the HTML for the priority icon on the board card.
     * @private
     * @returns {string}
     */
    _generatePrioHTML() {
        if (this.task.prio === 'urgent') return '<img src="../assets/icons/priourgent.png">';
        if (this.task.prio === 'medium') return '<img src="../assets/icons/priomedium.png">';
        return '<img src="../assets/icons/priolow.png">';
    }

    //NOTE - Modal/Overlay HTML Generation
    /**
     * Generates the HTML for the task category badge in the modal view.
     * @private
     * @returns {string}
     */
    _generateModalCategoryHTML() {
        if (this.task.category === 'User Story') return '<div class="modalUserStoryBadge">User Story</div>';
        return '<div class="modalTechnicalTaskBadge">Technical Task</div>';
    }

    /**
     * Generates the HTML for the list of assigned contacts in the modal view.
     * @private
     * @returns {string}
     */
    _generateModalAssignedToHTML() {
        if (!this.task.assignedTo) return '';
        let html = '';
        for (let i = 0; i < this.task.assignedTo.length; i++) {
            html += /*html*/`<div class="modalAssignedToSingle">${this.task.assignedTo[i].profilePic}${this.task.assignedTo[i].name}</div>`;
        }
        return html;
    }

    /**
     * Generates the HTML for the list of subtasks in the modal view, including checkboxes.
     * @private
     * @returns {string}
     */
    _generateModalSubtasksHTML() {
        if (!this.task.subtasks || this.task.subtasks.length === 0) return 'No subtasks available!';
        let html = '';
        for (let i = 0; i < this.task.subtasks.length; i++) {
            let subtask = this.task.subtasks[i];
            let checked = subtask.status === 'checked' ? '../assets/icons/checkboxchecked.svg' : '../assets/icons/checkbox.svg';
            html += /*html*/ `<label class="modalSubtasksSingle" data-subtaskindex="${i}"><img id="subtaskCheckbox${i}" src="${checked}" alt="Checkbox"><div>${subtask.text}</div></label>`;
        }
        return html;
    }

    /**
     * Generates the complete HTML for the task details modal (overlay).
     * @returns {string}
     */
    generateOpenOverlayHTML() {
        const modalCategoryHTML = this._generateModalCategoryHTML();
        const priority = this.task.prio.charAt(0).toUpperCase() + this.task.prio.slice(1);
        const modalAssignedToHTML = this._generateModalAssignedToHTML();
        const modalSubtasksHTML = this._generateModalSubtasksHTML();
        return /*html*/ `
              <div class="modalContainer" id="modalContainer" data-id="${this.task.id}">
                  <div class="modalToDoContent">
                      <div class="modalCategoryContainer">
                          ${modalCategoryHTML}
                          <img id="modalCloseBtn" class="modalCloseIcon" src="../assets/icons/closeGrey.svg" alt="">
                      </div>
                      <div class="modalScrollbarWrapper">
                          <div id="modalHeader" class="modalHeader">${this.task.title}</div>
                          <div class="modalDescription" id="modalDescription">${this.task.description}</div>
                          <div class="modalDateContainer">
                              <div class="modalDateText">Due date:</div>
                              <div>${this.task.date}</div>
                          </div>
                          <div class="modalPrioContainer">
                              <div class="modalPrioText">Priority:</div>
                              <div class="modalPrioIconContainer">
                                  <div>${priority}</div>
                                  <img src="../assets/icons/prio${this.task.prio}small.svg">
                              </div>
                          </div>
                          <div class="modalAssignedToContainer">
                              <div class="modalAssignedToText">Assigned To:</div>
                              <div class="modalAssignedToContainer">${modalAssignedToHTML}</div>
                          </div>
                          <div>
                              <div class="modalSubtasksText">Subtasks</div>
                              <div class="modalSubtasksContainer">${modalSubtasksHTML}</div>
                          </div>
                      </div>
                      <div class="modalBottomContainer">
                          <div id="modalContainerDeleteBtn" class="modalBottomDeleteContainer">
                              <img src="../assets/icons/deleteDarkBlue.svg">
                              <div>Delete</div>
                          </div>
                          <div class="modalBottomSeparator"></div>
                          <div id="modalContainerEditBtn" class="modalBottomEditContainer">
                              <img src="../assets/icons/pencilDarkBlue.svg">
                              <div>Edit</div>
                          </div>
                      </div>
                  </div>
              </div>
          `;
    }

    //NOTE - Edit Task Modal HTML Generation
    /**
     * Generates the HTML for the task edit modal form.
     * @returns {string}
     */
    generateTaskEditHTML() {
        let subtaskHTML = '';
        if (this.task.subtasks && this.task.subtasks.length > 0) {
            this.task.subtasks.forEach((subtask, index) => {
                subtaskHTML += subtask.html.generateSaveSubtaskHTML(index);
            });
        }
        return /*html*/ `
              <div class="modalToDoContent">
                  <div class="editTaskCloseContainer">
                      <img id="editTaskCloseBtn" class="modalCloseIcon" src="../assets/icons/closeGrey.svg" alt="">
                  </div>
                  <form id="editTaskForm" data-id="${this.task.id}" class="editTaskForm">
                      <div class="editTaskScrollbarWrapper">
                          <div class="singleInputContainer">
                              <div class="redStarAfter">Title</div>
                              <input id="editTaskTitle" type="text" placeholder="Enter a title" required maxlength="80">
                              <div class="formValidationText" style="display: none;">This field is required</div>
                          </div>
                          <div class="singleInputContainer">
                              <div>Description</div>
                              <textarea id="editTaskDescription" placeholder="Enter a Description" maxlength="240"></textarea>
                          </div>
                          <div class="singleInputContainer">
                              <div class="redStarAfter">Due date</div>
                              <input id="editDateInput" class="dateInput" type="date" placeholder="dd/mm/yyyy" required>
                              <div class="formValidationText" style="display: none;">This field is required</div>
                          </div>
                          <div class="editTaskPrioContainer">
                              <div>Priority</div>
                          <div class="prioBtnContainer">
                              <div id="urgentPrioBtn" class="prioBtn prioBtnUrgent" data-prio="urgent">
                              <div>Urgent</div>
                                  <img class="priourgentsmallWhite" src="../assets/icons/priourgentsmallWhite.svg">
                                  <img class="priourgentsmall" src="../assets/icons/priourgentsmall.svg">
                              </div>
                              <div class="prioBtn prioBtnMedium prioBtnMediumActive" data-prio="medium">
                                  <div>Medium</div>
                                  <img class="priomediumsmallWhite" src="../assets/icons/priomediumsmallWhite.svg">
                                  <img class="priomediumsmall" src="../assets/icons/priomediumsmall.svg">
                              </div>
                              <div class="prioBtn prioBtnLow" data-prio="low">
                                  <div>Low</div>
                                  <img class="priolowsmallWhite" src="../assets/icons/priolowsmallWhite.svg">
                                  <img class="priolowsmall" src="../assets/icons/priolowsmall.svg">
                              </div>
                          </div>
                          </div>
                          <div class="singleInputContainer">
                              <div>Assigned to</div>
                              <div id="assignDropdown" class="assignContainer">
                                  <input id="assignSearch" type="search" class="contactsAssignStandard"
                                      value="Select contacts to assign" placeholder="Search contacts" readonly>
                                  <div id="assignDropArrowContainer" class="imgContainer">
                                      <img id="assignDropArrow" src="../assets/icons/arrowdropdown.svg" alt="">
                                  </div>
                                  <div id="contactsToAssign" class="contactsToAssign"></div>
                              </div>
                              <div id="contactsAssigned" class="contactsAssigned"></div>
                          </div>
                          <div class="singleInputContainer">
                              <div>Subtasks</div>
                              <div id="subtasksInputContainer" class="subtasksInputContainer">
                                  <input id="subtaskInput" class="subtasksInput" type="text" placeholder="Add new subtask" maxlength="80">
                                  <img id="subtaskPlusIcon" class="subtaskPlusIcon" src="../assets/icons/addBlack.svg">
                                  <div id="subtaskIconContainer" class="subtaskIconContainer dNone">
                                      <img id="subtaskDeleteIcon" class="icon" src="../assets/icons/delete.svg">
                                      <div class="subtaskInputSeperator"></div>
                                      <img id="subtaskSaveIcon" class="icon" src="../assets/icons/checkBlackBig.svg">
                                  </div>
                              </div>
                              <ul id="subtaskList">${subtaskHTML}</ul>
                          </div>
                      </div>
                      <div class="editBottomContainer">
                          <button id="saveTaskEditBtn" type="submit" class="saveTaskEditBtn">
                              <div>Ok</div>
                              <img src="../assets/icons/check.svg">
                          </button>
                      </div>
                  </form>
              </div>
          `;
    }

    //NOTE - Helpers
    /**
     * Sanitizes a string for HTML output.
     * @private
     * @param {string} str
     * @returns {string}
     */
    _sanitize(str) {
        if (!str) return '';
        return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    //NOTE - Error Handling
    /**
     * Logs an error message.
     * @param {string} msg
     * @returns {void}
     */
    _logError(msg) { console.error(msg); }
}