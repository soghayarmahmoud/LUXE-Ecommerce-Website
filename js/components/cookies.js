// ==============================
// COOKIES — Cookie Consent Banner
// ==============================

export function initCookieConsent() {
    // Check if already consented
    if (localStorage.getItem('luxe_cookie_consent')) return;

    // Create banner
    const banner = document.createElement('div');
    banner.id = 'cookieBanner';
    banner.className = 'cookie-banner';
    banner.innerHTML = `
        <div class="cookie-banner__content">
            <div class="cookie-banner__icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="8" cy="9" r="1" fill="currentColor"></circle>
                    <circle cx="15" cy="7" r="1" fill="currentColor"></circle>
                    <circle cx="10" cy="14" r="1" fill="currentColor"></circle>
                    <circle cx="16" cy="13" r="1" fill="currentColor"></circle>
                    <circle cx="13" cy="17" r="1" fill="currentColor"></circle>
                </svg>
            </div>
            <div class="cookie-banner__text">
                <p class="cookie-banner__title">We value your privacy</p>
                <p class="cookie-banner__description">We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.</p>
            </div>
            <div class="cookie-banner__actions">
                <button class="cookie-banner__btn cookie-banner__btn--primary" id="cookieAcceptAll">Accept All</button>
                <button class="cookie-banner__btn cookie-banner__btn--secondary" id="cookieEssential">Essential Only</button>
            </div>
        </div>
    `;
    document.body.appendChild(banner);

    // Show with animation
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            banner.classList.add('active');
        });
    });

    // Accept all
    document.getElementById('cookieAcceptAll')?.addEventListener('click', () => {
        localStorage.setItem('luxe_cookie_consent', 'all');
        hideBanner(banner);
    });

    // Essential only
    document.getElementById('cookieEssential')?.addEventListener('click', () => {
        localStorage.setItem('luxe_cookie_consent', 'essential');
        hideBanner(banner);
    });
}

function hideBanner(banner) {
    banner.classList.remove('active');
    setTimeout(() => banner.remove(), 500);
}
