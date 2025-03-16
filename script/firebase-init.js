
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously, deleteUser, browserLocalPersistence, setPersistence } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getDatabase, ref, child, get } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
import { firebaseConfig } from "../assets/environments/firebase-config.js";
import { initSummary } from "./summary.js";
import { init } from "../script.js";
import { activateAddTaskListeners } from "./addTask-listener.js";
import { initBoard } from "./board.js";
import { initContacts } from "./contacts.js";
import { initRegister } from "./register.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
let token = '';

onAuthStateChanged(auth, (user) => {
  if (user) {
    token = getToken().then(() => {
      init().then(() => {
        if (window.location.href.includes('summary.html')) initSummary();
        if (window.location.href.includes('addtask.html')) {
          setTimeout(() => activateAddTaskListeners(), 500);
        }
        if (window.location.pathname.includes("board.html")) initBoard();
        if (window.location.href.includes('contacts.html')) initContacts();
      });
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


function firebaseLogout() {
  signOut(auth).then(() => {
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('currentUser');
    window.location.href = '../index.html';
  });
}


async function getToken() {
  const user = auth.currentUser;
  if (user) {
    const tokenNew = await user.getIdToken();
    token = tokenNew;
  } else {
    token = '';
  }
}

export { auth, database, ref, child, get, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously, deleteUser, firebaseLogout, token };