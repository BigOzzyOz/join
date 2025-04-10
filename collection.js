import { token, BASE_URL, apiLogout, setToken } from "./script/api-init.js";
import { initializeTasksData, initDragDrop, searchTasks, startDragging, dragEnd, createTaskArray, updateSubtaskProgressBar, applyCurrentSearchFilter, currentDraggedElement } from "./script/board.js";
import { closeModal, checkScreenWidth, openOverlay, moveTo, enableTaskEdit, updateSubtaskStatus, saveEditedTask } from "./script/board2.js";
import { deactivateDeleteResponseListeners, deactivateAllListenersBoard, activateEditTaskListeners, activateOverlayListeners, deactivateOverlayListeners } from "./script/board-listener.js";
import { openDeleteTaskSureHtml, generateTodoHTML, fetchAddTaskTemplate, generateOpenOverlayHTML, generateTaskEditHTML } from "./script/boardtemplate.js";
import { deactivateAllListenersContacts, openAddContacts, renderContactsDetails, openDeleteContacts, openEditContacts, addContacts, editContacts, deleteContacts, refreshPage } from "./script/contacts.js";
import { deactivateAllListenersLogin, deactivateAllListenersRegister, deactivateAllListenersSummary } from "./script/login.js";
import { formValidation, toggleDropdown, assignSearchInput, pushNewTask, toggleCategoryDropdown, addNewSubtask, clearSubtaskInput, saveSubtask, clearAddTaskForm, deleteSubtask, editSubtask, setPrio, contactAssign } from "./script/addTask.js";
import { activateSubtaskListeners, deactivateSubtaskListeners, activateAddTaskListeners, deactivateAllAddTaskListeners } from "./script/addTask-listener.js";
import { htmlRenderContactsAssign, generateSaveSubtaskHTML } from "./script/addTaskTemplate.js";
import { contacts, tasks, getDataFromDatabase, updateDataInDatabase, setTasks, toggleLoader, changeActive, toggleClass, activateOutsideCheck } from "../script.js";
import { assignedContacts, setAssignedContacts, renderAssignedContacts, currentPrio, updatePrioActiveBtn } from "./script/addTask.js";
import { getContactsData } from "./script/contacts.js";
import { initSummary } from "./script/summary.js";
import { greetingMobileHTML } from "./script/miscTemplate.js";
import { Database } from "./src/classes/class.database.js";



export function deleteTask(id) {
    toggleClass('deleteResponse', 'ts0', 'ts1');
    document.getElementById('deleteResponse').innerHTML = openDeleteTaskSureHtml(id);
}


export async function deleteTaskSure(taskId) {
    toggleClass('deleteResponse', 'ts0', 'ts1');
    deactivateDeleteResponseListeners();

    await deleteDataFromDatabase(`tasks/${taskId}`);
    tasks = tasks.filter(task => task.id !== taskId);
    sessionStorage.setItem("tasks", JSON.stringify(tasks));

    closeModal();
    initDragDrop();
    initializeTasksData();
}


export function activateAddTaskListeners() {
    window.addEventListener('click', handleOverlayOutsideClick);
    addTaskListenerGeneral("add");
    addTaskListenerAssign("add");
    addTaskListenerSubtasks("add");
    addTaskListenerCategory("add");
    addTaskListenerPrio("add");
    addTaskListenerDate("add");
}


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


function addTaskListenerCategory(action) {
    const categoryValue = document.querySelectorAll(".categoryValue");
    if (action === "add") {
        categoryValue?.forEach((element) => element.addEventListener('click', handleWrapperClick));
    } else if (action === "remove") {
        categoryValue?.forEach((element) => element.removeEventListener('click', handleWrapperClick));
    }
}



function addTaskListenerPrio(action) {
    const prio = document.querySelectorAll('.prioBtn');
    if (action === "add") {
        prio?.forEach((element) => element.addEventListener('click', handlePrioClick));
    } else if (action === "remove") {
        prio?.forEach((element) => element.removeEventListener('click', handlePrioClick));
    }
}



function addTaskListenerDate(action) {
    const dateInput = document.getElementById("dateInputContainer");
    if (action === "add") {
        dateInput?.addEventListener('click', setActualDate);
    } else if (action === "remove") {
        dateInput?.removeEventListener('click', setActualDate);
    }
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


function setActualDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dateInput').setAttribute('min', today);
    document.getElementById('update-date') && document.getElementById('update-date').setAttribute('min', today);
}


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


function handleSubtaskList({ target, type }) {
    const subtask = target.closest('.subtaskEditList');
    const action = target.closest('img').dataset.action;
    if (type === "dblclick") editSubtask(subtask);
    else if (action === "edit") editSubtask(subtask);
    else if (action === "delete") deleteSubtask(subtask);
}



export async function toggleDropdown() {
    document.getElementById('assignDropdown').classList.toggle('open');
    document.getElementById('assignSearch').classList.contains('contactsAssignStandard') ? await openAssignDropdown() : closeAssignDropdown();
    toggleClass('assignSearch', 'contactsAssignStandard', 'contactsAssignOpen');
}



async function openAssignDropdown() {
    const searchInput = document.getElementById('assignSearch');
    const contactsContainer = document.getElementById('contactsToAssign');
    const contactsSorted = [...contacts].sort((a, b) => a.name.localeCompare(b.name));
    contactsContainer.innerHTML = contactsSorted.map(c => htmlRenderContactsAssign(c)).join('');
    document.getElementById('assignDropArrow').style.transform = 'rotate(180deg)';
    searchInput.value = '';
    searchInput.removeAttribute('readonly');
    const contactsAssign = document.querySelectorAll('.assignContactToProject');
    contactsAssign.forEach((element) => element.addEventListener('click', handleAssignContact));
    document.addEventListener('click', checkOutsideAssign);
}



function closeAssignDropdown() {
    let searchInput = document.getElementById('assignSearch');
    let contactsContainer = document.getElementById('contactsToAssign');
    contactsContainer.innerHTML = '';
    document.getElementById('assignDropArrow').style.transform = 'rotate(0deg)';
    searchInput.value = 'Select contacts to assign';
    searchInput.setAttribute('readonly', true);
    const contactsAssign = document.querySelectorAll('.assignContactToProject');
    contactsAssign?.forEach((element) => element.removeEventListener('click', handleAssignContact));
    document?.removeEventListener('click', checkOutsideAssign);
};



export function toggleCategoryDropdown(value) {
    let input = document.getElementById('categoryInput');
    let wrapper = document.getElementById('selectWrapper');
    let arrow = document.getElementById('categoryDropArrow');
    input.value = wrapper.classList.contains('select-wrapperOpen') ? value : '';
    document.getElementById('selectWrapper').classList.toggle('select-wrapperOpen');
    wrapper.classList.contains('select-wrapperOpen') ? arrow.style.transform = 'rotate(180deg)' : arrow.style.transform = 'rotate(0deg)';
}



function getId(id) {
    return document.getElementById(id).value;
}


export function setAssignedContacts(contactsArray) {
    assignedContacts = contactsArray;
}


function checkOutsideAssign({ target }) {
    let assignMenu = document.getElementById('assignDropdown');
    if (assignMenu.classList.contains('open') && !assignMenu.contains(target)) {
        toggleDropdown();
    };
}


