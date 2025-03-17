import { deleteTask, deleteTaskSure, toggleClass, activateOutsideCheck } from '../script.js';
import { searchTasks, startDragging, dragEnd } from './board.js';
import { checkScreenWidth, openOverlay, closeModal, moveTo, enableTaskEdit, updateSubtaskStatus, saveEditedTask } from './board2.js';
import { setPrio, toggleDropdown, assignSearchInput, addNewSubtask, handleKeyDown, clearSubtaskInput, saveSubtask, formValidation, contactAssign } from './addTask.js';
import { activateSubtaskListeners, deactivateAllAddTaskListeners, deactivateSubtaskListeners } from './addTask-listener.js';



//NOTE - General listeners and handlers for the board page


/**
 * Activates general event listeners for the board page.
 * This function sets up listeners for adding tasks, 
 * handling drag and drop areas, and other miscellaneous 
 * interactions on the board.
 */
export function activateListeners() {
  boardListenerAddTask('add');
  boardListenerDropAreas('add');
  boardListenerMisc('add');
}


/**
 * Deactivates all event listeners associated with the board.
 * This includes listeners for adding tasks, drop areas, miscellaneous 
 * board interactions, drag and drop functionality, overlay interactions,
 * delete response actions, and task editing.
 * 
 * @function deactivateAllListenersBoard
 * @returns {void}
 */

export function deactivateAllListenersBoard() {
  boardListenerAddTask('remove');
  boardListenerDropAreas('remove');
  boardListenerMisc('remove');
  deactivateDragDrop();
  deactivateOverlayListeners();
  deactivateDeleteResponseListeners();
  deactivateEditTaskListeners();
}


/**
 * Manages event listeners for adding tasks on the board.
 * Depending on the action parameter, this function adds or removes
 * event listeners for the add task button, the desktop add task button,
 * and the task category icons.
 *
 * @param {string} action - Determines whether to add or remove listeners.
 *                          Use "add" to attach listeners and "remove" to detach them.
 */
function boardListenerAddTask(action) {
  const addTaskBtn = document.getElementById("addTaskBtn");
  const addTaskBtnDesktop = document.getElementById("addTaskBtnDesktop");
  const addTaskPlus = document.querySelectorAll('.taskCategoryIcon');

  if (action === "add") {
    addTaskBtn?.addEventListener('click', handleAddTaskBtnClick);
    addTaskBtnDesktop?.addEventListener('click', handleAddTaskBtnClick);
    addTaskPlus?.forEach((element) => {
      element.addEventListener('click', handleAddTaskBtnClick);
    });
  } else if (action === "remove") {
    addTaskBtn?.removeEventListener('click', handleAddTaskBtnClick);
    addTaskBtnDesktop?.removeEventListener('click', handleAddTaskBtnClick);
    addTaskPlus?.forEach((element) => {
      element.removeEventListener('click', handleAddTaskBtnClick);
    });
  }
}


/**
 * Manages event listeners for the drag and drop areas of the board.
 * Depending on the action parameter, this function adds or removes
 * event listeners for the drop event on the to do, in progress, await
 * feedback, and done containers.
 *
 * @param {string} action - Determines whether to add or remove listeners.
 *                          Use "add" to attach listeners and "remove" to detach them.
 */
function boardListenerDropAreas(action) {
  const toDoContainer = document.getElementById('toDo-container');
  const inProgressContainer = document.getElementById('inProgress-container');
  const awaitFeedbackContainer = document.getElementById('awaitFeedback-container');
  const doneContainer = document.getElementById('done-container');

  if (action === "add") {
    toDoContainer?.addEventListener('drop', handleDrop);
    inProgressContainer?.addEventListener('drop', handleDrop);
    awaitFeedbackContainer?.addEventListener('drop', handleDrop);
    doneContainer?.addEventListener('drop', handleDrop);
  } else if (action === "remove") {
    toDoContainer?.removeEventListener('drop', handleDrop);
    inProgressContainer?.removeEventListener('drop', handleDrop);
    awaitFeedbackContainer?.removeEventListener('drop', handleDrop);
    doneContainer?.removeEventListener('drop', handleDrop);
  }
}


/**
 * Manages event listeners for the search input and the task category containers.
 * Depending on the action parameter, this function adds or removes
 * event listeners for the input event on the search input field and
 * the dragover and dragleave events on the task category containers.
 *
 * @param {string} action - Determines whether to add or remove listeners.
 *                          Use "add" to attach listeners and "remove" to detach them.
 */
