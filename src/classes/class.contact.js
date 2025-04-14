export class Contact {
    id;
    name;
    email;
    phone;
    isUser;
    initials;
    profilePic;

    constructor(apiData) {
        if (!apiData || typeof apiData !== 'object') {
            throw new Error("Invalid API data provided to Contact constructor.");
        }
        this.id = apiData.id;
        this.name = apiData.name || 'Unknown';
        this.email = apiData.email || '';
        this.phone = apiData.number || '';
        this.isUser = apiData.is_user || false;
        this.initials = apiData.first_letters || '??';
        this.profilePic = apiData.profile_pic || '<div class="profilePicSvg placeholder"></div>';
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