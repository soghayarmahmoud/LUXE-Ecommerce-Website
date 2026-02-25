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
import { $, debounce, showToast } from './utils/helpers.js';

/**
 * Bootstrap the application
 */
async function init() {
    // Show loading state
    showSkeletons();

    // Initialize all components
    initHeader();
    initCart();
    initQuickView();
    initCheckout();
    initAuth();
    initLocation();

    // Initialize theme
    initTheme();

    // Initialize page navigation
    initPageNavigation();

    // Initialize header search
    initHeaderSearch();

    // Initialize contact form
    initContactForm();

    // Fetch product data
    await fetchProducts();

    // Initialize filters (needs products loaded first)
    initFilters();

    // Initialize product list subscriber
    initProductList();

    // Initial render
    renderProducts();

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

    const toggleBtn = $('#themeToggle');
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
 * SPA-like page navigation
 */
function initPageNavigation() {
    // Handle all [data-page] clicks
    document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-page]');
        if (!link) return;
        e.preventDefault();
        const page = link.dataset.page;
        dispatch({ type: 'SET_PAGE', payload: page });
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Update active nav
        document.querySelectorAll('.header__nav-link').forEach(l => l.classList.remove('active'));
        const activeLink = document.querySelector(`.header__nav-link[data-page="${page}"]`);
        if (activeLink) activeLink.classList.add('active');
    });

    // Page visibility subscriber
    subscribe((state) => {
        const shopEl = $('#shopSection');
        const heroEl = $('#heroBanner');
        const aboutEl = $('#aboutSection');
        const contactEl = $('#contactSection');
        const checkoutEl = $('#checkoutSection');
        const footerEl = $('#footer');

        const page = state.currentPage;

        // Hide all
        shopEl.style.display = 'none';
        heroEl.style.display = 'none';
        aboutEl.style.display = 'none';
        contactEl.style.display = 'none';
        checkoutEl.style.display = 'none';

        // Show relevant
        if (page === 'shop') {
            shopEl.style.display = 'block';
            heroEl.style.display = 'flex';
            footerEl.style.display = 'block';
        } else if (page === 'about') {
            aboutEl.style.display = 'block';
            footerEl.style.display = 'block';
        } else if (page === 'contact') {
            contactEl.style.display = 'block';
            footerEl.style.display = 'block';
        } else if (page === 'checkout') {
            checkoutEl.style.display = 'block';
            footerEl.style.display = 'none';
        }
    });
}

/**
 * Header search bar syncs with sidebar search
 */
function initHeaderSearch() {
    const headerInput = $('#headerSearchInput');
    const sidebarInput = $('#searchInput');

    if (headerInput) {
        const debouncedSearch = debounce((val) => {
            dispatch({ type: 'SET_SEARCH', payload: val });
            // Sync sidebar if visible
            if (sidebarInput) sidebarInput.value = val;
            // Make sure we're on shop page
            if (val && getState().currentPage !== 'shop') {
                dispatch({ type: 'SET_PAGE', payload: 'shop' });
            }
        }, 300);

        headerInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value.trim());
        });
    }
}

/**
 * Contact form handler
 */
function initContactForm() {
    const form = $('#contactForm');
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
