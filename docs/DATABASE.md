# Database Schema - IndexedDB

Database menggunakan **IndexedDB** dengan struktur sebagai berikut:

## Database Info

- **Name:** `debs-pos-db`
- **Version:** `1`
- **Location:** Browser (IndexedDB)
- **Type:** NoSQL (Object Store)

---

## 1. products

Menyimpan semua produk/menu yang dijual.

### Schema

```javascript
{
  id: number,           // Auto-increment primary key
  nama: string,         // Nama produk
  kategori: string,     // Kategori (Makanan, Minuman, dll)
  harga: number,        // Harga jual (Rp)
  modal: number,        // Harga modal (COGS)
  stock: number,        // Jumlah stok
  status: string,       // 'Tersedia' | 'Habis'
  owner: string,        // 'Debby' | 'Mama'
  varian: string,       // Varian yang tersedia
  foto: string          // URL foto produk
}
```

### Indexes

| Index Name | Key Path | Unique |
|------------|----------|--------|
| nama | nama | false |
| kategori | kategori | false |
| status | status | false |
| owner | owner | false |

### Contoh Data

```javascript
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
```

---

## 2. orders

Menyimpan semua riwayat transaksi penjualan.

### Schema

```javascript
{
  id: number,              // Auto-increment primary key
  orderNumber: string,     // Unique order identifier (ORD-XXXXX)
  tanggal: string,         // Tanggal (YYYY-MM-DD)
  jam: string,             // Waktu (HH:MM)
  items: array,            // Array items yang dibeli
  total: number,           // Total pembayaran (include tax/service)
  payment: string,         // 'Tunai' | 'QRIS' | 'Transfer'
  type: string,            // 'Dine In' | 'Takeaway'
  status: string,          // 'Proses' | 'Selesai' | 'Batal'
  tax: number,             // Jumlah pajak (Rp)
  service: number,         // Jumlah service charge (Rp)
  createdAt: string        // ISO timestamp
}
```

### Indexes

| Index Name | Key Path | Unique |
|------------|----------|--------|
| orderNumber | orderNumber | true |
| tanggal | tanggal | false |
| status | status | false |
| createdAt | createdAt | false |

### Contoh Data

```javascript
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
```

---

## 3. settings

Menyimpan konfigurasi aplikasi.

### Schema

```javascript
{
  key: string,    // Primary key
  value: any      // Nilai konfigurasi
}
```

### Default Settings

```javascript
[
  { key: "store_name", value: "Deb's Kitchen" },
  { key: "tax_rate", value: "0" },
  { key: "service_charge", value: "0" },
  { key: "currency", value: "IDR" }
]
```

---

## 4. users

Menyimpan data pengguna untuk autentikasi.

### Schema

```javascript
{
  username: string,    // Primary key
  password: string,    // Passcode (plain text)
  role: string         // 'Owner' | 'Admin' | 'Cashier'
}
```

### Default User

```javascript
{
  username: "admin",
  password: "admin123",
  role: "Owner"
}
```

---

## Relationships

```
products
  │
  └──< orders.items (embedded references)

users
  └── Authentication & authorization

settings
  └── Application configuration
```

---

## CRUD Operations

### Products

```javascript
import { getProducts, saveProduct, deleteProduct } from './services/indexeddb-api';

// Get all
const products = await getProducts();

// Get by ID
const product = await getProductById(1);

// Create/Update
await saveProduct({
  nama: "Nasi Goreng",
  kategori: "Makanan",
  harga: 25000,
  modal: 15000,
  stock: 50,
  status: "Tersedia",
  owner: "Debby"
});

// Delete
await deleteProduct(1);
```

### Orders

```javascript
import { getOrders, saveOrder, updateOrderStatus } from './services/indexeddb-api';

// Get all
const orders = await getOrders();

// Create
await saveOrder({
  orderNumber: "ORD-123456",
  tanggal: "2026-02-25",
  jam: "14:30",
  items: [...],
  total: 50000,
  payment: "QRIS",
  type: "Dine In",
  status: "Proses"
});

// Update status
await updateOrderStatus(1, "Selesai");
```

### Settings

```javascript
import { getSettings, saveSettings } from './services/indexeddb-api';

// Get all
const settings = await getSettings();

// Update
await saveSettings({
  store_name: "Deb's Kitchen",
  tax_rate: "10"
});
```

### Users

```javascript
import { getUsers, addUser, updateUser } from './services/indexeddb-api';

// Get all
const users = await getUsers();

// Create
await addUser({
  username: "cashier1",
  password: "1234",
  role: "Cashier"
});

// Update
await updateUser({
  username: "cashier1",
  password: "5678",
  role: "Admin"
});
```

---

## Backup & Restore

### Backup

```javascript
import { backupData } from './services/indexeddb-api';

const backup = await backupData();
// Returns: { version, timestamp, data: { products, orders, settings, users } }
```

### Restore

```javascript
import { restoreData } from './services/indexeddb-api';

const file = event.target.files[0];
const text = await file.text();
const backup = JSON.parse(text);
await restoreData(backup);
```

---

## Performance Considerations

### Index Usage

- Query by category: Uses `kategori` index
- Query by status: Uses `status` index
- Query by date: Uses `createdAt` index
- Search by name: Uses `nama` index

### Best Practices

1. **Use indexes for queries** - Avoid full table scans
2. **Batch operations** - Use `bulkAdd` / `bulkUpdate` for multiple records
3. **Clear old data** - Archive orders > 1 year
4. **Regular backup** - Export data periodically

---

## Data Validation

### Products

| Field | Validation |
|-------|------------|
| nama | Required, min 3 chars |
| kategori | Required, enum |
| harga | Required, > 0 |
| modal | Required, >= 0 |
| stock | Required, >= 0 |
| status | Required, enum |
| owner | Required, enum |

### Orders

| Field | Validation |
|-------|------------|
| orderNumber | Required, unique |
| items | Required, array |
| total | Required, > 0 |
| payment | Required, enum |
| status | Required, enum |

---

## Migration from Google Sheets

### Old Schema (Google Sheets)

```
Data_Menu:
  - ID, Nama_Menu, Kategori, Harga, Foto_URL, Status, Stock, Milik, Modal, Varian
```

### New Schema (IndexedDB)

```
products:
  - id, nama, kategori, harga, foto, status, stock, owner, modal, varian
```

### Mapping

| Google Sheets | IndexedDB |
|---------------|-----------|
| ID | id (auto) |
| Nama_Menu | nama |
| Kategori | kategori |
| Harga | harga |
| Foto_URL | foto |
| Status | status |
| Stock | stock |
| Milik | owner |
| Modal | modal |
| Varian | varian |

---

## Troubleshooting

### Database Not Found

```javascript
// Check if database exists
const request = indexedDB.open('debs-pos-db', 1);
request.onsuccess = () => {
  console.log('Database exists');
};
request.onerror = () => {
  console.log('Database not found');
};
```

### Reset Database

```javascript
import { seedInitialData } from './services/database';

// Clear all stores
await clearStore('products');
await clearStore('orders');
await clearStore('settings');
await clearStore('users');

// Re-seed default data
await seedInitialData();
```

---

**Last Updated:** 2026-02-25  
**Version:** 4.0.0 (IndexedDB)
