/**
 * Handles HTML generation specifically related to a Subtask instance.
 */
export class SubtaskHtml {
    //NOTE - Properties
    /** @type {import('../class.subtask.js').Subtask} The Subtask instance this class generates HTML for. */
    subtask;

    //NOTE - Constructor & Initialization
    /**
     * Creates an instance of SubtaskHtml.
     * @param {import('../class.subtask.js').Subtask} subtask - The Subtask instance to associate with this HTML generator.
     */
    constructor(subtask) {
        this.subtask = subtask;
    }

    //NOTE - Subtask HTML Generation
    /**
     * Generates the HTML for a subtask list item in edit mode.
     * @param {number} index - The index of the subtask in its list.
     * @returns {string} The HTML string for the editable subtask list item.
     */
    generateSaveSubtaskHTML(index) {
        const safeText = this._sanitize(this.subtask.text);
        return /*html*/`
            <li class="subtaskEditList" id="subtask-${index}" data-index="${index}">
              <div class="subtaskItem">
                <span class="subtaskItemText">${safeText}</span>
                <input type="text" class="editSubtaskInput dNone" value="${safeText}" maxlength="80">
                <div class="addedTaskIconContainer">
                    <img class="icon editSubtaskBtns" data-action="edit" src="../assets/icons/pencilDarkBlue.svg">
                    <div class="subtaskInputSeperator"></div>
                    <img class="icon deleteSubtaskBtns" data-action="delete" src="../assets/icons/delete.svg">
                </div>
              </div>
            </li>
        `;
    }

    /**
     * Updates the visual status (checkbox image) of a subtask in the UI.
     * @param {'checked'|'unchecked'} status - The new status to reflect in the UI.
     * @param {number} index - The index of the subtask.
     * @returns {void}
     */
    updateSubtaskStatus(status, index) {
        this.subtask.status = status;
        const subtaskCheckbox = document.getElementById(`subtaskCheckbox${index}`);
        if (subtaskCheckbox) subtaskCheckbox.src = status === "checked"
            ? "../assets/icons/checkboxchecked.svg"
            : "../assets/icons/checkbox.svg";
    }

    //NOTE - Helpers
    /**
     * Sanitizes a string for HTML output.
     * @private
     * @param {string} str
     * @returns {string}
     */
    _sanitize(str) {
        if (!str) return '';
        return str.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
    }

    //NOTE - Error Handling
    /**
     * Logs an error message.
     * @param {string} msg
     * @returns {void}
     */
    _logError(msg) { console.error(msg); }
}