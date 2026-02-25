// ==============================
// CENTRAL STORE — State Management
// ==============================

const STORAGE_KEY = 'luxe_cart';

/** Load cart from localStorage */
function loadCart() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

/** Save cart to localStorage */
function saveCart(cart) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch { /* storage full */ }
}

// ── Initial State ──
const state = {
    products: [],
    cart: loadCart(),
    filters: {
        search: '',
        categories: [],
        maxPrice: 500,
        minRating: 0,
        sort: 'featured',
    },
    currentPage: 'shop', // 'shop' | 'about' | 'contact' | 'checkout'
    user: null,          // { id, name, email, phone }
    location: null,      // { lat, lng, address, label }
};

// ── Subscribers ──
const listeners = new Set();

/** Subscribe to state changes */
export function subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
}

/** Notify all subscribers */
function notify() {
    listeners.forEach(fn => fn(state));
}

/** Get a read-only snapshot */
export function getState() {
    return { ...state };
}

// ── Actions / Dispatch ──
export function dispatch(action) {
    switch (action.type) {
        // Products
        case 'SET_PRODUCTS':
            state.products = action.payload;
            break;

        // Filters
        case 'SET_SEARCH':
            state.filters.search = action.payload;
            break;
        case 'TOGGLE_CATEGORY': {
            const cat = action.payload;
            const idx = state.filters.categories.indexOf(cat);
            if (idx === -1) state.filters.categories.push(cat);
            else state.filters.categories.splice(idx, 1);
            break;
        }
        case 'SET_MAX_PRICE':
            state.filters.maxPrice = action.payload;
            break;
        case 'SET_MIN_RATING':
            state.filters.minRating = action.payload;
            break;
        case 'SET_SORT':
            state.filters.sort = action.payload;
            break;
        case 'CLEAR_FILTERS':
            state.filters = { search: '', categories: [], maxPrice: 500, minRating: 0, sort: 'featured' };
            break;

        // Cart
        case 'ADD_TO_CART': {
            const product = action.payload;
            const qty = action.qty || 1;
            const existing = state.cart.find(item => item.id === product.id);
            if (existing) {
                existing.quantity += qty;
            } else {
                state.cart.push({ ...product, quantity: qty });
            }
            saveCart(state.cart);
            break;
        }
        case 'REMOVE_FROM_CART':
            state.cart = state.cart.filter(item => item.id !== action.payload);
            saveCart(state.cart);
            break;
        case 'UPDATE_QUANTITY': {
            const item = state.cart.find(i => i.id === action.payload.id);
            if (item) {
                item.quantity = Math.max(1, action.payload.quantity);
            }
            saveCart(state.cart);
            break;
        }
        case 'CLEAR_CART':
            state.cart = [];
            saveCart(state.cart);
            break;

        // Page
        case 'SET_PAGE':
            state.currentPage = action.payload;
            break;

        // User
        case 'SET_USER':
            state.user = action.payload;
            break;
        case 'LOGOUT':
            state.user = null;
            break;

        // Location
        case 'SET_LOCATION':
            state.location = action.payload;
            break;

        default:
            console.warn('Unknown action:', action.type);
    }

    notify();
}

/** Get filtered & sorted products */
export function getFilteredProducts() {
    const { products, filters } = state;
    let result = [...products];

    // Search
    if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
        );
    }

    // Categories
    if (filters.categories.length > 0) {
        result = result.filter(p => filters.categories.includes(p.category));
    }

    // Price
    result = result.filter(p => p.price <= filters.maxPrice);

    // Rating
    if (filters.minRating > 0) {
        result = result.filter(p => p.rating >= filters.minRating);
    }

    // Sort
    switch (filters.sort) {
        case 'price-low':
            result.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            result.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            result.sort((a, b) => b.rating - a.rating);
            break;
        case 'name':
            result.sort((a, b) => a.name.localeCompare(b.name));
            break;
        default: // featured — keep original order
            break;
    }

    return result;
}

/** Cart totals */
export function getCartTotals() {
    const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;
    const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    return { subtotal, tax, total, count };
}
