/**
 * Handles HTML generation specifically for the main Contacts page view.
 */
export class ContactsPageHtml {
  //NOTE - Properties

  /** @type {import('../class.kanban.js').Kanban} Reference to the main Kanban application instance. */
  kanban;

  //NOTE - Constructor & Initialization

  /**
   * Creates an instance of ContactsPageHtml.
   * @param {import('../class.kanban.js').Kanban} kanban - The main Kanban application instance.
   */
  constructor(kanban) {
    this.kanban = kanban;
  }

  //NOTE - HTML Rendering Methods

  /**
   * Generates the HTML for the empty state of the contact details section.
   * @returns {string} The HTML string for the empty contact details view.
   */
  htmlRenderContactDetailsEmpty() {
    return /*html*/`
          <div id="contactsDetail" class="ttx100">
            <div class="contactsHeader">
              <h1>Contacts</h1>
              <p class="bordered fs20">Better with a Team</p>
            </div>
          </div>
          `;
  }

  /**
   * Generates the HTML for the "Add new contact" button.
   * @returns {string} The HTML string for the add contact button.
   */
  htmlRenderAddContact() {
    return /*html*/`
          <div id="moreContactsButton" class="moreIcon">
            <p>Add new contact</p>
            <img src="../assets/icons/person_add.svg" alt="Add new contact">
          </div>
          `;
  }

  /**
   * Generates the HTML structure for a letter group in the contacts list.
   * Includes the letter heading and an empty list container for contacts starting with that letter.
   * Sanitizes the letter to prevent XSS.
   * @param {string} letter - The letter for this group (e.g., 'A', 'B').
   * @returns {string} The HTML string for the letter group container.
   */
  htmlRenderContactLetter(letter) {
    const safeLetter = letter.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    return /*html*/`
          <div class="contactLetter">
            <p class="fs20">${safeLetter}</p>
            <ul id="contactLetter${safeLetter}" class="contactList">
            </ul>
          </div>
        `;
  }
}