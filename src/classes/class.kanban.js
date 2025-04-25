import { Database } from "./class.database.js";
import { KanbanListener } from "./listeners/class.kanban-listener.js";
import { Contact } from "./class.contact.js";
import { Task } from './class.task.js';
import { AddTask } from './class.add-task.js';
import { AddTaskListener } from "./listeners/class.listener-add-task.js";

/**
 * Main application class for the Kanban board.
 * Manages application state, data, UI updates, and interactions.
 */
export class Kanban {
    //NOTE Properties

    /** @type {object|null} Raw user data from storage. */
    currentUserStorage = JSON.parse(localStorage.getItem('currentUser')) || JSON.parse(sessionStorage.getItem('currentUser')) || null;
    /** @type {Contact|null} Current user instance. */
    currentUser;
    /** @type {string} Active menu tab. */
    activeTab = sessionStorage.getItem('activeTab') || '';
    /** @type {Array<object>} Raw contacts data. */
    contactsStorage = JSON.parse(sessionStorage.getItem('contact')) || [];
    /** @type {Array<Contact>} Contact instances. */
    contacts;
    /** @type {Array<object>} Raw tasks data. */
    tasksStorage = JSON.parse(sessionStorage.getItem('tasks')) || [];
    /** @type {Array<Task>} Task instances. */
    tasks;
    /** @type {string} Current URL path. */
    path = window.location.pathname;
    /** @type {Array<string>} Paths without user content. */
    noUserContentPaths = [
        '/index.html',
        '/register.html',
    ];
    /** @type {Database|null} Database instance. */
    db = null;
    /** @type {KanbanListener|null} Listener instance. */
    listener = null;
    /** @type {Board|null} Board instance. */
    board = null;
    /** @type {Login|null} Login instance. */
    login = null;
    /** @type {Register|null} Register instance. */
    register = null;
    /** @type {Summary|null} Summary instance. */
    summary = null;
    /** @type {AddTask|null} AddTask instance. */
    addTask = null;
    /** @type {ContactsPage|null} ContactsPage instance. */
    contactsPage = null;

    //NOTE Initialisierung

    /**
     * Init Kanban instance, load data from storage.
     */
    constructor() {
        if (this.noUserContentPaths.some((usedPath) => this.path.includes(usedPath)) || this.path === '/') sessionStorage.clear();
        this.currentUser = this.currentUserStorage ? new Contact(this.currentUserStorage) : null;
        this.contacts = this.contactsStorage.map(contact => new Contact(contact));
        this.tasks = this.tasksStorage.map(task => new Task(task));
    }

    /**
     * Async Kanban instance creation.
     * @returns {Promise<Kanban>}
     */
    static async createInstance() {
        const instance = new Kanban();
        await instance._asyncInit();
        return instance;
    }

    /**
     * Async init (DB, listeners).
     * @private
     */
    async _asyncInit() {
        this.db = new Database(this);
        await this.db.checkAuthStatus();
        this.listener = new KanbanListener(this);
    }

    /**
     * DOM-ready setup (HTML, menu, content).
     */
    async init() {
        await this.includeHTML();
        this.setActive();
        this.checkAndShowOrHideContent();
        if (!sessionStorage.getItem('taskCategory')) sessionStorage.setItem('taskCategory', 'toDo');
        document.getElementById('backArrow')?.addEventListener('click', () => { window.history.back(); });
    }

    //NOTE HTML-Includes

    /**
     * Loads HTML into elements with w3-include-html.
     */
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

    //NOTE Kanban Data Methods

    /**
     * Set tasks and save to session.
     * @param {Array<object|Task>} newTasks
     */
    setTasks = (newTasks) => {
        this.tasks = newTasks.map(taskData => taskData instanceof Task ? taskData : new Task(taskData));
        sessionStorage.setItem('tasks', JSON.stringify(this.tasks.map(t => t.toTaskObject())));
    };

    /**
     * Set contacts and save to session.
     * @param {Array<object|Contact>} contactsArray
     */
    setContacts = (contactsArray) => {
        this.contacts = contactsArray.map(c => c instanceof Contact ? c : new Contact(c));
        sessionStorage.setItem('contacts', JSON.stringify(this.contacts.map(c => c.toContactObject())));
    };

