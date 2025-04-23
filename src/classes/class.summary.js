import { SummaryHtml } from "./html/class.html-summary.js";

/**
 * Manages the summary page logic, including displaying greetings and task statistics.
 */
export class Summary {
    //NOTE - Properties

    /** @type {Kanban} The main Kanban application instance. */
    kanban;
    /** @type {SummaryHtml} Instance for generating summary-related HTML. */
    summaryHtml;

    //NOTE - Constructor & Initialization

    /**
     * Creates an instance of the Summary class.
     * @param {Kanban} kanban - The main Kanban application instance.
     */
    constructor(kanban) {
        this.kanban = kanban;
        this.summaryHtml = new SummaryHtml(kanban);
    }

    /**
     * Initializes the summary page by displaying the greeting and loading task data.
     * @async
     */
    initSummary = async () => {
        this.displayGreeting();
        await this.loadTaskData();
    };

    //NOTE - Greeting Logic

    /**
     * Displays the appropriate greeting message based on the time of day and user name.
     * Handles both mobile and desktop views, including mobile animation.
     */
    displayGreeting = () => {
        const greetingText = this.getGreeting();
        const userName = this.kanban.currentUser?.name || "Guest";
        const isMobile = window.matchMedia("(max-width: 1199.8px)").matches;
        const mobileElement = document.getElementById('greetingSummaryMobile');
        const mainElement = document.getElementById('summaryMain');

        if (isMobile && mobileElement && mainElement) {
            mobileElement.innerHTML = this.summaryHtml.greetingMobileHTML(greetingText, userName);
            this.animateGreeting(mobileElement, mainElement);
            this.updateGreetingDesktop(greetingText, userName);
        } else {
            this.updateGreetingDesktop(greetingText, userName);
        }
    };

    /**
     * Determines the appropriate greeting based on the current hour.
     * @returns {string} The greeting text ("Good morning,", "Good afternoon,", or "Good evening,").
     */
    getGreeting() {
        const currentHour = new Date().getHours();
        if (currentHour < 12) return "Good morning,";
        if (currentHour < 18) return "Good afternoon,";
        return "Good evening,";
    }

    /**
     * Animates the mobile greeting message display.
     * Fades out the main content, shows the greeting, hides the greeting, and fades the main content back in.
     * @param {HTMLElement} mobileElement - The HTML element containing the mobile greeting.
     * @param {HTMLElement} mainElement - The main content element of the summary page.
     */
    animateGreeting(mobileElement, mainElement) {
        if (!(mobileElement instanceof HTMLElement) || !(mainElement instanceof HTMLElement)) {
            console.error("Invalid elements passed to animateGreeting");
            return;
        }
        mobileElement.style.display = 'flex';
        mobileElement.classList.remove('hide');
        mainElement.style.opacity = '1';

        // Start fade out of main content immediately
        setTimeout(() => {
            mainElement.style.transition = 'opacity 0.5s ease';
            mainElement.style.opacity = '0';

            // After main content is faded out, start hiding the mobile greeting
            setTimeout(() => {
                mobileElement.classList.add('hide'); // Start hiding animation

                // After hide animation duration, set display none and fade main back in
                setTimeout(() => {
                    mobileElement.style.display = 'none';
                    mainElement.style.opacity = '1'; // Fade main back in
                    // Reset transition after fade in is complete
                    setTimeout(() => mainElement.style.transition = '', 500);
                }, 900); // Corresponds to the hide animation duration
            }, 1000); // Delay before starting to hide the greeting
        }, 0); // Start immediately
    }


    /**
     * Updates the greeting text and user name on the desktop view.
     * @param {string} time - The greeting text (e.g., "Good morning,").
     * @param {string} name - The name of the current user or "Guest".
     */
    updateGreetingDesktop(time, name) {
        const greetingDesktop = document.getElementById('greetingSumm');
        const greetingNameDesktop = document.getElementById('greetingNameDesktop');
        if (greetingDesktop) greetingDesktop.innerText = time;
        if (greetingNameDesktop) greetingNameDesktop.innerText = name;
    }

    //NOTE - Task Data Handling & Display

    /**
     * Fetches task summary data from the backend API and updates the display.
     * Handles potential errors during the fetch operation.
     * @async
     */
    loadTaskData = async () => {
        try {
            if (!this.kanban?.db?.get) {
                throw new Error("Database access object (kanban.db.get) is not available.");
            }
            const response = await this.kanban.db.get("api/tasks/summary/");

            if (!response.ok) {
                let errorBody = 'No details available';
                try {
                    errorBody = await response.text();
                } catch (e) { /* Ignore parsing error */ }
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}. Body: ${errorBody}`);
            }

            const dataJson = await response.json();
            this.updateTaskCounts(dataJson);
            this.displayUrgentTasks(dataJson);
        } catch (error) {
            console.error("Error loading summary data:", error);
        }
    };

    /**
     * Updates the task count elements on the summary page.
     * @param {object} data - The summary data object from the API.
     * @param {number} data.todos - Count of tasks in 'todo'.
     * @param {number} data.in_progress - Count of tasks in 'in progress'.
     * @param {number} data.await_feedback - Count of tasks in 'await feedback'.
     * @param {number} data.done - Count of tasks in 'done'.
     * @param {number} data.total - Total count of tasks.
     */
    updateTaskCounts(data) {
        this.updateElement('howManyTodos', data.todos);
        this.updateElement('howManyInProgress', data.in_progress);
        this.updateElement('howManyAwaitFeedback', data.await_feedback);
        this.updateElement('howManyDone', data.done);
        this.updateElement('howManyTaskInBoard', data.total);
    }

    /**
     * Safely updates the innerText of an HTML element by its ID.
     * Logs a warning if the element is not found.
     * @param {string} elementId - The ID of the HTML element to update.
     * @param {string|number|null|undefined} newValue - The new value for the element's innerText. Null or undefined will result in an empty string.
     */
    updateElement(elementId, newValue) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerText = String(newValue ?? '');
        } else {
            console.warn(`Element with ID '${elementId}' not found for update.`);
        }
    }

    /**
     * Displays the count of urgent tasks and the date of the next upcoming urgent task.
     * @param {object} data - The summary data object from the API.
     * @param {number} [data.urgent] - The count of urgent tasks. Defaults to 0 if undefined.
     * @param {string} [data.next_urgent_due] - The due date string of the next urgent task.
     */
    displayUrgentTasks(data) {
        const urgentTaskCount = data.urgent || 0;
        let urgentTaskDate = '';

        if (urgentTaskCount > 0 && data.next_urgent_due) {
            try {
                // Format the date consistently
                urgentTaskDate = new Date(data.next_urgent_due).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                });
            } catch (e) {
                console.error("Error formatting urgent date:", data.next_urgent_due, e);
                urgentTaskDate = "Invalid Date";
            }
        }

        this.updateElement('howManyUrgent', urgentTaskCount);
        this.updateElement('summUrgentDate', urgentTaskDate);
    }
}