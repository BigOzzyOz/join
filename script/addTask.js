import { activeTab, contacts, setActiveTab, toggleClass, postDataToDatabase, setTasks, } from "../script.js";
import { closeModal } from "./board2.js";
import { handleAssignContact } from "./board-listener.js";
import { activateSubtaskListeners, deactivateSubtaskListeners } from "./addTask-listener.js";
import { htmlRenderContactsAssign, generateSaveSubtaskHTML } from "./addTaskTemplate.js";
import { svgProfilePic } from "./contactsTemplate.js";

export let assignedContacts = [];
export let currentPrio = 'medium';


//NOTE - Dropdown functions


/**
 * Toggles the assignment dropdown menu open or closed.
 * If the dropdown is opened, it initializes the assignment process
 * by displaying the contacts and setting the appropriate styles.
 * Otherwise, it reverts the styles and clears the displayed contacts.
 */
export async function toggleDropdown() {
  document.getElementById('assignDropdown').classList.toggle('open');
  document.getElementById('assignSearch').classList.contains('contactsAssignStandard') ? await openAssignDropdown() : closeAssignDropdown();
  toggleClass('assignSearch', 'contactsAssignStandard', 'contactsAssignOpen');
}


/**
 * Opens the assignment dropdown menu.
 * Renders the list of contacts sorted by name alphabetically in the dropdown
 * and sets the styles for the open state.
 * Adds event listeners for the contacts to be assigned and for outside clicks.
 */
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


/**
 * Closes the assignment dropdown menu.
 * Clears the displayed contacts in the dropdown, removes the event listeners for the contacts to be assigned,
 * and reverts the styles to the closed state.
 */
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


/**
 * Toggles the category dropdown menu open or closed.
 * If the dropdown is opened, it assigns the category value to the input field
 * and sets the styles for the open state.
 * Otherwise, it clears the input field and reverts the styles to the closed state.
 * @param {string} value - The value to assign to the category input field when the dropdown is opened.
 */
export function toggleCategoryDropdown(value) {
  let input = document.getElementById('categoryInput');
  let wrapper = document.getElementById('selectWrapper');
  let arrow = document.getElementById('categoryDropArrow');
  input.value = wrapper.classList.contains('select-wrapperOpen') ? value : '';
  document.getElementById('selectWrapper').classList.toggle('select-wrapperOpen');
  wrapper.classList.contains('select-wrapperOpen') ? arrow.style.transform = 'rotate(180deg)' : arrow.style.transform = 'rotate(0deg)';
}


//NOTE - Assign functions


/**
 * Retrieves the value of the HTML element with the given id.
 *
 * @param {string} id - The id of the HTML element.
 * @returns {string} The value of the HTML element.
 */
function getId(id) {
  return document.getElementById(id).value;
}


/**
 * Sets the assigned contacts array with the provided contacts.
 *
 * @param {Array} contactsArray - The array of contacts to be assigned.
 * @returns {void}
 */
export function setAssignedContacts(contactsArray) {
  assignedContacts = contactsArray;
}


/**
 * Checks if a click event occurred outside the assignment dropdown menu.
 * If the dropdown is open and the click is outside of it, the dropdown
 * menu is toggled closed.
 *
 * @param {Event} event - The click event containing the target element.
 */
function checkOutsideAssign({ target }) {
  let assignMenu = document.getElementById('assignDropdown');
  if (assignMenu.classList.contains('open') && !assignMenu.contains(target)) {
    toggleDropdown();
  };
}


/**
 * Searches for contacts in the assignment dropdown menu based on the input value.
 * Updates the list of contacts displayed in the dropdown menu with the filtered contacts.
 * @returns {void}
 */
export function assignSearchInput() {
  const searchInput = document.getElementById('assignSearch');
  const contactsContainer = document.getElementById('contactsToAssign');
  const searchText = searchInput.value.toLowerCase();
  const contactsSorted = [...contacts].sort((a, b) => a.name.localeCompare(b.name));
  const filteredContacts = contactsSorted.filter(c => c.name.toLowerCase().includes(searchText));
  contactsContainer.innerHTML = filteredContacts.map(c => htmlRenderContactsAssign(c)).join('');
}


/**
 * Toggles the assignment of a contact to the task. If the contact is not currently
 * assigned, it is added to the list of assigned contacts. If the contact is already
 * assigned, it is removed from the list of assigned contacts. The UI is updated to
 * reflect the change.
 *
 * @param {number} id - The ID of the contact to assign.
 */
