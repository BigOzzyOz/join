import { SubtaskHtml } from './html/class.html-subtask.js';

export class Subtask {
    //NOTE - Properties
    id;
    text;
    status;
    html;

    //NOTE - Constructor
    constructor(data) {
        this.id = data.id || null;
        this.text = data.text || '';
        this.status = data.status || 'unchecked';
        this.html = new SubtaskHtml(this.toSubtaskObject());
    }

    toSubtaskObject() {
        return {
            id: this.id,
            text: this.text,
            status: this.status,
        };
    }

    toSubtaskUpdateObject() {
        return {
            text: this.text,
            status: this.status,
        };
    }
}
