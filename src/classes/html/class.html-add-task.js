/**
 * Handles HTML generation specifically for the Add Task functionality.
 */
export class AddTaskHtml {
  //NOTE Properties

  /** @type {import('../class.kanban.js').Kanban} Reference to the main Kanban application instance. */
  kanban;

  /**
   * Creates an instance of AddTaskHtml.
   * @param {import('../class.kanban.js').Kanban} kanban - The main Kanban application instance.
   */
  constructor(kanban) {
    this.kanban = kanban;
  }

  //NOTE SVG/HTML Generation

  /**
   * Generates an SVG element representing a profile picture circle with initials.
   * @param {string} color - The background color of the circle.
   * @param {string} initials - The initials to display inside the circle.
   * @param {number} [height=120] - The height of the SVG element.
   * @param {number} [width=120] - The width of the SVG element.
   * @returns {string} The HTML string for the SVG profile picture.
   */
  svgProfilePic(color, initials, height = 120, width = 120) {
    return /*html*/`
          <svg class="profilePic" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) / 2 - 5}" stroke="white" stroke-width="3" fill="${color}"/>
            <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="48px">${initials}</text>
          </svg>
        `;
  }

  //FIXME: Doppelte oder nicht benötigte Methoden ggf. hier ans Ende verschieben
}