// ==============================
// PROFILE — User Profile Page
// ==============================

import { dispatch, getState, subscribe } from '../store.js';
import { $, showToast } from '../utils/helpers.js';
import * as api from '../api-client.js';

let showPageFn = null;

export function setProfileNavigation(fn) {
    showPageFn = fn;
}

/** Render profile page content */
export function renderProfile() {
    const { user } = getState();
    const section = document.getElementById('profileSection');
    if (!section || !user) return;

    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently';

    section.innerHTML = `
        <div class="profile">
            <!-- Profile Header -->
            <div class="profile__header">
                <div class="profile__avatar">${initials}</div>
                <h1 class="profile__name">${user.name}</h1>
                <p class="profile__email">${user.email}</p>
                <span class="profile__member-since">Member since ${memberSince}</span>
            </div>

            <!-- Profile Content -->
            <div class="profile__content">
                <!-- Personal Info Card -->
                <div class="profile__card">
                    <div class="profile__card-header">
                        <h2 class="profile__card-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                            Personal Information
                        </h2>
                        <button class="profile__edit-btn" id="profileEditToggle">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            Edit
                        </button>
                    </div>

                    <!-- View Mode -->
                    <div class="profile__info" id="profileView">
                        <div class="profile__info-row">
                            <span class="profile__info-label">Full Name</span>
                            <span class="profile__info-value">${user.name}</span>
                        </div>
                        <div class="profile__info-row">
                            <span class="profile__info-label">Email Address</span>
                            <span class="profile__info-value">${user.email}</span>
                        </div>
                        <div class="profile__info-row">
                            <span class="profile__info-label">Phone Number</span>
                            <span class="profile__info-value">${user.phone || 'Not set'}</span>
                        </div>
                        <div class="profile__info-row">
                            <span class="profile__info-label">Address</span>
                            <span class="profile__info-value">${user.address || 'Not set'}</span>
                        </div>
                    </div>

                    <!-- Edit Mode -->
                    <form class="profile__edit-form" id="profileEditForm" style="display:none;">
                        <div class="form-group">
                            <label class="form-label">Full Name</label>
                            <input class="form-input" type="text" id="profileName" value="${user.name}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email Address</label>
                            <input class="form-input" type="email" value="${user.email}" disabled style="opacity:0.6; cursor:not-allowed;">
                            <small style="color:var(--text-muted); font-size:12px; margin-top:4px; display:block;">Email cannot be changed</small>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Phone Number</label>
                            <input class="form-input" type="tel" id="profilePhone" value="${user.phone || ''}" placeholder="Enter phone number">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Address</label>
                            <input class="form-input" type="text" id="profileAddress" value="${user.address || ''}" placeholder="Enter your address">
                        </div>
                        <div class="profile__edit-actions">
                            <button type="button" class="profile__cancel-btn" id="profileCancelBtn">Cancel</button>
                            <button type="submit" class="profile__save-btn" id="profileSaveBtn">
                                <span class="btn-text">Save Changes</span>
                                <div class="spinner"></div>
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Orders Card -->
                <div class="profile__card">
                    <div class="profile__card-header">
                        <h2 class="profile__card-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                            Order History
                        </h2>
                    </div>
                    <div id="profileOrders" class="profile__orders">
                        <div class="profile__orders-loading">Loading orders...</div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="profile__actions">
                    <button class="profile__action-btn" id="profileBackToShop">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                        Back to Shop
                    </button>
                    <button class="profile__action-btn profile__action-btn--danger" id="profileLogout">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Logout
                    </button>
                </div>
            </div>
        </div>
    `;

    // Bind events
    bindProfileEvents();
    loadOrders();
}

function bindProfileEvents() {
    const editToggle = document.getElementById('profileEditToggle');
    const editForm = document.getElementById('profileEditForm');
    const profileView = document.getElementById('profileView');
    const cancelBtn = document.getElementById('profileCancelBtn');

    if (editToggle) {
        editToggle.addEventListener('click', () => {
            profileView.style.display = 'none';
            editForm.style.display = 'block';
            editToggle.style.display = 'none';
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            profileView.style.display = 'block';
            editForm.style.display = 'none';
            editToggle.style.display = 'flex';
        });
    }

    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const saveBtn = document.getElementById('profileSaveBtn');
            saveBtn.classList.add('loading');
            saveBtn.disabled = true;

            try {
                const data = await api.updateProfile({
                    name: document.getElementById('profileName').value.trim(),
                    phone: document.getElementById('profilePhone').value.trim(),
                    address: document.getElementById('profileAddress').value.trim(),
                });
                dispatch({ type: 'SET_USER', payload: data.user });
                showToast('Profile updated successfully!');
                renderProfile(); // Re-render
            } catch (err) {
                showToast(err.message, 'error');
            } finally {
                saveBtn.classList.remove('loading');
                saveBtn.disabled = false;
            }
        });
    }

    document.getElementById('profileBackToShop')?.addEventListener('click', () => {
        dispatch({ type: 'SET_PAGE', payload: 'shop' });
        if (showPageFn) showPageFn('shop');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.getElementById('profileLogout')?.addEventListener('click', () => {
        api.logout();
        dispatch({ type: 'SET_USER', payload: null });
        dispatch({ type: 'SET_PAGE', payload: 'shop' });
        if (showPageFn) showPageFn('shop');
        showToast('Logged out successfully');
    });
}

async function loadOrders() {
    const container = document.getElementById('profileOrders');
    if (!container) return;

    try {
        const data = await api.getOrders();
        if (!data.orders || data.orders.length === 0) {
            container.innerHTML = `
                <div class="profile__orders-empty">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    <p>No orders yet</p>
                    <span>Your order history will appear here</span>
                </div>
            `;
            return;
        }

        container.innerHTML = data.orders.map(order => `
            <div class="profile__order-card">
                <div class="profile__order-header">
                    <span class="profile__order-id">Order #${order.id}</span>
                    <span class="profile__order-status profile__order-status--${order.status}">${order.status}</span>
                </div>
                <div class="profile__order-details">
                    <span>${order.items.length} item${order.items.length > 1 ? 's' : ''}</span>
                    <span class="profile__order-total">$${order.total.toFixed(2)}</span>
                </div>
                <span class="profile__order-date">${new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
        `).join('');
    } catch {
        container.innerHTML = `<div class="profile__orders-empty"><p>Could not load orders</p></div>`;
    }
}

export function initProfile() {
    // Re-render when user state changes
    subscribe(() => {
        const { currentPage } = getState();
        if (currentPage === 'profile') renderProfile();
    });
}
