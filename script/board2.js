import { BASE_URL, tasks, changeActive, updatePrioActiveBtn, updateData } from "../script.js";
import { assignedContacts, setAssignedContacts, renderAssignedContacts, currentPrio } from "./addTask.js";
import { createTaskArray, updateSubtasksProgressBar, initDragDrop, applyCurrentSearchFilter, currentDraggedElement } from "./board.js";
import { fetchAddTaskTemplate, generateOpenOverlayHTML, generateTaskEditHTML } from "./boardtemplate.js";
import { activateEditTaskListeners, activateOverlayListeners, deactivateOverlayListeners } from "./board-listener.js";
import { activateAddTaskListeners } from "./addTask-listener.js";


let currentTaskStatus;


export function updateNoTasksFoundVisibility(anyVisibleTask) {
  const noTasksFound = document.getElementById('noTasksFound');
  if (anyVisibleTask) {
    noTasksFound.classList.add('dNone');
  } else {
    noTasksFound.classList.remove('dNone');
  }
}


export function checkScreenWidth(category) {
  const screenWidth = window.innerWidth;
  const activeTab = document.querySelector('.menuBtn[href="../html/addtask.html"]');
  const taskStatus = category;
  sessionStorage.setItem('taskCategory', category);
  if (screenWidth < 992) {
    changeActive(activeTab);
    window.location.href = "../html/addtask.html";
  } else {
    openAddTaskOverlay();
  }
}


async function openAddTaskOverlay() {
  let addTaskOverlay = document.getElementById("addTaskOverlay");
  setAssignedContacts([]);
  addTaskOverlay.innerHTML = await fetchAddTaskTemplate();
  addTaskOverlay.style.display = "block";
  activateAddTaskListeners();
}


export function openOverlay(elementId) {
  let element = tasks.find((task) => task.id === elementId);
  let overlay = document.getElementById("overlay");
  setAssignedContacts([]);
  overlay.innerHTML = generateOpenOverlayHTML(element);
  activateOverlayListeners(elementId);
  overlay.style.display = "block";
}


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


export async function updateSubtaskStatus(taskId, subtaskIndex) {
  let task = tasks.find((task) => task.id === taskId);
  if (task) {
    let subtask = task.subtasks[subtaskIndex];
    if (subtask) {
      updateSubtaskStatusDom(subtask, subtaskIndex);
      updateSubtasksProgressBar(task.subtasks, taskId);
      await updateData(`${BASE_URL}tasks/${taskId}.json`, task);
      let taskIndex = tasks.findIndex(t => taskId === t.id);
      tasks.splice(taskIndex, 1, await createTaskArray(taskId, task));
      sessionStorage.setItem("tasks", JSON.stringify(tasks));
    }
  }
}


function updateSubtaskStatusDom(subtask, subtaskIndex) {
  subtask.status = subtask.status === "checked" ? "unchecked" : "checked";
  let subtaskCheckbox = document.getElementById(`subtaskCheckbox${subtaskIndex}`);
  if (subtaskCheckbox) {
    subtaskCheckbox.src =
      subtask.status === "checked" ? "../assets/icons/checkboxchecked.svg" : "../assets/icons/checkbox.svg";
  }
}


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


export async function saveEditedTask(taskId) {
  let singleTask = createEditedTask(taskId);
  await updateData(`${BASE_URL}tasks/${taskId}.json`, singleTask);
  let taskIndex = tasks.findIndex(t => taskId === t.id);
  tasks.splice(taskIndex, 1, await createTaskArray(taskId, singleTask));
  sessionStorage.setItem("tasks", JSON.stringify(tasks));
  openOverlay(taskId);
  initDragDrop();
  applyCurrentSearchFilter();
}


export async function moveTo(status) {
  document.querySelectorAll(".taskDragArea").forEach((zone) => {
    zone.classList.add("highlighted");
  });
  let task = tasks.find((task) => task.id == currentDraggedElement);
  if (task && status != "") {
    task.status = status;
    await updateData(`${BASE_URL}tasks/${task.id}.json`, task);
    let taskIndex = tasks.findIndex(t => task.id === t.id);
    tasks.splice(taskIndex, 1, await createTaskArray(task.id, task));
    sessionStorage.setItem("tasks", JSON.stringify(tasks));
    initDragDrop();
    applyCurrentSearchFilter();
  }
}
