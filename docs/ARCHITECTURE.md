# Architecture Documentation - Deb's POS Pro v4

## Overview

Deb's POS v4 adalah **offline-first Point of Sale (POS) application** yang menggunakan **IndexedDB** untuk penyimpanan data lokal. Tidak ada backend server atau dependency online.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React 19)                      │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  UI Layer (shadcn/ui + Tailwind CSS)                  │ │
│  │  - Pages: POS, Inventory, Analytics, Kitchen, History │ │
│  │  - Components: Button, Input, Card, Dialog, etc.      │ │
│  │  - Animations: Framer Motion                          │ │
│  └───────────────────────────────────────────────────────┘ │
│                          │                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Service Layer (IndexedDB API)                        │ │
│  │  - getProducts(), saveOrder(), getSalesReport()       │ │
│  │  - Backup/Restore                                     │ │
│  └───────────────────────────────────────────────────────┘ │
│                          │                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  IndexedDB (debs-pos-db)                              │ │
│  │  - products, orders, settings, users                  │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI framework |
| **Vite** | 7.2.5 | Build tool & dev server |
| **Tailwind CSS** | 3.4.19 | Styling |
| **shadcn/ui** | Latest | UI components (Radix UI) |
| **Framer Motion** | 12.34.0 | Animations |
| **Lucide React** | 0.561.0 | Icons |
| **Recharts** | 3.5.1 | Charts & analytics |

### Database & Storage
| Technology | Purpose |
|------------|---------|
| **IndexedDB** | Primary database (products, orders, settings, users) |
| **LocalStorage** | Session, cache, theme preference |
| **PWA** | Service worker for offline support |

---

## Project Structure

```
debs-pos/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Dialog.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── Badge.jsx
│   │   │   └── ScrollArea.jsx
│   │   ├── pos/             # POS-specific components
│   │   ├── inventory/       # Inventory components
│   │   └── analytics/       # Analytics components
│   ├── pages/
│   │   ├── LoginPage.jsx    # Authentication
│   │   ├── POS.jsx          # Point of Sale
│   │   ├── Inventory.jsx    # Product management
│   │   ├── Analytics.jsx    # Dashboard & reports
│   │   ├── Kitchen.jsx      # Kitchen monitor
│   │   └── OrderHistory.jsx # Transaction history
│   ├── layouts/
│   │   └── DashboardLayout.jsx  # Main layout
│   ├── services/
│   │   ├── database.js      # IndexedDB CRUD layer
│   │   └── indexeddb-api.js # High-level API
│   ├── hooks/
│   │   └── useToast.jsx     # Toast notification hook
│   ├── lib/
│   │   └── utils.js         # cn() utility
│   ├── utils/
│   │   └── format.js        # formatCurrency(), etc.
│   ├── context/
│   │   └── ThemeContext.jsx # Dark mode context
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles + CSS variables
├── public/
│   ├── manifest.json        # PWA manifest
│   └── pwa-*.png            # PWA icons
├── docs/                    # Documentation
└── package.json
```

---

## Data Flow

### 1. User Login
```
LoginPage → getUsers() → IndexedDB (users) → Validate → localStorage (token)
```

### 2. Load Products
```
POS/Inventory → getProducts() → IndexedDB (products) → Display
```

### 3. Create Order
```
POS → saveOrder() → IndexedDB (orders) → Update stock → Confirmation
```

### 4. Analytics
```
Analytics → getSalesReport() → IndexedDB (orders) → Calculate → Display
```

---

## State Management

### Local State (useState)
- Component-specific state
- Form inputs
- Modal open/close

### Global State
- **Theme:** Context API (ThemeContext)
- **Auth:** localStorage (token, role)
- **Toast:** Custom hook (useToast)

### Server State
- **IndexedDB:** All persistent data
- No caching needed (local database)

---

## Component Architecture

### Page Components
```jsx
// Example: POS.jsx
function POS({ menu, refreshData, loading }) {
  const [cart, setCart] = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  
  // Load products from IndexedDB
  useEffect(() => {
    refreshData(); // Calls getProducts()
  }, []);
  
  return <UI />;
}
```