function boardListenerMisc(action) {
  const searchInput = document.getElementById("searchInput");
  const container = document.querySelectorAll('.taskCategoryContainer');

  if (action === "add") {
    searchInput?.addEventListener('input', handleSearchInput);
    container?.forEach((element) => {
      element.addEventListener('dragover', allowDrop);
      element.addEventListener('dragleave', dragLeave);
    });
  } else if (action === "remove") {
    searchInput?.removeEventListener('input', handleSearchInput);
    container?.forEach((element) => {
      element.removeEventListener('dragover', allowDrop);
      element.removeEventListener('dragleave', dragLeave);
    });
  }
}


/**
 * Handles the click event for the add task buttons on the board.
 * - Checks the ID of the event target to determine the task category.
 * - Invokes the checkScreenWidth function with the appropriate task category
 *   ("inProgress", "awaitFeedback", or "toDo") based on the target's ID.
 * 
 * @param {Event} event - The event object representing the click event.
 */
function handleAddTaskBtnClick(event) {
  if (event.target.id === "addTaskInProgress") checkScreenWidth("inProgress");
  else if (event.target.id === "addTaskFeedback") checkScreenWidth("awaitFeedback");
  else checkScreenWidth("toDo");
};


/**
 * Handles the input event for the search input field on the board.
 * - Retrieves the search input value from the search input field.
 * - Invokes the searchTasks function with the retrieved value to update the
 *   visibility of tasks on the board.
 * 
 * @returns {void}
 */
function handleSearchInput() {
  const searchInput = document.getElementById("searchInput");
  searchTasks(searchInput.value);
}


//NOTE - Drag and drop listeners and handlers for the board page


/**
 * Attaches event listeners to the tasks on the board for drag and drop
 * functionality. This function is used to activate drag and drop
 * functionality for the tasks on the board.
 */
export function dragDrop() {
  document.querySelectorAll(".todoContainer").forEach((todoContainer) => {
    todoContainer.addEventListener('click', handleToDoClick);
    todoContainer.addEventListener("dragstart", handleDragStart);
    todoContainer.addEventListener("dragend", handleDragEnd);
  });
}


/**
 * Removes event listeners for drag and drop functionality from the tasks on the board.
 * This function is used to deactivate drag and drop functionality for the tasks on the board.
 */
export function deactivateDragDrop() {
  document.querySelectorAll(".todoContainer").forEach((todoContainer) => {
    todoContainer.removeEventListener('click', handleToDoClick);
    todoContainer.removeEventListener("dragstart", handleDragStart);
    todoContainer.removeEventListener("dragend", handleDragEnd);
  });
}


/**
 * Prevents the default behavior of a dragover event and highlights
 * the relevant taskDragArea element if the event target is a taskDragArea
 * or if the event target is a child of a taskDragArea element.
 * 
 * @param {object} event - The event object for the dragover event.
 */
function allowDrop(event) {
  const dropTarget = event.target;
  const dropAreas = document.querySelectorAll('.taskDragArea');
  dropAreas.forEach(area => {
    if (area === dropTarget || area.contains(dropTarget)) {
      event.preventDefault();
      area.classList.add('highlightedBackground');
    }
  });
}


/**
 * Removes the 'highlightedBackground' class from all taskDragArea elements
 * to remove the background highlight when a drag event leaves a taskDragArea.
 */
function dragLeave() {
  document.querySelectorAll('.taskDragArea').forEach((zone) => {
    zone.classList.remove('highlightedBackground');
  });
}


/**
 * Handles the drop event for a taskDragArea element.
 * - Prevents the default dragover and drop behavior.
 * - Initiates the process to move a task to a new board category
 *   by calling the moveTo function.
 * @param {object} event - The event object for the drop event.
 */
function handleDrop(event) {
  event.preventDefault();
  moveTo(event.target.id);
}


/**
 * Handles the click event for a todo element on the board.
 * - Retrieves the closest ancestor element with the class "todoContainer" from the event target.
 * - Prevents event propagation up the DOM tree.
 * - Invokes the openOverlay function with the todo element's ID to open the overlay for the task.
 * @param {Event} e - The event object representing the click event.
 */
function handleToDoClick(e) {
  const target = e.target.closest(".todoContainer");
  e.stopPropagation();
  openOverlay(target.id);
}


/**
 * Handles the dragstart event for a todo element on the board.
 * - Adds the class "tilted" to the target element to apply the tilted animation.
 * - Invokes the startDragging function with the target element's ID to initiate the drag event.
 * @param {Event} e - The event object representing the dragstart event.
 */
