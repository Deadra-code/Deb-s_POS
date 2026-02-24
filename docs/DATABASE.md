# Database Schema

Database menggunakan Google Sheets dengan struktur sebagai berikut:

## 1. Data_Menu

Menyimpan semua produk/menu yang dijual.

| Column | Index | Type | Description | Example |
|--------|-------|------|-------------|---------|
| ID | A | String | Unique product identifier | MN-001 |
| Nama_Menu | B | String | Nama produk | Nasi Goreng Spesial |
| Kategori | C | String | Kategori produk | Makanan |
| Harga | D | Integer | Harga jual (Rp) | 25000 |
| Foto_URL | E | String | URL foto produk | https://... |
| Status | F | String | Ketersediaan | Tersedia / Habis |
| Stock | G | Integer | Jumlah stok | 50 |
| Milik | H | String | Pemilik produk | Debby / Mama |
| Modal | I | Integer | Harga modal (COGS) | 15000 |
| Varian | J | String | Varian yang tersedia | Level: Sedang, Pedas |

**Contoh Data:**
```
| ID    | Nama_Menu          | Kategori  | Harga | Foto_URL | Status    | Stock | Milik | Modal | Varian                    |
|-------|--------------------|-----------|-------|----------|-----------|-------|-------|-------|---------------------------|
| MN-001| Nasi Goreng Spesial| Makanan   | 25000 |          | Tersedia  | 50    | Debby | 15000 | Level: Sedang, Pedas      |
| MN-002| Es Teh Manis       | Minuman   | 5000  |          | Tersedia  | 100   | Debby | 2000  |                           |
```

---

## 2. Data_User

Menyimpan data pengguna untuk autentikasi.

| Column | Index | Type | Description | Example |
|--------|-------|------|-------------|---------|
| Username | A | String | Nama pengguna | admin |
| Password | B | String | Password/passcode | admin123 |
| Role | C | String | Role pengguna | Owner / Admin / Cashier |

**Contoh Data:**
```
| Username | Password  | Role  |
|----------|-----------|-------|
| admin    | admin123  | Owner |
| cashier1 | 1234      | Admin |
```

---

## 3. Riwayat_Transaksi

Menyimpan semua riwayat transaksi penjualan.

| Column | Index | Type | Description | Example |
|--------|-------|------|-------------|---------|
| ID_Order | A | String | Unique order identifier | ORD-123456 |
| Tanggal | B | Date | Tanggal transaksi | 2025-12-26 |
| Jam | C | Time | Waktu transaksi | 14:30 |
| Tipe_Order | D | String | Tipe pesanan | Dine In / Take Away / Delivery |
| Items_JSON | E | JSON | Array items yang dibeli | `[{"nama":"Nasi Goreng","qty":2}]` |
| Total_Bayar | F | Integer | Total pembayaran (include tax/service) | 50000 |
| Metode_Bayar | G | String | Metode pembayaran | Cash / QRIS / Transfer |
| Status | H | String | Status pesanan | Proses / Selesai / Batal |
| Tax_Amount | I | Integer | Jumlah pajak (Rp) | 5000 |
| Service_Amount | J | Integer | Jumlah service charge (Rp) | 2500 |

**Contoh Data:**
```
| ID_Order | Tanggal   | Jam   | Tipe_Order | Items_JSON                          | Total_Bayar | Metode_Bayar | Status  | Tax_Amount | Service_Amount |
|----------|-----------|-------|------------|-------------------------------------|-------------|--------------|---------|------------|----------------|
| ORD-001  | 2025-12-26| 14:30 | Dine In    | [{"nama":"Nasi Goreng","qty":2}]    | 50000       | QRIS         | Selesai | 0          | 0              |
| ORD-002  | 2025-12-26| 15:00 | Take Away  | [{"nama":"Es Teh","qty":3}]         | 15000       | Cash         | Proses  | 0          | 0              |
```

---

## 4. Settings

Menyimpan konfigurasi aplikasi.

| Column | Index | Type | Description | Example |
|--------|-------|------|-------------|---------|
| Key | A | String | Kunci konfigurasi | Store_Name |
| Value | B | String | Nilai konfigurasi | Deb's Kitchen |

**Default Settings:**
```
| Key          | Value         |
|--------------|---------------|
| Store_Name   | Deb's Kitchen |
| Tax_Rate     | 0             |
| Service_Charge| 0            |
```

---

## Relationships

```
Data_Menu (Products)
    │
    ├──< Riwayat_Transaksi (Items_JSON references product names)
    │
    └──< Data_User (Milik column references owner)
```

---

## Index & Performance

### Recommended Sort Orders
- **Data_Menu**: Sort by `Kategori`, then `Nama_Menu`
- **Riwayat_Transaksi**: Sort by `Tanggal` DESC, `Jam` DESC
- **Data_User**: Sort by `Role`, then `Username`

### Data Validation Rules
| Sheet | Column | Rule |
|-------|--------|------|
| Data_Menu | Status | Must be "Tersedia" or "Habis" |
| Data_Menu | Stock | Must be >= 0 |
| Data_Menu | Harga | Must be > 0 |
| Data_Menu | Modal | Must be >= 0 |
| Riwayat_Transaksi | Status | Must be "Proses", "Selesai", or "Batal" |

---

## Backup Strategy

1. **Manual Backup**: Download .xlsx dari Google Sheets secara berkala
2. **Archive**: Pindahkan transaksi > 1 tahun ke spreadsheet terpisah
3. **Version Control**: Simpan backup di Google Drive dengan timestamp
