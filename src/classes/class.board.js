class Board {
    constructor(kanban) {
        this.kanban = kanban;
        this.currentDraggedElement;
        this.currentSearchInput = '';
        this.currentTaskStatus;
    }

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


    openOverlay(elementId) {
        let element = tasks.find((task) => task.id === elementId);
        let overlay = document.getElementById("overlay");
        setAssignedContacts([]);
        overlay.innerHTML = generateOpenOverlayHTML(element);
        activateOverlayListeners(elementId);
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





    //NOTE - Board Initialisation


    async initBoard() {
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


    async initializeTasksData() {
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


    async pushDataToArray() {
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


    async checkDeletedUser(loadedTask) {
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


    async checkContactChange(task, maxId) {
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


    hasContactChanged(assignedContact) {
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


    updateAllTaskCategories() {
        updateTaskCategories("toDo", "toDo", "No tasks to do");
        updateTaskCategories("inProgress", "inProgress", "No tasks in progress");
        updateTaskCategories("awaitFeedback", "awaitFeedback", "No tasks await feedback");
        updateTaskCategories("done", "done", "No tasks done");
    }





    //NOTE - Subtask functions


    updateTaskCategories(status, categoryId, noTaskMessage) {
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


    //NOTE - Drag and Drop functions





    //NOTE - Search functions


    applyCurrentSearchFilter() {
        if (currentSearchInput) searchTasks(currentSearchInput);
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

}