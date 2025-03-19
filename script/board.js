import { BASE_URL, contacts, tasks, fetchDataFromDatabase, updateDataInDatabase, setTasks, toggleLoader } from "../script.js";
import { dragDrop, deactivateDragDrop, activateListeners } from "./board-listener.js";
import { getContactsData } from "./contacts.js";
import { generateTodoHTML } from "./boardtemplate.js";
import { token } from "./firebase-init.js";


//NOTE - Global Board Variables


export let currentDraggedElement;
let currentSearchInput = '';


//NOTE - Board Initialisation


/**
 * Initialises the board page by fetching all tasks from storage, setting up listeners, and activating drag and drop functionality.
 * If the tasks array is empty, fetches all tasks from storage and pushes them to the tasks array.
 * Sets the current search filter to the users last search input.
 * @returns {Promise<void>}
 */
export async function initBoard() {
  try {
    toggleLoader(true);
    await initializeTasksData();
    sessionStorage.setItem("tasks", JSON.stringify(tasks));
    initDragDrop();
    applyCurrentSearchFilter();
    toggleLoader(false);
  } catch (error) {
    console.error("Initialisation error:", error);
  }
}


/**
 * Checks if the tasks array is empty and if so, fetches all tasks from
 * storage and pushes them to the tasks array. If the tasks array is not
 * empty, it loops over the tasks array and checks if the owner of each
 * task is deleted by calling checkDeletedUser.
 * A loader is shown while the tasks are being fetched and hidden when
 * the process is finished.
 * If any error occurs during the process, an error message is logged to
 * the console.
 */
export async function initializeTasksData() {
  const loader = document.querySelector('.loader');
  loader?.classList.toggle('dNone');

  await pushDataToArray();

  if (tasks.length > 0) {
    for (let i = 0; i < tasks.length; i++) {
      tasks[i] = await checkDeletedUser(tasks[i]);
    }

    loader?.classList.toggle('dNone');
  }
  activateListeners();
}


/**
 * Fetches all tasks from storage and pushes them to the tasks array.
 * Each task is formatted by calling createTaskArray and then checked if
 * the user is deleted by calling checkDeletedUser.
 * If any error occurs during the process, an error message is logged to the console.
 */
