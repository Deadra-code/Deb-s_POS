const DB_NAME = 'debs-pos-db';
const DB_VERSION = 1;

let dbInstance = null;

// Initialize database
export function initDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Products store
      if (!db.objectStoreNames.contains('products')) {
        const productStore = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
        productStore.createIndex('nama', 'nama', { unique: false });
        productStore.createIndex('kategori', 'kategori', { unique: false });
        productStore.createIndex('status', 'status', { unique: false });
        productStore.createIndex('owner', 'owner', { unique: false });
      }

      // Orders store
      if (!db.objectStoreNames.contains('orders')) {
        const orderStore = db.createObjectStore('orders', { keyPath: 'id', autoIncrement: true });
        orderStore.createIndex('orderNumber', 'orderNumber', { unique: true });
        orderStore.createIndex('tanggal', 'tanggal', { unique: false });
        orderStore.createIndex('status', 'status', { unique: false });
        orderStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }

      // Users store
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'username' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Generic CRUD functions
export async function getAll(storeName) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getById(storeName, id) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function add(storeName, data) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.add(data);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function update(storeName, data) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(data);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteRecord(storeName, key) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearStore(storeName) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAllStores() {
  const db = await initDB();
  return Array.from(db.objectStoreNames);
}

// Query helpers
export async function getByIndex(storeName, indexName, value) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const index = store.index(indexName);
    const request = index.getAll(value);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Bulk operations
export async function bulkAdd(storeName, items) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    
    items.forEach(item => {
      store.add(item);
    });
    
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function bulkUpdate(storeName, items) {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    
    items.forEach(item => {
      store.put(item);
    });
    
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Export/Import for backup
export async function exportAllData() {
  const stores = await getAllStores();
  const data = {};
  
  for (const storeName of stores) {
    data[storeName] = await getAll(storeName);
  }
  
  return {
    version: DB_VERSION,
    timestamp: new Date().toISOString(),
    data
  };
}

export async function importAllData(backupData) {
  await initDB();
  
  for (const [storeName, items] of Object.entries(backupData.data)) {
    await clearStore(storeName);
    if (items.length > 0) {
      await bulkAdd(storeName, items);
    }
  }
}

// Seed initial data
export async function seedInitialData() {
  const users = await getAll('users');
  
  if (users.length === 0) {
    await add('users', {
      username: 'admin',
      password: 'admin123',
      role: 'Owner'
    });
  }
  
  const settings = await getAll('settings');
  
  if (settings.length === 0) {
    await bulkAdd('settings', [
      { key: 'store_name', value: "Deb's Kitchen" },
      { key: 'tax_rate', value: '0' },
      { key: 'service_charge', value: '0' },
      { key: 'currency', value: 'IDR' }
    ]);
  }
}