    //NOTE UI Updates & Interaction

    /**
     * Set active menu button.
     * @param {string|null} [link=null]
     */
    setActive = (link = null) => {
        const menuButtons = document.querySelectorAll('.menuBtn');
        menuButtons.forEach(b => b.classList.remove('menuBtnActive'));
        let targetButton = link ? document.querySelector(link) : this.findActiveMenuButton(menuButtons);
        if (targetButton) {
            targetButton.classList.add('menuBtnActive');
            this.activeTab = targetButton.innerText.toLowerCase();
            sessionStorage.setItem('activeTab', this.activeTab);
        }
    };

    /**
     * Find active menu button.
     * @param {NodeListOf<Element>} menuButtons
     * @returns {Element|null}
     */
    findActiveMenuButton = (menuButtons) => {
        const currentPage = document.querySelector('main')?.getAttribute('data-page')?.toLowerCase();
        const activeTabName = this.activeTab || currentPage;
        let targetButton = null;
        if (!activeTabName) return null;
        menuButtons.forEach(button => {
            if (button.innerText.toLowerCase() === activeTabName) targetButton = button;
        });
        return targetButton;
    };

    /**
     * Change active menu button.
     * @param {Element} linkElement
     */
    changeActive = (linkElement) => {
        document.querySelectorAll('.menuBtn').forEach(btn => btn.classList.remove('menuBtnActive'));
        this.activeTab = linkElement.innerText.toLowerCase();
        sessionStorage.setItem('activeTab', this.activeTab);
        linkElement.classList.add('menuBtnActive');
    };

    /**
     * Show/hide content based on user login.
     */
    checkAndShowOrHideContent = () => {
        const forbiddenContentElements = document.querySelectorAll('.forbiddenContent');
        const menuUserContainerElement = document.getElementById('menuUserContainer');
        const headerUserContainerElement = document.getElementById('headerUserContainer');
        const headerUserBadgeElements = document.querySelectorAll('.headerUserBadge');
        if (!menuUserContainerElement || !headerUserContainerElement) {
            console.warn('Menu or Header user container not found.');
            return;
        }
        const showContent = !!this.currentUser;
        this.toggleUserSpecificContent(showContent, forbiddenContentElements, menuUserContainerElement, headerUserContainerElement);
        if (showContent) this.setCurrentUserFirstLetters(headerUserBadgeElements);
    };

    /**
     * Set header user badge initials.
     * @param {NodeListOf<Element>} headerUserBadges
     */
    setCurrentUserFirstLetters(headerUserBadges) {
        headerUserBadges.forEach(badgeElement => {
            badgeElement.innerText = this.currentUser?.firstLetters || '??';
        });
    }

    /**
     * Toggle user-specific content.
     */
    toggleUserSpecificContent = (show, forbiddenElements, menuContainer, headerContainer) => {
        const action = show ? 'remove' : 'add';
        forbiddenElements.forEach(element => element.classList[action]('d-none'));
        menuContainer.classList[action]('d-none');
        headerContainer.classList[action]('d-none');
    };

    /**
     * Show/hide loader.
     * @param {boolean} status
     */
    toggleLoader = (status) => {
        const loaderElement = document.getElementById('mainLoader');
        if (!loaderElement) return;
        loaderElement.style.display = status ? 'flex' : 'none';
    };

    /**
     * Toggle two classes on element.
     */
    toggleClass = (menuId, className1, className2) => {
        let element = document.getElementById(menuId);
        if (element) {
            element.classList.toggle(className1);
            element.classList.toggle(className2);
        } else {
            console.warn(`Element with ID "${menuId}" not found for toggleClass.`);
        }
    };

    /**
     * One-time click listener for outside modal.
     */
    activateOutsideCheck = (event, modalId, class1, class2) => {
        event.stopPropagation();
        setTimeout(() => {
            document.addEventListener('click', (e) => this.checkOutsideModal(e, modalId, class1, class2), { once: true });
        }, 0);
    };

