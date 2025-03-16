import { assignedContacts } from "./addTask.js";

/**
 * Generates HTML for assigning contacts to a task.
 * 
 * @param {Object} contact - The contact object.
 * @param {number} contact.id - The ID of the contact.
 * @param {string} contact.name - The name of the contact.
 * @param {string} contact.profilePic - The profile picture HTML of the contact.
 * @returns {string} The HTML string for the contact assignment.
 */
export function htmlRenderContactsAssign(contact) {
  return /*html*/`
    <label for="contact${contact.id}" class="${assignedContacts.some(c => c.name == contact.name) ? 'contactsToAssignCheck' : ''}">
      ${contact.profilePic}
      <p>${contact.name}</p>
      <input class="assignContactToProject" 
        data-id="${contact.id}" 
        type="checkbox" 
        id="contact${contact.id}"  
        ${assignedContacts.some(c => c.name == contact.name) ? 'checked' : ''}>
      <span class="checkMark"></span>
    </label>
    `;
}


/**
 * Generates HTML for a subtask.
 * 
 * @param {string} inputText - The text of the subtask.
 * @param {number} index - The index of the subtask.
 * @returns {string} The HTML string for the subtask.
 */
export function generateSaveSubtaskHTML(inputText, index) {
  return /*html*/`
      <li class="subtaskEditList" id="subtask-${index}" ondblclick="editSubtask(this)">
        <div class="subtaskItem">
          <span class="subtaskItemText">${inputText}</span>
          <input type="text" class="editSubtaskInput dNone" value="${inputText}" maxlength="80">
          <div class="addedTaskIconContainer">
              <img class="icon" src="../assets/icons/pencilDarkBlue.svg" onclick="editSubtask(this)">
              <div class="subtaskInputSeperator"></div>
              <img class="icon" src="../assets/icons/delete.svg" onclick="deleteSubtask(this)">
          </div>
        </div>

      </li>
  `;
}