function handleDragStart(e) {
  e.target.classList.add("tilted");
  startDragging(e.target.id);
}


/**
 * Handles the dragend event for a todo element on the board.
 * - Removes the "tilted" class from the target element to reset its appearance.
 * - Invokes the dragEnd function to finalize the drag event.
 * 
 * @param {Event} e - The event object representing the dragend event.
 */
function handleDragEnd(e) {
  e.target.classList.remove("tilted");
  dragEnd();
}


//NOTE - Overlay listeners and handlers for the board page


/**
 * Activates all listeners for the overlay for a specific task element on the board.
 * Listeners are for handling the following events:
 * - Clicking on the overlay buttons (edit, delete, archive)
 * - Clicking on the subtask buttons (edit, delete)
 * - Clicking outside the overlay (close the overlay)
 * @param {string} elementId - The ID of the task element to activate the overlay for.
 * @returns {void}
 */
export function activateOverlayListeners(elementId) {
  boardListenerOverlayButtons("add");
  boardListenerOverlaySubtasks("add");
}


/**
 * Deactivates all listeners for the overlay for a specific task element on the board.
 * This function removes event listeners for:
 * - Overlay buttons (edit, delete, archive)
 * - Subtask buttons (edit, delete)
 */
export function deactivateOverlayListeners() {
  boardListenerOverlayButtons("remove");
  boardListenerOverlaySubtasks("remove");
}


/**
 * Manages event listeners for the overlay buttons (edit, delete, archive).
 * Depending on the action parameter, this function adds or removes
 * event listeners for the following events:
 * - Clicking on the overlay close button (close the overlay)
 * - Clicking on the overlay edit button (open the edit task modal)
 * - Clicking on the overlay delete button (open the delete task modal)
 * 
 * @param {string} action - Determines whether to add or remove listeners. 
 *                          Use "add" to attach listeners and "remove" to detach them.
 */
function boardListenerOverlayButtons(action) {
  const closeBtn = document.getElementById("modalCloseBtn");
  const editBtn = document.getElementById("modalContainerEditBtn");
  const deleteBtn = document.getElementById("modalContainerDeleteBtn");

  if (action === "add") {
    closeBtn?.addEventListener("click", closeModal);
    editBtn?.addEventListener('click', handleOverlayEditClick);
    deleteBtn?.addEventListener('click', handleOverlayDeleteClick);
  } else if (action === "remove") {
    closeBtn?.removeEventListener("click", closeModal);
    editBtn?.removeEventListener('click', handleOverlayEditClick);
    deleteBtn?.removeEventListener('click', handleOverlayDeleteClick);
  }
}


/**
 * Manages event listeners for subtask elements within the overlay.
 * Depending on the action parameter, this function adds or removes
 * click event listeners for each subtask in the modal.
 * 
 * @param {string} action - Determines whether to add or remove listeners. 
 *                          Use "add" to attach listeners and "remove" to detach them.
 */
function boardListenerOverlaySubtasks(action) {
  const subtasks = document.querySelectorAll('.modalSubtasksSingle');
  if (action === "add") {
    subtasks?.forEach(subtask => subtask.addEventListener('click', handleSubtaskClick));
  } else if (action === "remove") {
    subtasks?.forEach(subtask => subtask.removeEventListener('click', handleSubtaskClick));
  }
}


/**
 * Handles the click event for a subtask element within the overlay.
 * - Retrieves the data-subtaskindex attribute from the closest ancestor with the class "modalSubtasksSingle"
 *   to determine the index of the subtask that was clicked.
 * - Retrieves the data-id attribute from the closest ancestor with the ID "modalContainer" to determine
 *   the ID of the task that the subtask belongs to.
 * - Invokes the updateSubtaskStatus function with the task ID and subtask index to toggle the subtask's status.
 * @param {Event} event - The event object representing the click event.
 */
function handleSubtaskClick(event) {
  const subtaskIndex = event.target.closest('.modalSubtasksSingle').dataset.subtaskindex;
  const taskId = event.target.closest('#modalContainer').dataset.id;
  updateSubtaskStatus(taskId, subtaskIndex);
}


/**
 * Handles the click event for the overlay edit button.
 * - Retrieves the data-id attribute from the closest ancestor with the ID "modalContainer" to determine
 *   the ID of the task to edit.
 * - Invokes the enableTaskEdit function with the task ID to open the edit task modal.
 * @param {Event} event - The event object representing the click event.
 */
function handleOverlayEditClick(event) {
  const taskId = event.target.closest('#modalContainer').dataset.id;
  enableTaskEdit(taskId);
}


