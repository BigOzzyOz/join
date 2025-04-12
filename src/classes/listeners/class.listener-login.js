export class LoginListener {
    constructor(kanban) {
        this.kanban = kanban;
        this.lr = kanban.loginRegister;
        this.activateListener();
    }

    activateListener() {
        document.getElementById('rememberMe')?.addEventListener('click', this.lr.checkBoxClicked);
        document.getElementById('loginButton')?.addEventListener('click', this.lr.loginButtonClick);
        document.getElementById('guestLogin')?.addEventListener('click', this.lr.handleGuestLogin);
        document.getElementById('signup-btn')?.addEventListener('click', this.lr.forwardRegister);
        document.getElementById('privacy-policy')?.addEventListener('click', this.lr.forwardPrivacy);
        document.getElementById('legal-notice')?.addEventListener('click', this.lr.forwardLegal);
    };


    deactivateAllListenersLogin() {
        const loginForm = document.getElementById('login-form');
        const login = loginForm?.querySelector('#loginInput');
        const passwordInput = loginForm?.querySelector('#passwordInput');
        const checkbox = loginForm?.querySelector('#checkbox');
        document.getElementById('rememberMe')?.removeEventListener('click', this.lr.checkBoxClicked);
        document.getElementById('loginButton')?.removeEventListener('click', this.lr.loginButtonClick);
        document.getElementById('guestLogin')?.removeEventListener('click', this.lr.handleGuestLogin);
        document.getElementById('signup-btn')?.removeEventListener('click', this.lr.forwardRegister);
        document.getElementById('privacy-policy')?.removeEventListener('click', this.lr.forwardPrivacy);
        document.getElementById('legal-notice')?.removeEventListener('click', this.lr.forwardLegal);
        [login, passwordInput, checkbox]?.forEach((input) => {
            input?.removeEventListener('focus', () => {
                const errorMessage = document.getElementById('error-message');
                errorMessage.style.width = '0';
                errorMessage.textContent = '';
            });
        });
    }

}