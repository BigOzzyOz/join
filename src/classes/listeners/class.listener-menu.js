export class MenuListener {
    constructor(kanban) {
        this.kanban = kanban;
        this.activateListener();
    }


    activateListener() {
        this.headerListenerMenu('add');
        this.headerListenerMenuLinks('add');
        this.navListenerMenu('add');
    }

    deactivateListenersMenu() {
        this.headerListenerMenu('remove');
        this.headerListenerMenuLinks('remove');
        this.navListenerMenu('remove');
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
            headerLogout?.addEventListener('click', this.kanban.db.logout);
            headerLegal?.addEventListener('click', this.headerLegalButton);
            headerPrivacy?.addEventListener('click', this.headerPrivacyButton);
        } else if (action === 'remove') {
            headerLogout?.removeEventListener('click', this.kanban.db.logout);
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
        this.toggleClass('headerMenuContainer', 'ts0', 'ts1');
        this.kanban.activateOutsideCheck(event, 'headerMenuContainer', 'ts1', 'ts0');
    }


    headerUserBadgeMobileButton(event) {
        event.stopPropagation();
        this.kanban.toggleClass('headerMenuContainer', 'ts0', 'ts1');
        this.kanban.activateOutsideCheck(event, 'headerMenuContainer', 'ts1', 'ts0');
    }


    headerLegalButton() {
        this.kanban.setActive('.menuBtn[href=\'../html/imprint.html\']');
    }


    headerPrivacyButton() {
        this.kanban.setActive('.menuBtn[href=\'../html/privacy.html\']');
    }


    handleMenuClick(event) {
        this.kanban.listener.deactivateListeners();
        this.kanban.changeActive(event.target);
    }
}