export class SummaryListener {
    constructor(kanban) {
        this.kanban = kanban;
        this.activateListener();
    }

    activateListener() {
        document.querySelectorAll('.summ-info-field').forEach(btn => {
            btn.addEventListener('click', nextPage);
        });
    }



    deactivateAllListenersSummary() {
        document.querySelectorAll('.summ-info-field').forEach(btn => {
            btn.removeEventListener('click', nextPage);
        });
    }



    nextPage() {
        sessionStorage.setItem('activeTab', 'board');
        window.location.href = 'board.html';
    }
}