import { AddTaskHtml } from "./html/class.html-add-task.js";
import { Subtask } from "./class.subtask.js";
import { Task } from "./class.task.js";

export class AddTask {
    //NOTE Properties 

    kanban;
    assignedContacts = [];
    currentPrio = 'medium';
    html;

    constructor(kanban) {
        this.kanban = kanban;
        this.assignedContacts = [];
        this.currentPrio = 'medium';
        this.html = new AddTaskHtml(kanban);
    }

    //NOTE Assign/Dropdown/Contact Methods

    toggleDropdown = async () => {
        document.getElementById('assignDropdown').classList.toggle('open');
        document.getElementById('assignSearch').classList.contains('contactsAssignStandard') ? await this.openAssignDropdown() : this.closeAssignDropdown();
        this.kanban.toggleClass('assignSearch', 'contactsAssignStandard', 'contactsAssignOpen');
    };

    async openAssignDropdown() {
        const searchInput = document.getElementById('assignSearch');
        const contactsContainer = document.getElementById('contactsToAssign');
        const contactsSorted = [...this.kanban.contacts].sort((a, b) => a.name.localeCompare(b.name));
        contactsContainer.innerHTML = contactsSorted.map(c => c.html.htmlRenderContactsAssign(this.assignedContacts)).join('');
        document.getElementById('assignDropArrow').style.transform = 'rotate(180deg)';
        searchInput.value = '';
        searchInput.removeAttribute('readonly');
        this.kanban.activateListenerAddTask('openAssignDropdown');
    }

    closeAssignDropdown() {
        let searchInput = document.getElementById('assignSearch');
        let contactsContainer = document.getElementById('contactsToAssign');
        contactsContainer.innerHTML = '';
        document.getElementById('assignDropArrow').style.transform = 'rotate(0deg)';
        searchInput.value = 'Select contacts to assign';
        searchInput.setAttribute('readonly', true);
        this.kanban.deactivateListenerAddTask('closeAssignDropdown');
    };

    toggleCategoryDropdown(value) {
        let input = document.getElementById('categoryInput');
        let wrapper = document.getElementById('selectWrapper');
        let arrow = document.getElementById('categoryDropArrow');
        input.value = wrapper.classList.contains('select-wrapperOpen') ? value : '';
        document.getElementById('selectWrapper').classList.toggle('select-wrapperOpen');
        wrapper.classList.contains('select-wrapperOpen') ? arrow.style.transform = 'rotate(180deg)' : arrow.style.transform = 'rotate(0deg)';
    }

    getId(id) {
        return document.getElementById(id).value;
    }

    setAssignedContacts(contactsArray) {
        this.assignedContacts = contactsArray;
    }

    checkOutsideAssign = ({ target }) => {
        let assignMenu = document.getElementById('assignDropdown');
        if (assignMenu.classList.contains('open') && !assignMenu.contains(target)) {
            this.toggleDropdown();
        };
    };

    assignSearchInput = () => {
        const searchInput = document.getElementById('assignSearch');
        const contactsContainer = document.getElementById('contactsToAssign');
        const searchText = searchInput.value.toLowerCase();
        const contactsSorted = [...this.kanban.contacts].sort((a, b) => a.name.localeCompare(b.name));
        const filteredContacts = contactsSorted.filter(c => c.name.toLowerCase().includes(searchText));
        contactsContainer.innerHTML = filteredContacts.map(c => c.html.htmlRenderContactsAssign(this.assignedContacts)).join('');
    };

    contactAssign(id) {
        const index = this.assignedContacts.findIndex(c => c.id === id);
        const inAssignedContacts = index > -1;
        const contactLabel = document.getElementById(`contact${id}`).parentElement;
        contactLabel.classList.toggle('contactsToAssignCheck', !inAssignedContacts);
        if (inAssignedContacts) this.assignedContacts.splice(index, 1);
        else this.assignedContacts.push(this.kanban.contacts.find(c => c.id === id));
        this.renderAssignedContacts();
    }

    renderAssignedContacts() {
        let assignedContactsContainer = document.getElementById('contactsAssigned');
        assignedContactsContainer.innerHTML = '';
        for (let i = 0; i < this.assignedContacts.length; i++) {
            const contact = this.assignedContacts[i];
            if (i <= 5) {
                assignedContactsContainer.innerHTML += contact.profilePic;
            } else {
                assignedContactsContainer.innerHTML += this.html.svgProfilePic('#2a3748', `+${this.assignedContacts.length - 5}`);
                break;
            }
        }
    }

