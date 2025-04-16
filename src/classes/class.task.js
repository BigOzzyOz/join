class Task {
    /**
     * Creates an object template for a task with a specified key and task details.
     * 
     * @param {string} key - The unique identifier for the task.
     * @param {Object} task - The task details.
     * @param {Array} task.assignedTo - The list of people assigned to the task.
     * @param {string} task.category - The category of the task.
     * @param {string} task.date - The due date of the task.
     * @param {string} task.description - The description of the task.
     * @param {string} task.prio - The priority level of the task.
     * @param {string} task.status - The status of the task.
     * @param {Array} task.subtasks - The list of subtasks.
     * @param {string} task.title - The title of the task.
     * @returns {Object} The task object template.
     */
    objectTemplateNumberOfBoard(key, task) {
        return {
            "id": key,
            "assignedTo": task.assignedTo,
            "category": task.category,
            "date": task.date,
            "description": task.description,
            "prio": task.prio,
            "status": task.status,
            "subtasks": task.subtasks,
            "title": task.title
        };
    }

    /**
     * Creates a new task object with the given key and task data.
     * @param {string} key - The unique identifier for the task.
     * @param {Object} singleTask - The task details.
     * @returns {Object} The new task object.
     */
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

    /**
     * Updates the status of a subtask in the DOM and database.
     * - Retrieves the task object from the tasks array using the provided taskId.
     * - Retrieves the subtask object from the task.subtasks array using the provided subtaskIndex.
     * - If the subtask object exists, updates its status in the DOM by calling updateSubtaskStatusInDOM.
     * - Updates the subtask progress bar in the DOM by calling updateSubtaskProgressBar.
     * - Updates the task object in the database by calling updateDataInDatabase.
     * - Updates the tasks array in session storage by calling createTaskArray and replacing the old task object with the new one.
     * @param {string} taskId - The ID of the task.
     * @param {number} subtaskIndex - The index of the subtask in the task.subtasks array.
     * @returns {Promise<void>}
     */
    async updateSubtaskStatus(taskId, subtaskIndex) {
        // Dependency: tasks array (global or passed), updateDataInDatabase, createTaskArray, updateSubtaskStatusInDOM, updateSubtaskProgressBar
        // NOTE: This function needs access to the global 'tasks' array and several functions 
        //       that will likely belong to other classes (Board, HtmlBoard). 
        //       This indicates potential refactoring needs later to manage dependencies.
        let task = tasks.find((task) => task.id === taskId);
        if (task) {
            let subtask = task.subtasks[subtaskIndex];
            if (subtask) {
                updateSubtaskStatusInDOM(subtask, subtaskIndex); // Belongs likely to Board or HtmlBoard class
                updateSubtaskProgressBar(task.subtasks, taskId); // Belongs likely to Board or HtmlBoard class
                await updateDataInDatabase(`${BASE_URL}tasks/${taskId}.json?auth=${token}`, task); // Global function/dependency
                let taskIndex = tasks.findIndex(t => taskId === t.id);
                // The next line uses 'createTaskArray' which is now part of this class, 
                // but it also modifies the global 'tasks' array.
                tasks.splice(taskIndex, 1, await this.createTaskArray(taskId, task));
                sessionStorage.setItem("tasks", JSON.stringify(tasks)); // Global state management
            }
        }
    }
}