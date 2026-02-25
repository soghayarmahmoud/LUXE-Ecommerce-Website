// ==============================
// SERVER — Express + REST API
// ==============================

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'luxe_secret_key_2026_change_in_production';

// ── Middleware ──
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ── Auth Middleware ──
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid token' });
    }
}

// ════════════════════════════════
// AUTH ROUTES
// ════════════════════════════════

// Register
app.post('/api/auth/register', (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user exists
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existing) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Hash password
        const salt = bcrypt.genSaltSync(10);
        const password_hash = bcrypt.hashSync(password, salt);

        // Insert user
        const result = db.prepare(
            'INSERT INTO users (name, email, password_hash, phone) VALUES (?, ?, ?, ?)'
        ).run(name, email, password_hash, phone || '');

        // Generate token
        const token = jwt.sign(
            { id: result.lastInsertRowid, email, name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: { id: result.lastInsertRowid, name, email, phone: phone || '' }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Login
app.post('/api/auth/login', (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Compare password
        const valid = bcrypt.compareSync(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate token
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get current user
app.get('/api/auth/me', authMiddleware, (req, res) => {
    try {
        const user = db.prepare('SELECT id, name, email, phone, created_at FROM users WHERE id = ?').get(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ user });
    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ════════════════════════════════
// ORDER ROUTES
// ════════════════════════════════

// Place order
app.post('/api/orders', authMiddleware, (req, res) => {
    try {
        const { items, shipping_address, subtotal, tax, total } = req.body;

        if (!items || !shipping_address || total === undefined) {
            return res.status(400).json({ error: 'Missing order data' });
        }

        const result = db.prepare(
            'INSERT INTO orders (user_id, items, shipping_address, subtotal, tax, total) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(
            req.user.id,
            JSON.stringify(items),
            JSON.stringify(shipping_address),
            subtotal,
            tax,
            total
        );

        res.status(201).json({
            order: {
                id: result.lastInsertRowid,
                status: 'confirmed',
                total
            }
        });
    } catch (err) {
        console.error('Order error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user's orders
app.get('/api/orders', authMiddleware, (req, res) => {
    try {
        const orders = db.prepare(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC'
        ).all(req.user.id);

        // Parse JSON fields
        const parsed = orders.map(o => ({
            ...o,
            items: JSON.parse(o.items),
            shipping_address: JSON.parse(o.shipping_address)
        }));

        res.json({ orders: parsed });
    } catch (err) {
        console.error('Get orders error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ════════════════════════════════
// LOCATION ROUTES
// ════════════════════════════════

// Save location
app.post('/api/locations', authMiddleware, (req, res) => {
    try {
        const { label, lat, lng, address, is_default } = req.body;

        if (!lat || !lng || !address) {
            return res.status(400).json({ error: 'Missing location data' });
        }

        // If setting as default, clear existing defaults
        if (is_default) {
            db.prepare('UPDATE user_locations SET is_default = 0 WHERE user_id = ?').run(req.user.id);
        }

        const result = db.prepare(
            'INSERT INTO user_locations (user_id, label, lat, lng, address, is_default) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(req.user.id, label || 'Home', lat, lng, address, is_default ? 1 : 0);

        res.status(201).json({
            location: { id: result.lastInsertRowid, label, lat, lng, address, is_default: !!is_default }
        });
    } catch (err) {
        console.error('Save location error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user's saved locations
app.get('/api/locations', authMiddleware, (req, res) => {
    try {
        const locations = db.prepare(
            'SELECT * FROM user_locations WHERE user_id = ? ORDER BY is_default DESC'
        ).all(req.user.id);
        res.json({ locations });
    } catch (err) {
        console.error('Get locations error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ════════════════════════════════
// START SERVER
// ════════════════════════════════

app.listen(PORT, () => {
    console.log(`\n🛍️  LUXE E-Commerce Server running at http://localhost:${PORT}\n`);
});
