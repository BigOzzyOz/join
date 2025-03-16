import { deleteTask, deleteTaskSure, toggleClass, activateOutsideCheck } from '../script.js';
import { initBoard, searchTasks, startDragging, dragEnd } from './board.js';
import { checkScreenWidth, openOverlay, closeModal, moveTo, enableTaskEdit, updateSubtaskStatus, saveEditedTask } from './board2.js';
import { setPrio, toggleDropdown, assignSearchInput, addNewSubtask, handleKeyDown, clearSubtaskInput, saveSubtask, formValidation, contactAssign } from './addTask.js';
import { activateSubtaskListeners, deactivateAllAddTaskListeners, deactivateSubtaskListeners } from './addTask-listener.js';



//NOTE - General listeners and handlers for the board page


export function activateListeners() {
  const addTaskBtn = document.getElementById("addTaskBtn");
  const addTaskBtnDesktop = document.getElementById("addTaskBtnDesktop");
  const searchInput = document.getElementById("searchInput");
  const container = document.querySelectorAll('.taskCategoryContainer');
  const toDoContainer = document.getElementById('toDo-container');
  const inProgressContainer = document.getElementById('inProgress-container');
  const awaitFeedbackContainer = document.getElementById('awaitFeedback-container');
  const doneContainer = document.getElementById('done-container');
  const addTaskPlus = document.querySelectorAll('.taskCategoryIcon');

  addTaskBtn?.addEventListener('click', handleAddTaskBtnClick);
  addTaskBtnDesktop?.addEventListener('click', handleAddTaskBtnClick);
  searchInput?.addEventListener('input', handleSearchInput);
  container?.forEach((element) => {
    element.addEventListener('dragover', allowDrop);
    element.addEventListener('dragleave', dragLeave);
  });
  toDoContainer?.addEventListener('drop', handleDrop);
  inProgressContainer?.addEventListener('drop', handleDrop);
  awaitFeedbackContainer?.addEventListener('drop', handleDrop);
  doneContainer?.addEventListener('drop', handleDrop);
  addTaskPlus?.forEach((element) => {
    element.addEventListener('click', handleAddTaskBtnClick);
  });
}


export function deactivateAllListenersBoard() {
  const addTaskBtn = document.getElementById("addTaskBtn");
  const addTaskBtnDesktop = document.getElementById("addTaskBtnDesktop");
  const searchInput = document.getElementById("searchInput");
  const container = document.querySelectorAll('.taskCategoryContainer');
  const toDoContainer = document.getElementById('toDo-container');
  const inProgressContainer = document.getElementById('inProgress-container');
  const awaitFeedbackContainer = document.getElementById('awaitFeedback-container');
  const doneContainer = document.getElementById('done-container');
  const addTaskPlus = document.querySelectorAll('.taskCategoryIcon');

  addTaskBtn?.removeEventListener('click', handleAddTaskBtnClick);
  addTaskBtnDesktop?.removeEventListener('click', handleAddTaskBtnClick);
  searchInput?.removeEventListener('input', handleSearchInput);
  container?.forEach((element) => {
    element.removeEventListener('dragover', allowDrop);
    element.removeEventListener('dragleave', dragLeave);
  });
  toDoContainer?.removeEventListener('drop', handleDrop);
  inProgressContainer?.removeEventListener('drop', handleDrop);
  awaitFeedbackContainer?.removeEventListener('drop', handleDrop);
  doneContainer?.removeEventListener('drop', handleDrop);
  addTaskPlus?.forEach((element) => {
    element.removeEventListener('click', handleAddTaskBtnClick);
  });
  deactivateDragDrop();
  deactivateOverlayListeners();
  deactivateDeleteResponseListeners();
  deactivateEditTaskListeners();
}


function handleAddTaskBtnClick(event) {
  if (event.target.id === "addTaskInProgress") checkScreenWidth("inProgress");
  else if (event.target.id === "addTaskFeedback") checkScreenWidth("awaitFeedback");
  else checkScreenWidth("toDo");
};