/**
 * Handles the click event for the overlay delete button.
 * - Retrieves the data-id attribute from the closest ancestor with the ID "modalContainer" to determine
 *   the ID of the task to delete.
 * - Invokes the deleteTask function with the task ID to delete the task.
 * - Invokes the activateOutsideCheck function with the event, 'deleteResponse' as the modal name,
 *   and 'ts0' and 'ts1' as the class names for the outside click check.
 * - Invokes the activateDeleteResponseListeners function to activate listeners for the delete response modal.
 * @param {Event} event - The event object representing the click event.
 */
function handleOverlayDeleteClick(event) {
  const taskId = event.target.closest('#modalContainer').dataset.id;
  deleteTask(taskId);
  activateOutsideCheck(event, 'deleteResponse', 'ts0', 'ts1');
  activateDeleteResponseListeners();
}


/**
 * Handles the outside click event for the overlay and add task overlay.
 * If the target of the event is either the overlay or the add task overlay,
 * the function closes the modal, deactivates the overlay listeners, and
 * deactivates all add task listeners.
 * @param {Event} event - The event object representing the click event.
 */
export function handleOverlayOutsideClick(event) {
  const overlay = document.getElementById("overlay");
  const addTaskOverlay = document.getElementById("addTaskOverlay");
  if (event.target === overlay || event.target === addTaskOverlay) {
    closeModal();
    deactivateOverlayListeners();
    deactivateAllAddTaskListeners();
  }
}


//NOTE - Delete Response listeners and handlers for the board page


/**
 * Activates event listeners for the delete response modal.
 * - Attaches a submit event listener to the delete task form to handle the form submission.
 * - Attaches a click event listener to the "No" button in the delete response modal to close the modal.
 */
export function activateDeleteResponseListeners() {
  const deleteTaskForm = document.getElementById("deleteTaskForm");
  const cancelBtn = document.getElementById("deleteTaskNo");
  deleteTaskForm?.addEventListener('submit', handleDeleteTaskFormSubmit);
  cancelBtn?.addEventListener('click', handleDeleteTaskNo);
}


/**
 * Deactivates event listeners for the delete response modal.
 * - Removes the submit event listener from the delete task form.
 * - Removes the click event listener from the "No" button in the delete response modal.
 */
export function deactivateDeleteResponseListeners() {
  const deleteTaskForm = document.getElementById("deleteTaskForm");
  const cancelBtn = document.getElementById("deleteTaskNo");
  deleteTaskForm?.removeEventListener('submit', handleDeleteTaskFormSubmit);
  cancelBtn?.removeEventListener('click', handleDeleteTaskNo);
}


/**
 * Handles the submit event for the delete task form.
 * - Prevents the default form submission behavior.
 * - Retrieves the data-id attribute from the form to determine the ID of the task to delete.
 * - Invokes the deleteTaskSure function with the task ID to delete the task.
 * @param {Event} event - The event object representing the submit event.
 */
function handleDeleteTaskFormSubmit(event) {
  event.preventDefault();
  const taskId = event.target.dataset.id;
  deleteTaskSure(taskId);
}


/**
 * Handles the click event for the "No" button in the delete response modal.
 * - Prevents the default click behavior.
 * - Toggles the visibility of the delete response modal.
 * - Deactivates event listeners associated with the delete response modal.
 * @param {Event} event - The event object representing the click event.
 */
function handleDeleteTaskNo(event) {
  event.preventDefault();
  toggleClass('deleteResponse', 'ts0', 'ts1');
  deactivateDeleteResponseListeners();
}


//NOTE - Edit Task listeners and handlers for the board page


/**
 * Activates event listeners for editing tasks.
 * - Sets up listeners for general task editing functionality, 
 *   the assignment menu, and subtask interactions.
 * - Invokes the activation of subtask-related listeners.
 */
export function activateEditTaskListeners() {
  boardListenerEditTaskGeneral("add");
  boardListenerEditTaskAssignMenu("add");
  boardListenerEditTaskSubtasks("add");
  activateSubtaskListeners();
}


/**
 * Deactivates event listeners for editing tasks.
 * - Removes listeners for general task editing functionality, 
 *   the assignment menu, and subtask interactions.
 * - Invokes the deactivation of subtask-related listeners.
 */
export function deactivateEditTaskListeners() {
  boardListenerEditTaskGeneral("remove");
  boardListenerEditTaskAssignMenu("remove");
  boardListenerEditTaskSubtasks("remove");
  deactivateSubtaskListeners();
}


