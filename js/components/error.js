// ==============================
// ERROR BOUNDARY — Global Error Handler
// ==============================

import { dispatch } from '../store.js';

let errorPageEl = null;

/**
 * Initialize global error boundary
 */
export function initErrorBoundary() {
    errorPageEl = document.getElementById('errorPage');

    // Global JS errors
    window.onerror = (message, source, lineno, colno, error) => {
        showErrorPage({
            code: 'ERROR',
            title: 'Something went wrong',
            description: 'An unexpected error occurred. Our team has been notified. Please try refreshing the page.',
            details: `${message}\n\nSource: ${source || 'unknown'}\nLine: ${lineno || '?'}, Col: ${colno || '?'}\n\n${error?.stack || ''}`
        });
        return true; // Prevent default browser error handling
    };

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
        const reason = e.reason;
        showErrorPage({
            code: 'ERROR',
            title: 'Something went wrong',
            description: 'An unexpected error occurred while processing a request. Please try again.',
            details: reason?.stack || reason?.message || String(reason)
        });
        e.preventDefault();
    });

    // Wire up the error page buttons
    const homeBtn = document.getElementById('errorHomeBtn');
    const refreshBtn = document.getElementById('errorRefreshBtn');

    if (homeBtn) {
        homeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            hideErrorPage();
            dispatch({ type: 'SET_PAGE', payload: 'shop' });
            // Re-import and call showPage dynamically to avoid circular deps
            window.location.hash = '#shop';
            window.location.reload();
        });
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.reload();
        });
    }
}

/**
 * Show the error page with custom content
 * @param {{ code?: string, title?: string, description?: string, details?: string }} options
 */
export function showErrorPage(options = {}) {
    if (!errorPageEl) return;

    const codeEl = errorPageEl.querySelector('.error-page__code');
    const titleEl = errorPageEl.querySelector('.error-page__title');
    const descEl = errorPageEl.querySelector('.error-page__description');
    const detailsEl = errorPageEl.querySelector('.error-page__details-content');

    if (codeEl) codeEl.textContent = options.code || 'OOPS!';
    if (titleEl) titleEl.textContent = options.title || 'Something went wrong';
    if (descEl) descEl.textContent = options.description || 'An unexpected error occurred. Please try again.';
    if (detailsEl) detailsEl.textContent = options.details || 'No additional details available.';

    errorPageEl.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Hide the error page
 */
export function hideErrorPage() {
    if (!errorPageEl) return;
    errorPageEl.classList.remove('active');
    document.body.style.overflow = '';
}
