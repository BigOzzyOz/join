/**
 * Handles HTML generation specifically for the Board view.
 */
export class BoardHtml {
    /** @type {import('../class.kanban.js').Kanban} Reference to the main Kanban application instance. */
    kanban;

    /**
     * Creates an instance of BoardHtml.
     * @param {import('../class.kanban.js').Kanban} kanban - The main Kanban application instance.
     */
    constructor(kanban) {
        this.kanban = kanban;
    }

    /**
     * Generates the HTML content for the delete task confirmation dialog.
     * @param {number} id - The ID of the task to be deleted.
     * @returns {string} The HTML string for the confirmation dialog.
     */
    openDeleteTaskSureHtml(id) {
        return /*html*/`
            <div class="deleteQuestion">
                <p>Do you really want to delete this entry?</p>
                <form id="deleteTaskForm" data-id="${id}">
                    <button id="deleteTaskNo" type="button">
                        NO
                        <img src="../assets/icons/close.svg" alt="close X">
                    </button>
                    <button type="submit">
                        YES
                        <img src="../assets/icons/check.svg" alt="check icon">
                    </button>
                </form>
            </div>
        `;
    }

    //NOTE Add Task Modal Template

    /**
     * Fetches the Add Task HTML template from a file and wraps it in a container div.
     * @returns {Promise<string>} A promise that resolves with the HTML string for the Add Task modal.
     */
    async fetchAddTaskTemplate() {
        let response = await fetch("../assets/templates/html/addtasktemplate.html");
        let html = await response.text();
        return `
                  <div class="addTaskModalContainer">
                    ${html}
                  </div>
                `;
    }
}