import { LoginListener } from './class.listener-login.js';
import { RegisterListener } from './class.listener-register.js';
import { SummaryListener } from './class.listener-summary.js';
import { AddTaskListener } from './class.listener-addtask.js';
import { BoardListener } from './class.listener-board.js';
import { ContactsListener } from './class.listener-contacts.js';
import { MenuListener } from './class.listener-menu.js';

export class KanbanListener {
    login;
    register;
    summary;
    addTask;
    board;
    contacts;

    constructor(kanban) {
        this.kanban = kanban;
        this.activateListenersBasedOnPath();
        this.menu = new MenuListener(this.kanban);
    }

    activateListenersBasedOnPath() {
        const path = window.location.pathname;

        switch (true) {
            case path.includes('index.html') || path === '/':
                this.login = new LoginListener(this.kanban);
                break;
            case path.includes('register.html'):
                this.register = new RegisterListener(this.kanban);
                break;
            case path.includes('summary.html'):
                this.summary = new SummaryListener(this.kanban);
                break;
            case path.includes('addtask.html'):
                this.addTask = new AddTaskListener(this.kanban);
                break;
            case path.includes('board.html'):
                this.board = new BoardListener(this.kanban);
                break;
            case path.includes('contacts.html'):
                this.contacts = new ContactsListener(this.kanban);
                break;
            default:
                console.error('No matching path for listener activation');
                break;
        }
    }

    deactivateListeners() {
        this.login?.deactivateAllListenersLogin();
        this.register?.deactivateAllListenersRegister();
        this.summary?.deactivateAllListenersSummary();
        this.board?.deactivateAllListenersBoard();
        this.contacts?.deactivateAllListenersContacts();
        this.menu?.deactivateListenersMenu();
    }

    forwardRegister() {
        window.location.href = 'html/register.html';
    }


    forwardLegal() {
        sessionStorage.setItem('activeTab', "legal notice");
    }


    forwardPrivacy() {
        sessionStorage.setItem('activeTab', "privacy policy");
    }

    forwardToIndex() {
        window.location.href = '../index.html';
    }


}
