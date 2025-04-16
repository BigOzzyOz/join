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
import { AddTask } from '../addtask/class.addtask.js';
import { Board } from '../board/class.board.js';
import { ContactsPage } from '../class.contacts-page.js';

export class KanbanListener {
    //NOTE - Properties
    login;
    register;
    summary;
    addTask;
    board;
    contacts;
    menu;

    //NOTE - Constructor & Initialization
    constructor(kanban) {
        this.kanban = kanban;
        this.menu = new MenuListener(this.kanban);
        this.activateListenersBasedOnPath();
    }

    //NOTE - Listener Lifecycle Management
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
                if (!this.kanban.contacts) this.kanban.contacts = new ContactsPage(this.kanban);
                this.contacts = new ContactsListener(this.kanban);
                break;
            default:
                console.warn('No specific page listener activated for this path:', path);
                break;
        }
    };

    deactivateListeners = () => {
        this.login?.deactivateAllListenersLogin();
        this.register?.deactivateAllListenersRegister();
        this.summary?.deactivateAllListenersSummary();
        this.addTask?.deactivateAllListenersAddTask();
        this.board?.deactivateAllListenersBoard();
        this.contacts?.deactivateAllListenersContacts();
        this.menu?.deactivateListenersMenu();
    };
}
