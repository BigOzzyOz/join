import { AddTaskHtml } from "./html/class.html-add-task.js";

export class AddTask {
    constructor(kanban) {
        this.kanban = kanban;
        this.assignedContacts = [];
        this.currentPrio = 'medium';
        this.html = new AddTaskHtml(kanban);
    }



    //NOTE - Dropdown functions


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
        const contactsAssign = document.querySelectorAll('.assignContactToProject');
        //contactsAssign.forEach((element) => element.addEventListener('click', handleAssignContact));//TODO - move to utils
        document.addEventListener('click', this.checkOutsideAssign);
    }


    closeAssignDropdown() {
        let searchInput = document.getElementById('assignSearch');
        let contactsContainer = document.getElementById('contactsToAssign');
        contactsContainer.innerHTML = '';
        document.getElementById('assignDropArrow').style.transform = 'rotate(0deg)';
        searchInput.value = 'Select contacts to assign';
        searchInput.setAttribute('readonly', true);
        const contactsAssign = document.querySelectorAll('.assignContactToProject');
        contactsAssign?.forEach((element) => element.removeEventListener('click', handleAssignContact));
        document?.removeEventListener('click', checkOutsideAssign);
    };


    toggleCategoryDropdown(value) {
        let input = document.getElementById('categoryInput');
        let wrapper = document.getElementById('selectWrapper');
        let arrow = document.getElementById('categoryDropArrow');
        input.value = wrapper.classList.contains('select-wrapperOpen') ? value : '';
        document.getElementById('selectWrapper').classList.toggle('select-wrapperOpen');
        wrapper.classList.contains('select-wrapperOpen') ? arrow.style.transform = 'rotate(180deg)' : arrow.style.transform = 'rotate(0deg)';
    }


    //NOTE - Assign functions


    getId(id) {
        return document.getElementById(id).value;
    }


    setAssignedContacts(contactsArray) {
        this.assignedContacts = contactsArray;
    }


    checkOutsideAssign({ target }) {
        let assignMenu = document.getElementById('assignDropdown');
        if (assignMenu.classList.contains('open') && !assignMenu.contains(target)) {
            this.toggleDropdown();
        };
    }


    assignSearchInput = () => {
        const searchInput = document.getElementById('assignSearch');
        const contactsContainer = document.getElementById('contactsToAssign');
        const searchText = searchInput.value.toLowerCase();
        const contactsSorted = [...contacts].sort((a, b) => a.name.localeCompare(b.name));
        const filteredContacts = contactsSorted.filter(c => c.name.toLowerCase().includes(searchText));
        contactsContainer.innerHTML = filteredContacts.map(c => htmlRenderContactsAssign(c)).join('');
    };


    contactAssign(id) {
        const index = this.assignedContacts.findIndex(c => c.id === id);
        const inAssignedContacts = index > -1;
        const contactLabel = document.getElementById(`contact${id}`).parentElement;
        contactLabel.classList.toggle('contactsToAssignCheck', !inAssignedContacts);
        if (inAssignedContacts) this.assignedContacts.splice(index, 1);
        else this.assignedContacts.push(contacts.find(c => c.id === id));
        renderAssignedContacts();
    }


    renderAssignedContacts() {
        let assignedContactsContainer = document.getElementById('contactsAssigned');
        assignedContactsContainer.innerHTML = '';
        for (let i = 0; i < this.assignedContacts.length; i++) {
            const contact = this.assignedContacts[i];
            if (i <= 5) {
                assignedContactsContainer.innerHTML += contact.profilePic;
            } else {
                const contactHtml = new ContactHtml(contact);
                assignedContactsContainer.innerHTML += contactHtml.svgProfilePic('#2a3748', `+${this.assignedContacts.length - 5}`);
                break;
            }
        }
    }


    //NOTE - Subtask functions


    addNewSubtask = (event) => {
        handleKeyDown(event);
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


    handleKeyDown(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            saveSubtask();
        }
    }


    saveSubtask() {
        let subtaskList = document.getElementById('subtaskList');
        let inputText = document.getElementById('subtaskInput').value.trim();
        if (inputText === '') { return; }
        let index = subtaskList.children.length;
        let subtaskHTML = generateSaveSubtaskHTML(inputText, index);
        let subtaskItem = document.createElement('div');
        subtaskItem.innerHTML = subtaskHTML;
        subtaskList.appendChild(subtaskItem.firstElementChild);
        document.getElementById('subtaskInput').value = '';
        document.getElementById('subtaskIconContainer').classList.add('dNone');
        document.getElementById('subtaskPlusIcon').classList.remove('dNone');
        deactivateSubtaskListeners();
        activateSubtaskListeners();
    }


    editSubtask(editIcon) {
        let subtaskItem = editIcon.closest('.subtaskEditList');
        let subtaskText = subtaskItem.querySelector('.subtaskItemText');
        let editInput = subtaskItem.querySelector('.editSubtaskInput');
        subtaskText.classList.add('dNone');
        editInput.classList.remove('dNone');
        editInput.focus();
        editInput.addEventListener('blur', () => { saveEditedSubtask(subtaskText, editInput); });
        deactivateSubtaskListeners();
        activateSubtaskListeners();
    }


    saveEditedSubtask(subtaskText, editInput) {
        subtaskText.textContent = editInput.value.trim();
        subtaskText.classList.remove('dNone');
        editInput.classList.add('dNone');
    }


    deleteSubtask(deleteIcon) {
        let subtaskItem = deleteIcon.closest('.subtaskEditList');
        subtaskItem.remove();
        deactivateSubtaskListeners();
        activateSubtaskListeners();
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


    async pushNewTask() {
        let newTask = createNewTask();
        await postDataToDatabase("tasks", newTask);
        closeAddTaskModal();
    }


    //NOTE - Validation functions


    formValidation() {
        const inputs = document.querySelectorAll('.singleInputContainer input[required]');
        let isValid = true;
        inputs.forEach(input => {
            const validationText = input.nextElementSibling;
            if (input.value.trim() === '') {
                formValidationTrue(input, validationText);
                isValid = false;
            }
            else formValidationFalse(input, validationText);
            formValidationListener(input, validationText);
        });
        return isValid;
    }


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


    async closeAddTaskModal() {
        if (activeTab == 'add task') {
            showTaskAddedAnimation();
            setTasks([]);
            setActiveTab('.menuBtn[href="../html/board.html"]');
            sessionStorage.removeItem('tasks');
        } else {
            showTaskAddedAnimation();
            setTasks([]);
            setTimeout(() => location.reload(), 2000);
        }
    }


    showTaskAddedAnimation() {
        if (window.location.href.endsWith('addtask.html')) {
            toggleClass('taskAddedBtn', 'd-None', 'show');
            setTimeout(() => {
                return window.location.href = "../html/board.html";
            }, 2000);
        } else showTaskAddedAnimationModal();
    }


    showTaskAddedAnimationModal() {
        toggleClass('taskAddedBtn', 'd-None', 'show');
        setTimeout(() => { closeModal(); }, 2000);
    }


    clearAddTaskForm = () => {
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskDescription').value = '';
        document.getElementById('dateInput').value = '';
        updatePrioActiveBtn('');
        document.getElementById('subtaskInput').value = '';
        clearSubtaskList();
    };

    enableTaskEdit(taskId) {
        let modalContainer = document.getElementById("modalContainer");
        modalContainer.innerHTML = generateTaskEditHTML(taskId);
        let task = tasks.find((task) => task.id === taskId);
        if (task.assignedTo) setAssignedContacts(task.assignedTo);
        currentTaskStatus = task.status;
        document.getElementById("editTaskTitle").value = task.title;
        document.getElementById("editTaskDescription").value = task.description;
        document.getElementById("editDateInput").value = task.date;
        updatePrioActiveBtn(task.prio);
        renderAssignedContacts();
        activateEditTaskListeners();
    }


    createEditedTask(taskId) {
        let originalTask = tasks.find(task => task.id === taskId);
        if (!originalTask) return;
        let subtasks = [];
        document.querySelectorAll('#subtaskList .subtaskItem').forEach((subtaskItem, index) => {
            const subtaskText = subtaskItem.querySelector('span').innerText;
            let status = 'unchecked';
            if (originalTask.subtasks && originalTask.subtasks[index]) {
                status = originalTask.subtasks[index].status ? originalTask.subtasks[index].status : 'unchecked';
            }
            subtasks.push({ text: subtaskText, status: status });
        });
        return createEditedTaskReturn(subtasks, originalTask);
    }


    createEditedTaskReturn(subtasks, originalTask) {
        return {
            title: document.getElementById('editTaskTitle').value,
            description: document.getElementById('editTaskDescription').value,
            date: document.getElementById('editDateInput').value,
            prio: currentPrio,
            status: currentTaskStatus,
            subtasks: subtasks,
            assignedTo: this.assignedContacts,
            category: originalTask.category,
        };
    }


    async saveEditedTask(taskId) {
        const task = createEditedTask(taskId);
        await updateDataInDatabase(`${BASE_URL}tasks/${taskId}.json?auth=${token}`, task);
        const taskIndex = tasks.findIndex((t) => t.id === taskId);
        tasks.splice(taskIndex, 1, await createTaskArray(taskId, task));
        sessionStorage.setItem("tasks", JSON.stringify(tasks));
        openOverlay(taskId);
        initDragDrop();
        applyCurrentSearchFilter();
    }


    async moveTo(newStatus) {
        document.querySelectorAll(".taskDragArea").forEach((area) => {
            area.classList.add("highlighted");
        });

        const taskToMove = tasks.find(task => task.id === currentDraggedElement);
        if (taskToMove && newStatus) {
            taskToMove.status = newStatus;
            await updateDataInDatabase(`${BASE_URL}tasks/${taskToMove.id}.json?auth=${token}`, taskToMove);

            const taskIndex = tasks.findIndex(task => task.id === taskToMove.id);
            tasks.splice(taskIndex, 1, await createTaskArray(taskToMove.id, taskToMove));
            sessionStorage.setItem("tasks", JSON.stringify(tasks));

            initDragDrop();
            applyCurrentSearchFilter();
        }
    }

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
                updateSubtaskStatusInDOM(subtask, subtaskIndex);
                updateSubtaskProgressBar(task.subtasks, taskId);
                await updateDataInDatabase(`${BASE_URL}tasks/${taskId}.json?auth=${token}`, task);
                let taskIndex = tasks.findIndex(t => taskId === t.id);
                tasks.splice(taskIndex, 1, await createTaskArray(taskId, task));
                sessionStorage.setItem("tasks", JSON.stringify(tasks));
            }
        }
    }
}