export class LoginListener {
    constructor(kanban) {
        this.kanban = kanban;
        this.loginInstance = kanban.login;
        this.loginForm = document.getElementById('login-form');
        this.loginInputElement = this.loginForm?.querySelector('#loginInput');
        this.passwordInput = this.loginForm?.querySelector('#passwordInput');
        this.checkboxElement = this.loginForm?.querySelector('#checkbox');
        this.activateListener();
    }

    handleFormInteraction = (event) => {
        if (!this.loginInstance) return;

        if (event.type === 'submit') {
            event.preventDefault();
            this.loginInstance.loginButtonClick(event);
            return;
        }

        if (event.type === 'click') {
            const target = event.target;
            if (target.closest('#guestLogin')) {
                this.loginInstance.handleGuestLogin();
                return;
            }
            if (target.closest('#passwordInput')) {
                this.loginInstance.handlePasswordVisibilityClick(event);
                return;
            }
            if (target.closest('#checkbox')) {
                this.loginInstance.checkBoxClicked();
                const rememberMeCheckbox = document.getElementById('rememberMe');
                if (rememberMeCheckbox) rememberMeCheckbox.checked = !rememberMeCheckbox.checked;
                return;
            }
        }

        if (event.type === 'change') {
            const target = event.target;
            if (target.closest('#rememberMe')) {
                this.loginInstance.checkBoxClicked();
                return;
            }
        }

        if (event.type === 'focus') {
            if (this.isFocusTargetInput(event)) {
                const errorMessage = document.getElementById('error-message');
                if (errorMessage) {
                    errorMessage.style.width = '0';
                    errorMessage.style.opacity = '0';
                    errorMessage.textContent = '';
                }
                return;
            }
        }

        if (event.type === 'blur') {
            const target = event.target;
            if (target.closest('#passwordInput')) {
                this.loginInstance.resetPasswordStateOnBlur();
                return;
            }
        }
    };

    activateListener() {
        this.loginForm?.addEventListener('submit', this.handleFormInteraction);
        this.loginForm?.addEventListener('click', this.handleFormInteraction);
        this.loginForm?.addEventListener('change', this.handleFormInteraction);
        this.loginForm?.addEventListener('focus', this.handleFormInteraction, true);
        this.loginForm?.addEventListener('blur', this.handleFormInteraction, true);
        document.getElementById('signup-btn')?.addEventListener('click', this.kanban.forwardRegister);
        document.getElementById('privacy-policy')?.addEventListener('click', this.kanban.forwardPrivacy);
        document.getElementById('legal-notice')?.addEventListener('click', this.kanban.forwardLegal);
    };

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

    isFocusTargetInput(event) {
        const target = event.target;
        return target.closest('#loginInput') || target.closest('#passwordInput') || target.closest('#rememberMe');
    }
}