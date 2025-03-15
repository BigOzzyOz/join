import { BASE_URL, contacts, tasks, loadData, updateData } from "../script.js";
import { updateNoTasksFoundVisibility, activateListeners, openOverlay } from "./board2.js";
import { getContactsData } from "./contacts.js";
import { generateTodoHTML } from "./boardtemplate.js";

export let currentDraggedElement;
let currentSearchInput = '';
export let currentTaskStatus;



/**
 * The `initBoard` function initializes the board by setting up tasks, checking data, storing tasks in
 * session storage, enabling drag and drop functionality, and applying search filters.
 */
async function initBoard() {
  try {
    await initCheckData();
    sessionStorage.setItem("tasks", JSON.stringify(tasks));
    activateListeners();
    initDragDrop();
    applyCurrentSearchFilter();
  } catch (error) {
    console.error("Initialisation error:", error);
  }
}


/**
 * The function `initCheckData` checks if there are tasks, toggles a loader, processes tasks by
 * checking for deleted users, or pushes data to an array if no tasks exist, and toggles the loader
 * again.
 */
export async function initCheckData() {
  let loader = document.querySelector('.loader');
  if (loader) loader.classList.toggle('dNone');
  if (tasks.length > 0) {
    for (let i = 0; i < tasks.length; i++) {
      tasks[i] = await checkDeletedUser(tasks[i]);
    }
  } else {
    await pushDataToArray();
  }
  if (loader) loader.classList.toggle('dNone');
}



/**
 * The function `pushDataToArray` asynchronously loads data for tasks, processes each task, and pushes
 * them into an array while handling errors.
 */
async function pushDataToArray() {
  try {
    let tasksData = await loadData("tasks");
    tasks.length = 0;
    for (const key in tasksData) {
      let singleTask = tasksData[key];
      if (!singleTask) continue;
      let task = await createTaskArray(key, singleTask);
      task = await checkDeletedUser(task);
      tasks.push(task);
    }
  } catch (error) {
    console.error("Error pushing tasks to array:", error);
  }
}



/**
 * The function `checkDeletedUser` checks if a user has been deleted and updates the task accordingly.
 * @param loadedTask - `loadedTask` is an object representing a task that has been loaded. It may
 * contain information such as the task details, assigned users, etc.
 * @returns The function `checkDeletedUser` is returning the `updatedTask` after performing some checks
 * and updates.
 */
async function checkDeletedUser(loadedTask) {
  contacts.length == 0 ? await getContactsData() : null;
  let updatedTask = loadedTask;
  if (loadedTask.assignedTo) {
    let highestId = updatedTask.assignedTo.reduce((maxId, user) => {
      return Math.max(maxId, user.id);
    }, -Infinity);
    updatedTask = await checkContactChange(updatedTask, highestId);
  }
  return updatedTask;
}


/**
 * The function `checkContactChange` iterates through assigned contacts in an updated task, removes any
 * contacts not found in the contacts array, and updates existing contacts if they have changed.
 * @param updatedTask - The `updatedTask` parameter is an object representing a task that has been
 * updated with new information. It contains an array called `assignedTo` which likely holds contact
 * information for the task assignees.
 * @param highestId - The `highestId` parameter in the `checkContactChange` function is used as the
 * starting point for iterating over the `updatedTask.assignedTo` array. It helps in determining the
 * range of indices to check for changes in the assigned contacts. The loop starts from `highestId` and
 * iter
 * @returns The `updatedTask` object is being returned after checking for any changes in the
 * `assignedTo` array and updating it if necessary.
 */
async function checkContactChange(updatedTask, highestId) {
  for (let i = highestId; i >= 0; i--) {
    let c = updatedTask.assignedTo[i];
    if (!c) continue;
    if (contacts.findIndex(cont => cont.id === c.id) === -1) {
      updatedTask.assignedTo.splice(i, 1);
      await updateData(`${BASE_URL}tasks/${updatedTask.id}/assignedTo.json`, updatedTask.assignedTo);
    } else if (compareContact(c)) {
      updatedTask.assignedTo[i] = contacts[contacts.findIndex(cont => cont.id === c.id)];
      await updateData(`${BASE_URL}tasks/${updatedTask.id}/assignedTo.json`, updatedTask.assignedTo);
    }
  }
  return updatedTask;
}


