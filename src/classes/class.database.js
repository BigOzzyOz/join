import { Kanban } from './class.kanban.js';
import { initSummary } from '../summary.js';
import { initBoard } from '../board.js';
import { initContacts } from '../contacts.js';
import { initRegister } from '../register.js';
import { activateAddTaskListeners } from '../addtask.js';


export class Database {
    static BASE_URL = 'http://127.0.0.1:8000/';
    static token = sessionStorage.getItem('token') || '';

    constructor() { }

    static async checkAuthStatus() {
        Kanban.toggleLoader(true);
        try {
            const headers = this.createHeaders();
            const response = await fetch(`${this.BASE_URL}auth/status/`, {
                method: 'GET',
                headers: headers,
            });
            const data = await response.json();
            await Kanban.init().then(() => {
                if (data.authenticated) this.initializePage();
                else this.redirectToLogin();
            });
        } catch (error) {
            console.error('Error checking auth status:', error);
        } finally {
            Kanban.toggleLoader(false);
        }
    }


    static createHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        if (this.token) headers['Authorization'] = `Token ${this.token}`;
        return headers;
    }


    static initializePage() {
        const path = window.location.pathname;
        if (path.includes('summary.html')) initSummary();
        else if (path.includes('addtask.html')) setTimeout(() => activateAddTaskListeners(), 500);
        else if (path.includes('board.html')) initBoard();
        else if (path.includes('contacts.html')) initContacts();
    }


    static async redirectToLogin() {
        if (this.windowNoUserContent()) return;
        else this.apiLogout();
    }


    static windowNoUserContent() {
        const path = window.location.pathname;
        const noUserContentPaths = [
            '/index.html',
            '/help.html',
            '/register.html',
            '/privacy.html',
            '/imprint.html',
        ];
        if (path.includes('register.html')) initRegister();
        return noUserContentPaths.some((usedPath) => path.includes(usedPath)) || path === '/';
    }


    static setToken(tokenValue) {
        this.token = tokenValue;
        sessionStorage.setItem('token', tokenValue);
    }

    static logout() {
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('activeTab');
        sessionStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        window.location.href = '../index.html';
    }

    static async get(path = '') {
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
        }
    }


    static async delete(path = '') {
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
        }
    }


    static async post(path = "", data = {}) {
        const url = `${this.BASE_URL}${path}`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Token ${this.token}`,
            },
            body: JSON.stringify(data),
        });
        return response;
    }


    static async update(path = "", data = {}) {
        try {
            const url = `${this.BASE_URL}${path}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${this.token}`,
                },
                body: JSON.stringify(dataToUpdate)
            });
            return response;
        } catch (error) {
            console.error('Error updating data in database:', error);
        }
    }


    static async patch(path = "", data = {}) {
        try {
            const url = `${this.BASE_URL}${path}`;
            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${this.token}`,
                },
                body: JSON.stringify(dataToUpdate)
            });
            return response;
        } catch (error) {
            console.error('Error updating data in database:', error);
        }
    }


    static async login() {
        try {
            let response = await fetch(`${this.BASE_URL}auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bodyData),
            });
            const data = await response.json();
            if (response.status === 400) {
                if (data.username && data.password) throw new Error('Please enter a valid email address and password.');
                if (data.username) throw new Error('Please enter a valid email address.');
                if (data.password) throw new Error('Please enter a valid password.');
                if (data.non_field_errors) throw new Error('Wrong email address or password! Try it again.');
            }
            data.token ? this.setToken(data.token) : console.error('Error: No token received from the server.');
            return data;
        } catch (error) {
            showError(error); //TODO - connect showError to the UI
        }
    }

}