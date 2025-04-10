import { Board } from "./class.Board";
import { Contact } from "./class.Contact";
import { Database } from "./class.database";
import { Task } from "./class.Task";

export class Kanban {
    static currentUser = JSON.parse(localStorage.getItem('currentUser')) || JSON.parse(sessionStorage.getItem('currentUser')) || null;
    static activeTab = sessionStorage.getItem('activeTab') || '';
    static contacts = JSON.parse(sessionStorage.getItem('contact')) || [];
    static tasks = JSON.parse(sessionStorage.getItem('tasks')) || [];
    static board = null;



    constructor() {
        if (Database.token) Kanban.board = new Board();
    }

    static async init() {
        await this.includeHTML();
        Kanban, setActive();
        this.checkAndShowOrHideContent();
        if (!sessionStorage.getItem('taskCategory')) sessionStorage.setItem('taskCategory', 'toDo');
        document.getElementById('backArrow')?.addEventListener('click', () => { window.history.back(); });
    }


    async includeHTML() {
        const elementsToInclude = document.querySelectorAll('[w3-include-html]');
        for (const element of elementsToInclude) {
            const filePath = element.getAttribute('w3-include-html');
            try {
                const response = await fetch(filePath);
                element.innerHTML = response.ok ? await response.text() : 'Page not found';
            } catch {
                element.innerHTML = 'Page not found';
            }
        }
        if (elementsToInclude.length > 0) this.activateListener();
    }


    static changeActive(link) {
        let linkBtn = document.querySelectorAll(".menuBtn");
        linkBtn.forEach(btn => btn.classList.remove("menuBtnActive"));
        Kanban.activeTab = link.innerText.toLowerCase();
        sessionStorage.setItem("activeTab", Kanban.activeTab);
        sessionStorage.getItem('taskCategory');
        Kanban.setActive();
    }


    static setActive(link = null) {
        const menuButtons = document.querySelectorAll(".menuBtn");
        const currentPage = document.querySelector('main').getAttribute('data-page').toLowerCase();
        const activeTabName = Kanban.activeTab || currentPage;
        const newActiveTab = document.querySelector(link);
        if (newActiveTab) Kanban.changeActive(newActiveTab);
        else menuButtons.forEach(button => {
            const buttonName = button.innerText.toLowerCase();
            if (buttonName === activeTabName) button.classList.add("menuBtnActive");
        });
    }


    checkAndShowOrHideContent() {
        const forbiddenContentElements = document.querySelectorAll(".forbiddenContent");
        const menuUserContainerElement = document.getElementById("menuUserContainer");
        const headerUserContainerElement = document.getElementById("headerUserContainer");
        const headerUserBadgeElements = document.querySelectorAll(".headerUserBadge");

        if (!forbiddenContentElements || !menuUserContainerElement || !headerUserContainerElement) return;

        if (!Kanban.currentUser) {
            this.hideContentWhenNoUser(forbiddenContentElements, menuUserContainerElement, headerUserContainerElement);
        } else {
            this.showContentWhenUserIsLoggedIn(forbiddenContentElements, menuUserContainerElement, headerUserContainerElement);
            headerUserBadgeElements.forEach(badgeElement => badgeElement.innerText = Kanban.currentUser.firstLetters);
        }
    }


    hideContentWhenNoUser(forbiddenContentElements, menuUserContainerElement, headerUserContainerElement) {
        forbiddenContentElements.forEach(element => element.classList.add('d-none'));
        menuUserContainerElement.classList.add('d-none');
        headerUserContainerElement.classList.add('d-none');
    }


    showContentWhenUserIsLoggedIn(forbiddenContentElements, menuUserContainerElement, headerUserContainerElement) {
        forbiddenContentElements.forEach(element => element.classList.remove('d-none'));
        menuUserContainerElement.classList.remove('d-none');
        headerUserContainerElement.classList.remove('d-none');
    }

    deactivateListeners() {
        this.deactivateAllListenersLogin();
        this.deactivateAllListenersRegister();
        this.deactivateAllListenersSummary();
        this.deactivateAllListenersBoard();
        this.deactivateAllListenersContacts();
        this.deactivateListenersScript();
    } //TODO - this anpassen


