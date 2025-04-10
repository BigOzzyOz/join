import { token, BASE_URL, apiLogout } from "./script/api-init.js";
import { initializeTasksData, initDragDrop } from "./script/board.js";
import { closeModal } from "./script/board2.js";
import { deactivateDeleteResponseListeners, deactivateAllListenersBoard } from "./script/board-listener.js";
import { openDeleteTaskSureHtml } from "./script/boardtemplate.js";
import { deactivateAllListenersContacts } from "./script/contacts-listener.js";
import { deactivateAllListenersLogin } from "./script/login.js";
import { deactivateAllListenersRegister } from "./script/register.js";
import { deactivateAllListenersSummary } from "./script/summary.js";


//NOTE - Global variables


export let currentUser = JSON.parse(localStorage.getItem('currentUser')) || JSON.parse(sessionStorage.getItem('currentUser')) || null;
export let activeTab = sessionStorage.getItem('activeTab') || '';
export let contacts = JSON.parse(sessionStorage.getItem('contact')) || [];
export let tasks = JSON.parse(sessionStorage.getItem('tasks')) || [];


//NOTE - initialize and render functions


/**
 * Initializes the application by setting up HTML includes, activating the current tab, 
 * and checking user login status to show or hide content. If no task category is set 
 * in the session storage, it defaults to 'toDo'. Additionally, adds a click event 
 * listener to the back arrow to navigate to the previous page in history.
 * 
 * @async
 * @returns {Promise<void>}
 */
export async function init() {
  await includeHTML();
  setActive();
  checkAndShowOrHideContent();
  if (!sessionStorage.getItem('taskCategory')) sessionStorage.setItem('taskCategory', 'toDo');
  document.getElementById('backArrow')?.addEventListener('click', () => { window.history.back(); });
}


/**
 * A function that fetches HTML content from specified files and injects it
 * into elements with the attribute 'w3-include-html'.
 *
 * @function
 * @async
 * @param {void} None
 * @returns {void} None
 */
async function includeHTML() {
  const elementsToInclude = document.querySelectorAll('[w3-include-html]');
  for (const element of elementsToInclude) {
    const filePath = element.getAttribute('w3-include-html');
    try {
      const response = await fetch(filePath);
      element.innerHTML = response.ok ? await response.text() : 'Page not found';
    } catch {
      element.innerHTML = 'Page not found';
    }
  }
  if (elementsToInclude.length > 0) activateListener();
}


//NOTE - database functions


/**
 * Fetches data from the database at the given path.
 * @param {string} [path] - The path of the data to be fetched.
 * @returns {Promise<Object>} - A promise that resolves to the fetched data.
 * @throws {Error} - If there is an error fetching data from the database.
 */
export async function getDataFromDatabase(path = '') {
  const url = `${BASE_URL}${path}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.error('Error fetching data from database:', error);
  }
}


/**
 * Deletes data from the database at the given path.
 * @param {string} [path] - The path of the data to be deleted.
 * @returns {Promise<Object>} - A promise that resolves to the deleted data.
 */
export async function deleteDataFromDatabase(path = '') {
  try {
    const url = `${BASE_URL}${path}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.error('Error deleting data from database:', error);
  }
}


/**
 * Posts data to the database.
 * @param {string} path - The path where the data should be posted.
 * @param {Object} data - The data to be posted.
 * @returns {Promise<Object>} - The response from the server.
 */
export async function postDataToDatabase(path = "", data = {}) {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  return response;
}


/**
 * Updates data in the database.
 * @param {string} url - The URL of the data to be updated.
 * @param {Object} dataToUpdate - The data to be updated.
 * @returns {Promise<Object>} - A promise that resolves to the updated data.
 */
export async function updateDataInDatabase(path = "", dataToUpdate) {
  try {
    const url = `${BASE_URL}${path}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`,
      },
      body: JSON.stringify(dataToUpdate)
    });
    return response;
  } catch (error) {
    console.error('Error updating data in database:', error);
  }
}


//NOTE - active tab functions


/**
 * Changes the active tab based on the given link.
 * @param {Element} link - The DOM element of the link to be set as active.
 */
export function changeActive(link) {
  let linkBtn = document.querySelectorAll(".menuBtn");
  linkBtn.forEach(btn => btn.classList.remove("menuBtnActive"));
  activeTab = link.innerText.toLowerCase();
  sessionStorage.setItem("activeTab", activeTab);
  sessionStorage.getItem('taskCategory');
  setActive();
}


/**
 * Sets the active tab based on the given link.
 *
 * @function
 * @private
 *
 * @param {string} link - The link to set as the active tab.
 */
