import { Kanban } from './class.kanban.js';
import { Board } from './class.Board.js';
import { Login } from './class.login.js';
import { Register } from './class.register.js';
// import { initSummary } from '../summary.js';
// import { initBoard } from '../board.js';
// import { initRegister } from '../register.js';
// import { activateAddTaskListeners } from '../addtask.js';


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
            if (this.token) this.kanban.board = new Board();
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
        if (path.includes('summary.html')) this.kanban.board.initSummary();
        else if (path.includes('addtask.html')) setTimeout(() => this.kanban.listener.addTask.activateListener(), 500);
        else if (path.includes('board.html')) this.kanban.board.initBoard();
        else if (path.includes('contacts.html')) this.kanban.board.initContacts();
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
        }
    }


    async post(path = "", data = {}) {
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


    async guestLogin() {
        try {
            let response = await fetch(`${this.BASE_URL}auth/guest/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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


    logout() {
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('activeTab');
        sessionStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        window.location.href = '../index.html';
    }


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
            if (response.status === 400) {
                if (data.name) throw new Error('Please enter a valid name.');
                if (data.email) throw new Error('Please enter a valid email address.');
                if (data.password) throw new Error('Please enter a valid password.');
                if (data.repeated_password) throw new Error('Please repeat the password correctly.');
            }
            return data;
        } catch (error) {
            console.error('Error during registration:', error);
        }
    }

}