/**
 * The function `compareContact` checks if the properties of a given contact object differ from the
 * corresponding properties of a contact in an array.
 * @param contact - The `compareContact` function is designed to compare the properties of a given
 * `contact` object with the corresponding properties of a contact in an array named `contacts`. The
 * function checks if any of the properties (`name`, `email`, `phone`, `profilePic`, `firstLetters`) of
 * the
 * @returns The `compareContact` function is returning a boolean value indicating whether any of the
 * properties (name, email, phone, profilePic, firstLetters) of the contact object passed as an
 * argument are different from the corresponding properties of the contact object in the `contacts`
 * array with the same `id`.
 */
function compareContact(contact) {
  return (
    contacts[contacts.findIndex(cont => cont.id === contact.id)].name !== contact.name ||
    contacts[contacts.findIndex(cont => cont.id === contact.id)].email !== contact.email ||
    contacts[contacts.findIndex(cont => cont.id === contact.id)].phone !== contact.phone ||
    contacts[contacts.findIndex(cont => cont.id === contact.id)].profilePic !== contact.profilePic ||
    contacts[contacts.findIndex(cont => cont.id === contact.id)].firstLetters !== contact.firstLetters
  );
}


/**
 * Updates all task categories by calling updateTaskCategories for each status.
 */
export function updateAllTaskCategories() {
  updateTaskCategories("toDo", "toDo", "No tasks to do");
  updateTaskCategories("inProgress", "inProgress", "No tasks in progress");
  updateTaskCategories("awaitFeedback", "awaitFeedback", "No tasks await feedback");
  updateTaskCategories("done", "done", "No tasks done");
}


/**
 * Creates a task array from the given key and task data.
 * 
 * @async
 * @param {string} key - The task ID.
 * @param {Object} singleTask - The task data.
 * @returns {Promise<Object>} The created task object.
 */
export async function createTaskArray(key, singleTask) {
  let task = {
    "id": key,
    "assignedTo": singleTask.assignedTo,
    "category": singleTask.category,
    "date": singleTask.date,
    "description": singleTask.description,
    "prio": singleTask.prio,
    "status": singleTask.status,
    "subtasks": singleTask.subtasks,
    "title": singleTask.title,
  };
  return task;
}


/**
 * Updates the task categories based on the status and renders them in the specified category element.
 * 
 * @param {string} status - The status of the tasks to update.
 * @param {string} categoryId - The ID of the category element to update.
 * @param {string} noTaskMessage - The message to display if there are no tasks.
 */
function updateTaskCategories(status, categoryId, noTaskMessage) {
  let taskForSection = tasks.filter((task) => task.status === status);
  let categoryElement = document.getElementById(categoryId);
  if (!categoryElement) return;
  categoryElement.innerHTML = "";
  if (taskForSection.length > 0) {
    taskForSection.forEach((element) => {
      categoryElement.innerHTML += generateTodoHTML(element);
      if (element.subtasks && element.subtasks.length > 0) {
        updateSubtasksProgressBar(element.subtasks, element.id);
      }
    });
  } else {
    if (categoryElement) categoryElement.innerHTML = `<div class="noTaskPlaceholder">${noTaskMessage}</div>`;
  }
}


/**
 * Updates the progress bar for the subtasks of a task.
 * 
 * @param {Object[]} subtasks - The list of subtasks.
 * @param {string} taskId - The ID of the task.
 */
export function updateSubtasksProgressBar(subtasks, taskId) {
  let checkedAmt = subtasks.filter(
    (subtask) => subtask.status === "checked"
  ).length;
  let percent = Math.round((checkedAmt / subtasks.length) * 100);
  document.getElementById(
    `subtasksProgressbarProgress${taskId}`
  ).style.width = `${percent}%`;
  document.getElementById(
    `subtasksProgressbarText${taskId}`
  ).innerHTML = `${checkedAmt}/${subtasks.length} Subtasks`;
}


/**
 * Initializes the drag and drop functionality by updating all task categories 
 * and setting up the drag and drop handlers.
 */
export function initDragDrop() {
  updateAllTaskCategories();
  dragDrop();
}


/**
 * Sets up drag and drop functionality for task containers.
 */
