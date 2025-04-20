import { Subtask } from "./class.subtask.js";
import { Contact } from "./class.contact.js";
import { TaskHtml } from "./html/class.html-task.js";

export class Task {
    //NOTE Properties

    id;
    title;
    description;
    date;
    prio;
    status;
    assignedTo;
    category;
    subtasks;
    html;

    constructor(data) {
        this.id = data.id || null;
        this.title = data.title || '';
        this.description = data.description || '';
        this.date = data.date || '';
        this.prio = data.prio || 'low';
        this.status = data.status || 'toDo';
        this.category = data.category || 'User Story';
        this.assignedTo = data.assignedTo || data.assigned_to || [];
        this.assignedTo = this.assignedTo.map(contact => new Contact(contact));
        if (data.subtasks && data.subtasks.length > 0) {
            this.subtasks = data.subtasks.map(sub => new Subtask(sub));
        } else {
            this.subtasks = [];
        }

        this.html = new TaskHtml(this);
    }

    //NOTE Task Object Methods

    toTaskObject() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            date: this.date,
            prio: this.prio,
            status: this.status,
            assignedTo: this.assignedTo.map(contact => contact.toContactObject()),
            category: this.category,
            subtasks: this.subtasks.map(sub => sub.toSubtaskObject()),
        };
    }

    toTaskUploadObject() {
        return {
            title: this.title,
            description: this.description,
            date: this.date,
            prio: this.prio,
            status: this.status,
            assigned_to: this.assignedTo.map(contact => contact.toContactObject()),
            category: this.category,
            subtasks: this.subtasks.map(sub => sub.toSubtaskUploadObject()),
        };
    }


    //NOTE Board/Move Methods

    moveTo(newStatus) {
        if (this.status === newStatus) return false;
        this.status = newStatus;
        return true;
    }



    //FIXME: Doppelte oder nicht benötigte Methoden ggf. hier ans Ende verschieben
}