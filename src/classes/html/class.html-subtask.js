export class SubtaskHtml {
    //NOTE Properties

    subtask;

    constructor(subtask) {
        this.subtask = subtask;
    }

    //NOTE Subtask HTML Generation

    generateSaveSubtaskHTML(index) {
        const safeText = this.subtask.text.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
        return /*html*/`
            <li class="subtaskEditList" id="subtask-${index}">
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

    updateSubtaskStatus(status, index) {
        this.subtask.status = status;
        const subtaskCheckbox = document.getElementById(`subtaskCheckbox${index}`);
        if (subtaskCheckbox) {
            subtaskCheckbox.src = this.subtask.status === "checked"
                ? "../assets/icons/checkboxchecked.svg"
                : "../assets/icons/checkbox.svg";
        }
    }

    //FIXME: Doppelte oder nicht benötigte Methoden ggf. hier ans Ende verschieben
}