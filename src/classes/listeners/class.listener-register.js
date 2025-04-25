import { Register } from '../class.register.js';

export class RegisterListener {
    //NOTE - Properties
    /** @type {object} Kanban app instance. */
    kanban;
    /** @type {Register} Register instance. */
    registerInstance;
    /** @type {HTMLFormElement|null} Signup form element. */
    signupForm;

    //NOTE - Constructor & Initialization
    /**
     * Creates a RegisterListener instance.
     * @param {object} kanban - Kanban app instance
     */
    constructor(kanban) {
        this.kanban = kanban;
        this.registerInstance = kanban.register || new Register(kanban);
        this.signupForm = document.getElementById('signupForm');
        if (!this.signupForm) this._logError("Signup form not found for RegisterListener.");
        this.activateListener();
    }

    //NOTE - Listener Management
    /**
     * Activates all relevant listeners for the register form.
     * @returns {void}
     */
    activateListener() {
        if (!this.signupForm) return;
        this.signupForm.addEventListener('submit', this.handleFormInteraction);
        this.signupForm.addEventListener('click', this.handleFormInteraction);
        this.signupForm.addEventListener('change', this.handleFormInteraction);
        this.signupForm.addEventListener('focus', this.handleFormInteraction, true);
        this.signupForm.addEventListener('blur', this.handleFormInteraction, true);
        const inputs = ['userName', 'userEmail', 'password', 'confirmPassword', 'privacy-policy'];
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', this._updateRegisterButtonState);
                el.addEventListener('change', this._updateRegisterButtonState);
            }
        });
        document.getElementById('back-btn')?.addEventListener('click', this.kanban.forwardToIndex);
        document.getElementById('privacy-policy-link')?.addEventListener('click', this.kanban.forwardPrivacy);
        document.getElementById('legal-notice-link')?.addEventListener('click', this.kanban.forwardLegal);
        this._updateRegisterButtonState();
    }

    /**
     * Deactivates all listeners for the register form.
     * @returns {void}
     */
    deactivateAllListenersRegister() {
        if (!this.signupForm) return;
        this.signupForm.removeEventListener('submit', this.handleFormInteraction);
        this.signupForm.removeEventListener('click', this.handleFormInteraction);
        this.signupForm.removeEventListener('change', this.handleFormInteraction);
        this.signupForm.removeEventListener('focus', this.handleFormInteraction, true);
        this.signupForm.removeEventListener('blur', this.handleFormInteraction, true);
        const inputs = ['userName', 'userEmail', 'password', 'confirmPassword', 'privacy-policy'];
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.removeEventListener('input', this._updateRegisterButtonState.bind(this));
                el.removeEventListener('change', this._updateRegisterButtonState.bind(this));
            }
        });
        document.getElementById('back-btn')?.removeEventListener('click', this.kanban.forwardToIndex);
        document.getElementById('privacy-policy-link')?.removeEventListener('click', this.kanban.forwardPrivacy);
        document.getElementById('legal-notice-link')?.removeEventListener('click', this.kanban.forwardLegal);
    }

    //NOTE - Main Event Handling
    /**
     * Handles all form events for the register form.
     * @param {Event} event
     * @returns {void}
     */
    handleFormInteraction = (event) => {
        if (!this.registerInstance) return;
        const target = event.target;
        switch (event.type) {
            case 'submit':
                this.registerInstance.submitData(event);
                break;
            case 'click':
                this._handleClick(target, event);
                break;
            case 'change':
                if (target.closest('#privacy-policy')) this.registerInstance.checkBoxClicked();
                break;
            case 'focus':
                if (target.matches('#userName, #userEmail, #password, #confirmPassword')) this.registerInstance.hideErrorMessages();
                break;
            case 'blur':
                if (target.closest('#password')) this.registerInstance.resetPasswordStateOnBlur('password');
                else if (target.closest('#confirmPassword')) this.registerInstance.resetPasswordStateOnBlur('confirmPassword');
                break;
        }
    };

    /**
     * Handles click events for password visibility and checkbox.
     * @private
     * @param {HTMLElement} target
     * @param {Event} event
     * @returns {void}
     */
    _handleClick(target, event) {
        if (target.closest('#password')) this.registerInstance.handlePasswordVisibilityClick(event, 'password');
        else if (target.closest('#confirmPassword')) this.registerInstance.handlePasswordVisibilityClick(event, 'confirmPassword');
        else if (target.closest('#checkbox')) this._togglePrivacyCheckbox();
    }

    /**
     * Toggles the privacy checkbox and triggers the handler.
     * @private
     * @returns {void}
     */
    _togglePrivacyCheckbox() {
        const privacyCheckbox = document.getElementById('accept-policy');
        if (privacyCheckbox) privacyCheckbox.checked = !privacyCheckbox.checked;
        this.registerInstance.checkBoxClicked();
    }

    /**
     * Checks if all required fields are filled and valid, and enables/disables the register button accordingly.
     */
    _updateRegisterButtonState = () => {
        if (!this.registerInstance) return;
        const { nameInput, emailInput, passwordInput, confirmPasswordInput, privacyCheckbox } = this.registerInstance._getFormInputs();
        const submitButton = document.getElementById('signup-btn-register');
        if (!nameInput || !emailInput || !passwordInput || !confirmPasswordInput || !privacyCheckbox || !submitButton) return;
        console.log("Register button state updated.");
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const isPrivacyChecked = privacyCheckbox.checked;
        const allFilled = name && email && password && confirmPassword && isPrivacyChecked;
        submitButton.disabled = !(allFilled);
    };

    //NOTE - Error Handling
    /**
     * Logs an error message.
     * @param {string} msg
     * @returns {void}
     */
    _logError(msg) { console.error(msg); }
}