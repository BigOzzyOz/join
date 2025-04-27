import { Board } from './class.board.js';
import { Login } from './class.login.js';
import { Register } from './class.register.js';
import { Summary } from './class.summary.js';
import { ContactsPage } from './class.contacts-page.js';
import { AddTask } from './class.add-task.js';
import { Contact } from './class.contact.js';
import { Task } from './class.task.js';

/**
 * Handles communication with the backend API for authentication and data management.
 */
export class Database {
    /** @type {string} API URL. */
    BASE_URL = 'https://backend.jan-holtschke.de/be-join/';
    /** @type {string} Token. */
    token = sessionStorage.getItem('token') || '';
    /** @type {import('./class.kanban.js').Kanban|null} Kanban app. */
    kanban = null;

    //NOTE - Initialization & Setup

    /**
     * Creates an instance of the Database class.
     * @param {import('./class.kanban.js').Kanban} kanban - The main Kanban application instance.
     */
    constructor(kanban) {
        this.kanban = kanban;
    }

    /** Checks auth. */
    async checkAuthStatus() {
        this.kanban.toggleLoader(true);
        try {
            const response = await this.get('auth/status/');
            if (!response) return this.redirectToLogin();
            const data = await response.json();
            await this.kanban.init();
            data.authenticated ? await this._initPage() : this.redirectToLogin();
        } catch (e) {
            this._logError('Auth check:', e);
            this.redirectToLogin();
        } finally {
            this.kanban.toggleLoader(false);
        }
    }

    /** Logs error. */
    _logError(...args) { console.error(...args); }

    /**
     * Initializes page-specific components.
     * @private
     */
    async _initPage() {
        const path = window.location.pathname;
        await this._loadInitialData();
        if (path.includes('summary.html')) {
            this.kanban.summary = new Summary(this.kanban);
            this.kanban.summary.initSummary();
        } else if (path.includes('addtask.html')) {
            this.kanban.addTask = new AddTask(this.kanban);
        } else if (path.includes('board.html')) {
            this.kanban.board = new Board(this.kanban);
            this.kanban.board.initBoard();
        } else if (path.includes('contacts.html')) {
            this.kanban.contactsPage = new ContactsPage(this.kanban);
            this.kanban.contactsPage.initContacts();
        }
    }

    /**
     * Loads contacts and tasks if not present.
     * @private
     */
    async _loadInitialData() {
        if (this.kanban.tasks.length > 0 && this.kanban.contacts.length > 0) return;
        try {
            await Promise.all([
                this.getContactsData(),
                this.getTasksData(),
            ]);
        } catch (error) {
            this._logError('Initial data load error:', error);
        }
    }

    /**
     * Redirects to login if not on a public page.
     * @private
     */
    redirectToLogin() {
        if (!this._isPublicPage()) this.logout();
    }

    /**
     * Checks if current page is public (no auth needed).
     * @private
     * @returns {boolean}
     */
    _isPublicPage() {
        const path = window.location.pathname;
        const publicPaths = ['/index.html', '/help.html', '/register.html', '/privacy.html', '/imprint.html'];
        const isPublic = path === '/' || publicPaths.some(p => path.includes(p));
        if (!(isPublic && this._shouldInitLoginRegister(path))) return isPublic;
        if (path.includes('register.html')) this.kanban.register = new Register(this.kanban);
        else if (path.includes('index.html') || path === '/') this.kanban.login = new Login(this.kanban);
        return isPublic;
    }

    /**
     * Should Login/Register be initialized for this path?
     * @private
     */
    _shouldInitLoginRegister(path) {
        return !['help.html', 'privacy.html', 'imprint.html'].some(ex => path.includes(ex));
    }

    //NOTE - Authentication Methods

    /** Login user. */
    async login(bodyData) {
        try {
            const response = await this._postAuth('auth/login/', bodyData);
            const data = await response.json();
            if (!response.ok) throw new Error(this._extractAuthErrorMessage(data, 'Login failed.'));
            if (!data.token) throw new Error('No token received.');
            this.setToken(data.token);
            return data;
        } catch (e) {
            this._logError('Login error:', e);
            throw e;
        }
    }