    //NOTE Subtask Methods

    addNewSubtask = (event) => {
        this.handleKeyDown(event);
        const input = document.getElementById('subtaskInput').value.length;
        if (input > -1) {
            document.getElementById('subtaskIconContainer').classList.remove('dNone');
            document.getElementById('subtaskPlusIcon').classList.add('dNone');
        } else {
            document.getElementById('subtaskIconContainer').classList.add('dNone');
            document.getElementById('subtaskPlusIcon').classList.remove('dNone');
        }
    };

    clearSubtaskInput = () => {
        document.getElementById('subtaskInput').value = '';
    };

    handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.saveSubtask();
        }
    };

    saveSubtask = () => {
        let subtaskList = document.getElementById('subtaskList');
        let inputText = document.getElementById('subtaskInput').value.trim();
        if (inputText === '') { return; }
        let index = subtaskList.children.length;
        let subtask = new Subtask({ 'text': inputText, 'status': 'unchecked' });
        let subtaskHTML = subtask.html.generateSaveSubtaskHTML(index);
        let subtaskItem = document.createElement('div');
        subtaskItem.innerHTML = subtaskHTML;
        subtaskList.appendChild(subtaskItem.firstElementChild);
        document.getElementById('subtaskInput').value = '';
        document.getElementById('subtaskIconContainer').classList.add('dNone');
        document.getElementById('subtaskPlusIcon').classList.remove('dNone');
        this.kanban.deactivateListenerAddTask('subtask');
        this.kanban.activateListenerAddTask('subtask');
    };

    editSubtask(editIcon) {
        let subtaskItem = editIcon.closest('.subtaskEditList');
        let subtaskText = subtaskItem.querySelector('.subtaskItemText');
        let editInput = subtaskItem.querySelector('.editSubtaskInput');
        subtaskText.classList.add('dNone');
        editInput.classList.remove('dNone');
        editInput.focus();
        editInput.addEventListener('blur', () => { this.saveEditedSubtask(subtaskText, editInput); });
        this.kanban.deactivateListenerAddTask('subtask');
        this.kanban.activateListenerAddTask('subtask');
    }

    saveEditedSubtask = (subtaskText, editInput) => {
        subtaskText.textContent = editInput.value.trim();
        subtaskText.classList.remove('dNone');
        editInput.classList.add('dNone');
    };

    deleteSubtask(deleteIcon) {
        let subtaskItem = deleteIcon.closest('.subtaskEditList');
        subtaskItem.remove();
        this.kanban.deactivateListenerAddTask('subtask');
        this.kanban.activateListenerAddTask('subtask');
    }

    clearSubtaskList() {
        document.getElementById('subtaskList').innerHTML = '';
    }

    getSubtasks() {
        const subtaskItems = document.querySelectorAll('.subtaskList .subtaskItemText');
        let subtasks = [];
        subtaskItems.forEach(item => { subtasks.push({ status: "unchecked", text: item.innerText }); });
        return subtasks;
    }

    //NOTE Task Creation & Edit Methods

    async pushNewTask() {
        let data = this.createNewTask();
        let newTask = new Task(data);
        await this.kanban.db.post("api/tasks/", newTask.toTaskUploadObject());
        this.kanban.tasks.push(newTask);
        this.kanban.setTasks(this.kanban.tasks);
        this.closeAddTaskModal();
    }

    createNewTask() {
        return {
            title: this.getId('taskTitle'),
            description: this.getId('taskDescription'),
            date: this.getId('dateInput'),
            prio: this.currentPrio,
            status: sessionStorage.getItem('taskCategory'),
            subtasks: this.getSubtasks(),
            assignedTo: this.assignedContacts,
            category: document.getElementById('categoryInput').value,
        };
    }


    //NOTE Validation Methods

    formValidation = () => {
        const inputs = document.querySelectorAll('.singleInputContainer input[required]');
        let isValid = true;
        inputs.forEach(input => {
            const validationText = input.nextElementSibling;
            if (input.value.trim() === '') {
                this.formValidationTrue(input, validationText);
                isValid = false;
            }
            else this.formValidationFalse(input, validationText);
            this.formValidationListener(input, validationText);
        });
        return isValid;
    };

    formValidationTrue(input, validationText) {
        validationText.style.display = 'block';
        input.classList.add('formValidationInputBorder');
    }

    formValidationFalse(input, validationText) {
        validationText.style.display = 'none';
        input.classList.remove('formValidationInputBorder');
    }

    formValidationListener(input, validationText) {
        input.addEventListener('input', () => {
            if (input.value.trim() !== '') {
                validationText.style.display = 'none';
                input.classList.remove('formValidationInputBorder');
            } else {
                validationText.style.display = 'block';
                input.classList.add('formValidationInputBorder');
            }
        });
    }

    //NOTE UI/Modal/Animation Methods

    closeAddTaskModal() {
        if (this.kanban.activeTab == 'add task') {
            this.showTaskAddedAnimation();
            this.kanban.setActive('.menuBtn[href="../html/board.html"]');
            sessionStorage.removeItem('tasks');
        } else {
            this.showTaskAddedAnimation();
            setTimeout(() => this.kanban.activateListenersBoard('dragDrop'), 2000);
        }
    }

    showTaskAddedAnimation() {
        if (window.location.href.endsWith('addtask.html')) {
            this.kanban.toggleClass('taskAddedBtn', 'd-None', 'show');
            setTimeout(() => {
                return window.location.href = "../html/board.html";
            }, 2000);
        } else this.showTaskAddedAnimationModal();
    }

    showTaskAddedAnimationModal() {
        this.kanban.toggleClass('taskAddedBtn', 'd-None', 'show');
        setTimeout(() => { this.kanban.board.closeModal(); }, 2000);
    }

    clearAddTaskForm = () => {
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskDescription').value = '';
        document.getElementById('dateInput').value = '';
        this.updatePrioActiveBtn('');
        document.getElementById('subtaskInput').value = '';
        this.clearSubtaskList();
    };

    //NOTE Priority Methods

    setPrio(element) {
        const prio = element.getAttribute('data-prio');
        this.currentPrio = prio;
        this.updatePrioActiveBtn(prio);
    }

    updatePrioActiveBtn(prio) {
        const buttons = document.querySelectorAll('.prioBtn');
        buttons.forEach(button => {
            button.classList.remove('prioBtnUrgentActive', 'prioBtnMediumActive', 'prioBtnLowActive');
            const imgs = button.querySelectorAll('img');
            imgs.forEach(img => { img.classList.add('hidden'); });
        });
        this.changeActiveBtn(prio);
    }

    changeActiveBtn(prio) {
        const activeButton = document.querySelector(`.prioBtn[data-prio="${prio}"]`);
        if (activeButton) {
            activeButton.classList.add(`prioBtn${this.capitalize(prio)}Active`);
            const whiteIcon = activeButton.querySelector(`.prio${prio}smallWhite`);
            if (whiteIcon) {
                whiteIcon.classList.remove('hidden');
            }
        }
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    //NOTE Board/Move Methods

    updateSubtaskStatusInDOM(subtask, index) {
        subtask.status = subtask.status === "checked" ? "unchecked" : "checked";

        const subtaskCheckbox = document.getElementById(`subtaskCheckbox${index}`);
        if (subtaskCheckbox) {
            subtaskCheckbox.src = subtask.status === "checked"
                ? "../assets/icons/checkboxchecked.svg"
                : "../assets/icons/checkbox.svg";
        }
    }

    async updateSubtaskStatus(taskId, subtaskIndex) {
        let task = tasks.find((task) => task.id === taskId);
        if (task) {
            let subtask = task.subtasks[subtaskIndex];
            if (subtask) {
                this.updateSubtaskStatusInDOM(subtask, subtaskIndex);
                updateSubtaskProgressBar(task.subtasks, taskId);
                await updateDataInDatabase(`${BASE_URL}tasks/${taskId}.json?auth=${token}`, task);
                let taskIndex = tasks.findIndex(t => taskId === t.id);
                tasks.splice(taskIndex, 1, await createTaskArray(taskId, task));
                sessionStorage.setItem("tasks", JSON.stringify(tasks));
            }
        }
    }

    // === Doppelte oder nicht benötigte Methoden ===
    // FIXME: Hier doppelte oder nicht benötigte Methoden ans Ende verschieben
}