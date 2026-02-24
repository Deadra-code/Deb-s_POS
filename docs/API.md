# API Documentation

Backend API menggunakan Google Apps Script (GAS) dengan Google Sheets sebagai database.

## Base URL
```
VITE_API_URL=<your_gas_web_app_url>
```

## Authentication

### Login
```
POST /?action=login
Content-Type: text/plain

{
  "passcode": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "YWRtaW5fMTIzNDU2Nzg5MA==",
  "role": "Owner"
}
```

---

## Menu & Inventory

### Get Menu
```
GET /?action=getMenu
```

**Response:**
```json
[
  {
    "_rowIndex": 2,
    "ID": "MN-001",
    "Nama_Menu": "Nasi Goreng Spesial",
    "Kategori": "Makanan",
    "Harga": 25000,
    "Foto_URL": "",
    "Status": "Tersedia",
    "Stock": 50,
    "Milik": "Debby",
    "Modal": 15000,
    "Varian": "Level: Sedang, Pedas | Pilihan Telur: Dadar, Ceplok"
  }
]
```

### Save Product
```
POST /?action=saveProduct
Content-Type: text/plain

{
  "isNew": true,
  "Nama_Menu": "Es Teh Manis",
  "Kategori": "Minuman",
  "Harga": 5000,
  "Foto_URL": "",
  "Status": "Tersedia",
  "Stock": 100,
  "Milik": "Debby",
  "Modal": 2000,
  "Varian": ""
}
```

**Response:**
```json
{ "success": true }
```

### Delete Product
```
POST /?action=deleteProduct
Content-Type: text/plain

{
  "rowIndex": 5
}
```

**Response:**
```json
{ "success": true }
```

---

## Orders (POS)

### Save Order
```
POST /?action=saveOrder
Content-Type: text/plain

{
  "type": "Dine In",
  "cart": [
    {
      "nama": "Nasi Goreng Spesial",
      "qty": 2,
      "harga": 25000,
      "modal": 15000
    }
  ],
  "total": 50000,
  "paymentMethod": "QRIS",
  "taxVal": 0,
  "serviceVal": 0
}
```

**Response:**
```json
{
  "success": true,
  "id": "ORD-123456"
}
```

### Get Active Orders
```
GET /?action=getOrders
```

**Response:**
```json
[
  {
    "ID_Order": "ORD-123456",
    "Jam": "14:30",
    "Tipe_Order": "Dine In",
    "Items_JSON": "[{\"nama\":\"Nasi Goreng\",\"qty\":2}]",
    "Status": "Proses"
  }
]
```

### Update Order Status
```
POST /?action=updateOrderStatus
Content-Type: text/plain

{
  "id": "ORD-123456",
  "status": "Selesai"
}
```

**Response:**
```json
{ "success": true }
```

---

## Settings

### Get Settings
```
GET /?action=getSettings
```

**Response:**
```json
{
  "Store_Name": "Deb's Kitchen",
  "Tax_Rate": "0",
  "Service_Charge": "0"
}
```

### Save Settings
```
POST /?action=saveSettings
Content-Type: text/plain

{
  "Store_Name": "Deb's Kitchen",
  "Tax_Rate": "10",
  "Service_Charge": "5"
}
```

**Response:**
```json
{ "success": true }
```

---

## Reports & Analytics

### Get Sales Report
```
GET /?action=getReport
```

**Response:**
```json
{
  "transactions": [
    {
      "date": "2025-12-26",
      "time": "14:30",
      "total": 50000,
      "cost": 30000,
      "profit": 20000,
      "items": [...],
      "type": "Dine In",
      "status": "Selesai"
    }
  ]
}
```

### Get Top Items
```
GET /?action=getTopItems
```

**Response:**
```json
{
  "topItems": ["Nasi Goreng Spesial", "Es Teh Manis", "Ayam Geprek"]
}
```

---

## System

### Setup Database
```
GET /?action=setup
```

**Response:**
```json
{
  "success": true,
  "message": "Database + User Table Ready"
}
```

### Test Integrity
```
GET /?action=testIntegrity
```

**Response:**
```json
{
  "ok": true,
  "issues": []
}
```

---

## Error Responses

```json
{
  "error": "Error message description"
}
```

## Rate Limiting
- Google Apps Script memiliki quota 6 menit eksekusi per request
- Lock mechanism digunakan untuk mencegah race conditions
