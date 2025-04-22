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
    /** @type {Contact|null} The currently logged-in user instance. */
    currentUser;
    /** @type {string} The name of the currently active menu tab. */
    activeTab = sessionStorage.getItem('activeTab') || '';
    /** @type {Array<object>} Raw contacts data from storage. */
    contactsStorage = JSON.parse(sessionStorage.getItem('contact')) || [];
    /** @type {Array<Contact>} Array of Contact instances. */
    contacts;
    /** @type {Array<object>} Raw tasks data from storage. */
    tasksStorage = JSON.parse(sessionStorage.getItem('tasks')) || [];
    /** @type {Array<Task>} Array of Task instances. */
    tasks;
    /** @type {string} The current URL path. */
    path = window.location.pathname;
    /** @type {Array<string>} Paths where user-specific content should not be shown. */
    noUserContentPaths = [
        '/index.html',
        '/register.html',
    ];

    /** @type {Database|null} Instance of the Database class. */
    db = null;
    /** @type {KanbanListener|null} Instance of the KanbanListener class. */
    listener = null;
    /** @type {Board|null} Instance of the Board class (assuming it exists). */
    board = null;
    /** @type {Login|null} Instance of the Login class (assuming it exists). */
    login = null;
    /** @type {Register|null} Instance of the Register class (assuming it exists). */
    register = null;
    /** @type {Summary|null} Instance of the Summary class (assuming it exists). */
    summary = null;
    /** @type {AddTask|null} Instance of the AddTask class. */
    addTask = null;
    /** @type {ContactsPage|null} Instance of the ContactsPage class (assuming it exists). */
    contactsPage = null;

    //NOTE Initialisierung

    /**
     * Initializes the Kanban instance by loading data from storage.
     * Clears session storage on specific paths.
     */
    constructor() {
        if (this.noUserContentPaths.some((usedPath) => this.path.includes(usedPath)) || this.path === '/') sessionStorage.clear();
        this.currentUser = this.currentUserStorage ? new Contact(this.currentUserStorage) : null;
        this.contacts = this.contactsStorage.map(contact => new Contact(contact));
        this.tasks = this.tasksStorage.map(task => new Task(task));
    }

    /**
     * Asynchronously creates and initializes a Kanban instance.
     * Use this instead of the constructor for async operations.
     * @returns {Promise<Kanban>} A promise that resolves with the fully initialized Kanban instance.
     */
    static async createInstance() {
        const instance = new Kanban();
        await instance._asyncInit();
        return instance;
    }

    /**
     * Performs asynchronous initialization tasks like setting up the database connection.
     * @private
     * @returns {Promise<void>}
     */
    async _asyncInit() {
        this.db = new Database(this);
        await this.db.checkAuthStatus();
        this.listener = new KanbanListener(this);
    }

    /**
     * Performs initial setup after the DOM is ready.
     * Includes HTML templates, sets the active menu item, and manages content visibility.
     * @returns {Promise<void>}
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
     * Fetches and includes HTML content from specified file paths into elements with the 'w3-include-html' attribute.
     * @returns {Promise<void>}
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
     * Updates the tasks array and saves it to session storage.
     * Ensures all elements in the array are Task instances.
     * @param {Array<object|Task>} newTasks - The new array of tasks (can be raw objects or Task instances).
     */
    setTasks = (newTasks) => {
        this.tasks = newTasks.map(taskData => {
            if (taskData instanceof Task) return taskData;
            else return new Task(taskData);
        });

        const tasksForStorage = this.tasks.map(task => task.toTaskObject());
        sessionStorage.setItem('tasks', JSON.stringify(tasksForStorage));
    };

    /**
     * Updates the contacts array and saves it to session storage.
     * Ensures all elements in the array are Contact instances.
     * @param {Array<object|Contact>} contactsArray - The new array of contacts (can be raw objects or Contact instances).
     */
    setContacts = (contactsArray) => {
        this.contacts = contactsArray.map(contactData => {
            if (contactData instanceof Contact) return contactData;
            else return new Contact(contactData);
        });

        const contactsForStorage = this.contacts.map(contact => contact.toContactObject());
        sessionStorage.setItem('contacts', JSON.stringify(contactsForStorage));
    };

    //NOTE UI Updates & Interaction

    /**
     * Sets the active state for a menu button.
     * If no link is provided, it tries to find the active button based on the current page or stored active tab.
     * @param {string|null} [link=null] - A CSS selector for the target menu button.
     */
    setActive = (link = null) => {
        const menuButtons = document.querySelectorAll(".menuBtn");
        menuButtons.forEach(button => button.classList.remove("menuBtnActive"));

        let targetButton = null;

        if (link) targetButton = document.querySelector(link);
        else targetButton = this.findActiveMenuButton(menuButtons);
        if (targetButton) {
            targetButton.classList.add("menuBtnActive");
            this.activeTab = targetButton.innerText.toLowerCase();
            sessionStorage.setItem("activeTab", this.activeTab);
        }
    };

    /**
     * Finds the menu button corresponding to the active tab or current page.
     * @param {NodeListOf<Element>} menuButtons - A list of menu button elements.
     * @returns {Element|null} The active menu button element or null if not found.
     */
    findActiveMenuButton = (menuButtons) => {
        const currentPage = document.querySelector('main')?.getAttribute('data-page')?.toLowerCase();
        const activeTabName = this.activeTab || currentPage;
        let targetButton = null;
        if (!activeTabName) return null;
        menuButtons.forEach(button => {
            const buttonName = button.innerText.toLowerCase();
            if (buttonName === activeTabName) targetButton = button;
        });
        return targetButton;
    };

    /**
     * Changes the active menu button when a link element is clicked.
     * @param {Element} linkElement - The clicked menu button element.
     */
    changeActive = (linkElement) => {
        let linkBtn = document.querySelectorAll(".menuBtn");
        linkBtn.forEach(btn => btn.classList.remove("menuBtnActive"));
        this.activeTab = linkElement.innerText.toLowerCase();
        sessionStorage.setItem("activeTab", this.activeTab);
        linkElement.classList.add("menuBtnActive");
    };

    /**
     * Shows or hides content based on whether a user is logged in.
     * Manages visibility of elements marked as 'forbiddenContent' and user-specific header/menu elements.
     */
    checkAndShowOrHideContent = () => {
        const forbiddenContentElements = document.querySelectorAll(".forbiddenContent");
        const menuUserContainerElement = document.getElementById("menuUserContainer");
        const headerUserContainerElement = document.getElementById("headerUserContainer");
        const headerUserBadgeElements = document.querySelectorAll(".headerUserBadge");

        if (!menuUserContainerElement || !headerUserContainerElement) {
            console.warn("Menu or Header user container not found.");
            return;
        }

        const showContent = !!this.currentUser;

        this.toggleUserSpecificContent(showContent, forbiddenContentElements, menuUserContainerElement, headerUserContainerElement);

        if (showContent) this.setCurrentUserFirstLetters(headerUserBadgeElements);
    };

    /**
     * Sets the text content of header user badges to the current user's initials.
     * @param {NodeListOf<Element>} headerUserBadges - A list of header user badge elements.
     */
    setCurrentUserFirstLetters(headerUserBadges) {
        headerUserBadges.forEach(badgeElement => {
            badgeElement.innerText = this.currentUser?.firstLetters || '??';
        });
    }

    /**
     * Toggles the visibility (using 'd-none' class) of user-specific content elements.
     * @param {boolean} show - Whether to show (true) or hide (false) the content.
     * @param {NodeListOf<Element>} forbiddenElements - Elements to hide when no user is logged in.
     * @param {Element} menuContainer - The menu container element for the user.
     * @param {Element} headerContainer - The header container element for the user.
     */
    toggleUserSpecificContent = (show, forbiddenElements, menuContainer, headerContainer) => {
        const action = show ? 'remove' : 'add';

        forbiddenElements.forEach(element => element.classList[action]('d-none'));
        menuContainer.classList[action]('d-none');
        headerContainer.classList[action]('d-none');
    };

    /**
     * Shows or hides the main loading indicator.
     * @param {boolean} status - True to show the loader, false to hide it.
     */
    toggleLoader = (status) => {
        const loaderElement = document.getElementById('mainLoader');
        if (!loaderElement) return;
        loaderElement.style.display = status ? 'flex' : 'none';
    };

    /**
     * Toggles two CSS classes on a specified element.
     * @param {string} menuId - The ID of the element.
     * @param {string} className1 - The first class name to toggle.
     * @param {string} className2 - The second class name to toggle.
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
     * Activates a one-time click listener on the document to detect clicks outside a specified modal.
     * Used to close modals when clicking outside them.
     * @param {Event} event - The event that triggered the modal opening (e.g., a click event).
     * @param {string} modalId - The ID of the modal element.
     * @param {string} class1 - A class indicating the modal is open (used for checking).
     * @param {string} class2 - A class to toggle along with class1 (e.g., for closing animation).
     */
    activateOutsideCheck = (event, modalId, class1, class2) => {
        event.stopPropagation(); // Prevent the initial click from immediately closing the modal

        const outsideClickHandler = (e) => {
            this.checkOutsideModal(e, modalId, class1, class2);
        };

        // Use setTimeout to ensure the listener is added after the current event loop tick
        setTimeout(() => {
            document.addEventListener('click', outsideClickHandler, { once: true });
        }, 0);
    };

    /**
     * Checks if a click event occurred outside the specified modal. If so, toggles the modal's classes.
     * @param {Event} event - The click event.
     * @param {string} modalId - The ID of the modal element.
     * @param {string} class1 - The class indicating the modal is open.
     * @param {string} class2 - The class to toggle for closing.
     * @private
     */
    checkOutsideModal = (event, modalId, class1, class2) => {
        let modal = document.getElementById(modalId);

        // Check if modal exists, is open (has class1), and the click target is not inside the modal
        if (modal && modal.classList.contains(class1) && !modal.contains(event.target)) {
            this.toggleClass(modalId, class1, class2); // Close the modal
        };
        // No need to remove the listener here as { once: true } handles it
    };

    //NOTE Navigation

    /** Navigates the user to the registration page. */
    forwardRegister = () => {
        window.location.href = 'html/register.html';
    };

    /** Sets the active tab to 'legal notice' (likely before navigating). */
    forwardLegal = () => {
        sessionStorage.setItem('activeTab', "legal notice");
    };

    /** Sets the active tab to 'privacy policy' (likely before navigating). */
    forwardPrivacy = () => {
        sessionStorage.setItem('activeTab', "privacy policy");
    };

    /** Navigates the user to the index page (login). */
    forwardToIndex = () => {
        window.location.href = this.path.includes('/html/') ? '../index.html' : './index.html';
    };

    //NOTE Listener Activation/Deactivation

    /** Activates general contact page listeners. */
    activateListenersContacts() {
        this.listener?.contacts?.activateListenersContact();
    }

    /** Activates listeners for the contact edit view. */
    activateListenersContactsEdit() {
        this.listener?.contacts?.activateListenersEdit();
    }

    /** Activates listeners for the contact details view. */
    activateListenersContactsDetails() {
        this.listener?.contacts?.activateListenersDetails();
    }

    /** Activates listeners for adding a new contact. */
    activateListenersContactsAdd() {
        this.listener?.contacts?.activateListenersAdd();
    }

    /** Activates listeners for deleting a contact. */
    activateListenersContactsDelete() {
        this.listener?.contacts?.activateListenersDelete();
    }

    /**
     * Activates specific listeners related to the Add Task functionality.
     * @param {'openAssignDropdown' | 'subtask'} listener - The specific listener group to activate.
     */
    activateListenerAddTask(listener) {
        if (listener === 'openAssignDropdown') {
            this.listener?.addTask?.addTaskListenerOpenAssignDropdown('add');
        }
        if (listener === 'subtask') {
            this.listener?.addTask?.activateSubtaskListeners();
        }
    }

    /**
     * Deactivates specific listeners related to the Add Task functionality.
     * @param {'closeAssignDropdown' | 'subtask'} listener - The specific listener group to deactivate.
     */
    deactivateListenerAddTask(listener) {
        if (listener === 'closeAssignDropdown') {
            this.listener?.addTask?.addTaskListenerOpenAssignDropdown('remove');
        }
        if (listener === 'subtask') {
            this.listener?.addTask?.deactivateSubtaskListeners();
        }
    }

    /**
     * Activates specific listeners related to the Board functionality.
     * @param {'board' | 'dragDrop' | 'editTask'} listener - The specific listener group to activate.
     */
    activateListenersBoard(listener) {
        if (listener === 'board') {
            this.listener?.board?.activateListeners();
        }
        if (listener === 'dragDrop') {
            this.listener?.board?.initDragDrop();
        }
        if (listener === 'editTask') {
            this.listener?.board?.activateEditTaskListeners();
        }
    }

    /**
     * Deactivates specific listeners related to the Board functionality.
     * @param {'board' | 'dragDrop'} listener - The specific listener group to deactivate.
     */
    deactivateListenersBoard(listener) {
        if (listener === 'board') {
            this.listener?.board?.deactivateAllListenersBoard();
        }
        if (listener === 'dragDrop') {
            this.listener?.board?.deactivateDragDrop();
        }
    }

    /**
     * Generates and displays the Add Task overlay/modal.
     * Can be used for creating a new task or editing an existing one.
     * @param {Task|null} task - The task to edit, or null to create a new task.
     * @param {Element} overlay - The DOM element where the Add Task HTML should be rendered.
     * @returns {Promise<void>}
     */
    async generateAddTaskInstance(task, overlay) {
        this.addTask = new AddTask(this);
        this.listener.addTask = new AddTaskListener(this);
        this.addTask.setAssignedContacts([]); // Reset assigned contacts

        if (task && task.html) { // Edit existing task
            overlay.innerHTML = task.html.generateOpenOverlayHTML();
            this.listener?.board?.activateOverlayListeners();
            if (this.listener?.board) {
                this.listener.board.addTaskInstance = this.addTask;
            }
        } else if (this.board?.html) { // Create new task
            overlay.innerHTML = await this.board.html.fetchAddTaskTemplate();
            overlay.style.display = "block";
            this.listener?.addTask?.activateAddTaskListeners();
        } else {
            console.error("Cannot generate Add Task instance: Missing task.html or board.html reference.");
            this.addTask = null; // Clean up
            this.listener.addTask = null;
        }
    }

    /**
     * Closes the Add Task overlay/modal and cleans up associated instances and listeners.
     */
    closeAddTaskInstance() {
        this.listener?.board?.deactivateOverlayListeners();
        this.listener?.addTask?.deactivateAllAddTaskListeners();
        this.addTask = null;
        this.listener.addTask = null;
        if (this.listener?.board) {
            this.listener.board.addTaskInstance = null;
        }
        sessionStorage.removeItem('taskCategory');
    }

    //FIXME: Doppelte oder nicht benötigte Methoden ggf. hier ans Ende verschieben
}