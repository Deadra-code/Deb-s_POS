# Deb's POS Pro v4

> **Offline-first Point of Sale (POS) system** built with React 19, Vite, and IndexedDB.

## 🎯 Features

- **100% Offline** - No internet required, data stored locally in IndexedDB
- **PWA Installable** - Install on mobile/desktop like a native app
- **Modern UI** - Built with shadcn/ui components and smooth animations
- **Mobile-First** - Optimized for touch devices and mobile screens
- **Fast Performance** - No network latency, instant responses

### Core Modules

| Module | Description |
|--------|-------------|
| **POS** | Point of Sale with cart, checkout, and payment processing |
| **Inventory** | Product management with CRUD operations |
| **Analytics** | Sales dashboard with charts and statistics |
| **Kitchen** | Real-time kitchen order monitor |
| **History** | Transaction history and reports |

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- npm

### Installation

```bash
# Clone repository
git clone <repository-url>
cd debs-pos

# Install dependencies
npm install

# Start development server
npm run dev
```

### Login

```
Passcode: admin123
Role: Owner
```

---

## 📦 Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components (Radix UI primitives)
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Recharts** - Charts & analytics

### Database & Storage
- **IndexedDB** - Primary database (offline-first)
- **LocalStorage** - Session & cache
- **PWA** - Progressive Web App (service worker)

---

## 📱 PWA Installation

### Desktop (Chrome/Edge)
1. Open app in browser
2. Click **Install** icon in address bar
3. App installs as standalone application

### Mobile (Android)
1. Open in Chrome
2. Menu → **Add to Home Screen**
3. App appears on home screen

### Mobile (iOS)
1. Open in Safari
2. Tap **Share** button
3. **Add to Home Screen**

---

## 🗄️ Database Schema

### IndexedDB: `debs-pos-db`

#### Products
```javascript
{
  id: number,
  nama: string,
  kategori: string,
  harga: number,
  modal: number,
  stock: number,
  status: 'Tersedia' | 'Habis',
  owner: 'Debby' | 'Mama',
  varian: string,
  foto: string
}
```

#### Orders
```javascript
{
  id: number,
  orderNumber: string,
  tanggal: string,
  jam: string,
  items: array,
  total: number,
  payment: 'Tunai' | 'QRIS' | 'Transfer',
  type: 'Dine In' | 'Takeaway',
  status: 'Proses' | 'Selesai' | 'Batal',
  createdAt: ISO string
}
```

#### Settings
```javascript
{
  key: string,
  value: any
}
```

#### Users
```javascript
{
  username: string,
  password: string,
  role: 'Owner' | 'Admin' | 'Cashier'
}
```

---

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Unit tests
npm run test:e2e     # E2E tests

# Maintenance
npm run lint         # ESLint
npm run backup       # Backup data
```

### Project Structure

```
debs-pos/
├── src/
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   ├── pos/          # POS components
│   │   ├── inventory/    # Inventory components
│   │   └── analytics/    # Analytics components
│   ├── pages/            # App pages
│   ├── layouts/          # Layout components
│   ├── services/         # API & database layer
│   ├── hooks/            # React hooks
│   ├── lib/              # Utilities
│   └── utils/            # Helper functions
├── public/               # Static assets
├── docs/                 # Documentation
└── package.json
```

---

## 💾 Backup & Restore

### Backup Data

```javascript
import { backupData } from './src/services/indexeddb-api';

const backup = await backupData();
// Download as JSON file
```

### Restore Data

```javascript
import { restoreData } from './src/services/indexeddb-api';

const file = event.target.files[0];
const text = await file.text();
const backup = JSON.parse(text);
await restoreData(backup);
```

---

## ⚠️ Important Notes

### Trade-offs

| ✅ Advantages | ❌ Limitations |
|--------------|----------------|
| 100% offline | No auto-sync between devices |
| Super fast | Data lost if browser cleared |
| Private (local) | Manual backup required |
| Free (no server) | Single device only |

### Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

---

## 📚 Documentation

All documentation is located in the `docs/` folder. See [docs/INDEX.md](./docs/INDEX.md) for the complete documentation index.

### Key Documents

| Document | Description |
|----------|-------------|
| [docs/INDEX.md](./docs/INDEX.md) | Documentation index & navigation |
| [docs/OFFLINE_MIGRATION.md](./docs/OFFLINE_MIGRATION.md) | Migration guide to IndexedDB |
| [docs/MIGRATION_COMPLETE.md](./docs/MIGRATION_COMPLETE.md) | Complete migration summary |
| [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) | Troubleshooting guide |

---

## 🎨 UI Components

### Button
```jsx
import { Button } from '@/components/ui/Button';

<Button variant="default">Click me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
```

### Input
```jsx
import { Input } from '@/components/ui/Input';

<Input type="text" placeholder="Enter name" className="h-12" />
```

### Card
```jsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Dialog (Modal)
```jsx
import { Dialog, DialogContent } from '@/components/ui/Dialog';

<Dialog open={isOpen} onOpenChange={setOpen}>
  <DialogContent>
    Content here
  </DialogContent>
</Dialog>
```

### Toast
```jsx
import { useToast } from '@/hooks';

const { toast } = useToast();

toast({
  title: 'Success',
  variant: 'success'
});
```

---

## 🔐 Security

### Current Implementation
- Passcode stored in IndexedDB (plain text)
- Local authentication only
- No encryption at rest

### Recommendations
- Enable browser-level security
- Regular data backups
- Use device passcode/biometric lock

---

## 📞 Support

### Troubleshooting

1. **App not loading**
   - Clear browser cache
   - Check browser console for errors
   - Verify IndexedDB is enabled

2. **Data lost**
   - Check if browser cache was cleared
   - Restore from backup file

3. **PWA not installing**
   - Ensure served via HTTPS (production)
   - Check browser compatibility

### Getting Help

1. Check [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)
2. Review [docs/INDEX.md](./docs/INDEX.md)
3. Create GitHub issue

---

## 📄 License

MIT

---

## 📅 Version History

| Version | Date | Changes |
|---------|------|---------|
| 4.0.0 | 2026-02-25 | Migrated to IndexedDB (offline-first) |
| 3.15.1 | 2026-02-24 | Previous version |

---

**Built with ❤️ for Deb's Kitchen**
