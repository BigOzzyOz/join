import { ContactHtml } from "./html/class.html-contact.js";

export class Contact {
    html = null;

    constructor(contact) {
        this.id = contact.id || -1;
        this.email = contact.email || '';
        this.firstLetters = contact.first_letters || contact.name.charAt(0).toUpperCase();
        this.isUser = contact.is_user || false;
        this.name = contact.name || '';
        this.profilePic = contact.profile_pic || '';
        this.phone = contact.number || 'Add phone number';

        this.html = new ContactHtml(this.contactObject());
    }

    contactObject() {
        return {
            'id': this.id,
            'name': this.name,
            'email': this.email,
            'number': this.phone,
            'firstLetters': this.firstLetters,
            'isUser': this.isUser,
            'profilePic': this.profilePic,
        };
    }

    uploadContactObject() {
        return {
            ...(this.id && { 'id': this.id }),
            'name': this.name,
            'email': this.email,
            'number': this.phone,
            'first_letters': this.firstLetters,
            'is_user': this.isUser,
            'profile_pic': this.profilePic,
        };
    }

}