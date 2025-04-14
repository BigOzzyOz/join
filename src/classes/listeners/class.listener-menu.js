export class MenuListener {
    constructor(kanban) {
        this.kanban = kanban;
        this.headerContainer = document.querySelector('header') || document.body;
        this.navContainer = document.querySelector('nav') || document.body;
        this.headerMenuContainer = document.getElementById('headerMenuContainer');

        this.activateListener();
    }

    handleInteraction = (event) => {
        const target = event.target;

        if (target.closest('#headerUserBadge')) {
            this.headerUserBadgeButton(event);
            return;
        }
        if (target.closest('#headerUserBadgeMobile')) {
            this.headerUserBadgeMobileButton(event);
            return;
        }

        if (this.headerMenuContainer?.contains(target)) {
            if (target.closest('#header-logout')) {
                this.kanban.db.logout();
                return;
            }
            if (target.closest('#header-legal')) {
                this.headerLegalButton();
                this.kanban.toggleClass('headerMenuContainer', 'ts1', 'ts0');
                return;
            }
            if (target.closest('#header-privacy')) {
                this.headerPrivacyButton();
                this.kanban.toggleClass('headerMenuContainer', 'ts1', 'ts0');
                return;
            }
        }

        const menuButton = target.closest('.menuBtn');
        if (menuButton && this.navContainer.contains(menuButton)) {
            this.handleMenuClick(event, menuButton);
            return;
        }
    };

    activateListener() {
        this.headerContainer.addEventListener('click', this.handleInteraction);
        this.navContainer.addEventListener('click', this.handleInteraction);
        this.headerMenuContainer?.addEventListener('click', this.handleInteraction);
    }

    deactivateListenersMenu() {
        this.headerContainer.removeEventListener('click', this.handleInteraction);
        this.navContainer.removeEventListener('click', this.handleInteraction);
        this.headerMenuContainer?.removeEventListener('click', this.handleInteraction);
    }

    headerUserBadgeButton = (event) => {
        this.kanban.toggleClass('headerMenuContainer', 'ts0', 'ts1');
        this.kanban.activateOutsideCheck(event, 'headerMenuContainer', 'ts1', 'ts0');
    };

    headerUserBadgeMobileButton = (event) => {
        event.stopPropagation();
        this.kanban.toggleClass('headerMenuContainer', 'ts0', 'ts1');
        this.kanban.activateOutsideCheck(event, 'headerMenuContainer', 'ts1', 'ts0');
    };

    headerLegalButton = () => {
        this.kanban.setActive('.menuBtn[href="../html/imprint.html"]');
        if (!window.location.pathname.includes('imprint.html')) {
            window.location.href = '../html/imprint.html';
        }
    };

    headerPrivacyButton = () => {
        this.kanban.setActive('.menuBtn[href="../html/privacy.html"]');
        if (!window.location.pathname.includes('privacy.html')) {
            window.location.href = '../html/privacy.html';
        }
    };

    handleMenuClick = (event, clickedButton) => {
        this.kanban.changeActive(clickedButton);
        const href = clickedButton.getAttribute('href');
        if (href && href !== '#') {
            // Navigation logic can be added here if needed
        }
    };
}