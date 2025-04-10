// import { contacts, updateDataInDatabase, toggleLoader } from "../script.js";
// import { pushToContacts } from "./contacts.js";
// import { createContact } from "./contactsTemplate.js";
// import { forwardLegal, forwardPrivacy } from "./login.js";
// import { BASE_URL, token, setToken } from "./api-init.js";


//NOTE - Global Register Variables


let clickCount1 = 0;
let clickCount2 = 0;


//NOTE - Initial Register function



/**
 * Initializes the registration page by activating necessary event listeners.
 * This function sets up interactions for the registration form and its elements.
 */
export function initRegister() {
    activateListener();
}


/**
 * Adds event listeners to a specified password input field to handle password visibility toggling
 * and background image updates.
 * - Attaches a click event listener to toggle password visibility.
 * - Attaches a focus event listener to update the background image.
 * - Attaches a blur event listener to reset the input field state.
 * 
 * @param {string} inputFieldId - The ID of the password input field to attach the event listeners to.
 */
function addPasswordFieldToggle(inputFieldId) {
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


/**
 * Removes event listeners for a password field that were added by addPasswordFieldToggle.
 * @param {string} inputFieldId - The id of the password field.
 */
function removePasswordFieldToggle(inputFieldId) {
    const passwordField = document.getElementById(inputFieldId);
    if (!passwordField || !passwordField._eventHandlers) return;

    const { togglePasswordVisibility, updateBackgroundOnFocus, resetOnBlur } = passwordField._eventHandlers;
    passwordField.removeEventListener('click', togglePasswordVisibility);
    passwordField.removeEventListener('focus', updateBackgroundOnFocus);
    passwordField.removeEventListener('blur', resetOnBlur);
    delete passwordField._eventHandlers;
}


/**
 * Activates event listeners for the register page.
 * - Attaches a submit event listener to the register form to handle form submission.
 * - Attaches a click event listener to the privacy policy checkbox to toggle the checkbox icon.
 * - Attaches a click event listener to the back button to forward the user to the index page.
 * - Attaches a click event listener to the privacy policy link to open the privacy policy page.
 * - Attaches a click event listener to the legal notice link to open the legal notice page.
 * - Attaches a click event listener to the password fields to toggle password visibility.
 */
function activateListener() {
    document.getElementById('signupForm')?.addEventListener('submit', submitData);
    document.getElementById('privacy-policy')?.addEventListener('click', checkBoxClicked);
    document.getElementById('back-btn')?.addEventListener('click', forwardToIndex);
    document.getElementById('privacy-policy-link')?.addEventListener('click', forwardPrivacy);
    document.getElementById('legal-notice-link')?.addEventListener('click', forwardLegal);
    addPasswordFieldToggle('password');
    addPasswordFieldToggle('confirmPassword');
}


/**
 * Deactivates all event listeners related to the register page.
 * - Removes the submit event listener from the register form.
 * - Removes the click event listener from the privacy policy checkbox.
 * - Removes the click event listener from the back button to prevent forwarding to the login page.
 * - Removes the click event listener from the privacy policy link to prevent navigation.
 * - Removes the click event listener from the legal notice link to prevent navigation.
 * - Removes the event listeners for the password input fields to prevent password visibility toggling.
 */
export function deactivateAllListenersRegister() {
    document.getElementById('signupForm')?.removeEventListener('submit', submitData);
    document.getElementById('privacy-policy')?.removeEventListener('click', checkBoxClicked);
    document.getElementById('back-btn')?.removeEventListener('click', forwardToIndex);
    document.getElementById('privacy-policy-link')?.removeEventListener('click', forwardPrivacy);
    document.getElementById('legal-notice-link')?.removeEventListener('click', forwardLegal);
    removePasswordFieldToggle('password');
    removePasswordFieldToggle('confirmPassword');
}

/**
 * Forwards the user to the index page.
 */
function forwardToIndex() {
    window.location.href = '../index.html';
}


/**
 * Toggles the visibility of the provided input field by changing its type and
 * its background image. Also handles the cursor position and focus.
 * @param {Event} event - The event object passed from the event listener.
 * @param {HTMLInputElement} inputField - The HTML input element to toggle.
 */
function togglePassword(event, inputField) {
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


/**
 * Updates the background image of the provided input field based on the provided visibility status.
 * - If the password is visible, sets the background image to "visibility.png".
 * - If the password is not visible, sets the background image to "password_off.png".
 * @param {HTMLInputElement} field - The HTML input element to update.
 * @param {boolean} isVisible - The visibility status of the password.
 */
function updateBackgroundImage(field, isVisible) {
    const image = isVisible ? "visibility.png" : "password_off.png";
    field.style.backgroundImage = `url('../assets/icons/${image}')`;
}


/**
 * Resets the state of the password input field by setting its type to "password",
 * updating its background image, and resetting the click count and visibility status.
 * @param {HTMLInputElement} field - The HTML input element of the password input field.
 */
function resetState(field) {
    field.type = "password";
    field.style.backgroundImage = "url('../assets/icons/password_input.png')";
    field.id === "password" ? clickCount1 = 0 : clickCount2 = 0;
}


/**
 * Handles the form submission event for user registration.
 * - Prevents the default form submission behavior.
 * - Retrieves and trims input values for name, email, password, and confirm password.
 * - Hides any visible error messages.
 * - Validates the form input; aborts submission if validation fails.
 * - Attempts to sign up the user with the provided credentials.
 * - Logs a success message if the sign-up process is successful.
 * - Invokes error handling if an error occurs during sign-up.
 * 
 * @param {Event} event - The event object from the form submission.
 * @returns {Promise<void>} - Resolves when the form submission handling is complete.
 */
async function submitData(event) {
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


async function handleError(error) {
    hideErrorMessages();
    if (error.message.includes('Email already exists')) showError('emailExistsMessage');
}


/**
 * Hides all error messages on the registration form.
 * This function is called after the user submits the form or when the user starts typing in an input field to hide any error messages that may have been displayed previously.
 */
function hideErrorMessages() {
    document.getElementById('passwordErrorMessage').style.display = 'none';
    document.getElementById('mailErrorMessage').style.display = 'none';
    document.getElementById('criteriaMessage').style.display = 'none';
    document.getElementById('emailExistsMessage').style.display = 'none';
}


/**
 * Validates the registration form by checking the privacy policy acceptance,
 * email format, password criteria, and matching password fields.
 * 
 * - Ensures the privacy policy checkbox is checked.
 * - Validates the email format.
 * - Checks if the email already exists in the database.
 * - Validates the password against specific criteria.
 * - Confirms that the password and confirmation password match.
 * 
 * @param {string} password - The password input by the user.
 * @param {string} confirmPassword - The confirmation password input by the user.
 * @param {string} email - The email address input by the user.
 * @returns {Promise<boolean>} - Resolves to true if all validations pass, otherwise returns false and displays the appropriate error message.
 */
async function validateForm(password, confirmPassword, email) {
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


/**
 * Shows an error message window and returns false.
 * @param {Element} errorWindow - The DOM element of the error message window to be shown.
 * @returns {boolean} - False, indicating that the user input is invalid.
 */
function returnLoginError(errorWindow) {
    errorWindow.style.display = 'block';
    return false;
}


/**
 * Checks if a given password is valid.
 * A valid password must contain at least one uppercase letter, one number, and one special character,
 * and must be at least 8 characters long.
 * @param {string} password - The password to validate.
 * @returns {boolean} - Returns true if the password is valid, false otherwise.
 */
function isValidPassword(password) {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,:])[A-Za-z\d@$!%*?&.,:]{8,}$/;
    return regex.test(password);
}


/**
 * Validates the format of an email address.
 * Ensures the email contains no spaces, includes an '@' symbol,
 * followed by a domain name and a top-level domain.
 * 
 * @param {string} email - The email address to validate.
 * @returns {boolean} - Returns true if the email format is valid, false otherwise.
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]+$/;
    return regex.test(email);
}


/**
 * Signs up a new user with the provided name, email, and password. If the sign-up is 
 * successful, the user is automatically signed in, a new contact is created, and a 
 * success popup is displayed. The user is then redirected to the index page and signed 
 * out after a short delay. If any error occurs during the process, it handles the error 
 * by displaying an appropriate error message.
 * 
 * @param {string} name - The name of the user signing up.
 * @param {string} email - The email address of the user signing up.
 * @param {string} password - The password for the new user account.
 * @returns {Promise<void>} - A promise that resolves when the sign-up process is complete.
 */
async function signUp(data) {
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


/**
 * Creates a new contact object with the provided name and email address, and adds it to the contacts array.
 * The contact is marked as the current user and is given a default phone number.
 * The contact is then added to the database and the contacts array is updated in session storage.
 * @param {string} name - The name of the new contact.
 * @param {string} email - The email address of the new contact.
 * @returns {Promise<void>} - A promise that resolves when the contact has been added.
 */
async function createNewContact(data) {
    const contact = await createContact(data.id, data.name, data.email, 'Please add phone number', false, true);
    await updateDataInDatabase(`${BASE_URL}api/contacts/${contact.id}/`, contact);
    contacts.push(pushToContacts(contact));
    sessionStorage.setItem("contacts", JSON.stringify(contacts));
}


/**
 * Shows the success popup and adds a click event to redirect to the index.html.
 */
function showSuccessPopup() {
    const popup = document.getElementById('successPopup');
    popup.style.display = 'block';
    popup.addEventListener('click', () => {
        window.location.href = '../index.html';
    });
}


/**
 * Displays the error message with the given ID.
 * @param {string} messageId - The ID of the error message element to be displayed.
 */
function showError(messageId) {
    document.getElementById(messageId).style.display = 'block';
}


/**
 * Updates the checkbox image based on the 'Privacy Policy' checkbox state.
 * Disables/Enables the submit button depending on the checkbox state.
 * @param {HTMLElement} checkboxImg - Checkbox image element.
 * @param {HTMLElement} submitButton - Submit button element.
 */
function checkBoxClicked() {
    const checkedState = document.getElementById('privacy-policy').checked;
    const checkboxImg = document.getElementById('checkbox');
    const submitButton = document.getElementById('signup-btn-register');
    submitButton.disabled = !checkedState;
    checkboxImg.src = checkedState ? '../assets/icons/checkboxchecked.svg' : '../assets/icons/checkbox.svg';
}
