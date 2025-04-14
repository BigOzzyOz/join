export class ContactHtml {
  constructor(contact) {
    this.id = contact.id;
    this.email = contact.email;
    this.firstLetters = contact.firstLetters;
    this.isUser = contact.isUser;
    this.name = contact.name;
    this.profilePic = contact.profilePic;
    this.phone = contact.number;
  }

  htmlRenderContactDetails() {
    return /*html*/`
      <div id="contactsDetailMore" class="moreIcon">
        <img src="../assets/icons/more_vert.svg" alt="3 points vert">
      </div>
      <a id="backArrow-contacts" class="backArrow">
        <img src="../assets/icons/arrow-left-line.svg" alt="arrow left line">
      </a>
      <div class="contactsHeader">
        <h1>Contacts</h1>
        <p class="bordered fs20">Better with a Team</p>
      </div>
      <div class="contactOverview">
        <div class="contactBig">
          ${this.profilePic}
        </div>
        <div>
          <h2>${this.name}</h2>
          <div id="editMenu" class="editMenu ts0">
            <div id="editContactBtn" class="editMenuItem" data-id="${this.id}">
              <img class="editMenuButton" src="../assets/icons/edit.svg" alt="pencil">
              <img class="editMenuButton hoverEffectIcon" src="../assets/icons/editBlue.svg" alt="blue pencil">
              <p>Edit</p>
            </div>
            <div id="deleteContactBtn" class="editMenuItem" data-id="${this.id}">
              <img class="editMenuButton" src="../assets/icons/delete.svg" alt="trashcan">
              <img class="editMenuButton hoverEffectIcon" src="../assets/icons/deleteBlue.svg" alt="blue trashcan">
              <p>Delete</p>
            </div>
          </div>
        </div>
      </div>
      <p class="fs20">Contact Information</p>
      <h4>Email</h4>
      <p><a href="${this.email}">${this.email}</a></p>
      <h4>Phone</h4>
      <p><a href="${this.phone}">${this.phone}</a></p>
      `;
  }

  htmlRenderGeneral(currentUserId) {
    return /*html*/`
      <li id="contact${this.id}" class="contactListItem" data-id="${this.id}">
        <div class="contactSmall">
          ${this.profilePic}
        </div>
        <div>
          <p class="fs20">${this.name} ${this.id === currentUserId ? '(you)' : ''}</p>
          <p><a>${this.email}</a></p>
        </div>
      </li>
    `;
  }

}