async function pushDataToArray() {
  try {
    let tasksData = await fetchDataFromDatabase("tasks");
    setTasks([]);
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
 * Checks if a user, assigned to a task, still exists in the contact list.
 * If the user does not exist anymore, the user is removed from the task's assigned contacts.
 * If the user exists, but has a different ID, the task's assigned contacts are updated with the new ID.
 * @param {Object} loadedTask - The task to check for deleted users.
 * @returns {Object} The task with updated assigned contacts.
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
 * Checks for changes in the assigned contacts of a task and updates them accordingly.
 * Iterates over assigned contacts of a task from the highest ID down to 0.
 * If a contact is not found in the existing contacts list, it removes the contact from
 * the task's assigned list. If a contact has changed, updates the contact information.
 * Updates the task's assigned contacts data in the database.
 *
 * @param {Object} task - The task object containing assigned contacts.
 * @param {number} maxId - The maximum ID of the assigned contacts to check.
 * @returns {Promise<Object>} The updated task object.
 */
async function checkContactChange(task, maxId) {
  for (let index = maxId; index >= 0; index--) {
    const assignedContact = task.assignedTo[index];
    if (!assignedContact) continue;

    const contactIndex = contacts.findIndex(contact => contact.id === assignedContact.id);
    if (contactIndex === -1) task.assignedTo.splice(index, 1);
    else if (hasContactChanged(assignedContact)) task.assignedTo[index] = contacts[contactIndex];

    await updateDataInDatabase(`${BASE_URL}tasks/${task.id}/assignedTo.json?auth=${token}`, task.assignedTo);
  }
  return task;
}


/**
 * Checks if a contact has changed.
 * @param {Object} assignedContact - The contact assigned to a task.
 * @returns {boolean} True if the contact has changed, false otherwise.
 */
function hasContactChanged(assignedContact) {
  const contactIndex = contacts.findIndex(contact => contact.id === assignedContact.id);
  if (contactIndex === -1) return true;

  const storedContact = contacts[contactIndex];
  return (
    storedContact.name !== assignedContact.name ||
    storedContact.email !== assignedContact.email ||
    storedContact.phone !== assignedContact.phone ||
    storedContact.profilePic !== assignedContact.profilePic ||
    storedContact.firstLetters !== assignedContact.firstLetters
  );
}


/**
 * Updates the task categories on the board page. This function calls updateTaskCategories
 * for each category and updates the number of tasks in each category.
 * @returns {void}
 */
function updateAllTaskCategories() {
  updateTaskCategories("toDo", "toDo", "No tasks to do");
  updateTaskCategories("inProgress", "inProgress", "No tasks in progress");
  updateTaskCategories("awaitFeedback", "awaitFeedback", "No tasks await feedback");
  updateTaskCategories("done", "done", "No tasks done");
}


/**
 * Creates a new task object with the given key and task data.
 * @param {string} key - The unique identifier for the task.
 * @param {Object} singleTask - The task details.
 * @returns {Object} The new task object.
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


//NOTE - Subtask functions


/**
 * Updates the contents of a task category section on the board.
 * - Filters tasks by the given status.
 * - Empties the category element.
 * - Appends the HTML for each task in the filtered array to the category element.
 * - If a task has subtasks, updates the progress bar for those subtasks.
 * - If there are no tasks, displays a "no task" placeholder with the given message.
 * @param {string} status - The status of the tasks to show.
 * @param {string} categoryId - The ID of the HTML element to update.
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
        updateSubtaskProgressBar(element.subtasks, element.id);
      }
    });
  } else {
    if (categoryElement) categoryElement.innerHTML = `<div class="noTaskPlaceholder">${noTaskMessage}</div>`;
  }
}


/**
 * Updates the progress bar for a single task with the given subtasks.
 * - Filters the subtasks for those that are checked.
 * - Calculates the percentage of subtasks that are checked.
 * - Updates the width of the progress bar element to that percentage.
 * - Updates the text of the progress bar element to show the number of checked/total subtasks.
 * @param {Array} subtasks - The subtasks of the task to update.
 * @param {string} taskId - The ID of the task to update.
 */
export function updateSubtaskProgressBar(subtasks, taskId) {
  const checkedSubtaskCount = subtasks.filter(
    (subtask) => subtask.status === "checked"
  ).length;
  const percentComplete = Math.round(
    (checkedSubtaskCount / subtasks.length) * 100
  );
  const progressBar = document.getElementById(
    `subtasksProgressbarProgress${taskId}`
  );
  progressBar.style.width = `${percentComplete}%`;
  const progressBarText = document.getElementById(
    `subtasksProgressbarText${taskId}`
  );
  progressBarText.innerHTML = `${checkedSubtaskCount}/${subtasks.length} Subtasks`;
}


//NOTE - Drag and Drop functions


/**
 * Initializes drag and drop functionality on the board.
 * - Deactivates all drag and drop listeners to prevent duplicate events.
 * - Updates all task categories to ensure they are properly rendered.
 * - Re-activates drag and drop listeners to enable drag and drop functionality.
 */
export function initDragDrop() {
  deactivateDragDrop();
  updateAllTaskCategories();
  dragDrop();
}


/**
 * Initiates the drag event for a task by highlighting all task drag areas.
 * - Sets the currentDraggedElement to the provided task ID.
 * - Selects all elements with the class 'taskDragArea'.
 * - Adds the 'highlighted' class to each element to visually indicate they are available for drop.
 * 
 * @param {string} id - The ID of the task being dragged.
 */
export function startDragging(id) {
  currentDraggedElement = id;
  document.querySelectorAll(".taskDragArea").forEach((zone) => {
    zone.classList.add("highlighted");
  });
}


/**
 * Ends the drag operation by removing the highlighting
 * from all task drag areas.
 * - Selects all elements with the class 'taskDragArea'.
 * - Removes the 'highlighted' and 'highlightedBackground'
 *   classes from each element to reset their visual state.
 */
export function dragEnd() {
  document.querySelectorAll('.taskDragArea').forEach((zone) => {
    zone.classList.remove('highlighted', 'highlightedBackground');
  });
}


//NOTE - Search functions


/**
 * Applies the current search filter to the list of tasks on the board.
 * - If there is a search input present, it calls the searchTasks function
 *   with the current search input value.
 * - This function updates the task visibility based on the search criteria.
 */
export function applyCurrentSearchFilter() {
  if (currentSearchInput) searchTasks(currentSearchInput);
}


/**
 * Searches for tasks based on the provided input value and updates the task visibility accordingly.
 * - Converts the input value to lowercase for case-insensitive search.
 * - Retrieves all task cards and filters them according to the search input.
 * - Updates the visibility of a "no tasks found" message based on whether any tasks match the search.
 * - Adjusts the visibility of drag area placeholders during search.
 * 
 * @param {string} inputValue - The search string used to filter tasks.
 */
export function searchTasks(inputValue) {
  emptyDragAreasWhileSearching(inputValue);
  currentSearchInput = inputValue.toLowerCase();
  const taskCards = document.querySelectorAll(".todoContainer");
  let anyVisibleTask = searchTasksInCards(taskCards, currentSearchInput);
  updateNoTasksFoundVisibility(anyVisibleTask);
}


/**
 * Function to search through an array of task cards and hide/show them based on whether they match the search input or not.
 * @param {NodeList} taskCards the array of task cards to search through
 * @param {string} searchInput the search string to look for in the task cards
 * @returns {boolean} whether any tasks were visible after the search
 */
function searchTasksInCards(taskCards, searchInput) {
  let anyVisibleTask = false;

  for (const taskCard of taskCards) {
    const title = taskCard.querySelector(".toDoHeader")?.textContent.trim().toLowerCase() || "";
    const description = taskCard.querySelector(".toDoDescription")?.textContent.trim().toLowerCase() || "";

    const isVisible = title.includes(searchInput) || description.includes(searchInput);

    taskCard.style.display = isVisible ? "block" : "none";

    if (isVisible) anyVisibleTask = true;
  }
  return anyVisibleTask;
}


/**
 * Toggles the visibility of the drag areas' placeholder text depending on the search input field's value.
 * If the input field is empty, the placeholder text is shown, otherwise it is hidden.
 * @param {string} searchInput the current value of the search input field
 */
function emptyDragAreasWhileSearching(searchInput) {
  const dragAreas = document.querySelectorAll(".noTaskPlaceholder");

  if (searchInput === '') {
    dragAreas.forEach((dragArea) => dragArea.classList.remove("dNone"));
  } else {
    dragAreas.forEach((dragArea) => dragArea.classList.add("dNone"));
  }
}


/**
 * Updates the visibility of the "No tasks found" message based on whether any tasks are visible.
 * - Selects the element with the id 'noTasksFound' and adds or removes the 'dNone' class
 *   depending on whether anyVisibleTask is true or false.
 * @param {boolean} anyVisibleTask - Whether any tasks are visible after the search.
 */
function updateNoTasksFoundVisibility(anyVisibleTask) {
  const noTasksFound = document.getElementById('noTasksFound');
  if (anyVisibleTask) noTasksFound.classList.add('dNone');
  else noTasksFound.classList.remove('dNone');
}