    /** Guest login. */
    async guestLogin() {
        try {
            const response = await this._postAuth('auth/guest/');
            const data = await response.json();
            if (!response.ok) throw new Error(this._extractAuthErrorMessage(data, 'Guest login failed.'));
            if (!data.token) throw new Error('No token received.');
            this.setToken(data.token);
            return data;
        } catch (e) {
            this._logError('Guest login error:', e);
            throw e;
        }
    }

    /**
     * Logs the current user out by clearing session/local storage and redirecting.
     */
    logout = () => {
        const path = window.location.pathname;
        sessionStorage.clear();
        localStorage.removeItem('currentUser');
        this.token = '';
        if (this.kanban) this.kanban.currentUser = null;
        window.location.href = path.includes('/html/') ? '../index.html' : 'index.html';;
    };

    /** Register user. */
    async register(name, email, password, confirmPassword) {
        const bodyData = { name, email, password, repeated_password: confirmPassword };
        try {
            const response = await this._postAuth('auth/register/', bodyData);
            const data = await response.json();
            if (!response.ok) throw new Error(this._extractAuthErrorMessage(data, 'Registration failed.'));
            return data;
        } catch (e) {
            this._logError('Registration error:', e);
            throw e;
        }
    }

    /**
     * Sets the authentication token in the instance and sessionStorage.
     * @param {string} tokenValue - The authentication token.
     */
    setToken(tokenValue) {
        this.token = tokenValue;
        sessionStorage.setItem('token', tokenValue);
    }

    //NOTE - Generic HTTP Methods

