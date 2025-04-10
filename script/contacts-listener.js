import { openAddContacts, renderContactsDetails, openDeleteContacts, openEditContacts, addContacts, editContacts, deleteContacts, refreshPage } from "./contacts.js";
import { toggleClass, activateOutsideCheck } from "../script.js";


//NOTE - Listener and handler functions


/**
 * Deactivates all event listeners for the contacts feature.
 * This includes listeners for general contacts interactions, contact details, contact editing, contact deletion, and contact addition.
 * @function deactivateAllListenersContacts
 * @returns {void}
 */
export function deactivateAllListenersContacts() {
  deactivateListeners();
  deactivateListenersDetails();
  deactivateListenersEdit();
  deactivateListenersDelete();
  deactivateListenersAdd();
}


/**
 * Activates event listeners for the contact list and the "More Contacts" button.
 * - Attaches a click event listener to the "More Contacts" button to open the add contact form.
 * - Attaches a click event listener to each contact list item to open the contact details.
 */
export function activateListeners() {
  const moreContactsButton = document.getElementById('moreContactsButton');
  const contactsListItem = document.querySelectorAll('.contactListItem');
  moreContactsButton?.addEventListener('click', openAddContacts);
  contactsListItem?.forEach(item => item.addEventListener('click', openContactDetails));
}


/**
 * Deactivates event listeners for the contact list and the "More Contacts" button.
 * - Removes the click event listener from the "More Contacts" button to prevent opening the add contact modal.
 * - Removes the click event listeners from each contact list item to prevent opening contact details.
 */
function deactivateListeners() {
  const moreContactsButton = document.getElementById('moreContactsButton');
  const contactsListItem = document.querySelectorAll('.contactListItem');
  moreContactsButton?.removeEventListener('click', openAddContacts);
  contactsListItem?.forEach(item => item?.removeEventListener('click', openContactDetails));
}


/**
 * Opens contact details based on the contact list item that was clicked.
 * - Toggles visibility of the contact details container.
 * - Calls the function to render the contact details in the container.
 * @param {Event} event - The event object with information about the element that was clicked.
 */
function openContactDetails(event) {
  const listItem = event.target.closest('li.contactListItem');
  toggleClass('contactsDetail', 'tt0', 'ttx100');
  renderContactsDetails(listItem.dataset.id);
}


/**
 * Activates event listeners for contact details.
 * - Attaches a click event listener to the back arrow button to close the contact details.
 * - Attaches a click event listener to the edit contact button to open the edit contact form.
 * - Attaches a click event listener to the delete contact button to open the delete confirmation dialog.
 * - Attaches a click event listener to the more details button for additional contact options.
 */
export function activateListenersDetails() {
  const backArrowContacts = document.getElementById('backArrow-contacts');
  const editContactBtn = document.getElementById('editContactBtn');
  const deleteContactBtn = document.getElementById('deleteContactBtn');
  const contactsDetailMore = document.getElementById('contactsDetailMore');
  backArrowContacts?.addEventListener('click', closeDetails);
  editContactBtn?.addEventListener('click', openEditContactsButton);
  deleteContactBtn?.addEventListener('click', openDeleteContactsButton);
  contactsDetailMore?.addEventListener('click', contactsDetailsMore);
}


/**
 * Deactivates event listeners for contact details.
 * - Removes listeners for the 'click' event on the back arrow button, edit contact button, delete contact button, and more details button.
 * @function deactivateListenersDetails
 * @returns {void}
 */
function deactivateListenersDetails() {
  const backArrowContacts = document.getElementById('backArrow-contacts');
  const editContactBtn = document.getElementById('editContactBtn');
  const deleteContactBtn = document.getElementById('deleteContactBtn');
  const contactDetailsMore = document.getElementById('contactDetailsMore');
  backArrowContacts?.removeEventListener('click', closeDetails);
  editContactBtn?.removeEventListener('click', openEditContactsButton);
  deleteContactBtn?.removeEventListener('click', openDeleteContactsButton);
  contactDetailsMore?.removeEventListener('click', contactsDetailsMore);
}


