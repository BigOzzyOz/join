import { SummaryHtml } from "./html/class.html-summary.js";

export class Summary {
    //NOTE - Properties

    kanban;
    summaryHtml;

    //NOTE - Constructor & Initialization

    constructor(kanban) {
        this.kanban = kanban;
        this.summaryHtml = new SummaryHtml(kanban);
    }

    initSummary = async () => {
        this.displayGreeting();
        await this.loadTaskData(); // Renamed for clarity
    };

    //NOTE - Greeting Logic

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

    getGreeting() {
        const currentHour = new Date().getHours();
        if (currentHour < 12) return "Good morning,";
        if (currentHour < 18) return "Good afternoon,";
        return "Good evening,";
    }

    animateGreeting(mobileElement, mainElement) {
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

    updateGreetingDesktop(time, name) {
        const greetingDesktop = document.getElementById('greetingSumm');
        const greetingNameDesktop = document.getElementById('greetingNameDesktop');
        if (greetingDesktop) greetingDesktop.innerText = time;
        if (greetingNameDesktop) greetingNameDesktop.innerText = name;
    }

    //NOTE - Task Data Handling & Display

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

    updateTaskCounts(data) {
        this.updateElement('howManyTodos', data.todos);
        this.updateElement('howManyInProgress', data.in_progress);
        this.updateElement('howManyAwaitFeedback', data.await_feedback);
        this.updateElement('howManyDone', data.done);
        this.updateElement('howManyTaskInBoard', data.total);
    }

    updateElement(elementId, newValue) {
        const element = document.getElementById(elementId);
        if (element) {

            element.innerText = String(newValue ?? '');
        } else {
            console.warn(`Element with ID '${elementId}' not found for update.`);
        }
    }

    displayUrgentTasks(data) {
        const urgentTaskCount = data.urgent || 0;
        let urgentTaskDate = '';

        if (urgentTaskCount > 0 && data.next_urgent_due) {
            try {
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