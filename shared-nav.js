/**
 * 统一导航系统 - 优化版 JavaScript
 * 提供增强的交互体验和可访问性支持
 */

(function() {
    'use strict';

    // 导航状态管理
    const NavState = {
        sidebar: null,
        overlay: null,
        toggle: null,
        closeBtn: null,
        isOpen: false,
        focusableElements: [],
        lastFocusedElement: null,
        touchStartX: 0,
        touchEndX: 0
    };

    /**
     * 初始化导航元素
     */
    function initNavElements() {
        NavState.sidebar = document.getElementById('sidebar');
        NavState.overlay = document.getElementById('sidebar-overlay');
        NavState.toggle = document.getElementById('mobile-nav-toggle');
        NavState.closeBtn = document.getElementById('sidebar-close-btn');

        if (NavState.sidebar) {
            // 获取所有可聚焦元素
            NavState.focusableElements = Array.from(
                NavState.sidebar.querySelectorAll(
                    'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
                )
            );
        }
    }

    /**
     * 切换侧边栏状态
     */
    function toggleSidebar() {
        if (NavState.isOpen) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }

    /**
     * 打开侧边栏
     */
    function openSidebar() {
        if (!NavState.sidebar || !NavState.overlay) return;

        NavState.isOpen = true;
        NavState.lastFocusedElement = document.activeElement;

        NavState.sidebar.classList.add('open');
        NavState.overlay.classList.add('active');

        if (NavState.toggle) {
            NavState.toggle.setAttribute('aria-expanded', 'true');
        }

        // 聚焦到第一个可聚焦元素
        setTimeout(() => {
            const firstFocusable = NavState.focusableElements[0];
            if (firstFocusable) {
                firstFocusable.focus();
            }
        }, 100);

        // 禁止背景滚动
        document.body.style.overflow = 'hidden';

        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('sidebar:open'));
    }

    /**
     * 关闭侧边栏
     */
    function closeSidebar() {
        if (!NavState.sidebar || !NavState.overlay) return;

        NavState.isOpen = false;

        NavState.sidebar.classList.remove('open');
        NavState.overlay.classList.remove('active');

        if (NavState.toggle) {
            NavState.toggle.setAttribute('aria-expanded', 'false');
        }

        // 恢复背景滚动
        document.body.style.overflow = '';

        // 恢复焦点
        if (NavState.lastFocusedElement) {
            NavState.lastFocusedElement.focus();
        }

        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('sidebar:close'));
    }

    /**
     * 处理键盘导航
     */
    function handleKeyboardNavigation(e) {
        // ESC 关闭侧边栏
        if (e.key === 'Escape' && NavState.isOpen) {
            closeSidebar();
            return;
        }

        // 侧边栏打开时的焦点捕获
        if (NavState.isOpen && NavState.focusableElements.length > 0) {
            const firstElement = NavState.focusableElements[0];
            const lastElement = NavState.focusableElements[NavState.focusableElements.length - 1];

            // Tab 循环焦点
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }

            // 方向键导航
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                const currentIndex = NavState.focusableElements.indexOf(document.activeElement);
                if (currentIndex !== -1) {
                    e.preventDefault();
                    let nextIndex;
                    if (e.key === 'ArrowDown') {
                        nextIndex = (currentIndex + 1) % NavState.focusableElements.length;
                    } else {
                        nextIndex = (currentIndex - 1 + NavState.focusableElements.length) % NavState.focusableElements.length;
                    }
                    NavState.focusableElements[nextIndex].focus();
                }
            }
        }
    }

    /**
     * 处理触摸滑动（移动端手势）
     */
    function handleTouchStart(e) {
        NavState.touchStartX = e.changedTouches[0].screenX;
    }

    function handleTouchEnd(e) {
        NavState.touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }

    function handleSwipe() {
        const swipeThreshold = 80;
        const diff = NavState.touchStartX - NavState.touchEndX;

        // 从左向右滑动打开侧边栏（在屏幕左边缘）
        if (NavState.touchStartX < 50 && diff < -swipeThreshold && !NavState.isOpen) {
            openSidebar();
        }

        // 从右向左滑动关闭侧边栏
        if (diff > swipeThreshold && NavState.isOpen) {
            closeSidebar();
        }
    }

    /**
     * 初始化工具提示
     */
    function initTooltips() {
        // 创建工具提示元素
        const tooltip = document.createElement('div');
        tooltip.className = 'nav-tooltip';
        tooltip.id = 'nav-tooltip';
        document.body.appendChild(tooltip);

        // 为所有带 data-tooltip 的元素添加工具提示
        const tooltipTriggers = document.querySelectorAll('[data-tooltip]');

        tooltipTriggers.forEach(trigger => {
            trigger.addEventListener('mouseenter', (e) => {
                const text = trigger.getAttribute('data-tooltip');
                if (!text) return;

                tooltip.textContent = text;
                tooltip.classList.add('visible');

                // 计算位置
                const rect = trigger.getBoundingClientRect();
                const tooltipRect = tooltip.getBoundingClientRect();

                let left = rect.right + 8;
                let top = rect.top + (rect.height - tooltipRect.height) / 2;

                // 防止超出视口右边界
                if (left + tooltipRect.width > window.innerWidth) {
                    left = rect.left - tooltipRect.width - 8;
                    tooltip.style.transform = 'translateX(10px)';
                }

                tooltip.style.left = `${left}px`;
                tooltip.style.top = `${top}px`;
            });

            trigger.addEventListener('mouseleave', () => {
                tooltip.classList.remove('visible');
            });

            trigger.addEventListener('focus', (e) => {
                const text = trigger.getAttribute('data-tooltip');
                if (!text) return;
                tooltip.textContent = text;
                tooltip.classList.add('visible');

                const rect = trigger.getBoundingClientRect();
                const tooltipRect = tooltip.getBoundingClientRect();

                let left = rect.right + 8;
                let top = rect.top + (rect.height - tooltipRect.height) / 2;

                if (left + tooltipRect.width > window.innerWidth) {
                    left = rect.left - tooltipRect.width - 8;
                }

                tooltip.style.left = `${left}px`;
                tooltip.style.top = `${top}px`;
            });

            trigger.addEventListener('blur', () => {
                tooltip.classList.remove('visible');
            });
        });
    }

    /**
     * 初始化当前页面高亮
     */
    function initActiveNavItem() {
        const currentPath = window.location.pathname;
        const navItems = document.querySelectorAll('.nav-item');

        navItems.forEach(item => {
            const href = item.getAttribute('href');
            if (!href) return;

            // 移除所有 active 类
            item.classList.remove('active');

            // 检查是否匹配当前页面
            if (href === currentPath ||
                (href !== '../index.html' && currentPath.includes(href.replace('../', '').replace('.html', ''))) ||
                (currentPath.endsWith('/') && href.includes('index.html'))) {
                item.classList.add('active');

                // 更新当前页面指示器
                updateCurrentIndicator(item);
            }
        });
    }

    /**
     * 更新当前页面指示器
     */
    function updateCurrentIndicator(activeItem) {
        const indicator = document.querySelector('.nav-current-indicator-text');
        const indicatorIcon = document.querySelector('.nav-current-indicator-icon');

        if (indicator && activeItem) {
            const text = activeItem.querySelector('span:not(.nav-item-badge)')?.textContent || '';
            indicator.textContent = text;
        }

        if (indicatorIcon && activeItem) {
            const iconSvg = activeItem.querySelector('.nav-item-icon');
            if (iconSvg) {
                indicatorIcon.innerHTML = iconSvg.innerHTML;
            }
        }
    }

    /**
     * 初始化快捷操作按钮
     */
    function initQuickActions() {
        const quickBtns = document.querySelectorAll('.nav-quick-btn');

        quickBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.getAttribute('data-action');

                switch(action) {
                    case 'theme':
                        toggleTheme();
                        break;
                    case 'search':
                        openSearch();
                        break;
                    case 'home':
                        window.location.href = '../index.html';
                        break;
                }
            });
        });
    }

    /**
     * 切换主题
     */
    function toggleTheme() {
        if (typeof MetroCommon !== 'undefined' && MetroCommon.toggleDarkMode) {
            MetroCommon.toggleDarkMode();
        } else {
            document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme',
                document.documentElement.classList.contains('dark') ? 'dark' : 'light'
            );
        }
        updateThemeIcons();
    }

    /**
     * 打开搜索（如果存在搜索功能）
     */
    function openSearch() {
        const searchInput = document.querySelector('input[type="search"], #search-input');
        if (searchInput) {
            searchInput.focus();
        }
    }

    /**
     * 初始化事件监听
     */
    function initEventListeners() {
        // 切换按钮
        if (NavState.toggle) {
            NavState.toggle.addEventListener('click', toggleSidebar);
        }

        // 关闭按钮
        if (NavState.closeBtn) {
            NavState.closeBtn.addEventListener('click', closeSidebar);
        }

        // 遮罩点击
        if (NavState.overlay) {
            NavState.overlay.addEventListener('click', closeSidebar);
        }

        // 键盘导航
        document.addEventListener('keydown', handleKeyboardNavigation);

        // 触摸手势
        document.addEventListener('touchstart', handleTouchStart, { passive: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: true });

        // 窗口大小变化时关闭侧边栏
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024 && NavState.isOpen) {
                closeSidebar();
            }
        });

        // 点击侧边栏外部关闭（移动端）
        document.addEventListener('click', (e) => {
            if (NavState.isOpen &&
                NavState.sidebar &&
                !NavState.sidebar.contains(e.target) &&
                NavState.toggle &&
                !NavState.toggle.contains(e.target)) {
                closeSidebar();
            }
        });
    }

    /**
     * 初始化导航栏
     */
    function initNavigation() {
        initNavElements();
        initEventListeners();
        initTooltips();
        initActiveNavItem();
        initQuickActions();
        initDevModeNav();
        initMobileNavTheme();
        watchDevModeChanges();

        if (NavState.toggle) {
            NavState.toggle.setAttribute('aria-expanded', 'false');
            NavState.toggle.setAttribute('aria-controls', 'sidebar');
            NavState.toggle.setAttribute('aria-label', '打开导航菜单');
        }

        if (NavState.sidebar) {
            NavState.sidebar.setAttribute('role', 'navigation');
            NavState.sidebar.setAttribute('aria-label', '主导航');
        }

        console.log('[Navigation] 导航系统初始化完成');
    }

    /**
     * 初始化开发者模式导航项
     */
    const DEV_MODE_KEY = 'metro_dev_session';
    
    function isDevModeAllowed() {
        const sessionKey = sessionStorage.getItem(DEV_MODE_KEY);
        if (!sessionKey) return false;
        const expectedKey = btoa('lvshu_dev_' + new Date().toISOString().slice(0,10));
        return sessionKey === expectedKey;
    }
    
    function initDevModeNav() {
        const isDevMode = isDevModeAllowed();
        
        const devNavItems = document.querySelectorAll('[data-dev-mode="true"]');
        
        devNavItems.forEach(item => {
            if (isDevMode) {
                item.style.display = '';
                item.classList.remove('hidden');
            } else {
                item.style.display = 'none';
                item.classList.add('hidden');
            }
        });
        
        console.log('[Navigation] 开发者模式导航项初始化完成, devMode:', isDevMode, '项目数:', devNavItems.length);
    }

    function watchDevModeChanges() {
        window.addEventListener('storage', (e) => {
            if (e.key === DEV_MODE_KEY) {
                initDevModeNav();
            }
        });
        
        window.addEventListener('devModeChanged', () => {
            initDevModeNav();
        });
    }

    /**
     * 初始化移动端导航栏主题切换
     */
    function initMobileNavTheme() {
        const themeBtn = document.getElementById('mobile-nav-theme');
        if (!themeBtn) return;

        themeBtn.addEventListener('click', () => {
            toggleTheme();
        });

        updateThemeIcons();
    }

    /**
     * 更新主题图标状态
     */
    function updateThemeIcons() {
        const isDark = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
        const navMoonIcon = document.getElementById('nav-theme-moon');
        const navSunIcon = document.getElementById('nav-theme-sun');

        if (navMoonIcon && navSunIcon) {
            if (isDark) {
                navMoonIcon.classList.add('hidden');
                navSunIcon.classList.remove('hidden');
            } else {
                navMoonIcon.classList.remove('hidden');
                navSunIcon.classList.add('hidden');
            }
        }
    }

    // DOM 加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavigation);
    } else {
        initNavigation();
    }

    // 暴露全局 API
    window.MetroNav = {
        open: openSidebar,
        close: closeSidebar,
        toggle: toggleSidebar,
        isOpen: () => NavState.isOpen
    };

})();
