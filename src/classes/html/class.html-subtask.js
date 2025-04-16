export class SubtaskHtml {
    /**
     * Generates HTML for a subtask item in the list during task creation/editing.
     * 
     * @param {string} inputText - The text of the subtask.
     * @param {number} index - The index of the subtask in the temporary list.
     * @returns {string} The HTML string for the subtask list item.
     */
    generateSaveSubtaskHTML(inputText, index) {
        return /*html*/`
            <li id="subtaskListId${index}">
                <label class="subtaskListLabel" ondblclick="editSubtask(${index})">
                    <span class="subtaskListLabelText">${inputText}</span>
                </label>
                <div class="subtaskListIcons">
                    <img class="subtaskListIcon" onclick="editSubtask(${index})" src="../assets/icons/editDark.svg">
                    <div class="subtaskListSeperator"></div>
                    <img class="subtaskListIcon" onclick="deleteSubtask(${index})" src="../assets/icons/delete.svg">
                </div>
                <div class="subtaskEditContainer d-none" id="subtaskEditContainer${index}">
                    <input class="subtaskEditInput" id="subtaskEditInput${index}" type="text" value="${inputText}">
                    <div class="subtaskEditIcons">
                        <img class="subtaskEditIcon" onclick="deleteSubtask(${index})" src="../assets/icons/delete.svg">
                        <div class="subtaskEditSeperator"></div>
                        <img class="subtaskEditIcon" onclick="saveEditedSubtask(${index})" src="../assets/icons/checkDark.svg">
                    </div>
                </div>
            </li>
        `;
        // Note: The original function in addTaskTemplate.js had dependencies on editSubtask, deleteSubtask, saveEditedSubtask
        // These onclick handlers will need to be managed by the AddTaskListener class later.
    }
}