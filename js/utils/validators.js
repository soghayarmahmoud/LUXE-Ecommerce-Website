// ==============================
// VALIDATORS — RegEx Validation
// ==============================

export const validators = {
    /** Email: standard format */
    isEmail(value) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value.trim());
    },

    /** Full name: at least first and last name */
    isFullName(value) {
        return /^[a-zA-Z]{2,}(\s[a-zA-Z]{2,})+$/.test(value.trim());
    },

    /** Phone: supports various formats */
    isPhone(value) {
        return /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/.test(value.trim());
    },

    /** Address: at least 5 characters */
    isAddress(value) {
        return value.trim().length >= 5;
    },

    /** City: at least 2 characters, letters only */
    isCity(value) {
        return /^[a-zA-Z\s]{2,}$/.test(value.trim());
    },

    /** ZIP Code: US format (5 or 5+4) */
    isZip(value) {
        return /^\d{5}(-\d{4})?$/.test(value.trim());
    },

    /** Credit card: 13-19 digits (Luhn-friendly) */
    isCreditCard(value) {
        const cleaned = value.replace(/[\s-]/g, '');
        return /^\d{13,19}$/.test(cleaned);
    },

    /** Expiry date: MM/YY format, not expired */
    isExpiry(value) {
        const match = value.trim().match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
        if (!match) return false;
        const month = parseInt(match[1]);
        const year = parseInt('20' + match[2]);
        const now = new Date();
        const expiry = new Date(year, month);
        return expiry > now;
    },

    /** CVV: 3 or 4 digits */
    isCVV(value) {
        return /^\d{3,4}$/.test(value.trim());
    },

    /** Generic non-empty check */
    isRequired(value) {
        return value.trim().length > 0;
    }
};

/**
 * Validate a form field and show/hide error
 * @param {HTMLInputElement} input
 * @param {string} validatorName
 * @param {string} errorMessage
 * @returns {boolean}
 */
export function validateField(input, validatorName, errorMessage) {
    const isValid = validators[validatorName](input.value);
    const errorEl = input.parentElement.querySelector('.form-error');

    if (isValid) {
        input.classList.remove('error');
        input.classList.add('valid');
        if (errorEl) {
            errorEl.classList.remove('visible');
        }
    } else {
        input.classList.add('error');
        input.classList.remove('valid');
        if (errorEl) {
            errorEl.textContent = errorMessage;
            errorEl.classList.add('visible');
        }
    }

    return isValid;
}
