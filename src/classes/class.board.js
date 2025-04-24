import { Task } from './class.task.js';
import { Subtask } from './class.subtask.js';
import { Contact } from './class.contact.js';
import { BoardHtml } from './html/class.html-board.js';

/**
 * Manages the Kanban board: tasks, overlays, search, and editing.
 */
export class Board {
    //NOTE Properties

    /** @type {any} Reference to the main Kanban instance. */
    kanban;
    /** @type {number|null} ID of the currently dragged task. */
    currentDraggedElement;
    /** @type {string} Current search input. */
    currentSearchInput = '';
    /** @type {string|null} Status of the task being edited. */
    currentTaskStatus;
    /** @type {BoardHtml} Board HTML helper. */
    html;

    /**
     * @param {any} kanban - The main Kanban instance.
     */
    constructor(kanban) {
        this.kanban = kanban;
        this.currentDraggedElement;
        this.currentSearchInput = '';
        this.currentTaskStatus;
        this.html = new BoardHtml(this.kanban);
    }

    //NOTE Overlay & Modal Methods

    /**
     * Navigates or opens overlay based on screen width.
     * @param {string} category
     */
    checkScreenWidth(category) {
        const screenWidth = window.innerWidth;
        const activeTab = document.querySelector('.menuBtn[href="../html/addtask.html"]');
        sessionStorage.setItem('taskCategory', category);
        if (screenWidth < 992) {
            this.kanban.changeActive(activeTab);
            window.location.href = "../html/addtask.html";
        } else this.openAddTaskOverlay();
    }

    /**
     * Opens the Add Task overlay.
     * @async
     */
    async openAddTaskOverlay() {
        let addTaskOverlay = document.getElementById("addTaskOverlay");
        await this.kanban.generateAddTaskInstance(null, addTaskOverlay);
    }

    /**
     * Opens the overlay for a specific task.
     * @async
     * @param {number} taskId
     */
    async openOverlay(taskId) {
        let task = this.kanban.tasks.find((task) => task.id === taskId);
        let overlay = document.getElementById("overlay");
        await this.kanban.generateAddTaskInstance(task, overlay);
        overlay.style.display = "block";
    }

    /**
     * Closes open modals and overlays.
     */
    closeModal = () => {
        const overlay = document.getElementById("overlay");
        const addTaskOverlay = document.getElementById("addTaskOverlay");
        this.kanban.closeAddTaskInstance();
        if (overlay || addTaskOverlay) {
            overlay.style.display = "none";
            addTaskOverlay.style.display = "none";
        }
        document.body.classList.remove("modalOpen");
    };

    //NOTE Board Initialization

    /**
     * Initializes the board.
     * @async
     */
    async initBoard() {
        const loader = document.querySelector('.loader');
        try {
            loader?.classList.toggle('dNone');
            await this.initializeTasksData();
            this.kanban.activateListenersBoard('dragDrop');
            this.applyCurrentSearchFilter();
        } catch (error) {
            console.error("Initialization error:", error);
        } finally {
            loader?.classList.toggle('dNone');
        }
    }

    /**
     * Loads and processes tasks.
     * @async
     */
    async initializeTasksData() {
        if (this.kanban.tasks.length === 0) await this.kanban.db.getTasksData();
        await this.checkDataOfArray();
    }

    /**
     * Converts and checks all tasks.
     * @async
     */
    async checkDataOfArray() {
        const updatedTasksArray = [];
        try {
            for (let task of this.kanban.tasks) {
                task = this._taskToClass(task);
                task = await this.checkDeletedUser(task);
                updatedTasksArray.push(task);
            }
            this.kanban.setTasks(updatedTasksArray);
        } catch (error) {
            console.error("Error pushing tasks to array:", error);
        }
    }

    /**
     * Converts a task to class instances.
     * @private
     * @param {object|Task} task
     * @returns {Task}
     */
    _taskToClass(task) {
        if (!(task instanceof Task)) {
            task = new Task(task);
        }
        if (task.subtasks) {
            task.subtasks = task.subtasks.map(subtask => new Subtask(subtask));
        }
        if (task.assignedTo) {
            task.assignedTo = task.assignedTo.map(contact => new Contact(contact));
        }
        return task;
    }

