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
        // Trik GAS: Kirim data stringified via POST body
        // Gunakan text/plain untuk menghindari preflight CORS issues pada GAS
        return fetch(url, {
            method: "POST",
            body: JSON.stringify(body)
        }).then(res => res.json());
    }

    return fetch(url).then(res => res.json());
};
