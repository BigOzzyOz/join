export class SummaryListener {
    //NOTE - Properties

    kanban;
    summaryContainer;

    //NOTE - Constructor & Initialization

    constructor(kanban) {
        this.kanban = kanban;
        this.summaryContainer = document.getElementById('summaryMain') || document.body;
        if (this.summaryContainer === document.body) {
            console.warn("SummaryListener: Could not find element with ID 'summaryMain'. Attaching listener to document.body.");
        }
        this.activateListener();
    }

    //NOTE - Listener Management

    activateListener() {
        this.summaryContainer?.addEventListener('click', this.handleInteraction);
    }

    deactivateAllListenersSummary() {
        this.summaryContainer?.removeEventListener('click', this.handleInteraction);
    }

    //NOTE - Event Handling

    handleInteraction = (event) => {
        const target = event.target;

        if (target.closest('.summ-info-field')) {
            this.nextPage();
        };

        //NOTE - Navigation

        nextPage = () => {
            sessionStorage.setItem('activeTab', 'board');
            window.location.href = 'board.html';
        };
    };
}