function setActive() {
  const menuButtons = document.querySelectorAll(".menuBtn");
  const currentPage = document.querySelector('main').getAttribute('data-page').toLowerCase();
  const activeTabName = activeTab || currentPage;

  menuButtons.forEach(button => {
    const buttonName = button.innerText.toLowerCase();
    if (buttonName === activeTabName) {
      button.classList.add("menuBtnActive");
    }
  });
}


/**
 * Sets the active tab based on the given link.
 * @param {string} link - The selector for the link to be set as active.
 * @returns {void}
 */
export function setActiveTab(link) {
  const activeTab = document.querySelector(link);
  if (activeTab) changeActive(activeTab);
}


//NOTE - user and login functions


/**
 * Checks if a user is logged in and shows or hides content accordingly.
 * If the user is not logged in, all elements with the class 'forbiddenContent' are hidden from view,
 * and the user-specific menu and header items are hidden.
 * If the user is logged in, all elements with the class 'forbiddenContent' are shown,
 * the user-specific menu and header items are shown, and the user's initials are displayed in the header.
 * @returns {void}
 */
function checkAndShowOrHideContent() {
  const forbiddenContentElements = document.querySelectorAll(".forbiddenContent");
  const menuUserContainerElement = document.getElementById("menuUserContainer");
  const headerUserContainerElement = document.getElementById("headerUserContainer");
  const headerUserBadgeElements = document.querySelectorAll(".headerUserBadge");

  if (!forbiddenContentElements || !menuUserContainerElement || !headerUserContainerElement) return;

  if (!currentUser) {
    hideContentWhenNoUser(forbiddenContentElements, menuUserContainerElement, headerUserContainerElement);
  } else {
    showContentWhenUserIsLoggedIn(forbiddenContentElements, menuUserContainerElement, headerUserContainerElement);
    headerUserBadgeElements.forEach(badgeElement => badgeElement.innerText = currentUser.firstLetters);
  }
}


/**
 * Hides content elements when no user is logged in.
 * 
 * @param {NodeList} forbiddenContentElements - A list of elements to be hidden from view.
 * @param {HTMLElement} menuUserContainerElement - The container element for user-specific menu items to be hidden.
 * @param {HTMLElement} headerUserContainerElement - The container element for user-specific header items to be hidden.
 * 
 * This function adds the 'd-none' class to specified elements, effectively making them invisible.
 */
function hideContentWhenNoUser(forbiddenContentElements, menuUserContainerElement, headerUserContainerElement) {
  forbiddenContentElements.forEach(element => element.classList.add('d-none'));
  menuUserContainerElement.classList.add('d-none');
  headerUserContainerElement.classList.add('d-none');
}


/**
 * Shows content elements when a user is logged in.
 * 
 * @param {NodeList} forbiddenContentElements - A list of elements that should be displayed.
 * @param {HTMLElement} menuUserContainerElement - The container element for user-specific menu items.
 * @param {HTMLElement} headerUserContainerElement - The container element for user-specific header items.
 * 
 * This function removes the 'd-none' class from specified elements, making them visible.
 */
function showContentWhenUserIsLoggedIn(forbiddenContentElements, menuUserContainerElement, headerUserContainerElement) {
  forbiddenContentElements.forEach(element => element.classList.remove('d-none'));
  menuUserContainerElement.classList.remove('d-none');
  headerUserContainerElement.classList.remove('d-none');
}


/**
 * Logs out the current user by invoking the Firebase logout function.
 * This will end the current session and redirect the user to the login page.
 */
export function logOut() {
  apiLogout();
}


//NOTE - listeners and handlers functions


/**
 * Deactivates all event listeners for the application.
 * Listeners are for handling the following events:
 * - Login page events (e.g. submit, click, change events).
 * - Register page events (e.g. submit, click, change events).
 * - Summary page events (e.g. click events to open details).
 * - Board page events (e.g. click events to add tasks, edit tasks, delete tasks, change categories, change priorities, change due dates, drag and drop events).
 * - Contacts page events (e.g. click events to open contact details, edit contact, delete contact, add contact, delete contact response).
 * - Header and nav menu button click events to toggle the menu visibility.
 * - Header and nav menu link click events to open the respective page.
 * @function deactivateListeners
 * @returns {void}
 */
function deactivateListeners() {
  deactivateAllListenersLogin();
  deactivateAllListenersRegister();
  deactivateAllListenersSummary();
  deactivateAllListenersBoard();
  deactivateAllListenersContacts();
  deactivateListenersScript();
}


/**
 * Deactivates event listeners for the header, nav and menu buttons.
 * Listeners are for handling the following events:
 * - Header and nav menu button click events to toggle the menu visibility.
 * - Header and nav menu link click events to open the respective page.
 */
