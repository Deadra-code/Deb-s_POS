# Scripts Documentation

Utility scripts untuk development dan maintenance.

---

## Available Scripts

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Testing

```bash
# Run unit tests
npm run test

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test -- --coverage

# Run tests in watch mode
npm run test -- --watch
```

---

## Code Quality

```bash
# Run ESLint
npm run lint

# Fix ESLint errors
npm run lint -- --fix
```

---

## Maintenance

```bash
# Backup data (IndexedDB)
npm run backup
```

---

## Script Descriptions

### `npm run dev`

Start Vite development server with hot module replacement.

**Port:** 5173 (default)  
**URL:** http://localhost:5173

---

### `npm run build`

Build production bundle with Vite.

**Output:** `dist/` folder  
**Features:**
- Minification
- Code splitting
- Tree shaking
- PWA service worker generation

---

### `npm run preview`

Preview production build locally.

**Port:** 4173 (default)  
**URL:** http://localhost:4173

---

### `npm run test`

Run unit tests with Vitest.

**Features:**
- Fast execution
- Hot module replacement
- Coverage reports
- Watch mode

---

### `npm run test:e2e`

Run end-to-end tests with Playwright.

**Browsers:** Chromium, Firefox, WebKit  
**Reports:** `playwright-report/`

---

### `npm run lint`

Run ESLint for code quality.

**Config:** `eslint.config.js`  
**Fix:** `npm run lint -- --fix`

---

### `npm run backup`

Backup IndexedDB data to JSON file.

**Output:** `debs-pos-backup-YYYY-MM-DD.json`

---

## Custom Scripts

### Create Backup Script

```javascript
// scripts/backup.js
import { backupData } from '../src/services/indexeddb-api';

async function backup() {
  const data = await backupData();
  console.log('Backup completed:', data);
}

backup();
```

Add to package.json:
```json
{
  "scripts": {
    "backup:custom": "node scripts/backup.js"
  }
}
```

---

## Environment Variables

Scripts mungkin menggunakan environment variables dari `.env`:

```env
VITE_APP_NAME=Deb's POS Pro
VITE_APP_VERSION=4.0.0
```

Access in code:
```javascript
const appName = import.meta.env.VITE_APP_NAME;
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Configuration error |

---

## Troubleshooting

### "Port 5173 already in use"

```bash
# Kill process
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

### "Build failed"

```bash
# Clear cache
rm -rf node_modules/.vite
rm -rf dist

# Reinstall
npm install

# Rebuild
npm run build
```

### "Test failed"

```bash
# Clear test cache
rm -rf node_modules/.vite

# Run tests
npm run test
```

---

**Last Updated:** 2026-02-25  
**Version:** 4.0.0
