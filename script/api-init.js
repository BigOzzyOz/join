
// import { initSummary } from "./summary.js";
// import { init, toggleLoader } from "../script.js";
// import { activateAddTaskListeners } from "./addTask-listener.js";
// import { initBoard } from "./board.js";
// import { initContacts } from "./contacts.js";
// import { initRegister } from "./register.js";


//NOTE - API Variables

const BASE_URL = 'http://127.0.0.1:8000/';
let token = sessionStorage.getItem('token') || '';


//NOTE - API authentication



async function checkAuthStatus() {
  toggleLoader(true);
  try {
    const headers = createHeaders();
    const response = await fetch(`${BASE_URL}auth/status/`, {
      method: 'GET',
      headers: headers,
    });
    const data = await response.json();

    await init().then(() => {
      if (data.authenticated) initializePage();
      else redirectToLogin();
    });
  } catch (error) {
    console.error('Error checking auth status:', error);
  } finally {
    toggleLoader(false);
  }
}


function createHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Token ${token}`;
  return headers;
}


function initializePage() {
  const path = window.location.pathname;
  if (path.includes('summary.html')) initSummary();
  else if (path.includes('addtask.html')) setTimeout(() => activateAddTaskListeners(), 500);
  else if (path.includes('board.html')) initBoard();
  else if (path.includes('contacts.html')) initContacts();
}


async function redirectToLogin() {
  if (windowNoUserContent()) return;
  else apiLogout();
}


function windowNoUserContent() {
  const path = window.location.pathname;
  const noUserContentPaths = [
    '/index.html',
    '/help.html',
    '/register.html',
    '/privacy.html',
    '/imprint.html',
  ];
  if (path.includes('register.html')) initRegister();
  return noUserContentPaths.some((usedPath) => path.includes(usedPath)) || path === '/';
}


function setToken(tokenValue) {
  token = tokenValue;
  sessionStorage.setItem('token', tokenValue);
}


//NOTE - API logout



/**
 * Logs out the current user by removing the user's authentication token and
 * other related session and local storage data. After logout, the user is
 * redirected to the login page.
 */
function apiLogout() {
  sessionStorage.removeItem('currentUser');
  sessionStorage.removeItem('activeTab');
  sessionStorage.removeItem('token');
  localStorage.removeItem('currentUser');
  window.location.href = '../index.html';
}

// checkAuthStatus();

export { apiLogout, token, BASE_URL, setToken };