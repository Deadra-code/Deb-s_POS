# GitHub Pages Deployment Guide

## ✅ Deployment Configuration

Repository: **Deadra-code/Deb-s_POS**  
Branch: **main**  
Build Output: **dist/**  
Base Path: **/Deb-s_POS/**

---

## 🔧 Workflow Configuration

### File: `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ['main']
  workflow_dispatch:  # Manual trigger

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          CI: true

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4

      - name: Print deployment URL
        run: echo "Deployed to ${{ steps.deployment.outputs.page_url }}"
```

---

## 📋 Setup Checklist

### 1. Repository Settings

✅ **Repository:** `Deadra-code/Deb-s_POS`  
✅ **Branch:** `main`  
✅ **Build Command:** `npm run build`  
✅ **Output Directory:** `dist/`

### 2. GitHub Pages Settings

Buka: https://github.com/Deadra-code/Deb-s_POS/settings/pages

**Source:** Deploy from a branch  
**Branch:** `main`  
**Folder:** `/ (root)`

### 3. Workflow Permissions

Buka: https://github.com/Deadra-code/Deb-s_POS/settings/actions

**Workflow permissions:** Read and write permissions ✅

### 4. Vite Configuration

File: `vite.config.js`

```javascript
export default defineConfig({
  base: "/Deb-s_POS/",  // Must match repository name
  // ... other config
})
```

---

## 🚀 Deployment Process

### Automatic Deployment

Setiap push ke branch `main` akan otomatis trigger deployment:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Workflow akan otomatis:
1. Checkout code
2. Install dependencies
3. Build production
4. Upload ke GitHub Pages
5. Deploy

### Manual Deployment

1. Buka: https://github.com/Deadra-code/Deb-s_POS/actions/workflows/deploy.yml
2. Klik **"Run workflow"**
3. Pilih branch: `main`
4. Klik **"Run workflow"**

---

## 🔍 Monitoring Deployment

### Check Workflow Status

```
https://github.com/Deadra-code/Deb-s_POS/actions
```

### Check Latest Deployment

```
https://github.com/Deadra-code/Deb-s_POS/deployments
```

### Check Pages Settings

```
https://github.com/Deadra-code/Deb-s_POS/settings/pages
```

---

## 🌐 Access Application

### Production URL

```
https://deadra-code.github.io/Deb-s_POS/
```

### Login

```
Passcode: admin123
```

---

## ⚠️ Troubleshooting

### Issue: Workflow tidak run

**Solution:**
1. Cek workflow permissions di Settings > Actions
2. Pastikan "Read and write permissions" enabled
3. Re-run workflow manual

### Issue: Build failed

**Common causes:**
- `npm install` gagal → Cek package.json
- `npm run build` error → Cek vite.config.js
- Node version mismatch → Pastikan Node 20

**Solution:**
```bash
# Test build locally
npm ci
npm run build

# Check for errors
ls dist/  # Should have files
```

### Issue: 404 Not Found

**Causes:**
- Deployment belum selesai (tunggu 2-5 menit)
- Base path salah
- Cache browser

**Solution:**
```bash
# Clear browser cache
Ctrl+Shift+Delete

# Hard refresh
Ctrl+F5

# Check base path in vite.config.js
grep "base" vite.config.js
# Should be: base: "/Deb-s_POS/",
```

### Issue: Blank page / White screen

**Causes:**
- Base path tidak match dengan repo name
- Assets tidak ter-load

**Solution:**
1. Check browser console (F12)
2. Verify base path: `/Deb-s_POS/`
3. Check network tab for 404 errors

---

## 📊 Expected Workflow Output

```
✅ Checkout completed
✅ Setup Node.js 20
✅ Install dependencies (npm ci)
✅ Build completed (npm run build)
✅ Upload artifact (dist/)
✅ Deploy to GitHub Pages
✅ Deployment complete

🌐 URL: https://deadra-code.github.io/Deb-s_POS/
```

---

## 🎯 Verification Steps

Setelah deployment:

1. **Check URL:** https://deadra-code.github.io/Deb-s_POS/
2. **Login:** Passcode `admin123`
3. **Test navigation:** POS, Inventory, Analytics
4. **Test PWA:** Install prompt muncul
5. **Test offline:** Disconnect internet, app masih jalan

---

## 📝 Deployment History

| Date | Commit | Status | URL |
|------|--------|--------|-----|
| 2026-02-25 | eaa93bb | ⏳ Deploying | https://deadra-code.github.io/Deb-s_POS/ |

---

## 🔗 Useful Links

- **Workflow File:** `.github/workflows/deploy.yml`
- **Vite Config:** `vite.config.js`
- **Package.json:** `package.json`
- **Actions Tab:** https://github.com/Deadra-code/Deb-s_POS/actions
- **Pages Settings:** https://github.com/Deadra-code/Deb-s_POS/settings/pages

---

## ✅ Success Criteria

Deployment dianggap berhasil jika:

- ✅ Workflow status: **Success** (green checkmark)
- ✅ URL accessible: https://deadra-code.github.io/Deb-s_POS/
- ✅ Login works: Passcode `admin123`
- ✅ All pages load correctly
- ✅ PWA installable
- ✅ No console errors

---

**Last Updated:** 2026-02-25  
**Version:** 4.0.0  
**Status:** Automated Deployment Ready ✅