    /**
     * Check if click was outside modal.
     * @private
     */
    checkOutsideModal = (event, modalId, class1, class2) => {
        let modal = document.getElementById(modalId);
        if (modal && modal.classList.contains(class1) && !modal.contains(event.target)) {
            this.toggleClass(modalId, class1, class2);
        }
    };

    //NOTE Navigation

    /** Go to register page. */
    forwardRegister = () => { window.location.href = 'html/register.html'; };
    /** Set active tab to legal notice. */
    forwardLegal = () => { sessionStorage.setItem('activeTab', 'legal notice'); };
    /** Set active tab to privacy policy. */
    forwardPrivacy = () => { sessionStorage.setItem('activeTab', 'privacy policy'); };
    /** Go to index page. */
    forwardToIndex = () => { window.location.href = this.path.includes('/html/') ? '../index.html' : './index.html'; };

    //NOTE Listener Activation/Deactivation

    /** Activate contact listeners. */
    activateListenersContacts() { this.listener?.contacts?.activateListenersContact(); }
    /** Activate contact edit listeners. */
    activateListenersContactsEdit() { this.listener?.contacts?.activateListenersEdit(); }
    /** Activate contact details listeners. */
    activateListenersContactsDetails() { this.listener?.contacts?.activateListenersDetails(); }
    /** Activate add contact listeners. */
    activateListenersContactsAdd() { this.listener?.contacts?.activateListenersAdd(); }
    /** Activate delete contact listeners. */
    activateListenersContactsDelete() { this.listener?.contacts?.activateListenersDelete(); }

    /**
     * Activate AddTask listeners.
     */
    activateListenerAddTask(listener) {
        if (listener === 'openAssignDropdown') this.listener?.addTask?.addTaskListenerOpenAssignDropdown('add');
        if (listener === 'subtask') this.listener?.addTask?.activateSubtaskListeners();
    }
    /**
     * Deactivate AddTask listeners.
     */
    deactivateListenerAddTask(listener) {
        if (listener === 'closeAssignDropdown') this.listener?.addTask?.addTaskListenerOpenAssignDropdown('remove');
        if (listener === 'subtask') this.listener?.addTask?.deactivateSubtaskListeners();
    }
    /**
     * Activate Board listeners.
     */
    activateListenersBoard(listener) {
        if (listener === 'board') this.listener?.board?.activateListeners();
        if (listener === 'dragDrop') this.listener?.board?.initDragDrop();
        if (listener === 'editTask') this.listener?.board?.activateEditTaskListeners();
    }
    /**
     * Deactivate Board listeners.
     */
    deactivateListenersBoard(listener) {
        if (listener === 'board') this.listener?.board?.deactivateAllListenersBoard();
        if (listener === 'dragDrop') this.listener?.board?.deactivateDragDrop();
    }

    /**
     * Show AddTask overlay/modal.
     */
    async generateAddTaskInstance(task, overlay) {
        this.addTask = new AddTask(this);
        this.listener.addTask = new AddTaskListener(this);
        this.addTask.setAssignedContacts([]);
        if (task && task.html) {
            overlay.innerHTML = task.html.generateOpenOverlayHTML();
            this.listener?.board?.activateOverlayListeners();
            if (this.listener?.board) this.listener.board.addTaskInstance = this.addTask;
        } else if (this.board?.html) {
            overlay.innerHTML = await this.board.html.fetchAddTaskTemplate();
            overlay.style.display = 'block';
            this.listener?.addTask?.activateAddTaskListeners();
            this.listener?.board?.activateOverlayListeners();
        } else {
            console.error('Cannot generate Add Task instance: Missing task.html or board.html reference.');
            this.addTask = null;
            this.listener.addTask = null;
        }
    }

    /**
     * Close AddTask overlay/modal and clean up.
     */
    closeAddTaskInstance() {
        this.listener?.board?.deactivateOverlayListeners();
        this.listener?.addTask?.deactivateAllAddTaskListeners();
        this.addTask = null;
        this.listener.addTask = null;
        if (this.listener?.board) this.listener.board.addTaskInstance = null;
        sessionStorage.removeItem('taskCategory');
    }
}