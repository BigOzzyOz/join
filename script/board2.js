import { tasks, changeActive, updateDataInDatabase } from "../script.js";
import { assignedContacts, setAssignedContacts, renderAssignedContacts, currentPrio, updatePrioActiveBtn } from "./addTask.js";
import { createTaskArray, updateSubtaskProgressBar, initDragDrop, applyCurrentSearchFilter, currentDraggedElement } from "./board.js";
import { fetchAddTaskTemplate, generateOpenOverlayHTML, generateTaskEditHTML } from "./boardtemplate.js";
import { activateEditTaskListeners, activateOverlayListeners, deactivateOverlayListeners } from "./board-listener.js";
import { activateAddTaskListeners } from "./addTask-listener.js";
import { token, BASE_URL } from "./api-init.js";


//NOTE - global variable for board2.js


let currentTaskStatus;


//NOTE - Overlay functions


/**
 * Checks the screen width and redirects to the add task page
 * if the width is below 992px or opens the add task overlay if
 * the width is above 992px.
 * @param {string} category - The category that should be set as active
 * @returns {void}
 */
export function checkScreenWidth(category) {
  const screenWidth = window.innerWidth;
  const activeTab = document.querySelector('.menuBtn[href="../html/addtask.html"]');
  sessionStorage.setItem('taskCategory', category);
  if (screenWidth < 992) {
    changeActive(activeTab);
    window.location.href = "../html/addtask.html";
  } else openAddTaskOverlay();
}


/**
 * Opens the add task overlay by fetching and displaying the task template.
 * - Clears the list of assigned contacts.
 * - Sets the inner HTML of the overlay to the fetched template.
 * - Displays the overlay by setting its style to "block".
 * - Activates the necessary event listeners for the add task overlay.
 * @async
 * @returns {Promise<void>}
 */
async function openAddTaskOverlay() {
  let addTaskOverlay = document.getElementById("addTaskOverlay");
  setAssignedContacts([]);
  addTaskOverlay.innerHTML = await fetchAddTaskTemplate();
  addTaskOverlay.style.display = "block";
  activateAddTaskListeners();
}


/**
 * Opens the overlay for the given task ID.
 * @function
 * @param {string} elementId - The ID of the task to open the overlay for.
 */
export function openOverlay(elementId) {
  let element = tasks.find((task) => task.id === elementId);
  let overlay = document.getElementById("overlay");
  setAssignedContacts([]);
  overlay.innerHTML = generateOpenOverlayHTML(element);
  activateOverlayListeners(elementId);
  overlay.style.display = "block";
}


/**
 * Closes any open overlay/modal by removing the display block and
 * removing the "modalOpen" class from the body.
 * @function
 */
export function closeModal() {
  const overlay = document.getElementById("overlay");
  const addTaskOverlay = document.getElementById("addTaskOverlay");
  deactivateOverlayListeners();
  if (overlay || addTaskOverlay) {
    overlay.style.display = "none";
    addTaskOverlay.style.display = "none";
  }
  document.body.classList.remove("modalOpen");
}


//NOTE - Subtask functions


/**
 * Updates the status of a subtask in the DOM and database.
 * - Retrieves the task object from the tasks array using the provided taskId.
 * - Retrieves the subtask object from the task.subtasks array using the provided subtaskIndex.
 * - If the subtask object exists, updates its status in the DOM by calling updateSubtaskStatusInDOM.
 * - Updates the subtask progress bar in the DOM by calling updateSubtaskProgressBar.
 * - Updates the task object in the database by calling updateDataInDatabase.
 * - Updates the tasks array in session storage by calling createTaskArray and replacing the old task object with the new one.
 * @param {string} taskId - The ID of the task.
 * @param {number} subtaskIndex - The index of the subtask in the task.subtasks array.
 * @returns {Promise<void>}
 */
