
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously, deleteUser } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getDatabase, ref, child, get } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
import { firebaseConfig } from "../assets/environments/firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// onAuthStateChanged(auth, (user) => {
//   if (user) {
//     console.log(user);
//     const uid = user.uid;

//   } else {
//     console.log('No user logged in');
//   }
// });

function firebaseLogout() {
  signOut(auth).then(() => {
    sessionStorage.removeItem('currentUser');
    localStorage.removeItem('currentUser');
    window.location.href = '../index.html';
  });
}

export { auth, database, ref, child, get, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInAnonymously, deleteUser, firebaseLogout };