function deactivateListenersScript() {
  headerListenerMenu('remove');
  headerListenerMenuLinks('remove');
  navListenerMenu('remove');
}


/**
 * Activates all event listeners for the header, nav and menu buttons.
 * Listeners are for handling the following events:
 * - Clicking on the header user badge buttons.
 * - Clicking on the menu buttons in the header.
 * - Clicking on the menu buttons in the nav.
 * @function activateListener
 * @returns {void}
 */
function activateListener() {
  headerListenerMenu('add');
  headerListenerMenuLinks('add');
  navListenerMenu('add');
}


/**
 * Adds or removes event listeners for the header user badge buttons.
 * @param {string} action - 'add' or 'remove'.
 */
function headerListenerMenu(action) {
  const headerUserBadge = document.getElementById('headerUserBadge');
  const headerUserBadgeMobile = document.getElementById('headerUserBadgeMobile');

  if (action === 'add') {
    headerUserBadge?.addEventListener('click', headerUserBadgeButton);
    headerUserBadgeMobile?.addEventListener('click', headerUserBadgeMobileButton);
  } else if (action === 'remove') {
    headerUserBadge?.removeEventListener('click', headerUserBadgeButton);
    headerUserBadgeMobile?.removeEventListener('click', headerUserBadgeMobileButton);
  }
}


/**
 * Manages event listeners for the menu buttons in the header.
 * Depending on the action parameter, this function adds or removes
 * event listeners for the click event on the menu buttons.
 * - Adds a listener for the click event on the logout button and calls
 *   the logOut function when the event is triggered.
 * - Adds a listener for the click event on the legal notice button and calls
 *   the headerLegalButton function when the event is triggered.
 * - Adds a listener for the click event on the privacy policy button and calls
 *   the headerPrivacyButton function when the event is triggered.
 * - Removes the listeners for the click event on the menu buttons.
 * @param {string} action - Determines whether to add or remove listeners.
 *                          Use "add" to attach listeners and "remove" to detach them.
 */
function headerListenerMenuLinks(action) {
  const headerLogout = document.getElementById('header-logout');
  const headerLegal = document.getElementById('header-legal');
  const headerPrivacy = document.getElementById('header-privacy');

  if (action === 'add') {
    headerLogout?.addEventListener('click', logOut);
    headerLegal?.addEventListener('click', headerLegalButton);
    headerPrivacy?.addEventListener('click', headerPrivacyButton);
  } else if (action === 'remove') {
    headerLogout?.removeEventListener('click', logOut);
    headerLegal?.removeEventListener('click', headerLegalButton);
    headerPrivacy?.removeEventListener('click', headerPrivacyButton);
  }
}


/**
 * Manages event listeners for the menu buttons in the navigation bar.
 * Depending on the action parameter, this function adds or removes
 * event listeners for the click event on the menu buttons.
 * - Adds a listener for the click event on each menu button and calls
 *   the handleMenuClick function when the event is triggered.
 * - Removes the listeners for the click event on each menu button.
 * @param {string} action - Determines whether to add or remove listeners.
 *                          Use "add" to attach listeners and "remove" to detach them.
 */
function navListenerMenu(action) {
  const menuBtns = document.querySelectorAll('.menuBtn');

  if (action === 'add') {
    menuBtns.forEach(btn => btn.addEventListener('click', handleMenuClick));
  } else if (action === 'remove') {
    menuBtns.forEach(btn => btn.removeEventListener('click', handleMenuClick));
  }
}


/**
 * Handles the click event on the header user badge.
 * - Toggles the visibility of the header menu container.
 * - Activates the outside check for the header menu container.
 * @param {Event} event - The event object of the click event.
 */
function headerUserBadgeButton(event) {
  toggleClass('headerMenuContainer', 'ts0', 'ts1');
  activateOutsideCheck(event, 'headerMenuContainer', 'ts1', 'ts0');
}


/**
 * Handles the click event on the header user badge for mobile devices.
 * - Stops the event propagation to prevent the event from bubbling up.
 * - Toggles the visibility of the header menu container.
 * - Activates the outside check for the header menu container.
 * @param {Event} event - The event object of the click event.
 */
function headerUserBadgeMobileButton(event) {
  event.stopPropagation();
  toggleClass('headerMenuContainer', 'ts0', 'ts1');
  activateOutsideCheck(event, 'headerMenuContainer', 'ts1', 'ts0');
}


/**
 * Activates the tab for the legal notice page.
 * 
 * This function sets the active tab to the one corresponding to the legal notice
 * page by updating the active state of the menu button linked to the imprint.html.
 */