/**
 * Manages event listeners for the general task editing functionality.
 * Depending on the action parameter, this function adds or removes
 * event listeners for submitting the edit task form, closing the edit task
 * modal, and changing the priority of a task.
 * 
 * @param {string} action - Determines whether to add or remove listeners. 
 *                          Use "add" to attach listeners and "remove" to detach them.
 */
function boardListenerEditTaskGeneral(action) {
  const editTaskForm = document.getElementById("editTaskForm");
  const closebtn = document.getElementById("editTaskCloseBtn");
  const prio = document.querySelectorAll('.prioBtn');

  if (action === "add") {
    editTaskForm?.addEventListener('submit', handleEditTaskFormSubmit);
    closebtn?.addEventListener('click', closeModal);
    prio?.forEach((element) => element.addEventListener('click', handlePrioClick));
  } else if (action === "remove") {
    editTaskForm?.removeEventListener('submit', handleEditTaskFormSubmit);
    closebtn?.removeEventListener('click', closeModal);
    prio?.forEach((element) => element.removeEventListener('click', handlePrioClick));
  }
}


/**
 * Manages event listeners for the assign menu of the edit task form.
 * Depending on the action parameter, this function adds or removes
 * event listeners for toggling the assign dropdown and performing a search
 * in the assign dropdown.
 * 
 * @param {string} action - Determines whether to add or remove listeners. 
 *                          Use "add" to attach listeners and "remove" to detach them.
 */
function boardListenerEditTaskAssignMenu(action) {
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
 * Manages event listeners for the subtask-related elements in the edit task form.
 * Depending on the action parameter, this function adds or removes
 * event listeners for adding new subtasks, handling keypress events on the subtask input,
 * clearing the subtask input field, and saving a subtask.
 *
 * @param {string} action - Determines whether to add or remove listeners. 
 *                          Use "add" to attach listeners and "remove" to detach them.
 */
function boardListenerEditTaskSubtasks(action) {
  const subtasksInputContainer = document.getElementById("subtasksInputContainer");
  const subtaskInput = document.getElementById("subtaskInput");
  const subtaskDeleteIcon = document.getElementById('subtaskDeleteIcon');
  const subtaskSaveIcon = document.getElementById('subtaskSaveIcon');

  if (action === "add") {
    subtasksInputContainer?.addEventListener('click', addNewSubtask);
    subtaskInput?.addEventListener('keypress', handleKeyDown);
    subtaskDeleteIcon?.addEventListener('click', clearSubtaskInput);
    subtaskSaveIcon?.addEventListener('click', saveSubtask);
  } else if (action === "remove") {
    subtasksInputContainer?.removeEventListener('click', addNewSubtask);
    subtaskInput?.removeEventListener('keypress', handleKeyDown);
    subtaskDeleteIcon?.removeEventListener('click', clearSubtaskInput);
    subtaskSaveIcon?.removeEventListener('click', saveSubtask);
  }
}


/**
 * Handles the submit event of the edit task form.
 * - Prevents the default form submission behavior.
 * - Retrieves the task ID from the form element.
 * - Calls the form validation function and if successful, calls the saveEditedTask function with the retrieved task ID.
 * @param {Event} event - The event object representing the submit event.
 */
function handleEditTaskFormSubmit(event) {
  event.preventDefault();
  const taskId = event.target.closest('#editTaskForm').dataset.id;
  if (formValidation()) saveEditedTask(taskId);
}


/**
 * Handles the click event on the priority buttons in the edit task form.
 * Retrieves the closest .prioBtn element from the target element and if it exists,
 * calls the setPrio function with the retrieved element as an argument.
 * @param {Event} event - The event object representing the click event.
 */
export function handlePrioClick(event) {
  const prioElement = event.target.closest('.prioBtn');
  if (!prioElement) return;
  setPrio(prioElement);
}


/**
 * Handles the click event on the "Assign to project" button for a contact.
 * - Prevents the default link behavior.
 * - Retrieves the contact ID from the closest element with the class .assignContactToProject.
 * - Calls the contactAssign function with the retrieved contact ID.
 * @param {Event} event - The event object representing the click event.
 */
export function handleAssignContact(event) {
  event.preventDefault();
  const contact = event.target.closest('.assignContactToProject').dataset.id;
  contactAssign(contact);
}


//NOTE - General functions for the board page


document.addEventListener("DOMContentLoaded", () => {
  const category = localStorage.getItem('taskCategory');
  if (category) localStorage.removeItem('taskCategory');
});
