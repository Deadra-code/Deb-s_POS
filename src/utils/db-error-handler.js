/**
 * Database Error Handler
 * Dispatches custom events for database errors that components can listen to
 * This keeps the service layer clean while enabling user notifications
 */

const ERROR_EVENT = 'db-error';

/**
 * Dispatch a database error event
 * @param {string} operation - The operation that failed (e.g., 'fetch products', 'save order')
 * @param {Error} error - The error object
 */
export const dispatchDbError = (operation, error) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ERROR_EVENT, {
      detail: { operation, error: error.message },
    }));
  }
};

/**
 * Subscribe to database error events
 * @param {(operation: string, errorMessage: string) => void} handler - Error handler function
 * @returns {() => void} Unsubscribe function
 */
export const subscribeToDbErrors = (handler) => {
  const listener = (event) => {
    handler(event.detail.operation, event.detail.error);
  };

  window.addEventListener(ERROR_EVENT, listener);

  return () => {
    window.removeEventListener(ERROR_EVENT, listener);
  };
};

/**
 * Get user-friendly error message based on operation
 * @param {string} operation - The failed operation
 * @returns {string} User-friendly message
 */
export const getErrorMessage = (operation) => {
  const messages = {
    'fetch products': 'Gagal memuat daftar produk',
    'fetch product': 'Gagal memuat detail produk',
    'save product': 'Gagal menyimpan produk',
    'delete product': 'Gagal menghapus produk',
    'bulk save products': 'Gagal menyimpan banyak produk',
    'fetch orders': 'Gagal memuat riwayat pesanan',
    'fetch order': 'Gagal memuat detail pesanan',
    'fetch orders by date': 'Gagal memuat pesanan berdasarkan tanggal',
    'save order': 'Gagal menyimpan pesanan',
    'update order status': 'Gagal mengubah status pesanan',
    'fetch settings': 'Gagal memuat pengaturan',
    'save setting': 'Gagal menyimpan pengaturan',
    'save settings': 'Gagal menyimpan pengaturan',
    'fetch users': 'Gagal memuat daftar pengguna',
    'add user': 'Gagal menambah pengguna',
    'update user': 'Gagal mengubah data pengguna',
    'delete user': 'Gagal menghapus pengguna',
    'backing up data': 'Gagal membuat backup data',
    'restoring data': 'Gagal memulihkan data',
  };

  return messages[operation] || 'Terjadi kesalahan database';
};
