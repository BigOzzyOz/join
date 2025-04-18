import { ContactHtml } from "./html/class.html-contact.js";

export class Contact {
    //NOTE - Properties

    html = null;
    id;
    email;
    firstLetters;
    isUser;
    name;
    profilePic;
    phone;

    //NOTE - Constructor & Initialization

    constructor(contact) {
        this.id = contact.id || -1;
        this.email = contact.email || '';
        this.firstLetters = contact.first_letters || contact.firstLetters || contact.name?.charAt(0).toUpperCase() || '';
        this.isUser = contact.is_user || contact.isUser || false;
        this.name = contact.name || '';
        this.profilePic = contact.profile_pic || contact.profilePic || '';
        this.phone = contact.number || contact.phone || '';

        this.html = new ContactHtml(this.toContactObject());
    }

    //NOTE - Data Representation Methods

    toContactObject() {
        return {
            'id': this.id,
            'name': this.name,
            'email': this.email,
            'phone': this.phone,
            'firstLetters': this.firstLetters,
            'isUser': this.isUser,
            'profilePic': this.profilePic,
        };
    }

    toContactUploadObject() {
        return {
            ...(this.id > 0 && { 'id': this.id }),
            'name': this.name,
            'email': this.email,
            'number': this.phone,
            'first_letters': this.firstLetters,
            'is_user': this.isUser,
            'profile_pic': this.profilePic,
        };
    }
}