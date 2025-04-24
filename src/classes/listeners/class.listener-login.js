export class LoginListener {
    //NOTE - Properties
    /** @type {object} Kanban app instance. */
    kanban;
    /** @type {import('../class.login.js').Login} Login instance. */
    loginInstance;
    /** @type {HTMLFormElement|null} Login form element. */
    loginForm;

    //NOTE - Constructor & Initialization
    /**
     * Creates a LoginListener instance.
     * @param {object} kanban - Kanban app instance
     */
    constructor(kanban) {
        this.kanban = kanban;
        this.loginInstance = kanban.login;
        this.loginForm = document.getElementById('login-form');
        if (!this.loginInstance) this._logError("Login instance is missing in LoginListener constructor.");
        if (!this.loginForm) this._logError("Login form not found for LoginListener.");
        this.activateListener();
    }

    //NOTE - Listener Management
    /**
     * Activates all relevant listeners for the login form.
     * @returns {void}
     */
    activateListener() {
        this.loginForm?.addEventListener('submit', this.handleFormInteraction);
        this.loginForm?.addEventListener('click', this.handleFormInteraction);
        this.loginForm?.addEventListener('change', this.handleFormInteraction);
        this.loginForm?.addEventListener('focus', this.handleFormInteraction, true);
        this.loginForm?.addEventListener('blur', this.handleFormInteraction, true);
        document.getElementById('signup-btn')?.addEventListener('click', this.kanban.forwardRegister);
        document.getElementById('privacy-policy')?.addEventListener('click', this.kanban.forwardPrivacy);
        document.getElementById('legal-notice')?.addEventListener('click', this.kanban.forwardLegal);
    }

    /**
     * Deactivates all listeners for the login form.
     * @returns {void}
     */
    deactivateAllListenersLogin() {
        this.loginForm?.removeEventListener('submit', this.handleFormInteraction);
        this.loginForm?.removeEventListener('click', this.handleFormInteraction);
        this.loginForm?.removeEventListener('change', this.handleFormInteraction);
        this.loginForm?.removeEventListener('focus', this.handleFormInteraction, true);
        this.loginForm?.removeEventListener('blur', this.handleFormInteraction, true);
        document.getElementById('signup-btn')?.removeEventListener('click', this.kanban.forwardRegister);
        document.getElementById('privacy-policy')?.removeEventListener('click', this.kanban.forwardPrivacy);
        document.getElementById('legal-notice')?.removeEventListener('click', this.kanban.forwardLegal);
    }

    //NOTE - Main Event Handling
    /**
     * Handles all form events for the login form.
     * @param {Event} event
     * @returns {void}
     */
    handleFormInteraction = (event) => {
        if (!this.loginInstance) return;
        const target = event.target;
        switch (event.type) {
            case 'submit':
                event.preventDefault();
                this.loginInstance.loginButtonClick(event);
                break;
            case 'click':
                this._handleClick(target, event);
                break;
            case 'change':
                if (target.closest('#rememberMe')) this.loginInstance.checkBoxClicked();
                break;
            case 'focus':
                if (this._isFocusTargetInput(event)) this._clearErrorMessage();
                break;
            case 'blur':
                if (target.closest('#passwordInput')) this.loginInstance.resetPasswordStateOnBlur();
                break;
        }
    };

    /**
     * Handles click events for guest login, password visibility, and checkbox.
     * @private
     * @param {HTMLElement} target
     * @param {Event} event
     * @returns {void}
     */
    _handleClick(target, event) {
        if (target.closest('#guestLogin')) this.loginInstance.handleGuestLogin();
        else if (target.closest('#passwordInput')) this.loginInstance.handlePasswordVisibilityClick(event);
        else if (target.closest('#checkbox')) this._toggleRememberMeCheckbox();
    }

    /**
     * Toggles the remember me checkbox and triggers the handler.
     * @private
     * @returns {void}
     */
    _toggleRememberMeCheckbox() {
        const rememberMeCheckbox = document.getElementById('rememberMe');
        if (rememberMeCheckbox) rememberMeCheckbox.checked = !rememberMeCheckbox.checked;
        this.loginInstance.checkBoxClicked();
    }

    /**
     * Checks if the focus target is a relevant input.
     * @private
     * @param {Event} event
     * @returns {boolean}
     */
    _isFocusTargetInput(event) {
        const target = event.target;
        return target.closest('#loginInput') || target.closest('#passwordInput') || target.closest('#rememberMe');
    }

    /**
     * Clears the error message in the login form.
     * @private
     * @returns {void}
     */
    _clearErrorMessage() {
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.style.width = '0';
            errorMessage.style.opacity = '0';
            errorMessage.textContent = '';
        }
    }

    //NOTE - Error Handling
    /**
     * Logs an error message.
     * @param {string} msg
     * @returns {void}
     */
    _logError(msg) { console.error(msg); }
}