# Scripts Documentation

Utility scripts untuk development dan maintenance.

## Available Scripts

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## Audit Scripts

### Smart Audit (Comprehensive)

```bash
npm run audit:smart
```
Audit cerdas untuk code quality dan best practices.

### Security Audit

```bash
npm run audit:sec
```
Memeriksa kerentanan keamanan dan dependency vulnerabilities.

### Performance Audit

```bash
npm run audit:perf
```
Analisis performa dan bottleneck potensial.

### Modularity Audit

```bash
npm run audit:mod
```
Memeriksa modularitas dan coupling code.

### Component Audit

```bash
npm run audit:comp
```
Audit komponen React untuk best practices.

### UI Audit

```bash
npm run audit:ui
```
Memeriksa konsistensi UI dan accessibility.

### Dependency Audit

```bash
npm run audit:deps
```
Cek outdated dan vulnerable dependencies.

---

## Full Audit

```bash
npm run audit
```

Menjalankan semua audit secara berurutan:
1. audit:smart
2. audit:sec
3. audit:perf
4. audit:mod
5. audit:comp
6. audit:ui
7. audit:deps

---

## Deployment Scripts

### CLASP Login

```bash
npm run clasp:login
```
Login ke Google Apps Script menggunakan CLASP.

### Sync API URL

```bash
npm run sync-api-url
```
Sinkronisasi API URL antara environment dan backend.

### Deploy Backend

```bash
npm run deploy:backend
```
Deploy code ke Google Apps Script menggunakan CLASP.

### Smart Deploy

```bash
npm run deploy:smart
```
Deployment cerdas dengan pre-deployment checks.

---

## Testing Scripts

### Unit Tests

```bash
npm run test
```
Jalankan unit tests dengan Vitest.

### E2E Tests

```bash
npm run test:e2e
```
Jalankan end-to-end tests dengan Playwright.

---

## Script Locations

```
scripts/
├── audit-components.cjs    # Component audit logic
├── audit-deps.cjs          # Dependency audit logic
├── audit-modularity.cjs    # Modularity audit logic
├── audit-perf.cjs          # Performance audit logic
├── audit-security.cjs      # Security audit logic
├── audit-smart.cjs         # Smart/comprehensive audit
├── audit-ui.cjs            # UI audit logic
├── deploy-smart.cjs        # Smart deployment logic
└── sync-api-url.cjs        # API URL sync logic
```

---

## Creating Custom Scripts

1. Buat file baru di `scripts/` folder
2. Gunakan `.cjs` extension untuk CommonJS
3. Tambahkan ke `package.json` scripts section

### Example

```javascript
// scripts/custom-audit.cjs
const fs = require('fs');
const path = require('path');

function customAudit() {
  console.log('Running custom audit...');
  // Audit logic here
}

customAudit();
```

```json
// package.json
{
  "scripts": {
    "audit:custom": "node scripts/custom-audit.cjs"
  }
}
```

---

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Configuration error |
| 3 | Network error |

---

## Environment Variables

Scripts mungkin memerlukan environment variables:

```env
VITE_API_URL=<gas_web_app_url>
```

Pastikan `.env` file sudah dikonfigurasi sebelum menjalankan scripts.
