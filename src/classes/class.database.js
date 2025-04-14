import { Kanban } from './class.kanban.js';
import { Board } from './class.Board.js';
import { Login } from './class.login.js';
import { Register } from './class.register.js';
import { Summary } from './class.summary.js';
import { ContactsPage } from './class.contacts-page.js';


export class Database {
    BASE_URL = 'http://127.0.0.1:8000/';
    token = sessionStorage.getItem('token') || '';

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
            await this.kanban.init().then(() => {
                if (data.authenticated) this.initializePage();
                else this.redirectToLogin();
            });
        } catch (error) {
            console.error('Error checking auth status:', error);
        } finally {
            this.kanban.toggleLoader(false);
        }
    }


    createHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        if (this.token) headers['Authorization'] = `Token ${this.token}`;
        return headers;
    }


    initializePage() {
        const path = window.location.pathname;
        if (path.includes('summary.html')) {
            this.kanban.summary = new Summary(this.kanban);
            this.kanban.summary.initSummary();
        }
        else if (path.includes('addtask.html')) {
            this.kanban.addTask = new AddTask(this.kanban);
            this.kanban.addTask.initAddTask();
        }
        else if (path.includes('board.html')) {
            this.kanban.board = new Board(this.kanban);
            this.kanban.board.initBoard();
        }
        else if (path.includes('contacts.html')) {
            this.kanban.contactsPage = new ContactsPage(this.kanban);
            this.kanban.contactsPage.initContacts();
        }
    }


    redirectToLogin() {
        if (this.windowNoUserContent()) return;
        else this.logout();
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
        if (this.shouldInitializeLoginRegister(path)) {
            if (path.includes('register.html')) this.kanban.register = new Register(this.kanban);
            else if (path.includes('index.html') || path === '/') this.kanban.login = new Login(this.kanban);
        }
        return noUserContentPaths.some((usedPath) => path.includes(usedPath)) || path === '/';
    }


    shouldInitializeLoginRegister(path) {
        const excludedPaths = ['help.html', 'privacy.html', 'imprint.html'];
        return !excludedPaths.some(excludedPath => path.includes(excludedPath));
    }


    setToken(tokenValue) {
        this.token = tokenValue;
        sessionStorage.setItem('token', tokenValue);
    }


    async get(path = '') {
        const url = `${this.BASE_URL}${path}`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${this.token}`,
                },
            });
            return response;
        } catch (error) {
            console.error('Error fetching data from database:', error);
            throw error;
        }
    }


    async delete(path = '') {
        try {
            const url = `${this.BASE_URL}${path}`;
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${this.token}`,
                },
            });
            return response;
        } catch (error) {
            console.error('Error deleting data from database:', error);
            throw error;
        }
    }


    async post(path = "", data = {}) {
        const url = `${this.BASE_URL}${path}`;
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Token ${this.token}`,
                },
                body: JSON.stringify(data),
            });
            return response;
        } catch (error) {
            console.error('Error posting data to database:', error);
            throw error;
        }
    }


    async update(path = "", data = {}) {
        try {
            const url = `${this.BASE_URL}${path}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${this.token}`,
                },
                body: JSON.stringify(data)
            });
            return response;
        } catch (error) {
            console.error('Error updating data in database:', error);
            throw error;
        }
    }


    async patch(path = "", data = {}) {
        try {
            const url = `${this.BASE_URL}${path}`;
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${this.token}`,
                },
                body: JSON.stringify(data)
            });
            return response;
        } catch (error) {
            console.error('Error updating data in database:', error);
            throw error;
        }
    }


    async login(bodyData) {
        try {
            let response = await fetch(`${this.BASE_URL}auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bodyData),
            });
            const data = await response.json();
            if (!response.ok) {
                let errorMessage = 'Login failed.';
                if (data.username && data.password) errorMessage = 'Please enter a valid email address and password.';
                else if (data.username) errorMessage = 'Please enter a valid email address.';
                else if (data.password) errorMessage = 'Please enter a valid password.';
                else if (data.non_field_errors) errorMessage = 'Wrong email address or password! Try it again.';
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
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await response.json();
            if (!response.ok) {
                let errorMessage = 'Guest login failed.';
                if (data.detail) errorMessage = data.detail;
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
        this.kanban.currentUser = null;
        window.location.href = '../index.html';
    };


    async register(name, email, password, confirmPassword) {
        try {
            const response = await fetch(`${this.BASE_URL}auth/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    'name': name,
                    'email': email,
                    'password': password,
                    'repeated_password': confirmPassword,
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                let errorMessage = 'Registration failed.';
                if (data.name) errorMessage = data.name.join(' ');
                else if (data.email) errorMessage = data.email.join(' ');
                else if (data.password) errorMessage = data.password.join(' ');
                else if (data.repeated_password) errorMessage = data.repeated_password.join(' ');
                else if (data.non_field_errors) errorMessage = data.non_field_errors.join(' ');
                throw new Error(errorMessage);
            }
            return data;
        } catch (error) {
            console.error('Error during registration:', error);
            throw error;
        }
    }

}