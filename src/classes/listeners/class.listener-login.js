export class LoginListener {
    //NOTE - Properties
    kanban;
    loginInstance;
    loginForm;

    //NOTE - Constructor & Initialization
    constructor(kanban) {
        this.kanban = kanban;
        this.loginInstance = kanban.login;
        this.loginForm = document.getElementById('login-form');

        if (!this.loginInstance) {
            console.error("Login instance is missing in LoginListener constructor.");
        }
        if (!this.loginForm) {
            console.error("Login form not found for LoginListener.");
        }

        this.activateListener();
    }

    //NOTE - Listener Management

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

    //NOTE - Main Event Handling

    handleFormInteraction = (event) => {
        if (!this.loginInstance) return;

        const target = event.target;

        switch (event.type) {
            case 'submit':
                event.preventDefault();
                this.loginInstance.loginButtonClick(event);
                break;

            case 'click':
                if (target.closest('#guestLogin')) {
                    this.loginInstance.handleGuestLogin();
                } else if (target.closest('#passwordInput')) {
                    this.loginInstance.handlePasswordVisibilityClick(event);
                } else if (target.closest('#checkbox')) {
                    const rememberMeCheckbox = document.getElementById('rememberMe');
                    if (rememberMeCheckbox) {
                        rememberMeCheckbox.checked = !rememberMeCheckbox.checked;
                        this.loginInstance.checkBoxClicked();
                    }
                }
                break;

            case 'change':
                if (target.closest('#rememberMe')) {
                    this.loginInstance.checkBoxClicked();
                }
                break;

            case 'focus':
                if (this.isFocusTargetInput(event)) {
                    const errorMessage = document.getElementById('error-message');
                    if (errorMessage) {
                        errorMessage.style.width = '0';
                        errorMessage.style.opacity = '0';
                        errorMessage.textContent = '';
                    }
                }
                break;

            case 'blur':
                if (target.closest('#passwordInput')) {
                    this.loginInstance.resetPasswordStateOnBlur();
                }
                break;
        }
    };

    //NOTE - Helper Functions

    isFocusTargetInput(event) {
        const target = event.target;
        return target.closest('#loginInput') || target.closest('#passwordInput') || target.closest('#rememberMe');
    }
}