export function contactAssign(id) {
  const index = assignedContacts.findIndex(c => c.id === id);
  const inAssignedContacts = index > -1;
  const contactLabel = document.getElementById(`contact${id}`).parentElement;
  contactLabel.classList.toggle('contactsToAssignCheck', !inAssignedContacts);
  if (inAssignedContacts) assignedContacts.splice(index, 1);
  else assignedContacts.push(contacts.find(c => c.id === id));
  renderAssignedContacts();
}


/**
 * Renders the list of assigned contacts for the current task.
 * The list is rendered in the contactsAssigned container and is
 * limited to 5 contacts. If there are more than 5 assigned contacts,
 * a badge is shown with the number of additional contacts.
 * @returns {void}
 */
export function renderAssignedContacts() {
  let assignedContactsContainer = document.getElementById('contactsAssigned');
  assignedContactsContainer.innerHTML = '';
  for (let i = 0; i < assignedContacts.length; i++) {
    const contact = assignedContacts[i];
    if (i <= 5) {
      assignedContactsContainer.innerHTML += contact.profilePic;
    } else {
      assignedContactsContainer.innerHTML += svgProfilePic('#2a3748', `+${assignedContacts.length - 5}`, 120, 120);
      break;
    }
  }
}


//NOTE - Subtask functions


/**
 * Handles the addition of a new subtask based on user input.
 * - Invokes the handleKeyDown function to manage key-based events.
 * - Toggles the visibility of subtask icons based on the input length.
 *
 * @param {Event} event - The event object that triggered the function call, typically a keypress or click event.
 */
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


/**
 * Clears the value of the subtask input field.
 * Resets the input field to an empty string.
 */
export function clearSubtaskInput() {
  document.getElementById('subtaskInput').value = '';
}


/**
 * Handles keydown events on the subtask input field.
 * If the key pressed is Enter, the event is prevented from
 * propagating and the saveSubtask function is called to save
 * the subtask.
 * @param {Event} event - The event object that triggered the function call.
 */
export function handleKeyDown(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    saveSubtask();
  }
}


/**
 * Saves a subtask based on user input.
 * - Retrieves the subtask input value and its trimmed version.
 * - Checks if the trimmed value is empty and if so, ends the function.
 * - Retrieves the subtask list element and counts the number of its children.
 * - Generates the HTML for the new subtask by calling generateSaveSubtaskHTML.
 * - Creates a new div element and sets its innerHTML to the generated HTML.
 * - Appends the new subtask element to the subtask list.
 * - Resets the subtask input field to an empty string.
 * - Toggles the visibility of subtask icons.
 * - Deactivates and reactivates event listeners for subtask-related elements.
 */
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


/**
 * Handles the edit subtask button click event.
 * Retrieves the subtask item and its text and input elements.
 * Hides the subtask text and shows the input element.
 * Focuses the input element and adds an event listener for blur
 * to save the edited subtask when the input loses focus.
 * Deactivates and reactivates event listeners for subtask-related elements.
 * @param {Element} editIcon - The edit subtask button that triggered the event.
 */
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


/**
 * Saves the edited subtask by updating the subtask text with the edited value.
 * Hides the input element and shows the text element.
 * @param {Element} subtaskText - The text element of the subtask.
 * @param {Element} editInput - The input element of the subtask.
 */
function saveEditedSubtask(subtaskText, editInput) {
  subtaskText.textContent = editInput.value.trim();
  subtaskText.classList.remove('dNone');
  editInput.classList.add('dNone');
}


/**
 * Deletes a subtask based on user input.
 * Retrieves the subtask item and removes it.
 * Deactivates and reactivates event listeners for subtask-related elements.
 * @param {Element} deleteIcon - The delete subtask button that triggered the event.
 */
export function deleteSubtask(deleteIcon) {
  let subtaskItem = deleteIcon.closest('.subtaskEditList');
  subtaskItem.remove();
  deactivateSubtaskListeners();
  activateSubtaskListeners();
}


/**
 * Clears the subtask list by setting the innerHTML of the subtask list element to an empty string.
 */
function clearSubtaskList() {
  document.getElementById('subtaskList').innerHTML = '';
}


/**
 * Retrieves all subtasks from the subtask list.
 * @return {Array} Array of subtask objects, each with "status" and "text" properties.
 */
function getSubtasks() {
  const subtaskItems = document.querySelectorAll('.subtaskList .subtaskItemText');
  let subtasks = [];
  subtaskItems.forEach(item => { subtasks.push({ status: "unchecked", text: item.innerText }); });
  return subtasks;
}


/**
 * Creates a new task based on the user's input in the add task modal,
 * sends a POST request to the server to add the new task to the database,
 * and closes the add task modal.
 * The new task object is created by calling createNewTask.
 * The POST request is handled by the postDataToDatabase function imported from script.js.
 * After the request is resolved, the add task modal is closed by calling closeAddTaskModal.
 */
