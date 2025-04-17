import { Task } from './class.task.js';
import { Subtask } from './class.subtask.js';
import { Contact } from './class.contact.js';

export class Board {
    //NOTE Properties

    kanban;
    currentDraggedElement;
    currentSearchInput = '';
    currentTaskStatus;

    constructor(kanban) {
        this.kanban = kanban;
        this.currentDraggedElement;
        this.currentSearchInput = '';
        this.currentTaskStatus;
    }

    //NOTE Overlay & Modal Methods

    handleOverlayOutsideClick = (event) => {
        const overlay = document.getElementById("overlay");
        const addTaskOverlay = document.getElementById("addTaskOverlay");
        if (event.target === overlay || event.target === addTaskOverlay) {
            closeModal();
            deactivateOverlayListeners();
            deactivateAllAddTaskListeners();
        }
    };

    checkScreenWidth(category) {
        const screenWidth = window.innerWidth;
        const activeTab = document.querySelector('.menuBtn[href="../html/addtask.html"]');
        sessionStorage.setItem('taskCategory', category);
        if (screenWidth < 992) {
            changeActive(activeTab);
            window.location.href = "../html/addtask.html";
        } else openAddTaskOverlay();
    }

    async openAddTaskOverlay() {
        let addTaskOverlay = document.getElementById("addTaskOverlay");
        setAssignedContacts([]);
        addTaskOverlay.innerHTML = await fetchAddTaskTemplate();
        addTaskOverlay.style.display = "block";
        activateAddTaskListeners();
    }

    openOverlay(taskId) {
        let task = this.kanban.tasks.find((task) => task.id === taskId);
        let overlay = document.getElementById("overlay");
        this.kanban.generateAddTaskInstance(task, overlay);
        console.log(this.kanban);
        // setAssignedContacts([]);
        // overlay.innerHTML = generateOpenOverlayHTML();
        // activateOverlayListeners();
        overlay.style.display = "block";
    }

    closeModal = () => {
        const overlay = document.getElementById("overlay");
        const addTaskOverlay = document.getElementById("addTaskOverlay");
        deactivateOverlayListeners();
        if (overlay || addTaskOverlay) {
            overlay.style.display = "none";
            addTaskOverlay.style.display = "none";
        }
        document.body.classList.remove("modalOpen");
    };

    //NOTE Board Initialization

    async initBoard() {
        try {
            await this.initializeTasksData();
            this.kanban.activateListenersBoard('dragDrop');
            this.applyCurrentSearchFilter();
        } catch (error) {
            console.error("Initialization error:", error);
        }
    }

    async initializeTasksData() {
        const loader = document.querySelector('.loader');
        loader?.classList.toggle('dNone');
        if (this.kanban.tasks.length === 0) await this.kanban.db.getTasksData();
        await this.checkDataOfArray();
        loader?.classList.toggle('dNone');
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
        if (this, this.kanban.contacts.length === 0) await this.kanban.db.getContactsData();
        if (!loadedTask.assignedTo) return loadedTask;

        loadedTask.assignedTo = loadedTask.assignedTo.map(assignedContact => {
            const contact = this.kanban.contacts.find(c => c.id === assignedContact.id);
            if (!contact) return null;
            if (
                contact.name !== assignedContact.name ||
                contact.email !== assignedContact.email ||
                contact.phone !== assignedContact.phone ||
                contact.profilePic !== assignedContact.profilePic ||
                contact.firstLetters !== assignedContact.firstLetters
            ) {
                return contact;
            }
            return assignedContact;
        })
            .filter(Boolean);

        await this.kanban.db.update(`api/tasks/${loadedTask.id}/`, loadedTask.toTaskUploadObject());
        return loadedTask;
    }

    updateAllTaskCategories() {
        this.updateTaskCategories("toDo", "toDo", "No tasks to do");
        this.updateTaskCategories("inProgress", "inProgress", "No tasks in progress");
        this.updateTaskCategories("awaitFeedback", "awaitFeedback", "No tasks await feedback");
        this.updateTaskCategories("done", "done", "No tasks done");
    }

    //NOTE Subtask Methods

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

    //NOTE Drag and Drop Methods
    // Drag and Drop methods would be here

    //NOTE Search Methods

    applyCurrentSearchFilter() {
        if (this.currentSearchInput) this.searchTasks(this.currentSearchInput);
    }

    searchTasks(inputValue) {
        emptyDragAreasWhileSearching(inputValue);
        currentSearchInput = inputValue.toLowerCase();
        const taskCards = document.querySelectorAll(".todoContainer");
        let anyVisibleTask = searchTasksInCards(taskCards, currentSearchInput);
        updateNoTasksFoundVisibility(anyVisibleTask);
    }

    searchTasksInCards(taskCards, searchInput) {
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

    emptyDragAreasWhileSearching(searchInput) {
        const dragAreas = document.querySelectorAll(".noTaskPlaceholder");

        if (searchInput === '') {
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

    //FIXME: Doppelte oder nicht benötigte Methoden ggf. hier ans Ende verschieben
    // Additional methods to be reviewed and moved here if necessary
}