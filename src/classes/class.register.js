/**
 * Handles user registration, validation, and UI feedback for the registration form.
 */
export class Register {
    //NOTE - Properties
    /** @type {object} Kanban app instance. */
    kanban;
    /** @type {boolean} Password field visible. */
    passwordVisible = false;
    /** @type {boolean} Confirm password field visible. */
    confirmPasswordVisible = false;

    //NOTE - Constructor & Initialization
    /**
     * @param {object} kanban - Kanban app instance
     */
    constructor(kanban) {
        this.kanban = kanban;
    }

    //NOTE - Core Registration Action
    /**
     * Handles form submission for registration.
     * @param {Event} event
     */
    submitData = async (event) => {
        event.preventDefault();
        const { nameInput, emailInput, passwordInput, confirmPasswordInput, privacyCheckbox } = this._getFormInputs();
        if (!nameInput || !emailInput || !passwordInput || !confirmPasswordInput || !privacyCheckbox) {
            this._logError('Registration form elements not found!');
            this.showError('An internal error occurred (form incomplete). Please try again.');
            return;
        }
        const name = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const isPrivacyChecked = privacyCheckbox.checked;
        this.hideErrorMessages();
        if (!this.validateForm(password, confirmPassword, email, isPrivacyChecked)) return;
        await this._registerUser(name, email, password, confirmPassword);
    };

    //NOTE - Input Validation
    /**
     * Validates the registration form fields. Only the first error is shown.
     * @param {string} password
     * @param {string} confirmPassword
     * @param {string} email
     * @param {boolean} isPrivacyChecked
     * @returns {boolean}
     */
    validateForm(password, confirmPassword, email, isPrivacyChecked) {
        if (!isPrivacyChecked) return this._invalidate('privacyCheck');
        if (!this.isValidEmail(email)) return this._invalidate('mailErrorMessage');
        if (!this.isValidPassword(password)) return this._invalidate('criteriaMessage');
        if (password !== confirmPassword) return this._invalidate('passwordErrorMessage');
        return true;
    }

