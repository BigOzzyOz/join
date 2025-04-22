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
        if (!loginForm) {
            console.error("Login form ('login-form') not found. Cannot initialize login.");
            return;
        }

        if (!this.passwordInput) {
            this.passwordInput = document.getElementById('passwordInput');
            if (!this.passwordInput) {
                console.error("Password input ('passwordInput') not found. Form initialization might be incomplete.");
            }
        }
        this.initForm(loginForm);
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
        if (!this._checkInitialization()) return;

        const formData = this._getAndValidateFormData();
        if (!formData) return;

        await this._attemptLogin(formData);
    };

    _checkInitialization() {
        if (!this.kanban || !this.kanban.db) {
            console.error("Kanban or DB not initialized!");
            this.showError({ message: "An internal error occurred." });
            return false;
        }
        return true;
    }

    _getAndValidateFormData() {
        const elements = this._getFormElements();
        if (!elements) return null;

        const values = this._getAndValidateFormValues(elements.loginInput, elements.passwordInput);
        if (!values) return null;

        return { ...values, isRememberMeChecked: elements.rememberMeCheckbox.checked };
    }

    _getFormElements() {
        const loginInput = document.getElementById('loginInput');
        const passwordInput = this.passwordInput || document.getElementById('passwordInput');
        const rememberMeCheckbox = document.getElementById('rememberMe');

        if (!loginInput || !passwordInput || !rememberMeCheckbox) {
            console.error("Required form elements (login, password, rememberMe) not found!");
            this.showError({ message: "Form incomplete." });
            return null;
        }
        return { loginInput, passwordInput, rememberMeCheckbox };
    }

    _getAndValidateFormValues(loginInput, passwordInput) {
        const login = loginInput.value.trim().toLowerCase();
        const password = passwordInput.value;

        if (!login || !password) {
            this.showError({ message: "Please enter email and password." });
            return null;
        }
        return { login, password };
    }

    async _attemptLogin({ login, password, isRememberMeChecked }) {
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
    }

    handleGuestLogin = async () => {
        try {
            const guestUser = { name: "Guest", firstLetters: "G", id: "guest", email: "guest@join.com", phone: "" };
            this.kanban.currentUser = new Contact(guestUser);
            const currentUserForStorage = this.kanban.currentUser.toContactObject();
            sessionStorage.setItem("currentUser", JSON.stringify(currentUserForStorage));
            this.handleRememberMe(false, null, null);
            this.continueToSummary();
        } catch (error) {
            this.showError({ message: "Guest login failed." });
        }
    };

    //NOTE - Login Sub-Processes

    setCurrentUser = async (loginResponseData) => {
        const userId = loginResponseData?.user?.id || loginResponseData?.id;
        let userData = null;

        if (userId) {
            userData = await this._fetchUserData(userId);
        } else {
            console.warn('No user ID found in login response. Using guest user.');
        }

        const finalUserData = userData || this._getGuestUserData();

        this._updateCurrentUserState(finalUserData);
    };

    async _fetchUserData(userId) {
        try {
            const response = await this.kanban.db.get(`api/contacts/${userId}/`);
            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }
            const user = await response.json();
            if (!user) {
                throw new Error('Invalid user data received');
            }
            return user;
        } catch (error) {
            console.warn(`Could not fetch/process user data for ID: ${userId}. Error: ${error.message}`);
            return null;
        }
    }

    _getGuestUserData() {
        return { name: "Guest", firstLetters: "G", id: "guest", email: "guest@join.com", phone: "" };
    }

    _updateCurrentUserState(userData) {
        this.kanban.currentUser = new Contact(userData);
        const currentUserForStorage = this.kanban.currentUser.toContactObject();
        sessionStorage.setItem('currentUser', JSON.stringify(currentUserForStorage));
    }

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

        this._setPasswordVisibility(this.isPasswordVisible);

        this.passwordInput.focus();
        requestAnimationFrame(() => {
            this.passwordInput.setSelectionRange(selectionStart, selectionEnd);
        });
    };

    _setPasswordVisibility(isVisible) {
        if (isVisible) {
            this.passwordInput.type = "text";
            this.passwordInput.style.backgroundImage = "url('../assets/icons/visibility.png')";
        } else {
            this.passwordInput.type = "password";
            this.passwordInput.style.backgroundImage = "url('../assets/icons/password_off.png')";
        }
    }


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

        const message = this._getDisplayErrorMessage(error);

        this._displayErrorMessageUI(errorMessageElement, message);
    };

    _getDisplayErrorMessage(error) {
        let message = "An unknown error occurred.";

        if (error instanceof Error) message = error.message;
        else if (typeof error === 'object' && error?.message) message = error.message;
        else if (typeof error === 'string') message = error;

        const statusCode = error?.status || error?.response?.status;
        const lowerCaseMessage = message.toLowerCase();
        const credentialKeywords = ["unauthorized", "credentials", "no active account"];

        const isCredentialError = statusCode === 401 ||
            credentialKeywords.some(keyword => lowerCaseMessage.includes(keyword));

        if (isCredentialError) {
            message = "Wrong email or password.";
        }

        return message;
    }

    _displayErrorMessageUI(element, message) {
        element.textContent = message;
        element.style.width = 'auto';
        element.style.opacity = '1';
    }
}

