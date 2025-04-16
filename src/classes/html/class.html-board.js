export class BoardHtml {
    constructor(kanban) {
        this.kanban = kanban;
    }

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
}