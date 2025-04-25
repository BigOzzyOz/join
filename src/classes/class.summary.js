import { SummaryHtml } from "./html/class.html-summary.js";

/**
 * Manages the summary page logic, including displaying greetings and task statistics.
 */
export class Summary {
    //NOTE - Properties

    /** @type {Kanban} Kanban app instance. */
    kanban;
    /** @type {SummaryHtml} HTML handler. */
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
     * Initializes the summary page.
     * @async
     */
    initSummary = async () => {
        this.displayGreeting();
        await this.loadTaskData();
    };

    //NOTE - Greeting Logic

    /**
     * Displays greeting for user and device.
     */
    displayGreeting = () => {
        const greetingText = this.getGreeting();
        const userName = this.kanban.currentUser?.name || "Guest";
        const isMobile = window.matchMedia("(max-width: 1199.8px)").matches;
        const mobileElement = document.getElementById('greetingSummaryMobile');
        const mainElement = document.getElementById('summaryMain');
        if (isMobile && mobileElement && mainElement) {
            mobileElement.innerHTML = this.summaryHtml.greetingMobileHTML(greetingText, userName);
            this._animateGreeting(mobileElement, mainElement);
            this._updateGreetingDesktop(greetingText, userName);
        } else {
            this._updateGreetingDesktop(greetingText, userName);
        }
    };

    /**
     * Returns greeting text for current time.
     * @returns {string}
     */
    getGreeting() {
        const h = new Date().getHours();
        if (h < 12) return "Good morning,";
        if (h < 18) return "Good afternoon,";
        return "Good evening,";
    }

    /**
     * Animates mobile greeting.
     * @param {HTMLElement} mobileElement
     * @param {HTMLElement} mainElement
     */
    _animateGreeting(mobileElement, mainElement) {
        if (!(mobileElement instanceof HTMLElement) || !(mainElement instanceof HTMLElement)) {
            console.error("Invalid elements passed to animateGreeting");
            return;
        }
        mobileElement.style.display = 'flex';
        mobileElement.classList.remove('hide');
        mainElement.style.opacity = '1';
        setTimeout(() => {
            mainElement.style.transition = 'opacity 0.5s ease';
            mainElement.style.opacity = '0';
            setTimeout(() => {
                mobileElement.classList.add('hide');
                setTimeout(() => {
                    mobileElement.style.display = 'none';
                    mainElement.style.opacity = '1';
                    setTimeout(() => mainElement.style.transition = '', 500);
                }, 900);
            }, 1000);
        }, 0);
    }

    /**
     * Updates desktop greeting.
     * @param {string} time
     * @param {string} name
     */
    _updateGreetingDesktop(time, name) {
        const greetingDesktop = document.getElementById('greetingSumm');
        const greetingNameDesktop = document.getElementById('greetingNameDesktop');
        if (greetingDesktop) greetingDesktop.innerText = time;
        if (greetingNameDesktop) greetingNameDesktop.innerText = name;
    }

    //NOTE - Task Data Handling & Display

    /**
     * Loads and displays summary data.
     * @async
     */
    loadTaskData = async () => {
        try {
            if (!this.kanban?.db?.get) throw new Error("Database access object (kanban.db.get) is not available.");
            const response = await this.kanban.db.get("api/tasks/summary/");
            if (!response.ok) {
                let errorBody = 'No details available';
                try { errorBody = await response.text(); } catch (e) { }
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}. Body: ${errorBody}`);
            }
            const dataJson = await response.json();
            this._updateTaskCounts(dataJson);
            this._displayUrgentTasks(dataJson);
        } catch (error) {
            console.error("Error loading summary data:", error);
        }
    };

    /**
     * Updates task count elements.
     * @param {object} data
     */
    _updateTaskCounts(data) {
        this._updateElement('howManyTodos', data.todos);
        this._updateElement('howManyInProgress', data.in_progress);
        this._updateElement('howManyAwaitFeedback', data.await_feedback);
        this._updateElement('howManyDone', data.done);
        this._updateElement('howManyTaskInBoard', data.total);
    }

    /**
     * Updates innerText of an element by ID.
     * @param {string} elementId
     * @param {string|number|null|undefined} newValue
     */
    _updateElement(elementId, newValue) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerText = String(newValue ?? '');
        } else {
            console.warn(`Element with ID '${elementId}' not found for update.`);
        }
    }

    /**
     * Displays urgent task count and next urgent date.
     * @param {object} data
     */
    _displayUrgentTasks(data) {
        const urgentTaskCount = data.urgent || 0;
        let urgentTaskDate = '';
        if (urgentTaskCount > 0 && data.next_urgent_due) {
            try {
                urgentTaskDate = new Date(data.next_urgent_due).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric',
                });
            } catch (e) {
                console.error("Error formatting urgent date:", data.next_urgent_due, e);
                urgentTaskDate = "Invalid Date";
            }
        }
        this._updateElement('howManyUrgent', urgentTaskCount);
        this._updateElement('summUrgentDate', urgentTaskDate);
    }
}