function headerLegalButton() {
  setActiveTab('.menuBtn[href=\'../html/imprint.html\']');
}


/**
 * Activates the tab for the privacy policy page.
 * 
 * This function sets the active tab to the one corresponding to the privacy policy
 * page by updating the active state of the menu button linked to the privacy.html.
 */
function headerPrivacyButton() {
  setActiveTab('.menuBtn[href=\'../html/privacy.html\']');
}


/**
 * Handles a click on one of the menu buttons.
 * Deactivates the outside click check listener and changes the active tab to the one corresponding to the clicked button.
 * @param {MouseEvent} event - The click event.
 */
function handleMenuClick(event) {
  deactivateListeners();
  changeActive(event.target);
}


//NOTE - change global variables functions


/**
 * Toggles the display of the main loader element based on the given status.
 *
 * @param {boolean} status - Whether to show (true) or hide (false) the loader.
 */
export function toggleLoader(status) {
  const loaderElement = document.getElementById('mainLoader');
  if (!loaderElement) return;
  loaderElement.style.display = status ? 'flex' : 'none';
}


/**
 * Sets the global tasks variable to the given array of tasks.
 *
 * @param {Object[]} newTasks - The new array of tasks.
 */
export function setTasks(newTasks) {
  tasks = newTasks;
}


/**
 * Sets the global contacts variable to the given array of contacts.
 *
 * @param {Object[]} newContacts - The new array of contacts.
 */
export function setContacts(newContacts) {
  contacts = newContacts;
}


//NOTE - helper functions


/**
 * Toggles the two given class names on the element with the given id.
 * @param {string} menu - The id of the element to toggle the classes on.
 * @param {string} className1 - The first class name to toggle.
 * @param {string} className2 - The second class name to toggle.
 */
export function toggleClass(menu, className1, className2) {
  let edit = document.getElementById(menu);
  edit.classList.toggle(className1);
  edit.classList.toggle(className2);
}


/**
 * Opens the delete confirmation dialog for a task with the given id.
 * - Toggles the 'deleteResponse' container to the visible state.
 * - Sets the innerHTML of the 'deleteResponse' container to the delete confirmation dialog HTML.
 * @param {string} id - The ID of the task to be deleted.
 */
export function deleteTask(id) {
  toggleClass('deleteResponse', 'ts0', 'ts1');
  document.getElementById('deleteResponse').innerHTML = openDeleteTaskSureHtml(id);
}


/**
 * Deletes a task with the given id.
 * - Toggles the 'deleteResponse' container to the hidden state.
 * - Deactivates the delete response listeners.
 * - Deletes the task from the database.
 * - Updates the global tasks array and saves it to session storage.
 * - Closes the overlay.
 * - Invokes the initDragDrop function.
 * - Invokes the initializeTasksData function.
 * @param {string} taskId - The id of the task to delete.
 */
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


/**
 * Activates a click event listener to check if a click occurred outside a specified modal.
 * - Stops the propagation of the click event on the initial target element.
 * - Defines an event handler to determine if a click is outside the modal and toggles classes if so.
 * - Attaches the event handler to the document to listen for subsequent clicks.
 * @param {Event} event - The initial click event object.
 * @param {string} modalName - The ID of the modal element to check.
 * @param {string} class1 - The first class name to check and toggle.
 * @param {string} class2 - The second class name to toggle.
 */
export function activateOutsideCheck(event, modalName, class1, class2) {
  event.stopPropagation();

  /**
   * Handles the click event to determine if it occurs outside a specified modal.
   * - Invokes the checkOutsideModal function to verify whether the click event target
   *   is outside the modal and to toggle the modal's classes if necessary.
   * 
   * @param {Event} e - The click event object.
   */
  function outsideClickHandler(e) {
    checkOutsideModal(e, modalName, class1, class2, outsideClickHandler);
  }

  document.addEventListener('click', outsideClickHandler);
}


/**
 * Checks if a click event occurred outside the specified modal and toggles its classes if so.
 * - Retrieves the modal element by the provided modal name.
 * - If the modal contains the specified class and the click event target is outside the modal,
 *   it toggles the modal's classes and removes the click event listener.
 * @param {Event} event - The click event object.
 * @param {string} modalName - The ID of the modal element to check.
 * @param {string} class1 - The first class name to check and toggle.
 * @param {string} class2 - The second class name to toggle.
 * @param {Function} handler - The event handler function to remove if the condition is met.
 */
function checkOutsideModal(event, modalName, class1, class2, handler) {
  let modal = document.getElementById(modalName);
  if (modal.classList.contains(class1) && !modal.contains(event.target)) {
    toggleClass(modalName, class1, class2);
    document?.removeEventListener('click', handler);
  };
}
