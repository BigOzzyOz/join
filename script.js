//NOTE - Imports
import { Kanban } from "./src/classes/class.kanban.js";

//NOTE - App Bootstrap
/**
 * Initializes the Kanban application on DOMContentLoaded.
 * @returns {Promise<void>}
 */
async function initKanbanApp() {
    try {
        await Kanban.createInstance();
    } catch (e) {
        _logError('Failed to initialize Kanban app: ' + e);
    }
}

window.addEventListener('DOMContentLoaded', initKanbanApp);

//NOTE - Error Handling
/**
 * Logs an error message.
 * @param {string} msg
 * @returns {void}
 */
function _logError(msg) { console.error(msg); }