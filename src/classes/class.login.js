import { Contact } from "./class.contact.js";

export class Login {
    constructor(kanban) {
        this.kanban = kanban;
        this.passwordInput = document.getElementById('passwordInput');
        this.isPasswordVisible = false;
        this.initLogin();
    }

    initLogin() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) this.initForm(loginForm);
    }

    initForm(form) {
        const loginInput = form.querySelector('#loginInput');
        const passwordInput = form.querySelector('#passwordInput');
        const checkbox = form.querySelector('#checkbox');
        this.initRememberMe([loginInput, passwordInput, checkbox]);
    }

    initRememberMe([loginInput, passwordInput, checkbox]) {
        const rememberMeChecked = localStorage.getItem('rememberMe') === 'true';
        checkbox.src = rememberMeChecked ? 'assets/icons/checkboxchecked.svg' : 'assets/icons/checkbox.svg';
        if (rememberMeChecked) {
            loginInput.value = localStorage.getItem('login');
            passwordInput.value = localStorage.getItem('password');
            document.getElementById('rememberMe').checked = true;
        }
    }

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
        this.passwordInput.setSelectionRange(selectionStart, selectionEnd);
    };

    resetPasswordStateOnBlur = () => {
        if (!this.passwordInput) return;

        this.isPasswordVisible = false;
        this.passwordInput.type = "password";
        this.passwordInput.style.backgroundImage = "url('../assets/icons/password_input.png')";
    };

    loginButtonClick = async (event) => {
        event?.preventDefault();
        if (!this.kanban || !this.kanban.db) {
            console.error("Kanban oder DB nicht initialisiert!");
            this.showError({ message: "Ein interner Fehler ist aufgetreten." });
            return;
        }
        const loginInput = document.getElementById('loginInput');
        const passwordInput = document.getElementById('passwordInput');
        const rememberMeCheckbox = document.getElementById('rememberMe');

        if (!loginInput || !passwordInput || !rememberMeCheckbox) {
            console.error("Formular-Elemente nicht gefunden!");
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
            this.handleRememberMe(isRememberMeChecked);
            this.continueToSummary();
        } catch (error) {
            this.showError(error);
        }
    };

    setCurrentUser = async (data) => {
        let userData = { name: "Guest", firstLetters: "G" };
        if (!data || !data.id) {
            console.error("Ungültige Benutzerdaten vom Login erhalten:", data);
            sessionStorage.setItem('currentUser', JSON.stringify(userData));
            return;
        }
        try {
            const response = await this.kanban.db.get(`auth/contacts/${data.id}/`);
            if (!response.ok) throw new Error('Failed to fetch user data');
            const user = await response.json();
            userData = new Contact(user);
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            this.kanban.currentUser = userData;
            sessionStorage.setItem('currentUser', JSON.stringify(userData));
        }
    };

    handleRememberMe = (rememberMe) => {
        if (rememberMe) {
            localStorage.setItem('login', document.getElementById('loginInput')?.value || '');
            localStorage.setItem('password', this.passwordInput?.value || '');
            localStorage.setItem('rememberMe', 'true');
            if (this.kanban.currentUser) {
                localStorage.setItem('currentUser', JSON.stringify(this.kanban.currentUser));
            }
        } else {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('login');
            localStorage.removeItem('password');
            localStorage.removeItem('currentUser');
        }
    };

    continueToSummary = () => {
        sessionStorage.setItem('activeTab', 'summary');
        this.kanban.listener?.deactivateListeners();
        window.location.href = 'html/summary.html';
    };

    showError = (error) => {
        const errorMessageElement = document.getElementById('error-message');
        if (errorMessageElement) {
            let message = "Ein unbekannter Fehler ist aufgetreten.";
            if (error && error.message) {
                message = error.message;
            } else if (typeof error === 'string') {
                message = error;
            }
            if (message.includes("401") || message.toLowerCase().includes("unauthorized") || message.toLowerCase().includes("credentials")) {
                message = "Ungültige Anmeldedaten. Bitte überprüfe E-Mail und Passwort.";
            }

            errorMessageElement.textContent = message;
            errorMessageElement.style.width = 'auto';
            errorMessageElement.style.opacity = '1';
        } else {
            console.error("Fehler-Element nicht gefunden. Fehler:", error);
        }
    };

    handleGuestLogin = async () => {
        try {
            const guestUser = { name: "Guest", firstLetters: "G", id: "guest" };
            this.kanban.currentUser = guestUser;
            sessionStorage.setItem("currentUser", JSON.stringify(guestUser));
            localStorage.clear();
            this.continueToSummary();
        } catch (error) {
            console.error('Error signing in as guest:', error);
            this.showError({ message: "Gast-Login fehlgeschlagen." });
        }
    };

    checkBoxClicked = () => {
        const rememberMeCheckbox = document.getElementById('rememberMe');
        const checkboxImg = document.getElementById('checkbox');
        if (rememberMeCheckbox && checkboxImg) {
            const checkedState = rememberMeCheckbox.checked;
            checkboxImg.src = checkedState ? '../assets/icons/checkboxchecked.svg' : '../assets/icons/checkbox.svg';
        }
    };
}

