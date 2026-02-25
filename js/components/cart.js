// ==============================
// CART — Slide-out Drawer Component
// ==============================

import { subscribe, dispatch, getState, getCartTotals } from '../store.js';
import { $, formatCurrency, placeholderImage } from '../utils/helpers.js';

const drawer = () => $('#cartDrawer');
const overlay = () => $('#cartOverlay');
const itemsEl = () => $('#cartItems');
const emptyEl = () => $('#cartEmpty');
const footerEl = () => $('#cartFooter');
const badgeEl = () => $('#cartBadge');
const subtotalEl = () => $('#cartSubtotal');
const taxEl = () => $('#cartTax');
const totalEl = () => $('#cartTotal');

/** Open cart drawer */
export function openCart() {
    drawer().classList.add('active');
    overlay().classList.add('active');
    document.body.classList.add('no-scroll');
}

/** Close cart drawer */
export function closeCart() {
    drawer().classList.remove('active');
    overlay().classList.remove('active');
    document.body.classList.remove('no-scroll');
}

/** Render cart items */
function renderCartItems() {
    const { cart } = getState();
    const { subtotal, tax, total, count } = getCartTotals();

    // Badge
    if (count > 0) {
        badgeEl().textContent = count;
        badgeEl().classList.add('visible');
    } else {
        badgeEl().classList.remove('visible');
    }

    // Empty state
    if (cart.length === 0) {
        itemsEl().style.display = 'none';
        emptyEl().style.display = 'flex';
        footerEl().style.display = 'none';
        return;
    }

    emptyEl().style.display = 'none';
    itemsEl().style.display = 'block';
    footerEl().style.display = 'block';

    // Items
    itemsEl().innerHTML = cart.map(item => {
        const imgSrc = item.image || placeholderImage(item.name, 72, 72);
        return `
    <div class="cart-item" data-id="${item.id}">
      <img class="cart-item__image" src="${imgSrc}" alt="${item.name}" loading="lazy" />
      <div class="cart-item__details">
        <div class="cart-item__name">${item.name}</div>
        <div class="cart-item__price">${formatCurrency(item.price)}</div>
        <div class="cart-item__actions">
          <button class="cart-item__qty-btn" data-action="decrease" data-id="${item.id}" aria-label="Decrease">−</button>
          <span class="cart-item__qty">${item.quantity}</span>
          <button class="cart-item__qty-btn" data-action="increase" data-id="${item.id}" aria-label="Increase">+</button>
          <button class="cart-item__remove" data-action="remove" data-id="${item.id}" aria-label="Remove">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
    }).join('');

    // Totals
    subtotalEl().textContent = formatCurrency(subtotal);
    taxEl().textContent = formatCurrency(tax);
    totalEl().textContent = formatCurrency(total);
}

/** Handle item actions via event delegation */
function handleCartActions(e) {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const id = parseInt(btn.dataset.id);
    const action = btn.dataset.action;
    const { cart } = getState();
    const item = cart.find(i => i.id === id);

    if (action === 'increase') {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: item.quantity + 1 } });
    } else if (action === 'decrease') {
        if (item.quantity <= 1) {
            dispatch({ type: 'REMOVE_FROM_CART', payload: id });
        } else {
            dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: item.quantity - 1 } });
        }
    } else if (action === 'remove') {
        dispatch({ type: 'REMOVE_FROM_CART', payload: id });
    }
}

/** Initialize cart */
export function initCart() {
    // Open/close
    $('#cartToggle').addEventListener('click', openCart);
    $('#cartClose').addEventListener('click', closeCart);
    overlay().addEventListener('click', closeCart);

    // Item actions
    itemsEl().addEventListener('click', handleCartActions);

    // Checkout button
    $('#checkoutBtn').addEventListener('click', () => {
        closeCart();
        dispatch({ type: 'SET_PAGE', payload: 'checkout' });
    });

    // Subscribe to state
    subscribe(() => renderCartItems());

    // Initial render
    renderCartItems();
}
