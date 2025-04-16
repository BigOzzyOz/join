import { Database as db } from "./class.database.js";

export class Board {
    currentDraggedElement = null;
    currentSearchInput = '';

    constructor() { }

    static async initContacts() {
        await getContactsData();
        renderContactList();
        activateListenersContacts();
    }

    async getContactsData() {
        const response = await db.get('api/contacts/');
        let loadItem = await response.json();
        this.setContactsArray(loadItem);
        sessionStorage.setItem("contacts", JSON.stringify(contacts));
        return contacts;
    }

    setContactsArray(loadItem) {
        setContacts([]);
        for (const contactData of loadItem) {
            if (!contactData) continue;
            const existingContact = contacts.find((c) => c.id === contactData.id);
            if (existingContact) continue;
            const newContact = pushToContacts(contactData);
            contacts.push(newContact);
        }
    }
}
