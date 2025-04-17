class TaskHtml {
    constructor(task) {
        this.task = task;
        this.taskId = task.id;
    }


    generateTodoHTML(element) {
        let categoryHTML = generateCategoryHTML(element.category);
        let titleHTML = generateTitleHTML(element.title);
        let descriptionHTML = generateDescriptionHTML(element.description);
        let subtasksHTML = generateSubtasksHTML(element.subtasks, element.id);
        let assignedToHTML = generateAssignedToHTML(element.assignedTo);
        let prioHTML = generatePrioHTML(element.prio);

        return /*html*/ `
              <div draggable="true" id="${element.id}" class="todoContainer" data-id="${element.id}">
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


    generateCategoryHTML(category) {
        let categoryHTML = '';
        if (category == 'User Story') {
            categoryHTML = `<div class="userStoryBadge">User Story</div>`;
        } else {
            categoryHTML = `<div class="technicalTaskBadge">Technical Task</div>`;
        }
        return categoryHTML;
    }


    generateTitleHTML(title) {
        let titleHTML = '';
        if (title.length < 20) {
            titleHTML = `<div class="toDoHeader">${title}</div>`;
        } else {
            titleHTML = `<div class="toDoHeader">${title.substring(0, 20) + '...'}</div>`;
        }
        return titleHTML;
    }


    generateDescriptionHTML(description) {
        let descriptionHTML = '';
        if (description.length < 60) {
            descriptionHTML = `<div class="toDoDescription">${description}</div>`;
        } else {
            descriptionHTML = `<div class="toDoDescription">${description.substring(0, 40) + '...'}</div>`;
        }
        return descriptionHTML;
    }


    generateSubtasksHTML(subtasks, id) {
        let subtasksHTML = "";
        if (subtasks && subtasks.length > 0) {
            subtasksHTML = /*html*/ `
              <div class="toDoSubtasksContainer">
                  <div class="subtasksProgressbar">
                      <div id="subtasksProgressbarProgress${id}" class="subtasksProgressbarProgress" style="width: 0%;" role="progressbar"></div>
                  </div>
                  <div id="subtasksProgressbarText${id}">0/${subtasks.length} Subtasks</div>
              </div>`;
        }
        return subtasksHTML;
    }


    generateAssignedToHTML(assignedTo) {
        let assignedToHTML = '';
        if (!assignedTo) {
            return '';
        }
        for (let i = 0; i < Math.min(assignedTo.length, 4); i++) {
            assignedToHTML += `<div class="assignedToBadge">${assignedTo[i].profilePic}</div>`;
        }
        if (assignedTo.length > 4) {
            let assignedNum = assignedTo.length - 4;
            assignedToHTML += `<div class="assignedToMoreBadge">+${assignedNum}</div>`;
        }
        return assignedToHTML;
    }


    generatePrioHTML(prio) {
        let prioHTML = '';
        if (prio == 'urgent') {
            prioHTML = `<img src="../assets/icons/priourgent.png">`;
        } else if (prio == 'medium') {
            prioHTML = `<img src="../assets/icons/priomedium.png">`;
        } else {
            prioHTML = `<img src="../assets/icons/priolow.png">`;
        }
        return prioHTML;
    }


    async fetchAddTaskTemplate() {
        let response = await fetch("../assets/templates/html/addtasktemplate.html");
        let html = await response.text();
        return `
              <div class="addTaskModalContainer">
                ${html}
              </div>
            `;
    }


    generateModalCategoryHTML(category) {
        let modalCategoryHTML = '';
        if (category == 'User Story') {
            modalCategoryHTML = `<div class="modalUserStoryBadge">User Story</div>`;
        } else {
            modalCategoryHTML = `<div class="modalTechnicalTaskBadge">Technical Task</div>`;
        }
        return modalCategoryHTML;
    }


    generateModalAssignedToHTML(assignedTo) {
        if (!assignedTo) return '';
        let modalAssignedToHTML = '';
        for (let i = 0; i < assignedTo.length; i++) {
            modalAssignedToHTML += /*html*/`
                  <div class="modalAssignedToSingle">
                      ${assignedTo[i].profilePic}
                      ${assignedTo[i].name}
                  </div>
              `;
        }
        return modalAssignedToHTML;
    }


    generateModalSubtasksHTML(element) {
        let modalSubtasksHTML = "";
        if (element.subtasks) {
            for (let i = 0; i < element.subtasks.length; i++) {
                let subtask = element.subtasks[i];
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


    generateOpenOverlayHTML(element) {
        let modalCategoryHTML = generateModalCategoryHTML(element.category);
        let priority = element.prio.charAt(0).toUpperCase() + element.prio.slice(1);
        let modalAssignedToHTML = generateModalAssignedToHTML(element.assignedTo);
        let modalSubtasksHTML = generateModalSubtasksHTML(element);

        return /*html*/ `
              <div class="modalContainer" id="modalContainer" data-id="${element.id}">
                  <div class="modalToDoContent">
                      <div class="modalCategoryContainer">
                          ${modalCategoryHTML}
                          <img id="modalCloseBtn" class="modalCloseIcon" src="../assets/icons/closeGrey.svg" alt="">
                      </div>
                      <div class="modalScrollbarWrapper">
                          <div id="modalHeader" class="modalHeader">${element.title}</div>
                          <div class="modalDescription" id="modalDescription">${element.description}</div>
                          <div class="modalDateContainer">
                              <div class="modalDateText">Due date:</div>
                              <div>${element.date}</div>
                          </div>
                          <div class="modalPrioContainer">
                              <div class="modalPrioText">Priority:</div>
                              <div class="modalPrioIconContainer">
                                  <div>${priority}</div>
                                  <img src="../assets/icons/prio${element.prio}small.svg">
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


    generateTaskEditHTML(taskId) {
        let task = tasks.find(task => task.id === taskId);
        let subtaskHTML = '';
        !task.assignedTo ? setAssignedContacts([]) : setAssignedContacts(task.assignedTo);

        if (task.subtasks && task.subtasks.length > 0) {
            task.subtasks.forEach((subtask, index) => {
                subtaskHTML += /*html*/ `
                      <li class="subtaskEditList" data-index="${index}" id="subtask-${index}">
                          <div class="subtaskItem">
                              <span class="subtaskItemText">${subtask.text}</span>
                              <input type="text" class="editSubtaskInput dNone" value="${subtask.text}" maxlength="80"/>
                              <div class="addedTaskIconContainer">
                                  <img class="icon editSubtaskBtns" data-action="edit" src="../assets/icons/pencilDarkBlue.svg">
                                  <div class="subtaskInputSeperator"></div>
                                  <img class="icon deleteSubtaskBtns" data-action="delete" src="../assets/icons/delete.svg">
                              </div>
                          </div>
                      </li>
                  `;
            });
        }

        return /*html*/ `
              <div class="modalToDoContent">
                  <div class="editTaskCloseContainer">
                      <img id="editTaskCloseBtn" class="modalCloseIcon" src="../assets/icons/closeGrey.svg" alt="">
                  </div>
                  <form id="editTaskForm" data-id="${taskId}" class="editTaskForm">
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



}