export class RegisterListener {
    constructor(kanban) {
        this.kanban = kanban;
        this.activateListener();
    }

    addPasswordFieldToggle(inputFieldId) {
        const passwordField = document.getElementById(inputFieldId);
        if (!passwordField) return;

        const togglePasswordVisibility = (event) => togglePassword(event, passwordField);
        const updateBackgroundOnFocus = () => updateBackgroundImage(passwordField, false);
        const resetOnBlur = () => resetState(passwordField);

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
        document.getElementById('signupForm')?.addEventListener('submit', submitData);
        document.getElementById('privacy-policy')?.addEventListener('click', checkBoxClicked);
        document.getElementById('back-btn')?.addEventListener('click', forwardToIndex);
        document.getElementById('privacy-policy-link')?.addEventListener('click', forwardPrivacy);
        document.getElementById('legal-notice-link')?.addEventListener('click', forwardLegal);
        addPasswordFieldToggle('password');
        addPasswordFieldToggle('confirmPassword');
    }



    deactivateAllListenersRegister() {
        document.getElementById('signupForm')?.removeEventListener('submit', submitData);
        document.getElementById('privacy-policy')?.removeEventListener('click', checkBoxClicked);
        document.getElementById('back-btn')?.removeEventListener('click', forwardToIndex);
        document.getElementById('privacy-policy-link')?.removeEventListener('click', forwardPrivacy);
        document.getElementById('legal-notice-link')?.removeEventListener('click', forwardLegal);
        removePasswordFieldToggle('password');
        removePasswordFieldToggle('confirmPassword');
    }

}