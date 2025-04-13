export class Register {
    constructor(kanban) {
        this.kanban = kanban;
        this.clickCount1 = 0;
        this.clickCount2 = 0;
    }


    togglePassword(event, inputField) {
        event.preventDefault();
        const cursorPos = inputField.selectionStart;
        const isVisible = (inputField.id === "password" ? this.clickCount1 : this.clickCount2) % 2 === 1;
        inputField.type = isVisible ? "text" : "password";
        this.updateBackgroundImage(inputField, isVisible);
        inputField.setSelectionRange(cursorPos, cursorPos);
        inputField.focus();

        if (inputField.id === "password") {
            this.clickCount1 += isVisible ? -1 : 1;
        } else {
            this.clickCount2 += isVisible ? -1 : 1;
        }
    }


    updateBackgroundImage(field, isVisible) {
        const image = isVisible ? "visibility.png" : "password_off.png";
        field.style.backgroundImage = `url('../assets/icons/${image}')`;
    }


    resetState(field) {
        field.type = "password";
        field.style.backgroundImage = "url('../assets/icons/password_input.png')";
        field.id === "password" ? this.clickCount1 = 0 : this.clickCount2 = 0;
    }


    async submitData(event) {
        event.preventDefault();
        const name = document.getElementById('userName').value.trim();
        const email = document.getElementById('userEmail').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        this.hideErrorMessages();
        if (!await this.validateForm(password, confirmPassword, email)) return;
        try {
            const response = await this.kanban.db.register(name, email, password, confirmPassword);
            const data = await response.json();
            if (!response.ok) throw new Error(data.email ? data.email[0] : 'An unknown error occurred.');
            this.showSuccessPopup();
            setTimeout(() => {
                window.location.href = "../index.html";
            }, 1500);
        } catch (error) {
            await this.handleError(error);
        }
    }


    async handleError(error) {
        hideErrorMessages();
        if (error.message.includes('Email already exists')) showError('emailExistsMessage');
    }


    hideErrorMessages() {
        document.getElementById('passwordErrorMessage').style.display = 'none';
        document.getElementById('mailErrorMessage').style.display = 'none';
        document.getElementById('criteriaMessage').style.display = 'none';
        document.getElementById('emailExistsMessage').style.display = 'none';
    }


    async validateForm(password, confirmPassword, email) {
        if (!document.getElementById('privacy-policy').checked) {
            return this.returnLoginError(document.getElementById('privacyCheck'));
        }
        if (!isValidEmail(email)) {
            return this.returnLoginError(document.getElementById('mailErrorMessage'));
        }
        if (!isValidPassword(password)) {
            return this.returnLoginError(document.getElementById('criteriaMessage'));
        }
        if (password !== confirmPassword) {
            return this.returnLoginError(document.getElementById('passwordErrorMessage'));
        }
        return true;
    }


    returnLoginError(errorWindow) {
        errorWindow.style.display = 'block';
        return false;
    }


    isValidPassword(password) {
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,:])[A-Za-z\d@$!%*?&.,:]{8,}$/;
        return regex.test(password);
    }


    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]+$/;
        return regex.test(email);
    }


    showSuccessPopup() {
        const popup = document.getElementById('successPopup');
        popup.style.display = 'block';
        popup.addEventListener('click', () => {
            window.location.href = '../index.html';
        });
    }


    showError(messageId) {
        document.getElementById(messageId).style.display = 'block';
    }


    checkBoxClicked() {
        const checkedState = document.getElementById('privacy-policy').checked;
        const checkboxImg = document.getElementById('checkbox');
        const submitButton = document.getElementById('signup-btn-register');
        submitButton.disabled = !checkedState;
        checkboxImg.src = checkedState ? '../assets/icons/checkboxchecked.svg' : '../assets/icons/checkbox.svg';
    }

}
