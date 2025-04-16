import { TaskHtml } from './html/class.html-task.js';

export class Task {

    id;
    title;
    description;
    category;
    date;
    prio;
    status;
    assignedTo;
    subtasks;
    html;
    constructor(data) {
        this.id = data.id || null;
        this.title = data.title || '';
        this.description = data.description || '';
        this.category = data.category || '';
        this.date = data.date || null;
        this.prio = data.prio || 'medium';
        this.status = data.status || 'toDo';
        this.assignedTo = data.assignedTo || [];
        this.subtasks = data.subtasks || [];

        this.html = new TaskHtml(this.taskObject());
    }

    taskObject() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            category: this.category,
            date: this.date,
            prio: this.prio,
            status: this.status,
            assignedTo: this.assignedTo,
            subtasks: this.subtasks
        };
    }

    uploadTaskObject() {
        return {
            ...(this.id > 0 && { id: this.id }),
            title: this.title,
            description: this.description,
            category: this.category,
            date: this.date,
            prio: this.prio,
            status: this.status,
            assignedTo: this.assignedTo,
            subtasks: this.subtasks
        };
    }


};