import { Subtask } from "./class.subtask.js";
import { Contact } from "./class.contact.js";
import { TaskHtml } from "./html/class.html-task.js";

/**
 * Represents a task in the Kanban board.
 */
export class Task {
    //NOTE Properties

    /** @type {number|null} Task ID. */
    id;
    /** @type {string} Task title. */
    title;
    /** @type {string} Task description. */
    description;
    /** @type {string} Due date. */
    date;
    /** @type {'low'|'medium'|'urgent'} Priority. */
    prio;
    /** @type {'toDo'|'inProgress'|'awaitFeedback'|'done'} Status. */
    status;
    /** @type {Contact[]} Assigned contacts. */
    assignedTo;
    /** @type {string} Task category. */
    category;
    /** @type {Subtask[]} Subtasks. */
    subtasks;
    /** @type {TaskHtml} HTML handler. */
    html;

    /**
     * Creates a Task instance from data.
     * @param {object} data Raw task data
     */
    constructor(data) {
        this.id = data.id || null;
        this.title = data.title || '';
        this.description = data.description || '';
        this.date = data.date || '';
        this.prio = data.prio || 'low';
        this.status = data.status || 'toDo';
        this.category = data.category || 'User Story';
        this.assignedTo = this._parseContacts(data.assignedTo || data.assigned_to || []);
        this.subtasks = this._parseSubtasks(data.subtasks || []);
        this.html = new TaskHtml(this);
    }

    //NOTE Helpers

    /**
     * Converts raw contact data to Contact instances.
     * @param {Array<object>} contacts
     * @returns {Contact[]}
     */
    _parseContacts(contacts) {
        return Array.isArray(contacts) ? contacts.map(c => new Contact(c)) : [];
    }

    /**
     * Converts raw subtask data to Subtask instances.
     * @param {Array<object>} subtasks
     * @returns {Subtask[]}
     */
    _parseSubtasks(subtasks) {
        return Array.isArray(subtasks) ? subtasks.map(s => new Subtask(s)) : [];
    }

    //NOTE Task Object Methods

    /**
     * Returns plain object of the task.
     * @returns {object}
     */
    toTaskObject() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            date: this.date,
            prio: this.prio,
            status: this.status,
            assignedTo: this._contactsToObject(),
            category: this.category,
            subtasks: this._subtasksToObject(),
        };
    }

    /**
     * Returns plain object for upload (no id, API keys).
     * @returns {object}
     */
    toTaskUploadObject() {
        return {
            title: this.title,
            description: this.description,
            date: this.date,
            prio: this.prio,
            status: this.status,
            assigned_to: this._contactsToObject(),
            category: this.category,
            subtasks: this._subtasksToUploadObject(),
        };
    }

    /**
     * Converts assigned contacts to plain objects.
     * @returns {object[]}
     */
    _contactsToObject() {
        return this.assignedTo.map(c => c.toContactObject());
    }

    /**
     * Converts subtasks to plain objects.
     * @returns {object[]}
     */
    _subtasksToObject() {
        return this.subtasks.map(s => s.toSubtaskObject());
    }

    /**
     * Converts subtasks to upload objects.
     * @returns {object[]}
     */
    _subtasksToUploadObject() {
        return this.subtasks.map(s => s.toSubtaskUploadObject());
    }

    //NOTE Board/Move Methods

    /**
     * Updates the status of the task.
     * @param {'toDo'|'inProgress'|'awaitFeedback'|'done'} newStatus
     * @returns {boolean}
     */
    moveTo(newStatus) {
        if (!this._isValidStatus(newStatus)) throw new Error('Invalid status');
        if (this.status === newStatus) return false;
        this.status = newStatus;
        return true;
    }

    /**
     * Checks if status is valid.
     * @param {string} status
     * @returns {boolean}
     */
    _isValidStatus(status) {
        return ['toDo','inProgress','awaitFeedback','done'].includes(status);
    }
}