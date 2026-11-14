(() => {
  'use strict';

  const BREAKPOINT = '(max-width: 991px)';

  function initAdminShell() {
    const root = document.getElementById('admin-shell');
    if (!root || root.dataset.shellReady === 'true') return null;

    const sider = document.getElementById('admin-sider');
    const trigger = document.getElementById('admin-sidebar-trigger');
    const closeButton = document.getElementById('admin-sider-close');
    const mask = document.getElementById('admin-mask');
    if (!sider || !trigger) return null;

    const mobileQuery = window.matchMedia(BREAKPOINT);
    const storageKey = root.dataset.storageKey || 'admin-shell-collapsed';
    const state = {
      collapsed: false,
      mobileOpen: false,
      returnFocusTo: null
    };

    function readCollapsedPreference() {
      try {
        return window.localStorage.getItem(storageKey) === 'true';
      } catch (error) {
        return false;
      }
    }

    function saveCollapsedPreference() {
      try {
        window.localStorage.setItem(storageKey, String(state.collapsed));
      } catch (error) {
        return;
      }
    }

    function isMobile() {
      return mobileQuery.matches;
    }

    function setBodyScrollLock(locked) {
      document.body.classList.toggle('admin-menu-open', locked);
    }

    function syncSiderAccessibility() {
      const drawerClosed = isMobile() && !state.mobileOpen;
      if (drawerClosed) {
        sider.setAttribute('inert', '');
        sider.setAttribute('aria-hidden', 'true');
      } else {
        sider.removeAttribute('inert');
        sider.removeAttribute('aria-hidden');
      }

      const expanded = isMobile() ? state.mobileOpen : !state.collapsed;
      trigger.setAttribute('aria-expanded', String(expanded));
      trigger.setAttribute(
        'aria-label',
        isMobile()
          ? state.mobileOpen ? '关闭菜单' : '打开菜单'
          : state.collapsed ? '展开菜单' : '收起菜单'
      );
      trigger.title = isMobile()
        ? state.mobileOpen ? '关闭菜单' : '打开菜单'
        : state.collapsed ? '展开菜单' : '收起菜单';
    }

    function syncShellState() {
      const desktopCollapsed = !isMobile() && state.collapsed;
      root.classList.toggle('is-collapsed', desktopCollapsed);
      root.classList.toggle('is-mobile-open', isMobile() && state.mobileOpen);
      setBodyScrollLock(isMobile() && state.mobileOpen);
      syncSiderAccessibility();
      root.dispatchEvent(new CustomEvent('admin-shell:change', {
        bubbles: true,
        detail: {
          collapsed: state.collapsed,
          mobileOpen: state.mobileOpen,
          mobile: isMobile()
        }
      }));
    }

    function focusableElements() {
      return Array.from(sider.querySelectorAll('a[href], button:not([disabled])'))
        .filter((element) => element.getClientRects().length > 0);
    }

    function openMobileMenu() {
      if (!isMobile() || state.mobileOpen) return;
      state.returnFocusTo = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : trigger;
      state.mobileOpen = true;
      syncShellState();
      window.requestAnimationFrame(() => {
        const initialFocus = closeButton || focusableElements()[0] || sider;
        initialFocus.focus();
      });
    }

    function closeMobileMenu(options = {}) {
      const { restoreFocus = true } = options;
      if (!state.mobileOpen) return;

      const focusTarget = state.returnFocusTo && state.returnFocusTo.isConnected
        ? state.returnFocusTo
        : trigger;
      state.mobileOpen = false;
      if (restoreFocus) focusTarget.focus();
      syncShellState();
    }

    function setCollapsed(collapsed, options = {}) {
      const { persist = true } = options;
      state.collapsed = Boolean(collapsed);
      if (persist) saveCollapsedPreference();
      if (!isMobile()) syncShellState();
    }

    function toggleCollapsed() {
      if (isMobile()) {
        state.mobileOpen ? closeMobileMenu() : openMobileMenu();
        return;
      }
      setCollapsed(!state.collapsed);
    }

    trigger.addEventListener('click', toggleCollapsed);
    closeButton?.addEventListener('click', () => closeMobileMenu());
    mask?.addEventListener('click', () => closeMobileMenu());

    sider.addEventListener('click', (event) => {
      if (!isMobile() || !state.mobileOpen) return;
      const menuLink = event.target.closest('a[href]');
      if (menuLink) closeMobileMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (!isMobile() || !state.mobileOpen) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        closeMobileMenu();
        return;
      }

      if (event.key !== 'Tab') return;
      const focusables = focusableElements();
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    function handleBreakpointChange() {
      if (sider.contains(document.activeElement)) trigger.focus();
      state.mobileOpen = false;
      state.returnFocusTo = null;
      setBodyScrollLock(false);
      syncShellState();
    }

    if (mobileQuery.addEventListener) mobileQuery.addEventListener('change', handleBreakpointChange);
    else mobileQuery.addListener(handleBreakpointChange);

    state.collapsed = readCollapsedPreference();
    syncShellState();
    root.dataset.shellReady = 'true';

    return {
      collapse: () => setCollapsed(true),
      expand: () => setCollapsed(false),
      toggle: toggleCollapsed,
      openMenu: openMobileMenu,
      closeMenu: closeMobileMenu,
      isCollapsed: () => state.collapsed,
      isMobileOpen: () => state.mobileOpen,
      isMobile
    };
  }

  const api = initAdminShell();
  if (api) window.AdminShell = api;
})();
