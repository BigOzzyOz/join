class Task {
    constructor(data) {

    }

    createNewTask() {
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

    //NOTE - priority functions


    updatePrioActiveBtn(prio) {
        const buttons = document.querySelectorAll('.prioBtn');
        buttons.forEach(button => {
            button.classList.remove('prioBtnUrgentActive', 'prioBtnMediumActive', 'prioBtnLowActive');
            const imgs = button.querySelectorAll('img');
            imgs.forEach(img => { img.classList.add('hidden'); });
        });
        changeActiveBtn(prio);
    }


    changeActiveBtn(prio) {
        const activeButton = document.querySelector(`.prioBtn[data-prio="${prio}"]`);
        if (activeButton) {
            activeButton.classList.add(`prioBtn${capitalize(prio)}Active`);
            const whiteIcon = activeButton.querySelector(`.prio${prio}smallWhite`);
            if (whiteIcon) {
                whiteIcon.classList.remove('hidden');
            }
        }
    }


    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }


    setPrio(element) {
        const prio = element.getAttribute('data-prio');
        currentPrio = prio;
        updatePrioActiveBtn(prio);
    }

    async createTaskArray(key, singleTask) {
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

    enableTaskEdit(taskId) {
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


    createEditedTask(taskId) {
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


    createEditedTaskReturn(subtasks, originalTask) {
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


    async saveEditedTask(taskId) {
        const task = createEditedTask(taskId);
        await updateDataInDatabase(`${BASE_URL}tasks/${taskId}.json?auth=${token}`, task);
        const taskIndex = tasks.findIndex((t) => t.id === taskId);
        tasks.splice(taskIndex, 1, await createTaskArray(taskId, task));
        sessionStorage.setItem("tasks", JSON.stringify(tasks));
        openOverlay(taskId);
        initDragDrop();
        applyCurrentSearchFilter();
    }


    async moveTo(newStatus) {
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

    updateSubtaskStatusInDOM(subtask, index) {
        subtask.status = subtask.status === "checked" ? "unchecked" : "checked";

        const subtaskCheckbox = document.getElementById(`subtaskCheckbox${index}`);
        if (subtaskCheckbox) {
            subtaskCheckbox.src = subtask.status === "checked"
                ? "../assets/icons/checkboxchecked.svg"
                : "../assets/icons/checkbox.svg";
        }
    }

    async updateSubtaskStatus(taskId, subtaskIndex) {
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
}