export async function pushNewTask() {
  let newTask = createNewTask();
  await postDataToDatabase("tasks", newTask);
  closeAddTaskModal();
}


//NOTE - Validation functions


/**
 * Checks if all required input fields in the add task modal are filled in and valid.
 * Iterates over all required input fields and their corresponding validation text elements.
 * If an input field is empty, it sets the validation text to an error message.
 * If an input field is not empty, it sets the validation text to an empty string.
 * Attaches event listeners to the input fields to check their validity in real-time.
 * Returns true if all required input fields are valid, false otherwise.
 */
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



/**
 * Sets the validation text to an error message and adds a red border to the input element when the input is empty.
 * Called by formValidation.
 * @param {Element} input - The input element to be validated.
 * @param {Element} validationText - The element that displays the validation error message.
 */
function formValidationTrue(input, validationText) {
  validationText.style.display = 'block';
  input.classList.add('formValidationInputBorder');
}



/**
 * Hides the validation error message and removes the red border from the input element when the input is valid.
 * Called by formValidation.
 * @param {Element} input - The input element to be validated.
 * @param {Element} validationText - The element displaying the validation error message.
 */
function formValidationFalse(input, validationText) {
  validationText.style.display = 'none';
  input.classList.remove('formValidationInputBorder');
}



/**
 * Adds an event listener to the input element to listen for input events.
 * If the input value is not empty, it hides the validation error message and removes the red border.
 * If the input value is empty, it shows the validation error message and adds the red border.
 * @param {Element} input - The input element to add the event listener to.
 * @param {Element} validationText - The element that displays the validation error message.
 */
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


//NOTE - Task functions


/**
 * Creates a new task object with the current values from the add task form.
 * @returns {Object} The new task object.
 */
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


/**
 * Closes the add task modal by running the task added animation and either reloading
 * the page or switching to the board page, depending on the current active tab.
 * @async
 */
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


/**
 * Shows the "Task added!" animation. If the current page is addtask.html,
 * it shows the animation and redirects to the board page after 2 seconds.
 * If the current page is board.html, it shows the animation and closes the add
 * task modal after 2 seconds.
 */
function showTaskAddedAnimation() {
  if (window.location.href.endsWith('addtask.html')) {
    toggleClass('taskAddedBtn', 'd-None', 'show');
    setTimeout(() => {
      return window.location.href = "../html/board.html";
    }, 2000);
  } else showTaskAddedAnimationModal();
}


/**
 * Displays the "Task added!" animation modal.
 * - Toggles the visibility of the task added button to show the animation.
 * - Automatically closes the modal after 2 seconds by calling closeModal.
 */
function showTaskAddedAnimationModal() {
  toggleClass('taskAddedBtn', 'd-None', 'show');
  setTimeout(() => { closeModal(); }, 2000);
}


/**
 * Clears all input fields in the add task form.
 * - Resets the title, description and date input fields to empty strings.
 * - Resets the priority buttons to their default state (no button is active).
 * - Resets the subtask input field to an empty string.
 * - Clears the subtask list.
 */
export function clearAddTaskForm() {
  document.getElementById('taskTitle').value = '';
  document.getElementById('taskDescription').value = '';
  document.getElementById('dateInput').value = '';
  updatePrioActiveBtn('');
  document.getElementById('subtaskInput').value = '';
  clearSubtaskList();
}


//NOTE - priority functions


/**
 * Updates the priority buttons to reflect the selected priority.
 * - Removes all active classes from the priority buttons.
 * - Hides all images in the priority buttons.
 * - Calls changeActiveBtn with the given priority to set the correct active button.
 * @param {string} prio - The selected priority.
 */
export function updatePrioActiveBtn(prio) {
  const buttons = document.querySelectorAll('.prioBtn');
  buttons.forEach(button => {
    button.classList.remove('prioBtnUrgentActive', 'prioBtnMediumActive', 'prioBtnLowActive');
    const imgs = button.querySelectorAll('img');
    imgs.forEach(img => { img.classList.add('hidden'); });
  });
  changeActiveBtn(prio);
}


/**
 * Sets the active class on the priority button with the given priority and shows the correct icon.
 * @param {string} prio - The priority to set as active.
 */
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


/**
 * Capitalizes the first character of a given string.
 *
 * @param {string} str - The string to be capitalized.
 * @returns {string} The input string with the first character converted to uppercase.
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}


/**
 * Sets the current priority based on the specified element's data attribute.
 * Updates the active priority button accordingly.
 * 
 * @param {Element} element - The DOM element representing the priority button.
 */
export function setPrio(element) {
  const prio = element.getAttribute('data-prio');
  currentPrio = prio;
  updatePrioActiveBtn(prio);
}