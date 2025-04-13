export class RegisterListener {
    constructor(kanban) {
        this.kanban = kanban;
        this.register = kanban.register;
        this.activateListener();
    }

    addPasswordFieldToggle(inputFieldId) {
        const passwordField = document.getElementById(inputFieldId);
        if (!passwordField) return;

        const togglePasswordVisibility = (event) => this.register.togglePassword(event, passwordField);
        const updateBackgroundOnFocus = () => this.register.updateBackgroundImage(passwordField, false);
        const resetOnBlur = () => this.register.resetState(passwordField);

        passwordField.addEventListener('click', togglePasswordVisibility);
        passwordField.addEventListener('focus', updateBackgroundOnFocus);
        passwordField.addEventListener('blur', resetOnBlur);
        passwordField._eventHandlers = { togglePasswordVisibility, updateBackgroundOnFocus, resetOnBlur };
    }


    removePasswordFieldToggle(inputFieldId) {
        const passwordField = document.getElementById(inputFieldId);
        if (!passwordField || !passwordField._eventHandlers) return;

        const { togglePasswordVisibility, updateBackgroundOnFocus, resetOnBlur } = passwordField._eventHandlers;
        passwordField.removeEventListener('click', togglePasswordVisibility);
        passwordField.removeEventListener('focus', updateBackgroundOnFocus);
        passwordField.removeEventListener('blur', resetOnBlur);
        delete passwordField._eventHandlers;
    }


    activateListener() {
        document.getElementById('signupForm')?.addEventListener('submit', this.register.submitData);
        document.getElementById('privacy-policy')?.addEventListener('click', this.register.checkBoxClicked);
        document.getElementById('back-btn')?.addEventListener('click', this.kanban.forwardToIndex);
        document.getElementById('privacy-policy-link')?.addEventListener('click', this.kanban.forwardPrivacy);
        document.getElementById('legal-notice-link')?.addEventListener('click', this.kanban.forwardLegal);
        this.addPasswordFieldToggle('password');
        this.addPasswordFieldToggle('confirmPassword');
    }



    deactivateAllListenersRegister() {
        document.getElementById('signupForm')?.removeEventListener('submit', this.register.submitData);
        document.getElementById('privacy-policy')?.removeEventListener('click', this.register.checkBoxClicked);
        document.getElementById('back-btn')?.removeEventListener('click', this.kanban.forwardToIndex);
        document.getElementById('privacy-policy-link')?.removeEventListener('click', this.kanban.forwardPrivacy);
        document.getElementById('legal-notice-link')?.removeEventListener('click', this.kanban.forwardLegal);
        this.removePasswordFieldToggle('password');
        this.removePasswordFieldToggle('confirmPassword');
    }

}