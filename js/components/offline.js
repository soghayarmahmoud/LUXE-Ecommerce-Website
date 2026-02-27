// ==============================
// OFFLINE — No Internet Detection
// ==============================

import { showToast } from '../utils/helpers.js';

export function initOffline() {
    // Create offline overlay
    const overlay = document.createElement('div');
    overlay.id = 'offlinePage';
    overlay.className = 'offline-page';
    overlay.innerHTML = `
        <div class="offline-page__container">
            <div class="offline-page__illustration">
                <div class="offline-page__circle"></div>
                <svg class="offline-page__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                    <path d="M16.72 11.06A10.94 10.94 0 0119 12.55"></path>
                    <path d="M5 12.55a10.94 10.94 0 015.17-2.39"></path>
                    <path d="M10.71 5.05A16 16 0 0122.56 9"></path>
                    <path d="M1.42 9a15.91 15.91 0 014.7-2.88"></path>
                    <path d="M8.53 16.11a6 6 0 016.95 0"></path>
                    <line x1="12" y1="20" x2="12.01" y2="20"></line>
                </svg>
                <div class="offline-page__pulse"></div>
                <div class="offline-page__pulse offline-page__pulse--delayed"></div>
            </div>
            <h1 class="offline-page__title">No Internet Connection</h1>
            <p class="offline-page__description">It looks like you've lost your internet connection. Please check your network settings and try again.</p>
            <button class="offline-page__retry" id="offlineRetryBtn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"></path></svg>
                Try Again
            </button>
        </div>
    `;
    document.body.appendChild(overlay);

    // Retry button
    document.getElementById('offlineRetryBtn')?.addEventListener('click', () => {
        if (navigator.onLine) {
            hideOffline();
            showToast('Connection restored!');
        } else {
            // Shake the button
            const btn = document.getElementById('offlineRetryBtn');
            btn.style.animation = 'none';
            btn.offsetHeight; // Trigger reflow
            btn.style.animation = 'shake 0.5s ease';
            showToast('Still no connection. Please check your network.', 'error');
        }
    });

    // Listen for connection changes
    window.addEventListener('offline', showOffline);
    window.addEventListener('online', () => {
        hideOffline();
        showToast('Connection restored!');
    });

    // Check on init
    if (!navigator.onLine) showOffline();
}

function showOffline() {
    const el = document.getElementById('offlinePage');
    if (el) el.classList.add('active');
}

function hideOffline() {
    const el = document.getElementById('offlinePage');
    if (el) el.classList.remove('active');
}
