const API_URL = import.meta.env.VITE_API_URL;

/**
 * Helper function to fetch data from the Google Apps Script backend.
 * @param {string} action - The action to perform (e.g., 'getMenu', 'saveOrder').
 * @param {string} method - The HTTP method (GET or POST).
 * @param {object|null} body - The request body for POST requests.
 * @returns {Promise<any>} - The JSON response from the backend.
 */
export const fetchData = async (action, method = 'GET', body = null) => {
    let url = `${API_URL}?action=${action}`;

    if (method === 'POST') {
        // --- OFFLINE HANDLING FOR SAVE ORDER ---
        if (action === 'saveOrder' && !navigator.onLine) {
            const pending = JSON.parse(localStorage.getItem('POS_PENDING_ORDERS') || '[]');
            pending.push({ body, timestamp: Date.now() });
            localStorage.setItem('POS_PENDING_ORDERS', JSON.stringify(pending));
            return { success: true, offline: true, status: 'QUEUED' };
        }

        return fetch(url, {
            method: "POST",
            body: JSON.stringify(body)
        }).then(res => res.json());
    }

    return fetch(url).then(res => res.json());
};

let isSyncing = false;

/**
 * Syncs pending orders from localStorage to the backend.
 */
export const syncOfflineOrders = async () => {
    if (isSyncing) return;

    const pending = JSON.parse(localStorage.getItem('POS_PENDING_ORDERS') || '[]');
    if (pending.length === 0) return;

    isSyncing = true;
    try {
        // Process sequentially to avoid flooding
        for (const order of pending) {
            try {
                await fetch(`${API_URL}?action=saveOrder`, {
                    method: "POST",
                    body: JSON.stringify(order.body)
                });
            } catch (e) {
                console.error("Sync failed for an order", e);
                // Continue to try next orders? Or stop? 
                // Better to stop to preserve order, but for now we try all.
            }
        }
        localStorage.removeItem('POS_PENDING_ORDERS');
    } finally {
        isSyncing = false;
    }
};