    /**
     * Checks assigned contacts and updates if needed.
     * @async
     * @param {Task} loadedTask
     * @returns {Promise<Task>}
     */
    async checkDeletedUser(loadedTask) {
        let uploadNeeded = false;
        if (!loadedTask.assignedTo) return loadedTask;
        if (this.kanban.contacts.length === 0) await this.kanban.db.getContactsData();

        const result = this._isContactChanged(loadedTask, uploadNeeded);
        loadedTask = result.loadedTask;
        uploadNeeded = result.uploadNeeded;

        if (uploadNeeded) {
            await this.kanban.db.update(`api/tasks/${loadedTask.id}/`, loadedTask.toTaskUploadObject());
        }
        return loadedTask;
    }

    /**
     * Checks if assigned contacts changed.
     * @private
     * @param {Task} loadedTask
     * @param {boolean} uploadNeeded
     * @returns {{loadedTask: Task, uploadNeeded: boolean}}
     */
    _isContactChanged(loadedTask, uploadNeeded) {
        loadedTask.assignedTo = loadedTask.assignedTo.map(assignedContact => {
            const contact = this.kanban.contacts.find(c => c.id === assignedContact.id);
            if (!contact) {
                uploadNeeded = true;
                return null;
            } else if (this._isPersonalInfoChanged(assignedContact, contact)) {
                uploadNeeded = true;
                return contact;
            }
            return assignedContact;
        }).filter(Boolean);

        return { loadedTask, uploadNeeded };
    }

    /**
     * Checks if contact info differs.
     * @private
     * @param {Contact} assignedContact
     * @param {Contact} contact
     * @returns {boolean}
     */
    _isPersonalInfoChanged(assignedContact, contact) {
        return (
            contact.name !== assignedContact.name ||
            contact.email !== assignedContact.email ||
            contact.phone !== assignedContact.phone ||
            contact.profilePic !== assignedContact.profilePic ||
            contact.firstLetters !== assignedContact.firstLetters
        );
    }

    /**
     * Updates all board columns.
     */
    updateAllTaskCategories() {
        this.updateTaskCategories("toDo", "toDo", "No tasks to do");
        this.updateTaskCategories("inProgress", "inProgress", "No tasks in progress");
        this.updateTaskCategories("awaitFeedback", "awaitFeedback", "No tasks await feedback");
        this.updateTaskCategories("done", "done", "No tasks done");
    }

    //NOTE Subtask Methods

    /**
     * Deletes a task and updates board.
     * @async
     * @param {number} taskId
     */
    async deleteTaskSure(taskId) {
        this.kanban.toggleClass('deleteResponse', 'ts0', 'ts1');
        await this.kanban.db.delete(`api/tasks/${taskId}/`);
        let newTasksArray = this.kanban.tasks.filter(task => task.id !== taskId);
        this.kanban.setTasks(newTasksArray);
        this.closeModal();
        this.initializeTasksData();
        this.kanban.activateListenersBoard('dragDrop');
    }

    /**
     * Updates a board column.
     * @param {string} status
     * @param {string} categoryId
     * @param {string} noTaskMessage
     */
    updateTaskCategories(status, categoryId, noTaskMessage) {
        let taskForSection = this.kanban.tasks.filter((task) => task.status === status);
        let categoryElement = this._getCategoryElement(categoryId);
        if (!categoryElement) return;
        categoryElement.innerHTML = "";
        if (taskForSection.length > 0) {
            taskForSection.forEach((task) => {
                categoryElement.innerHTML += task.html.generateTodoHTML();
                if (task.subtasks && task.subtasks.length > 0) {
                    this.updateSubtaskProgressBar(task.subtasks, task.id);
                }
            });
        } else {
            if (categoryElement) categoryElement.innerHTML = `<div class="noTaskPlaceholder">${noTaskMessage}</div>`;
        }
    }

    /**
     * Updates the subtask progress bar.
     * @param {Subtask[]} subtasks
     * @param {number} taskId
     */
    updateSubtaskProgressBar(subtasks, taskId) {
        const checkedSubtaskCount = subtasks.filter((subtask) => subtask.status === "checked").length;
        const percentComplete = Math.round((checkedSubtaskCount / subtasks.length) * 100);
        const progressBar = this._getProgressBar(taskId);
        progressBar.style.width = `${percentComplete}%`;
        const progressBarText = this._getProgressBarText(taskId);
        progressBarText.innerHTML = `${checkedSubtaskCount}/${subtasks.length} Subtasks`;
    }

