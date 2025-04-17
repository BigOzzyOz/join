import { Subtask } from "./class.subtask.js";
import { TaskHtml } from "./html/class.html-task.js";

export class Task {
    //NOTE Properties

    id;
    title;
    description;
    date;
    prio;
    status;
    assignedTo;
    category;
    subtasks;
    html;

    constructor(data) {
        this.id = data.id || null;
        this.title = data.title || '';
        this.description = data.description || '';
        this.date = data.date || '';
        this.prio = data.prio || 'low';
        this.status = data.status || 'toDo';
        this.assignedTo = data.assignedTo || data.assigned_to || [];
        this.category = data.category || 'User Story';
        if (data.subtasks && data.subtasks.length > 0) {
            this.subtasks = data.subtasks.map(sub => new Subtask(sub));
        } else {
            this.subtasks = [];
        }

        this.html = new TaskHtml(this.toTaskObject());
    }

    //NOTE Task Object Methods

    toTaskObject() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            date: this.date,
            prio: this.prio,
            status: this.status,
            assignedTo: this.assignedTo,
            category: this.category,
            subtasks: this.subtasks.map(sub => sub.toSubtaskObject()),
        };
    }

    toTaskUploadObject() {
        return {
            title: this.title,
            description: this.description,
            date: this.date,
            prio: this.prio,
            status: this.status,
            assigned_to: this.assignedTo,
            category: this.category,
            subtasks: this.subtasks.map(sub => sub.toSubtaskUploadObject()),
        };
    }

    //NOTE Task Edit & Save Methods
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

    //NOTE Board/Move Methods

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

    //NOTE Subtask Methods

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

    //FIXME: Doppelte oder nicht benötigte Methoden ggf. hier ans Ende verschieben
}