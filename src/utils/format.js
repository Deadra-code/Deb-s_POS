/**
 * Formats a number as IDR currency.
 * @param {number|string} amount 
 * @returns {string}
 */
export const formatCurrency = (amount) => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(value)) return 'Rp 0';
    return value.toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
};

/**
 * Formats a date string or object into a human-readable format.
 * @param {Date|string} date 
 * @returns {string}
 */
export const formatDate = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};
