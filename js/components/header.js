// ==============================
// HEADER — Component
// ==============================

import { $ } from '../utils/helpers.js';

/** Initialize header behaviors */
export function initHeader() {
    const header = $('#header');
    const menuToggle = $('#menuToggle');
    const nav = $('#headerNav');

    // Scroll effect
    window.addEventListener('scroll', () => {
        header.classList.toggle('header--scrolled', window.scrollY > 20);
    });

    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        nav.classList.toggle('mobile-open');
    });

    // Close mobile menu on link click
    nav.querySelectorAll('.header__nav-link').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            nav.classList.remove('mobile-open');
        });
    });

    // Close mobile menu on outside click
    document.addEventListener('click', (e) => {
        if (!header.contains(e.target)) {
            menuToggle.classList.remove('active');
            nav.classList.remove('mobile-open');
        }
    });

    // Escape key close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            menuToggle.classList.remove('active');
            nav.classList.remove('mobile-open');
        }
    });
}
