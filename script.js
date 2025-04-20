import { Kanban } from "./src/classes/class.kanban.js";

window.addEventListener('DOMContentLoaded', async () => {
  const join = await Kanban.createInstance();
});