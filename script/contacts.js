let currentLetter = '';
let currentLetterId = '';
let editId = '';

async function getContactsData() {
  contacts = [];
  let loadItem = await loadData('contacts');
  await setContactsArray(loadItem);
  sessionStorage.setItem("contacts", JSON.stringify(contacts));
}

async function setContactsArray(loadItem) {
  for (let i = 0; i < loadItem.length; i++) {
    const element = loadItem[i];
    contacts.push({
      id: i,
      name: element.name,
      email: element.mail,
      phone: element.number,
      profilePic: element.profilePic ? element.profilePic : await generateSvgCircleWithInitials(element.name, 120, 120),
      isUser: element.isUser
    });
  }
}

function setContactsData() {

}

async function initContacts() {
  init();
  await getContactsData();
  renderContactsGeneral();
}

function renderContactsGeneral() {
  let contactBook = document.getElementById('contactsGeneral');
  let contactSort = [...contacts];
  contactBook.innerHTML = htmlRenderAddContact();
  contactSort.sort((a, b) => a.name.localeCompare(b.name));
  for (let i = 0; i < contactSort.length; i++) {
    const contact = contactSort[i];
    renderContactsLetter(contact);
    const contactBookEntry = document.getElementById(currentLetterId);
    contactBookEntry.innerHTML += htmlRenderGeneral(contact);
  }

}

function renderContactsLetter(contact) {
  let contactBook = document.getElementById('contactsGeneral');
  let firstLetter = contact.name[0].toUpperCase();
  if (firstLetter !== currentLetter) {
    contactBook.innerHTML += htmlRenderContactLetter(firstLetter);
    currentLetter = firstLetter;
    currentLetterId = `contactLetter${currentLetter}`;
  }
}

function renderContactsDetails(id) {
  let details = document.getElementById('contactsDetail');
  editId = id;
  details.innerHTML = htmlRenderContactDetails(id);
}

function openEditContacts(id) {
  editId = id;
  let name = document.getElementById('editName');
  let email = document.getElementById('editEmail');
  let tel = document.getElementById('editTel');
  let profilePic = document.getElementById('editProfilePic');
  name.value = contacts[contacts.findIndex(c => c.id == id)].name;
  email.value = contacts[contacts.findIndex(c => c.id == id)].email;
  tel.value = contacts[contacts.findIndex(c => c.id == id)].tel;
  profilePic.innerHTML = contacts[contacts.findIndex(c => c.id == id)].profilePic;
  toggleClass('editContact', 'tt0', 'tty100');
}

async function editContacts(id = editId) {
  let editName = document.getElementById('editName').value;
  let editEmail = document.getElementById('editEmail').value;
  let editTel = document.getElementById('editTel').value;
  contacts[contacts.findIndex(c => c.id == id)].name = editName;
  contacts[contacts.findIndex(c => c.id == id)].email = editEmail;
  contacts[contacts.findIndex(c => c.id == id)].phone = editTel;
  await updateData('contacts' + '/' + id, contacts[contacts.findIndex(c => c.id == id)]);
  toggleClass('editContact', 'tt0', 'tty100');
}

function openDeleteContacts(id = editId) {
  /*TODO - Build modal for delete */
  toggleClass('editContact', 'tt0', 'tty100');
}

async function deleteContacts(id) {
  contacts.splice(contacts.findIndex(c => c.id == id), 1);
  await updateData('contacts' + '/' + id);
}

function openAddContacts() {
  editId = contacts[contacts.length - 1].id + 1;
  let name = document.getElementById('addName');
  let email = document.getElementById('addEmail');
  let tel = document.getElementById('addTel');
  name.value = '';
  email.value = '';
  tel.value = '';
  toggleClass('editContact', 'tt0', 'tty100');
}

async function addContacts(id = editId) {
  let addName = document.getElementById('addName').value;
  let addEmail = document.getElementById('addEmail').value;
  let addTel = document.getElementById('addTel').value;
  let newContact = {
    'id': id,
    'name': addName,
    'mail': addEmail,
    'number': addTel,
    'profilePic': await generateSvgCircleWithInitials(addName, 120, 120),
    'isUser': false
  };
  await updateData('contacts' + '/' + id, newContact);
  toggleClass('editContact', 'tt0', 'tty100');
}

async function generateSvgCircleWithInitials(name, width, height) {
  const colors = ['#0038FF', '#00BEE8', '#1FD7C1', '#6E52FF', '#9327FF', '#C3FF2B', '#FC71FF', '#FF4646', '#FF5EB3', '#FF745E', '#FF7A00', '#FFA35E', '#FFBB2B', '#FFC701', '#FFE62B'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  const initials = name.split(' ').map(word => word[0]).join('').toUpperCase();
  return svgProfilePic(randomColor, initials, height, width);
}


/*TODO - Check if new contact is user */
/*TODO - check if mail is doubled */
/*TODO - Delete user feedback */