/**
 * Handles HTML generation specifically related to a Subtask instance.
 */
export class SubtaskHtml {
    //NOTE Properties

    /** @type {import('../class.subtask.js').Subtask} The Subtask instance this class generates HTML for. */
    subtask;

    /**
     * Creates an instance of SubtaskHtml.
     * @param {import('../class.subtask.js').Subtask} subtask - The Subtask instance to associate with this HTML generator.
     */
    constructor(subtask) {
        this.subtask = subtask;
    }

    //NOTE Subtask HTML Generation

    /**
     * Generates the HTML for a subtask list item in edit mode (e.g., in Add Task).
     * Includes the subtask text and edit/delete icons.
     * Sanitizes the subtask text.
     * @param {number} index - The index of the subtask in its list, used for element IDs and data attributes.
     * @returns {string} The HTML string for the editable subtask list item.
     */
    generateSaveSubtaskHTML(index) {
        const safeText = this.subtask.text.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
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
     * Assumes a corresponding checkbox element exists with ID `subtaskCheckbox${index}`.
     * @param {'checked'|'unchecked'} status - The new status to reflect in the UI.
     * @param {number} index - The index of the subtask, used to find the correct checkbox element.
     */
    updateSubtaskStatus(status, index) {
        this.subtask.status = status; // Note: This also updates the internal subtask state
        const subtaskCheckbox = document.getElementById(`subtaskCheckbox${index}`);
        if (subtaskCheckbox) {
            subtaskCheckbox.src = this.subtask.status === "checked"
                ? "../assets/icons/checkboxchecked.svg"
                : "../assets/icons/checkbox.svg";
        }
    }

    //FIXME: Doppelte oder nicht benötigte Methoden ggf. hier ans Ende verschieben
}