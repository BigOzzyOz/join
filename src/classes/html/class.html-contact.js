export class ContactHtml {


  renderListItem(contact, isCurrentUser = false) {
    if (!contact) return '';
    return /*html*/`
            <li id="contact${contact.id}" class="contactListItem" data-id="${contact.id}">
                <div class="contactSmall">
                    ${contact.profilePic}
                </div>
                <div>
                    <p class="fs20">${contact.name} ${isCurrentUser ? '(you)' : ''}</p>
                    <p><a href="mailto:${contact.email}">${contact.email}</a></p>
                </div>
            </li>
        `;
  }


  renderDetailView(contact) {
    if (!contact) return '';

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
                     ${contact.profilePic}
                </div>
                <div>
                    <h2>${contact.name}</h2>
                    <div id="editMenu" class="editMenu ts0">
                        <div id="editContactBtn" class="editMenuItem" data-id="${contact.id}">
                            <img class="editMenuButton" src="../assets/icons/edit.svg" alt="pencil">
                            <img class="editMenuButton hoverEffectIcon" src="../assets/icons/editBlue.svg" alt="blue pencil">
                            <p>Edit</p>
                        </div>
                        <div id="deleteContactBtn" class="editMenuItem" data-id="${contact.id}">
                            <img class="editMenuButton" src="../assets/icons/delete.svg" alt="trashcan">
                            <img class="editMenuButton hoverEffectIcon" src="../assets/icons/deleteBlue.svg" alt="blue trashcan">
                            <p>Delete</p>
                        </div>
                    </div>
                </div>
            </div>
            <p class="fs20">Contact Information</p>
            <h4>Email</h4>
            <p><a href="mailto:${contact.email}">${contact.email}</a></p>
            <h4>Phone</h4>
            <p><a href="tel:${contact.phone}">${contact.phone}</a></p>
        `;
  }


  renderDetailViewEmpty() {
    return /*html*/`
            <div id="contactsDetail" class="ttx100">
                <div class="contactsHeader">
                    <h1>Contacts</h1>
                    <p class="bordered fs20">Better with a Team</p>
                </div>
            </div>
        `;
  }
}
