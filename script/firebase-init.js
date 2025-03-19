
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously, deleteUser, browserLocalPersistence, setPersistence } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getDatabase, ref, child, get } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
import { firebaseConfig } from "../assets/environments/firebase-config.js";
import { initSummary } from "./summary.js";
import { init, toggleLoader } from "../script.js";
import { activateAddTaskListeners } from "./addTask-listener.js";
import { initBoard } from "./board.js";
import { initContacts } from "./contacts.js";
import { initRegister } from "./register.js";


//NOTE - Firebase initialisation


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
let token = sessionStorage.getItem("token") || '';


//NOTE - Firebase authentication


/**
 * Asynchronously retrieves the current user's ID token from Firebase authentication.
 * If a user is authenticated, their ID token is fetched and stored in the `token` variable.
 * If no user is authenticated, the `token` variable is set to an empty string.
 * This function is useful for obtaining an authentication token for making authenticated requests.
 */
export async function getToken() {
  const user = auth.currentUser;
  if (user) {
    const tokenNew = await user.getIdToken();
    token = tokenNew;
  } else token = '';
}


onAuthStateChanged(auth, (user) => {
  if (user || token) {
    if (!user && token) signInAnonymously(auth);
    getToken().then(() => {
      toggleLoader(true);
      init().then(() => {
        if (window.location.href.includes('summary.html')) initSummary();
        if (window.location.href.includes('addtask.html')) {
          setTimeout(() => activateAddTaskListeners(), 500);
        }
        if (window.location.pathname.includes("board.html")) initBoard();
        if (window.location.href.includes('contacts.html')) initContacts();
        if (window.location.href.includes('register.html')) initRegister();
      }).finally(() => toggleLoader(false));
    });
  } else {
    init().then(() => {
      init().then(() => {
        if (window.location.href.includes('register.html')) initRegister();
      });
    });
  }
});

setPersistence(auth, browserLocalPersistence).then(() => {

}).catch((error) => {

});


//NOTE - Firebase logout


/**
 * Logs out the current user by signing them out of Firebase authentication,
 * removing their session and local storage data, and redirecting to the login page.
 */
function firebaseLogout() {
  signOut(auth).then(() => {
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('activeTab');
    sessionStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    window.location.href = '../index.html';
  });
}


export { auth, database, ref, child, get, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously, deleteUser, firebaseLogout, token, setPersistence, browserLocalPersistence };