export class Register {
    constructor(kanban) {
        this.kanban = kanban;
        this.passwordVisible = false;
        this.confirmPasswordVisible = false;
    }

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
        } else {
            this.confirmPasswordVisible = !this.confirmPasswordVisible;
            isVisible = this.confirmPasswordVisible;
        }

        inputField.type = isVisible ? "text" : "password";
        this.updateBackgroundImage(inputField, isVisible);

        inputField.focus();
        inputField.setSelectionRange(selectionStart, selectionEnd);
    };

    resetPasswordStateOnBlur = (inputFieldId) => {
        const inputField = document.getElementById(inputFieldId);
        if (!inputField) return;

        if (inputFieldId === 'password') {
            this.passwordVisible = false;
        } else {
            this.confirmPasswordVisible = false;
        }

        inputField.type = "password";
        inputField.style.backgroundImage = "url('../assets/icons/password_input.png')";
    };

    updateBackgroundImage(field, isVisible) {
        const image = isVisible ? "visibility.png" : "password_off.png";
        field.style.backgroundImage = `url('../assets/icons/${image}')`;
    }

    submitData = async (event) => {
        event.preventDefault();
        const nameInput = document.getElementById('userName');
        const emailInput = document.getElementById('userEmail');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');

        if (!nameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
            console.error("Registrierungsformular-Elemente nicht gefunden!");
            this.showError('Ein interner Fehler ist aufgetreten. Bitte versuche es erneut.');
            return;
        }

        const name = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        this.hideErrorMessages();

        if (!this.validateForm(password, confirmPassword, email)) {
            return;
        }

        try {
            const registrationData = await this.kanban.db.register(name, email, password, confirmPassword);

            this.showSuccessPopup();
            setTimeout(() => {
                window.location.href = "../index.html";
            }, 1500);

        } catch (error) {
            console.error("Registrierungsfehler:", error);
            this.handleRegistrationError(error);
        }
    };

    checkBoxClicked = () => {
        const privacyCheckbox = document.getElementById('privacy-policy');
        const checkboxImg = document.getElementById('checkbox');
        const submitButton = document.getElementById('signup-btn-register');

        if (!privacyCheckbox || !checkboxImg || !submitButton) return;

        const checkedState = privacyCheckbox.checked;
        submitButton.disabled = !checkedState;
        checkboxImg.src = checkedState ? '../assets/icons/checkboxchecked.svg' : '../assets/icons/checkbox.svg';
    };

    validateForm(password, confirmPassword, email) {
        const privacyCheckbox = document.getElementById('privacy-policy');
        if (!privacyCheckbox || !privacyCheckbox.checked) {
            this.showErrorById('privacyCheck');
            return false;
        }
        if (!this.isValidEmail(email)) {
            this.showErrorById('mailErrorMessage');
            return false;
        }
        if (!this.isValidPassword(password)) {
            this.showErrorById('criteriaMessage');
            return false;
        }
        if (password !== confirmPassword) {
            this.showErrorById('passwordErrorMessage');
            return false;
        }
        return true;
    }

    handleRegistrationError(error) {
        const message = error.message || "Ein unbekannter Fehler ist aufgetreten.";
        if (message.toLowerCase().includes('email') && message.toLowerCase().includes('already exists')) {
            this.showErrorById('emailExistsMessage');
        } else if (message.toLowerCase().includes('password') && message.toLowerCase().includes('common')) {
            this.showError("Das Passwort ist zu unsicher oder zu gebräuchlich.");
        } else {
            this.showError(message);
        }
    }

    hideErrorMessages() {
        const errorMessages = document.querySelectorAll('#signupForm .error');
        errorMessages.forEach(el => el.style.display = 'none');
    }

    showErrorById(messageId) {
        const errorElement = document.getElementById(messageId);
        if (errorElement) {
            errorElement.style.display = 'block';
        }
    }

    showError(message) {
        const generalErrorElement = document.getElementById('emailExistsMessage');
        if (generalErrorElement) {
            generalErrorElement.textContent = message;
            generalErrorElement.style.display = 'block';
        } else {
            alert("Fehler: " + message);
            console.error("Fehler angezeigt via alert:", message);
        }
    }

    isValidPassword(password) {
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,:])[A-Za-z\d@$!%*?&.,:]{8,}$/;
        return regex.test(password);
    }

    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    }

    showSuccessPopup() {
        const popup = document.getElementById('successPopup');
        if (popup) {
            popup.style.display = 'flex';
            popup.addEventListener('click', () => {
                window.location.href = '../index.html';
            }, { once: true });
        }
    }
}
