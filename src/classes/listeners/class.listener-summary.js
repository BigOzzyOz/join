export class SummaryListener {
    constructor(kanban) {
        this.kanban = kanban;
        this.summaryContainer = document.getElementById('summaryMain') || document.body;
        this.activateListener();
    }

    handleInteraction = (event) => {
        const target = event.target;

        if (target.closest('.summ-info-field')) {
            this.nextPage();
        }
    };

    activateListener() {
        this.summaryContainer.addEventListener('click', this.handleInteraction);
    }

    deactivateAllListenersSummary() {
        this.summaryContainer.removeEventListener('click', this.handleInteraction);
    }

    nextPage = () => {
        sessionStorage.setItem('activeTab', 'board');
        window.location.href = 'board.html';
    };
}