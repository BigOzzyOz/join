export class ContactsPageHtml {
    constructor(kanban) {
        this.kanban = kanban;
    }

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
            <img src="../assets/icons/person_add.svg" alt="person add">
          </div>
          `;
    }



    htmlRenderContactLetter(letter) {
        return /*html*/`
          <div class="contactLetter">
            <p class="fs20">${letter}</p>
            <ul id="contactLetter${letter}" class="contactList">
            </ul>
          </div>
        `;
    }
}