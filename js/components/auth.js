// ==============================
// AUTH — Login/Register Modal
// ==============================

import { dispatch, subscribe, getState } from '../store.js';
import { $, showToast } from '../utils/helpers.js';
import * as api from '../api-client.js';

/** Open auth modal */
export function openAuthModal() {
    $('#authModal').classList.add('active');
    $('#authOverlay').classList.add('active');
    document.body.classList.add('no-scroll');
}

/** Close auth modal */
export function closeAuthModal() {
    $('#authModal').classList.remove('active');
    $('#authOverlay').classList.remove('active');
    document.body.classList.remove('no-scroll');
}

/** Switch tabs */
function switchTab(tab) {
    document.querySelectorAll('.auth-modal__tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.querySelector(`[data-auth-tab="${tab}"]`).classList.add('active');
    document.getElementById(tab === 'login' ? 'loginForm' : 'registerForm').classList.add('active');
    // Clear errors
    document.querySelectorAll('.auth-form__error').forEach(e => {
        e.classList.remove('visible');
        e.textContent = '';
    });
}

/** Show form error */
function showFormError(formId, message) {
    const errorEl = document.querySelector(`#${formId} .auth-form__error`);
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('visible');
    }
}

/** Set loading state */
function setLoading(btn, loading) {
    if (loading) {
        btn.classList.add('loading');
        btn.disabled = true;
    } else {
        btn.classList.remove('loading');
        btn.disabled = false;
    }
}

/** Update header UI based on user state */
export function updateHeaderUser() {
    const { user } = getState();
    const actionsEl = document.querySelector('.header__actions');

    // Remove old user elements
    const oldUserArea = actionsEl.querySelector('.header__user-area');
    if (oldUserArea) oldUserArea.remove();
    const oldLoginBtn = actionsEl.querySelector('.header__login-btn');
    if (oldLoginBtn) oldLoginBtn.remove();

    const cartBtn = $('#cartToggle');

    if (user) {
        // Show avatar + dropdown
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        const userArea = document.createElement('div');
        userArea.className = 'header__user-area';
        userArea.style.position = 'relative';
        userArea.innerHTML = `
      <div class="header__user-avatar" id="userAvatarBtn">${initials}</div>
      <div class="header__user-menu" id="userMenu">
        <div class="header__user-menu-item" style="pointer-events:none; opacity:0.7;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          <span>${user.name}</span>
        </div>
        <div class="header__user-menu-item" style="pointer-events:none; font-size:12px; color:var(--color-gray-400);">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
          <span>${user.email}</span>
        </div>
        <div style="height:1px; background:var(--color-gray-200); margin:4px 0;"></div>
        <button class="header__user-menu-item header__user-menu-item--danger" id="logoutBtn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Logout
        </button>
      </div>
    `;

        cartBtn.parentNode.insertBefore(userArea, cartBtn);

        // Toggle dropdown
        document.getElementById('userAvatarBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('userMenu').classList.toggle('active');
        });

        // Close on outside click
        document.addEventListener('click', () => {
            const menu = document.getElementById('userMenu');
            if (menu) menu.classList.remove('active');
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            api.logout();
            dispatch({ type: 'SET_USER', payload: null });
            showToast('Logged out successfully');
        });
    } else {
        // Show login button
        const loginBtn = document.createElement('button');
        loginBtn.className = 'header__user-btn header__login-btn';
        loginBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      Sign In
    `;
        loginBtn.addEventListener('click', openAuthModal);
        cartBtn.parentNode.insertBefore(loginBtn, cartBtn);
    }
}

/** Initialize auth */
export function initAuth() {
    // Close handlers
    $('#authModalClose').addEventListener('click', closeAuthModal);
    $('#authOverlay').addEventListener('click', closeAuthModal);

    // Tab switching
    document.querySelectorAll('.auth-modal__tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.authTab));
    });

    // Login form submit
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('.auth-form__submit');
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            showFormError('loginForm', 'Please fill in all fields');
            return;
        }

        setLoading(btn, true);
        try {
            const data = await api.login(email, password);
            dispatch({ type: 'SET_USER', payload: data.user });
            closeAuthModal();
            showToast(`Welcome back, ${data.user.name}!`);
        } catch (err) {
            showFormError('loginForm', err.message);
        } finally {
            setLoading(btn, false);
        }
    });

    // Register form submit
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('.auth-form__submit');
        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirm').value;

        if (!name || !email || !password) {
            showFormError('registerForm', 'Please fill in all required fields');
            return;
        }
        if (password.length < 6) {
            showFormError('registerForm', 'Password must be at least 6 characters');
            return;
        }
        if (password !== confirm) {
            showFormError('registerForm', 'Passwords do not match');
            return;
        }

        setLoading(btn, true);
        try {
            const data = await api.register(name, email, password, phone);
            dispatch({ type: 'SET_USER', payload: data.user });
            closeAuthModal();
            showToast(`Welcome to LUXE, ${data.user.name}!`);
        } catch (err) {
            showFormError('registerForm', err.message);
        } finally {
            setLoading(btn, false);
        }
    });

    // Subscribe to user state changes
    subscribe(() => updateHeaderUser());

    // Check for existing token on startup
    restoreSession();
}

/** Restore user session from stored JWT */
async function restoreSession() {
    if (!api.isLoggedIn()) return;
    try {
        const data = await api.getMe();
        dispatch({ type: 'SET_USER', payload: data.user });
    } catch {
        api.logout(); // Token expired
    }
}
