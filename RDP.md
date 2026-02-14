# Requirements Definition Phase (RDP) - Deb's POS

## 1. Project Overview
**Deb's POS** is a modern Point of Sale (POS) Progressive Web Application (PWA) designed for small businesses (specifically "Deb's Kitchen"). The application focuses on simplicity, speed, and reliability by leveraging a serverless architecture with Google Apps Script (GAS) and Google Sheets.

### 1.1 Objective
To provide a comprehensive, easy-to-use sales and inventory management system that works on both desktop and mobile devices, allowing for real-time order tracking and financial reporting.

---

## 2. Technical Stack
- **Frontend**: React 19 (Vite)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Backend**: Google Apps Script (GAS)
- **Database**: Google Sheets (Data_User, Data_Menu, Riwayat_Transaksi, Settings)
- **Deployment**: GitHub Pages (Frontend) & GAS Web App (API)

---

## 3. Current Features (v1.x)
- [x] **Secure Authentication**: Simple login system with roles.
- [x] **Dashboard Analytics**: visualization of revenue, profit, and order trends.
- [x] **Inventory Management**: CRUD operations for products with stock tracking and cost (modal) tracking.
- [x] **Point of Sale (POS)**: Responsive cart system, item search, and checkout.
- [x] **Kitchen Monitor**: Real-time view for open orders with status updates.
- [x] **Settings**: Dynamic configuration for Tax (PPN) and Service Charges.
- [x] **Order History**: Detailed list of past transactions with filtered views.

---

## 4. Future Roadmap & Requirements

### 4.1 Feature Enhancements (Short-term)
- [ ] **Print Receipt**: Support for thermal Bluetooth printers via Web Bluetooth API.
- [ ] **Low Stock Alerts**: Visual notifications or a specific "Low Stock" dashboard view.
- [ ] **Discount System**: Ability to apply discounts (percentage or fixed) during checkout.
- [ ] **Multiple Payment Methods**: Better tracking for Cash, Qris, and Bank Transfer.
- [ ] **Expense Tracker**: A dedicated module to record daily business expenses.

### 4.2 Modular Expansion (Mid-term)
- [ ] **Lab Module Integration**: Based on previous requirements, potential integration of materials testing (e.g., Beton, Abrasi) if this POS expands into a "Business ERP".
- [ ] **Multi-user Management**: Granular permissions (Cashier vs Kitchen vs Admin).
- [ ] **Customer Database**: Storing customer names and phone numbers for loyalty programs.

### 4.3 Technical Improvements
- [ ] **Refactoring to Modular Structure**: Split the monolithic `App.jsx` into separate components and hooks.
- [ ] **TypeScript Implementation**: Migrate from `.jsx` to `.tsx` for better type safety and DX.
- [ ] **Offline Mode (Service Workers)**: Enhance PWA capabilities to allow queueing orders when offline.
- [ ] **Advanced Caching**: Implement `localStorage` caching for menu data to reduce API calls.

---

## 5. Data Architecture
The system relies on Google Sheets with the following structure:

### 5.1 `Data_Menu`
| Column | Description |
| :--- | :--- |
| ID | Unique product identifier (MN-XXXX) |
| Nama_Menu | Name of the product |
| Kategori | Category (Makanan, Minuman, etc.) |
| Harga | Selling price |
| Modal | Cost of goods sold (COGS) |
| Stock | Current quantity |
| Status | Availability (Tersedia/Habis) |
| Milik | Owner identifier (e.g., Debby, Mama) |

### 5.2 `Riwayat_Transaksi`
| Column | Description |
| :--- | :--- |
| ID_Order | Unique order identifier (ORD-XXXX) |
| Tanggal | Date of transaction |
| Jam | Time of transaction |
| Items_JSON | Stringified array of products sold |
| Total_Bayar | Final amount paid includes tax/service |
| Status | Progress state (Proses/Selesai/Batal) |

---

## 6. Security Considerations
- [ ] API Token rotation mechanism.
- [ ] Input sanitization on both Frontend and GAS.
- [ ] Regular automated backups of the Google Sheet data.