    /**
     * Checks if the password meets requirements.
     * @param {string} password
     * @returns {boolean}
     */
    isValidPassword(password) {
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,:])[A-Za-z\d@$!%*?&.,:]{8,}$/;
        return regex.test(password);
    }

    /**
     * Checks if the email is valid.
     * @param {string} email
     * @returns {boolean}
     */
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    }

    //NOTE - UI Event Handlers & Updates
    /**
     * Handles password visibility toggle.
     * @param {Event} event
     * @param {string} inputFieldId
     */
    handlePasswordVisibilityClick = (event, inputFieldId) => {
        event?.preventDefault();
        const inputField = document.getElementById(inputFieldId);
        if (!inputField) return;
        const selectionStart = inputField.selectionStart;
        const selectionEnd = inputField.selectionEnd;
        let isVisible;
        if (inputFieldId === 'password') {
            this.passwordVisible = !this.passwordVisible;
            isVisible = this.passwordVisible;
        } else if (inputFieldId === 'confirmPassword') {
            this.confirmPasswordVisible = !this.confirmPasswordVisible;
            isVisible = this.confirmPasswordVisible;
        } else return;
        inputField.type = isVisible ? "text" : "password";
        this.updateBackgroundImage(inputField, isVisible);
        inputField.focus();
        requestAnimationFrame(() => {
            inputField.setSelectionRange(selectionStart, selectionEnd);
        });
    };

    /**
     * Updates the password field background image.
     * @param {HTMLElement} field
     * @param {boolean} isVisible
     */
    updateBackgroundImage(field, isVisible) {
        const image = isVisible ? "visibility.png" : "password_off.png";
        field.style.backgroundImage = `url('../assets/icons/${image}')`;
    }

    /**
     * Resets password field state on blur.
     * @param {string} inputFieldId
     */
    resetPasswordStateOnBlur = (inputFieldId) => {
        const inputField = document.getElementById(inputFieldId);
        if (!inputField) return;
        let shouldReset = false;
        if (inputFieldId === 'password' && this.passwordVisible) {
            this.passwordVisible = false;
            shouldReset = true;
        } else if (inputFieldId === 'confirmPassword' && this.confirmPasswordVisible) {
            this.confirmPasswordVisible = false;
            shouldReset = true;
        }
        if (shouldReset) {
            inputField.type = "password";
            inputField.style.backgroundImage = "url('../assets/icons/password_input.png')";
        }
    };

    /**
     * Handles privacy checkbox click.
     */
    checkBoxClicked = () => {
        const privacyCheckbox = document.getElementById('privacy-policy');
        const checkboxImg = document.getElementById('checkbox');
        const submitButton = document.getElementById('signup-btn-register');
        if (!privacyCheckbox || !checkboxImg || !submitButton) return;
        const checkedState = privacyCheckbox.checked;
        submitButton.disabled = !checkedState;
        checkboxImg.src = checkedState ? '../assets/icons/checkboxchecked.svg' : '../assets/icons/checkbox.svg';
    };

    //NOTE - UI Feedback & Error Handling
    /**
     * Shows the registration success popup.
     */
    showSuccessPopup() {
        const popup = document.getElementById('successPopup');
        if (popup) {
            popup.style.display = 'flex';
            popup.addEventListener('click', () => {
                window.location.href = '../index.html';
            }, { once: true });
        }
    }

    /**
     * Handles registration errors and displays messages.
     * @param {Error} error
     */
    handleRegistrationError(error) {
        const message = error?.message || error?.detail || "An unknown registration error occurred.";
        if (this._isEmailExistsError(message)) this.showErrorById('emailExistsMessage');
        else if (this._isWeakPasswordError(message)) this.showError("The password is too weak or too common.");
        else this.showError(message);
    }

    /**
     * Hides all error messages in the form.
     */
    hideErrorMessages() {
        const errorMessages = document.querySelectorAll('#signupForm .error');
        errorMessages.forEach(el => el.style.display = 'none');
    }

    /**
     * Shows an error message by element ID.
     * @param {string} messageId
     */
    showErrorById(messageId) {
        const errorElement = document.getElementById(messageId);
        if (errorElement) {
            errorElement.style.display = 'block';
        }
    }

    /**
     * Shows a general error message.
     * @param {string} message
     */
    showError(message) {
        const generalErrorElement = document.getElementById('generalErrorMessage');
        if (generalErrorElement) {
            generalErrorElement.textContent = message;
            generalErrorElement.style.display = 'block';
        } else {
            alert("Error: " + message);
            this._logError("Error shown via alert: " + message);
        }
    }

    //NOTE --- Private helpers ---
    /** @private */
    async _registerUser(name, email, password, confirmPassword) {
        try {
            await this.kanban.db.register(name, email, password, confirmPassword);
            this.showSuccessPopup();
            setTimeout(() => { window.location.href = "../index.html"; }, 1500);
        } catch (error) {
            this._logError('Registration error: ' + error);
            this.handleRegistrationError(error);
        }
    }

    /** @private */
    _invalidate(messageId) {
        this.showErrorById(messageId);
        return false;
    }

    /** @private */
    _isEmailExistsError(message) {
        const msg = message.toLowerCase();
        return msg.includes('email') && (msg.includes('exist') || msg.includes('already in use'));
    }

    /** @private */
    _isWeakPasswordError(message) {
        const msg = message.toLowerCase();
        return msg.includes('password') && msg.includes('common');
    }

    /** @private */
    _logError(msg) { console.error(msg); }

    /** @private */
    _getFormInputs() {
        return {
            nameInput: document.getElementById('userName'),
            emailInput: document.getElementById('userEmail'),
            passwordInput: document.getElementById('password'),
            confirmPasswordInput: document.getElementById('confirmPassword'),
            privacyCheckbox: document.getElementById('privacy-policy')
        };
    }
}
