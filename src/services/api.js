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
        }).then(res => res.json())
            .catch(err => {
                console.error(`API POST Error [${action}]:`, err);
                throw err;
            });
    }

    return fetch(url).then(res => res.json())
        .catch(err => {
            console.error(`API GET Error [${action}]:`, err);
            throw err;
        });
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
