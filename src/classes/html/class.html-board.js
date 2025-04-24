/**
 * Handles HTML generation specifically for the Board view.
 */
export class BoardHtml {
    //NOTE - Properties
    /** @type {import('../class.kanban.js').Kanban} Reference to the main Kanban application instance. */
    kanban;

    //NOTE - Constructor & Initialization
    /**
     * Creates an instance of BoardHtml.
     * @param {import('../class.kanban.js').Kanban} kanban - The main Kanban application instance.
     */
    constructor(kanban) {
        this.kanban = kanban;
    }

    //NOTE - Delete Task Modal
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

    //NOTE - Add Task Modal Template
    /**
     * Fetches the Add Task HTML template from a file and wraps it in a container div.
     * @returns {Promise<string>} A promise that resolves with the HTML string for the Add Task modal.
     */
    async fetchAddTaskTemplate() {
        let html = await this._fetchAddTaskHtml();
        return `
                  <div class="addTaskModalContainer">
                    ${html}
                  </div>
                `;
    }

    /**
     * Helper to fetch the Add Task HTML template from file.
     * @private
     * @returns {Promise<string>} The HTML string for the Add Task modal.
     */
    async _fetchAddTaskHtml() {
        try {
            let response = await fetch("../assets/templates/html/addtasktemplate.html");
            return await response.text();
        } catch (e) {
            this._logError('Failed to fetch Add Task template: ' + e);
            return '';
        }
    }

    //NOTE - Error Handling
    /**
     * Logs an error message.
     * @param {string} msg
     * @returns {void}
     */
    _logError(msg) { console.error(msg); }
}