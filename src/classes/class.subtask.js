import { SubtaskHtml } from "./html/class.html-subtask.js";

/**
 * Represents a subtask associated with a main task.
 */
export class Subtask {
    //NOTE Properties

    /** @type {string} The description or text of the subtask. */
    text;
    /** @type {'checked'|'unchecked'} The completion status of the subtask. */
    status;
    /** @type {SubtaskHtml} Instance for handling HTML generation related to this subtask. */
    html;

    /**
     * Creates an instance of Subtask.
     * @param {object} data - The raw subtask data.
     * @param {string} [data.text] - The text content of the subtask.
     * @param {'checked'|'unchecked'} [data.status='unchecked'] - The initial status of the subtask.
     */
    constructor(data) {
        this.text = data.text || '';
        this.status = data.status || 'unchecked';
        this.html = new SubtaskHtml(this);
    }

    //NOTE Subtask Object Methods

    /**
     * Converts the Subtask instance into a plain JavaScript object representation.
     * @returns {{text: string, status: 'checked'|'unchecked'}} A plain object representing the subtask.
     */
    toSubtaskObject() {
        return {
            text: this.text,
            status: this.status,
        };
    }

    /**
     * Converts the Subtask instance into a plain JavaScript object suitable for uploading (e.g., to an API).
     * @returns {{text: string, status: 'checked'|'unchecked'}} A plain object representing the subtask for upload.
     */
    toSubtaskUploadObject() {
        return {
            text: this.text,
            status: this.status,
        };
    }

    /**
     * Toggles the status of the subtask ('checked'/'unchecked') and updates its HTML representation.
     * @param {number} index - The index of the subtask in its list (used for HTML updates).
     */
    updateSubtaskStatus(index) {
        this.status = this.status === "checked" ? "unchecked" : "checked";
        this.html.updateSubtaskStatus(this.status, index);
    }

    //FIXME: Doppelte oder nicht benötigte Methoden ggf. hier ans Ende verschieben
}