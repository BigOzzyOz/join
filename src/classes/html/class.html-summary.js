export class SummaryHtml {
  //NOTE - Properties

  kanban;

  //NOTE - Constructor & Initialization

  constructor(kanban) {
    this.kanban = kanban;
  }

  //NOTE - HTML Rendering Methods

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