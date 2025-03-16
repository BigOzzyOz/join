import { setActualDate } from '../script.js';
import { closeModal } from './board2.js';
import { handleOverlayOutsideClick, handlePrioClick } from './board-listener.js';
import { formValidation, toggleDropdown, assignSearchInput, pushNewTask, toggleCategoryDropdown, addNewSubtask, clearSubtaskInput, saveSubtask, clearAddTaskForm, deleteSubtask, editSubtask } from './addTask.js';


/**
 * Activates all listeners for the add task form.
 * Listeners are for handling the following events:
 * - Adding a new task
 * - Assigning a contact to the task
 * - Adding a new subtask
 * - Changing the category of the task
 * - Changing the priority of the task
 * - Changing the date of the task
 * @function activateAddTaskListeners
 * @returns {void}
 */
export function activateAddTaskListeners() {
  window.addEventListener('click', handleOverlayOutsideClick);
  addTaskListenerGeneral("add");
  addTaskListenerAssign("add");
  addTaskListenerSubtasks("add");
  addTaskListenerCategory("add");
  addTaskListenerPrio("add");
  addTaskListenerDate("add");
}


/**
 * Deactivates all listeners for the add task form.
 * @function deactivateAllAddTaskListeners
 * @returns {void}
 */
export function deactivateAllAddTaskListeners() {
  window.removeEventListener('click', handleOverlayOutsideClick);
  addTaskListenerGeneral("remove");
  addTaskListenerAssign("remove");
  addTaskListenerSubtasks("remove");
  addTaskListenerCategory("remove");
  addTaskListenerPrio("remove");
  addTaskListenerDate("remove");
  deactivateSubtaskListeners();
}


/**
 * Manages event listeners for the general add task functionality.
 * Depending on the action parameter, this function adds or removes
 * event listeners for closing the add task modal, clearing the add task form,
 * and submitting the add task form.
 * 
 * @param {string} action - Determines whether to add or remove listeners. 
 *                          Use "add" to attach listeners and "remove" to detach them.
 */
function addTaskListenerGeneral(action) {
  const closeBtn = document.getElementById("addTaskModalCloseBtn");
  const clearBtn = document.getElementById("clearBtn");
  const addTaskForm = document.getElementById("addTaskForm");

  if (action === "add") {
    closeBtn?.addEventListener("click", closeModal);
    clearBtn?.addEventListener('click', clearAddTaskForm);
    addTaskForm?.addEventListener('submit', handleSubmitBtnClick);
  } else if (action === "remove") {
    closeBtn?.removeEventListener("click", closeModal);
    clearBtn?.removeEventListener('click', clearAddTaskForm);
    addTaskForm?.removeEventListener('submit', handleSubmitBtnClick);
  }
}


/**
 * Manages event listeners for the add task assign functionality.
 * Depending on the action parameter, this function adds or removes
 * event listeners for the assign dropdown menu, the assign search input field
 * and the assign dropdown arrow.
 * 
 * @param {string} action - Determines whether to add or remove listeners. 
 *                          Use "add" to attach listeners and "remove" to detach them.
 */
function addTaskListenerAssign(action) {
  const assignSearchInputField = document.getElementById("assignSearch");
  const assignSearchDropdown = document.getElementById("assignDropArrowContainer");
  if (action === "add") {
    assignSearchInputField?.addEventListener('click', toggleDropdown);
    assignSearchInputField?.addEventListener('input', assignSearchInput);
    assignSearchDropdown?.addEventListener('click', toggleDropdown);
  } else if (action === "remove") {
    assignSearchInputField?.removeEventListener('click', toggleDropdown);
    assignSearchInputField?.removeEventListener('input', assignSearchInput);
    assignSearchDropdown?.removeEventListener('click', toggleDropdown);
  }
}


/**
 * Manages event listeners for the add task subtasks functionality.
 * Depending on the action parameter, this function adds or removes
 * event listeners for adding a new subtask, clearing the subtask input field
 * and saving a subtask.
 * 
 * @param {string} action - Determines whether to add or remove listeners. 
 *                          Use "add" to attach listeners and "remove" to detach them.
 */
function addTaskListenerSubtasks(action) {
  const subtasksInputContainer = document.getElementById("subtasksInputContainer");
  const subtaskInputPlus = document.getElementById("subtaskPlusIcon");
  const subtaskDeleteIcon = document.getElementById('subtaskDeleteIcon');
  const subtaskSaveIcon = document.getElementById('subtaskSaveIcon');

  if (action === "add") {
    subtasksInputContainer?.addEventListener('keypress', addNewSubtask);
    subtaskInputPlus?.addEventListener('click', addNewSubtask);
    subtaskDeleteIcon?.addEventListener('click', clearSubtaskInput);
    subtaskSaveIcon?.addEventListener('click', saveSubtask);
  } else if (action === "remove") {
    subtasksInputContainer?.removeEventListener('keypress', addNewSubtask);
    subtaskInputPlus?.removeEventListener('click', addNewSubtask);
    subtaskDeleteIcon?.removeEventListener('click', clearSubtaskInput);
    subtaskSaveIcon?.removeEventListener('click', saveSubtask);
  }
}


/**
 * Manages event listeners for the category wrapper element of the add task form.
 * Depending on the action parameter, this function adds or removes
 * event listeners for toggling the category dropdown when the category
 * wrapper element is clicked.
 * 
 * @param {string} action - Determines whether to add or remove listeners. 
 *                          Use "add" to attach listeners and "remove" to detach them.
 */
