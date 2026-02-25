# API Reference - IndexedDB Service Layer

API layer menggunakan **IndexedDB** untuk penyimpanan data lokal (offline-first).

---

## Base URL

Tidak ada base URL - semua data disimpan lokal di browser.

```javascript
Database: debs-pos-db (IndexedDB)
Location: Browser
```

---

## Authentication

### Login

```javascript
import { getUsers } from './services/indexeddb-api';

const users = await getUsers();
const user = users.find(u => u.password === passcode);

if (user) {
  localStorage.setItem('POS_TOKEN', user.username);
  localStorage.setItem('POS_ROLE', user.role);
}
```

**Response:**
```javascript
{
  username: "admin",
  role: "Owner"
}
```

---

## Products API

### Get All Products

```javascript
import { getProducts } from './services/indexeddb-api';

const products = await getProducts();
```

**Response:**
```javascript
[
  {
    id: 1,
    nama: "Nasi Goreng Spesial",
    kategori: "Makanan",
    harga: 25000,
    modal: 15000,
    stock: 50,
    status: "Tersedia",
    owner: "Debby",
    varian: "Level: Sedang, Pedas",
    foto: ""
  }
]
```

### Get Product by ID

```javascript
import { getProductById } from './services/indexeddb-api';

const product = await getProductById(1);
```

### Save Product (Create/Update)

```javascript
import { saveProduct } from './services/indexeddb-api';

// Create
const newId = await saveProduct({
  nama: "Es Teh Manis",
  kategori: "Minuman",
  harga: 5000,
  modal: 2000,
  stock: 100,
  status: "Tersedia",
  owner: "Debby",
  varian: ""
});

// Update (include id)
await saveProduct({
  id: 1,
  nama: "Es Teh Manis",
  harga: 6000, // Updated
  // ... other fields
});
```

**Response:**
```javascript
1 // ID of saved product
```

### Delete Product

```javascript
import { deleteProduct } from './services/indexeddb-api';

await deleteProduct(1);
```

**Response:**
```javascript
{ success: true }
```

### Bulk Save Products

```javascript
import { bulkSaveProducts } from './services/indexeddb-api';

await bulkSaveProducts([
  { nama: "Product 1", harga: 10000, ... },
  { nama: "Product 2", harga: 15000, ... }
]);
```

---

## Orders API

### Get All Orders

```javascript
import { getOrders } from './services/indexeddb-api';

const orders = await getOrders();
```

**Response:**
```javascript
[
  {
    id: 1,
    orderNumber: "ORD-1708876543210",
    tanggal: "2026-02-25",
    jam: "14:30",
    items: [
      {
        nama: "Nasi Goreng Spesial",
        qty: 2,
        harga: 25000
      }
    ],
    total: 50000,
    payment: "QRIS",
    type: "Dine In",
    status: "Selesai",
    tax: 0,
    service: 0,
    createdAt: "2026-02-25T14:30:00.000Z"
  }
]
```

### Get Order by ID

```javascript
import { getOrderById } from './services/indexeddb-api';

const order = await getOrderById(1);
```

### Save Order

```javascript
import { saveOrder } from './services/indexeddb-api';

const orderId = await saveOrder({
  orderNumber: "ORD-1708876543210",
  tanggal: "2026-02-25",
  jam: "14:30",
  items: [
    {
      nama: "Nasi Goreng",
      qty: 2,
      harga: 25000
    }
  ],
  total: 50000,
  payment: "QRIS",
  type: "Dine In",
  status: "Proses",
  tax: 0,
  service: 0
});
```

**Response:**
```javascript
1 // ID of saved order
```

### Update Order Status

```javascript
import { updateOrderStatus } from './services/indexeddb-api';

await updateOrderStatus(1, "Selesai");
```

---

## Settings API

### Get All Settings

```javascript
import { getSettings } from './services/indexeddb-api';

const settings = await getSettings();
```

**Response:**
```javascript
{
  store_name: "Deb's Kitchen",
  tax_rate: "0",
  service_charge: "0",
  currency: "IDR"
}
```

### Save Setting

```javascript
import { saveSetting } from './services/indexeddb-api';

await saveSetting("tax_rate", "10");
```

### Save Settings (Bulk)

```javascript
import { saveSettings } from './services/indexeddb-api';

await saveSettings({
  store_name: "Deb's Kitchen",
  tax_rate: "10",
  service_charge: "5"
});
```

---

## Analytics API

### Get Sales Report

