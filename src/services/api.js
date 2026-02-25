const API_URL = import.meta.env.VITE_API_URL;

/**
 * Cache configuration with TTL (Time To Live) in milliseconds
 */
const CACHE_TTL = {
    menu: 5 * 60 * 1000,      // 5 minutes
    settings: 10 * 60 * 1000, // 10 minutes
    orders: 30 * 1000,        // 30 seconds
    report: 60 * 1000,        // 1 minute
    default: 5 * 60 * 1000    // 5 minutes default
};

/**
 * Get cached data if still valid
 */
const getCachedData = (action) => {
    try {
        const cached = localStorage.getItem(`api_cache_${action}`);
        if (!cached) return null;
        
        const { data, timestamp } = JSON.parse(cached);
        const ttl = CACHE_TTL[action] || CACHE_TTL.default;
        const isExpired = Date.now() - timestamp > ttl;
        
        if (isExpired) {
            localStorage.removeItem(`api_cache_${action}`);
            return null;
        }
        
        return data;
    } catch {
        return null;
    }
};

/**
 * Set cached data with timestamp
 */
const setCachedData = (action, data) => {
    try {
        localStorage.setItem(`api_cache_${action}`, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    } catch (e) {
        console.warn('Cache storage failed:', e);
    }
};

/**
 * Clear specific cache or all caches
 */
export const clearCache = (action) => {
    if (action) {
        localStorage.removeItem(`api_cache_${action}`);
    } else {
        const keys = Object.keys(localStorage).filter(k => k.startsWith('api_cache_'));
        keys.forEach(k => localStorage.removeItem(k));
    }
};

/**
 * Helper function to fetch data from the backend.
 * @param {string} action - The action to perform (e.g., 'getMenu', 'saveOrder').
 * @param {string} method - The HTTP method (GET or POST).
 * @param {object|null} body - The request body for POST requests.
 * @param {boolean} useCache - Whether to use caching (default: true for GET requests).
 * @returns {Promise<any>} - The JSON response from the backend.
 */
export const fetchData = async (action, method = 'GET', body = null, useCache = true) => {
    let url = `${API_URL}?action=${action}`;

    // Check cache for GET requests
    if (method === 'GET' && useCache) {
        const cached = getCachedData(action);
        if (cached) {
            return cached;
        }
    }

    if (method === 'POST') {
        // --- OFFLINE HANDLING FOR SAVE ORDER ---
        if (action === 'saveOrder' && !navigator.onLine) {
            const pending = JSON.parse(localStorage.getItem('POS_PENDING_ORDERS') || '[]');
            pending.push({ body, timestamp: Date.now() });
            localStorage.setItem('POS_PENDING_ORDERS', JSON.stringify(pending));
            return { success: true, offline: true, status: 'QUEUED' };
        }

        const result = await fetch(url, {
            method: "POST",
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(body)
        }).then(res => res.json())
            .catch(err => {
                console.error(`API POST Error [${action}]:`, err);
                throw err;
            });

        // Clear relevant cache on successful POST
        if (result.success) {
            if (action === 'saveProduct') clearCache('menu');
            if (action === 'deleteProduct') clearCache('menu');
            if (action === 'saveOrder') { clearCache('menu'); clearCache('orders'); }
            if (action === 'updateOrderStatus') clearCache('orders');
            if (action === 'saveSettings') clearCache('settings');
        }

        return result;
    }

    const result = await fetch(url).then(res => res.json())
        .catch(err => {
            console.error(`API GET Error [${action}]:`, err);
            throw err;
        });

    // Cache successful GET responses
    if (useCache && result && !result.error) {
        setCachedData(action, result);
    }

    return result;
};

let isSyncing = false;

/**
 * Syncs pending orders from localStorage to the backend.
 */
export const syncOfflineOrders = async () => {
    if (isSyncing) return;

    let pending = JSON.parse(localStorage.getItem('POS_PENDING_ORDERS') || '[]');
    if (pending.length === 0) return;

    isSyncing = true;
    try {
        const remaining = [];
        for (const order of pending) {
            try {
                const res = await fetch(`${API_URL}?action=saveOrder`, {
                    method: "POST",
                    headers: { 'Content-Type': 'text/plain' },
                    body: JSON.stringify(order.body)
                });

                if (!res.ok) {
                    remaining.push(order);
                }
            } catch (e) {
                console.error("Sync failed for an order", e);
                remaining.push(order);
            }
        }

        if (remaining.length > 0) {
            localStorage.setItem('POS_PENDING_ORDERS', JSON.stringify(remaining));
        } else {
            localStorage.removeItem('POS_PENDING_ORDERS');
        }
    } finally {
        isSyncing = false;
    }
};
