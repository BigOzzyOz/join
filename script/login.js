import { BASE_URL, token, setToken } from "./api-init.js";
import { currentUser } from "../script.js";
import { createContact } from "./contactsTemplate.js";


//NOTE - Global Login Variables


const passwordInput = document.getElementById('passwordInput');
let isPasswordVisible = false;
let clickCount = -1;


//NOTE - Initial Login function


/**
 * Initialises the login form by setting up event listeners and retrieving stored login credentials, if any.
 * @function
 */
function initLogin() {
    activateListener();

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const rememberMeChecked = localStorage.getItem('rememberMe') === 'true';
        const login = loginForm.querySelector('#loginInput');
        const passwordInput = loginForm.querySelector('#passwordInput');
        const checkbox = loginForm.querySelector('#checkbox');

        if (rememberMeChecked) {
            login.value = localStorage.getItem('login');
            passwordInput.value = localStorage.getItem('password');
            checkbox.src = rememberMeChecked ? 'assets/icons/checkboxchecked.svg' : 'assets/icons/checkbox.svg';
        }

        setupPasswordToggle();
    }
}


/**
 * Sets up event listeners for the password input field to handle password visibility toggling.
 * - A click event listener to toggle the password visibility state.
 * - A focus event listener to increment the click count.
 * - A blur event listener to reset the password input field state.
 */
function setupPasswordToggle() {
    passwordInput.addEventListener("click", changeVisibility);
    passwordInput.addEventListener("focus", () => { clickCount++; });
    passwordInput.addEventListener("blur", resetState);
}


/**
 * Handles the password visibility toggle button click event.
 * Prevents the default event behavior, saves the current cursor position, toggles the
 * password visibility, and resets the cursor position.
 * @param {Event} event - The event object from the button click event.
 */
function changeVisibility(event) {
    event.preventDefault();
    const selectionStart = passwordInput.selectionStart;
    togglePasswordVisibility();
    clickCount = clickCount === 0 ? 1 : 0;
    passwordInput.setSelectionRange(selectionStart, selectionStart);
}


/**
 * Resets the state of the password input field by setting its type to "password",
 * updating its background image, and resetting the click count and visibility status.
 */
function resetState() {
    passwordInput.type = "password";
    passwordInput.style.backgroundImage = "url('assets/icons/password_input.png')";
    clickCount = -1;
    isPasswordVisible = false;
}


/**
 * Toggles the visibility of the password input field by changing its type and
 * its background image.
 */
function togglePasswordVisibility() {
    passwordInput.type = isPasswordVisible ? "text" : "password";
    const image = isPasswordVisible ? "visibility.png" : "password_off.png";
    passwordInput.style.backgroundImage = `url('assets/icons/${image}')`;
    isPasswordVisible = !isPasswordVisible;
}



/**
 * Handles the login button click event. Prevents the default event behavior,
 * retrieves the email, password, and remember me checkbox state from the
 * form, attempts to sign in with the provided credentials, sets the current
 * user if successful, and redirects to the summary page. If the sign-in
 * attempt fails, it displays an error message.
 * @param {Event} event - The event object from the button click event.
 * @returns {Promise<void>} - A promise resolving when the button click handling
 * is complete.
 */
