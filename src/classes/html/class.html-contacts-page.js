export class ContactsPageHtml {
  //NOTE - Properties

  kanban;

  //NOTE - Constructor & Initialization
  constructor(kanban) {
    this.kanban = kanban;
  }

  //NOTE - HTML Rendering Methods

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

  htmlRenderAddContact() {
    return /*html*/`
          <div id="moreContactsButton" class="moreIcon">
            <p>Add new contact</p>
            <img src="../assets/icons/person_add.svg" alt="Add new contact">
          </div>
          `;
  }


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