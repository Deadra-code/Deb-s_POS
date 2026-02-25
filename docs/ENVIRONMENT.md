# Environment Setup

Panduan setup environment untuk development dan production.

---

## Environment Variables

### Not Required (Offline-First)

Aplikasi ini **TIDAK** memerlukan environment variables karena berjalan 100% offline tanpa backend server.

### Optional Variables

```env
# App Configuration (Optional)
VITE_APP_NAME=Deb's POS Pro
VITE_APP_VERSION=4.0.0

# Feature Flags (Optional)
VITE_ENABLE_PWA=true
VITE_ENABLE_HAPTICS=true
```

---

## File Structure

```
project-root/
├── .env                  # Optional (not required)
├── .env.example          # Template
└── vite.config.js        # Vite configuration
```

---

## Setup Instructions

### 1. Clone Repository

```bash
git clone <repository-url>
cd debs-pos
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development

```bash
npm run dev
```

App akan berjalan di: **http://localhost:5173**

### 4. Login

```
Passcode: admin123
```

---

## Development Mode

### Start Dev Server

```bash
npm run dev
```

**Output:**
```
  VITE v7.2.5  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Hot Module Replacement

- Changes auto-reload
- State preserved for components
- Console shows updates

---

## Production Mode

### Build for Production

```bash
npm run build
```

**Output:**
```
✓ built in 3.84s
dist/
  index.html
  assets/
  sw.js (service worker)
```

### Preview Production Build

```bash
npm run preview
```

**Output:**
```
  ➜  Local:   http://localhost:4173/
```

---

## PWA Configuration

### Development

PWA works in development mode but requires HTTPS for some features.

```bash
npm run dev
# Open: http://localhost:5173
# Install prompt may not appear (expected)
```

### Production

PWA requires HTTPS (except localhost).

**Deployment options:**
1. **Vercel/Netlify:** Auto HTTPS
2. **GitHub Pages:** Auto HTTPS
3. **Custom server:** Configure SSL

---

## Browser Requirements

### Supported Browsers

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 90+ | ✅ Full |
| Edge | 90+ | ✅ Full |
| Firefox | 85+ | ✅ Full |
| Safari | 14+ | ⚠️ Limited |
| Chrome Android | 90+ | ✅ Full |
| Safari iOS | 14+ | ⚠️ Limited |

### Required Features

- IndexedDB
- LocalStorage
- Service Workers
- PWA (manifest.json)

---

## Development Tools

### VS Code Extensions (Recommended)

```
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
```

### Browser DevTools

**Chrome/Edge:**
```
F12 > 
  Console - Errors & logs
  Application - IndexedDB, Service Workers
  Network - Requests
  Components - React DevTools
```

**Install React DevTools:**
- Chrome: [React Developer Tools](https://chrome.google.com/webstore)
- Firefox: [React Developer Tools](https://addons.mozilla.org)

---

## Testing Environment

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test -- --coverage
```

---

## Deployment

### Option 1: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Option 2: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

### Option 3: GitHub Pages

```bash
# Update vite.config.js
base: "/your-repo-name/"

# Build & deploy
npm run build
# Push dist/ to gh-pages branch
```

### Option 4: Custom Server

```bash
# Build
npm run build

# Copy dist/ to web server
# Configure server to serve index.html for all routes
```

---

## Troubleshooting

### "VITE_API_URL is undefined"

**Not applicable** - App doesn't use API URL (offline-first).

### Build Fails

```bash
# Clear cache
rm -rf node_modules/.vite
rm -rf dist

# Reinstall
npm install

# Rebuild
npm run build
```

### Dev Server Won't Start

```bash
# Check port
lsof -i :5173

# Kill process
kill -9 <PID>

# Restart
npm run dev
```

### PWA Not Working

1. **Check HTTPS:**
   - Production must use HTTPS
   - localhost works with HTTP

2. **Clear cache:**
   - DevTools > Application > Clear storage

3. **Re-register service worker:**
   - DevTools > Application > Service Workers > Unregister
   - Reload page

---

## Configuration Files

### vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: "Deb's POS Pro",
        short_name: "Deb's POS",
        theme_color: "#10b981"
      }
    })
  ]
})
```

### tailwind.config.js

```javascript
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        // shadcn/ui theme
      }
    },
  },
  plugins: [],
}
```

---

## System Requirements

### Minimum

- Node.js v18+
- npm v8+
- 2GB RAM
- Modern browser with IndexedDB support

### Recommended

- Node.js v20+
- npm v10+
- 4GB RAM
- Chrome/Edge latest
- SSD for faster builds

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Build production |
| `npm run preview` | Preview build |
| `npm run lint` | ESLint |
| `npm run test` | Unit tests |
| `npm run test:e2e` | E2E tests |
| `npm run backup` | Backup data |

---

**Last Updated:** 2026-02-25  
**Version:** 4.0.0
