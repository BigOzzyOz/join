import { SubtaskHtml } from "./html/class.html-subtask.js";

export class Subtask {
    constructor(data) {
        this.text = data.text || '';
        this.status = data.status || 'unchecked';
        this.html = new SubtaskHtml(this.toSubtaskObject());
    }

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
}