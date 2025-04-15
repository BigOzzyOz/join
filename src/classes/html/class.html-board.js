class HtmlBoard {
    /**
     * Generates HTML for a mobile greeting section.
     * 
     * @param {string} greetingTime - The time-based greeting (e.g., "Good morning").
     * @param {string} greetingName - The name of the person being greeted.
     * @returns {string} The HTML string for the mobile greeting section.
     */
    greetingMobileHTML(greetingTime, greetingName) {
        return /*html*/`    
        <div class="summ-greeting-mobile">
          <h3 class="summ-day-greeting">${greetingTime}</h3>
          <span class="summ-person-greeting">${greetingName}</span>
        </div>
      `;
    }

    /**
     * Generates the HTML for the placeholder message shown when a board column is empty.
     * @param {string} status - The status corresponding to the column (e.g., 'todo', 'inprogress').
     * @returns {string} The HTML string for the empty column placeholder.
     */
    generateEmptyColumnPlaceholder(status) {
        // The ID is added so the Board class can easily find and hide/show it if needed.
        // Customize the text based on status for better readability.
        let statusText = status;
        if (status === 'inprogress') statusText = 'in progress';
        if (status === 'awaitfeedback') statusText = 'awaiting feedback';

        return /*html*/`
            <div class="noTasksPlaceholder d-none" id="no-tasks-${status}">No tasks ${statusText}</div>
        `;
        // Note: The Board class's checkEmptyColumns method currently assumes these placeholders
        // exist in the base HTML and just toggles 'd-none'. If this function is used to dynamically
        // add placeholders, the checkEmptyColumns logic would need adjustment.
    }

    // Potential future additions: Templates for column headers, add task buttons within columns, etc.
}