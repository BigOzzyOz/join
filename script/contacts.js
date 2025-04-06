import { currentUser, contacts, toggleClass, fetchDataFromDatabase, deleteDataFromDatabase, updateDataInDatabase, logOut, activateOutsideCheck, setContacts, toggleLoader } from "../script.js";
import { htmlRenderAddContact, htmlRenderContactLetter, htmlRenderGeneral, htmlRenderContactDetailsEmpty, htmlRenderContactDetails, svgProfilePic, createContact } from "./contactsTemplate.js";
import { activateListeners, activateListenersDetails, activateListenersAdd, activateListenersEdit } from "./contacts-listener.js";
import { token, BASE_URL } from "./api-init.js";


//NOTE - Global variables


let currentLetter = '';
let currentLetterId = '';
let editId = -1;


//NOTE - Initialisation and rendering functions


/**
 * Initialises the contacts view by loading the contacts data from the server and
 * rendering the contact list. Additionally, it activates the listeners for the
 * contact list.
 *
 * @returns {Promise<void>} - A promise that resolves when the contacts data
 * has been loaded and the contact list has been rendered.
 */
export async function initContacts() {
  toggleLoader(true);
  await getContactsData();
  renderContactList();
  activateListeners();
  toggleLoader(false);
}


/**
 * Loads the contacts data from the server and updates the global contacts
 * array. The function will clear the existing contacts before adding new
 * ones. It will also check for duplicate contacts by ID and only add
 * unique contacts to the list. The function will return the contacts array
 * after it has been updated.
 * @returns {Promise<Array<Object>>} - A promise that resolves to the
 * contacts array after it has been updated.
 */
export async function getContactsData() {
  let loadItem = await fetchDataFromDatabase('api/contacts/');
  setContactsArray(loadItem);
  sessionStorage.setItem("contacts", JSON.stringify(contacts));
  return contacts;
}


/**
 * Updates the global contacts array with new contact data from a loadItem array.
 * Clears the existing contacts before adding new ones.
 * Checks for duplicate contacts by ID and only adds unique contacts to the list.
 *
 * @param {Array<Object>} loadItem - An array of contact data objects to be processed and added to the contacts list.
 */
function setContactsArray(loadItem) {
  setContacts([]);
  for (const contactData of loadItem) {
    if (!contactData) continue;
    const existingContact = contacts.find((c) => c.id === contactData.id);
    if (existingContact) continue;
    const newContact = pushToContacts(contactData);
    contacts.push(newContact);
  }
}


/**
 * Renders the list of contacts in the contactsGeneral container.
 * The function first sorts the contacts by name alphabetically and then
 * renders each contact in the list. The contact list is separated by
 * contact letter sections.
 * @returns {void}
 */
function renderContactList() {
  const contactListElement = document.getElementById('contactsGeneral');
  const sortedContacts = [...contacts].sort((a, b) => a.name.localeCompare(b.name));

  contactListElement.innerHTML = htmlRenderAddContact();

  for (const contact of sortedContacts) {
    renderContactLetter(contact);
    const contactSection = document.getElementById(currentLetterId);
    contactSection.innerHTML += htmlRenderGeneral(contact);
  }
}


/**
 * Renders a contact letter section based on the first letter of the contact's name.
 * If the letter has not been rendered before, it will add a new section to the
 * contact list with the letter as the title. The current letter is stored in the
 * `currentLetter` variable and the ID of the section is stored in the
 * `currentLetterId` variable.
 * @param {Object} contact - The contact object containing the name and other details.
 */
function renderContactLetter(contact) {
  const contactList = document.getElementById('contactsGeneral');
  const firstLetter = contact.name[0].toUpperCase();
  if (firstLetter !== currentLetter) {
    contactList.innerHTML += htmlRenderContactLetter(firstLetter);
    currentLetter = firstLetter;
    currentLetterId = `contactLetter${currentLetter}`;
  }
}


/**
 * Refreshes the page by re-rendering the general contact list and the details of the current contact.
 * Utilizes the `renderContactList` and `renderContactsDetails` functions, passing the current `editId`.
 */
function refreshPage() {
  renderContactList();
  renderContactsDetails(editId);
  activateListeners();
}


/**
 * Renders the contact details section based on the given contact ID.
 * If no contact ID is given, it will use the current editId.
 * @param {number} [id] - The ID of the contact to render details for.
 */
