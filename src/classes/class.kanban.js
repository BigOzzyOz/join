import { Board } from "./class.Board.js";
import { Database } from "./class.database.js";
import { KanbanListener } from "./listeners/class.kanban-listener.js";


export class Kanban {
    currentUser = JSON.parse(localStorage.getItem('currentUser')) || JSON.parse(sessionStorage.getItem('currentUser')) || null;
    activeTab = sessionStorage.getItem('activeTab') || '';
    contacts = JSON.parse(sessionStorage.getItem('contact')) || [];
    tasks = JSON.parse(sessionStorage.getItem('tasks')) || [];
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
    board = null;
    contacts = null;


    constructor() {
        if (this.noUserContentPaths.some((usedPath) => this.path.includes(usedPath)) || this.path === '/') sessionStorage.clear();
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
        if (elementsToInclude.length > 0) this.activateListener();
    }


    changeActive(link) {
        let linkBtn = document.querySelectorAll(".menuBtn");
        linkBtn.forEach(btn => btn.classList.remove("menuBtnActive"));
        this.activeTab = link.innerText.toLowerCase();
        sessionStorage.setItem("activeTab", this.activeTab);
        sessionStorage.getItem('taskCategory');
        this.setActive();
    }


    setActive(link = null) {
        const menuButtons = document.querySelectorAll(".menuBtn");
        const currentPage = document.querySelector('main').getAttribute('data-page').toLowerCase();
        const activeTabName = this.activeTab || currentPage;
        const newActiveTab = document.querySelector(link);
        if (newActiveTab) this.changeActive(newActiveTab);
        else menuButtons.forEach(button => {
            const buttonName = button.innerText.toLowerCase();
            if (buttonName === activeTabName) button.classList.add("menuBtnActive");
        });
    }


    checkAndShowOrHideContent() {
        const forbiddenContentElements = document.querySelectorAll(".forbiddenContent");
        const menuUserContainerElement = document.getElementById("menuUserContainer");
        const headerUserContainerElement = document.getElementById("headerUserContainer");
        const headerUserBadgeElements = document.querySelectorAll(".headerUserBadge");

        if (!forbiddenContentElements || !menuUserContainerElement || !headerUserContainerElement) return;

        if (!this.currentUser) {
            this.hideContentWhenNoUser(forbiddenContentElements, menuUserContainerElement, headerUserContainerElement);
        } else {
            this.showContentWhenUserIsLoggedIn(forbiddenContentElements, menuUserContainerElement, headerUserContainerElement);
            headerUserBadgeElements.forEach(badgeElement => badgeElement.innerText = this.currentUser.firstLetters);
        }
    }


    hideContentWhenNoUser(forbiddenContentElements, menuUserContainerElement, headerUserContainerElement) {
        forbiddenContentElements.forEach(element => element.classList.add('d-none'));
        menuUserContainerElement.classList.add('d-none');
        headerUserContainerElement.classList.add('d-none');
    }


    showContentWhenUserIsLoggedIn(forbiddenContentElements, menuUserContainerElement, headerUserContainerElement) {
        forbiddenContentElements.forEach(element => element.classList.remove('d-none'));
        menuUserContainerElement.classList.remove('d-none');
        headerUserContainerElement.classList.remove('d-none');
    }


    //NOTE - Global functions


    toggleLoader(status) {
        const loaderElement = document.getElementById('mainLoader');
        if (!loaderElement) return;
        loaderElement.style.display = status ? 'flex' : 'none';
    }


    setTasks(newTasks) {
        tasks = newTasks;
    }


    setContacts(newContacts) {
        contacts = newContacts;
    }


    toggleClass(menu, className1, className2) {
        let edit = document.getElementById(menu);
        edit.classList.toggle(className1);
        edit.classList.toggle(className2);
    }


    activateOutsideCheck(event, modalName, class1, class2) {
        event.stopPropagation();

        const outsideClickHandler = (e) => {
            this.checkOutsideModal(e, modalName, class1, class2, outsideClickHandler);
        };

        document.addEventListener('click', outsideClickHandler);
    }


    checkOutsideModal(event, modalName, class1, class2, handler) {
        let modal = document.getElementById(modalName);
        if (modal.classList.contains(class1) && !modal.contains(event.target)) {
            this.toggleClass(modalName, class1, class2);
            document?.removeEventListener('click', handler);
        };
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