import { SummaryHtml } from "./html/class.html-summary.js";

export class Summary {
    constructor(kanban) {
        this.kanban = kanban;
        this.summaryHtml = new SummaryHtml(kanban);
    }

    async initSummary() {
        this.displayGreeting();
        await this.loadCategory();
    }


    displayGreeting() {
        const currentTime = this.getGreeting();
        const userName = this.kanban.currentUser.name;

        const isMobile = window.matchMedia("(max-width: 1199.8px)").matches;
        const mobileElement = document.getElementById('greetingSummaryMobile');
        const mainElement = document.getElementById('summaryMain');

        if (isMobile) {
            mobileElement.innerHTML = this.summaryHtml.greetingMobileHTML(currentTime, userName);
            this.animateGreeting(mobileElement, mainElement);
            this.updateGreetingDesktop(currentTime, userName);
        } else {
            this.updateGreetingDesktop(currentTime, userName);
        }
    }



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
        greetingDesktop.innerText = time;
        greetingNameDesktop.innerText = name;
    }


    async loadCategory() {
        try {
            const data = await this.kanban.db.get("api/tasks/summary/");
            let dataJson = await data.json();
            this.taskAssignment(dataJson);
            this.displayUrgentTasks(dataJson);
        } catch (error) {
            console.error("Error loading categories:", error);
        }
    }



    taskAssignment(data) {
        updateElement('howManyTodos', data.todos);
        updateElement('howManyInProgress', data.in_progress);
        updateElement('howManyAwaitFeedback', data.await_feedback);
        updateElement('howManyDone', data.done);
        updateElement('howManyTaskInBoard', data.total);
    }



    updateElement(elementId, newValue) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerText = newValue;
        }
    }



    displayUrgentTasks(data) {
        const urgentTaskCount = data.urgent;
        const urgentTaskDate = urgentTaskCount > 0
            ? new Date(data.next_urgent_due).toLocaleDateString('de-DE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
            : '';

        this.updateElement('howManyUrgent', urgentTaskCount);
        this.updateElement('summUrgentDate', urgentTaskDate);
    }
}