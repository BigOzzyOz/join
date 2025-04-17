export class SubtaskHtml {
    //NOTE Properties

    text;
    status;

    constructor(subtask) {
        this.text = subtask.text;
        this.status = subtask.status;
    }

    //NOTE Subtask HTML Generation

    generateSaveSubtaskHTML(index) {
        const safeText = this.text.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
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

    //FIXME: Doppelte oder nicht benötigte Methoden ggf. hier ans Ende verschieben
}