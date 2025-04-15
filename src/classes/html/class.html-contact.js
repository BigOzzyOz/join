export class ContactHtml {
  //NOTE - Properties

  id;
  email;
  firstLetters;
  isUser;
  name;
  profilePic;
  phone;

  //NOTE - Constructor & Initialization

  constructor(contact) {
    this.id = contact.id;
    this.email = contact.email;
    this.firstLetters = contact.firstLetters;
    this.isUser = contact.isUser;
    this.name = contact.name;
    this.profilePic = contact.profilePic;
    this.phone = contact.phone;
  }

  //NOTE - HTML Rendering Methods

  htmlRenderContactDetails() {
    const safeName = this.name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeEmail = this.email.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safePhone = this.phone.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const mailtoLink = this.email ? `mailto:${encodeURIComponent(this.email)}` : '#';
    const telLink = this.phone ? `tel:${encodeURIComponent(this.phone)}` : '#';

    return /*html*/ `
      <div id="contactsDetailMore" class="moreIcon">
        <img src="../assets/icons/more_vert.svg" alt="More options">
      </div>
      <a id="backArrow-contacts" class="backArrow">
        <img src="../assets/icons/arrow-left-line.svg" alt="Back">
      </a>
      <div class="contactsHeader">
        <h1>Contacts</h1>
        <p class="bordered fs20">Better with a Team</p>
      </div>
      <div class="contactOverview">
        <div class="contactBig">
          ${this.profilePic || `<div class="initials-placeholder">${this.firstLetters}</div>`}
        </div>
        <div>
          <h2>${safeName}</h2>
          <div id="editMenu" class="editMenu ts0">
            <div id="editContactBtn" class="editMenuItem" data-id="${this.id}">
              <img class="editMenuButton" src="../assets/icons/edit.svg" alt="Edit">
              <img class="editMenuButton hoverEffectIcon" src="../assets/icons/editBlue.svg" alt="">
              <p>Edit</p>
            </div>
            <div id="deleteContactBtn" class="editMenuItem" data-id="${this.id}">
              <img class="editMenuButton" src="../assets/icons/delete.svg" alt="Delete">
              <img class="editMenuButton hoverEffectIcon" src="../assets/icons/deleteBlue.svg" alt="">
              <p>Delete</p>
            </div>
          </div>
        </div>
      </div>
      <p class="fs20">Contact Information</p>
      <h4>Email</h4>
      <p><a href="${mailtoLink}">${safeEmail || 'No email provided'}</a></p>
      <h4>Phone</h4>
      <p><a href="${telLink}">${safePhone || 'No phone provided'}</a></p>
      `;
  }

  htmlRenderGeneral(currentUserId) {
    const safeName = this.name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeEmail = this.email.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const mailtoLink = this.email ? `mailto:${encodeURIComponent(this.email)}` : '#';

    return /*html*/ `
      <li id="contact${this.id}" class="contactListItem" data-id="${this.id}">
        <div class="contactSmall">
          ${this.profilePic || `<div class="initials-placeholder">${this.firstLetters}</div>`}
        </div>
        <div>
          <p class="fs20">${safeName} ${this.id === currentUserId ? '(you)' : ''}</p>
          <p><a>${safeEmail || 'No email provided'}</a></p>
        </div>
      </li>
    `;
  }
}