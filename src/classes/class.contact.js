import { ContactHtml } from "./html/class.html-contact.js";

/**
 * Represents a contact, which can be a user or an external contact.
 */
export class Contact {
    //NOTE - Properties
    /** @type {ContactHtml|null} HTML handler. */
    html = null;
    /** @type {number} Contact ID. */
    id;
    /** @type {string} Contact email. */
    email;
    /** @type {string} Contact initials. */
    firstLetters;
    /** @type {boolean} Is user. */
    isUser;
    /** @type {string} Contact name. */
    name;
    /** @type {string} Profile picture URL. */
    profilePic;
    /** @type {string} Contact phone. */
    phone;

    //NOTE - Constructor & Initialization
    /**
     * Creates a Contact instance.
     * @param {object} contact Raw contact data
     * @param {number} [contact.id]
     * @param {string} [contact.email]
     * @param {string} [contact.first_letters]
     * @param {string} [contact.firstLetters]
     * @param {boolean} [contact.is_user]
     * @param {boolean} [contact.isUser]
     * @param {string} [contact.name]
     * @param {string} [contact.profile_pic]
     * @param {string} [contact.profilePic]
     * @param {string} [contact.number]
     * @param {string} [contact.phone]
     */
    constructor(contact) {
        this.id = contact.id || -1;
        this.email = contact.email || '';
        this.firstLetters = contact.first_letters || contact.firstLetters || contact.name?.charAt(0).toUpperCase() || '';
        this.isUser = contact.is_user || contact.isUser || false;
        this.name = contact.name || '';
        this.profilePic = contact.profile_pic || contact.profilePic || '';
        this.phone = contact.number || contact.phone || '';
        this.html = new ContactHtml(this);
    }

    //NOTE - Data Representation Methods
    /**
     * Returns plain object of the contact.
     * @returns {object} Contact object
     */
    toContactObject() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            phone: this.phone,
            firstLetters: this.firstLetters,
            isUser: this.isUser,
            profilePic: this.profilePic,
        };
    }

    /**
     * Returns plain object for upload (API keys).
     * @returns {object} Contact upload object
     */
    toContactUploadObject() {
        return {
            ...(this.id !== -1 && { id: this.id }),
            name: this.name,
            email: this.email,
            number: this.phone,
            first_letters: this.firstLetters,
            is_user: this.isUser,
            profile_pic: this.profilePic,
        };
    }

    //NOTE - Error Handling
    /**
     * Logs an error message.
     * @param {string} msg
     * @returns {void}
     */
    _logError(msg) { console.error(msg); }
}