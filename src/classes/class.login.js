import { Contact } from "./class.contact.js";

/**
 * Handles user login, guest login, remember me functionality,
 * and associated UI interactions for the login form.
 */
export class Login {
    //NOTE - Properties

    /** @type {import('./class.kanban.js').Kanban} Kanban app instance. */
    kanban;
    /** @type {HTMLInputElement|null} Password input field. */
    passwordInput = document.getElementById('passwordInput');
    /** @type {boolean} Password visible. */
    isPasswordVisible = false;

    //NOTE - Constructor & Initialization

    /**
     * Creates an instance of the Login class.
     * @param {import('./class.kanban.js').Kanban} kanban - The main Kanban application instance.
     */
    constructor(kanban) {
        this.kanban = kanban;
        this.initLogin();
    }

    /**
     * Initializes the login functionality by finding the form and necessary elements.
     * @private
     */
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

    /**
     * Initializes form elements within the provided form.
     * @param {HTMLFormElement} form - The login form element.
     * @private
     */
    initForm(form) {
        const loginInput = form.querySelector('#loginInput');
        const checkbox = form.querySelector('#checkbox'); // Checkbox image element
        const rememberMeCheckbox = form.querySelector('#rememberMe'); // Actual checkbox input

        if (loginInput && this.passwordInput && checkbox && rememberMeCheckbox) {
            this.initRememberMe(loginInput, this.passwordInput, rememberMeCheckbox, checkbox);
        } else {
            console.warn("One or more form elements for initialization not found.");
        }
    }

    /**
     * Initializes the "Remember Me" functionality, setting initial state and values.
     * @param {HTMLInputElement} loginInput
     * @param {HTMLInputElement} passwordInput
     * @param {HTMLInputElement} rememberMeCheckbox
     * @param {HTMLImageElement} checkboxImg
     * @private
     */
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

    /**
     * Handles the click event of the main login button.
     * Orchestrates validation and login attempt.
     * @param {Event} [event] - The click event object.
     * @returns {Promise<void>}
     */
    loginButtonClick = async (event) => {
        event?.preventDefault();
        if (!this._checkInitialization()) return;

        const formData = this._getAndValidateFormData();
        if (!formData) return;

        await this._attemptLogin(formData);
    };

    /**
     * Checks if essential Kanban components are initialized.
     * @returns {boolean} True if initialized, false otherwise.
     * @private
     */
    _checkInitialization() {
        if (!this.kanban || !this.kanban.db) {
            console.error("Kanban or DB not initialized!");
            this.showError({ message: "An internal error occurred." });
            return false;
        }
        return true;
    }

    /**
     * Retrieves form elements, validates their values, and returns structured data.
     * @returns {{login: string, password: string, isRememberMeChecked: boolean}|null} Form data or null if validation fails.
     * @private
     */
    _getAndValidateFormData() {
        const elements = this._getFormElements();
        if (!elements) return null;

        const values = this._getAndValidateFormValues(elements.loginInput, elements.passwordInput);
        if (!values) return null;

        return { ...values, isRememberMeChecked: elements.rememberMeCheckbox.checked };
    }

    /**
     * Retrieves necessary form elements from the DOM.
     * @returns {{loginInput: HTMLInputElement, passwordInput: HTMLInputElement, rememberMeCheckbox: HTMLInputElement}|null} Object with elements or null if any are missing.
     * @private
     */
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

    /**
     * Gets and validates the login and password values from input elements.
     * @param {HTMLInputElement} loginInput
     * @param {HTMLInputElement} passwordInput
     * @returns {{login: string, password: string}|null} Object with values or null if invalid.
     * @private
     */
    _getAndValidateFormValues(loginInput, passwordInput) {
        const login = loginInput.value.trim().toLowerCase();
        const password = passwordInput.value;

        if (!login || !password) {
            this.showError({ message: "Please enter email and password." });
            return null;
        }
        return { login, password };
    }

    /**
     * Attempts the login API call and handles success (user setup, navigation) or failure (error display).
     * @param {{login: string, password: string, isRememberMeChecked: boolean}} formData - The validated form data.
     * @returns {Promise<void>}
     * @private
     */
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

    /**
     * Handles the guest login process.
     * @returns {Promise<void>}
     */
    handleGuestLogin = async () => {
        try {
            await this.kanban.db.guestLogin();
            const guestUser = this._getGuestUserData();
            this._updateCurrentUserState(guestUser);
            this.handleRememberMe(false, null, null);
            this.continueToSummary();
        } catch (error) {
            console.error('Error signing in as guest:', error);
            this.showError({ message: "Guest login failed." });
        }
    };

