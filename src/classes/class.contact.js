import { ContactHtml } from "./html/class.html-contact.js";

/**
 * Represents a contact, which can be a user or an external contact.
 */
export class Contact {
    //NOTE - Properties

    /** @type {ContactHtml|null} Instance for handling HTML generation related to this contact. */
    html = null;
    /** @type {number} The unique identifier of the contact. Defaults to -1 if not provided. */
    id;
    /** @type {string} The email address of the contact. */
    email;
    /** @type {string} The first letters (initials) of the contact's name. */
    firstLetters;
    /** @type {boolean} Indicates if the contact represents the logged-in user. */
    isUser;
    /** @type {string} The full name of the contact. */
    name;
    /** @type {string} The URL or path to the contact's profile picture. */
    profilePic;
    /** @type {string} The phone number of the contact. */
    phone;

    //NOTE - Constructor & Initialization

    /**
     * Creates an instance of Contact.
     * Handles different potential property names from API responses (e.g., 'first_letters' vs 'firstLetters').
     * @param {object} contact - The raw contact data, typically from an API response.
     * @param {number} [contact.id] - Contact ID.
     * @param {string} [contact.email] - Contact email.
     * @param {string} [contact.first_letters] - Contact initials (alternative key).
     * @param {string} [contact.firstLetters] - Contact initials.
     * @param {boolean} [contact.is_user] - Is user flag (alternative key).
     * @param {boolean} [contact.isUser] - Is user flag.
     * @param {string} [contact.name] - Contact name.
     * @param {string} [contact.profile_pic] - Profile picture URL (alternative key).
     * @param {string} [contact.profilePic] - Profile picture URL.
     * @param {string} [contact.number] - Phone number (alternative key).
     * @param {string} [contact.phone] - Phone number.
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
     * Converts the Contact instance into a plain JavaScript object representation using standard property names.
     * @returns {object} A plain object representing the contact.
     * @property {number} id - Contact ID.
     * @property {string} name - Contact name.
     * @property {string} email - Contact email.
     * @property {string} phone - Contact phone number.
     * @property {string} firstLetters - Contact initials.
     * @property {boolean} isUser - Is user flag.
     * @property {string} profilePic - Profile picture URL.
     */
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

    /**
     * Converts the Contact instance into a plain JavaScript object suitable for uploading (e.g., to an API).
     * Uses API-specific keys (e.g., 'number', 'first_letters') and conditionally includes the 'id' only if it's not -1.
     * @returns {object} A plain object representing the contact for upload.
     * @property {number} [id] - Contact ID (only included if not -1).
     * @property {string} name - Contact name.
     * @property {string} email - Contact email.
     * @property {string} number - Contact phone number (API key).
     * @property {string} first_letters - Contact initials (API key).
     * @property {boolean} is_user - Is user flag (API key).
     * @property {string} profile_pic - Profile picture URL (API key).
     */
    toContactUploadObject() {
        return {
            ...(this.id !== -1 && { 'id': this.id }),
            'name': this.name,
            'email': this.email,
            'number': this.phone, // API uses 'number'
            'first_letters': this.firstLetters, // API uses 'first_letters'
            'is_user': this.isUser, // API uses 'is_user'
            'profile_pic': this.profilePic, // API uses 'profile_pic'
        };
    }
}