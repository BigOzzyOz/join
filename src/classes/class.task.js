import { Subtask } from "./class.subtask.js";
import { Contact } from "./class.contact.js";
import { TaskHtml } from "./html/class.html-task.js";

/**
 * Represents a task in the Kanban board.
 */
export class Task {
    //NOTE Properties

    /** @type {number|null} The unique identifier of the task. */
    id;
    /** @type {string} The title of the task. */
    title;
    /** @type {string} The description of the task. */
    description;
    /** @type {string} The due date of the task (e.g., 'YYYY-MM-DD'). */
    date;
    /** @type {'low'|'medium'|'urgent'} The priority of the task. */
    prio;
    /** @type {'toDo'|'inProgress'|'awaitFeedback'|'done'} The current status (column) of the task. */
    status;
    /** @type {Contact[]} An array of contacts assigned to the task. */
    assignedTo;
    /** @type {string} The category of the task (e.g., 'User Story', 'Technical Task'). */
    category;
    /** @type {Subtask[]} An array of subtasks associated with the task. */
    subtasks;
    /** @type {TaskHtml} Instance for handling HTML generation related to this task. */
    html;

    /**
     * Creates an instance of Task.
     * @param {object} data - The raw task data, typically from an API response.
     * @param {number|null} [data.id] - Task ID.
     * @param {string} [data.title] - Task title.
     * @param {string} [data.description] - Task description.
     * @param {string} [data.date] - Task due date.
     * @param {'low'|'medium'|'urgent'} [data.prio='low'] - Task priority.
     * @param {'toDo'|'inProgress'|'awaitFeedback'|'done'} [data.status='toDo'] - Task status.
     * @param {string} [data.category='User Story'] - Task category.
     * @param {Array<object>} [data.assignedTo] - Array of raw contact data assigned to the task.
     * @param {Array<object>} [data.assigned_to] - Alternative key for assigned contacts.
     * @param {Array<object>} [data.subtasks] - Array of raw subtask data.
     */
    constructor(data) {
        this.id = data.id || null;
        this.title = data.title || '';
        this.description = data.description || '';
        this.date = data.date || '';
        this.prio = data.prio || 'low';
        this.status = data.status || 'toDo';
        this.category = data.category || 'User Story';
        const assignedData = data.assignedTo || data.assigned_to || [];
        this.assignedTo = Array.isArray(assignedData) ? assignedData.map(contact => new Contact(contact)) : [];
        // Ensure subtasks is always an array
        const subtaskData = data.subtasks || [];
        this.subtasks = Array.isArray(subtaskData) ? subtaskData.map(sub => new Subtask(sub)) : [];

        this.html = new TaskHtml(this);
    }

    //NOTE Task Object Methods

    /**
     * Converts the Task instance into a plain JavaScript object representation.
     * Includes nested objects for contacts and subtasks.
     * @returns {object} A plain object representing the task.
     */
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

    /**
     * Converts the Task instance into a plain JavaScript object suitable for uploading (e.g., to an API).
     * Uses 'assigned_to' key and specific subtask upload format. Excludes the 'id'.
     * @returns {object} A plain object representing the task for upload.
     */
    toTaskUploadObject() {
        return {
            title: this.title,
            description: this.description,
            date: this.date,
            prio: this.prio,
            status: this.status,
            assigned_to: this.assignedTo.map(contact => contact.toContactObject()), // Use API expected key
            category: this.category,
            subtasks: this.subtasks.map(sub => sub.toSubtaskUploadObject()),
        };
    }


    //NOTE Board/Move Methods

    /**
     * Updates the status of the task.
     * @param {'toDo'|'inProgress'|'awaitFeedback'|'done'} newStatus - The new status for the task.
     * @returns {boolean} True if the status was changed, false otherwise.
     */
    moveTo(newStatus) {
        if (this.status === newStatus) return false;
        this.status = newStatus;
        return true;
    }



    //FIXME: Doppelte oder nicht benötigte Methoden ggf. hier ans Ende verschieben
}