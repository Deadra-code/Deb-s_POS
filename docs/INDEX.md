# Documentation Index - Deb's POS Pro v4

> **Offline-first Point of Sale system** - Complete documentation

---

## 🚀 Quick Start

### For New Users

1. Read [README.md](../README.md) for overview
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Login with passcode: `admin123`

### For Developers

1. Review [OFFLINE_MIGRATION.md](../OFFLINE_MIGRATION.md) for architecture
2. Check [DATABASE.md](./DATABASE.md) for schema
3. Read [COMPONENTS.md](./COMPONENTS.md) for UI guide
4. See [TESTING.md](./TESTING.md) for testing

---

## 📖 Core Documentation

| Document | Description |
|----------|-------------|
| [README.md](../README.md) | Project overview & quick start |
| [OFFLINE_MIGRATION.md](../OFFLINE_MIGRATION.md) | Migration guide from GAS to IndexedDB |
| [MIGRATION_COMPLETE.md](../MIGRATION_COMPLETE.md) | Complete migration summary |
| [ENVIRONMENT.md](./ENVIRONMENT.md) | Environment setup |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Common issues & solutions |

---

## 🔧 Technical Documentation

| Document | Description |
|----------|-------------|
| [DATABASE.md](./DATABASE.md) | IndexedDB schema & structure |
| [API.md](./API.md) | API reference (IndexedDB layer) |
| [COMPONENTS.md](./COMPONENTS.md) | UI components guide (shadcn/ui) |
| [TESTING.md](./TESTING.md) | Testing guide (Vitest + Playwright) |
| [SCRIPTS.md](./SCRIPTS.md) | npm scripts reference |

---

## 📚 Deprecated Documentation

These docs are **outdated** and reference the old Google Apps Script backend:

- ❌ ~~GAS_CICD_SETUP.md~~ - Removed
- ❌ ~~BACKEND_DEPLOYMENT_TROUBLESHOOTING.md~~ - Removed
- ❌ ~~DEPLOYMENT.md~~ - Removed (old GAS deployment)
- ❌ ~~RDP.md~~ - Removed
- ❌ ~~CHECKLIST.md~~ - Removed

**Current architecture:** IndexedDB (offline-first), no backend server.

---

## 🗄️ Database Architecture

### IndexedDB Schema

```
debs-pos-db/
├── products/       # Product catalog
├── orders/         # Transaction history
├── settings/       # App configuration
└── users/          # User authentication
```

See [DATABASE.md](./DATABASE.md) for detailed schema.

---

## 🎨 UI Components

### shadcn/ui Components

| Component | File | Usage |
|-----------|------|-------|
| Button | `components/ui/Button.jsx` | All buttons |
| Input | `components/ui/Input.jsx` | Form inputs |
| Card | `components/ui/Card.jsx` | Cards/containers |
| Dialog | `components/ui/Dialog.jsx` | Modals/popups |
| Toast | `components/ui/Toast.jsx` | Notifications |
| Badge | `components/ui/Badge.jsx` | Status indicators |
| ScrollArea | `components/ui/ScrollArea.jsx` | Scrollable areas |

See [COMPONENTS.md](./COMPONENTS.md) for usage examples.

---

## 📱 PWA Guide

### Installation

1. Open app in browser
2. Click install icon (desktop) or "Add to Home Screen" (mobile)
3. App installs as standalone PWA

### Offline Support

- ✅ Full offline functionality
- ✅ Data stored in IndexedDB
- ✅ Service worker caches assets
- ⚠️ Manual backup required

---

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# With coverage
npm run test -- --coverage
```

### Test Coverage

| Area | Tool | Status |
|------|------|--------|
| Unit | Vitest | ✅ Configured |
| E2E | Playwright | ✅ Configured |
| Components | Testing Library | ✅ Configured |

See [TESTING.md](./TESTING.md) for details.

---

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Dev server (http://localhost:5173)
npm run build        # Production build
npm run preview      # Preview build
npm run lint         # ESLint
npm run test         # Unit tests
npm run test:e2e     # E2E tests
npm run backup       # Backup data
```

### Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── pos/             # POS-specific
│   ├── inventory/       # Inventory-specific
│   └── analytics/       # Analytics-specific
├── pages/               # App pages
├── layouts/             # Layout wrappers
├── services/            # Database & API layer
├── hooks/               # React hooks
├── lib/                 # Utilities
└── utils/               # Helper functions
```

---

## 💾 Backup & Restore

### Backup

```javascript
import { backupData } from './services/indexeddb-api';

const backup = await backupData();
// Download as JSON file
```

### Restore

```javascript
import { restoreData } from './services/indexeddb-api';

const file = event.target.files[0];
const backup = JSON.parse(await file.text());
await restoreData(backup);
```

---

## ⚠️ Important Notes

### Trade-offs

| ✅ Advantages | ❌ Limitations |
|--------------|----------------|
| 100% offline | No sync between devices |
| Fast (no network) | Data lost on browser clear |
| Private (local) | Manual backup required |
| Free (no server) | Single device only |

### Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

---

## 📞 Support

### Troubleshooting

1. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
2. Review browser console for errors
3. Verify IndexedDB is enabled
4. Clear cache and retry

### Getting Help

1. Review documentation (this folder)
2. Check browser DevTools console
3. Create GitHub issue with details

---

## 📅 Last Updated

**Date:** 2026-02-25  
**Version:** 4.0.0 (IndexedDB)  
**Status:** Production Ready

---

## ✅ Source of Truth

This `docs/` folder is the **single source of truth** for:
- Database schema
- API reference
- Component documentation
- Testing guidelines
- Troubleshooting

**External docs:** Deprecated (GAS-related docs removed)

---

**Built with ❤️ for Deb's Kitchen**
