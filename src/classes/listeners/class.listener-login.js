export class LoginListener {
    constructor(kanban) {
        this.kanban = kanban;
        this.login = kanban.login;
        this.activateListener();
    }

    activateListener() {
        document.getElementById('rememberMe')?.addEventListener('click', this.login.checkBoxClicked);
        document.getElementById('loginButton')?.addEventListener('click', this.login.loginButtonClick);
        document.getElementById('guestLogin')?.addEventListener('click', this.login.handleGuestLogin);
        document.getElementById('signup-btn')?.addEventListener('click', this.kanban.forwardRegister);
        document.getElementById('privacy-policy')?.addEventListener('click', this.kanban.forwardPrivacy);
        document.getElementById('legal-notice')?.addEventListener('click', this.kanban.forwardLegal);
    };


    deactivateAllListenersLogin() {
        const loginForm = document.getElementById('login-form');
        const login = loginForm?.querySelector('#loginInput');
        const passwordInput = loginForm?.querySelector('#passwordInput');
        const checkbox = loginForm?.querySelector('#checkbox');
        document.getElementById('rememberMe')?.removeEventListener('click', this.login.checkBoxClicked);
        document.getElementById('loginButton')?.removeEventListener('click', this.login.loginButtonClick);
        document.getElementById('guestLogin')?.removeEventListener('click', this.login.handleGuestLogin);
        document.getElementById('signup-btn')?.removeEventListener('click', this.kanaban.forwardRegister);
        document.getElementById('privacy-policy')?.removeEventListener('click', this.kanban.forwardPrivacy);
        document.getElementById('legal-notice')?.removeEventListener('click', this.kanban.forwardLegal);
        [login, passwordInput, checkbox]?.forEach((input) => {
            input?.removeEventListener('focus', () => {
                const errorMessage = document.getElementById('error-message');
                errorMessage.style.width = '0';
                errorMessage.textContent = '';
            });
        });
    }

}