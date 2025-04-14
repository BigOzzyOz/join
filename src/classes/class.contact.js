export class Contact {
    id;
    name;
    email;
    phone;
    isUser;
    initials;
    profilePic;

    constructor(contact) {
        this.id = contact.id;
        this.email = contact.email;
        this.firstLetters = contact.first_letters;
        this.isUser = contact.is_user;
        this.name = contact.name;
        this.profilePic = contact.profile_pic;
        this.phone = contact.number;

        this.contactHtml = new thtml(this.contactObject());
    }

    toObject() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            phone: this.phone,
            isUser: this.isUser,
            initials: this.initials,
            profilePic: this.profilePic
        };
    }

    toApiObject() {
        return {
            name: this.name,
            email: this.email,
            number: this.phone,
            is_user: this.isUser,
        };
    }
}