export function assignSearchInput() {
    const searchInput = document.getElementById('assignSearch');
    const contactsContainer = document.getElementById('contactsToAssign');
    const searchText = searchInput.value.toLowerCase();
    const contactsSorted = [...contacts].sort((a, b) => a.name.localeCompare(b.name));
    const filteredContacts = contactsSorted.filter(c => c.name.toLowerCase().includes(searchText));
    contactsContainer.innerHTML = filteredContacts.map(c => htmlRenderContactsAssign(c)).join('');
}


export function contactAssign(id) {
    const index = assignedContacts.findIndex(c => c.id === id);
    const inAssignedContacts = index > -1;
    const contactLabel = document.getElementById(`contact${id}`).parentElement;
    contactLabel.classList.toggle('contactsToAssignCheck', !inAssignedContacts);
    if (inAssignedContacts) assignedContacts.splice(index, 1);
    else assignedContacts.push(contacts.find(c => c.id === id));
    renderAssignedContacts();
}


export function renderAssignedContacts() {
    let assignedContactsContainer = document.getElementById('contactsAssigned');
    assignedContactsContainer.innerHTML = '';
    for (let i = 0; i < assignedContacts.length; i++) {
        const contact = assignedContacts[i];
        if (i <= 5) {
            assignedContactsContainer.innerHTML += contact.profilePic;
        } else {
            assignedContactsContainer.innerHTML += svgProfilePic('#2a3748', `+${assignedContacts.length - 5}`);
            break;
        }
    }
}


export function addNewSubtask(event) {
    handleKeyDown(event);
    const input = document.getElementById('subtaskInput').value.length;
    if (input > -1) {
        document.getElementById('subtaskIconContainer').classList.remove('dNone');
        document.getElementById('subtaskPlusIcon').classList.add('dNone');
    } else {
        document.getElementById('subtaskIconContainer').classList.add('dNone');
        document.getElementById('subtaskPlusIcon').classList.remove('dNone');
    }
}


export function clearSubtaskInput() {
    document.getElementById('subtaskInput').value = '';
}


export function handleKeyDown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        saveSubtask();
    }
}


export function saveSubtask() {
    let subtaskList = document.getElementById('subtaskList');
    let inputText = document.getElementById('subtaskInput').value.trim();
    if (inputText === '') { return; }
    let index = subtaskList.children.length;
    let subtaskHTML = generateSaveSubtaskHTML(inputText, index);
    let subtaskItem = document.createElement('div');
    subtaskItem.innerHTML = subtaskHTML;
    subtaskList.appendChild(subtaskItem.firstElementChild);
    document.getElementById('subtaskInput').value = '';
    document.getElementById('subtaskIconContainer').classList.add('dNone');
    document.getElementById('subtaskPlusIcon').classList.remove('dNone');
    deactivateSubtaskListeners();
    activateSubtaskListeners();
}


export function editSubtask(editIcon) {
    let subtaskItem = editIcon.closest('.subtaskEditList');
    let subtaskText = subtaskItem.querySelector('.subtaskItemText');
    let editInput = subtaskItem.querySelector('.editSubtaskInput');
    subtaskText.classList.add('dNone');
    editInput.classList.remove('dNone');
    editInput.focus();
    editInput.addEventListener('blur', function () { saveEditedSubtask(subtaskText, editInput); });
    deactivateSubtaskListeners();
    activateSubtaskListeners();
}


function saveEditedSubtask(subtaskText, editInput) {
    subtaskText.textContent = editInput.value.trim();
    subtaskText.classList.remove('dNone');
    editInput.classList.add('dNone');
}


export function deleteSubtask(deleteIcon) {
    let subtaskItem = deleteIcon.closest('.subtaskEditList');
    subtaskItem.remove();
    deactivateSubtaskListeners();
    activateSubtaskListeners();
}


function clearSubtaskList() {
    document.getElementById('subtaskList').innerHTML = '';
}


function getSubtasks() {
    const subtaskItems = document.querySelectorAll('.subtaskList .subtaskItemText');
    let subtasks = [];
    subtaskItems.forEach(item => { subtasks.push({ status: "unchecked", text: item.innerText }); });
    return subtasks;
}


export async function pushNewTask() {
    let newTask = createNewTask();
    await postDataToDatabase("tasks", newTask);
    closeAddTaskModal();
}


export function formValidation() {
    const inputs = document.querySelectorAll('.singleInputContainer input[required]');
    let isValid = true;
    inputs.forEach(input => {
        const validationText = input.nextElementSibling;
        if (input.value.trim() === '') {
            formValidationTrue(input, validationText);
            isValid = false;
        }
        else formValidationFalse(input, validationText);
        formValidationListener(input, validationText);
    });
    return isValid;
}


function formValidationTrue(input, validationText) {
    validationText.style.display = 'block';
    input.classList.add('formValidationInputBorder');
}



function formValidationFalse(input, validationText) {
    validationText.style.display = 'none';
    input.classList.remove('formValidationInputBorder');
}



function formValidationListener(input, validationText) {
    input.addEventListener('input', () => {
        if (input.value.trim() !== '') {
            validationText.style.display = 'none';
            input.classList.remove('formValidationInputBorder');
        } else {
            validationText.style.display = 'block';
            input.classList.add('formValidationInputBorder');
        }
    });
}


function createNewTask() {
    return {
        title: getId('taskTitle'),
        description: getId('taskDescription'),
        date: getId('dateInput'),
        prio: currentPrio,
        status: sessionStorage.getItem('taskCategory'),
        subtasks: getSubtasks(),
        assignedTo: assignedContacts,
        category: document.getElementById('categoryInput').value,
    };
}


async function closeAddTaskModal() {
    if (activeTab == 'add task') {
        showTaskAddedAnimation();
        setTasks([]);
        setActiveTab('.menuBtn[href="../html/board.html"]');
        sessionStorage.removeItem('tasks');
    } else {
        showTaskAddedAnimation();
        setTasks([]);
        setTimeout(() => location.reload(), 2000);
    }
}


function showTaskAddedAnimation() {
    if (window.location.href.endsWith('addtask.html')) {
        toggleClass('taskAddedBtn', 'd-None', 'show');
        setTimeout(() => {
            return window.location.href = "../html/board.html";
        }, 2000);
    } else showTaskAddedAnimationModal();
}


function showTaskAddedAnimationModal() {
    toggleClass('taskAddedBtn', 'd-None', 'show');
    setTimeout(() => { closeModal(); }, 2000);
}


export function clearAddTaskForm() {
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('dateInput').value = '';
    updatePrioActiveBtn('');
    document.getElementById('subtaskInput').value = '';
    clearSubtaskList();
}


export function updatePrioActiveBtn(prio) {
    const buttons = document.querySelectorAll('.prioBtn');
    buttons.forEach(button => {
        button.classList.remove('prioBtnUrgentActive', 'prioBtnMediumActive', 'prioBtnLowActive');
        const imgs = button.querySelectorAll('img');
        imgs.forEach(img => { img.classList.add('hidden'); });
    });
    changeActiveBtn(prio);
}