function addTaskListenerCategory(action) {
  const categoryValue = document.querySelectorAll(".categoryValue");
  if (action === "add") {
    categoryValue?.forEach((element) => element.addEventListener('click', handleWrapperClick));
  } else if (action === "remove") {
    categoryValue?.forEach((element) => element.removeEventListener('click', handleWrapperClick));
  }
}


/**
 * Manages event listeners for the priority buttons of the add task form.
 * Depending on the action parameter, this function adds or removes
 * event listeners for handling the click event on the priority buttons.
 * 
 * @param {string} action - Determines whether to add or remove listeners. 
 *                          Use "add" to attach listeners and "remove" to detach them.
 */
function addTaskListenerPrio(action) {
  const prio = document.querySelectorAll('.prioBtn');
  if (action === "add") {
    prio?.forEach((element) => element.addEventListener('click', handlePrioClick));
  } else if (action === "remove") {
    prio?.forEach((element) => element.removeEventListener('click', handlePrioClick));
  }
}


/**
 * Manages event listeners for the date input of the add task form.
 * Depending on the action parameter, this function adds or removes
 * event listeners for setting the minimum date of the date input to
 * the current date when the date input is clicked.
 * 
 * @param {string} action - Determines whether to add or remove listeners. 
 *                          Use "add" to attach listeners and "remove" to detach them.
 */
function addTaskListenerDate(action) {
  const dateInput = document.getElementById("dateInputContainer");
  if (action === "add") {
    dateInput?.addEventListener('click', setActualDate);
  } else if (action === "remove") {
    dateInput?.removeEventListener('click', setActualDate);
  }
}


/**
 * Handles the submit button click event for the add task form.
 * Prevents the default form submission behavior and, if the form
 * validation is successful, initiates the process to push a new task.
 * 
 * @param {Event} event - The event object representing the submit event.
 */

function handleSubmitBtnClick(event) {
  event.preventDefault();
  if (formValidation()) pushNewTask();
}


/**
 * Handles the click event for a category wrapper element.
 * Stops event propagation and prevents default behavior.
 * Retrieves the category value from the clicked element and toggles the category dropdown.
 * 
 * @param {Event} event - The click event.
 */
function handleWrapperClick(event) {
  event.stopPropagation();
  event.preventDefault();
  let category = event.target.closest('.categoryValue').dataset.value;
  toggleCategoryDropdown(category);
}


//NOTE - Subtask listener and handler


/**
 * Attaches event listeners to subtask-related elements for editing and deleting subtasks.
 * - Elements with the class 'subtaskEditList' will listen for double-click events
 *   to initiate subtask editing.
 * - Elements with the class 'editSubtaskBtns' will listen for click events
 *   to initiate subtask editing.
 * - Elements with the class 'deleteSubtaskBtns' will listen for click events
 *   to initiate subtask deletion.
 */
export function activateSubtaskListeners() {
  const subtaskEditList = document.querySelectorAll('.subtaskEditList');
  const subtaskEditBtns = document.querySelectorAll('.editSubtaskBtns');
  const subtaskDeleteBtns = document.querySelectorAll('.deleteSubtaskBtns');
  subtaskEditList?.forEach((element) => element.addEventListener('dblclick', handleSubtaskList));
  subtaskEditBtns?.forEach((element) => element.addEventListener('click', handleSubtaskList));
  subtaskDeleteBtns?.forEach((element) => element.addEventListener('click', handleSubtaskList));
}


/**
 * Removes event listeners from subtask-related elements for editing and deleting subtasks.
 * - Elements with the class 'subtaskEditList' will stop listening for double-click events
 *   to initiate subtask editing.
 * - Elements with the class 'editSubtaskBtns' will stop listening for click events
 *   to initiate subtask editing.
 * - Elements with the class 'deleteSubtaskBtns' will stop listening for click events
 *   to initiate subtask deletion.
 */
export function deactivateSubtaskListeners() {
  const subtaskEditList = document.querySelectorAll('.subtaskEditList');
  const subtaskEditBtns = document.querySelectorAll('.editSubtaskBtns');
  const subtaskDeleteBtns = document.querySelectorAll('.deleteSubtaskBtns');
  subtaskEditList?.forEach((element) => element.removeEventListener('dblclick', handleSubtaskList));
  subtaskEditBtns?.forEach((element) => element.removeEventListener('click', handleSubtaskList));
  subtaskDeleteBtns?.forEach((element) => element.removeEventListener('click', handleSubtaskList));
}


/**
 * Handles events from subtask-related elements for editing and deleting subtasks.
 * - Dblclick event will initiate subtask editing.
 * - Click event on elements with the class 'editSubtaskBtns' will initiate subtask editing.
 * - Click event on elements with the class 'deleteSubtaskBtns' will initiate subtask deletion.
 * @param {Object} event - Event object with target and type properties.
 * @param {Element} event.target - Element that triggered the event.
 * @param {string} event.type - Type of event, either 'dblclick' or 'click'.
 */
function handleSubtaskList({ target, type }) {
  const subtask = target.closest('.subtaskEditList');
  const action = target.closest('img').dataset.action;
  if (type === "dblclick") editSubtask(subtask);
  else if (action === "edit") editSubtask(subtask);
  else if (action === "delete") deleteSubtask(subtask);
}


//NOTE - Geneal listener and handler