### UI Components (shadcn/ui)
```jsx
// Example: Button.jsx
export const Button = React.forwardRef(({ className, variant, size }, ref) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
    />
  );
});
```

### Service Layer
```jsx
// Example: indexeddb-api.js
export async function getProducts() {
  return await getAll('products');
}

export async function saveOrder(order) {
  return await add('orders', order);
}
```

---

## Database Layer

### IndexedDB Schema

```javascript
debs-pos-db/
├── products/
│   ├── id (auto-increment)
│   ├── nama, kategori, harga, modal, stock
│   ├── status, owner, varian, foto
│   └── indexes: nama, kategori, status, owner
│
├── orders/
│   ├── id (auto-increment)
│   ├── orderNumber, tanggal, jam, items
│   ├── total, payment, type, status
│   └── indexes: orderNumber, tanggal, status
│
├── settings/
│   ├── key (primary key)
│   └── value
│
└── users/
    ├── username (primary key)
    ├── password, role
```

### CRUD Operations

```javascript
// database.js - Low-level CRUD
export async function getAll(storeName) { ... }
export async function add(storeName, data) { ... }
export async function update(storeName, data) { ... }
export async function deleteRecord(storeName, key) { ... }

// indexeddb-api.js - High-level API
export async function getProducts() { ... }
export async function saveOrder(order) { ... }
export async function getSalesReport() { ... }
```

---

## PWA Configuration

### Service Worker (Vite PWA Plugin)

```javascript
// vite.config.js
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: "Deb's POS Pro",
    display: "standalone",
    theme_color: "#10b981"
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}']
  }
})
```

### Offline Support
- ✅ App shell cached
- ✅ IndexedDB for data
- ✅ No network required

---

## Security Considerations

### Current Implementation
- Passcode stored in IndexedDB (plain text)
- Local authentication only
- No encryption at rest

### Recommendations
- Use browser-level security (device passcode)
- Regular data backups
- Don't store sensitive data

---

## Performance Optimizations

### Code Splitting
```javascript
// vite.config.js
rollupOptions: {
  output: {
    manualChunks: {
      'react-vendor': ['react', 'react-dom'],
      'motion-vendor': ['framer-motion'],
      'icons-vendor': ['lucide-react']
    }
  }
}
```

### Lazy Loading
```jsx
// Dynamic imports for routes
const Analytics = lazy(() => import('./pages/Analytics'));
```

### IndexedDB Indexing
```javascript
// Create indexes for common queries
productStore.createIndex('kategori', 'kategori');
orderStore.createIndex('tanggal', 'tanggal');
```

---

## Build & Deployment

### Development
```bash
npm run dev  # http://localhost:5173
```

### Production
```bash
npm run build  # dist/ folder
npm run preview  # Preview build
```

### Deployment Options
1. **Static Hosting:** Vercel, Netlify, GitHub Pages
2. **Local Server:** Any static file server
3. **Desktop:** Electron wrapper
4. **Mobile:** PWA install or Capacitor

---

## Testing Strategy

### Unit Tests (Vitest)
```javascript
// Test service layer
describe('getProducts', () => {
  it('should return all products', async () => {
    const products = await getProducts();
    expect(products.length).toBeGreaterThan(0);
  });
});
```

### E2E Tests (Playwright)
```javascript
// Test user flow
test('should create new order', async ({ page }) => {
  await page.goto('/');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button:has-text("Login")');
  // ... test POS flow
});
```

---

## Migration History

### v3.x (Google Apps Script)
- Backend: Google Apps Script
- Database: Google Sheets
- Online only

### v4.0 (IndexedDB) - Current
- Backend: None (local)
- Database: IndexedDB
- 100% offline

---

## Future Considerations

### Potential Enhancements
1. **Sync Server:** Optional cloud sync
2. **Encryption:** Data encryption at rest
3. **Multi-device:** Sync between devices
4. **Export:** PDF/Excel reports

### Technical Debt
- Icons bundle too large (602 KB)
- No TypeScript (JS only)
- Limited error handling

---

**Last Updated:** 2026-02-25  
**Version:** 4.0.0
