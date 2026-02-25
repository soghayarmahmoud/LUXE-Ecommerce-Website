// ==============================
// QUICK VIEW — Modal Component
// ==============================

import { dispatch } from '../store.js';
import { $, formatCurrency, renderStars, showToast, placeholderImage } from '../utils/helpers.js';

const modal = () => $('#quickViewModal');
const modalOverlay = () => $('#modalOverlay');
const modalBody = () => $('#modalBody');

let currentQty = 1;

/** Open quick view modal */
export function openQuickView(product) {
    currentQty = 1;
    const imgSrc = product.image || placeholderImage(product.name, 500, 500);

    modalBody().innerHTML = `
    <div class="modal__image-wrapper">
      <img class="modal__image" src="${imgSrc}" alt="${product.name}" />
    </div>
    <div class="modal__details">
      <span class="modal__category">${product.category}</span>
      <h2 class="modal__name">${product.name}</h2>
      <div class="modal__rating">
        <span class="modal__stars">${renderStars(product.rating)}</span>
        <span class="modal__rating-text">${product.rating} / 5</span>
      </div>
      <p class="modal__price">${formatCurrency(product.price)}</p>
      <p class="modal__description">${product.description}</p>
      <div class="modal__quantity">
        <span class="modal__qty-label">Quantity</span>
        <div class="modal__qty-controls">
          <button class="modal__qty-btn" id="modalQtyDec">−</button>
          <span class="modal__qty-value" id="modalQtyValue">1</span>
          <button class="modal__qty-btn" id="modalQtyInc">+</button>
        </div>
      </div>
      <button class="modal__add-btn" id="modalAddBtn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"></path>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <path d="M16 10a4 4 0 01-8 0"></path>
        </svg>
        Add to Cart
      </button>
      <div class="modal__features">
        <div class="modal__feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Free Shipping
        </div>
        <div class="modal__feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          30-Day Returns
        </div>
        <div class="modal__feature">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          2-Year Warranty
        </div>
      </div>
    </div>
  `;

    // Quantity controls
    $('#modalQtyDec').addEventListener('click', () => {
        if (currentQty > 1) {
            currentQty--;
            $('#modalQtyValue').textContent = currentQty;
        }
    });

    $('#modalQtyInc').addEventListener('click', () => {
        currentQty++;
        $('#modalQtyValue').textContent = currentQty;
    });

    // Add to cart
    $('#modalAddBtn').addEventListener('click', () => {
        dispatch({ type: 'ADD_TO_CART', payload: product, qty: currentQty });
        showToast(`${product.name} (x${currentQty}) added to cart!`);
        closeQuickView();
    });

    // Show
    modal().classList.add('active');
    modalOverlay().classList.add('active');
    document.body.classList.add('no-scroll');
}

/** Close quick view modal */
export function closeQuickView() {
    modal().classList.remove('active');
    modalOverlay().classList.remove('active');
    document.body.classList.remove('no-scroll');
}

/** Initialize modal close handlers */
export function initQuickView() {
    $('#modalClose').addEventListener('click', closeQuickView);
    modalOverlay().addEventListener('click', closeQuickView);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeQuickView();
    });
}
