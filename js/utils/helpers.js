// ==============================
// HELPERS — DOM & Utility Functions
// ==============================

/** Select a single element */
export const $ = (selector, parent = document) => parent.querySelector(selector);

/** Select all elements */
export const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

/**
 * Create a DOM element with attributes and children
 * @param {string} tag
 * @param {Object} attrs
 * @param  {...(string|HTMLElement)} children
 * @returns {HTMLElement}
 */
export function createElement(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') {
      el.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([k, v]) => el.dataset[k] = v);
    } else if (key.startsWith('on')) {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'innerHTML') {
      el.innerHTML = value;
    } else {
      el.setAttribute(key, value);
    }
  }

  children.forEach(child => {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof HTMLElement) {
      el.appendChild(child);
    }
  });

  return el;
}

/**
 * Format a number as USD currency
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Debounce a function call
 * @param {Function} fn
 * @param {number} delay
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Generate star rating HTML
 * @param {number} rating 0-5
 * @returns {string}
 */
export function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

/**
 * Show a toast notification
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
export function showToast(message, type = 'success') {
  const container = $('#toastContainer');
  const toast = createElement('div', { className: `toast toast--${type}` },
    createElement('span', {}, message)
  );
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100px)';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

/**
 * Placeholder image with text using a canvas-based data URL
 * @param {string} text
 * @param {number} width
 * @param {number} height
 * @returns {string}
 */
export function placeholderImage(text, width = 400, height = 400) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#e2e6ef');
  gradient.addColorStop(1, '#f1f3f8');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Text
  ctx.fillStyle = '#717b96';
  ctx.font = `600 ${Math.round(width * 0.06)}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Word wrap
  const words = text.split(' ');
  let lines = [];
  let currentLine = '';
  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > width * 0.7) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  lines.push(currentLine);

  const lineHeight = width * 0.08;
  const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, width / 2, startY + i * lineHeight);
  });

  return canvas.toDataURL('image/jpeg', 0.85);
}
