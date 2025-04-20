import { Task } from './class.task.js';
import { Subtask } from './class.subtask.js';
import { Contact } from './class.contact.js';
import { BoardHtml } from './html/class.html-board.js';

export class Board {
    //NOTE Properties

    kanban;
    currentDraggedElement;
    currentSearchInput = '';
    currentTaskStatus;
    html;

    constructor(kanban) {
        this.kanban = kanban;
        this.currentDraggedElement;
        this.currentSearchInput = '';
        this.currentTaskStatus;

        this.html = new BoardHtml(this.kanban);
    }

    //NOTE Overlay & Modal Methods

    checkScreenWidth(category) {
        const screenWidth = window.innerWidth;
        const activeTab = document.querySelector('.menuBtn[href="../html/addtask.html"]');
        sessionStorage.setItem('taskCategory', category);
        if (screenWidth < 992) {
            this.kanban.changeActive(activeTab);
            window.location.href = "../html/addtask.html";
        } else this.openAddTaskOverlay();
    }

    async openAddTaskOverlay() {
        let addTaskOverlay = document.getElementById("addTaskOverlay");
        await this.kanban.generateAddTaskInstance(null, addTaskOverlay);
    }

    async openOverlay(taskId) {
        let task = this.kanban.tasks.find((task) => task.id === taskId);
        let overlay = document.getElementById("overlay");
        await this.kanban.generateAddTaskInstance(task, overlay);
        overlay.style.display = "block";
    }

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

    async initializeTasksData() {
        if (this.kanban.tasks.length === 0) await this.kanban.db.getTasksData();
        await this.checkDataOfArray();
    }

    async checkDataOfArray() {
        const updatedTasksArray = [];
        try {
            for (let task of this.kanban.tasks) {
                if (!(task instanceof Task)) {
                    task = new Task(task);
                }
                if (task.subtasks) {
                    task.subtasks = task.subtasks.map(subtask => new Subtask(subtask));
                }
                if (task.assignedTo) {
                    task.assignedTo = task.assignedTo.map(contact => new Contact(contact));
                }
                task = await this.checkDeletedUser(task);
                updatedTasksArray.push(task);
            }
            this.kanban.setTasks(updatedTasksArray);
        } catch (error) {
            console.error("Error pushing tasks to array:", error);
        }
    }

    async checkDeletedUser(loadedTask) {
        let uploadNeeded = false;
        if (!loadedTask.assignedTo) return loadedTask;
        if (this.kanban.contacts.length === 0) await this.kanban.db.getContactsData();

        loadedTask.assignedTo = loadedTask.assignedTo.map(assignedContact => {
            const contact = this.kanban.contacts.find(c => c.id === assignedContact.id);
            if (!contact) {
                uploadNeeded = true;
                return null;
            } else if (
                contact.name !== assignedContact.name ||
                contact.email !== assignedContact.email ||
                contact.phone !== assignedContact.phone ||
                contact.profilePic !== assignedContact.profilePic ||
                contact.firstLetters !== assignedContact.firstLetters
            ) {
                uploadNeeded = true;
                return contact;
            }
            return assignedContact;
        })
            .filter(Boolean);

        if (uploadNeeded) {
            await this.kanban.db.update(`api/tasks/${loadedTask.id}/`, loadedTask.toTaskUploadObject());
        }
        return loadedTask;
    }

    updateAllTaskCategories() {
        this.updateTaskCategories("toDo", "toDo", "No tasks to do");
        this.updateTaskCategories("inProgress", "inProgress", "No tasks in progress");
        this.updateTaskCategories("awaitFeedback", "awaitFeedback", "No tasks await feedback");
        this.updateTaskCategories("done", "done", "No tasks done");
    }

    //NOTE Subtask Methods

    async deleteTaskSure(taskId) {
        this.kanban.toggleClass('deleteResponse', 'ts0', 'ts1');

        await this.kanban.db.delete(`api/tasks/${taskId}/`);
        let newTasksArray = this.kanban.tasks.filter(task => task.id !== taskId);
        this.kanban.setTasks(newTasksArray);

        this.closeModal();
        this.initializeTasksData();
        this.kanban.activateListenersBoard('dragDrop');
    }

