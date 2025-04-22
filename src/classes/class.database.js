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
    /** @type {string} The base URL of the backend API. */
    BASE_URL = 'http://127.0.0.1:8000/';
    /** @type {string} The authentication token retrieved from sessionStorage or login. */
    token = sessionStorage.getItem('token') || '';
    /** @type {import('./class.kanban.js').Kanban|null} Reference to the main Kanban application instance. */
    kanban = null;

    //NOTE - Initialization & Setup

    /**
     * Creates an instance of the Database class.
     * @param {import('./class.kanban.js').Kanban} kanban - The main Kanban application instance.
     */
    constructor(kanban) {
        this.kanban = kanban;
    }

    /**
     * Checks the authentication status with the backend and initializes the page or redirects to login.
     * @returns {Promise<void>}
     */
    async checkAuthStatus() {
        this.kanban.toggleLoader(true);
        try {
            const response = await this.get('auth/status/');
            if (!response) {
                this.redirectToLogin();
                return;
            }
            const data = await response.json();
            await this.kanban.init();
            if (data.authenticated) await this.initializePage();
            else this.redirectToLogin();
        } catch (error) {
            console.error('Error during auth status check or page initialization:', error);
            this.redirectToLogin();
        } finally {
            this.kanban.toggleLoader(false);
        }
    }

    /**
     * Initializes page-specific components based on the current URL path.
     * @private
     * @returns {Promise<void>}
     */
    async initializePage() {
        const path = window.location.pathname;
        await this.loadInitialData();

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
     * Loads initial contacts and tasks data if not already present.
     * @private
     * @returns {Promise<void>}
     */
    async loadInitialData() {
        if (this.kanban.tasks.length > 0 && this.kanban.contacts.length > 0) return;
        try {
            await Promise.all([
                this.getContactsData(),
                this.getTasksData(),
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    /**
     * Redirects to the login page if the current page requires authentication.
     * @private
     */
    redirectToLogin() {
        if (!this.windowNoUserContent()) {
            this.logout();
        }
    }

    /**
     * Checks if the current window path corresponds to a page that doesn't require user content/authentication.
     * Also initializes Login/Register classes for relevant public pages.
     * @private
     * @returns {boolean} True if the page is public/no-auth, false otherwise.
     */
    windowNoUserContent() {
        const path = window.location.pathname;
        const noUserContentPaths = [
            '/index.html',
            '/help.html',
            '/register.html',
            '/privacy.html',
            '/imprint.html',
        ];
        const isPublicPage = path === '/' || noUserContentPaths.some((publicPath) => path.includes(publicPath));

        if (!(isPublicPage && this.shouldInitializeLoginRegister(path))) return isPublicPage;
        if (path.includes('register.html')) this.kanban.register = new Register(this.kanban);
        else if (path.includes('index.html') || path === '/') this.kanban.login = new Login(this.kanban);
        return isPublicPage;
    }

    /**
     * Determines if Login or Register classes should be initialized for a given public path.
     * Excludes specific static pages like help, privacy, imprint.
     * @private
     * @param {string} path - The current window path.
     * @returns {boolean} True if Login/Register should be initialized, false otherwise.
     */
    shouldInitializeLoginRegister(path) {
        const excludedPaths = ['help.html', 'privacy.html', 'imprint.html'];
        return !excludedPaths.some(excludedPath => path.includes(excludedPath));
    }

    //NOTE - Authentication Methods

    /**
     * Attempts to log in a user with the provided credentials.
     * @param {object} bodyData - Data containing username and password.
     * @returns {Promise<object>} The response data from the server on success.
     * @throws {Error} If login fails or no token is received.
     */
    async login(bodyData) {
        try {
            const response = await this._postAuth('auth/login/', bodyData);
            const data = await response.json();
            if (!response.ok) throw new Error(this._extractAuthErrorMessage(data, 'Login failed.'));
            if (!data.token) throw new Error('No token received from the server.');
            this.setToken(data.token);
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Attempts to log in as a guest user.
     * @returns {Promise<object>} The response data from the server on success.
     * @throws {Error} If guest login fails or no token is received.
     */
    async guestLogin() {
        try {
            const response = await this._postAuth('auth/guest/');
            const data = await response.json();
            if (!response.ok) throw new Error(this._extractAuthErrorMessage(data, 'Guest login failed.'));
            if (!data.token) throw new Error('No token received from the server.');
            this.setToken(data.token);
            return data;
        } catch (error) {
            console.error('Guest login error:', error);
            throw error;
        }
    }

    /**
     * Logs the current user out by clearing session/local storage and redirecting.
     */
    logout = () => {
        sessionStorage.clear();
        localStorage.removeItem('currentUser');
        this.token = '';
        if (this.kanban) this.kanban.currentUser = null;
        window.location.href = '/index.html';
    };

    /**
     * Attempts to register a new user.
     * @param {string} name
     * @param {string} email
     * @param {string} password
     * @param {string} confirmPassword
     * @returns {Promise<object>} The response data from the server on success.
     * @throws {Error} If registration fails.
     */
    async register(name, email, password, confirmPassword) {
        const bodyData = { name, email, password, repeated_password: confirmPassword };
        try {
            const response = await this._postAuth('auth/register/', bodyData);
            const data = await response.json();
            if (!response.ok) throw new Error(this._extractAuthErrorMessage(data, 'Registration failed.'));
            return data;
        } catch (error) {
            console.error('Error during registration:', error);
            throw error;
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
                console.error(`Error during ${options.method} request to ${path}:`, error);
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
        if (this.token) {
            headers['Authorization'] = `Token ${this.token}`;
        }
        return headers;
    }

    /**
     * Fetches contacts data from the API and updates the Kanban state.
     * @returns {Promise<void>}
     */
    async getContactsData() {
        try {
            const response = await this.get('api/contacts/');
            if (!response) return;
            const loadItem = await response.json();
            this.setContactsArray(loadItem);
        } catch (error) {
            console.error("Error processing contacts data:", error);
        }
    }

    /**
     * Fetches tasks data from the API and updates the Kanban state.
     * @returns {Promise<void>}
     */
    async getTasksData() {
        try {
            const response = await this.get('api/tasks/');
            if (!response) return;
            const loadItem = await response.json();
            this.setTasksArray(loadItem);
        } catch (error) {
            console.error("Error processing tasks data:", error);
        }
    }

    /**
     * Updates a specific array (contacts or tasks) in the Kanban instance after validating input.
     * @private
     * @param {Array<object>} loadItem - The array of data objects from the API.
     * @param {'contacts' | 'tasks'} arrayName - The name of the array property in Kanban ('contacts' or 'tasks').
     * @param {typeof Contact | typeof Task} ItemClass - The class constructor (Contact or Task) to use for instantiation.
     */
    _setKanbanArray(loadItem, arrayName, ItemClass) {
        const targetArray = this.kanban[arrayName];
        if (!Array.isArray(loadItem)) {
            console.error(`Invalid data received for ${arrayName}:`, loadItem);
            this.kanban[`set${arrayName.charAt(0).toUpperCase() + arrayName.slice(1)}`]([]); // Use setter like setContacts([])
            return;
        }
        this.kanban[`set${arrayName.charAt(0).toUpperCase() + arrayName.slice(1)}`]([]); // Clear existing items

        for (const itemData of loadItem) {
            if (!itemData) continue;
            try {
                const newItem = new ItemClass(itemData);
                targetArray.push(newItem);
            } catch (error) {
                console.error(`Error creating ${ItemClass.name} instance:`, error, itemData);
            }
        }
    }

    /**
     * Updates the contacts array in the Kanban instance.
     * @private
     * @param {Array<object>} loadItem - The array of contact data objects from the API.
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
        if (bodyData) {
            options.body = JSON.stringify(bodyData);
        }
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
        if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
            return data.non_field_errors.join(' ');
        }
        if (data.detail) {
            return data.detail;
        }
        const errorKeys = ['username', 'password', 'name', 'email', 'repeated_password'];
        for (const key of errorKeys) {
            if (data[key] && Array.isArray(data[key])) {
                return data[key].join(' ');
            }
        }
        return defaultMessage;
    }
}