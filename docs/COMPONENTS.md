# Component Guide

Panduan komponen dan struktur frontend Deb's POS Pro.

## Tech Stack

- **Framework**: React 19
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Animations**: Framer Motion

---

## Project Structure

```
src/
├── App.jsx                 # Main application (monolithic)
├── main.jsx                # Entry point
├── index.css               # Global styles
├── App.css                 # Component styles
│
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── Icon.jsx        # Icon wrapper
│   │   ├── Modal.jsx       # Modal dialog
│   │   ├── Toast.jsx       # Notification toast
│   │   └── ProductImage.jsx # Product image display
│   │
│   ├── pos/                # POS-specific components
│   ├── inventory/          # Inventory components
│   ├── analytics/          # Analytics components
│   ├── kitchen/            # Kitchen monitor components
│   ├── history/            # Order history components
│   └── ErrorBoundary.jsx   # Error boundary component
│
├── pages/
│   ├── Analytics.jsx       # Dashboard analytics page
│   ├── Inventory.jsx       # Inventory management page
│   ├── POS.jsx             # Point of Sale page
│   ├── Kitchen.jsx         # Kitchen monitor page
│   ├── OrderHistory.jsx    # Order history page
│   └── LoginPage.jsx       # Login page
│
├── layouts/
│   └── DashboardLayout.jsx # Main dashboard layout
│
├── services/
│   ├── api.js              # API communication layer
│   └── haptics.js          # Haptic feedback
│
├── context/
│   └── ThemeContext.jsx    # Theme context provider
│
├── utils/
│   └── format.js           # Utility functions
│
├── config/
│   └── owners.js           # Owner configuration
│
└── assets/                 # Static assets
```

---

## Core Components

### Icon Component

Wrapper untuk Lucide React icons.

```jsx
import { Icon } from './components/ui/Icon';

// Usage
<Icon name="shopping-cart" className="w-6 h-6" />
<Icon name="check" size={24} color="#10b981" />
```

### Modal Component

Reusable modal dialog.

```jsx
import { Modal } from './components/ui/Modal';

// Usage
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Confirm">
  <p>Are you sure?</p>
</Modal>
```

### Toast Component

Notification system.

```jsx
import { Toast } from './components/ui/Toast';

// Usage
<Toast 
  message="Order saved!" 
  type="success" 
  onClose={() => setToast(null)} 
/>
```

### ProductImage Component

Display product images with fallback.

```jsx
import { ProductImage } from './components/ui/ProductImage';

// Usage
<ProductImage 
  url={product.Foto_URL} 
  name={product.Nama_Menu}
  className="w-24 h-24"
/>
```

### ErrorBoundary Component

Global error boundary untuk catch crashes.

```jsx
import { ErrorBoundary } from './components/ErrorBoundary';

// Usage
<ErrorBoundary>
  <Analytics />
</ErrorBoundary>
```

---

## Page Components

### Analytics

Dashboard dengan charts dan statistik.

**Features:**
- Revenue & profit cards
- Sales trend chart (Recharts)
- Top items list
- Date filtering

**Location:** `src/pages/Analytics.jsx`

---

### Inventory

CRUD interface untuk product management.

**Features:**
- Product list table
- Add/Edit product modal
- Delete confirmation
- Stock management
- Category filtering

**Location:** `src/pages/Inventory.jsx`

---

### POS

Point of Sale interface.

**Features:**
- Product grid dengan search
- Shopping cart
- Quantity adjustment
- Payment method selection
- Tax & service charge calculation
- Offline queue support

**Location:** `src/pages/POS.jsx`

---

### Kitchen

Real-time kitchen monitor.

**Features:**
- Active orders display
- Status updates (Proses → Selesai)
- Order timer
- Auto-refresh

**Location:** `src/pages/Kitchen.jsx`

---

### OrderHistory

Riwayat transaksi.

**Features:**
- Transaction list
- Date filtering
- Status badges
- Transaction details modal

**Location:** `src/pages/OrderHistory.jsx`

---

### LoginPage

Authentication page.

**Features:**
- Passcode input
- Login validation
- Error handling
- Role-based redirect

**Location:** `src/pages/LoginPage.jsx`

---

## Layout Components

### DashboardLayout

Main application layout dengan navigation.

**Features:**
- Sidebar navigation
- Header with user info
- Active view state management
- Responsive design

**Location:** `src/layouts/DashboardLayout.jsx`

**Navigation Items:**
- Analytics
- POS
- Kitchen
- Inventory
- History
- Settings

---

## Service Layer

### API Service

```javascript
// src/services/api.js
import { fetchData } from './api';

// GET request
const menu = await fetchData('getMenu');

// POST request
const result = await fetchData('saveOrder', 'POST', orderData);
```

**Available Actions:**
| Action | Method | Description |
|--------|--------|-------------|
| login | POST | User authentication |
| getMenu | GET | Fetch all products |
| saveProduct | POST | Create/update product |
| deleteProduct | POST | Delete product |
| getSettings | GET | Get app settings |
| saveSettings | POST | Save settings |
| saveOrder | POST | Create new order |
| getOrders | GET | Get active orders |
| updateOrderStatus | POST | Update order status |
| getReport | GET | Get sales report |
| getTopItems | GET | Get popular items |
| setup | GET | Initialize database |
| testIntegrity | GET | System health check |

### Haptics Service

```javascript
// src/services/haptics.js
import { hapticFeedback } from './haptics';

// Trigger haptic feedback
hapticFeedback('success');
```

---

## Context Providers

### ThemeContext

Theme management context.

```jsx
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Usage
<ThemeProvider>
  <App />
</ThemeProvider>

// Access in components
const { theme, toggleTheme } = useTheme();
```

---

## Utility Functions

### Format Utilities

```javascript
// src/utils/format.js
import { formatCurrency, formatDate, formatTime } from './format';

formatCurrency(25000);      // "Rp 25.000"
formatDate('2025-12-26');   // "26 Des 2025"
formatTime('14:30');        // "14:30"
```

---

## Configuration

### Owners Config

```javascript
// src/config/owners.js
export const OWNERS = {
  Debby: { label: 'Debby', color: 'bg-emerald-500' },
  Mama: { label: 'Mama', color: 'bg-blue-500' }
};
```

---

## Styling Conventions

### Tailwind Classes

```jsx
// Primary button
className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg"

// Card
className="bg-white rounded-xl shadow-md p-6"

// Input
className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500"
```

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Emerald | #10b981 | Primary, success |
| Gray | #64748b | Text, borders |
| Red | #ef4444 | Error, delete |
| Blue | #3b82f6 | Info, secondary |

---

## Best Practices

1. **Component Naming**: PascalCase untuk components
2. **File Naming**: Match component name
3. **Props Typing**: Document props dengan JSDoc
4. **State Management**: Keep state local unless shared
5. **Error Handling**: Always catch API errors
6. **Accessibility**: Use semantic HTML dan ARIA labels
