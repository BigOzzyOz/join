export class AddTaskHtml {
    constructor(kanban) {
        this.kanban = kanban;
    }

    svgProfilePic(color, initials, height = 120, width = 120) {
        return /*html*/`
          <svg class="profilePic" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) / 2 - 5}" stroke="white" stroke-width="3" fill="${color}"/>
            <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="48px">${initials}</text>
          </svg>
        `;
    }

}