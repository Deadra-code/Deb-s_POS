# Deployment Guide

Panduan lengkap deployment untuk Deb's POS Pro.

## Prerequisites

- Node.js v18+
- npm
- Google Account (untuk GAS backend)
- GitHub Account (untuk GitHub Pages hosting)

---

## Part 1: Backend Deployment (Google Apps Script)

### 1.1 Setup Google Sheets

1. Buat Google Sheet baru
2. Install Google Apps Script:
   - Extensions > Apps Script
   - Atau akses: https://script.google.com/

### 1.2 Deploy Backend Code

1. Buka [Google Apps Script](https://script.google.com/)
2. Buat project baru
3. Copy kode dari `backend/Code.js` ke editor GAS
4. Buat file `appsscript.json` dengan konten dari `backend/appsscript.json`

### 1.3 Setup Database

Jalankan fungsi `setupDatabase()` dari editor GAS untuk membuat sheet otomatis:
- Data_Menu
- Data_User
- Riwayat_Transaksi
- Settings

### 1.4 Deploy sebagai Web App

1. Klik **Deploy** > **New Deployment**
2. Pilih type: **Web App**
3. Configure:
   - **Description**: Deb's POS API v1
   - **Execute as**: USER_DEPLOYING
   - **Who has access**: ANYONE_ANONYMOUS
4. Klik **Deploy**
5. Salin **Web App URL** untuk digunakan di frontend

### 1.5 Update Clasp Config (Optional)

Jika menggunakan CLASP untuk deployment:

```bash
# Install CLASP globally
npm install -g @google/clasp

# Login
npm run clasp:login

# Setup project (jika belum)
clasp create --type sheets --title "Deb's POS Backend"

# Push changes
npm run deploy:backend
```

---

## Part 2: Frontend Deployment (GitHub Pages)

### 2.1 Environment Setup

1. Buat file `.env` di root project:

```env
VITE_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

2. Update `vite.config.js` jika perlu:
   - `base`: Sesuaikan dengan nama repository GitHub

### 2.2 Build & Deploy

```bash
# Install dependencies
npm install

# Build production
npm run build

# Preview build locally (optional)
npm run preview
```

### 2.3 GitHub Pages Setup

1. Buat repository GitHub baru (atau gunakan yang ada)
2. Push code ke repository:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/USERNAME/Deb-s_POS.git
git push -u origin main
```

3. GitHub Actions akan otomatis deploy (lihat `.github/workflows/deploy.yml`)

### 2.4 Configure GitHub Pages

1. Buka repository Settings > Pages
2. Source: **GitHub Actions**
3. Custom domain (optional): Setup domain custom jika ada

### 2.5 Verify Deployment

1. Tunggu workflow selesai (Actions tab)
2. Akses: `https://USERNAME.github.io/Deb-s_POS/`
3. Test login dengan passcode default: `admin123`

---

## Part 3: CI/CD Pipeline

### GitHub Actions Workflow

File: `.github/workflows/deploy.yml`

```yaml
# Trigger: Push ke branch main
# Build: npm run build
# Deploy: Upload dist/ ke GitHub Pages
```

### Manual Deploy

```bash
# Build
npm run build

# Verify dist/ folder
ls dist/

# Commit dan push untuk trigger auto-deploy
git add .
git commit -m "Deploy new version"
git push
```

---

## Part 4: PWA Installation

### Desktop (Chrome/Edge)

1. Buka aplikasi di browser
2. Klik icon **Install** di address bar
3. Aplikasi akan terinstall sebagai standalone app

### Mobile (Android)

1. Buka aplikasi di Chrome
2. Menu > **Add to Home Screen**
3. Aplikasi akan muncul di home screen

### Mobile (iOS)

1. Buka aplikasi di Safari
2. Tap **Share** button
3. **Add to Home Screen**

---

## Part 5: Post-Deployment Checklist

### Backend
- [ ] Database sheets terbuat semua
- [ ] Default user (admin/admin123) bisa login
- [ ] API endpoint bisa diakses
- [ ] CORS tidak bermasalah

### Frontend
- [ ] Build berhasil tanpa error
- [ ] Semua halaman bisa diakses
- [ ] API connection berhasil
- [ ] PWA manifest valid

### Security
- [ ] Ganti password default admin
- [ ] Batasi akses Web App (jika perlu)
- [ ] Backup database sheets

---

## Troubleshooting

### Build Error: `VITE_API_URL is undefined`
- Pastikan file `.env` ada di root
- Restart dev server setelah buat .env

### CORS Error
- Pastikan GAS deploy dengan **ANYONE_ANONYMOUS**
- Gunakan `Content-Type: text/plain` untuk POST

### GitHub Pages 404
- Cek `base` di `vite.config.js` sesuai nama repo
- Pastikan workflow deploy berhasil

### PWA Not Installing
- Pastikan served via HTTPS
- Cek manifest.json di DevTools > Application

---

## Rollback

### Frontend Rollback
```bash
# Checkout commit sebelumnya
git checkout <commit-hash>
git push -f origin main
```

### Backend Rollback
- GAS tidak ada version control built-in
- Simpan backup code di repository terpisah
- Gunakan CLASP untuk version control
