/**
 * Handles HTML generation specifically for the Summary view.
 */
export class SummaryHtml {
  //NOTE - Properties

  /** @type {import('../class.kanban.js').Kanban} Reference to the main Kanban application instance. */
  kanban;

  //NOTE - Constructor & Initialization

  /**
   * Creates an instance of SummaryHtml.
   * @param {import('../class.kanban.js').Kanban} kanban - The main Kanban application instance.
   */
  constructor(kanban) {
    this.kanban = kanban;
  }

  //NOTE - HTML Rendering Methods

  /**
   * Generates the HTML for the mobile greeting section.
   * Sanitizes the greeting time and name to prevent XSS.
   * @param {string} greetingTime - The time-based greeting (e.g., "Good morning").
   * @param {string} greetingName - The name of the user to greet.
   * @returns {string} The HTML string for the mobile greeting.
   */
  greetingMobileHTML(greetingTime, greetingName) {
    const safeGreetingTime = greetingTime.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeGreetingName = greetingName.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    return /*html*/`
      <div class="summ-greeting-mobile">
        <h3 class="summ-day-greeting">${safeGreetingTime}</h3>
        <span class="summ-person-greeting">${safeGreetingName}</span>
      </div>
    `;
  }
}