function changeActiveBtn(prio) {
    const activeButton = document.querySelector(`.prioBtn[data-prio="${prio}"]`);
    if (activeButton) {
        activeButton.classList.add(`prioBtn${capitalize(prio)}Active`);
        const whiteIcon = activeButton.querySelector(`.prio${prio}smallWhite`);
        if (whiteIcon) {
            whiteIcon.classList.remove('hidden');
        }
    }
}


function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}


export function setPrio(element) {
    const prio = element.getAttribute('data-prio');
    currentPrio = prio;
    updatePrioActiveBtn(prio);
}


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


export function generateSaveSubtaskHTML(inputText, index) {
    return /*html*/`
      <li class="subtaskEditList" id="subtask-${index}">
        <div class="subtaskItem">
          <span class="subtaskItemText">${inputText}</span>
          <input type="text" class="editSubtaskInput dNone" value="${inputText}" maxlength="80">
          <div class="addedTaskIconContainer">
              <img class="icon editSubtaskBtns" data-action="edit" src="../assets/icons/pencilDarkBlue.svg">
              <div class="subtaskInputSeperator"></div>
              <img class="icon deleteSubtaskBtns" data-action="delete" src="../assets/icons/delete.svg">
          </div>
        </div>

      </li>
  `;
}


export function activateListeners() {
    boardListenerAddTask('add');
    boardListenerDropAreas('add');
    boardListenerMisc('add');
}


export function deactivateAllListenersBoard() {
    boardListenerAddTask('remove');
    boardListenerDropAreas('remove');
    boardListenerMisc('remove');
    deactivateDragDrop();
    deactivateOverlayListeners();
    deactivateDeleteResponseListeners();
    deactivateEditTaskListeners();
}


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


function handleAddTaskBtnClick(event) {
    if (event.target.id === "addTaskInProgress") checkScreenWidth("inProgress");
    else if (event.target.id === "addTaskFeedback") checkScreenWidth("awaitFeedback");
    else checkScreenWidth("toDo");
};


function handleSearchInput() {
    const searchInput = document.getElementById("searchInput");
    searchTasks(searchInput.value);
}


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


export function activateOverlayListeners(elementId) {
    boardListenerOverlayButtons("add");
    boardListenerOverlaySubtasks("add");
}


export function deactivateOverlayListeners() {
    boardListenerOverlayButtons("remove");
    boardListenerOverlaySubtasks("remove");
}


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


function boardListenerOverlaySubtasks(action) {
    const subtasks = document.querySelectorAll('.modalSubtasksSingle');
    if (action === "add") {
        subtasks?.forEach(subtask => subtask.addEventListener('click', handleSubtaskClick));
    } else if (action === "remove") {
        subtasks?.forEach(subtask => subtask.removeEventListener('click', handleSubtaskClick));
    }
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


export function activateEditTaskListeners() {
    boardListenerEditTaskGeneral("add");
    boardListenerEditTaskAssignMenu("add");
    boardListenerEditTaskSubtasks("add");
    activateSubtaskListeners();
}


export function deactivateEditTaskListeners() {
    boardListenerEditTaskGeneral("remove");
    boardListenerEditTaskAssignMenu("remove");
    boardListenerEditTaskSubtasks("remove");
    deactivateSubtaskListeners();
}


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


document.addEventListener("DOMContentLoaded", () => {
    const category = localStorage.getItem('taskCategory');
    if (category) localStorage.removeItem('taskCategory');
});


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


async function pushDataToArray() {
    try {
        let tasksData = await getDataFromDatabase("tasks");
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


function updateAllTaskCategories() {
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
                updateSubtaskProgressBar(element.subtasks, element.id);
            }
        });
    } else {
        if (categoryElement) categoryElement.innerHTML = `<div class="noTaskPlaceholder">${noTaskMessage}</div>`;
    }
}


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
    if (currentSearchInput) searchTasks(currentSearchInput);
}


export function searchTasks(inputValue) {
    emptyDragAreasWhileSearching(inputValue);
    currentSearchInput = inputValue.toLowerCase();
    const taskCards = document.querySelectorAll(".todoContainer");
    let anyVisibleTask = searchTasksInCards(taskCards, currentSearchInput);
    updateNoTasksFoundVisibility(anyVisibleTask);
}


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


function emptyDragAreasWhileSearching(searchInput) {
    const dragAreas = document.querySelectorAll(".noTaskPlaceholder");

    if (searchInput === '') {
        dragAreas.forEach((dragArea) => dragArea.classList.remove("dNone"));
    } else {
        dragAreas.forEach((dragArea) => dragArea.classList.add("dNone"));
    }
}


function updateNoTasksFoundVisibility(anyVisibleTask) {
    const noTasksFound = document.getElementById('noTasksFound');
    if (anyVisibleTask) noTasksFound.classList.add('dNone');
    else noTasksFound.classList.remove('dNone');
}


export function checkScreenWidth(category) {
    const screenWidth = window.innerWidth;
    const activeTab = document.querySelector('.menuBtn[href="../html/addtask.html"]');
    sessionStorage.setItem('taskCategory', category);
    if (screenWidth < 992) {
        changeActive(activeTab);
        window.location.href = "../html/addtask.html";
    } else openAddTaskOverlay();
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
            updateSubtaskStatusInDOM(subtask, subtaskIndex);
            updateSubtaskProgressBar(task.subtasks, taskId);
            await updateDataInDatabase(`${BASE_URL}tasks/${taskId}.json?auth=${token}`, task);
            let taskIndex = tasks.findIndex(t => taskId === t.id);
            tasks.splice(taskIndex, 1, await createTaskArray(taskId, task));
            sessionStorage.setItem("tasks", JSON.stringify(tasks));
        }
    }
}


