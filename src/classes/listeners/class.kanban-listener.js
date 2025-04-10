export class KanbanListener {
    constructor() { }

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
            headerLogout?.addEventListener('click', db.logout);
            headerLegal?.addEventListener('click', this.headerLegalButton);
            headerPrivacy?.addEventListener('click', this.headerPrivacyButton);
        } else if (action === 'remove') {
            headerLogout?.removeEventListener('click', db.logout);
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
        this.activateOutsideCheck(event, 'headerMenuContainer', 'ts1', 'ts0');
    }


    headerUserBadgeMobileButton(event) {
        event.stopPropagation();
        this.toggleClass('headerMenuContainer', 'ts0', 'ts1');
        this.activateOutsideCheck(event, 'headerMenuContainer', 'ts1', 'ts0');
    }


    headerLegalButton() {
        this.setActive('.menuBtn[href=\'../html/imprint.html\']');
    }


    headerPrivacyButton() {
        this.setActive('.menuBtn[href=\'../html/privacy.html\']');
    }


    handleMenuClick(event) {
        this.deactivateListeners();
        this.changeActive(event.target);
    }

}