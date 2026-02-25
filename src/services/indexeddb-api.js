// IndexedDB-based service layer for offline-first POS
import {
  getAll,
  add,
  update,
  deleteRecord,
  bulkUpdate,
  getByIndex,
  getById,
  seedInitialData,
  exportAllData,
  importAllData,
} from './database';
import { dispatchDbError } from '../utils/db-error-handler.js';
import { error } from '../utils/logger.js';

// ============ PRODUCTS ============

export const getProducts = async () => {
  try {
    return await getAll('products');
  } catch (err) {
    error('Error fetching products:', err);
    dispatchDbError('fetch products', err);
    return [];
  }
};

export const getProductById = async (id) => {
  try {
    return await getById('products', id);
  } catch (err) {
    error('Error fetching product:', err);
    dispatchDbError('fetch product', err);
    return null;
  }
};

export const saveProduct = async (product) => {
  try {
    if (product.id) {
      return await update('products', product);
    } else {
      return await add('products', product);
    }
  } catch (err) {
    error('Error saving product:', err);
    dispatchDbError('save product', err);
    throw err;
  }
};

export const deleteProduct = async (id) => {
  try {
    await deleteRecord('products', id);
    return { success: true };
  } catch (err) {
    error('Error deleting product:', err);
    dispatchDbError('delete product', err);
    throw err;
  }
};

export const bulkSaveProducts = async (products) => {
  try {
    await bulkUpdate('products', products);
    return { success: true };
  } catch (err) {
    error('Error bulk saving products:', err);
    dispatchDbError('bulk save products', err);
    throw err;
  }
};

// ============ ORDERS ============

export const getOrders = async () => {
  try {
    return await getAll('orders');
  } catch (err) {
    error('Error fetching orders:', err);
    dispatchDbError('fetch orders', err);
    return [];
  }
};

export const getOrderById = async (id) => {
  try {
    return await getById('orders', id);
  } catch (err) {
    error('Error fetching order:', err);
    dispatchDbError('fetch order', err);
    return null;
  }
};

export const getOrdersByDate = async (date) => {
  try {
    return await getByIndex('orders', 'tanggal', date);
  } catch (err) {
    error('Error fetching orders by date:', err);
    dispatchDbError('fetch orders by date', err);
    return [];
  }
};

export const saveOrder = async (order) => {
  try {
    // Generate order number if not provided
    if (!order.orderNumber) {
      const timestamp = Date.now();
      order.orderNumber = `ORD-${timestamp}`;
    }

    // Add timestamp for createdAt
    order.createdAt = new Date().toISOString();

    return await add('orders', order);
  } catch (err) {
    error('Error saving order:', err);
    dispatchDbError('save order', err);
    throw err;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const order = await getById('orders', orderId);
    if (!order) {
      throw new Error('Order not found');
    }
    order.status = status;
    return await update('orders', order);
  } catch (err) {
    error('Error updating order status:', err);
    dispatchDbError('update order status', err);
    throw err;
  }
};

// ============ SETTINGS ============

export const getSettings = async () => {
  try {
    const settings = await getAll('settings');
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
  } catch (err) {
    error('Error fetching settings:', err);
    dispatchDbError('fetch settings', err);
    return {
      store_name: "Deb's Kitchen",
      tax_rate: '0',
      service_charge: '0',
      currency: 'IDR',
    };
  }
};

export const saveSetting = async (key, value) => {
  try {
    return await update('settings', { key, value });
  } catch (err) {
    error('Error saving setting:', err);
    dispatchDbError('save setting', err);
    throw err;
  }
};

export const saveSettings = async (settings) => {
  try {
    const promises = Object.entries(settings).map(([key, value]) =>
      update('settings', { key, value })
    );
    await Promise.all(promises);
    return { success: true };
  } catch (err) {
    error('Error saving settings:', err);
    dispatchDbError('save settings', err);
    throw err;
  }
};

// ============ USERS ============

export const getUsers = async () => {
  try {
    return await getAll('users');
  } catch (err) {
    error('Error fetching users:', err);
    dispatchDbError('fetch users', err);
    return [];
  }
};

export const addUser = async (user) => {
  try {
    return await add('users', user);
  } catch (err) {
    error('Error adding user:', err);
    dispatchDbError('add user', err);
    throw err;
  }
};

export const updateUser = async (user) => {
  try {
    return await update('users', user);
  } catch (err) {
    error('Error updating user:', err);
    dispatchDbError('update user', err);
    throw err;
  }
};

export const deleteUser = async (username) => {
  try {
    await deleteRecord('users', username);
    return { success: true };
  } catch (err) {
    error('Error deleting user:', err);
    dispatchDbError('delete user', err);
    throw err;
  }
};

// ============ BACKUP & RESTORE ============

export const backupData = async () => {
  try {
    const data = await exportAllData();
    return data;
  } catch (err) {
    error('Error backing up data:', err);
    dispatchDbError('backing up data', err);
    throw err;
  }
};

export const restoreData = async (backupData) => {
  try {
    await importAllData(backupData);
    return { success: true };
  } catch (err) {
    error('Error restoring data:', err);
    dispatchDbError('restoring data', err);
    throw err;
  }
};

// ============ ANALYTICS ============

export const getSalesReport = async (startDate, endDate) => {
  try {
    const allOrders = await getAll('orders');

    // Filter by date range
    let filteredOrders = allOrders.filter(
      (order) => order.status === 'Selesai' || order.status === 'completed'
    );

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filteredOrders = filteredOrders.filter((order) => {
        const orderDate = new Date(order.createdAt || order.tanggal);
        return orderDate >= start && orderDate <= end;
      });
    }

    // Calculate totals
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = filteredOrders.length;

    // Group by date for chart
    const salesByDate = filteredOrders.reduce((acc, order) => {
      const date = new Date(order.createdAt || order.tanggal).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, revenue: 0, orders: 0 };
      }
      acc[date].revenue += order.total || 0;
      acc[date].orders += 1;
      return acc;
    }, {});

    // Get top items
    const itemSales = {};
    filteredOrders.forEach((order) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          const itemName = item.nama || item.productName || 'Unknown';
          if (!itemSales[itemName]) {
            itemSales[itemName] = { name: itemName, qty: 0, revenue: 0 };
          }
          itemSales[itemName].qty += item.qty || 0;
          itemSales[itemName].revenue += (item.price || 0) * (item.qty || 0);
        });
      }
    });

    const topItems = Object.values(itemSales)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    return {
      transactions: filteredOrders,
      totalRevenue,
      totalOrders,
      salesByDate: Object.values(salesByDate),
      topItems,
    };
  } catch (err) {
    error('Error fetching sales report:', err);
    return {
      transactions: [],
      totalRevenue: 0,
      totalOrders: 0,
      salesByDate: [],
      topItems: [],
    };
  }
};

export const getTopItems = async (limit = 10) => {
  try {
    const report = await getSalesReport();
    return report.topItems.slice(0, limit).map((item) => item.name);
  } catch (err) {
    error('Error fetching top items:', err);
    return [];
  }
};

// ============ INITIALIZATION ============

export const initializeDatabase = async () => {
  try {
    await seedInitialData();
    return { success: true };
  } catch (err) {
    error('Error initializing database:', err);
    throw err;
  }
};
