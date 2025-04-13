export class SummaryHtml {
    constructor(kanban) {
        this.kanban = kanban;
    }


    greetingMobileHTML(greetingTime, greetingName) {
        return /*html*/`    
      <div class="summ-greeting-mobile">
        <h3 class="summ-day-greeting">${greetingTime}</h3>
        <span class="summ-person-greeting">${greetingName}</span>
      </div>
    `;
    }
}