export async function updateSubtaskStatus(taskId, subtaskIndex) {
  let task = tasks.find((task) => task.id === taskId);
  if (task) {
    let subtask = task.subtasks[subtaskIndex];
    if (subtask) {
      updateSubtaskStatusInDOM(subtask, subtaskIndex);
      updateSubtaskProgressBar(task.subtasks, taskId);
      await updateDataInDatabase(`${BASE_URL}tasks/${taskId}.json?auth=${token}`, task);
      let taskIndex = tasks.findIndex(t => taskId === t.id);
      tasks.splice(taskIndex, 1, await createTaskArray(taskId, task));
      sessionStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }
}


/**
 * Updates the DOM to reflect the current status of a subtask.
 * Toggles the subtask's status between "checked" and "unchecked" and updates
 * the checkbox image source in the DOM accordingly.
 *
 * @param {Object} subtask - The subtask object whose status is being updated.
 * @param {number} index - The index of the subtask, used to locate the corresponding
 *                         checkbox element in the DOM.
 */
function updateSubtaskStatusInDOM(subtask, index) {
  subtask.status = subtask.status === "checked" ? "unchecked" : "checked";

  const subtaskCheckbox = document.getElementById(`subtaskCheckbox${index}`);
  if (subtaskCheckbox) {
    subtaskCheckbox.src = subtask.status === "checked"
      ? "../assets/icons/checkboxchecked.svg"
      : "../assets/icons/checkbox.svg";
  }
}


//NOTE - Edit task functions


/**
 * Enables the edit task modal.
 * - Retrieves the task with the given id and
 *   populates the edit task form with its data.
 * - Updates the priority button based on the task's priority.
 * - Calls functions to activate event listeners for the edit task form.
 * @param {string} taskId - the id of the task to edit
 */
export function enableTaskEdit(taskId) {
  let modalContainer = document.getElementById("modalContainer");
  modalContainer.innerHTML = generateTaskEditHTML(taskId);
  let task = tasks.find((task) => task.id === taskId);
  if (task.assignedTo) setAssignedContacts(task.assignedTo);
  currentTaskStatus = task.status;
  document.getElementById("editTaskTitle").value = task.title;
  document.getElementById("editTaskDescription").value = task.description;
  document.getElementById("editDateInput").value = task.date;
  updatePrioActiveBtn(task.prio);
  renderAssignedContacts();
  activateEditTaskListeners();
}


/**
 * Creates an edited task object based on the current user inputs and original task data.
 * - Searches for the original task by its ID from the tasks array.
 * - Retrieves all subtasks from the document and assigns their text and status.
 * - If the original task has subtasks, assigns the corresponding status to each subtask.
 * - Returns an edited task object containing updated subtask information.
 * 
 * @param {string} taskId - The ID of the task to be edited.
 * @returns {Object} - An object containing the edited task properties.
 */
function createEditedTask(taskId) {
  let originalTask = tasks.find(task => task.id === taskId);
  if (!originalTask) return;
  let subtasks = [];
  document.querySelectorAll('#subtaskList .subtaskItem').forEach((subtaskItem, index) => {
    const subtaskText = subtaskItem.querySelector('span').innerText;
    let status = 'unchecked';
    if (originalTask.subtasks && originalTask.subtasks[index]) {
      status = originalTask.subtasks[index].status ? originalTask.subtasks[index].status : 'unchecked';
    }
    subtasks.push({ text: subtaskText, status: status });
  });
  return createEditedTaskReturn(subtasks, originalTask);
}


/**
 * Creates an object with all the edited task properties.
 * @param {Object[]} subtasks - An array of subtasks with their text and status.
 * @param {Object} originalTask - The original task object.
 * @returns {Object} - An object with edited task properties.
 */
function createEditedTaskReturn(subtasks, originalTask) {
  return {
    title: document.getElementById('editTaskTitle').value,
    description: document.getElementById('editTaskDescription').value,
    date: document.getElementById('editDateInput').value,
    prio: currentPrio,
    status: currentTaskStatus,
    subtasks: subtasks,
    assignedTo: assignedContacts,
    category: originalTask.category,
  };
}


/**
 * Saves the edited task with the given taskId.
 * - Creates the edited task data from user input.
 * - Updates the task data in the database.
 * - Updates the task in the tasks array.
 * - Saves the tasks array to session storage.
 * - Opens the overlay for the edited task.
 * - Initializes drag drop and applies the current search filter.
 * @param {string} taskId - The id of the task to be edited.
 */
export async function saveEditedTask(taskId) {
  const task = createEditedTask(taskId);
  await updateDataInDatabase(`${BASE_URL}tasks/${taskId}.json?auth=${token}`, task);
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  tasks.splice(taskIndex, 1, await createTaskArray(taskId, task));
  sessionStorage.setItem("tasks", JSON.stringify(tasks));
  openOverlay(taskId);
  initDragDrop();
  applyCurrentSearchFilter();
}


/**
 * Move a task to a new status.
 * - Highlights all task drag areas.
 * - Finds the task to move by its id in currentDraggedElement.
 * - Updates the task status in the database.
 * - Updates the task status in the tasks array.
 * - Saves the tasks array to session storage.
 * - Initializes drag drop and applies current search filter.
 * @param {string} newStatus - The new status for the task.
 */
export async function moveTo(newStatus) {
  document.querySelectorAll(".taskDragArea").forEach((area) => {
    area.classList.add("highlighted");
  });

  const taskToMove = tasks.find(task => task.id === currentDraggedElement);
  if (taskToMove && newStatus) {
    taskToMove.status = newStatus;
    await updateDataInDatabase(`${BASE_URL}tasks/${taskToMove.id}.json?auth=${token}`, taskToMove);

    const taskIndex = tasks.findIndex(task => task.id === taskToMove.id);
    tasks.splice(taskIndex, 1, await createTaskArray(taskToMove.id, taskToMove));
    sessionStorage.setItem("tasks", JSON.stringify(tasks));

    initDragDrop();
    applyCurrentSearchFilter();
  }
}
