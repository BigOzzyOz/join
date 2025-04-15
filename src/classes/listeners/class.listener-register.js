import { Register } from '../class.register.js';

export class RegisterListener {
    //NOTE - Properties

    kanban;
    registerInstance;
    signupForm;

    //NOTE - Constructor & Initialization

    constructor(kanban) {
        this.kanban = kanban;
        this.registerInstance = kanban.register || new Register(kanban);
        this.signupForm = document.getElementById('signupForm');

        if (!this.signupForm) {
            console.error("Signup form not found for RegisterListener.");
        }

        this.activateListener();
    }

    //NOTE - Listener Management

    activateListener() {
        if (!this.signupForm) return;

        this.signupForm.addEventListener('submit', this.handleFormInteraction);
        this.signupForm.addEventListener('click', this.handleFormInteraction);
        this.signupForm.addEventListener('change', this.handleFormInteraction);
        this.signupForm.addEventListener('focus', this.handleFormInteraction, true);
        this.signupForm.addEventListener('blur', this.handleFormInteraction, true);

        document.getElementById('back-btn')?.addEventListener('click', this.kanban.forwardToIndex);
        document.getElementById('privacy-policy-link')?.addEventListener('click', this.kanban.forwardPrivacy);
        document.getElementById('legal-notice-link')?.addEventListener('click', this.kanban.forwardLegal);
    }

    deactivateAllListenersRegister() {
        if (!this.signupForm) return;

        this.signupForm.removeEventListener('submit', this.handleFormInteraction);
        this.signupForm.removeEventListener('click', this.handleFormInteraction);
        this.signupForm.removeEventListener('change', this.handleFormInteraction);
        this.signupForm.removeEventListener('focus', this.handleFormInteraction, true);
        this.signupForm.removeEventListener('blur', this.handleFormInteraction, true);

        document.getElementById('back-btn')?.removeEventListener('click', this.kanban.forwardToIndex);
        document.getElementById('privacy-policy-link')?.removeEventListener('click', this.kanban.forwardPrivacy);
        document.getElementById('legal-notice-link')?.removeEventListener('click', this.kanban.forwardLegal);
    }

    //NOTE - Main Event Handling

    handleFormInteraction = (event) => {
        if (!this.registerInstance) return;

        const target = event.target;

        switch (event.type) {
            case 'submit':
                this.registerInstance.submitData(event);
                break;

            case 'click':
                if (target.closest('#password')) {
                    this.registerInstance.handlePasswordVisibilityClick(event, 'password');
                } else if (target.closest('#confirmPassword')) {
                    this.registerInstance.handlePasswordVisibilityClick(event, 'confirmPassword');
                } else if (target.closest('#checkbox')) {
                    const privacyCheckbox = document.getElementById('accept-policy');
                    if (privacyCheckbox) {
                        privacyCheckbox.checked = !privacyCheckbox.checked;
                        this.registerInstance.checkBoxClicked();
                    }
                }
                break;

            case 'change':
                if (target.closest('#privacy-policy')) {
                    this.registerInstance.checkBoxClicked();
                }
                break;

            case 'focus':
                if (target.matches('#userName, #userEmail, #password, #confirmPassword')) {
                    this.registerInstance.hideErrorMessages();
                }
                break;

            case 'blur':
                if (target.closest('#password')) {
                    this.registerInstance.resetPasswordStateOnBlur('password');
                } else if (target.closest('#confirmPassword')) {
                    this.registerInstance.resetPasswordStateOnBlur('confirmPassword');
                }
                break;
        }
    };
}