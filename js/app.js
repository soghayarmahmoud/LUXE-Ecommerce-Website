// ==============================
// APP.JS — Entry Point
// ==============================

import { fetchProducts } from './api.js';
import { initHeader } from './components/header.js';
import { initProductList, showSkeletons, renderProducts } from './components/productList.js';
import { initFilters } from './components/filters.js';
import { initCart } from './components/cart.js';
import { initQuickView } from './components/quickView.js';
import { initCheckout } from './components/checkout.js';
import { initAuth } from './components/auth.js';
import { initLocation } from './components/location.js';

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

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
