import { ContactHtml as chtml } from "./html/class.html-contact.js";

export class Contact {

    constructor(contact) {
        this.id = contact.id;
        this.email = contact.email;
        this.firstLetters = contact.first_letters;
        this.isUser = contact.is_user;
        this.name = contact.name;
        this.profilePic = contact.profile_pic;
        this.phone = contact.number;

        this.contactHtml = new chtml(this.contactObject());
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