    /**
     * Updates a subtask's status and persists it.
     * @async
     * @param {number} taskId
     * @param {number} subtaskIndex
     */
    updateSubtaskStatus = async (taskId, subtaskIndex) => {
        let task = this._findTaskById(taskId);
        if (task) {
            let subtask = task.subtasks[subtaskIndex];
            if (subtask) {
                subtask.updateSubtaskStatus(subtaskIndex);
                this.updateSubtaskProgressBar(task.subtasks, taskId);
                await this.kanban.db.patch(`api/tasks/${taskId}/`, { subtasks: task.subtasks.map(sub => sub.toSubtaskUploadObject()) });
                this.kanban.setTasks(this.kanban.tasks);
            }
        }
    };

    //NOTE Search Methods

    /**
     * Applies the current search filter.
     */
    applyCurrentSearchFilter() {
        if (this.currentSearchInput) this.searchTasks(this.currentSearchInput);
    }

    /**
     * Filters tasks by search input.
     * @param {string} inputValue
     */
    searchTasks(inputValue) {
        this.emptyDragAreasWhileSearching(inputValue);
        this.currentSearchInput = inputValue.toLowerCase();
        const taskCards = document.querySelectorAll(".todoContainer");
        let anyVisibleTask = this.searchTasksInCards(taskCards);
        this.updateNoTasksFoundVisibility(anyVisibleTask);
    }

    /**
     * Shows/hides task cards based on search.
     * @param {NodeListOf<Element>} taskCards
     * @returns {boolean}
     */
    searchTasksInCards(taskCards) {
        let anyVisibleTask = false;
        for (const taskCard of taskCards) {
            const title = taskCard.querySelector(".toDoHeader")?.textContent.trim().toLowerCase() || "";
            const description = taskCard.querySelector(".toDoDescription")?.textContent.trim().toLowerCase() || "";
            const isVisible = title.includes(this.currentSearchInput) || description.includes(this.currentSearchInput);
            taskCard.style.display = isVisible ? "block" : "none";
            if (isVisible) anyVisibleTask = true;
        }
        return anyVisibleTask;
    }

    /**
     * Hides/shows placeholders based on search.
     */
    emptyDragAreasWhileSearching() {
        const dragAreas = document.querySelectorAll(".noTaskPlaceholder");
        if (this.currentSearchInput === '') {
            dragAreas.forEach((dragArea) => dragArea.classList.remove("dNone"));
        } else {
            dragAreas.forEach((dragArea) => dragArea.classList.add("dNone"));
        }
    }

    /**
     * Shows/hides the "no tasks found" message.
     * @param {boolean} anyVisibleTask
     */
    updateNoTasksFoundVisibility(anyVisibleTask) {
        const noTasksFound = document.getElementById('noTasksFound');
        if (anyVisibleTask) noTasksFound.classList.add('dNone');
        else noTasksFound.classList.remove('dNone');
    }

    /**
     * Moves a dragged task to a new status and persists it.
     * @async
     * @param {string} newStatus
     */
    async moveTo(newStatus) {
        document.querySelectorAll(".taskDragArea").forEach((area) => {
            area.classList.add("highlighted");
        });

        const taskToMove = this._findTaskById(this.currentDraggedElement);
        if (taskToMove && newStatus && taskToMove.moveTo(newStatus)) {
            await this.kanban.db.patch(`api/tasks/${taskToMove.id}/`, { 'status': taskToMove.status });
            this.kanban.setTasks(this.kanban.tasks);
            this.kanban.activateListenersBoard('dragDrop');
            this.applyCurrentSearchFilter();
        }
    }

    /**
     * Prepares and displays the edit form for a task.
     * @param {number} taskId
     */
    enableTaskEdit(taskId) {
        let modalContainer = document.getElementById("modalContainer");
        let task = this._findTaskById(taskId);
        !task.assignedTo ? this.kanban.addTask.setAssignedContacts([]) : this.kanban.addTask.setAssignedContacts(task.assignedTo);
        modalContainer.innerHTML = task.html.generateTaskEditHTML();
        this.currentTaskStatus = task.status;
        document.getElementById("editTaskTitle").value = task.title;
        document.getElementById("editTaskDescription").value = task.description;
        document.getElementById("editDateInput").value = task.date;
        this.kanban.addTask.updatePrioActiveBtn(task.prio);
        this.kanban.addTask.renderAssignedContacts();
        this.kanban.activateListenersBoard('editTask');
    }

