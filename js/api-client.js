// ==============================
// API CLIENT — Frontend HTTP Wrappers
// ==============================

const BASE_URL = '/api';

/** Get stored JWT token */
function getToken() {
    return localStorage.getItem('luxe_token');
}

/** Make an authenticated fetch request */
async function apiFetch(endpoint, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || 'Request failed');
    }

    return data;
}

// ── Auth ──

export async function register(name, email, password, phone = '') {
    const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, phone }),
    });
    localStorage.setItem('luxe_token', data.token);
    return data;
}

export async function login(email, password) {
    const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('luxe_token', data.token);
    return data;
}

export async function getMe() {
    return apiFetch('/auth/me');
}

export function logout() {
    localStorage.removeItem('luxe_token');
}

export function isLoggedIn() {
    return !!getToken();
}

// ── Orders ──

export async function placeOrder(items, shippingAddress, subtotal, tax, total) {
    return apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
            items,
            shipping_address: shippingAddress,
            subtotal,
            tax,
            total,
        }),
    });
}

export async function getOrders() {
    return apiFetch('/orders');
}

// ── Locations ──

export async function saveLocation(lat, lng, address, label = 'Home', isDefault = true) {
    return apiFetch('/locations', {
        method: 'POST',
        body: JSON.stringify({ lat, lng, address, label, is_default: isDefault }),
    });
}

export async function getLocations() {
    return apiFetch('/locations');
}
