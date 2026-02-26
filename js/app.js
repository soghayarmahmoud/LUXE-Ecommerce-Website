// ==============================
// APP.JS — Entry Point
// ==============================

import { dispatch, getState, subscribe } from './store.js';
import { fetchProducts } from './api.js';
import { initHeader } from './components/header.js';
import { initProductList, showSkeletons, renderProducts } from './components/productList.js';
import { initFilters } from './components/filters.js';
import { initCart } from './components/cart.js';
import { initQuickView } from './components/quickView.js';
import { initCheckout } from './components/checkout.js';
import { initAuth } from './components/auth.js';
import { initLocation } from './components/location.js';
import { initErrorBoundary } from './components/error.js';
import { initLoading, showLoading, hideLoading } from './components/loading.js';
import { initBlog, setBlogNavigation } from './components/blog.js';
import { $, debounce, showToast } from './utils/helpers.js';

// All page section IDs
const PAGE_MAP = {
    shop: { sections: ['heroBanner', 'shopSection'], showFooter: true },
    about: { sections: ['aboutSection'], showFooter: true },
    contact: { sections: ['contactSection'], showFooter: true },
    help: { sections: ['helpSection'], showFooter: true },
    careers: { sections: ['careersSection'], showFooter: true },
    blog: { sections: ['blogSection'], showFooter: true },
    blogArticle: { sections: ['blogArticleSection'], showFooter: true },
    privacy: { sections: ['privacySection'], showFooter: true },
    terms: { sections: ['termsSection'], showFooter: true },
    checkout: { sections: ['checkoutSection'], showFooter: false },
};

const ALL_SECTION_IDS = [
    'heroBanner', 'shopSection', 'aboutSection', 'contactSection',
    'helpSection', 'careersSection', 'blogSection', 'blogArticleSection',
    'privacySection', 'termsSection', 'checkoutSection'
];

/**
 * Show the correct page sections
 */
function showPage(page) {
    const config = PAGE_MAP[page] || PAGE_MAP.shop;

    // Hide all sections
    ALL_SECTION_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    // Show target sections
    config.sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            // Hero uses flex, everything else block
            el.style.display = id === 'heroBanner' ? 'flex' : 'block';
        }
    });

    // Footer
    const footer = document.getElementById('footer');
    if (footer) footer.style.display = config.showFooter ? 'block' : 'none';

    // Update active nav link
    document.querySelectorAll('.header__nav-link').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.header__nav-link[data-nav="${page}"]`);
    if (activeLink) activeLink.classList.add('active');
}

/**
 * Bootstrap the application
 */
async function init() {
    // Initialize loading & error immediately (before anything can fail)
    initLoading();
    initErrorBoundary();
    showLoading();

    showSkeletons();

    // Initialize all components
    initHeader();
    initCart();
    initQuickView();
    initCheckout();
    initAuth();
    initLocation();

    // Theme
    initTheme();

    // Navigation
    initNavigation();

    // Header search
    initHeaderSearch();

    // Contact form
    initContactForm();

    // Blog — pass showPage so blog.js can navigate without circular imports
    setBlogNavigation(showPage);
    await initBlog();

    // Fetch products
    await fetchProducts();

    // Filters and product list
    initFilters();
    initProductList();

    // Show initial page
    showPage('shop');
    renderProducts();

    // Hide loading overlay
    hideLoading();

    console.log('🛍️ LUXE E-Commerce initialized');
}

/**
 * Dark / Light theme toggle
 */
function initTheme() {
    const saved = localStorage.getItem('luxe_theme');
    if (saved === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('luxe_theme', next);
        });
    }
}

/**
 * Navigation via [data-nav] attributes
 */
function initNavigation() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-nav]');
        if (!link) return;
        e.preventDefault();

        const page = link.dataset.nav;

        // Navigate
        dispatch({ type: 'SET_PAGE', payload: page });
        showPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Close mobile menu
        const menuToggle = document.getElementById('menuToggle');
        const nav = document.getElementById('headerNav');
        if (menuToggle) menuToggle.classList.remove('active');
        if (nav) nav.classList.remove('mobile-open');
    });

    // Logo clicks go to shop
    const logoLink = document.getElementById('logoLink');
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            dispatch({ type: 'SET_PAGE', payload: 'shop' });
            showPage('shop');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const footerLogo = document.getElementById('footerLogoLink');
    if (footerLogo) {
        footerLogo.addEventListener('click', (e) => {
            e.preventDefault();
            dispatch({ type: 'SET_PAGE', payload: 'shop' });
            showPage('shop');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Hero CTA
    const heroCTA = document.getElementById('heroCTA');
    if (heroCTA) {
        heroCTA.addEventListener('click', (e) => {
            e.preventDefault();
            const shopSection = document.getElementById('shopSection');
            if (shopSection) shopSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Subscribe for checkout navigation
    subscribe((state) => {
        if (state.currentPage === 'checkout') {
            showPage('checkout');
        }
    });
}

/**
 * Header search bar syncs with sidebar search
 */
function initHeaderSearch() {
    const headerInput = document.getElementById('headerSearchInput');
    const sidebarInput = document.getElementById('searchInput');

    if (headerInput) {
        const debouncedSearch = debounce((val) => {
            dispatch({ type: 'SET_SEARCH', payload: val });
            if (sidebarInput) sidebarInput.value = val;
            // Navigate to shop if searching from another page
            const { currentPage } = getState();
            if (val && currentPage !== 'shop') {
                dispatch({ type: 'SET_PAGE', payload: 'shop' });
                showPage('shop');
            }
        }, 300);

        headerInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value.trim());
        });
    }
}

/**
 * Contact form
 */
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('Message sent! We\'ll get back to you soon.');
            form.reset();
        });
    }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
