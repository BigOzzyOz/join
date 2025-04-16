import { Contact } from "./class.contact.js";

export class Login {
    //NOTE - Properties

    kanban;
    passwordInput = document.getElementById('passwordInput');
    isPasswordVisible = false;

    //NOTE - Constructor & Initialization

    constructor(kanban) {
        this.kanban = kanban;
        this.initLogin();
    }

    initLogin() {
        const loginForm = document.getElementById('login-form');

        if (loginForm) {
            if (!this.passwordInput) {
                this.passwordInput = document.getElementById('passwordInput');
            }
            this.initForm(loginForm);
        } else {
            console.warn("Login form not found during initialization.");
        }
    }

    initForm(form) {
        const loginInput = form.querySelector('#loginInput');
        const checkbox = form.querySelector('#checkbox');
        const rememberMeCheckbox = form.querySelector('#rememberMe');

        if (loginInput && this.passwordInput && checkbox && rememberMeCheckbox) {
            this.initRememberMe(loginInput, this.passwordInput, rememberMeCheckbox, checkbox);
        } else {
            console.warn("One or more form elements for initialization not found.");
        }
    }

    initRememberMe(loginInput, passwordInput, rememberMeCheckbox, checkboxImg) {
        const rememberMeChecked = localStorage.getItem('rememberMe') === 'true';
        rememberMeCheckbox.checked = rememberMeChecked;
        checkboxImg.src = rememberMeChecked ? 'assets/icons/checkboxchecked.svg' : 'assets/icons/checkbox.svg';
        if (rememberMeChecked) {
            loginInput.value = localStorage.getItem('login') || '';
            passwordInput.value = localStorage.getItem('password') || '';
        }
    }

    //NOTE - Core Login Actions

    loginButtonClick = async (event) => {
        event?.preventDefault();
        if (!this.kanban || !this.kanban.db) {
            console.error("Kanban or DB not initialized!");
            this.showError({ message: "Ein interner Fehler ist aufgetreten." });
            return;
        }
        const loginInput = document.getElementById('loginInput');
        const passwordInput = this.passwordInput || document.getElementById('passwordInput');
        const rememberMeCheckbox = document.getElementById('rememberMe');

        if (!loginInput || !passwordInput || !rememberMeCheckbox) {
            console.error("Form elements not found!");
            this.showError({ message: "Formular unvollständig." });
            return;
        }

        const login = loginInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        const isRememberMeChecked = rememberMeCheckbox.checked;

        if (!login || !password) {
            this.showError({ message: "Bitte E-Mail und Passwort eingeben." });
            return;
        }

        const bodyData = {
            "username": login,
            "password": password,
        };
        try {
            const data = await this.kanban.db.login(bodyData);
            await this.setCurrentUser(data);
            this.handleRememberMe(isRememberMeChecked, login, password);
            this.continueToSummary();
        } catch (error) {
            console.error("Login failed:", error);
            this.showError(error);
        }
    };

    handleGuestLogin = async () => {
        try {
            const guestUser = { name: "Guest", firstLetters: "G", id: "guest", email: "guest@join.com", phone: "" };
            this.kanban.currentUser = new Contact(guestUser);
            sessionStorage.setItem("currentUser", JSON.stringify(this.kanban.currentUser));
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('login');
            localStorage.removeItem('password');
            this.continueToSummary();
        } catch (error) {
            console.error('Error signing in as guest:', error);
            this.showError({ message: "Gast-Login fehlgeschlagen." });
        }
    };

    //NOTE - Login Sub-Processes

    setCurrentUser = async (loginResponseData) => {
        let userData = { name: "Guest", firstLetters: "G", id: "guest", email: "guest@join.com", phone: "" };
        const userId = loginResponseData?.user?.id || loginResponseData?.id;

        if (!userId) {
            console.error("Invalid user data from login response:", loginResponseData);
            this.kanban.currentUser = new Contact(userData);
        } else {
            try {
                const response = await this.kanban.db.get(`api/contacts/${userId}/`);
                const user = await response.json();
                if (!user) throw new Error('User data not found or fetch failed');
                userData = new Contact(user);
                this.kanban.currentUser = userData;
            } catch (error) {
                console.error('Error fetching user data after login:', error);
                this.kanban.currentUser = new Contact(userData);
            }
        }
        sessionStorage.setItem('currentUser', JSON.stringify(this.kanban.currentUser));
    };


    handleRememberMe = (rememberMe, login, password) => {
        if (rememberMe) {
            localStorage.setItem('login', login);
            localStorage.setItem('password', password);
            localStorage.setItem('rememberMe', 'true');

        } else {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('login');
            localStorage.removeItem('password');
        }
    };

    continueToSummary = () => {
        sessionStorage.setItem('activeTab', 'summary');
        this.kanban.listener?.deactivateListeners();
        window.location.href = 'html/summary.html';
    };

    //NOTE - UI Event Handlers

    handlePasswordVisibilityClick = (event) => {
        event?.preventDefault();
        if (!this.passwordInput) return;

        const selectionStart = this.passwordInput.selectionStart;
        const selectionEnd = this.passwordInput.selectionEnd;

        this.isPasswordVisible = !this.isPasswordVisible;

        if (this.isPasswordVisible) {
            this.passwordInput.type = "text";
            this.passwordInput.style.backgroundImage = "url('../assets/icons/visibility.png')";
        } else {
            this.passwordInput.type = "password";
            this.passwordInput.style.backgroundImage = "url('../assets/icons/password_off.png')";
        }

        this.passwordInput.focus();
        requestAnimationFrame(() => {
            this.passwordInput.setSelectionRange(selectionStart, selectionEnd);
        });
    };

    resetPasswordStateOnBlur = () => {
        if (!this.passwordInput || !this.isPasswordVisible) return;

        this.isPasswordVisible = false;
        this.passwordInput.type = "password";
        this.passwordInput.style.backgroundImage = "url('../assets/icons/password_input.png')";
    };

    checkBoxClicked = () => {
        const rememberMeCheckbox = document.getElementById('rememberMe');
        const checkboxImg = document.getElementById('checkbox');
        if (rememberMeCheckbox && checkboxImg) {
            const checkedState = rememberMeCheckbox.checked;
            checkboxImg.src = checkedState ? '../assets/icons/checkboxchecked.svg' : '../assets/icons/checkbox.svg';
        }
    };

    //NOTE - Utility Functions

    showError = (error) => {
        const errorMessageElement = document.getElementById('error-message');
        if (!errorMessageElement) {
            console.error("Error message element not found. Error:", error);
            return;
        }

        let message = "Ein unbekannter Fehler ist aufgetreten.";


        if (error instanceof Error) {
            message = error.message;
        } else if (typeof error === 'object' && error !== null && error.message) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }

        const statusCode = error?.status || error?.response?.status;
        if (statusCode === 401 || message.toLowerCase().includes("unauthorized") || message.toLowerCase().includes("credentials") || message.toLowerCase().includes("no active account")) {
            message = "Ungültige Anmeldedaten. Bitte überprüfe E-Mail und Passwort.";
        }

        errorMessageElement.textContent = message;
        errorMessageElement.style.width = 'auto';
        errorMessageElement.style.opacity = '1';
    };
}

