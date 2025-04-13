import { Contact } from "./class.contact.js";

export class Login {
    constructor(kanban) {
        this.kanban = kanban;
        this.passwordInput = document.getElementById('passwordInput');
        this.isPasswordVisible = false;
        this.clickCount = -1;
        this.initLogin();
    }


    initLogin() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) this.initForm(loginForm);
    }


    initForm(form) {
        const login = form.querySelector('#loginInput');
        const passwordInput = form.querySelector('#passwordInput');
        const checkbox = form.querySelector('#checkbox');
        this.initInputFocus([login, passwordInput, checkbox]);
        this.initRememberMe([login, passwordInput, checkbox]);
        this.setupPasswordToggle();
    }


    initInputFocus([login, passwordInput, checkbox]) {
        [login, passwordInput, checkbox].forEach((input) => {
            input.addEventListener('focus', () => {
                const errorMessage = document.getElementById('error-message');
                errorMessage.style.width = '0';
                errorMessage.textContent = '';
            });
        });
    }


    initRememberMe([login, passwordInput, checkbox]) {
        const rememberMeChecked = localStorage.getItem('rememberMe') === 'true';
        checkbox.src = rememberMeChecked ? 'assets/icons/checkboxchecked.svg' : 'assets/icons/checkbox.svg';
        if (rememberMeChecked) {
            login.value = localStorage.getItem('login');
            passwordInput.value = localStorage.getItem('password');
            document.getElementById('rememberMe').checked = true;
        }
    }



    setupPasswordToggle() {
        this.passwordInput.addEventListener("click", this.changeVisibility);
        this.passwordInput.addEventListener("focus", () => { this.clickCount++; });
        this.passwordInput.addEventListener("blur", this.resetState);
    }


    changeVisibility(event) {
        event.preventDefault();
        const selectionStart = this.passwordInput.selectionStart;
        this.togglePasswordVisibility();
        this.clickCount = this.clickCount === 0 ? 1 : 0;
        this.passwordInput.setSelectionRange(selectionStart, selectionStart);
    }


    resetState() {
        this.passwordInput.type = "password";
        this.passwordInput.style.backgroundImage = "url('assets/icons/password_input.png')";
        this.clickCount = -1;
        this.isPasswordVisible = false;
    }


    togglePasswordVisibility() {
        this.passwordInput.type = this.isPasswordVisible ? "text" : "password";
        const image = this.isPasswordVisible ? "visibility.png" : "password_off.png";
        this.passwordInput.style.backgroundImage = `url('assets/icons/${image}')`;
        this.isPasswordVisible = !this.isPasswordVisible;
    }


    async loginButtonClick(event) {
        event.preventDefault();
        const login = document.getElementById('loginInput').value.trim().toLowerCase();
        const password = document.getElementById('passwordInput').value;
        const isRememberMeChecked = document.getElementById('rememberMe').checked;
        const bodyData = {
            "username": login,
            "password": password,
        };
        try {
            const data = await this.kanban.db.login(bodyData);
            await this.setCurrentUser(data);
            this.handleRememberMe(isRememberMeChecked);
            this.continueToSummary();
        } catch (error) {
            this.showError(error);
        }
    }

    //TODO - Move this function to the kanban class
    async setCurrentUser(data) {
        let userData = { name: "Guest", firstLetters: "G" };
        try {
            const response = await this.kanban.db.get(`auth/contacts/${data.id}/`);
            if (!response.ok) throw new Error('Failed to fetch user data');
            const user = await response.json();
            userData = new Contact(user);
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            sessionStorage.setItem('currentUser', JSON.stringify(userData));
        }
    }


    handleRememberMe(rememberMe) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        if (rememberMe) {
            localStorage.setItem('login', document.getElementById('loginInput').value);
            localStorage.setItem('password', document.getElementById('passwordInput').value);
            localStorage.setItem('rememberMe', 'true');
        } else {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('email');
            localStorage.removeItem('password');
        }
    }


    continueToSummary() {
        sessionStorage.setItem('activeTab', 'summary');
        this.kanban.listener.deactivateAllListenersLogin();
        window.location.href = 'html/summary.html';
    }


    showError(error) {
        const errorMessageElement = document.getElementById('error-message');
        errorMessageElement.textContent = error.message;
        errorMessageElement.style.width = '100%';
    }


    async handleGuestLogin() {
        try {
            const data = await this.kanban.db.guestLogin();
            const guestUser = { name: "Guest", firstLetters: "G" };
            sessionStorage.setItem("currentUser", JSON.stringify(guestUser));
            localStorage.clear();
            this.continueToSummary();
        } catch (error) {
            console.error('Error signing in as guest:', error);
        }
    }


    checkBoxClicked() {
        const checkedState = document.getElementById('rememberMe').checked;
        const checkboxImg = document.getElementById('checkbox');
        checkboxImg.src = checkedState ? 'assets/icons/checkboxchecked.svg' : 'assets/icons/checkbox.svg';
    }



}

