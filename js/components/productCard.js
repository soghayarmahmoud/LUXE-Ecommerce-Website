// ==============================
// PRODUCT CARD — Component
// ==============================

import { dispatch } from '../store.js';
import { createElement, formatCurrency, renderStars, showToast, placeholderImage } from '../utils/helpers.js';

/**
 * Create a product card element
 * @param {Object} product
 * @param {Function} onQuickView
 * @returns {HTMLElement}
 */
export function createProductCard(product, onQuickView) {
    const imgSrc = product.image || placeholderImage(product.name);

    const card = createElement('article', { className: 'product-card', dataset: { id: product.id } });

    card.innerHTML = `
    <div class="product-card__image-wrapper">
      <img class="product-card__image" src="${imgSrc}" alt="${product.name}" loading="lazy" />
      ${product.badge ? `<span class="product-card__badge">${product.badge}</span>` : ''}
      <button class="product-card__quick-view" data-action="quickview">Quick View</button>
    </div>
    <div class="product-card__info">
      <span class="product-card__category">${product.category}</span>
      <h3 class="product-card__name">${product.name}</h3>
      <div class="product-card__rating">
        <span class="product-card__stars">${renderStars(product.rating)}</span>
        <span class="product-card__rating-value">${product.rating}</span>
      </div>
      <div class="product-card__footer">
        <span class="product-card__price">${formatCurrency(product.price)}</span>
        <button class="product-card__add-btn" data-action="add" aria-label="Add to cart">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
    </div>
  `;

    // Quick view
    const qvBtn = card.querySelector('[data-action="quickview"]');
    qvBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        onQuickView(product);
    });

    // Card click also opens quick view
    card.addEventListener('click', () => onQuickView(product));

    // Add to cart
    const addBtn = card.querySelector('[data-action="add"]');
    addBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dispatch({ type: 'ADD_TO_CART', payload: product });
        showToast(`${product.name} added to cart!`);

        addBtn.classList.add('added');
        setTimeout(() => addBtn.classList.remove('added'), 800);
    });

    return card;
}

/**
 * Create skeleton loading cards
 * @param {number} count
 * @returns {HTMLElement[]}
 */
export function createSkeletonCards(count = 8) {
    const cards = [];
    for (let i = 0; i < count; i++) {
        const card = createElement('article', { className: 'product-card product-card--skeleton' });
        card.innerHTML = `
      <div class="product-card__image-wrapper"></div>
      <div class="product-card__info">
        <div class="skeleton-text skeleton-text--short"></div>
        <div class="skeleton-text skeleton-text--long"></div>
        <div class="skeleton-text skeleton-text--short" style="margin-top:8px"></div>
      </div>
    `;
        cards.push(card);
    }
    return cards;
}