function updateSubtaskStatusInDOM(subtask, index) {
    subtask.status = subtask.status === "checked" ? "unchecked" : "checked";

    const subtaskCheckbox = document.getElementById(`subtaskCheckbox${index}`);
    if (subtaskCheckbox) {
        subtaskCheckbox.src = subtask.status === "checked"
            ? "../assets/icons/checkboxchecked.svg"
            : "../assets/icons/checkbox.svg";
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
    const task = createEditedTask(taskId);
    await updateDataInDatabase(`${BASE_URL}tasks/${taskId}.json?auth=${token}`, task);
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    tasks.splice(taskIndex, 1, await createTaskArray(taskId, task));
    sessionStorage.setItem("tasks", JSON.stringify(tasks));
    openOverlay(taskId);
    initDragDrop();
    applyCurrentSearchFilter();
}


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


export function generateTodoHTML(element) {
    let categoryHTML = generateCategoryHTML(element.category);
    let titleHTML = generateTitleHTML(element.title);
    let descriptionHTML = generateDescriptionHTML(element.description);
    let subtasksHTML = generateSubtasksHTML(element.subtasks, element.id);
    let assignedToHTML = generateAssignedToHTML(element.assignedTo);
    let prioHTML = generatePrioHTML(element.prio);

    return /*html*/ `
        <div draggable="true" id="${element.id}" class="todoContainer" data-id="${element.id}">
            <div class="toDoContent">
                ${categoryHTML}
                <div class="toDoHeaderContainer">
                    ${titleHTML}
                    ${descriptionHTML}
                </div>
                ${subtasksHTML}
                <div class="toDoContentBottomContainer">
                    <div class="assignedToBadgeContainer">${assignedToHTML}</div>
                    ${prioHTML}
                </div>
            </div>
        </div>
    `;
}


function generateCategoryHTML(category) {
    let categoryHTML = '';
    if (category == 'User Story') {
        categoryHTML = `<div class="userStoryBadge">User Story</div>`;
    } else {
        categoryHTML = `<div class="technicalTaskBadge">Technical Task</div>`;
    }
    return categoryHTML;
}


function generateTitleHTML(title) {
    let titleHTML = '';
    if (title.length < 20) {
        titleHTML = `<div class="toDoHeader">${title}</div>`;
    } else {
        titleHTML = `<div class="toDoHeader">${title.substring(0, 20) + '...'}</div>`;
    }
    return titleHTML;
}


function generateDescriptionHTML(description) {
    let descriptionHTML = '';
    if (description.length < 60) {
        descriptionHTML = `<div class="toDoDescription">${description}</div>`;
    } else {
        descriptionHTML = `<div class="toDoDescription">${description.substring(0, 40) + '...'}</div>`;
    }
    return descriptionHTML;
}


function generateSubtasksHTML(subtasks, id) {
    let subtasksHTML = "";
    if (subtasks && subtasks.length > 0) {
        subtasksHTML = /*html*/ `
        <div class="toDoSubtasksContainer">
            <div class="subtasksProgressbar">
                <div id="subtasksProgressbarProgress${id}" class="subtasksProgressbarProgress" style="width: 0%;" role="progressbar"></div>
            </div>
            <div id="subtasksProgressbarText${id}">0/${subtasks.length} Subtasks</div>
        </div>`;
    }
    return subtasksHTML;
}


function generateAssignedToHTML(assignedTo) {
    let assignedToHTML = '';
    if (!assignedTo) {
        return '';
    }
    for (let i = 0; i < Math.min(assignedTo.length, 4); i++) {
        assignedToHTML += `<div class="assignedToBadge">${assignedTo[i].profilePic}</div>`;
    }
    if (assignedTo.length > 4) {
        let assignedNum = assignedTo.length - 4;
        assignedToHTML += `<div class="assignedToMoreBadge">+${assignedNum}</div>`;
    }
    return assignedToHTML;
}


function generatePrioHTML(prio) {
    let prioHTML = '';
    if (prio == 'urgent') {
        prioHTML = `<img src="../assets/icons/priourgent.png">`;
    } else if (prio == 'medium') {
        prioHTML = `<img src="../assets/icons/priomedium.png">`;
    } else {
        prioHTML = `<img src="../assets/icons/priolow.png">`;
    }
    return prioHTML;
}


export async function fetchAddTaskTemplate() {
    let response = await fetch("../assets/templates/html/addtasktemplate.html");
    let html = await response.text();
    return `
        <div class="addTaskModalContainer">
          ${html}
        </div>
      `;
}


function generateModalCategoryHTML(category) {
    let modalCategoryHTML = '';
    if (category == 'User Story') {
        modalCategoryHTML = `<div class="modalUserStoryBadge">User Story</div>`;
    } else {
        modalCategoryHTML = `<div class="modalTechnicalTaskBadge">Technical Task</div>`;
    }
    return modalCategoryHTML;
}


function generateModalAssignedToHTML(assignedTo) {
    if (!assignedTo) return '';
    let modalAssignedToHTML = '';
    for (let i = 0; i < assignedTo.length; i++) {
        modalAssignedToHTML += /*html*/`
            <div class="modalAssignedToSingle">
                ${assignedTo[i].profilePic}
                ${assignedTo[i].name}
            </div>
        `;
    }
    return modalAssignedToHTML;
}


function generateModalSubtasksHTML(element) {
    let modalSubtasksHTML = "";
    if (element.subtasks) {
        for (let i = 0; i < element.subtasks.length; i++) {
            let subtask = element.subtasks[i];
            let checked = subtask.status === 'checked' ? '../assets/icons/checkboxchecked.svg' : '../assets/icons/checkbox.svg';
            modalSubtasksHTML += /*html*/ `
                <label class="modalSubtasksSingle" data-subtaskindex="${i}">
                    <img id="subtaskCheckbox${i}" src="${checked}" alt="Checkbox">
                    <div>${subtask.text}</div>
                </label>
            `;
        }
    } else {
        modalSubtasksHTML = 'No subtasks available!';
    }
    return modalSubtasksHTML;
}


export function generateOpenOverlayHTML(element) {
    let modalCategoryHTML = generateModalCategoryHTML(element.category);
    let priority = element.prio.charAt(0).toUpperCase() + element.prio.slice(1);
    let modalAssignedToHTML = generateModalAssignedToHTML(element.assignedTo);
    let modalSubtasksHTML = generateModalSubtasksHTML(element);

    return /*html*/ `
        <div class="modalContainer" id="modalContainer" data-id="${element.id}">
            <div class="modalToDoContent">
                <div class="modalCategoryContainer">
                    ${modalCategoryHTML}
                    <img id="modalCloseBtn" class="modalCloseIcon" src="../assets/icons/closeGrey.svg" alt="">
                </div>
                <div class="modalScrollbarWrapper">
                    <div id="modalHeader" class="modalHeader">${element.title}</div>
                    <div class="modalDescription" id="modalDescription">${element.description}</div>
                    <div class="modalDateContainer">
                        <div class="modalDateText">Due date:</div>
                        <div>${element.date}</div>
                    </div>
                    <div class="modalPrioContainer">
                        <div class="modalPrioText">Priority:</div>
                        <div class="modalPrioIconContainer">
                            <div>${priority}</div>
                            <img src="../assets/icons/prio${element.prio}small.svg">
                        </div>
                    </div>
                    <div class="modalAssignedToContainer">
                        <div class="modalAssignedToText">Assigned To:</div>
                        <div class="modalAssignedToContainer">${modalAssignedToHTML}</div>
                    </div>
                    <div>
                        <div class="modalSubtasksText">Subtasks</div>
                        <div class="modalSubtasksContainer">${modalSubtasksHTML}</div>
                    </div>
                </div>
                <div class="modalBottomContainer">
                    <div id="modalContainerDeleteBtn" class="modalBottomDeleteContainer">
                        <img src="../assets/icons/deleteDarkBlue.svg">
                        <div>Delete</div>
                    </div>
                    <div class="modalBottomSeparator"></div>
                    <div id="modalContainerEditBtn" class="modalBottomEditContainer">
                        <img src="../assets/icons/pencilDarkBlue.svg">
                        <div>Edit</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}


export function generateTaskEditHTML(taskId) {
    let task = tasks.find(task => task.id === taskId);
    let subtaskHTML = '';
    !task.assignedTo ? setAssignedContacts([]) : setAssignedContacts(task.assignedTo);

    if (task.subtasks && task.subtasks.length > 0) {
        task.subtasks.forEach((subtask, index) => {
            subtaskHTML += /*html*/ `
                <li class="subtaskEditList" data-index="${index}" id="subtask-${index}">
                    <div class="subtaskItem">
                        <span class="subtaskItemText">${subtask.text}</span>
                        <input type="text" class="editSubtaskInput dNone" value="${subtask.text}" maxlength="80"/>
                        <div class="addedTaskIconContainer">
                            <img class="icon editSubtaskBtns" data-action="edit" src="../assets/icons/pencilDarkBlue.svg">
                            <div class="subtaskInputSeperator"></div>
                            <img class="icon deleteSubtaskBtns" data-action="delete" src="../assets/icons/delete.svg">
                        </div>
                    </div>
                </li>
            `;
        });
    }

    return /*html*/ `
        <div class="modalToDoContent">
            <div class="editTaskCloseContainer">
                <img id="editTaskCloseBtn" class="modalCloseIcon" src="../assets/icons/closeGrey.svg" alt="">
            </div>
            <form id="editTaskForm" data-id="${taskId}" class="editTaskForm">
                <div class="editTaskScrollbarWrapper">
                    <div class="singleInputContainer">
                        <div class="redStarAfter">Title</div>
                        <input id="editTaskTitle" type="text" placeholder="Enter a title" required maxlength="80">
                        <div class="formValidationText" style="display: none;">This field is required</div>
                    </div>
                    <div class="singleInputContainer">
                        <div>Description</div>
                        <textarea id="editTaskDescription" placeholder="Enter a Description" maxlength="240"></textarea>
                    </div>
                    <div class="singleInputContainer">
                        <div class="redStarAfter">Due date</div>
                        <input id="editDateInput" class="dateInput" type="date" placeholder="dd/mm/yyyy" required>
                        <div class="formValidationText" style="display: none;">This field is required</div>
                    </div>
                    <div class="editTaskPrioContainer">
                        <div>Priority</div>
                    <div class="prioBtnContainer">
                        <div id="urgentPrioBtn" class="prioBtn prioBtnUrgent" data-prio="urgent">
                        <div>Urgent</div>
                            <img class="priourgentsmallWhite" src="../assets/icons/priourgentsmallWhite.svg">
                            <img class="priourgentsmall" src="../assets/icons/priourgentsmall.svg">
                        </div>
                        <div class="prioBtn prioBtnMedium prioBtnMediumActive" data-prio="medium">
                            <div>Medium</div>
                            <img class="priomediumsmallWhite" src="../assets/icons/priomediumsmallWhite.svg">
                            <img class="priomediumsmall" src="../assets/icons/priomediumsmall.svg">
                        </div>
                        <div class="prioBtn prioBtnLow" data-prio="low">
                            <div>Low</div>
                            <img class="priolowsmallWhite" src="../assets/icons/priolowsmallWhite.svg">
                            <img class="priolowsmall" src="../assets/icons/priolowsmall.svg">
                        </div>
                    </div>
                    </div>
                    <div class="singleInputContainer">
                        <div>Assigned to</div>
                        <div id="assignDropdown" class="assignContainer">
                            <input id="assignSearch" type="search" class="contactsAssignStandard"
                                value="Select contacts to assign" placeholder="Search contacts" readonly>
                            <div id="assignDropArrowContainer" class="imgContainer">
                                <img id="assignDropArrow" src="../assets/icons/arrowdropdown.svg" alt="">
                            </div>
                            <div id="contactsToAssign" class="contactsToAssign"></div>
                        </div>
                        <div id="contactsAssigned" class="contactsAssigned"></div>
                    </div>
                    <div class="singleInputContainer">
                        <div>Subtasks</div>
                        <div id="subtasksInputContainer" class="subtasksInputContainer">
                            <input id="subtaskInput" class="subtasksInput" type="text" placeholder="Add new subtask" maxlength="80">
                            <img id="subtaskPlusIcon" class="subtaskPlusIcon" src="../assets/icons/addBlack.svg">
                            <div id="subtaskIconContainer" class="subtaskIconContainer dNone">
                                <img id="subtaskDeleteIcon" class="icon" src="../assets/icons/delete.svg">
                                <div class="subtaskInputSeperator"></div>
                                <img id="subtaskSaveIcon" class="icon" src="../assets/icons/checkBlackBig.svg">
                            </div>
                        </div>
                        <ul id="subtaskList">${subtaskHTML}</ul>
                    </div>
                </div>
                <div class="editBottomContainer">
                    <button id="saveTaskEditBtn" type="submit" class="saveTaskEditBtn">
                        <div>Ok</div>
                        <img src="../assets/icons/check.svg">
                    </button>
                </div>
            </form>
        </div>
    `;
}


export function openDeleteTaskSureHtml(id) {
    return /*html*/`
        <div class="deleteQuestion">
            <p>Do you really want to delete this entry?</p>
            <form id="deleteTaskForm" data-id="${id}">
                <button id="deleteTaskNo" type="button">
                    NO 
                    <img src="../assets/icons/close.svg" alt="close X">
                </button>
                <button type="submit">
                    YES 
                    <img src="../assets/icons/check.svg" alt="check icon">
                </button>
            </form>
        </div>
    `;
}


export function deactivateAllListenersContacts() {
    deactivateListeners();
    deactivateListenersDetails();
    deactivateListenersEdit();
    deactivateListenersDelete();
    deactivateListenersAdd();
}


export function activateListeners() {
    const moreContactsButton = document.getElementById('moreContactsButton');
    const contactsListItem = document.querySelectorAll('.contactListItem');
    moreContactsButton?.addEventListener('click', openAddContacts);
    contactsListItem?.forEach(item => item.addEventListener('click', openContactDetails));
}


function deactivateListeners() {
    const moreContactsButton = document.getElementById('moreContactsButton');
    const contactsListItem = document.querySelectorAll('.contactListItem');
    moreContactsButton?.removeEventListener('click', openAddContacts);
    contactsListItem?.forEach(item => item?.removeEventListener('click', openContactDetails));
}


function openContactDetails(event) {
    const listItem = event.target.closest('li.contactListItem');
    toggleClass('contactsDetail', 'tt0', 'ttx100');
    renderContactsDetails(listItem.dataset.id);
}


export function activateListenersDetails() {
    const backArrowContacts = document.getElementById('backArrow-contacts');
    const editContactBtn = document.getElementById('editContactBtn');
    const deleteContactBtn = document.getElementById('deleteContactBtn');
    const contactsDetailMore = document.getElementById('contactsDetailMore');
    backArrowContacts?.addEventListener('click', closeDetails);
    editContactBtn?.addEventListener('click', openEditContactsButton);
    deleteContactBtn?.addEventListener('click', openDeleteContactsButton);
    contactsDetailMore?.addEventListener('click', contactsDetailsMore);
}


function deactivateListenersDetails() {
    const backArrowContacts = document.getElementById('backArrow-contacts');
    const editContactBtn = document.getElementById('editContactBtn');
    const deleteContactBtn = document.getElementById('deleteContactBtn');
    const contactDetailsMore = document.getElementById('contactDetailsMore');
    backArrowContacts?.removeEventListener('click', closeDetails);
    editContactBtn?.removeEventListener('click', openEditContactsButton);
    deleteContactBtn?.removeEventListener('click', openDeleteContactsButton);
    contactDetailsMore?.removeEventListener('click', contactsDetailsMore);
}


function closeDetails() {
    toggleClass('contactsDetail', 'tt0', 'ttx100');
}


function openDeleteContactsButton(event) {
    const target = event.target.closest('#deleteContactBtn');
    openDeleteContacts(target.dataset.id);
    activateListenersDelete();
}


function openEditContactsButton(event) {
    const target = event.target.closest('#editContactBtn');
    openEditContacts(event, target.dataset.id);
}


function contactsDetailsMore(event) {
    toggleClass('editMenu', 'ts0', 'ts1');
    activateOutsideCheck(event, 'editMenu', 'ts1', 'ts0');
}


export function activateListenersAdd() {
    const addContactX = document.querySelectorAll('#addContact .closeX');
    const addInput = document.querySelectorAll('.addInput');
    const addContact = document.querySelector('#addContact form');
    const addContactCancel = document.getElementById('cancelAddContact');
    addContactX?.forEach(b => b.addEventListener('click', closeAddContact));
    addInput?.forEach(input => input.addEventListener('keydown', (e) => e.key === 'Enter' && e.preventDefault()));
    addContact?.addEventListener('submit', submitAddContact);
    addContactCancel?.addEventListener('click', closeAddContact);
}


function deactivateListenersAdd() {
    const addContactX = document.querySelectorAll('#addContact .closeX');
    const addInput = document.querySelectorAll('.addInput');
    const addContact = document.querySelector('#addContact form');
    const addContactCancel = document.getElementById('cancelAddContact');
    addContactX?.forEach(b => b?.removeEventListener('click', closeAddContact));
    addInput?.forEach(input => input?.removeEventListener('keydown', (e) => e.key === 'Enter' && e.preventDefault()));
    addContact?.removeEventListener('submit', submitAddContact);
    addContactCancel?.removeEventListener('click', closeAddContact);
}


function closeAddContact() {
    toggleClass('addContact', 'tt0', 'tty100');
    deactivateListenersAdd();
}


async function submitAddContact(event) {
    event.preventDefault();
    if (await addContacts()) closeAddContact();
    refreshPage();
}


export function activateListenersEdit() {
    const workContactX = document.querySelectorAll('#editContact .closeX');
    const editInput = document.querySelectorAll('.editInput');
    const editContact = document.querySelector('#editContact form');
    const editContactDelete = document.getElementById('editContactDelete');
    workContactX?.forEach(b => b.addEventListener('click', closeEditContact));
    editInput?.forEach(input => input.addEventListener('keydown', (e) => e.key === 'Enter' && e.preventDefault()));
    editContactDelete?.addEventListener('click', openDeleteContacts);
    editContact?.addEventListener('submit', submitEditContact);
}


function deactivateListenersEdit() {
    const workContactX = document.querySelectorAll('#editContact .closeX');
    const editInput = document.querySelectorAll('.editInput');
    const editContact = document.querySelector('#editContact form');
    const editContactDelete = document.getElementById('editContactDelete');
    workContactX?.forEach(b => b?.removeEventListener('click', closeEditContact));
    editInput?.forEach(input => input?.removeEventListener('keydown', (e) => e.key === 'Enter' && e.preventDefault()));
    editContactDelete?.removeEventListener('click', openDeleteContacts);
    editContact?.removeEventListener('submit', submitEditContact);
}


function closeEditContact() {
    toggleClass('editContact', 'tt0', 'tty100');
    deactivateListenersEdit();
}


async function submitEditContact(event) {
    event.preventDefault();
    editContacts();
    if (await editContacts()) closeEditContact();
    refreshPage();
}


function activateListenersDelete() {
    const deleteResponse = document.querySelector('#deleteResponse form');
    const closeDeleteResponseBtn = document.getElementById('closeDeleteResponse');
    deleteResponse?.addEventListener('submit', submitDeleteContact);
    closeDeleteResponseBtn?.addEventListener('click', closeDeleteResponse);
}


function deactivateListenersDelete() {
    const deleteResponse = document.querySelector('#deleteResponse form');
    const closeDeleteResponseBtn = document.getElementById('closeDeleteResponse');
    deleteResponse?.removeEventListener('submit', submitDeleteContact);
    closeDeleteResponseBtn?.removeEventListener('click', closeDeleteResponse);
}


function submitDeleteContact(event) {
    event.preventDefault();
    closeDeleteResponse();
    deleteContacts();
}


function closeDeleteResponse() {
    toggleClass('deleteResponse', 'ts0', 'ts1');
    deactivateListenersDelete();
}


export function deactivateAllListenersContacts() {
    deactivateListeners();
    deactivateListenersDetails();
    deactivateListenersEdit();
    deactivateListenersDelete();
    deactivateListenersAdd();
}


export function activateListeners() {
    const moreContactsButton = document.getElementById('moreContactsButton');
    const contactsListItem = document.querySelectorAll('.contactListItem');
    moreContactsButton?.addEventListener('click', openAddContacts);
    contactsListItem?.forEach(item => item.addEventListener('click', openContactDetails));
}


function deactivateListeners() {
    const moreContactsButton = document.getElementById('moreContactsButton');
    const contactsListItem = document.querySelectorAll('.contactListItem');
    moreContactsButton?.removeEventListener('click', openAddContacts);
    contactsListItem?.forEach(item => item?.removeEventListener('click', openContactDetails));
}


function openContactDetails(event) {
    const listItem = event.target.closest('li.contactListItem');
    toggleClass('contactsDetail', 'tt0', 'ttx100');
    renderContactsDetails(listItem.dataset.id);
}


export function activateListenersDetails() {
    const backArrowContacts = document.getElementById('backArrow-contacts');
    const editContactBtn = document.getElementById('editContactBtn');
    const deleteContactBtn = document.getElementById('deleteContactBtn');
    const contactsDetailMore = document.getElementById('contactsDetailMore');
    backArrowContacts?.addEventListener('click', closeDetails);
    editContactBtn?.addEventListener('click', openEditContactsButton);
    deleteContactBtn?.addEventListener('click', openDeleteContactsButton);
    contactsDetailMore?.addEventListener('click', contactsDetailsMore);
}


function deactivateListenersDetails() {
    const backArrowContacts = document.getElementById('backArrow-contacts');
    const editContactBtn = document.getElementById('editContactBtn');
    const deleteContactBtn = document.getElementById('deleteContactBtn');
    const contactDetailsMore = document.getElementById('contactDetailsMore');
    backArrowContacts?.removeEventListener('click', closeDetails);
    editContactBtn?.removeEventListener('click', openEditContactsButton);
    deleteContactBtn?.removeEventListener('click', openDeleteContactsButton);
    contactDetailsMore?.removeEventListener('click', contactsDetailsMore);
}


function closeDetails() {
    toggleClass('contactsDetail', 'tt0', 'ttx100');
}


function openDeleteContactsButton(event) {
    const target = event.target.closest('#deleteContactBtn');
    openDeleteContacts(target.dataset.id);
    activateListenersDelete();
}


function openEditContactsButton(event) {
    const target = event.target.closest('#editContactBtn');
    openEditContacts(event, target.dataset.id);
}


function contactsDetailsMore(event) {
    toggleClass('editMenu', 'ts0', 'ts1');
    activateOutsideCheck(event, 'editMenu', 'ts1', 'ts0');
}


export function activateListenersAdd() {
    const addContactX = document.querySelectorAll('#addContact .closeX');
    const addInput = document.querySelectorAll('.addInput');
    const addContact = document.querySelector('#addContact form');
    const addContactCancel = document.getElementById('cancelAddContact');
    addContactX?.forEach(b => b.addEventListener('click', closeAddContact));
    addInput?.forEach(input => input.addEventListener('keydown', (e) => e.key === 'Enter' && e.preventDefault()));
    addContact?.addEventListener('submit', submitAddContact);
    addContactCancel?.addEventListener('click', closeAddContact);
}


function deactivateListenersAdd() {
    const addContactX = document.querySelectorAll('#addContact .closeX');
    const addInput = document.querySelectorAll('.addInput');
    const addContact = document.querySelector('#addContact form');
    const addContactCancel = document.getElementById('cancelAddContact');
    addContactX?.forEach(b => b?.removeEventListener('click', closeAddContact));
    addInput?.forEach(input => input?.removeEventListener('keydown', (e) => e.key === 'Enter' && e.preventDefault()));
    addContact?.removeEventListener('submit', submitAddContact);
    addContactCancel?.removeEventListener('click', closeAddContact);
}


function closeAddContact() {
    toggleClass('addContact', 'tt0', 'tty100');
    deactivateListenersAdd();
}


async function submitAddContact(event) {
    event.preventDefault();
    if (await addContacts()) closeAddContact();
    refreshPage();
}


export function activateListenersEdit() {
    const workContactX = document.querySelectorAll('#editContact .closeX');
    const editInput = document.querySelectorAll('.editInput');
    const editContact = document.querySelector('#editContact form');
    const editContactDelete = document.getElementById('editContactDelete');
    workContactX?.forEach(b => b.addEventListener('click', closeEditContact));
    editInput?.forEach(input => input.addEventListener('keydown', (e) => e.key === 'Enter' && e.preventDefault()));
    editContactDelete?.addEventListener('click', openDeleteContacts);
    editContact?.addEventListener('submit', submitEditContact);
}


function deactivateListenersEdit() {
    const workContactX = document.querySelectorAll('#editContact .closeX');
    const editInput = document.querySelectorAll('.editInput');
    const editContact = document.querySelector('#editContact form');
    const editContactDelete = document.getElementById('editContactDelete');
    workContactX?.forEach(b => b?.removeEventListener('click', closeEditContact));
    editInput?.forEach(input => input?.removeEventListener('keydown', (e) => e.key === 'Enter' && e.preventDefault()));
    editContactDelete?.removeEventListener('click', openDeleteContacts);
    editContact?.removeEventListener('submit', submitEditContact);
}


function closeEditContact() {
    toggleClass('editContact', 'tt0', 'tty100');
    deactivateListenersEdit();
}


async function submitEditContact(event) {
    event.preventDefault();
    editContacts();
    if (await editContacts()) closeEditContact();
    refreshPage();
}


function activateListenersDelete() {
    const deleteResponse = document.querySelector('#deleteResponse form');
    const closeDeleteResponseBtn = document.getElementById('closeDeleteResponse');
    deleteResponse?.addEventListener('submit', submitDeleteContact);
    closeDeleteResponseBtn?.addEventListener('click', closeDeleteResponse);
}


function deactivateListenersDelete() {
    const deleteResponse = document.querySelector('#deleteResponse form');
    const closeDeleteResponseBtn = document.getElementById('closeDeleteResponse');
    deleteResponse?.removeEventListener('submit', submitDeleteContact);
    closeDeleteResponseBtn?.removeEventListener('click', closeDeleteResponse);
}


function submitDeleteContact(event) {
    event.preventDefault();
    closeDeleteResponse();
    deleteContacts();
}


function closeDeleteResponse() {
    toggleClass('deleteResponse', 'ts0', 'ts1');
    deactivateListenersDelete();
}


const passwordInput = document.getElementById('passwordInput');
let isPasswordVisible = false;
let clickCount = -1;


function initLogin() {
    activateListener();
    const loginForm = document.getElementById('login-form');
    if (loginForm) initForm(loginForm);
}


function initForm(form) {
    const login = form.querySelector('#loginInput');
    const passwordInput = form.querySelector('#passwordInput');
    const checkbox = form.querySelector('#checkbox');
    initInputFocus([login, passwordInput, checkbox]);
    initRememberMe([login, passwordInput, checkbox]);
    setupPasswordToggle();
}

function initInputFocus([login, passwordInput, checkbox]) {
    [login, passwordInput, checkbox].forEach((input) => {
        input.addEventListener('focus', () => {
            const errorMessage = document.getElementById('error-message');
            errorMessage.style.width = '0';
            errorMessage.textContent = '';
        });
    });
}

function initRememberMe([login, passwordInput, checkbox]) {
    const rememberMeChecked = localStorage.getItem('rememberMe') === 'true';
    checkbox.src = rememberMeChecked ? 'assets/icons/checkboxchecked.svg' : 'assets/icons/checkbox.svg';
    if (rememberMeChecked) {
        login.value = localStorage.getItem('login');
        passwordInput.value = localStorage.getItem('password');
        document.getElementById('rememberMe').checked = true;
    }
};


function setupPasswordToggle() {
    passwordInput.addEventListener("click", changeVisibility);
    passwordInput.addEventListener("focus", () => { clickCount++; });
    passwordInput.addEventListener("blur", resetState);
}


function changeVisibility(event) {
    event.preventDefault();
    const selectionStart = passwordInput.selectionStart;
    togglePasswordVisibility();
    clickCount = clickCount === 0 ? 1 : 0;
    passwordInput.setSelectionRange(selectionStart, selectionStart);
}


function resetState() {
    passwordInput.type = "password";
    passwordInput.style.backgroundImage = "url('assets/icons/password_input.png')";
    clickCount = -1;
    isPasswordVisible = false;
}


function togglePasswordVisibility() {
    passwordInput.type = isPasswordVisible ? "text" : "password";
    const image = isPasswordVisible ? "visibility.png" : "password_off.png";
    passwordInput.style.backgroundImage = `url('assets/icons/${image}')`;
    isPasswordVisible = !isPasswordVisible;
}



async function loginButtonClick(event) {
    event.preventDefault();
    const login = document.getElementById('loginInput').value.trim().toLowerCase();
    const password = document.getElementById('passwordInput').value;
    const isRememberMeChecked = document.getElementById('rememberMe').checked;
    const bodyData = {
        "username": login,
        "password": password,
    };
    await Database.login(bodyData).then(async (data) => {
        await setCurrentUser(data);
        handleRememberMe(isRememberMeChecked);
        continueToSummary();
    }).catch((error) => {
        showError(error);
    });

}


async function setCurrentUser(data) {
    let userData;
    try {
        const user = await Database.get(`api/contacts/${data.id}/`);
        if (user.ok) {
            const userJson = await user.json();
            userData = new Contact(userJson);
        } else userData = { name: "Guest", firstLetters: "G" };
    } catch (error) {
        console.error('Error fetching user data:', error);
    } finally {
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
    }
}


function handleRememberMe(rememberMe) {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    if (rememberMe) {
        localStorage.setItem('login', document.getElementById('loginInput').value);
        localStorage.setItem('password', document.getElementById('passwordInput').value);
        localStorage.setItem('rememberMe', 'true');
    } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('email');
        localStorage.removeItem('password');
    }
}


function continueToSummary() {
    sessionStorage.setItem('activeTab', 'summary');
    deactivateAllListenersLogin();
    window.location.href = 'html/summary.html';
}


function showError(error) {
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.textContent = error.message;
    errorMessageElement.style.width = '100%';
}


async function handleGuestLogin() {
    try {
        const response = await Database.get(`${BASE_URL}auth/guest/`);
        if (!response.ok) {
            throw new Error('Failed to sign in as guest');
        }
        const data = await response.json();
        const guestUser = { name: "Guest", firstLetters: "G" };
        setToken(data.token);
        sessionStorage.setItem("currentUser", JSON.stringify(guestUser));
        localStorage.clear();
        continueToSummary();
    } catch (error) {
        console.error('Error signing in as guest:', error);
    }
}


function checkBoxClicked() {
    const checkedState = document.getElementById('rememberMe').checked;
    const checkboxImg = document.getElementById('checkbox');
    checkboxImg.src = checkedState ? 'assets/icons/checkboxchecked.svg' : 'assets/icons/checkbox.svg';
}


function activateListener() {
    document.getElementById('rememberMe')?.addEventListener('click', checkBoxClicked);
    document.getElementById('loginButton')?.addEventListener('click', loginButtonClick);
    document.getElementById('guestLogin')?.addEventListener('click', handleGuestLogin);
    document.getElementById('signup-btn')?.addEventListener('click', forwardRegister);
    document.getElementById('privacy-policy')?.addEventListener('click', forwardPrivacy);
    document.getElementById('legal-notice')?.addEventListener('click', forwardLegal);
};


export function deactivateAllListenersLogin() {
    document.getElementById('rememberMe')?.removeEventListener('click', checkBoxClicked);
    document.getElementById('loginButton')?.removeEventListener('click', loginButtonClick);
    document.getElementById('guestLogin')?.removeEventListener('click', handleGuestLogin);
    document.getElementById('signup-btn')?.removeEventListener('click', forwardRegister);
    document.getElementById('privacy-policy')?.removeEventListener('click', forwardPrivacy);
    document.getElementById('legal-notice')?.removeEventListener('click', forwardLegal);
    const loginForm = document.getElementById('login-form');
    const login = loginForm?.querySelector('#loginInput');
    const passwordInput = loginForm?.querySelector('#passwordInput');
    const checkbox = loginForm?.querySelector('#checkbox');
    [login, passwordInput, checkbox]?.forEach((input) => {
        input?.removeEventListener('focus', () => {
            const errorMessage = document.getElementById('error-message');
            errorMessage.style.width = '0';
            errorMessage.textContent = '';
        });
    });
}


function forwardRegister() {
    window.location.href = 'html/register.html';
}


export function forwardLegal() {
    sessionStorage.setItem('activeTab', "legal notice");
}


export function forwardPrivacy() {
    sessionStorage.setItem('activeTab', "privacy policy");
}


document.addEventListener("DOMContentLoaded", initLogin);


export function greetingMobileHTML(greetingTime, greetingName) {
    return /*html*/`    
      <div class="summ-greeting-mobile">
        <h3 class="summ-day-greeting">${greetingTime}</h3>
        <span class="summ-person-greeting">${greetingName}</span>
      </div>
    `;
}



export function objectTemplateNumberOfBoard(key, task) {
    return {
        "id": key,
        "assignedTo": task.assignedTo,
        "category": task.category,
        "date": task.date,
        "description": task.description,
        "prio": task.prio,
        "status": task.status,
        "subtasks": task.subtasks,
        "title": task.title
    };
}


export function greetingMobileHTML(greetingTime, greetingName) {
    return /*html*/`    
      <div class="summ-greeting-mobile">
        <h3 class="summ-day-greeting">${greetingTime}</h3>
        <span class="summ-person-greeting">${greetingName}</span>
      </div>
    `;
}


export function objectTemplateNumberOfBoard(key, task) {
    return {
        "id": key,
        "assignedTo": task.assignedTo,
        "category": task.category,
        "date": task.date,
        "description": task.description,
        "prio": task.prio,
        "status": task.status,
        "subtasks": task.subtasks,
        "title": task.title
    };
}



export async function initSummary() {
    displayGreeting();
    await loadCategory();
    activateListener();
}


function displayGreeting() {
    const currentTime = getGreeting();
    const userName = currentUser.name;

    const isMobile = window.matchMedia("(max-width: 1199.8px)").matches;
    const mobileElement = document.getElementById('greetingSummaryMobile');
    const mainElement = document.getElementById('summaryMain');

    if (isMobile) {
        mobileElement.innerHTML = greetingMobileHTML(currentTime, userName);
        animateGreeting(mobileElement, mainElement);
        updateGreetingDesktop(currentTime, userName);
    } else {
        updateGreetingDesktop(currentTime, userName);
    }
}


function getGreeting() {
    const currentTime = new Date().getHours();
    if (currentTime < 12) return "Good morning,";
    else if (currentTime < 18) return "Good afternoon,";
    else return "Good evening,";
}


function animateGreeting(mobileElement, mainElement) {
    mobileElement.style.display = 'flex';
    setTimeout(() => {
        mainElement.style.opacity = '0';
        setTimeout(() => {
            mobileElement.classList.add('hide');
            setTimeout(() => {
                mobileElement.style.display = 'none';
                mainElement.style.opacity = '1';
                mainElement.style.transition = 'opacity 0.9s ease';
            }, 900);
        }, 1000);
    }, 0);
}



function updateGreetingDesktop(time, name) {
    let greetingDesktop = document.getElementById('greetingSumm');
    let greetingNameDesktop = document.getElementById('greetingNameDesktop');
    greetingDesktop.innerText = time;
    greetingNameDesktop.innerText = name;
}


async function loadCategory() {
    try {
        const data = await getDataFromDatabase("api/tasks/summary/");
        let dataJson = await data.json();
        taskAssignment(dataJson);
        displayUrgentTasks(dataJson);
    } catch (error) {
        console.error("Error loading categories:", error);
    }
}


function taskAssignment(data) {
    updateElement('howManyTodos', data.todos);
    updateElement('howManyInProgress', data.in_progress);
    updateElement('howManyAwaitFeedback', data.await_feedback);
    updateElement('howManyDone', data.done);
    updateElement('howManyTaskInBoard', data.total);
}


function updateElement(elementId, newValue) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = newValue;
    }
}


function displayUrgentTasks(data) {
    const urgentTaskCount = data.urgent;
    const urgentTaskDate = urgentTaskCount > 0
        ? new Date(data.next_urgent_due).toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
        : '';

    updateElement('howManyUrgent', urgentTaskCount);
    updateElement('summUrgentDate', urgentTaskDate);
}


function activateListener() {
    document.querySelectorAll('.summ-info-field').forEach(btn => {
        btn.addEventListener('click', nextPage);
    });
}


export function deactivateAllListenersSummary() {
    document.querySelectorAll('.summ-info-field').forEach(btn => {
        btn.removeEventListener('click', nextPage);
    });
}


function nextPage() {
    sessionStorage.setItem('activeTab', 'board');
    window.location.href = 'board.html';
}