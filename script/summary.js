import { currentUser, fetchDataFromDatabase, toggleLoader } from "../script.js";
import { objectTemplateNumberOfBoard, greetingMobileHTML } from "./miscTemplate.js";


//NOTE - global summary variables


let numberOfBoard = [];
let urgentTasks = [];
let counts = {
  toDo: 0,
  inProgress: 0,
  awaitFeedback: 0,
  done: 0
};


//NOTE - initialise summary function


export async function initSummary() {
  displayGreeting();
  await loadCategory();
  taskAssignment();
  displayUrgentTasks();
  activateListener();
}


//NOTE - greeting functions


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


/**
 * Returns a greeting based on the current time of day.
 * @returns {string} A greeting message that is "Good morning,"
 *                  "Good afternoon,", or "Good evening,".
 */
function getGreeting() {
  const currentTime = new Date().getHours();
  if (currentTime < 12) return "Good morning,";
  else if (currentTime < 18) return "Good afternoon,";
  else return "Good evening,";
}


/**
 * Animates the greeting on the summary page. When the user's screen width is
 * less than 1199.8px, the greeting is displayed on top of the main element.
 * When the user's screen width is 1199.8px or more, the greeting is displayed
 * on the side of the main element. The greeting is hidden after 1.9 seconds.
 * @param {HTMLElement} mobileElement - The mobile greeting element.
 * @param {HTMLElement} mainElement - The main element of the summary page.
 */
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


/**
 * Updates the desktop greeting with the current time and user name.
 * @param {string} time - The time-based greeting (e.g., "Good morning").
 * @param {string} name - The name of the person being greeted.
 */
function updateGreetingDesktop(time, name) {
  let greetingDesktop = document.getElementById('greetingSumm');
  let greetingNameDesktop = document.getElementById('greetingNameDesktop');
  greetingDesktop.innerText = time;
  greetingNameDesktop.innerText = name;
}


//NOTE - task count functions


/**
 * Loads the number of tasks in each category and the tasks with urgent priority.
 * - Retrieves the tasks data from the database.
 * - Iterates over the tasks data and for each task, pushes the category and task
 *   id to the numberOfBoard array and if the task has urgent priority, pushes the
 *   task to the urgentTasks array.
 * @returns {Promise<void>}
 */
async function loadCategory() {
  let tasksData = await fetchDataFromDatabase("tasks");
  for (const key in tasksData) {
    const task = tasksData[key];
    if (!task) continue;
    numberOfBoard.push(objectTemplateNumberOfBoard(key, task));
    if (task.prio === 'urgent') {
      urgentTasks.push(task);
    }
  }
}


/**
 * Updates the task counts in the summary page.
 * Retrieves the number of tasks by their status and updates the corresponding elements with the counts.
 */
function taskAssignment() {
  countTasksByStatus();
  updateElement('howManyTodos', counts.toDo);
  updateElement('howManyInProgress', counts.inProgress);
  updateElement('howManyAwaitFeedback', counts.awaitFeedback);
  updateElement('howManyDone', counts.done);
  updateElement('howManyTaskInBoard', numberOfBoard.length);
}


/**
 * Counts the number of tasks in each status category.
 * - Uses the reduce() method on the numberOfBoard array to create an object
 *   with the task status as keys and the count of tasks in that status as values.
 * - Initialises the counts object with default values of 0 for each status.
 * @returns {object} An object with the counts of tasks in each status category.
 */
function countTasksByStatus() {
  counts = numberOfBoard.reduce((taskCounts, task) => {
    taskCounts[task.status] = (taskCounts[task.status] || 0) + 1;
    return taskCounts;
  }, { toDo: 0, inProgress: 0, awaitFeedback: 0, done: 0 });
}


/**
 * Updates the content of an HTML element with the given ID with the given new value.
 * @param {string} elementId - The ID of the HTML element to update.
 * @param {string | number} newValue - The new value to set the element's innerHTML to.
 */
function updateElement(elementId, newValue) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = newValue;
  }
}


/**
 * Updates the UI with the count and date of urgent tasks.
 * - Retrieves the list of urgent tasks and calculates their count.
 * - Determines the date of the first urgent task, formatted as a German locale string.
 * - Updates the UI elements with the number of urgent tasks and the formatted date.
 */
function displayUrgentTasks() {
  const urgentTaskList = urgentTasks ?? [];
  const urgentTaskCount = urgentTaskList.length;
  const urgentTaskDate = urgentTaskCount > 0
    ? new Date(urgentTaskList[0].date).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : '';

  updateElement('howManyUrgent', urgentTaskCount);
  updateElement('summUrgentDate', urgentTaskDate);
}


//NOTE - Listeners summary functions


/**
 * Activates event listeners for the summary page.
 * - Attaches a click event listener to all elements with the class 'summ-info-field'
 *   to navigate to the next page.
 */
function activateListener() {
  document.querySelectorAll('.summ-info-field').forEach(btn => {
    btn.addEventListener('click', nextPage);
  });
}


/**
 * Deactivates all event listeners for the summary page.
 * - Removes the click event listener from elements with the class 'summ-info-field'
 *   to prevent navigating to the next page.
 */
export function deactivateAllListenersSummary() {
  document.querySelectorAll('.summ-info-field').forEach(btn => {
    btn.removeEventListener('click', nextPage);
  });
}


/**
 * Navigate to the board page and update the active tab in session storage.
 */
function nextPage() {
  sessionStorage.setItem('activeTab', 'board');
  window.location.href = 'board.html';
}