    updateTaskCategories(status, categoryId, noTaskMessage) {
        let taskForSection = this.kanban.tasks.filter((task) => task.status === status);
        let categoryElement = document.getElementById(categoryId);
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

    updateSubtaskProgressBar(subtasks, taskId) {
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

    updateSubtaskStatus = async (taskId, subtaskIndex) => {
        let task = this.kanban.tasks.find((task) => task.id === taskId);
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

    applyCurrentSearchFilter() {
        if (this.currentSearchInput) this.searchTasks(this.currentSearchInput);
    }

    searchTasks(inputValue) {
        this.emptyDragAreasWhileSearching(inputValue);
        this.currentSearchInput = inputValue.toLowerCase();
        const taskCards = document.querySelectorAll(".todoContainer");
        let anyVisibleTask = this.searchTasksInCards(taskCards);
        this.updateNoTasksFoundVisibility(anyVisibleTask);
    }

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

    emptyDragAreasWhileSearching() {
        const dragAreas = document.querySelectorAll(".noTaskPlaceholder");

        if (this.currentSearchInput === '') {
            dragAreas.forEach((dragArea) => dragArea.classList.remove("dNone"));
        } else {
            dragAreas.forEach((dragArea) => dragArea.classList.add("dNone"));
        }
    }

    updateNoTasksFoundVisibility(anyVisibleTask) {
        const noTasksFound = document.getElementById('noTasksFound');
        if (anyVisibleTask) noTasksFound.classList.add('dNone');
        else noTasksFound.classList.remove('dNone');
    }

    async moveTo(newStatus) {
        document.querySelectorAll(".taskDragArea").forEach((area) => {
            area.classList.add("highlighted");
        });

        const taskToMove = this.kanban.tasks.find(task => task.id === this.currentDraggedElement);
        if (taskToMove && newStatus && taskToMove.moveTo(newStatus)) {
            await this.kanban.db.patch(`api/tasks/${taskToMove.id}/`, { 'status': taskToMove.status });
            this.kanban.setTasks(this.kanban.tasks);
            this.kanban.activateListenersBoard('dragDrop');
            this.applyCurrentSearchFilter();
        }
    }

    enableTaskEdit(taskId) {
        let modalContainer = document.getElementById("modalContainer");
        let task = this.kanban.tasks.find((task) => task.id === taskId);
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


    createEditedTask(taskId) {
        let originalTask = this.kanban.tasks.find(task => task.id === taskId);
        if (!originalTask) {
            console.error("Original task not found for editing:", taskId);
            return null;
        }

        let newSubtasks = [];
        const subtaskLiElements = document.querySelectorAll('#subtaskList > li.subtaskEditList');
        const currentPrio = this.kanban.addTask.currentPrio;
        const currentTaskStatus = this.currentTaskStatus;
        const assignedContacts = this.kanban.addTask.assignedContacts;

        subtaskLiElements.forEach((liElement) => {
            const subtaskTextElement = liElement.querySelector('.subtaskItemText');
            const currentText = subtaskTextElement ? subtaskTextElement.innerText.trim() : '';
            const originalIndexStr = liElement.dataset.index;
            let status = 'unchecked';

            const originalSubtask = originalTask.subtasks?.find(sub => sub.text === currentText);

            if (originalSubtask) {
                status = originalSubtask.status;
            } else if (originalIndexStr !== undefined) {
                const originalIndex = parseInt(originalIndexStr);
                if (!isNaN(originalIndex) && originalTask.subtasks && originalTask.subtasks[originalIndex]) {
                    if (originalTask.subtasks[originalIndex].text === currentText) {
                        status = originalTask.subtasks[originalIndex].status;
                    }
                }
            }

            if (currentText) {
                newSubtasks.push(new Subtask({ text: currentText, status: status }));
            }
        });

        return {
            id: taskId,
            title: document.getElementById('editTaskTitle').value,
            description: document.getElementById('editTaskDescription').value,
            date: document.getElementById('editDateInput').value,
            prio: currentPrio,
            status: currentTaskStatus,
            subtasks: newSubtasks.map(sub => sub.toSubtaskUploadObject()),
            assignedTo: assignedContacts.map(contact => contact.toContactUploadObject()),
            category: originalTask.category,
        };

    }

    async saveEditedTask(taskId) {
        const task = new Task(this.createEditedTask(taskId));
        await this.kanban.db.update(`api/tasks/${taskId}/`, task.toTaskUploadObject());
        const taskIndex = this.kanban.tasks.findIndex((t) => t.id === taskId);
        this.kanban.tasks.splice(taskIndex, 1, task);
        this.kanban.setTasks(this.kanban.tasks);
        this.openOverlay(taskId);
        this.kanban.activateListenersBoard('dragDrop');
        this.applyCurrentSearchFilter();
    }

    //FIXME: Doppelte oder nicht benötigte Methoden ggf. hier ans Ende verschieben
    // Additional methods to be reviewed and moved here if necessary
};