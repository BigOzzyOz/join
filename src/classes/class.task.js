export default class Task {
    constructor(id, name, description, dueDate, priority, status, category) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.status = status;
        this.category = category;
        this.assignedContacts = [];
        this.currentPrio = 'medium';
        this.currentTaskStatus;
    }
}