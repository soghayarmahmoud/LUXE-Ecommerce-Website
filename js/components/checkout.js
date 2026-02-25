// ==============================
// CHECKOUT — Multi-Step Form
// ==============================

import { dispatch, getState, getCartTotals, subscribe } from '../store.js';
import { $, formatCurrency, showToast } from '../utils/helpers.js';
import { validateField } from '../utils/validators.js';
import { openAuthModal } from './auth.js';
import * as api from '../api-client.js';

let currentStep = 0;
const formData = { shipping: {}, payment: {} };

/** Render the checkout page */
export function renderCheckout() {
  const container = $('#checkoutContainer');
  const { cart, user } = getState();

  // Must be logged in
  if (!user) {
    container.innerHTML = `
      <button class="checkout__back" id="backToShop">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        Back to Shop
      </button>
      <div class="checkout__success">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        <h2>Sign in Required</h2>
        <p>Please sign in or create an account to proceed with checkout.</p>
        <button class="checkout__btn checkout__btn--primary" id="checkoutLoginBtn">Sign In / Register</button>
      </div>
    `;
    $('#backToShop').addEventListener('click', goBackToShop);
    $('#checkoutLoginBtn').addEventListener('click', () => {
      openAuthModal();
    });
    return;
  }

  if (cart.length === 0) {
    container.innerHTML = `
      <button class="checkout__back" id="backToShop">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        Back to Shop
      </button>
      <div class="checkout__success">
        <h2>Your cart is empty</h2>
        <p>Add some products before checking out.</p>
      </div>
    `;
    $('#backToShop').addEventListener('click', goBackToShop);
    return;
  }

  currentStep = 0;

  // Pre-fill shipping with user data and location
  const { location } = getState();
  if (!formData.shipping.fullName && user.name) formData.shipping.fullName = user.name;
  if (!formData.shipping.email && user.email) formData.shipping.email = user.email;
  if (!formData.shipping.phone && user.phone) formData.shipping.phone = user.phone;
  if (location && location.address && !formData.shipping.address) {
    const parts = location.address.split(',').map(s => s.trim());
    formData.shipping.address = parts[0] || '';
    formData.shipping.city = parts[1] || '';
    formData.shipping.state = parts[2] || '';
  }

  renderStep();
}

function renderStep() {
  const container = $('#checkoutContainer');
  const steps = ['Shipping', 'Payment', 'Review'];

  const stepsHTML = steps.map((s, i) => {
    let cls = '';
    if (i < currentStep) cls = 'completed';
    else if (i === currentStep) cls = 'active';
    const line = i < steps.length - 1
      ? `<div class="checkout__step-line ${i < currentStep ? 'completed' : ''}"></div>`
      : '';
    return `
      <div class="checkout__step ${cls}">
        <div class="checkout__step-number">${i < currentStep ? '✓' : i + 1}</div>
        <span class="checkout__step-label">${s}</span>
      </div>
      ${line}
    `;
  }).join('');

  let panelHTML = '';
  if (currentStep === 0) panelHTML = shippingPanel();
  else if (currentStep === 1) panelHTML = paymentPanel();
  else if (currentStep === 2) panelHTML = reviewPanel();

  container.innerHTML = `
    <button class="checkout__back" id="backToShop">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
      Back to Shop
    </button>
    <h1 class="checkout__heading">Checkout</h1>
    <div class="checkout__steps">${stepsHTML}</div>
    <div class="checkout__panel">${panelHTML}</div>
  `;

  // Bind events
  $('#backToShop').addEventListener('click', goBackToShop);
  bindStepEvents();
}