function handleSearchInput() {
  const searchInput = document.getElementById("searchInput");
  searchTasks(searchInput.value);
}


//NOTE - Drag and drop listeners and handlers for the board page


export function dragDrop() {
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


function allowDrop(ev) {
  let dropTarget = ev.target;
  let allowDropTarget = document.querySelectorAll('.taskDragArea');
  allowDropTarget.forEach(t => {
    if (t == dropTarget || t.contains(dropTarget)) {
      ev.preventDefault();
      t.classList.add('highlightedBackground');
    }
  });
}


function dragLeave() {
  document.querySelectorAll('.taskDragArea').forEach((zone) => {
    zone.classList.remove('highlightedBackground');
  });
}


function handleDrop(event) {
  event.preventDefault();
  moveTo(event.target.id);
}


function handleToDoClick(e) {
  const target = e.target.closest(".todoContainer");
  e.stopPropagation();
  openOverlay(target.id);
}


function handleDragStart(e) {
  e.target.classList.add("tilted");
  startDragging(e.target.id);
}

function handleDragEnd(e) {
  e.target.classList.remove("tilted");
  dragEnd();
}


//NOTE - Overlay listeners and handlers for the board page


export function activateOverlayListeners(elementId) {
  const closeBtn = document.getElementById("modalCloseBtn");
  const subtasks = document.querySelectorAll('.modalSubtasksSingle');
  const editBtn = document.getElementById("modalContainerEditBtn");
  const deleteBtn = document.getElementById("modalContainerDeleteBtn");
  window.addEventListener('click', handleOverlayOutsideClick);
  closeBtn?.addEventListener("click", closeModal);
  subtasks?.forEach(subtask => subtask.addEventListener('click', handleSubtaskClick));
  editBtn?.addEventListener('click', handleOverlayEditClick);
  deleteBtn?.addEventListener('click', handleOverlayDeleteClick);
}


export function deactivateOverlayListeners() {
  const closeBtn = document.getElementById("modalCloseBtn");
  const subtasks = document.querySelectorAll('.modalSubtasksSingle');
  const editBtn = document.getElementById("modalContainerEditBtn");
  const deleteBtn = document.getElementById("modalContainerDeleteBtn");
  window.removeEventListener('click', handleOverlayOutsideClick);
  closeBtn?.removeEventListener("click", closeModal);
  subtasks?.forEach(subtask => subtask.removeEventListener('click', handleSubtaskClick));
  editBtn?.removeEventListener('click', handleOverlayEditClick);
  deleteBtn?.removeEventListener('click', handleOverlayDeleteClick);
}


function handleSubtaskClick(event) {
  const subtaskIndex = event.target.closest('.modalSubtasksSingle').dataset.subtaskindex;
  const taskId = event.target.closest('#modalContainer').dataset.id;
  updateSubtaskStatus(taskId, subtaskIndex);
}


function handleOverlayEditClick(event) {
  const taskId = event.target.closest('#modalContainer').dataset.id;
  enableTaskEdit(taskId);
}


function handleOverlayDeleteClick(event) {
  const taskId = event.target.closest('#modalContainer').dataset.id;
  deleteTask(taskId);
  activateOutsideCheck(event, 'deleteResponse', 'ts0', 'ts1');
  activateDeleteResponseListeners();
}


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


export function activateDeleteResponseListeners() {
  const deleteTaskForm = document.getElementById("deleteTaskForm");
  const cancelBtn = document.getElementById("deleteTaskNo");
  deleteTaskForm?.addEventListener('submit', handleDeleteTaskFormSubmit);
  cancelBtn?.addEventListener('click', handleDeleteTaskNo);
}


export function deactivateDeleteResponseListeners() {
  const deleteTaskForm = document.getElementById("deleteTaskForm");
  const cancelBtn = document.getElementById("deleteTaskNo");
  deleteTaskForm?.removeEventListener('submit', handleDeleteTaskFormSubmit);
  cancelBtn?.removeEventListener('click', handleDeleteTaskNo);
}


function handleDeleteTaskFormSubmit(event) {
  event.preventDefault();
  const taskId = event.target.dataset.id;
  deleteTaskSure(taskId);
}


function handleDeleteTaskNo(event) {
  event.preventDefault();
  toggleClass('deleteResponse', 'ts0', 'ts1');
  deactivateDeleteResponseListeners();
}


//NOTE - Edit Task listeners and handlers for the board page


export function activateEditTaskListeners() {
  const editTaskForm = document.getElementById("editTaskForm");
  const closebtn = document.getElementById("editTaskCloseBtn");
  const prio = document.querySelectorAll('.prioBtn');
  const assignSearchInputField = document.getElementById("assignSearch");
  const assignSearchDropdown = document.getElementById("assignDropArrowContainer");
  const subtasksInputContainer = document.getElementById("subtasksInputContainer");
  const subtaskInput = document.getElementById("subtaskInput");
  const subtaskDeleteIcon = document.getElementById('subtaskDeleteIcon');
  const subtaskSaveIcon = document.getElementById('subtaskSaveIcon');
  editTaskForm?.addEventListener('submit', handleEditTaskFormSubmit);
  closebtn?.addEventListener('click', closeModal);
  prio?.forEach((element) => element.addEventListener('click', handlePrioClick));
  assignSearchInputField?.addEventListener('click', toggleDropdown);
  assignSearchInputField?.addEventListener('input', assignSearchInput);
  assignSearchDropdown?.addEventListener('click', toggleDropdown);
  subtasksInputContainer?.addEventListener('click', addNewSubtask);
  subtaskInput?.addEventListener('keypress', handleKeyDown);
  subtaskDeleteIcon?.addEventListener('click', clearSubtaskInput);
  subtaskSaveIcon?.addEventListener('click', saveSubtask);
  activateSubtaskListeners();
}


export function deactivateEditTaskListeners() {
  const editTaskForm = document.getElementById("editTaskForm");
  const closebtn = document.getElementById("editTaskCloseBtn");
  const prio = document.querySelectorAll('.prioBtn');
  const assignSearchInputField = document.getElementById("assignSearch");
  const assignSearchDropdown = document.getElementById("assignDropArrowContainer");
  const subtasksInputContainer = document.getElementById("subtasksInputContainer");
  const subtaskInput = document.getElementById("subtaskInput");
  const subtaskDeleteIcon = document.getElementById('subtaskDeleteIcon');
  const subtaskSaveIcon = document.getElementById('subtaskSaveIcon');
  editTaskForm?.removeEventListener('submit', handleEditTaskFormSubmit);
  closebtn?.removeEventListener('click', closeModal);
  prio?.forEach((element) => element.removeEventListener('click', handlePrioClick));
  assignSearchInputField?.removeEventListener('click', toggleDropdown);
  assignSearchInputField?.removeEventListener('input', assignSearchInput);
  assignSearchDropdown?.removeEventListener('click', toggleDropdown);
  subtasksInputContainer?.removeEventListener('click', addNewSubtask);
  subtaskInput?.removeEventListener('keypress', handleKeyDown);
  subtaskDeleteIcon?.removeEventListener('click', clearSubtaskInput);
  subtaskSaveIcon?.removeEventListener('click', saveSubtask);
  deactivateSubtaskListeners();
}


function handleEditTaskFormSubmit(event) {
  event.preventDefault();
  const taskId = event.target.closest('#editTaskForm').dataset.id;
  if (formValidation()) saveEditedTask(taskId);
}


export function handlePrioClick(event) {
  const prioElement = event.target.closest('.prioBtn');
  if (!prioElement) return;
  setPrio(prioElement);
}


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
