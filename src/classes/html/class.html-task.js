export class TaskHtml {
    //NOTE Properties
    task;

    constructor(task) {
        this.task = task;
    }

    //NOTE Board Card HTML Generation

    generateTodoHTML() {
        let categoryHTML = this.generateCategoryHTML();
        let titleHTML = this.generateTitleHTML();
        let descriptionHTML = this.generateDescriptionHTML();
        let subtasksHTML = this.generateSubtasksHTML();
        let assignedToHTML = this.generateAssignedToHTML();
        let prioHTML = this.generatePrioHTML();

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

    generateCategoryHTML() {
        let categoryHTML = '';
        if (this.task.category == 'User Story') {
            categoryHTML = `<div class="userStoryBadge">User Story</div>`;
        } else {
            categoryHTML = `<div class="technicalTaskBadge">Technical Task</div>`;
        }
        return categoryHTML;
    }

    generateTitleHTML() {
        let safeTitle = this.task.title.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        let titleHTML = '';
        if (safeTitle.length < 20) {
            titleHTML = `<div class="toDoHeader">${safeTitle}</div>`;
        } else {
            titleHTML = `<div class="toDoHeader">${safeTitle.substring(0, 20) + '...'}</div>`;
        }
        return titleHTML;
    }

    generateDescriptionHTML() {
        let safeDescription = this.task.description.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        let descriptionHTML = '';
        if (safeDescription.length < 60) {
            descriptionHTML = `<div class="toDoDescription">${safeDescription}</div>`;
        } else {
            descriptionHTML = `<div class="toDoDescription">${safeDescription.substring(0, 40) + '...'}</div>`;
        }
        return descriptionHTML;
    }

    generateSubtasksHTML() {
        let subtasksHTML = "";
        if (this.task.subtasks && this.task.subtasks.length > 0) {
            subtasksHTML = /*html*/ `
              <div class="toDoSubtasksContainer">
                  <div class="subtasksProgressbar">
                      <div id="subtasksProgressbarProgress${this.task.id}" class="subtasksProgressbarProgress" style="width: 0%;" role="progressbar"></div>
                  </div>
                  <div id="subtasksProgressbarText${this.task.id}">0/${this.task.subtasks.length} Subtasks</div>
              </div>`;
        }
        return subtasksHTML;
    }

    generateAssignedToHTML() {
        let assignedToHTML = '';
        if (!this.task.assignedTo) {
            return '';
        }
        for (let i = 0; i < Math.min(this.task.assignedTo.length, 4); i++) {
            assignedToHTML += `<div class="assignedToBadge">${this.task.assignedTo[i].profilePic}</div>`;
        }
        if (this.task.assignedTo.length > 4) {
            let assignedNum = this.task.assignedTo.length - 4;
            assignedToHTML += `<div class="assignedToMoreBadge">+${assignedNum}</div>`;
        }
        return assignedToHTML;
    }

    generatePrioHTML() {
        let prioHTML = '';
        if (this.task.prio == 'urgent') {
            prioHTML = `<img src="../assets/icons/priourgent.png">`;
        } else if (this.task.prio == 'medium') {
            prioHTML = `<img src="../assets/icons/priomedium.png">`;
        } else {
            prioHTML = `<img src="../assets/icons/priolow.png">`;
        }
        return prioHTML;
    }

    //NOTE Modal/Overlay HTML Generation

    generateModalCategoryHTML() {
        let modalCategoryHTML = '';
        if (this.task.category == 'User Story') {
            modalCategoryHTML = `<div class="modalUserStoryBadge">User Story</div>`;
        } else {
            modalCategoryHTML = `<div class="modalTechnicalTaskBadge">Technical Task</div>`;
        }
        return modalCategoryHTML;
    }

    generateModalAssignedToHTML() {
        if (!this.task.assignedTo) return '';
        let modalAssignedToHTML = '';
        for (let i = 0; i < this.task.assignedTo.length; i++) {
            modalAssignedToHTML += /*html*/`
                  <div class="modalAssignedToSingle">
                      ${this.task.assignedTo[i].profilePic}
                      ${this.task.assignedTo[i].name}
                  </div>
              `;
        }
        return modalAssignedToHTML;
    }

    generateModalSubtasksHTML() {
        let modalSubtasksHTML = "";
        if (this.task.subtasks) {
            for (let i = 0; i < this.task.subtasks.length; i++) {
                let subtask = this.task.subtasks[i];
                let checked = subtask.status === 'checked' ? '../assets/icons/checkboxchecked.svg' : '../assets/icons/checkbox.svg';
                modalSubtasksHTML += /*html*/ `
                      <label class="modalSubtasksSingle" data-subtaskindex="${i}">
                          <img id="subtaskCheckbox${i}" src="${checked}" alt="Checkbox">
                          <div>${subtask.text}</div>
                      </label>
                  `;
            }
        } else {
            modalSubtasksHTML = 'No subtasks available!';
        }
        return modalSubtasksHTML;
    }

    generateOpenOverlayHTML() {
        let modalCategoryHTML = this.generateModalCategoryHTML();
        let priority = this.task.prio.charAt(0).toUpperCase() + this.task.prio.slice(1);
        let modalAssignedToHTML = this.generateModalAssignedToHTML();
        let modalSubtasksHTML = this.generateModalSubtasksHTML();

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

    //NOTE Edit Task Modal HTML Generation

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

    //FIXME: Doppelte oder nicht benötigte Methoden ggf. hier ans Ende verschieben
}