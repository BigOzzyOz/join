import { BASE_URL, contacts, tasks, loadData, updateData } from "../script.js";
import { updateNoTasksFoundVisibility } from "./board2.js";
import { dragDrop, deactivateDragDrop, activateListeners } from "./board-listener.js";
import { getContactsData } from "./contacts.js";
import { generateTodoHTML } from "./boardtemplate.js";


export let currentDraggedElement;
let currentSearchInput = '';


export async function initBoard() {
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


function compareContact(contact) {
  return (
    contacts[contacts.findIndex(cont => cont.id === contact.id)].name !== contact.name ||
    contacts[contacts.findIndex(cont => cont.id === contact.id)].email !== contact.email ||
    contacts[contacts.findIndex(cont => cont.id === contact.id)].phone !== contact.phone ||
    contacts[contacts.findIndex(cont => cont.id === contact.id)].profilePic !== contact.profilePic ||
    contacts[contacts.findIndex(cont => cont.id === contact.id)].firstLetters !== contact.firstLetters
  );
}


export function updateAllTaskCategories() {
  updateTaskCategories("toDo", "toDo", "No tasks to do");
  updateTaskCategories("inProgress", "inProgress", "No tasks in progress");
  updateTaskCategories("awaitFeedback", "awaitFeedback", "No tasks await feedback");
  updateTaskCategories("done", "done", "No tasks done");
}


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



export function initDragDrop() {
  deactivateDragDrop();
  updateAllTaskCategories();
  dragDrop();
}


export function startDragging(id) {
  currentDraggedElement = id;
  document.querySelectorAll(".taskDragArea").forEach((zone) => {
    zone.classList.add("highlighted");
  });
}


export function dragEnd() {
  document.querySelectorAll('.taskDragArea').forEach((zone) => {
    zone.classList.remove('highlighted', 'highlightedBackground');
  });
}


export function applyCurrentSearchFilter() {
  if (currentSearchInput) {
    searchTasks(currentSearchInput);
  }
}


export function searchTasks(inputValue) {
  emptyDragAreaWhileSearching(inputValue);
  currentSearchInput = inputValue.toLowerCase();
  const taskCards = document.querySelectorAll(".todoContainer");
  let anyVisibleTask = searchForTitleOrDescription(taskCards, currentSearchInput);
  updateNoTasksFoundVisibility(anyVisibleTask);
}


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


