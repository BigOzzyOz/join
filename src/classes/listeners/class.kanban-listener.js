//NOTE - Imports
import { LoginListener } from './class.listener-login.js';
import { RegisterListener } from './class.listener-register.js';
import { SummaryListener } from './class.listener-summary.js';
import { AddTaskListener } from './class.listener-add-task.js';
import { BoardListener } from './class.listener-board.js';
import { ContactsListener } from './class.listener-contacts.js';
import { MenuListener } from './class.listener-menu.js';
import { Login } from '../class.login.js';
import { Register } from '../class.register.js';
import { Summary } from '../class.summary.js';
import { AddTask } from '../class.add-task.js';
import { Board } from '../class.board.js';
import { ContactsPage } from '../class.contacts-page.js';

/**
 * Handles initialization and lifecycle of all page listeners for the Kanban app.
 */
export class KanbanListener {
    //NOTE - Properties
    /** @type {object} LoginListener instance. */
    login;
    /** @type {object} RegisterListener instance. */
    register;
    /** @type {object} SummaryListener instance. */
    summary;
    /** @type {object} AddTaskListener instance. */
    addTask;
    /** @type {object} BoardListener instance. */
    board;
    /** @type {object} ContactsListener instance. */
    contacts;
    /** @type {object} MenuListener instance. */
    menu;
    /** @type {object} Kanban app instance. */
    kanban;

    //NOTE - Constructor & Initialization
    /**
     * Creates a KanbanListener instance and activates listeners for the current page.
     * @param {object} kanban - Kanban app instance
     */
    constructor(kanban) {
        this.kanban = kanban;
        this.menu = new MenuListener(this.kanban);
        this.activateListenersBasedOnPath();
    }

    //NOTE - Listener Lifecycle Management
    /**
     * Activates listeners based on the current page path.
     * @returns {void}
     */
    activateListenersBasedOnPath = () => {
        const path = window.location.pathname;
        switch (true) {
            case path.includes('index.html') || path === '/':
                if (!this.kanban.login) this.kanban.login = new Login(this.kanban);
                this.login = new LoginListener(this.kanban);
                break;
            case path.includes('register.html'):
                if (!this.kanban.register) this.kanban.register = new Register(this.kanban);
                this.register = new RegisterListener(this.kanban);
                break;
            case path.includes('summary.html'):
                if (!this.kanban.summary) this.kanban.summary = new Summary(this.kanban);
                this.summary = new SummaryListener(this.kanban);
                break;
            case path.includes('addtask.html'):
                setTimeout(() => this.addTask = new AddTaskListener(this.kanban), 500);
                break;
            case path.includes('board.html'):
                this.board = new BoardListener(this.kanban);
                break;
            case path.includes('contacts.html'):
                if (!this.kanban.contactsPage) this.kanban.contactsPage = new ContactsPage(this.kanban);
                this.contacts = new ContactsListener(this.kanban);
                break;
            default:
                this._logWarn('No specific page listener activated for this path: ' + path);
                break;
        }
    };

    /**
     * Deactivates all listeners for all pages.
     * @returns {void}
     */
    deactivateListeners = () => {
        this.login?.deactivateAllListenersLogin();
        this.register?.deactivateAllListenersRegister();
        this.summary?.deactivateAllListenersSummary();
        this.addTask?.deactivateAllListenersAddTask();
        this.board?.deactivateAllListenersBoard();
        this.contacts?.deactivateAllListenersContacts();
        this.menu?.deactivateListenersMenu();
    };

    //NOTE - Error/Warning Helpers
    /**
     * Logs a warning message.
     * @param {string} msg
     * @returns {void}
     */
    _logWarn(msg) { console.warn(msg); }

    /**
     * Logs an error message.
     * @param {string} msg
     * @returns {void}
     */
    _logError(msg) { console.error(msg); }
}