function dragDrop() {
  document.querySelectorAll(".todoContainer").forEach((todoContainer) => {
    todoContainer.addEventListener('click', handleToDoClick);
    todoContainer.addEventListener("dragstart", handleDragStart);
    todoContainer.addEventListener("dragend", handleDragEnd);
  });
}


export function deactivateDragDrop() {
  document.querySelectorAll(".todoContainer").forEach((todoContainer) => {
    todoContainer.removeEventListener('click', handleToDoClick);
    todoContainer.removeEventListener("dragstart", handleDragStart);
    todoContainer.removeEventListener("dragend", handleDragEnd);
  });
}

function handleDragStart(e) {
  e.target.classList.add("tilted");
  startDragging(e.target.id);
}

function handleDragEnd(e) {
  e.target.classList.remove("tilted");
  dragEnd();
}

function handleToDoClick(e) {
  const target = e.target.closest(".todoContainer");
  e.stopPropagation();
  openOverlay(target.id);
}


/**
 * Starts dragging an element with the given ID.
 * 
 * @param {string} id - The ID of the element to drag.
 */
function startDragging(id) {
  currentDraggedElement = id;
  document.querySelectorAll(".taskDragArea").forEach((zone) => {
    zone.classList.add("highlighted");
  });
}


/**
 * Removes drag-related highlights from all task drop areas.
 */
function dragEnd() {
  document.querySelectorAll('.taskDragArea').forEach((zone) => {
    zone.classList.remove('highlighted', 'highlightedBackground');
  });
}


/**
 * Applies the current search filter to update the visibility of tasks.
 */
export function applyCurrentSearchFilter() {
  if (currentSearchInput) {
    searchTasks(currentSearchInput);
  }
}


/**
 * The function `searchTasks` searches for tasks based on the input value and updates the visibility of
 * task cards accordingly.
 * @param inputValue - The `inputValue` parameter in the `searchTasks` function represents the search
 * query entered by the user to search for tasks. This value is used to filter and search through the
 * task cards based on their titles or descriptions.
 */
export function searchTasks(inputValue) {
  emptyDragAreaWhileSearching(inputValue);
  currentSearchInput = inputValue.toLowerCase();
  const taskCards = document.querySelectorAll(".todoContainer");
  let anyVisibleTask = searchForTitleOrDescription(taskCards, currentSearchInput);
  updateNoTasksFoundVisibility(anyVisibleTask);
}


/**
 * The function `searchForTitleOrDescription` iterates through task cards, searches for a specific
 * input in titles or descriptions, and displays/hides the task cards accordingly while returning a
 * boolean indicating if any task is visible.
 * @param taskCards - An array of HTML elements representing task cards on a webpage. Each task card
 * contains elements with classes "toDoHeader" and "toDoDescription" that hold the title and
 * description of the task respectively.
 * @param currentSearchInput - The `currentSearchInput` parameter is the search term that the user has
 * entered to search for a specific title or description within the task cards.
 * @returns The function `searchForTitleOrDescription` returns a boolean value indicating whether there
 * are any visible tasks matching the current search input in the task cards.
 */
function searchForTitleOrDescription(taskCards, currentSearchInput) {
  let anyVisibleTask = false;
  taskCards.forEach((taskCard) => {
    const titleElement = taskCard.querySelector(".toDoHeader");
    const descriptionElement = taskCard.querySelector(".toDoDescription");
    if (titleElement || descriptionElement) {
      const title = titleElement.textContent.trim().toLowerCase();
      const description = descriptionElement.textContent.trim().toLowerCase();
      const isVisible = title.includes(currentSearchInput) || description.includes(currentSearchInput);
      taskCard.style.display = isVisible ? "block" : "none";
      if (isVisible) {
        anyVisibleTask = true;
      }
    }
  });
  return anyVisibleTask;
}


/**
 * Toggles the visibility of the drag areas while searching for tasks.
 * 
 * @param {string} searchValue - The search input value.
 */
function emptyDragAreaWhileSearching(searchValue) {
  if (searchValue === '') {
    let dragAreas = document.querySelectorAll(".noTaskPlaceholder");
    dragAreas.forEach((dragArea) => {
      dragArea.classList.remove('dNone');
    });
  } else {
    let dragAreas = document.querySelectorAll(".noTaskPlaceholder");
    dragAreas.forEach((dragArea) => {
      dragArea.classList.add('dNone');
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("board.html")) initBoard();
});