function shippingPanel() {
  const s = formData.shipping;
  const { location } = getState();
  const locationNote = location ? `<div style="margin-bottom:var(--space-4);padding:var(--space-3);background:rgba(108,92,231,0.08);border-radius:var(--radius-md);font-size:var(--font-size-sm);color:var(--color-primary);display:flex;align-items:center;gap:var(--space-2);"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg> Auto-filled from your GPS location</div>` : '';

  return `
    <h3 class="checkout__panel-title">Shipping Information</h3>
    ${locationNote}
    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="fullName">Full Name</label>
        <input class="form-input" id="fullName" type="text" placeholder="John Doe" value="${s.fullName || ''}" data-validator="isFullName" />
        <span class="form-error">Please enter your full name</span>
      </div>
      <div class="form-group">
        <label class="form-label" for="email">Email Address</label>
        <input class="form-input" id="email" type="email" placeholder="john@example.com" value="${s.email || ''}" data-validator="isEmail" />
        <span class="form-error">Please enter a valid email address</span>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="phone">Phone Number</label>
        <input class="form-input" id="phone" type="tel" placeholder="(555) 123-4567" value="${s.phone || ''}" data-validator="isPhone" />
        <span class="form-error">Please enter a valid phone number</span>
      </div>
      <div class="form-group">
        <label class="form-label" for="zip">ZIP Code</label>
        <input class="form-input" id="zip" type="text" placeholder="10001" value="${s.zip || ''}" data-validator="isZip" />
        <span class="form-error">Please enter a valid ZIP code</span>
      </div>
    </div>
    <div class="form-row form-row--single">
      <div class="form-group">
        <label class="form-label" for="address">Street Address</label>
        <input class="form-input" id="address" type="text" placeholder="123 Main Street, Apt 4" value="${s.address || ''}" data-validator="isAddress" />
        <span class="form-error">Please enter your address</span>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="city">City</label>
        <input class="form-input" id="city" type="text" placeholder="New York" value="${s.city || ''}" data-validator="isCity" />
        <span class="form-error">Please enter your city</span>
      </div>
      <div class="form-group">
        <label class="form-label" for="state">State</label>
        <input class="form-input" id="state" type="text" placeholder="NY" value="${s.state || ''}" data-validator="isRequired" />
        <span class="form-error">Please enter your state</span>
      </div>
    </div>
    <div class="checkout__buttons">
      <div></div>
      <button class="checkout__btn checkout__btn--primary" id="nextStep">Continue to Payment →</button>
    </div>
  `;
}

function paymentPanel() {
  const p = formData.payment;
  return `
    <h3 class="checkout__panel-title">Payment Details</h3>
    <div class="form-row form-row--single">
      <div class="form-group">
        <label class="form-label" for="cardName">Name on Card</label>
        <input class="form-input" id="cardName" type="text" placeholder="JOHN DOE" value="${p.cardName || ''}" data-validator="isFullName" />
        <span class="form-error">Please enter the name on your card</span>
      </div>
    </div>
    <div class="form-row form-row--single">
      <div class="form-group">
        <label class="form-label" for="cardNumber">Card Number</label>
        <input class="form-input" id="cardNumber" type="text" placeholder="4242 4242 4242 4242" maxlength="19" value="${p.cardNumber || ''}" data-validator="isCreditCard" />
        <span class="form-error">Please enter a valid card number</span>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label" for="expiry">Expiry Date</label>
        <input class="form-input" id="expiry" type="text" placeholder="MM/YY" maxlength="5" value="${p.expiry || ''}" data-validator="isExpiry" />
        <span class="form-error">Please enter a valid expiry (MM/YY)</span>
      </div>
      <div class="form-group">
        <label class="form-label" for="cvv">CVV</label>
        <input class="form-input" id="cvv" type="text" placeholder="123" maxlength="4" value="${p.cvv || ''}" data-validator="isCVV" />
        <span class="form-error">Please enter a valid CVV</span>
      </div>
    </div>
    <div class="checkout__buttons">
      <button class="checkout__btn checkout__btn--secondary" id="prevStep">← Back</button>
      <button class="checkout__btn checkout__btn--primary" id="nextStep">Review Order →</button>
    </div>
  `;
}

function reviewPanel() {
  const { cart } = getState();
  const { subtotal, tax, total } = getCartTotals();

  const itemsHTML = cart.map(item => `
    <div class="order-summary__item">
      <span>
        <span class="order-summary__item-name">${item.name}</span>
        <span class="order-summary__item-qty">× ${item.quantity}</span>
      </span>
      <span class="order-summary__item-price">${formatCurrency(item.price * item.quantity)}</span>
    </div>
  `).join('');

  return `
    <h3 class="checkout__panel-title">Order Review</h3>
    <div class="order-summary">
      ${itemsHTML}
      <div class="cart-drawer__row" style="padding-top:12px"><span>Subtotal</span><span>${formatCurrency(subtotal)}</span></div>
      <div class="cart-drawer__row"><span>Tax (8%)</span><span>${formatCurrency(tax)}</span></div>
      <div class="cart-drawer__row cart-drawer__row--total"><span>Total</span><span>${formatCurrency(total)}</span></div>
    </div>
    <div class="checkout__buttons">
      <button class="checkout__btn checkout__btn--secondary" id="prevStep">← Back</button>
      <button class="checkout__btn checkout__btn--primary" id="placeOrder">Place Order ✓</button>
    </div>
  `;
}

