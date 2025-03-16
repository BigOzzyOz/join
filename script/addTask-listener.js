import { setActualDate } from '../script.js';
import { closeModal } from './board2.js';
import { handleOverlayOutsideClick, handlePrioClick } from './board-listener.js';
import { formValidation, toggleDropdown, assignSearchInput, pushNewTask, toggleCategoryDropdown, addNewSubtask, clearSubtaskInput, saveSubtask, clearAddTaskForm, deleteSubtask, editSubtask } from './addTask.js';

export function activateAddTaskListeners() {
  console.log('activateAddTaskListeners');
  const closeBtn = document.getElementById("addTaskModalCloseBtn");
  const addTaskForm = document.getElementById("addTaskForm");
  const assignSearchInputField = document.getElementById("assignSearch");
  const assignSearchDropdown = document.getElementById("assignDropArrowContainer");
  const dateInput = document.getElementById("dateInputContainer");
  const prio = document.querySelectorAll('.prioBtn');
  const categoryValue = document.querySelectorAll(".categoryValue");
  const subtasksInputContainer = document.getElementById("subtasksInputContainer");
  const subtaskInputPlus = document.getElementById("subtaskPlusIcon");
  const subtaskDeleteIcon = document.getElementById('subtaskDeleteIcon');
  const subtaskSaveIcon = document.getElementById('subtaskSaveIcon');
  const clearBtn = document.getElementById("clearBtn");
  window.addEventListener('click', handleOverlayOutsideClick);
  closeBtn?.addEventListener("click", closeModal);
  addTaskForm?.addEventListener('submit', handleSubmitBtnClick);
  assignSearchInputField?.addEventListener('click', toggleDropdown);
  assignSearchInputField?.addEventListener('input', assignSearchInput);
  assignSearchDropdown?.addEventListener('click', toggleDropdown);
  dateInput?.addEventListener('click', setActualDate);
  prio?.forEach((element) => element.addEventListener('click', handlePrioClick));
  categoryValue?.forEach((element) => element.addEventListener('click', handleWrapperClick));
  subtasksInputContainer?.addEventListener('keypress', addNewSubtask);
  subtaskInputPlus?.addEventListener('click', addNewSubtask);
  subtaskDeleteIcon?.addEventListener('click', clearSubtaskInput);
  subtaskSaveIcon?.addEventListener('click', saveSubtask);
  clearBtn?.addEventListener('click', clearAddTaskForm);
}


export function deactivateAllAddTaskListeners() {
  const closeBtn = document.getElementById("addTaskModalCloseBtn");
  const addTaskForm = document.getElementById("addTaskForm");
  const assignSearchInputField = document.getElementById("assignSearch");
  const assignSearchDropdown = document.getElementById("assignDropArrowContainer");
  const dateInput = document.getElementById("dateInputContainer");
  const prio = document.querySelectorAll('.prioBtn');
  const categoryValue = document.querySelectorAll(".categoryValue");
  const subtasksInputContainer = document.getElementById("subtasksInputContainer");
  const subtaskInputPlus = document.getElementById("subtaskPlusIcon");
  const subtaskDeleteIcon = document.getElementById('subtaskDeleteIcon');
  const subtaskSaveIcon = document.getElementById('subtaskSaveIcon');
  const clearBtn = document.getElementById("clearBtn");

  window.removeEventListener('click', handleOverlayOutsideClick);
  closeBtn?.removeEventListener("click", closeModal);
  addTaskForm?.removeEventListener('submit', handleSubmitBtnClick);
  assignSearchInputField?.removeEventListener('click', toggleDropdown);
  assignSearchInputField?.removeEventListener('input', assignSearchInput);
  assignSearchDropdown?.removeEventListener('click', toggleDropdown);
  dateInput?.removeEventListener('click', setActualDate);
  prio?.forEach((element) => element.removeEventListener('click', handlePrioClick));
  categoryValue?.forEach((element) => element.removeEventListener('click', handleWrapperClick));
  subtasksInputContainer?.removeEventListener('keypress', addNewSubtask);
  subtaskInputPlus?.removeEventListener('click', addNewSubtask);
  subtaskDeleteIcon?.removeEventListener('click', clearSubtaskInput);
  subtaskSaveIcon?.removeEventListener('click', saveSubtask);
  clearBtn?.removeEventListener('click', clearAddTaskForm);
  deactivateSubtaskListeners();
}


function handleSubmitBtnClick(event) {
  event.preventDefault();
  if (formValidation()) pushNewTask();
}


function handleWrapperClick(event) {
  event.stopPropagation();
  event.preventDefault();
  let category = event.target.closest('.categoryValue').dataset.value;
  toggleCategoryDropdown(category);
}


//NOTE - Subtask listener and handler


export function activateSubtaskListeners() {
  const subtaskEditList = document.querySelectorAll('.subtaskEditList');
  const subtaskEditBtns = document.querySelectorAll('.editSubtaskBtns');
  const subtaskDeleteBtns = document.querySelectorAll('.deleteSubtaskBtns');
  subtaskEditList?.forEach((element) => element.addEventListener('dblclick', handleSubtaskList));
  subtaskEditBtns?.forEach((element) => element.addEventListener('click', handleSubtaskList));
  subtaskDeleteBtns?.forEach((element) => element.addEventListener('click', handleSubtaskList));
}


export function deactivateSubtaskListeners() {
  const subtaskEditList = document.querySelectorAll('.subtaskEditList');
  const subtaskEditBtns = document.querySelectorAll('.editSubtaskBtns');
  const subtaskDeleteBtns = document.querySelectorAll('.deleteSubtaskBtns');
  subtaskEditList?.forEach((element) => element.removeEventListener('dblclick', handleSubtaskList));
  subtaskEditBtns?.forEach((element) => element.removeEventListener('click', handleSubtaskList));
  subtaskDeleteBtns?.forEach((element) => element.removeEventListener('click', handleSubtaskList));
}


function handleSubtaskList(event) {
  const subtask = event.target.closest('.subtaskEditList');
  const img = event.target.closest('img');
  if (event.type === "dblclick") editSubtask(subtask);
  else if (img.src.includes("pencil")) editSubtask(subtask);
  else if (img.src.includes("delete")) deleteSubtask(subtask);
}


//NOTE - Geneal listener and handler


