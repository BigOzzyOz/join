export class MenuListener {
    //NOTE - Properties
    /** @type {object} Kanban app instance. */
    kanban;
    /** @type {HTMLElement} Header container. */
    headerContainer;
    /** @type {HTMLElement} Navigation container. */
    navContainer;
    /** @type {HTMLElement|null} Header menu container. */
    headerMenuContainer;

    //NOTE - Constructor & Initialization
    /**
     * Creates a MenuListener instance.
     * @param {object} kanban - Kanban app instance
     */
    constructor(kanban) {
        this.kanban = kanban;
        this.headerContainer = document.querySelector('header') || document.body;
        this.navContainer = document.querySelector('nav') || document.body;
        this.headerMenuContainer = document.getElementById('headerMenuContainer');
        this.activateListener();
    }

    //NOTE - Listener Management
    /**
     * Activates all relevant listeners for the menu.
     * @returns {void}
     */
    activateListener() {
        this.headerContainer.addEventListener('click', this.handleInteraction);
        this.navContainer.addEventListener('click', this.handleInteraction);
        this.headerMenuContainer?.addEventListener('click', this.handleInteraction);
    }

    /**
     * Deactivates all listeners for the menu.
     * @returns {void}
     */
    deactivateListenersMenu() {
        this.headerContainer.removeEventListener('click', this.handleInteraction);
        this.navContainer.removeEventListener('click', this.handleInteraction);
        this.headerMenuContainer?.removeEventListener('click', this.handleInteraction);
    }

    //NOTE - Main Event Handling
    /**
     * Handles all click events for the menu and header.
     * @param {Event} event
     * @returns {void}
     */
    handleInteraction = (event) => {
        const target = event.target;
        if (target.closest('#headerUserBadge')) return this.headerUserBadgeButton(event);
        if (target.closest('#headerUserBadgeMobile')) return this.headerUserBadgeMobileButton(event);
        if (this.headerMenuContainer?.contains(target)) {
            if (target.closest('#header-logout')) return this.kanban.db.logout();
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
        if (menuButton && this.navContainer.contains(menuButton)) return this.handleMenuClick(event, menuButton);
    };

    //NOTE - Specific Event Handlers (Header Menu)
    /**
     * Handles click on the header user badge.
     * @param {Event} event
     * @returns {void}
     */
    headerUserBadgeButton = (event) => {
        this.kanban.toggleClass('headerMenuContainer', 'ts0', 'ts1');
        this.kanban.activateOutsideCheck(event, 'headerMenuContainer', 'ts1', 'ts0');
    };

    /**
     * Handles click on the mobile header user badge.
     * @param {Event} event
     * @returns {void}
     */
    headerUserBadgeMobileButton = (event) => {
        event.stopPropagation();
        this.kanban.toggleClass('headerMenuContainer', 'ts0', 'ts1');
        this.kanban.activateOutsideCheck(event, 'headerMenuContainer', 'ts1', 'ts0');
    };

    /**
     * Handles click on the legal notice button in the header menu.
     * @returns {void}
     */
    headerLegalButton = () => {
        this.kanban.setActive('.menuBtn[href="../html/imprint.html"]');
        if (!window.location.pathname.includes('imprint.html')) window.location.href = '../html/imprint.html';
    };

    /**
     * Handles click on the privacy policy button in the header menu.
     * @returns {void}
     */
    headerPrivacyButton = () => {
        this.kanban.setActive('.menuBtn[href="../html/privacy.html"]');
        if (!window.location.pathname.includes('privacy.html')) window.location.href = '../html/privacy.html';
    };

    //NOTE - Specific Event Handlers (Navigation Menu)
    /**
     * Handles click on a navigation menu button.
     * @param {Event} event
     * @param {HTMLElement} clickedButton
     * @returns {void}
     */
    handleMenuClick = (event, clickedButton) => {
        this.kanban.changeActive(clickedButton);
        const href = clickedButton.getAttribute('href');
        // Additional navigation logic could be added here if needed.
    };

    //NOTE - Error Handling
    /**
     * Logs an error message.
     * @param {string} msg
     * @returns {void}
     */
    _logError(msg) { console.error(msg); }
}