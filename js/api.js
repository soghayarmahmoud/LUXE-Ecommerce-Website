// ==============================
// API — Product Data Fetching
// ==============================

import { dispatch } from './store.js';

/**
 * Fetch products from the local JSON file
 * Falls back to inline data if fetch fails (file:// protocol)
 */
export async function fetchProducts() {
    try {
        const res = await fetch('./data/products.json');
        if (!res.ok) throw new Error('Failed to fetch');
        const products = await res.json();
        dispatch({ type: 'SET_PRODUCTS', payload: products });
        return products;
    } catch {
        // Fallback: import inline if fetch fails (e.g. file:// protocol)
        console.warn('Fetch failed, loading inline product data...');
        const products = getInlineProducts();
        dispatch({ type: 'SET_PRODUCTS', payload: products });
        return products;
    }
}

function getInlineProducts() {
    return [
        { id: 1, name: "Wireless Noise-Cancelling Headphones", price: 249.99, category: "Electronics", description: "Premium over-ear headphones with ANC, 30hr battery.", image: "", rating: 4.8, badge: "Best Seller" },
        { id: 2, name: "Ultra-Slim Laptop Stand", price: 59.99, category: "Electronics", description: "Ergonomic aluminum stand up to 17 inches.", image: "", rating: 4.5, badge: null },
        { id: 3, name: "Smart Fitness Watch Pro", price: 199.99, category: "Electronics", description: "AMOLED GPS fitness tracker, 14-day battery.", image: "", rating: 4.7, badge: "New" },
        { id: 4, name: "Portable Bluetooth Speaker", price: 89.99, category: "Electronics", description: "360° sound, IP67 waterproof, 20hr playtime.", image: "", rating: 4.6, badge: null },
        { id: 5, name: "Mechanical Gaming Keyboard", price: 129.99, category: "Electronics", description: "Hot-swappable switches, per-key RGB.", image: "", rating: 4.4, badge: null },
        { id: 6, name: "Premium Merino Wool Sweater", price: 89.99, category: "Clothing", description: "100% extra-fine merino wool crew-neck.", image: "", rating: 4.6, badge: null },
        { id: 7, name: "Slim-Fit Chino Pants", price: 64.99, category: "Clothing", description: "Stretch cotton twill, wrinkle-resistant.", image: "", rating: 4.3, badge: null },
        { id: 8, name: "Waterproof Hiking Jacket", price: 159.99, category: "Clothing", description: "3-layer waterproof breathable shell.", image: "", rating: 4.7, badge: "Popular" },
        { id: 9, name: "Classic Leather Sneakers", price: 119.99, category: "Clothing", description: "Minimalist white leather, cushioned insoles.", image: "", rating: 4.5, badge: null },
        { id: 10, name: "Performance Running Tee", price: 39.99, category: "Clothing", description: "Ultralight moisture-wicking, UPF 30+.", image: "", rating: 4.4, badge: null },
        { id: 11, name: "Artisan Ceramic Vase Set", price: 74.99, category: "Home", description: "Set of 3 hand-thrown ceramic vases.", image: "", rating: 4.8, badge: "Handmade" },
        { id: 12, name: "Scandinavian Floor Lamp", price: 139.99, category: "Home", description: "Solid oak tripod lamp with linen shade.", image: "", rating: 4.6, badge: null },
        { id: 13, name: "Weighted Linen Throw Blanket", price: 94.99, category: "Home", description: "Stonewashed French linen, 150×200cm.", image: "", rating: 4.5, badge: null },
        { id: 14, name: "Bamboo Desk Organizer", price: 44.99, category: "Home", description: "Multi-compartment bamboo with phone stand.", image: "", rating: 4.3, badge: "Eco" },
        { id: 15, name: "Aromatherapy Candle Set", price: 54.99, category: "Home", description: "Set of 4 soy wax candles, 45hr burn.", image: "", rating: 4.7, badge: null },
        { id: 16, name: "Leather Crossbody Bag", price: 149.99, category: "Accessories", description: "Full-grain vegetable-tanned leather.", image: "", rating: 4.8, badge: "Premium" },
        { id: 17, name: "Titanium Aviator Sunglasses", price: 179.99, category: "Accessories", description: "Polarized Carl Zeiss lenses, titanium frame.", image: "", rating: 4.6, badge: null },
        { id: 18, name: "Minimalist Automatic Watch", price: 299.99, category: "Accessories", description: "Japanese automatic, sapphire crystal.", image: "", rating: 4.9, badge: "Best Seller" },
        { id: 19, name: "Wool & Cashmere Scarf", price: 69.99, category: "Accessories", description: "70% merino, 30% cashmere, 200×70cm.", image: "", rating: 4.5, badge: null },
        { id: 20, name: "Carbon Fiber Card Holder", price: 34.99, category: "Accessories", description: "RFID-blocking, holds 12 cards, 30g.", image: "", rating: 4.4, badge: null },
    ];
}
