import { Board } from "./class.Board.js";
import { Database } from "./class.database.js";
import { KanbanListener } from "./listeners/class.kanban-listener.js";
import { Login } from './class.login.js';
import { Register } from './class.register.js';
import { Summary } from './class.summary.js';
import { Contact } from "./class.contact.js";
// import { AddTask } from './class.addtask.js'; // Assuming AddTask class exists
// import { Contacts } from './class.contacts.js'; // Assuming Contacts class exists


export class Kanban {
    currentUserStorage = JSON.parse(localStorage.getItem('currentUser')) || JSON.parse(sessionStorage.getItem('currentUser')) || null;
    currentUser;
    activeTab = sessionStorage.getItem('activeTab') || '';
    contactsStorage = JSON.parse(sessionStorage.getItem('contact')) || [];
    contacts;
    tasksStorage = JSON.parse(sessionStorage.getItem('tasks')) || [];
    tasks;
    path = window.location.pathname;
    noUserContentPaths = [
        '/index.html',
        '/register.html',
    ];
    db = null;
    listener = null;
    board = null;
    login = null;
    register = null;
    summary = null;
    addTask = null;


    constructor() {
        if (this.noUserContentPaths.some((usedPath) => this.path.includes(usedPath)) || this.path === '/') sessionStorage.clear();
        this.currentUser = new Contact(this.currentUserStorage);
        this.contacts = this.contactsStorage.map(contact => new Contact(contact));
        this.tasks = this.tasksStorage.map(task => new Task(task));
    }

    async _asyncInit() {
        this.db = new Database(this);
        await this.db.checkAuthStatus();
        this.listener = new KanbanListener(this);
    }

    static async createInstance() {
        const instance = new Kanban();
        await instance._asyncInit();
        return instance;
    }

    async init() {
        await this.includeHTML();
        this.setActive();
        this.checkAndShowOrHideContent();
        if (!sessionStorage.getItem('taskCategory')) sessionStorage.setItem('taskCategory', 'toDo');
        document.getElementById('backArrow')?.addEventListener('click', () => { window.history.back(); });
    }


    async includeHTML() {
        const elementsToInclude = document.querySelectorAll('[w3-include-html]');
        for (const element of elementsToInclude) {
            const filePath = element.getAttribute('w3-include-html');
            try {
                const response = await fetch(filePath);
                element.innerHTML = response.ok ? await response.text() : 'Page not found';
            } catch {
                element.innerHTML = 'Page not found';
            }
        }
    }


    changeActive = (link) => {
        let linkBtn = document.querySelectorAll(".menuBtn");
        linkBtn.forEach(btn => btn.classList.remove("menuBtnActive"));
        this.activeTab = link.innerText.toLowerCase();
        sessionStorage.setItem("activeTab", this.activeTab);
        this.setActive();
    };


    setActive = (link = null) => {
        const menuButtons = document.querySelectorAll(".menuBtn");
        menuButtons.forEach(button => button.classList.remove("menuBtnActive"));

        let targetButton = null;

        if (link) {
            targetButton = document.querySelector(link);
        } else {
            const currentPage = document.querySelector('main')?.getAttribute('data-page')?.toLowerCase();
            const activeTabName = this.activeTab || currentPage;
            if (activeTabName) {
                menuButtons.forEach(button => {
                    const buttonName = button.innerText.toLowerCase();
                    if (buttonName === activeTabName) {
                        targetButton = button;
                    }
                });
            }
        }

        if (targetButton) {
            targetButton.classList.add("menuBtnActive");
            if (!link) {
                this.activeTab = targetButton.innerText.toLowerCase();
                sessionStorage.setItem("activeTab", this.activeTab);
            }
        }
    };


    checkAndShowOrHideContent = () => {
        const forbiddenContentElements = document.querySelectorAll(".forbiddenContent");
        const menuUserContainerElement = document.getElementById("menuUserContainer");
        const headerUserContainerElement = document.getElementById("headerUserContainer");
        const headerUserBadgeElements = document.querySelectorAll(".headerUserBadge");

        if (!menuUserContainerElement || !headerUserContainerElement) {
            console.warn("Menu or Header user container not found.");
            return;
        }

        if (!this.currentUser) {
            this.hideContentWhenNoUser(forbiddenContentElements, menuUserContainerElement, headerUserContainerElement);
        } else {
            this.showContentWhenUserIsLoggedIn(forbiddenContentElements, menuUserContainerElement, headerUserContainerElement);
            headerUserBadgeElements.forEach(badgeElement => {
                badgeElement.innerText = this.currentUser.firstLetters || '??';
            });
        }
    };


    hideContentWhenNoUser = (forbiddenContentElements, menuUserContainerElement, headerUserContainerElement) => {
        forbiddenContentElements.forEach(element => element.classList.add('d-none'));
        menuUserContainerElement.classList.add('d-none');
        headerUserContainerElement.classList.add('d-none');
    };


    showContentWhenUserIsLoggedIn = (forbiddenContentElements, menuUserContainerElement, headerUserContainerElement) => {
        forbiddenContentElements.forEach(element => element.classList.remove('d-none'));
        menuUserContainerElement.classList.remove('d-none');
        headerUserContainerElement.classList.remove('d-none');
    };


    toggleLoader = (status) => {
        const loaderElement = document.getElementById('mainLoader');
        if (!loaderElement) return;
        loaderElement.style.display = status ? 'flex' : 'none';
    };


    setTasks = (newTasks) => {
        this.tasks = newTasks;
    };


    setContacts = (newContacts) => {
        this.contacts = newContacts;
    };


    toggleClass = (menuId, className1, className2) => {
        let element = document.getElementById(menuId);
        if (element) {
            element.classList.toggle(className1);
            element.classList.toggle(className2);
        } else {
            console.warn(`Element with ID "${menuId}" not found for toggleClass.`);
        }
    };


    activateOutsideCheck = (event, modalId, class1, class2) => {
        event.stopPropagation();

        const outsideClickHandler = (e) => {
            this.checkOutsideModal(e, modalId, class1, class2, outsideClickHandler);
        };

        setTimeout(() => {
            document.addEventListener('click', outsideClickHandler);
        }, 0);
    };


    checkOutsideModal = (event, modalId, class1, class2, handler) => {
        let modal = document.getElementById(modalId);
        if (modal && modal.classList.contains(class1) && !modal.contains(event.target)) {
            this.toggleClass(modalId, class1, class2);
            document.removeEventListener('click', handler);
        };
    };


    forwardRegister = () => {
        window.location.href = 'html/register.html';
    };


    forwardLegal = () => {
        sessionStorage.setItem('activeTab', "legal notice");
        window.location.href = 'html/imprint.html';
    };


    forwardPrivacy = () => {
        sessionStorage.setItem('activeTab', "privacy policy");
        window.location.href = 'html/privacy.html';
    };


    forwardToIndex = () => {
        window.location.href = '../index.html';
    };

    activateListenersContacts() {
        this.listener?.contacts?.activateListenersContact();
    }

    activateListenersContactsEdit() {
        this.listener?.contacts?.activateListenersEdit();
    }

    activateListenersContactsDetails() {
        this.listener?.contacts?.activateListenersDetails();
    }
    activateListenersContactsAdd() {
        this.listener?.contacts?.activateListenersAdd();
    }
}