/**
 * Closes the contact details by toggling the 'tt0' and 'ttx100' classes on the .contactsDetail element.
 */
function closeDetails() {
  toggleClass('contactsDetail', 'tt0', 'ttx100');
}


/**
 * Opens the delete contact modal.
 * - Retrieves the contact ID from the data-id attribute of the delete button.
 * - Calls the openDeleteContacts function with the contact ID to initialize the deletion process.
 * - Activates event listeners specific to the delete contact modal.
 * @param {Event} event - The event object representing the click event.
 */
function openDeleteContactsButton(event) {
  const target = event.target.closest('#deleteContactBtn');
  openDeleteContacts(target.dataset.id);
  activateListenersDelete();
}


/**
 * Opens the edit contact menu.
 * @param {Event} event The event that triggered this function.
 */
function openEditContactsButton(event) {
  const target = event.target.closest('#editContactBtn');
  openEditContacts(event, target.dataset.id);
}


/**
 * Toggles the edit contact menu.
 * @param {Event} event The event that triggered this function.
 */
function contactsDetailsMore(event) {
  toggleClass('editMenu', 'ts0', 'ts1');
  activateOutsideCheck(event, 'editMenu', 'ts1', 'ts0');
}


/**
 * Activates event listeners for the add contact modal.
 * - Attaches a click event listener to all elements with the class 'closeX' to close the modal.
 * - Attaches a submit event listener to the add contact form to handle form submission.
 * - Attaches a click event listener to the cancel button to close the modal.
 */
export function activateListenersAdd() {
  const addContactX = document.querySelectorAll('#addContact .closeX');
  const addInput = document.querySelectorAll('.addInput');
  const addContact = document.querySelector('#addContact form');
  const addContactCancel = document.getElementById('cancelAddContact');
  addContactX?.forEach(b => b.addEventListener('click', closeAddContact));
  addInput?.forEach(input => input.addEventListener('keydown', (e) => e.key === 'Enter' && e.preventDefault()));
  addContact?.addEventListener('submit', submitAddContact);
  addContactCancel?.addEventListener('click', closeAddContact);
}


/**
 * Deactivates event listeners for the add contact modal.
 * - Removes the click event listener from all elements with the class 'closeX' to close the modal.
 * - Removes the submit event listener from the add contact form to prevent form submission.
 * - Removes the click event listener from the cancel button to close the modal.
 */
function deactivateListenersAdd() {
  const addContactX = document.querySelectorAll('#addContact .closeX');
  const addInput = document.querySelectorAll('.addInput');
  const addContact = document.querySelector('#addContact form');
  const addContactCancel = document.getElementById('cancelAddContact');
  addContactX?.forEach(b => b?.removeEventListener('click', closeAddContact));
  addInput?.forEach(input => input?.removeEventListener('keydown', (e) => e.key === 'Enter' && e.preventDefault()));
  addContact?.removeEventListener('submit', submitAddContact);
  addContactCancel?.removeEventListener('click', closeAddContact);
}


/**
 * Closes the add contact modal.
 * - Toggles the visibility of the add contact modal.
 * - Deactivates the event listeners for the add contact modal.
 */
function closeAddContact() {
  toggleClass('addContact', 'tt0', 'tty100');
  deactivateListenersAdd();
}


/**
 * Handles the submission of the add contact form.
 * - Prevents the default form submission behavior.
 * - Closes the add contact modal.
 * - Calls the addContacts function to add the new contact.
 * @param {Event} event - The event object passed from the triggered event.
 */
async function submitAddContact(event) {
  event.preventDefault();
  if (await addContacts()) closeAddContact();
  refreshPage();
}


/**
 * Activates event listeners for the contact edit modal.
 * - Attaches a click event listener to the X buttons in the edit contact modal to close the modal.
 * - Attaches a click event listener to the "Delete" button in the edit contact modal to open the delete contact modal.
 * - Attaches a submit event listener to the edit contact form to handle the form submission.
 */
