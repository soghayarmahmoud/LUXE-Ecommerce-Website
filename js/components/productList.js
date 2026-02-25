// ==============================
// PRODUCT LIST — Component
// ==============================

import { subscribe, getFilteredProducts } from '../store.js';
import { $, createElement } from '../utils/helpers.js';
import { createProductCard, createSkeletonCards } from './productCard.js';
import { openQuickView } from './quickView.js';

const grid = () => $('#productsGrid');
const countEl = () => $('#productsCount');
const emptyEl = () => $('#productsEmpty');

/** Render the product grid */
export function renderProducts() {
    const products = getFilteredProducts();
    const g = grid();
    g.innerHTML = '';

    if (products.length === 0) {
        emptyEl().style.display = 'block';
        countEl().textContent = '';
        return;
    }

    emptyEl().style.display = 'none';
    countEl().textContent = `Showing ${products.length} product${products.length !== 1 ? 's' : ''}`;

    products.forEach(product => {
        const card = createProductCard(product, openQuickView);
        g.appendChild(card);
    });
}

/** Show skeleton loading state */
export function showSkeletons() {
    const g = grid();
    g.innerHTML = '';
    createSkeletonCards(8).forEach(s => g.appendChild(s));
}

/** Initialize: subscribe to state changes */
export function initProductList() {
    subscribe((state) => {
        renderProducts();
    });
}
