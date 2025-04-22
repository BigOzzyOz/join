import { Board } from './class.board.js';
import { Login } from './class.login.js';
import { Register } from './class.register.js';
import { Summary } from './class.summary.js';
import { ContactsPage } from './class.contacts-page.js';
import { AddTask } from './class.add-task.js';
import { Contact } from './class.contact.js';
import { Task } from './class.task.js';

export class Database {
    BASE_URL = 'http://127.0.0.1:8000/';
    token = sessionStorage.getItem('token') || '';
    kanban = null;

    //NOTE - Initialization & Setup

    constructor(kanban) {
        this.kanban = kanban;
    }

    async checkAuthStatus() {
        this.kanban.toggleLoader(true);
        try {
            const headers = this.createHeaders();
            const response = await fetch(`${this.BASE_URL}auth/status/`, {
                method: 'GET',
                headers: headers,
            });
            const data = await response.json();
            await this.kanban.init();
            if (response.ok && data.authenticated) await this.initializePage();
            else this.redirectToLogin();
        } catch (error) {
            console.error('Error checking auth status:', error);
            this.redirectToLogin();
        } finally {
            this.kanban.toggleLoader(false);
        }
    }

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

    redirectToLogin() {
        if (!this.windowNoUserContent()) this.logout();
    }

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

    shouldInitializeLoginRegister(path) {
        const excludedPaths = ['help.html', 'privacy.html', 'imprint.html'];
        return !excludedPaths.some(excludedPath => path.includes(excludedPath));
    }

    //NOTE - Authentication Methods

    async login(bodyData) {
        try {
            let response = await fetch(`${this.BASE_URL}auth/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyData),
            });
            const data = await response.json();
            if (!response.ok) {
                let errorMessage = data.non_field_errors?.[0] || data.detail || 'Login failed. Please check credentials.';
                if (data.username) errorMessage = `Username: ${data.username.join(' ')}`;
                if (data.password) errorMessage = `Password: ${data.password.join(' ')}`;
                throw new Error(errorMessage);
            }
            if (!data.token) throw new Error('No token received from the server.');
            this.setToken(data.token);
            return data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async guestLogin() {
        try {
            let response = await fetch(`${this.BASE_URL}auth/guest/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            if (!response.ok) {
                let errorMessage = data.detail || 'Guest login failed.';
                throw new Error(errorMessage);
            }
            if (!data.token) throw new Error('No token received from the server.');
            this.setToken(data.token);
            return data;
        } catch (error) {
            console.error('Guest login error:', error);
            throw error;
        }
    }

    logout = () => {
        sessionStorage.clear();
        localStorage.removeItem('currentUser');
        this.token = '';
        if (this.kanban) this.kanban.currentUser = null;
        window.location.href = '/index.html';
    };

    async register(name, email, password, confirmPassword) {
        try {
            const response = await fetch(`${this.BASE_URL}auth/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    'name': name,
                    'email': email,
                    'password': password,
                    'repeated_password': confirmPassword
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                let errorMessage = 'Registration failed.';
                const errorKeys = ['name', 'email', 'password', 'repeated_password', 'non_field_errors'];
                for (const key of errorKeys) {
                    if (data[key]) {
                        errorMessage = data[key].join(' ');
                        break;
                    }
                }
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error('Error during registration:', error);
            throw error;
        }
    }

    setToken(tokenValue) {
        this.token = tokenValue;
        sessionStorage.setItem('token', tokenValue);
    }

    //NOTE - Generic HTTP Methods

    async get(path = '') {
        const url = `${this.BASE_URL}${path}`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: this.createHeaders(),
            });
            if (!response.ok && response.status === 401) {
                console.warn('Unauthorized request. Logging out.');
                this.logout();
                throw new Error('Unauthorized');
            }
            return response;
        } catch (error) {
            console.error(`Error fetching data from ${path}:`, error);
            if (error.message !== 'Unauthorized') {
                throw error;
            }
            return null;
        }
    }

    async post(path = "", data = {}) {
        const url = `${this.BASE_URL}${path}`;
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: this.createHeaders(),
                body: JSON.stringify(data),
            });
            if (!response.ok && response.status === 401) {
                console.warn('Unauthorized request. Logging out.');
                this.logout();
                throw new Error('Unauthorized');
            }
            return response;
        } catch (error) {
            console.error(`Error posting data to ${path}:`, error);
            if (error.message !== 'Unauthorized') {
                throw error;
            }
            return null;
        }
    }

    async update(path = "", data = {}) {
        const url = `${this.BASE_URL}${path}`;
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: this.createHeaders(),
                body: JSON.stringify(data)
            });
            if (!response.ok && response.status === 401) {
                console.warn('Unauthorized request. Logging out.');
                this.logout();
                throw new Error('Unauthorized');
            }
            return response;
        } catch (error) {
            console.error(`Error updating data at ${path} (PUT):`, error);
            if (error.message !== 'Unauthorized') {
                throw error;
            }
            return null;
        }
    }

    async patch(path = "", data = {}) {
        const url = `${this.BASE_URL}${path}`;
        try {
            const response = await fetch(url, {
                method: 'PATCH',
                headers: this.createHeaders(),
                body: JSON.stringify(data)
            });
            if (!response.ok && response.status === 401) {
                console.warn('Unauthorized request. Logging out.');
                this.logout();
                throw new Error('Unauthorized');
            }
            return response;
        } catch (error) {
            console.error(`Error patching data at ${path} (PATCH):`, error);
            if (error.message !== 'Unauthorized') {
                throw error;
            }
            return null;
        }
    }

    async delete(path = '') {
        const url = `${this.BASE_URL}${path}`;
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: this.createHeaders(),
            });
            if (!response.ok && response.status === 401) {
                console.warn('Unauthorized request. Logging out.');
                this.logout();
                throw new Error('Unauthorized');
            }
            return response;
        } catch (error) {
            console.error(`Error deleting data from ${path}:`, error);
            if (error.message !== 'Unauthorized') {
                throw error;
            }
            return null;
        }
    }

    //NOTE - Helper Methods
    createHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        if (this.token) {
            headers['Authorization'] = `Token ${this.token}`;
        }
        return headers;
    }

    async getContactsData() {
        try {
            const response = await this.kanban.db.get('api/contacts/');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            let loadItem = await response.json();
            this.setContactsArray(loadItem);
            this.kanban.setContacts(this.kanban.contacts);
        } catch (error) {
            console.error("Error fetching contacts data:", error);
        }
    }

    setContactsArray(loadItem) {
        this.kanban.setContacts([]);
        for (const contactData of loadItem) {
            if (!contactData) continue;
            const newContact = new Contact(contactData);
            this.kanban.contacts.push(newContact);
        }
    }

    async getTasksData() {
        try {
            const response = await this.kanban.db.get('api/tasks/');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            let loadItem = await response.json();
            this.setTasksArray(loadItem);
            this.kanban.setTasks(this.kanban.tasks);
        } catch (error) {
            console.error("Error fetching contacts data:", error);
        }
    }

    setTasksArray(loadItem) {
        this.kanban.setTasks([]);
        for (const taskData of loadItem) {
            if (!taskData) continue;
            const newTask = new Task(taskData);
            this.kanban.tasks.push(newTask);
        }
    }
}