    /**
     * @private
     * @param {NodeListOf<HTMLLIElement>} liElements
     * @param {Subtask[]} originalSubtasks
     * @returns {Subtask[]}
     */
    _processEditedSubtasks(liElements, originalSubtasks = []) {
        const newSubtasks = [];
        liElements.forEach((liElement) => {
            const subtaskTextElement = liElement.querySelector('.subtaskItemText');
            const currentText = subtaskTextElement ? subtaskTextElement.innerText.trim() : '';
            if (currentText) {
                const originalSubtask = originalSubtasks.find(sub => sub.text === currentText);
                const status = originalSubtask ? originalSubtask.status : 'unchecked';
                newSubtasks.push(new Subtask({ text: currentText, status: status }));
            }
        });
        return newSubtasks;
    }

    /**
     * @private
     * @returns {object}
     */
    _getEditedTaskFormData() {
        const title = document.getElementById('editTaskTitle')?.value || '';
        const description = document.getElementById('editTaskDescription')?.value || '';
        const date = document.getElementById('editDateInput')?.value || '';
        const prio = this.kanban.addTask.currentPrio;
        const assignedContacts = this.kanban.addTask.assignedContacts;
        const status = this.currentTaskStatus;
        return { title, description, date, prio, status, assignedContacts };
    }

    /**
     * @param {number} taskId
     * @returns {object|null}
     */
    createEditedTask(taskId) {
        const originalTask = this._findTaskById(taskId);
        const subtaskLiElements = document.querySelectorAll('#subtaskList > li.subtaskEditList');
        const newSubtasks = this._processEditedSubtasks(subtaskLiElements, originalTask.subtasks);
        const formData = this._getEditedTaskFormData();
        return this._newTaskObject(taskId, formData, originalTask, newSubtasks);
    }

    /**
     * @private
     * @param {number} taskId
     * @param {object} formData
     * @param {Task} originalTask
     * @param {Subtask[]} newSubtasks
     * @returns {object}
     */
    _newTaskObject(taskId, formData, originalTask, newSubtasks) {
        return {
            id: taskId,
            title: formData.title,
            description: formData.description,
            date: formData.date,
            prio: formData.prio,
            status: formData.status,
            subtasks: newSubtasks.map(sub => sub.toSubtaskUploadObject()),
            assignedTo: formData.assignedContacts.map(contact => contact.toContactUploadObject()),
            category: originalTask.category,
        };
    }

    /**
     * Saves the edited task.
     * @async
     * @param {number} taskId
     */
    async saveEditedTask(taskId) {
        const editedTaskData = this.createEditedTask(taskId);
        if (!editedTaskData) return;
        const task = new Task(editedTaskData);
        await this.kanban.db.update(`api/tasks/${taskId}/`, task.toTaskUploadObject());
        const taskIndex = this.kanban.tasks.findIndex((t) => t.id === taskId);
        this.kanban.tasks.splice(taskIndex, 1, task);
        this.kanban.setTasks(this.kanban.tasks);
        this.openOverlay(taskId);
        this.kanban.activateListenersBoard('dragDrop');
        this.applyCurrentSearchFilter();
    }

    //NOTE - Error Handling

    /**
     * Logs an error message.
     * @param {string} msg
     * @returns {void}
     */
    _logError(msg) { console.error(msg); }

    //NOTE - Data Helpers

    /**
     * Finds a task by ID.
     * @param {number} taskId
     * @returns {Task|null}
     */
    _findTaskById(taskId) {
        return this.kanban.tasks.find(task => task.id === taskId) || null;
    }

    /**
     * Finds a category element by ID.
     * @param {string} categoryId
     * @returns {HTMLElement|null}
     */
    _getCategoryElement(categoryId) {
        return document.getElementById(categoryId);
    }

    /**
     * Finds a progress bar by task ID.
     * @param {number} taskId
     * @returns {HTMLElement|null}
     */
    _getProgressBar(taskId) {
        return document.getElementById(`subtasksProgressbarProgress${taskId}`);
    }

    /**
     * Finds a progress bar text by task ID.
     * @param {number} taskId
     * @returns {HTMLElement|null}
     */
    _getProgressBarText(taskId) {
        return document.getElementById(`subtasksProgressbarText${taskId}`);
    }
};