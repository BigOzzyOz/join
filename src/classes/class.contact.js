import { ContactHtml as chtml } from "./class.contactHtml.js";

export class Contact {

    constructor(contact) {
        this.id = contact.id;
        this.email = contact.email;
        this.firstLetters = filterFirstLetters(contact.name);
        this.isUser = contact.is_user;
        this.name = contact.name;
        this.profilePic = contact.profile_pic ? contact.profile_pic : generateSvgCircleWithInitials(contact.name);
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

    filterFirstLetters(name) {
        return name.split(' ').map(word => word.charAt(0).toUpperCase()).join('');
    }

    generateSvgCircleWithInitials(name, width = 120, height = 120) {
        const colors = ['#0038FF', '#00BEE8', '#1FD7C1', '#6E52FF', '#9327FF', '#C3FF2B', '#FC71FF', '#FF4646', '#FF5EB3', '#FF745E', '#FF7A00', '#FFA35E', '#FFBB2B', '#FFC701', '#FFE62B'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const initials = name.split(' ').map(word => word[0]).join('').toUpperCase();
        return this.contactHtml.svgProfilePic(randomColor, initials, height, width);
    }
}