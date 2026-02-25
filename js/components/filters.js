// ==============================
// FILTERS — Component
// ==============================

import { dispatch, getState, subscribe } from '../store.js';
import { $, $$, createElement, debounce } from '../utils/helpers.js';

const CATEGORIES = ['Electronics', 'Clothing', 'Home', 'Accessories'];

/** Render category checkboxes */
function renderCategories() {
    const container = $('#categoryFilters');
    const { products } = getState();

    container.innerHTML = '';

    CATEGORIES.forEach(cat => {
        const count = products.filter(p => p.category === cat).length;
        const isActive = getState().filters.categories.includes(cat);

        const item = createElement('div', {
            className: `sidebar__category ${isActive ? 'active' : ''}`,
            dataset: { category: cat },
        });

        item.innerHTML = `
      <div class="sidebar__checkbox"></div>
      <span>${cat}</span>
      <span class="sidebar__category-count">${count}</span>
    `;

        item.addEventListener('click', () => {
            dispatch({ type: 'TOGGLE_CATEGORY', payload: cat });
        });

        container.appendChild(item);
    });
}

/** Update category active states */
function updateCategoryStates() {
    const { filters } = getState();
    $$('.sidebar__category').forEach(el => {
        const cat = el.dataset.category;
        el.classList.toggle('active', filters.categories.includes(cat));
    });
}

/** Initialize all filter listeners */
export function initFilters() {
    // Search
    const searchInput = $('#searchInput');
    const debouncedSearch = debounce((value) => {
        dispatch({ type: 'SET_SEARCH', payload: value });
    }, 250);

    searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });

    // Price Range
    const priceRange = $('#priceRange');
    const priceLabel = $('#priceMaxLabel');

    priceRange.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        priceLabel.textContent = `$${value}`;
        dispatch({ type: 'SET_MAX_PRICE', payload: value });
    });

    // Rating
    $$('.sidebar__rating-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            $$('.sidebar__rating-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            dispatch({ type: 'SET_MIN_RATING', payload: parseFloat(btn.dataset.rating) });
        });
    });

    // Sort
    const sortSelect = $('#sortSelect');
    sortSelect.addEventListener('change', (e) => {
        dispatch({ type: 'SET_SORT', payload: e.target.value });
    });

    // Clear All
    const clearBtn = $('#clearFilters');
    clearBtn.addEventListener('click', () => {
        dispatch({ type: 'CLEAR_FILTERS' });
        searchInput.value = '';
        priceRange.value = 500;
        priceLabel.textContent = '$500';
        $$('.sidebar__rating-btn').forEach(b => b.classList.remove('active'));
        $$('.sidebar__rating-btn')[0].classList.add('active');
        sortSelect.value = 'featured';
    });

    // Subscribe to re-render categories
    subscribe(() => {
        updateCategoryStates();
    });

    // Initial render
    renderCategories();
}