    /**
     * Handles the response from a fetch request, checking for errors (401, other non-OK).
     * @private
     * @param {Response} response - The fetch Response object.
     * @param {string} path - The API path requested (for logging).
     * @returns {Promise<Response>} The original Response object if successful.
     * @throws {Error} If the response status is 401 ('Unauthorized') or not OK.
     */
    async _handleResponse(response, path) {
        if (response.status === 401) {
            console.warn(`Unauthorized request to ${path}. Logging out.`);
            this.logout();
            throw new Error('Unauthorized');
        }
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} ${response.statusText} for path ${path}`);
        }
        return response;
    }

    /**
     * Builds the options object for a fetch request, including method, headers, and body.
     * @private
     * @param {string} method - The HTTP method (GET, POST, etc.).
     * @param {object|null} [data=null] - The data payload for the request body.
     * @returns {RequestInit} The fetch options object.
     */
    _buildFetchOptions(method, data = null) {
        const options = {
            method: method.toUpperCase(),
            headers: this.createHeaders(),
        };
        if (data && !['GET', 'DELETE'].includes(options.method)) {
            options.body = JSON.stringify(data);
        }
        return options;
    }

    /**
     * Performs a generic authenticated fetch request using internal helpers.
     * @private
     * @param {string} path - The API endpoint path relative to BASE_URL.
     * @param {string} method - The HTTP method.
     * @param {object|null} [data=null] - The data payload for the request body.
     * @returns {Promise<Response|null>} The fetch Response object on success, or null on error/auth failure.
     */
    async _fetchWithAuth(path, method, data = null) {
        const url = `${this.BASE_URL}${path}`;
        const options = this._buildFetchOptions(method, data);
        try {
            const response = await fetch(url, options);
            return await this._handleResponse(response, path);
        } catch (error) {
            if (error.message !== 'Unauthorized') {
                this._logError(`Error during ${options.method} request to ${path}:`, error);
            }
            return null;
        }
    }

    /**
     * Performs an authenticated GET request.
     * @param {string} [path=''] - The API endpoint path relative to BASE_URL.
     * @returns {Promise<Response|null>} The fetch Response object on success, or null on error/auth failure.
     */
    async get(path = '') {
        return await this._fetchWithAuth(path, 'GET');
    }

    /**
     * Performs an authenticated POST request.
     * @param {string} [path=''] - The API endpoint path relative to BASE_URL.
     * @param {object} [data={}] - The data to send in the request body.
     * @returns {Promise<Response|null>} The fetch Response object on success, or null on error/auth failure.
     */
    async post(path = '', data = {}) {
        return await this._fetchWithAuth(path, 'POST', data);
    }

    /**
     * Performs an authenticated PUT request.
     * @param {string} [path=''] - The API endpoint path relative to BASE_URL.
     * @param {object} [data={}] - The data to send in the request body.
     * @returns {Promise<Response|null>} The fetch Response object on success, or null on error/auth failure.
     */
    async update(path = '', data = {}) {
        return await this._fetchWithAuth(path, 'PUT', data);
    }

    /**
     * Performs an authenticated PATCH request.
     * @param {string} [path=''] - The API endpoint path relative to BASE_URL.
     * @param {object} [data={}] - The data to send in the request body.
     * @returns {Promise<Response|null>} The fetch Response object on success, or null on error/auth failure.
     */
    async patch(path = '', data = {}) {
        return await this._fetchWithAuth(path, 'PATCH', data);
    }

    /**
     * Performs an authenticated DELETE request.
     * @param {string} [path=''] - The API endpoint path relative to BASE_URL.
     * @returns {Promise<Response|null>} The fetch Response object on success, or null on error/auth failure.
     */
    async delete(path = '') {
        return await this._fetchWithAuth(path, 'DELETE');
    }

    //NOTE - Helper Methods

    /**
     * Creates the headers object for authenticated API requests.
     * @private
     * @returns {HeadersInit} The headers object.
     */
    createHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        if (this.token) headers['Authorization'] = `Token ${this.token}`;
        return headers;
    }

    /** Fetch contacts. */
    async getContactsData() {
        try {
            const response = await this.get('api/contacts/');
            if (!response) return;
            const loadItem = await response.json();
            this.setContactsArray(loadItem);
        } catch (e) {
            this._logError('Contacts fetch error:', e);
        }
    }

    /** Fetch tasks. */
    async getTasksData() {
        try {
            const response = await this.get('api/tasks/');
            if (!response) return;
            const loadItem = await response.json();
            this.setTasksArray(loadItem);
        } catch (e) {
            this._logError('Tasks fetch error:', e);
        }
    }

    /**
     * Sets array (contacts or tasks) in Kanban after validation.
     * @private
     * @param {Array<object>} loadItem
     * @param {'contacts'|'tasks'} arrayName
     * @param {typeof Contact|typeof Task} ItemClass
     */
    _setKanbanArray(loadItem, arrayName, ItemClass) {
        const setterName = `set${arrayName.charAt(0).toUpperCase() + arrayName.slice(1)}`;
        const newArray = [];
        if (!Array.isArray(loadItem)) {
            this._logError(`Invalid data for ${arrayName}:`, loadItem);
            this.kanban[setterName]([]);
            return;
        }
        for (const itemData of loadItem) {
            if (!itemData) continue;
            try {
                newArray.push(new ItemClass(itemData));
            } catch (e) {
                this._logError(`Error creating ${ItemClass.name}:`, e, itemData);
            }
        }
        this.kanban[setterName](newArray);
    }

    /**
     * Sets contacts array in Kanban.
     * @private
     * @param {Array<object>} loadItem
     */
    setContactsArray(loadItem) {
        this._setKanbanArray(loadItem, 'contacts', Contact);
    }

    /**
     * Updates the tasks array in the Kanban instance.
     * @private
     * @param {Array<object>} loadItem - The array of task data objects from the API.
     */
    setTasksArray(loadItem) {
        this._setKanbanArray(loadItem, 'tasks', Task);
    }

    /**
     * Performs a POST request specifically for authentication endpoints (no Auth header).
     * @private
     * @param {string} path - The authentication endpoint path relative to BASE_URL.
     * @param {object|null} [bodyData=null] - The data payload for the request body.
     * @returns {Promise<Response>} The raw fetch Response object promise.
     */
    async _postAuth(path, bodyData = null) {
        const url = `${this.BASE_URL}${path}`;
        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        };
        if (bodyData) options.body = JSON.stringify(bodyData);
        return fetch(url, options);
    }

    /**
     * Extracts a user-friendly error message from authentication API error responses.
     * @private
     * @param {object} data - The parsed JSON error response data.
     * @param {string} [defaultMessage='Authentication error.'] - Fallback message.
     * @returns {string} The extracted or default error message.
     */
    _extractAuthErrorMessage(data, defaultMessage = 'Authentication error.') {
        if (data.non_field_errors && Array.isArray(data.non_field_errors)) return data.non_field_errors.join(' ');
        if (data.detail) return data.detail;
        const errorKeys = ['username', 'password', 'name', 'email', 'repeated_password'];
        for (const key of errorKeys) {
            if (data[key] && Array.isArray(data[key])) return data[key].join(' ');
        }
        return defaultMessage;
    }
}