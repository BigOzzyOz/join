/**
 * Handles HTML generation for the Summary view.
 */
export class SummaryHtml {
    //NOTE - Properties
    /** @type {import('../class.kanban.js').Kanban} Reference to the main Kanban application instance. */
    kanban;

    //NOTE - Constructor & Initialization
    /**
     * Creates a SummaryHtml instance.
     * @param {import('../class.kanban.js').Kanban} kanban - Kanban app instance
     */
    constructor(kanban) {
        this.kanban = kanban;
    }

    //NOTE - HTML Rendering Methods
    /**
     * Generates the HTML for the mobile greeting section.
     * @param {string} greetingTime - The time-based greeting (e.g., "Good morning").
     * @param {string} greetingName - The name of the user to greet.
     * @returns {string} The HTML string for the mobile greeting.
     */
    greetingMobileHTML(greetingTime, greetingName) {
        const safeGreetingTime = this._sanitize(greetingTime);
        const safeGreetingName = this._sanitize(greetingName);
        return /*html*/`
            <div class="summ-greeting-mobile">
                <h3 class="summ-day-greeting">${safeGreetingTime}</h3>
                <span class="summ-person-greeting">${safeGreetingName}</span>
            </div>
        `;
    }

    //NOTE - Helpers
    /**
     * Sanitizes a string for HTML output.
     * @private
     * @param {string} str
     * @returns {string}
     */
    _sanitize(str) {
        if (!str) return '';
        return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    //NOTE - Error Handling
    /**
     * Logs an error message.
     * @param {string} msg
     * @returns {void}
     */
    _logError(msg) { console.error(msg); }
}