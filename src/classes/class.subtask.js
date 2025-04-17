import { SubtaskHtml } from "./html/class.html-subtask.js";

export class Subtask {
    //NOTE Properties

    text;
    status;
    html;

    constructor(data) {
        this.text = data.text || '';
        this.status = data.status || 'unchecked';
        this.html = new SubtaskHtml(this.toSubtaskObject());
    }

    //NOTE Subtask Object Methods

    toSubtaskObject() {
        return {
            text: this.text,
            status: this.status,
        };
    }

    toSubtaskUploadObject() {
        return {
            text: this.text,
            status: this.status,
        };
    }

    //FIXME: Doppelte oder nicht benötigte Methoden ggf. hier ans Ende verschieben
}