export class SummaryListener {
    //NOTE - Properties
    /** @type {object} Kanban app instance. */
    kanban;
    /** @type {HTMLElement} Summary container element. */
    summaryContainer;

    //NOTE - Constructor & Initialization
    /**
     * Creates a SummaryListener instance.
     * @param {object} kanban - Kanban app instance
     */
    constructor(kanban) {
        this.kanban = kanban;
        this.summaryContainer = document.getElementById('summaryMain') || document.body;
        if (this.summaryContainer === document.body) this._logWarn("Could not find element with ID 'summaryMain'. Attaching listener to document.body.");
        this.activateListener();
    }

    //NOTE - Listener Management
    /**
     * Activates the summary click listener.
     * @returns {void}
     */
    activateListener() {
        this.summaryContainer?.addEventListener('click', this.handleInteraction);
    }

    /**
     * Deactivates all summary listeners.
     * @returns {void}
     */
    deactivateAllListenersSummary() {
        this.summaryContainer?.removeEventListener('click', this.handleInteraction);
    }

    //NOTE - Event Handling
    /**
     * Handles click events in the summary container.
     * @param {MouseEvent} event
     * @returns {void}
     */
    handleInteraction = (event) => {
        const target = event.target;
        if (target.closest('.summ-info-field')) this.nextPage();
    };

    //NOTE - Navigation
    /**
     * Navigates to the board page and sets active tab.
     * @returns {void}
     */
    nextPage = () => {
        sessionStorage.setItem('activeTab', 'board');
        window.location.href = 'board.html';
    };

    //NOTE - Error/Warning Helpers
    /**
     * Logs a warning message.
     * @param {string} msg
     * @returns {void}
     */
    _logWarn(msg) { console.warn(msg); }
}