export function renderContactsDetails(contactId = '') {
  const detailsElement = document.getElementById('contactsDetail');
  editId = contactId;
  const contact = contacts.find(contact => contact.id == editId);

  detailsElement.innerHTML = contact && editId != -1
    ? htmlRenderContactDetails(editId)
    : htmlRenderContactDetailsEmpty();

  setActiveContact(contactId);
  activateListenersDetails();
}


/**
 * Sets the contact element with the given ID as the active contact.
 * If no ID is given, it will use the current editId.
 * @param {number} [id] - The ID of the contact to set as active.
 */
function setActiveContact(id = editId) {
  const contactElementId = `contact${id}`;
  const activeContactElement = document.querySelector('.activeContact');
  const contactElement = document.getElementById(contactElementId);

  if (activeContactElement) activeContactElement.classList.remove('activeContact');

  if (contactElement) contactElement.classList.add('activeContact');
}


/**
 * Opens the add contact form, resets the input fields and toggles the modal on. It also activates the outside click event listener.
 * @param {Event} event The event that triggered this function.
 */
export function openAddContacts(event) {
  editId = contacts.length ? contacts[contacts.length - 1].id + 1 : 1;
  const nameInput = document.getElementById('addName');
  const emailInput = document.getElementById('addMail');
  const telInput = document.getElementById('addTel');

  [nameInput, emailInput, telInput].forEach(input => input.value = '');

  toggleClass('addContact', 'tt0', 'tty100');
  activateListenersAdd();
  activateOutsideCheck(event, 'addContact', 'tt0', 'tty100');
}


//NOTE - Add contact functions


/**
 * Adds a new contact to the contact list. If the contact already exists, the contact is not added.
 * @param {number} [id] - The ID of the contact to add. If not provided, the ID of the last contact
 * is used.
 * @returns {Promise<void>} - A promise that resolves when the contact has been added.
 */
export async function addContacts(id = editId) {
  const name = document.getElementById('addName').value;
  const email = document.getElementById('addMail').value;
  const phone = document.getElementById('addTel').value;
  const newContact = await createContact(id, name, email, phone, false, false);

  if (checkForExistingContact(newContact)) {
    await updateDataInDatabase(`${BASE_URL}contacts/${id}.json?auth=${token}`, newContact);
    contacts.push(pushToContacts(newContact));
    sessionStorage.setItem('contacts', JSON.stringify(contacts));
    refreshPage();
  }
}


/**
 * Checks if a contact with the same name or email already exists in the contacts list.
 * If a contact with the same name or email exists, a warning message is displayed and the function
 * returns false. Otherwise, the function returns true.
 * @param contact - The contact object to be checked.
 * @returns {boolean} - A boolean indicating whether a contact with the same name or email exists.
 */
function checkForExistingContact(contact) {
  const existingContact = contacts.find(
    (c) =>
      (c.name === contact.name && c.id !== contact.id) ||
      (c.email === contact.email && c.id !== contact.id)
  );

  const warningMessage = document.querySelector(".warning");
  if (existingContact) {
    warningMessage.classList.remove("d-none");
    return false;
  } else {
    warningMessage.classList.add("d-none");
    return true;
  }
}


/**
 * Takes a contact object and returns a new object with the keys
 * email, firstLetters, id, isUser, name, profilePic, and phone.
 * The new object is used to store the contact in the contacts array.
 * @param {Object} contact - The contact object to be processed.
 * @returns {Object} - The processed contact object.
 */
export function pushToContacts(contact) {
  return {
    'email': contact.mail,
    'firstLetters': filterFirstLetters(contact.name),
    'id': contact.id,
    'isUser': contact.isUser,
    'name': contact.name,
    'profilePic': contact.profilePic ? contact.profilePic : generateSvgCircleWithInitials(contact.name),
    'phone': contact.number,
  };
}


//NOTE - Edit contact functions


/**
 * Opens the edit contact form for the contact with the given ID.
 * @param {Event} event The event that triggered this function.
 * @param {number} id The ID of the contact to edit.
 */