    deactivateListenersScript() {
        this.headerListenerMenu('remove');
        this.headerListenerMenuLinks('remove');
        this.navListenerMenu('remove');
    }


    activateListener() {
        this.headerListenerMenu('add');
        this.headerListenerMenuLinks('add');
        this.navListenerMenu('add');
    }


    headerListenerMenu(action) {
        const headerUserBadge = document.getElementById('headerUserBadge');
        const headerUserBadgeMobile = document.getElementById('headerUserBadgeMobile');

        if (action === 'add') {
            headerUserBadge?.addEventListener('click', this.headerUserBadgeButton);
            headerUserBadgeMobile?.addEventListener('click', this.headerUserBadgeMobileButton);
        } else if (action === 'remove') {
            headerUserBadge?.removeEventListener('click', this.headerUserBadgeButton);
            headerUserBadgeMobile?.removeEventListener('click', this.headerUserBadgeMobileButton);
        }
    }


    headerListenerMenuLinks(action) {
        const headerLogout = document.getElementById('header-logout');
        const headerLegal = document.getElementById('header-legal');
        const headerPrivacy = document.getElementById('header-privacy');

        if (action === 'add') {
            headerLogout?.addEventListener('click', Database.logout);
            headerLegal?.addEventListener('click', this.headerLegalButton);
            headerPrivacy?.addEventListener('click', this.headerPrivacyButton);
        } else if (action === 'remove') {
            headerLogout?.removeEventListener('click', Database.logout);
            headerLegal?.removeEventListener('click', this.headerLegalButton);
            headerPrivacy?.removeEventListener('click', this.headerPrivacyButton);
        }
    }


    navListenerMenu(action) {
        const menuBtns = document.querySelectorAll('.menuBtn');

        if (action === 'add') {
            menuBtns.forEach(btn => btn.addEventListener('click', this.handleMenuClick));
        } else if (action === 'remove') {
            menuBtns.forEach(btn => btn.removeEventListener('click', this.handleMenuClick));
        }
    }


    headerUserBadgeButton(event) {
        Kanban.toggleClass('headerMenuContainer', 'ts0', 'ts1');
        Kanban.activateOutsideCheck(event, 'headerMenuContainer', 'ts1', 'ts0');
    }


    headerUserBadgeMobileButton(event) {
        event.stopPropagation();
        Kanban.toggleClass('headerMenuContainer', 'ts0', 'ts1');
        Kanban.activateOutsideCheck(event, 'headerMenuContainer', 'ts1', 'ts0');
    }


    headerLegalButton() {
        Kanban.setActive('.menuBtn[href=\'../html/imprint.html\']');
    }


    headerPrivacyButton() {
        Kanban.setActive('.menuBtn[href=\'../html/privacy.html\']');
    }


    handleMenuClick(event) {
        this.deactivateListeners();
        Kanban.changeActive(event.target);
    }


    static toggleLoader(status) {
        const loaderElement = document.getElementById('mainLoader');
        if (!loaderElement) return;
        loaderElement.style.display = status ? 'flex' : 'none';
    }


    static setTasks(newTasks) {
        tasks = newTasks;
    }


    static setContacts(newContacts) {
        contacts = newContacts;
    }


    static toggleClass(menu, className1, className2) {
        let edit = document.getElementById(menu);
        edit.classList.toggle(className1);
        edit.classList.toggle(className2);
    }


    static activateOutsideCheck(event, modalName, class1, class2) {
        event.stopPropagation();

        const outsideClickHandler = (e) => {
            Kanban.checkOutsideModal(e, modalName, class1, class2, outsideClickHandler);
        };

        document.addEventListener('click', outsideClickHandler);
    }


    static checkOutsideModal(event, modalName, class1, class2, handler) {
        let modal = document.getElementById(modalName);
        if (modal.classList.contains(class1) && !modal.contains(event.target)) {
            Kanban.toggleClass(modalName, class1, class2);
            document?.removeEventListener('click', handler);
        };
    }
}