// ==============================
// LOADING — Loading Overlay & Inline Loaders
// ==============================

let overlayEl = null;

/**
 * Initialize the loading overlay (call once on startup)
 */
export function initLoading() {
    overlayEl = document.getElementById('loadingOverlay');
}

/**
 * Show the full-page loading overlay
 */
export function showLoading() {
    if (!overlayEl) return;
    overlayEl.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

/**
 * Hide the full-page loading overlay with a smooth fade
 */
export function hideLoading() {
    if (!overlayEl) return;
    overlayEl.classList.add('hidden');
    document.body.style.overflow = '';
}

/**
 * Show an inline loader inside a container element
 * @param {HTMLElement} container
 * @returns {HTMLElement} the loader element (for later removal)
 */
export function showInlineLoading(container) {
    if (!container) return null;

    const loader = document.createElement('div');
    loader.className = 'loading-inline';
    loader.innerHTML = `
        <div class="loading__orbit">
            <div class="loading__orbit-ring"></div>
            <div class="loading__orbit-ring"></div>
            <div class="loading__orbit-ring"></div>
            <img src="icon.png" alt="Loading" class="loading__logo-center" />
        </div>
        <span class="loading__text">Loading...</span>
    `;
    container.appendChild(loader);
    return loader;
}

/**
 * Remove an inline loader
 * @param {HTMLElement} loaderEl
 */
export function hideInlineLoading(loaderEl) {
    if (loaderEl && loaderEl.parentNode) {
        loaderEl.style.opacity = '0';
        loaderEl.style.transition = 'opacity 0.3s ease';
        setTimeout(() => loaderEl.remove(), 300);
    }
}
