export class ContactHtml {
  //NOTE - Properties

  contact;

  //NOTE - Constructor & Initialization

  constructor(contact) {
    this.contact = contact;
  }

  //NOTE - HTML Rendering Methods

  htmlRenderContactDetails() {
    const safeName = this.contact.name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeEmail = this.contact.email.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safePhone = this.contact.phone.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const mailtoLink = this.contact.email ? `mailto:${encodeURIComponent(this.contact.email)}` : '#';
    const telLink = this.contact.phone ? `tel:${encodeURIComponent(this.contact.phone)}` : '#';

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
          ${this.contact.profilePic || `<div class="initials-placeholder">${this.contact.firstLetters}</div>`}
        </div>
        <div>
          <h2>${safeName}</h2>
          <div id="editMenu" class="editMenu ts0">
            <div id="editContactBtn" class="editMenuItem" data-id="${this.contact.id}">
              <img class="editMenuButton" src="../assets/icons/edit.svg" alt="Edit">
              <img class="editMenuButton hoverEffectIcon" src="../assets/icons/editBlue.svg" alt="">
              <p>Edit</p>
            </div>
            <div id="deleteContactBtn" class="editMenuItem" data-id="${this.contact.id}">
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
    const safeName = this.contact.name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeEmail = this.contact.email.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const mailtoLink = this.contact.email ? `mailto:${encodeURIComponent(this.contact.email)}` : '#';

    return /*html*/ `
      <li id="contact${this.contact.id}" class="contactListItem" data-id="${this.contact.id}">
        <div class="contactSmall">
          ${this.contact.profilePic || `<div class="initials-placeholder">${this.contact.firstLetters}</div>`}
        </div>
        <div>
          <p class="fs20">${safeName} ${this.contact.id === currentUserId ? '(you)' : ''}</p>
          <p><a>${safeEmail || 'No email provided'}</a></p>
        </div>
      </li>
    `;
  }

  htmlRenderContactsAssign(assignedContacts) {
    const safeName = this.contact.name.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    return /*html*/`
      <label for="contact${this.contact.id}" class="${assignedContacts.some(c => c.name === this.contact.name) ? 'contactsToAssignCheck' : ''}">
        ${this.contact.profilePic}
        <p>${safeName}</p>
        <input class="assignContactToProject" 
          data-id="${this.contact.id}" 
          type="checkbox" 
          id="contact${this.contact.id}"  
          ${assignedContacts.some(c => c.name == this.contact.name) ? 'checked' : ''}>
        <span class="checkMark"></span>
      </label>
      `;
  }
}