import { SummaryHtml } from "./html/class.html-summary.js";

export class Summary {
    constructor(kanban) {
        this.kanban = kanban;
        this.summaryHtml = new SummaryHtml(kanban);
    }

    initSummary = async () => {
        this.displayGreeting();
        await this.loadCategory();
    };

    displayGreeting = () => {
        const currentTime = this.getGreeting();
        const userName = this.kanban.currentUser?.name || "Guest";

        const isMobile = window.matchMedia("(max-width: 1199.8px)").matches;
        const mobileElement = document.getElementById('greetingSummaryMobile');
        const mainElement = document.getElementById('summaryMain');

        if (isMobile && mobileElement && mainElement) {
            mobileElement.innerHTML = this.summaryHtml.greetingMobileHTML(currentTime, userName);
            this.animateGreeting(mobileElement, mainElement);
            this.updateGreetingDesktop(currentTime, userName);
        } else {
            this.updateGreetingDesktop(currentTime, userName);
        }
    };

    getGreeting() {
        const currentTime = new Date().getHours();
        if (currentTime < 12) return "Good morning,";
        else if (currentTime < 18) return "Good afternoon,";
        else return "Good evening,";
    }

    animateGreeting(mobileElement, mainElement) {
        mobileElement.style.display = 'flex';
        setTimeout(() => {
            mainElement.style.opacity = '0';
            setTimeout(() => {
                mobileElement.classList.add('hide');
                setTimeout(() => {
                    mobileElement.style.display = 'none';
                    mainElement.style.opacity = '1';
                    mainElement.style.transition = 'opacity 0.9s ease';
                }, 900);
            }, 1000);
        }, 0);
    }

    updateGreetingDesktop(time, name) {
        let greetingDesktop = document.getElementById('greetingSumm');
        let greetingNameDesktop = document.getElementById('greetingNameDesktop');
        if (greetingDesktop) greetingDesktop.innerText = time;
        if (greetingNameDesktop) greetingNameDesktop.innerText = name;
    }

    loadCategory = async () => {
        try {
            const response = await this.kanban.db.get("api/tasks/summary/");

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const dataJson = await response.json();
            this.taskAssignment(dataJson);
            this.displayUrgentTasks(dataJson);
        } catch (error) {
            console.error("Error loading summary data:", error);
        }
    };

    taskAssignment(data) {
        this.updateElement('howManyTodos', data.todos);
        this.updateElement('howManyInProgress', data.in_progress);
        this.updateElement('howManyAwaitFeedback', data.await_feedback);
        this.updateElement('howManyDone', data.done);
        this.updateElement('howManyTaskInBoard', data.total);
    }

    updateElement(elementId, newValue) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerText = String(newValue);
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
                console.error("Error formatting urgent date:", e);
                urgentTaskDate = "Invalid Date";
            }
        }

        this.updateElement('howManyUrgent', urgentTaskCount);
        this.updateElement('summUrgentDate', urgentTaskDate);
    }
}