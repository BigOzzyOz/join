export class SubtaskHtml {
    //NOTE - Properties

    subtask;
    id;
    text;
    status;

    //NOTE - Constructor

    constructor(subtask) {
        this.subtask = subtask;
        this.id = subtask.id;
        this.text = subtask.text;
        this.status = subtask.status;
    }

    //NOTE - HTML Generation

    generateSubtaskListItemHTML(index) {
        const safeText = this.text ? this.text.replace(/</g, "&lt;").replace(/>/g, "&gt;") : 'No text';

        return /*html*/`
            <li id="subtaskListId-${index}" class="subtaskListItem" data-index="${index}">
                <label class="subtaskListLabel" data-index="${index}">
                    <span class="subtaskListLabelText">${safeText}</span>
                </label>
                <div class="subtaskListIcons">
                    <img class="subtaskListIcon" data-action="edit" src="../assets/icons/editDark.svg" alt="Edit">
                    <div class="subtaskListSeperator"></div>
                    <img class="subtaskListIcon" data-action="delete" src="../assets/icons/delete.svg" alt="Delete">
                </div>
                <div class="subtaskEditContainer d-none" id="subtaskEditContainer-${index}" data-index="${index}">
                    <input class="subtaskEditInput" id="subtaskEditInput-${index}" type="text" value="${safeText}" data-index="${index}">
                    <div class="subtaskEditIcons">
                        <img class="subtaskEditIcon" data-action="delete" src="../assets/icons/delete.svg" alt="Delete">
                        <div class="subtaskEditSeperator"></div>
                        <img class="subtaskEditIcon" data-action="save" src="../assets/icons/checkDark.svg" alt="Save">
                    </div>
                </div>
            </li>
        `;
    }
}