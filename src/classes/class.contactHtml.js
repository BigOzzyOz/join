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

    svgProfilePic(color, initials, height, width) {
        return /*html*/`
          <svg class="profilePic" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) / 2 - 5}" stroke="white" stroke-width="3" fill="${color}"/>
            <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="48px">${initials}</text>
          </svg>
        `;
    }
}