```javascript
import { getSalesReport } from './services/indexeddb-api';

const report = await getSalesReport(startDate, endDate);
```

**Response:**
```javascript
{
  transactions: [...],      // Array of orders
  totalRevenue: 1000000,    // Total revenue
  totalOrders: 50,          // Total orders
  salesByDate: [            // For chart
    { date: "2026-02-25", revenue: 500000, orders: 25 },
    { date: "2026-02-26", revenue: 500000, orders: 25 }
  ],
  topItems: [               // Best selling items
    { name: "Nasi Goreng", qty: 100, revenue: 2500000 },
    { name: "Es Teh", qty: 80, revenue: 400000 }
  ]
}
```

### Get Top Items

```javascript
import { getTopItems } from './services/indexeddb-api';

const topItems = await getTopItems(10); // Limit 10
```

**Response:**
```javascript
["Nasi Goreng", "Es Teh", "Ayam Geprek", ...]
```

---

## Users API

### Get All Users

```javascript
import { getUsers } from './services/indexeddb-api';

const users = await getUsers();
```

### Add User

```javascript
import { addUser } from './services/indexeddb-api';

await addUser({
  username: "cashier1",
  password: "1234",
  role: "Cashier"
});
```

### Update User

```javascript
import { updateUser } from './services/indexeddb-api';

await updateUser({
  username: "cashier1",
  password: "5678",
  role: "Admin"
});
```

### Delete User

```javascript
import { deleteUser } from './services/indexeddb-api';

await deleteUser("cashier1");
```

---

## Backup & Restore API

### Backup Data

```javascript
import { backupData } from './services/indexeddb-api';

const backup = await backupData();
// Download as JSON file
const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
```

**Response:**
```javascript
{
  version: 1,
  timestamp: "2026-02-25T14:30:00.000Z",
  data: {
    products: [...],
    orders: [...],
    settings: [...],
    users: [...]
  }
}
```

### Restore Data

```javascript
import { restoreData } from './services/indexeddb-api';

const file = event.target.files[0];
const text = await file.text();
const backup = JSON.parse(text);
await restoreData(backup);
```

---

## Database Initialization

### Initialize Database

```javascript
import { initializeDatabase } from './services/indexeddb-api';

await initializeDatabase();
```

### Seed Initial Data

```javascript
import { seedInitialData } from './services/database';

await seedInitialData();
// Creates default admin user and default settings
```

---

## Error Handling

```javascript
try {
  await saveOrder(order);
} catch (err) {
  console.error('Failed to save order:', err);
  // Handle error (show toast, etc.)
}
```

---

## Usage Examples

### Complete POS Flow

```javascript
import {
  getProducts,
  saveOrder,
  getSalesReport
} from './services/indexeddb-api';

// 1. Load products
const products = await getProducts();

// 2. Create order
const order = {
  orderNumber: `ORD-${Date.now()}`,
  tanggal: new Date().toISOString().split('T')[0],
  jam: new Date().toLocaleTimeString('id-ID'),
  items: cart.map(item => ({
    nama: item.nama,
    qty: item.qty,
    harga: item.harga
  })),
  total: cart.reduce((sum, item) => sum + item.harga * item.qty, 0),
  payment: 'QRIS',
  type: 'Dine In',
  status: 'Proses'
};

// 3. Save order
await saveOrder(order);

// 4. Get updated report
const report = await getSalesReport();
```

### Inventory Management

```javascript
import {
  getProducts,
  saveProduct,
  deleteProduct
} from './services/indexeddb-api';

// Load products
const products = await getProducts();

// Add new product
await saveProduct({
  nama: "Menu Baru",
  kategori: "Makanan",
  harga: 30000,
  modal: 20000,
  stock: 50,
  status: "Tersedia",
  owner: "Debby"
});

// Update product
const product = products.find(p => p.id === 1);
product.harga = 35000;
await saveProduct(product);

// Delete product
await deleteProduct(1);
```

---

## Performance Tips

1. **Cache frequently accessed data**
   ```javascript
   // Cache products
   const cached = localStorage.getItem('products_cache');
   if (cached) {
     return JSON.parse(cached);
   }
   ```

2. **Use bulk operations**
   ```javascript
   await bulkSaveProducts(products); // Instead of multiple saveProduct calls
   ```

3. **Index queries**
   ```javascript
   // Use indexed queries instead of filtering
   const makanan = await getByIndex('products', 'kategori', 'Makanan');
   ```

---

**Last Updated:** 2026-02-25  
**Version:** 4.0.0 (IndexedDB)
