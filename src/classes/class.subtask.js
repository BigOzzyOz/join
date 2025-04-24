import { SubtaskHtml } from "./html/class.html-subtask.js";

/**
 * Represents a subtask associated with a main task.
 */
export class Subtask {
    //NOTE Properties

    /** @type {string} Subtask text. */
    text;
    /** @type {'checked'|'unchecked'} Status. */
    status;
    /** @type {SubtaskHtml} HTML handler. */
    html;

    /**
     * Creates a Subtask instance from data.
     * @param {object} data Raw subtask data
     */
    constructor(data) {
        this.text = data.text || '';
        this.status = data.status || 'unchecked';
        this.html = new SubtaskHtml(this);
    }

    //NOTE Subtask Object Methods

    /**
     * Returns plain object of the subtask.
     * @returns {{text: string, status: 'checked'|'unchecked'}}
     */
    toSubtaskObject() {
        return {
            text: this.text,
            status: this.status,
        };
    }

    /**
     * Returns plain object for upload.
     * @returns {{text: string, status: 'checked'|'unchecked'}}
     */
    toSubtaskUploadObject() {
        return {
            text: this.text,
            status: this.status,
        };
    }

    /**
     * Toggles status and updates HTML.
     * @param {number} index
     */
    updateSubtaskStatus(index) {
        this.status = this.status === "checked" ? "unchecked" : "checked";
        this.html.updateSubtaskStatus(this.status, index);
    }

    //FIXME: Doppelte oder nicht benötigte Methoden ggf. hier ans Ende verschieben
}