export function openEditContacts(event, id) {
  editId = Number(id);
  const contact = contacts.find((c) => c.id === Number(id));
  const nameInput = document.getElementById('editName');
  const emailInput = document.getElementById('editMail');
  const telInput = document.getElementById('editTel');
  const profilePicElement = document.getElementById('editProfilePic');

  nameInput.value = contact.name;
  emailInput.value = contact.email;
  telInput.value = contact.phone;
  profilePicElement.innerHTML = contact.profilePic;

  toggleClass('editContact', 'tt0', 'tty100');
  activateOutsideCheck(event, 'editContact', 'tt0', 'tty100');
  activateListenersEdit();
}



/**
 * Edits the contact with the given ID (or the contact with ID in editId if no ID is provided).
 * Checks if the contact already exists with the new name or email address.
 * If the contact does not exist, updates the contact in the database and refreshes the page.
 * @param {number} [id] - The ID of the contact to be edited.
 * @returns {Promise<void>} - A promise that resolves when the contact has been edited.
 */
export async function editContacts(id = editId) {
  const contact = contacts.find(c => c.id === Number(id));
  const updatedName = document.getElementById('editName').value;
  const updatedEmail = document.getElementById('editMail').value;
  const updatedPhone = document.getElementById('editTel').value;
  const isNameChanged = updatedName !== contact.name;

  contact.name = updatedName;
  contact.email = updatedEmail;
  contact.phone = updatedPhone;

  if (checkForExistingContact(contact)) {
    const updatedContact = await createContact(
      contact.id,
      updatedName,
      updatedEmail,
      updatedPhone,
      isNameChanged ? null : contact.profilePic,
      contact.isUser
    );
    contact.profilePic = updatedContact.profilePic;
    await updateDataInDatabase(`${BASE_URL}contacts/${id}.json?auth=${token}`, updatedContact);
    refreshPage();
  }
}


//NOTE - Delete contact functions


/**
 * Opens the delete contact confirmation modal.
 * - Updates the global editId with the provided contact ID.
 * - Sets the confirmation message in the delete response modal based on the contact type.
 * - If the contact is the current user, a specific warning message is shown.
 * - Toggles the visibility of the delete response modal.
 * 
 * @param {Event} event - The event that triggered the function.
 * @param {number|string} [id=editId] - The ID of the contact to be deleted.
 */
export function openDeleteContacts(event, id = editId) {
  editId = Number(id);
  const response = document.querySelector('#deleteResponse>.deleteQuestion>p');

  let question;
  if (id === currentUser.id) question = 'Are you sure you want to delete your own account?';
  else if (contacts[contacts.findIndex(contact => contact.id === id)].isUser)
    question = 'Are you sure you want to delete this user\'s account?';
  else question = 'Are you sure you want to delete this contact?';

  response.textContent = question;
  toggleClass('deleteResponse', 'ts0', 'ts1');
}


/**
 * Deletes a contact with the given id.
 * If the contact being deleted is the user, logs out.
 * Otherwise, refreshes the page.
 * @param {number|string} [id=editId] - The id of the contact to be deleted.
 */
export async function deleteContacts(id = editId) {
  contacts.splice(contacts.findIndex(c => c.id == id), 1);
  await deleteDataFromDatabase(`contacts/${id}`);
  sessionStorage.setItem("contacts", JSON.stringify(contacts));
  Number(id) === currentUser.id ? logOut() : refreshPage();
}


//NOTE - User badge functions


/**
 * Extracts the first letter from each word in a given name and uppercases them.
 *
 * @param {string} name - The full name from which first letters are extracted.
 * @returns {string} - A string of uppercased first letters.
 */
export function filterFirstLetters(name) {
  return name.split(' ').map(word => word.charAt(0).toUpperCase()).join('');
}


/**
 * Generates an SVG string for a circle with the initials of a given name.
 *
 * @param {string} name - The full name from which initials are extracted.
 * @param {number} width - The width of the SVG circle.
 * @param {number} height - The height of the SVG circle.
 * @returns {string} - An SVG string representing a circular profile picture with randomly selected background color and the extracted initials.
 */
export function generateSvgCircleWithInitials(name, width = 120, height = 120) {
  const colors = ['#0038FF', '#00BEE8', '#1FD7C1', '#6E52FF', '#9327FF', '#C3FF2B', '#FC71FF', '#FF4646', '#FF5EB3', '#FF745E', '#FF7A00', '#FFA35E', '#FFBB2B', '#FFC701', '#FFE62B'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const initials = name.split(' ').map(word => word[0]).join('').toUpperCase();
  return svgProfilePic(randomColor, initials, height, width);
}