function bindStepEvents() {
  // Real-time validation
  const inputs = document.querySelectorAll('.form-input[data-validator]');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      const vName = input.dataset.validator;
      const errMsg = input.parentElement.querySelector('.form-error')?.textContent || 'Invalid';
      validateField(input, vName, errMsg);
    });
  });

  // Card number formatting
  const cardInput = document.getElementById('cardNumber');
  if (cardInput) {
    cardInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 16);
      val = val.replace(/(.{4})/g, '$1 ').trim();
      e.target.value = val;
    });
  }

  // Expiry formatting
  const expiryInput = document.getElementById('expiry');
  if (expiryInput) {
    expiryInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 4);
      if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2);
      e.target.value = val;
    });
  }

  // Next
  const nextBtn = document.getElementById('nextStep');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (validateCurrentStep()) {
        saveStepData();
        currentStep++;
        renderStep();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // Previous
  const prevBtn = document.getElementById('prevStep');
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      saveStepData();
      currentStep--;
      renderStep();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Place Order — now sends to backend API
  const placeBtn = document.getElementById('placeOrder');
  if (placeBtn) {
    placeBtn.addEventListener('click', async () => {
      placeBtn.disabled = true;
      placeBtn.textContent = 'Placing order...';

      try {
        const { cart } = getState();
        const { subtotal, tax, total } = getCartTotals();
        const shippingAddress = { ...formData.shipping };

        const result = await api.placeOrder(cart, shippingAddress, subtotal, tax, total);
        showSuccess(result.order);
      } catch (err) {
        showToast('Failed to place order: ' + err.message, 'error');
        placeBtn.disabled = false;
        placeBtn.textContent = 'Place Order ✓';
      }
    });
  }
}

function validateCurrentStep() {
  const inputs = document.querySelectorAll('.form-input[data-validator]');
  let allValid = true;
  inputs.forEach(input => {
    const vName = input.dataset.validator;
    const errMsg = input.parentElement.querySelector('.form-error')?.textContent || 'Invalid';
    if (!validateField(input, vName, errMsg)) allValid = false;
  });
  return allValid;
}

function saveStepData() {
  if (currentStep === 0) {
    formData.shipping = {
      fullName: document.getElementById('fullName')?.value || '',
      email: document.getElementById('email')?.value || '',
      phone: document.getElementById('phone')?.value || '',
      address: document.getElementById('address')?.value || '',
      city: document.getElementById('city')?.value || '',
      state: document.getElementById('state')?.value || '',
      zip: document.getElementById('zip')?.value || '',
    };
  } else if (currentStep === 1) {
    formData.payment = {
      cardName: document.getElementById('cardName')?.value || '',
      cardNumber: document.getElementById('cardNumber')?.value || '',
      expiry: document.getElementById('expiry')?.value || '',
      cvv: document.getElementById('cvv')?.value || '',
    };
  }
}

function showSuccess(order) {
  const container = $('#checkoutContainer');
  container.innerHTML = `
    <div class="checkout__success">
      <div class="checkout__success-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <h2>Order Confirmed!</h2>
      <p>Thank you for your purchase. Your order <strong>#${order?.id || ''}</strong> has been placed and saved successfully.</p>
      <p style="font-size:var(--font-size-sm);color:var(--color-gray-500);margin-top:var(--space-2);">
        Total: ${formatCurrency(order?.total || 0)} · Status: ${order?.status || 'confirmed'}
      </p>
      <button class="checkout__btn checkout__btn--primary" id="continueShopping">Continue Shopping</button>
    </div>
  `;

  dispatch({ type: 'CLEAR_CART' });
  formData.shipping = {};
  formData.payment = {};

  $('#continueShopping').addEventListener('click', goBackToShop);
}

function goBackToShop() {
  dispatch({ type: 'SET_PAGE', payload: 'shop' });
}

/** Initialize checkout */
export function initCheckout() {
  subscribe((state) => {
    const shopEl = $('#shopSection');
    const heroEl = $('#heroBanner');
    const checkoutEl = $('#checkoutSection');
    const footerEl = $('#footer');

    if (state.currentPage === 'checkout') {
      shopEl.style.display = 'none';
      heroEl.style.display = 'none';
      checkoutEl.style.display = 'block';
      footerEl.style.display = 'none';
      renderCheckout();
    } else {
      shopEl.style.display = 'block';
      heroEl.style.display = 'flex';
      checkoutEl.style.display = 'none';
      footerEl.style.display = 'block';
    }
  });
}