async function loginButtonClick(event) {
    event.preventDefault();
    const login = document.getElementById('loginInput').value.trim().toLowerCase();
    const password = document.getElementById('passwordInput').value;
    const isRememberMeChecked = document.getElementById('rememberMe').checked;
    const bodyData = {
        "username": login,
        "password": password,
    };
    try {
        let response = await fetch(`${BASE_URL}/auth/login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bodyData),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.non_field_errors ? data.non_field_errors[0] : 'An unknown error occurred.');
        data.token ? setToken(data.token) : console.error('Error: No token received from the server.');
        await setCurrentUser(data);
        handleRememberMe(isRememberMeChecked);
        continueToSummary();
    } catch (error) {
        showError(error);
    }
}


/**
 * Sets the current user in the session storage by searching through the contacts
 * database with the given email address. If a user is found, their data is stored
 * in the session storage and the function returns true. If no user is found, the
 * user is deleted from the Firebase authentication system and the function throws
 * an error.
 * @param {string} email - The email address to search for in the database.
 * @param {object} userCredential - The user credential object from the Firebase
 * authentication system.
 * @returns {Promise<boolean>} - A promise resolving to true if a user is found,
 * or throwing an error if no user is found.
 */
async function setCurrentUser(data) {
    let userData = { name: "Guest", firstLetters: "G" };
    try {
        const user = await fetch(`${BASE_URL}/api/contacts/${data.id}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Token ${data.token}`,
                'Content-Type': 'application/json',
            },
        });
        if (user.ok) {
            const userJson = await user.json();
            userData = await createContact(userJson.id, userJson.name, userJson.email, userJson.number, userJson.profile_pic, userJson.is_user);
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    } finally {
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
    }
}


/**
 * Handles the "Remember me" checkbox state.
 * If the checkbox is checked, the function stores the user's email and password
 * in local storage. If the checkbox is not checked, the function removes the email
 * and password from local storage.
 * @param {boolean} rememberMe - The state of the "Remember me" checkbox.
 */
function handleRememberMe(rememberMe) {
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


/**
 * Redirects the user to the summary page and sets the active tab to 'summary' in session storage.
 */
function continueToSummary() {
    sessionStorage.setItem('activeTab', 'summary');
    window.location.href = 'html/summary.html';
}


/**
 * Displays an error message to the user on the login page.
 * If the error code includes 'auth/invalid-credential', the displayed message is 'Oops, wrong email address or password! Try it again.'.
 * Otherwise, the displayed message is the error message passed to this function.
 * @param {Error} error - The error that occurred while trying to log in.
 */
function showError(error) {
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.textContent = error.message.includes('Unable to log in with provided credentials') ? 'Oops, wrong email address or password! Try it again.' : error[0];
    errorMessageElement.style.display = 'block';
}


/**
 * Handles guest login by signing in anonymously and setting the current user to a guest user.
 * Removes all local storage items and continues to the summary page.
 * @throws {Error} if an error occurs during sign in.
 */
async function handleGuestLogin() {
    try {
        const response = await fetch(`${BASE_URL}/auth/guest/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        const guestUser = { name: "Guest", firstLetters: "G" };
        setToken(data.token);
        sessionStorage.setItem("currentUser", JSON.stringify(guestUser));
        localStorage.clear();
        continueToSummary();
    } catch (error) {
        console.error('Error signing in as guest:', error);
    }
}


/**
 * Toggles the checkbox image based on the 'Remember Me' checkbox state.
 * Updates the checkbox image source to display a checked or unchecked icon
 * depending on whether the checkbox is checked or not.
 */
function checkBoxClicked() {
    const checkedState = document.getElementById('rememberMe').checked;
    const checkboxImg = document.getElementById('checkbox');
    checkboxImg.src = checkedState ? 'assets/icons/checkboxchecked.svg' : 'assets/icons/checkbox.svg';
}


//NOTE - Listener and handler functions


/**
 * Activates event listeners for the login page.
 * - Attaches a click event listener to the "Remember Me" checkbox to change the checkbox icon.
 * - Attaches a click event listener to the login button to handle the login process.
 * - Attaches a click event listener to the guest login button to handle guest login.
 * - Attaches a click event listener to the sign up button to forward the user to the sign up page.
 * - Attaches a click event listener to the privacy policy link to open the privacy policy page.
 * - Attaches a click event listener to the legal notice link to open the legal notice page.
 */
function activateListener() {
    document.getElementById('rememberMe')?.addEventListener('click', checkBoxClicked);
    document.getElementById('loginButton')?.addEventListener('click', loginButtonClick);
    document.getElementById('guestLogin')?.addEventListener('click', handleGuestLogin);
    document.getElementById('signup-btn')?.addEventListener('click', forwardRegister);
    document.getElementById('privacy-policy')?.addEventListener('click', forwardPrivacy);
    document.getElementById('legal-notice')?.addEventListener('click', forwardLegal);
};


/**
 * Deactivates all event listeners related to the login page.
 * - Removes the click event listener from the "Remember Me" checkbox.
 * - Removes the click event listener from the login button.
 * - Removes the click event listener from the guest login button.
 * - Removes the click event listener from the "Sign Up" button to prevent forwarding to the registration page.
 * - Removes the click event listener from the privacy policy link to prevent navigation.
 * - Removes the click event listener from the legal notice link to prevent navigation.
 */
export function deactivateAllListenersLogin() {
    document.getElementById('rememberMe')?.removeEventListener('click', checkBoxClicked);
    document.getElementById('loginButton')?.removeEventListener('click', loginButtonClick);
    document.getElementById('guestLogin')?.removeEventListener('click', handleGuestLogin);
    document.getElementById('signup-btn')?.removeEventListener('click', forwardRegister);
    document.getElementById('privacy-policy')?.removeEventListener('click', forwardPrivacy);
    document.getElementById('legal-notice')?.removeEventListener('click', forwardLegal);
}


/**
 * Forward user to the registration page when the "Sign Up" button is clicked.
 */
function forwardRegister() {
    window.location.href = 'html/register.html';
}


/**
 * Set the active tab to "legal notice" when the link is clicked.
 */
export function forwardLegal() {
    sessionStorage.setItem('activeTab', "legal notice");
}


/**
 * Set the active tab to "privacy policy" when the link is clicked.
 */
export function forwardPrivacy() {
    sessionStorage.setItem('activeTab', "privacy policy");
}


document.addEventListener("DOMContentLoaded", initLogin);