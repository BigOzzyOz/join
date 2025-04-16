export class BoardListener {
    constructor(kanban) {
        this.kanban = kanban;
        this.boardInstance = kanban.board;
    }

    initDragDrop() {
        deactivateDragDrop();
        updateAllTaskCategories();
        dragDrop();
    }


    startDragging(id) {
        currentDraggedElement = id;
        document.querySelectorAll(".taskDragArea").forEach((zone) => {
            zone.classList.add("highlighted");
        });
    }


    dragEnd() {
        document.querySelectorAll('.taskDragArea').forEach((zone) => {
            zone.classList.remove('highlighted', 'highlightedBackground');
        });
    }
}