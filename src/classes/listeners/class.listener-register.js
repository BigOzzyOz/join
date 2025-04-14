import { Register } from '../class.register.js';

export class RegisterListener {
    constructor(kanban) {
        this.kanban = kanban;
        this.registerInstance = kanban.register || new Register(kanban);
        this.signupForm = document.getElementById('signupForm');
        this.activateListener();
    }

    handleFormInteraction = (event) => {
        if (!this.registerInstance) return;

        const target = event.target;

        if (event.type === 'submit') {
            this.registerInstance.submitData(event);
            return;
        }

        if (event.type === 'click') {
            if (target.closest('#password')) {
                this.registerInstance.handlePasswordVisibilityClick(event, 'password');
            }
            else if (target.closest('#confirmPassword')) {
                this.registerInstance.handlePasswordVisibilityClick(event, 'confirmPassword');
            }
            else if (target.closest('#checkbox')) {
                const privacyCheckbox = document.getElementById('privacy-policy');
                if (privacyCheckbox) privacyCheckbox.checked = !privacyCheckbox.checked;
                this.registerInstance.checkBoxClicked();
                return;
            }
            else if (target.closest('#back-btn')) {
                event.preventDefault();
                this.kanban.forwardToIndex();
                return;
            }
        }

        if (event.type === 'change') {
            if (target.closest('#privacy-policy')) {
                this.registerInstance.checkBoxClicked();
                return;
            }
        }

        if (event.type === 'focus') {
            if (target.matches('#userName, #userEmail, #password, #confirmPassword')) {
                this.registerInstance.hideErrorMessages();
            }
        }

        if (event.type === 'blur') {
            if (target.closest('#password')) {
                this.registerInstance.resetPasswordStateOnBlur('password');
                return;
            }
            if (target.closest('#confirmPassword')) {
                this.registerInstance.resetPasswordStateOnBlur('confirmPassword');
                return;
            }
        }
    };

    activateListener() {
        if (!this.signupForm) return;

        this.signupForm.addEventListener('submit', this.handleFormInteraction);
        this.signupForm.addEventListener('click', this.handleFormInteraction);
        this.signupForm.addEventListener('change', this.handleFormInteraction);
        this.signupForm.addEventListener('focus', this.handleFormInteraction, true);
        this.signupForm.addEventListener('blur', this.handleFormInteraction, true);

        document.getElementById('back-btn')?.addEventListener('click', this.handleFormInteraction);
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

        document.getElementById('back-btn')?.removeEventListener('click', this.handleFormInteraction);
        document.getElementById('privacy-policy-link')?.removeEventListener('click', this.kanban.forwardPrivacy);
        document.getElementById('legal-notice-link')?.removeEventListener('click', this.kanban.forwardLegal);
    }
}