export function activateListenersEdit() {
  const workContactX = document.querySelectorAll('#editContact .closeX');
  const editInput = document.querySelectorAll('.editInput');
  const editContact = document.querySelector('#editContact form');
  const editContactDelete = document.getElementById('editContactDelete');
  workContactX?.forEach(b => b.addEventListener('click', closeEditContact));
  editInput?.forEach(input => input.addEventListener('keydown', (e) => e.key === 'Enter' && e.preventDefault()));
  editContactDelete?.addEventListener('click', openDeleteContacts);
  editContact?.addEventListener('submit', submitEditContact);
}


/**
 * Deactivates the event listeners for the edit contact modal.
 * - Removes the click event listeners from the close buttons.
 * - Removes the click event listener from the delete button.
 * - Removes the submit event listener from the edit contact form.
 */
function deactivateListenersEdit() {
  const workContactX = document.querySelectorAll('#editContact .closeX');
  const editInput = document.querySelectorAll('.editInput');
  const editContact = document.querySelector('#editContact form');
  const editContactDelete = document.getElementById('editContactDelete');
  workContactX?.forEach(b => b?.removeEventListener('click', closeEditContact));
  editInput?.forEach(input => input?.removeEventListener('keydown', (e) => e.key === 'Enter' && e.preventDefault()));
  editContactDelete?.removeEventListener('click', openDeleteContacts);
  editContact?.removeEventListener('submit', submitEditContact);
}


/**
 * Closes the edit contact modal.
 * - Toggles the editContact class between 'tt0' and 'tty100'.
 * - Deactivates the edit contact listeners.
 */
function closeEditContact() {
  toggleClass('editContact', 'tt0', 'tty100');
  deactivateListenersEdit();
}


/**
 * Handles the submission of the edit contact form.
 * - Prevents the default form submission.
 * - Closes the edit contact modal.
 * - Calls the editContacts function to update the contact in the contacts list and in the database.
 */
async function submitEditContact(event) {
  event.preventDefault();
  editContacts();
  if (await editContacts()) closeEditContact();
  refreshPage();
}


/**
 * Activates event listeners for the delete response modal.
 * - Attaches a submit event listener to the delete contact form to handle the form submission.
 * - Attaches a click event listener to the close button in the delete response modal to close the modal.
 */
function activateListenersDelete() {
  const deleteResponse = document.querySelector('#deleteResponse form');
  const closeDeleteResponseBtn = document.getElementById('closeDeleteResponse');
  deleteResponse?.addEventListener('submit', submitDeleteContact);
  closeDeleteResponseBtn?.addEventListener('click', closeDeleteResponse);
}


/**
 * Deactivates event listeners for the delete response modal.
 * - Removes the submit event listener from the delete contact form.
 * - Removes the click event listener from the close button in the delete response modal.
 */
function deactivateListenersDelete() {
  const deleteResponse = document.querySelector('#deleteResponse form');
  const closeDeleteResponseBtn = document.getElementById('closeDeleteResponse');
  deleteResponse?.removeEventListener('submit', submitDeleteContact);
  closeDeleteResponseBtn?.removeEventListener('click', closeDeleteResponse);
}


/**
 * Handles the submission of the delete contact form.
 * Prevents the default form submission.
 * Hides the delete response modal and removes all event listeners from it.
 * Calls the deleteContacts function to delete the selected contact.
 * @param {Event} event The event object of the form submission.
 */
function submitDeleteContact(event) {
  event.preventDefault();
  closeDeleteResponse();
  deleteContacts();
}


/**
 * Closes the delete response modal by removing the class that makes it visible.
 * Additionally, all event listeners for the delete response modal are removed.
 */
function closeDeleteResponse() {
  toggleClass('deleteResponse', 'ts0', 'ts1');
  deactivateListenersDelete();
}