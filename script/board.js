let currentDraggedElement;
let currentSearchInput = '';
let currentTaskStatus;


/**
 * Initializes the board by performing necessary setup tasks.
 * 
 * This includes initializing the board, pushing data to an array, 
 * updating all task categories, initializing drag and drop functionality,
 * and applying the current search filter. If any error occurs during the 
 * initialization, it is logged to the console.
 * 
 * @async @function
 */
async function initBoard() {
  init();
  try {
    await pushDataToArray();
    updateAllTaskCategories();
    initDragDrop();
    applyCurrentSearchFilter();
  } catch (error) {
    console.error("Initialisation error:", error);
  }
}


/**
 * Pushes data to an array by loading tasks data, creating task arrays, 
 * checking for deleted users, and adding tasks to the global tasks array.
 * 
 * @async @function
 */
async function pushDataToArray() {
  try {
    let tasksData = await loadData("tasks");
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
 * The function `checkDeletedUser` checks if any assigned user in a task has been deleted from the
 * contacts list and updates the task accordingly.
 * @param loadedTask - `loadedTask` is an object representing a task that has been loaded. It may
 * contain information about the task, including the `assignedTo` property which is an array of users
 * assigned to the task.
 * @returns The `loadedTask` object is being returned after checking and updating the `assignedTo`
 * array based on the contacts data.
 */
async function checkDeletedUser(loadedTask) {
  contacts = contacts.length == 0 ? await getContactsData() : contacts;
  if (loadedTask.assignedTo) {
    for (let i = loadedTask.assignedTo.length - 1; i >= 0; i--) {
      let c = loadedTask.assignedTo[i];
      if (contacts.findIndex(cont => cont.id === c.id) === c) {
        loadedTask.assignedTo.splice(i, 1);
        await updateData(`${BASE_URL}tasks/${loadedTask.id}.json`, loadedTask);
      } if (contacts[contacts.findIndex(cont => cont.id === c.id)] !== c) {
        loadedTask.assignedTo[i] = contacts[contacts.findIndex(cont => cont.id === c.id)];
        await updateData(`${BASE_URL}tasks/${loadedTask.id}.json`, loadedTask);
      }
    }
  }
  return loadedTask;
}


/**
 * Updates all task categories by calling updateTaskCategories for each status.
 */
function updateAllTaskCategories() {
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
async function createTaskArray(key, singleTask) {
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
  categoryElement.innerHTML = "";
  if (taskForSection.length > 0) {
    taskForSection.forEach((element) => {
      categoryElement.innerHTML += generateTodoHTML(element);
      if (element.subtasks && element.subtasks.length > 0) {
        updateSubtasksProgressBar(element.subtasks, element.id);
      }
    });
  } else {
    categoryElement.innerHTML = `<div class="noTaskPlaceholder">${noTaskMessage}</div>`;
  }
}


/**
 * Updates the progress bar for the subtasks of a task.
 * 
 * @param {Object[]} subtasks - The list of subtasks.
 * @param {string} taskId - The ID of the task.
 */
function updateSubtasksProgressBar(subtasks, taskId) {
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
function initDragDrop() {
  updateAllTaskCategories();
  dragDrop();
}


/**
 * Sets up drag and drop functionality for task containers.
 */
function dragDrop() {
  document.querySelectorAll(".todoContainer").forEach((todoContainer) => {
    todoContainer.addEventListener("dragstart", (e) => {
      e.target.classList.add("tilted");
      startDragging(e.target.id);
    });
    todoContainer.addEventListener("dragend", (e) => {
      e.target.classList.remove("tilted");
    });
  });
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
 * Allows dropping of elements by preventing the default event behavior.
 * 
 * @param {Event} ev - The dragover event.
 */
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


/**
 * Removes drag-related background highlights from all task drop areas.
 */
function dragLeave() {
  document.querySelectorAll('.taskDragArea').forEach((zone) => {
    zone.classList.remove('highlightedBackground');
  });
}


/**
 * Moves a task to a new status and updates the board accordingly.
 * 
 * @async
 * @param {string} status - The new status of the task.
 */
async function moveTo(status) {
  document.querySelectorAll(".taskDragArea").forEach((zone) => {
    zone.classList.add("highlighted");
  });
  let task = tasks.find((task) => task.id == currentDraggedElement);
  if (task && status != "") {
    task.status = status;
    initDragDrop();
    applyCurrentSearchFilter();
    await updateData(`${BASE_URL}tasks/${task.id}.json`, task);
  }
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
function applyCurrentSearchFilter() {
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
function searchTasks(inputValue) {
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


/**
 * Updates the visibility of the "no tasks found" message based on whether any tasks are visible.
 * 
 * @param {boolean} anyVisibleTask - Whether any tasks are visible.
 */
function updateNoTasksFoundVisibility(anyVisibleTask) {
  const noTasksFound = document.getElementById('noTasksFound');
  if (anyVisibleTask) {
    noTasksFound.classList.add('dNone');
  } else {
    noTasksFound.classList.remove('dNone');
  }
}


/**
 * Checks the screen width and either changes the active tab or opens the add task overlay.
 * 
 * @param {string} category - The task category.
 */
function checkScreenWidth(category) {
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


/**
 * Opens the add task overlay and sets up the necessary content.
 * 
 * @async @function
 */
async function openAddTaskOverlay() {
  let addTaskOverlay = document.getElementById("addTaskOverlay");
  assignedContacts = [];
  addTaskOverlay.innerHTML = await fetchAddTaskTemplate();
  addTaskOverlay.style.display = "block";
}


/**
 * Opens the overlay with the content for the task with the given ID.
 * 
 * @param {string} elementId - The ID of the task to open.
 */
function openOverlay(elementId) {
  let element = tasks.find((task) => task.id === elementId);
  let overlay = document.getElementById("overlay");
  overlay.innerHTML = generateOpenOverlayHTML(element);
  overlay.style.display = "block";
}


/**
 * Closes the modal by hiding the overlay and add task overlay elements.
 */
function closeModal() {
  const overlay = document.getElementById("overlay");
  const addTaskOverlay = document.getElementById("addTaskOverlay");
  if (overlay || addTaskOverlay) {
    overlay.style.display = "none";
    addTaskOverlay.style.display = "none";
  }
  document.body.classList.remove("modalOpen");
}


/**
 * Updates the status of a subtask and updates the corresponding task.
 * 
 * @async
 * @param {string} taskId - The ID of the task.
 * @param {number} subtaskIndex - The index of the subtask to update.
 */
async function updateSubtaskStatus(taskId, subtaskIndex) {
  let task = tasks.find((task) => task.id === taskId);
  if (task) {
    let subtask = task.subtasks[subtaskIndex];
    if (subtask) {
      subtask.status = subtask.status === "checked" ? "unchecked" : "checked";
      let subtaskCheckbox = document.getElementById(`subtaskCheckbox${subtaskIndex}`);
      if (subtaskCheckbox) {
        subtaskCheckbox.src =
          subtask.status === "checked" ? "../assets/icons/checkboxchecked.svg" : "../assets/icons/checkbox.svg";
      }
      updateSubtasksProgressBar(task.subtasks, taskId);
      await updateData(`${BASE_URL}tasks/${taskId}.json`, task);
    }
  }
}


/**
 * Enables editing of a task by populating the edit modal with the task's data.
 * 
 * @param {string} taskId - The ID of the task to edit.
 */
function enableTaskEdit(taskId) {
  let modalContainer = document.getElementById("modalContainer");
  modalContainer.innerHTML = generateTaskEditHTML(taskId);
  let task = tasks.find((task) => task.id === taskId);
  assignedContacts = task.assignedTo ? task.assignedTo : [];
  currentTaskStatus = task.status;
  document.getElementById("editTaskTitle").value = task.title;
  document.getElementById("editTaskDescription").value = task.description;
  document.getElementById("editDateInput").value = task.date;
  updatePrioActiveBtn(task.prio);
  renderAssignedContacts();
}


/**
 * Creates an edited task object from the form inputs and original task data.
 * 
 * @param {string} taskId - The ID of the task to edit.
 * @returns {Object} The edited task object.
 */
function createEditedTask(taskId) {
  let originalTask = tasks.find(task => task.id === taskId);
  if (!originalTask) { return; }
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


/**
 * Helper function to create the edited task object.
 * 
 * @param {Object[]} subtasks - The updated subtasks.
 * @param {Object} originalTask - The original task object.
 * @returns {Object} The edited task object.
 */
function createEditedTaskReturn(subtasks, originalTask) {
  return {
    title: document.getElementById('editTaskTitle').value,
    description: document.getElementById('editTaskDescription').value,
    date: document.getElementById('editDateInput').value,
    prio: currentPrio,
    status: currentTaskStatus,
    subtasks: subtasks,
    assignedTo: assignedContacts ? assignedContacts : [],
    category: originalTask.category,
  };
}


/**
 * Saves the edited task and updates the board accordingly.
 * 
 * @async
 * @param {Event} event - The form submission event.
 * @param {string} taskId - The ID of the task to save.
 */
async function saveEditedTask(event, taskId) {
  event.preventDefault();
  await updateData(`${BASE_URL}tasks/${taskId}.json`, createEditedTask(taskId));
  tasks = [];
  await pushDataToArray();
  openOverlay(taskId);
  updateAllTaskCategories();
  initDragDrop();
  applyCurrentSearchFilter();
}


/**
 * Closes the modal if outside the overlay or add task overlay is clicked.
 * 
 * @param {MouseEvent} event - The mouse click event.
 */
window.onclick = function (event) {
  const overlay = document.getElementById("overlay");
  const addTaskOverlay = document.getElementById("addTaskOverlay");
  if (event.target === overlay || event.target === addTaskOverlay) {
    closeModal();
  }
};


/**
 * Removes the task category from local storage if it exists.
 */
document.addEventListener('DOMContentLoaded', () => {
  const category = localStorage.getItem('taskCategory');
  if (category) {
    localStorage.removeItem('taskCategory');
  }
});
