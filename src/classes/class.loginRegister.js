import { Contact } from "./class.contact.js";

export class LoginRegister {
    constructor(kanban) {
        this.kanban = kanban;
        this.page;

        if (document.location.pathname.includes('register.html')) {
            this.clickCount1 = 0;
            this.clickCount2 = 0;
            this.page = 'register';
        } else {
            this.passwordInput = document.getElementById('passwordInput');
            this.isPasswordVisible = false;
            this.clickCount = -1;
            this.page = 'login';
            this.initLogin();
        }
    }


    //NOTE - Initial Login function


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
        this.clickCount = clickCount === 0 ? 1 : 0;
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



    //NOTE - Initial Register function


    togglePassword(event, inputField) {
        event.preventDefault();
        const cursorPos = inputField.selectionStart;
        const isVisible = (inputField.id === "password" ? clickCount1 : clickCount2) % 2 === 1;
        inputField.type = isVisible ? "text" : "password";
        updateBackgroundImage(inputField, isVisible);
        inputField.setSelectionRange(cursorPos, cursorPos);
        inputField.focus();

        if (inputField.id === "password") {
            clickCount1 += isVisible ? -1 : 1;
        } else {
            clickCount2 += isVisible ? -1 : 1;
        }
    }


    updateBackgroundImage(field, isVisible) {
        const image = isVisible ? "visibility.png" : "password_off.png";
        field.style.backgroundImage = `url('../assets/icons/${image}')`;
    }


    resetState(field) {
        field.type = "password";
        field.style.backgroundImage = "url('../assets/icons/password_input.png')";
        field.id === "password" ? clickCount1 = 0 : clickCount2 = 0;
    }


    async submitData(event) {
        event.preventDefault();
        const name = document.getElementById('userName').value.trim();
        const email = document.getElementById('userEmail').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        hideErrorMessages();
        if (!await validateForm(password, confirmPassword, email)) return;
        try {
            const response = await Kanban.register(name, email, password, confirmPassword);
            const data = await response.json();
            if (!response.ok) throw new Error(data.email ? data.email[0] : 'An unknown error occurred.');
            setToken(data.token);
            await signUp(data);
        } catch (error) {
            await handleError(error);
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
            return returnLoginError(document.getElementById('privacyCheck'));
        }
        if (!isValidEmail(email)) {
            return returnLoginError(document.getElementById('mailErrorMessage'));
        }
        if (!isValidPassword(password)) {
            return returnLoginError(document.getElementById('criteriaMessage'));
        }
        if (password !== confirmPassword) {
            return returnLoginError(document.getElementById('passwordErrorMessage'));
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


    async signUp(data) {
        try {
            await createNewContact(data);
            showSuccessPopup();
            setTimeout(() => {
                window.location.href = "../index.html";
            }, 1500);
        } catch (error) {
            handleError(error);
        }
    }


    async createNewContact(data) {
        const contact = await createContact(data.id, data.name, data.email, 'Please add phone number', false, true);
        await updateDataInDatabase(`${BASE_URL}api/contacts/${contact.id}/`, contact);
        contacts.push(pushToContacts(contact));
        sessionStorage.setItem("contacts", JSON.stringify(contacts));
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