    //NOTE - Login Sub-Processes

    /**
     * Sets the current user based on login response data, fetching details or defaulting to guest.
     * @param {object} loginResponseData - Data returned from the login API.
     * @returns {Promise<void>}
     * @private
     */
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

    /**
     * Fetches user data from the API based on user ID.
     * @param {string|number} userId - The ID of the user to fetch.
     * @returns {Promise<object|null>} The user data object or null if fetch failed.
     * @private
     */
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

    /**
     * Returns the default guest user data object.
     * @returns {{name: string, firstLetters: string, id: string, email: string, phone: string}} Guest user data.
     * @private
     */
    _getGuestUserData() {
        return { name: "Guest", firstLetters: "G", id: "guest", email: "guest@join.com", phone: "" };
    }

    /**
     * Updates the kanban state and sessionStorage with the current user.
     * @param {object} userData - The user data object (either fetched or guest).
     * @private
     */
    _updateCurrentUserState(userData) {
        this.kanban.currentUser = new Contact(userData);
        const currentUserForStorage = this.kanban.currentUser.toContactObject();
        sessionStorage.setItem('currentUser', JSON.stringify(currentUserForStorage));
    }

    //NOTE - State/Navigation Helpers

    /**
     * Handles storing or removing login credentials based on the "Remember Me" checkbox state.
     * @param {boolean} rememberMe - Whether the "Remember Me" checkbox is checked.
     * @param {string|null} login - The user's login email (or null if not remembering).
     * @param {string|null} password - The user's password (or null if not remembering).
     */
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

    /**
     * Navigates the user to the summary page after successful login.
     */
    continueToSummary = () => {
        sessionStorage.setItem('activeTab', 'summary');
        this.kanban.listener?.deactivateListeners();
        window.location.href = 'html/summary.html';
    };

    //NOTE - UI Event Handlers

    /**
     * Handles clicks on the password visibility toggle icon.
     * @param {Event} [event] - The click event object.
     */
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

    /**
     * Sets the type and background image of the password input based on visibility state.
     * @param {boolean} isVisible - Whether the password should be visible.
     * @private
     */
    _setPasswordVisibility(isVisible) {
        if (!this.passwordInput) return;
        if (isVisible) {
            this.passwordInput.type = "text";
            this.passwordInput.style.backgroundImage = "url('../assets/icons/visibility.png')";
        } else {
            this.passwordInput.type = "password";
            this.passwordInput.style.backgroundImage = "url('../assets/icons/password_off.png')";
        }
    }

    /**
     * Resets the password visibility state when the input loses focus.
     */
    resetPasswordStateOnBlur = () => {
        if (!this.passwordInput || !this.isPasswordVisible) return;

        this.isPasswordVisible = false;
        this.passwordInput.type = "password";
        this.passwordInput.style.backgroundImage = "url('../assets/icons/password_input.png')";
    };

    /**
     * Handles clicks on the "Remember Me" checkbox image, updating its visual state.
     */
    checkBoxClicked = () => {
        const rememberMeCheckbox = document.getElementById('rememberMe');
        const checkboxImg = document.getElementById('checkbox');
        if (rememberMeCheckbox && checkboxImg) {
            const checkedState = rememberMeCheckbox.checked;
            checkboxImg.src = checkedState ? '../assets/icons/checkboxchecked.svg' : '../assets/icons/checkbox.svg';
        }
    };

    //NOTE - Utility Functions

    /**
     * Displays an error message to the user in the designated error element.
     * @param {Error|object|string} error - The error object or message string.
     */
    showError = (error) => {
        const errorMessageElement = document.getElementById('error-message');
        if (!errorMessageElement) {
            console.error("Error message element not found. Error:", error);
            return;
        }

        const message = this._getDisplayErrorMessage(error);
        this._displayErrorMessageUI(errorMessageElement, message);
    };

    /**
     * Extracts and processes a user-friendly error message from various error types.
     * Handles specific credential error messages.
     * @param {Error|object|string} error - The raw error data.
     * @returns {string} The processed error message for display.
     * @private
     */
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

    /**
     * Updates the error message UI element with the provided message.
     * @param {HTMLElement} element - The error message container element.
     * @param {string} message - The message to display.
     * @private
     */
    _displayErrorMessageUI(element, message) {
        element.textContent = message;
        element.style.width = 'auto';
        element.style.opacity = '1';
    }
}

