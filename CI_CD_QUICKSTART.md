# 🤖 Full CI/CD Automation - Quick Start

## ✅ Yang Sudah Dikonfigurasi

Aplikasi sekarang memiliki **full CI/CD automation**:

### Frontend (GitHub Pages)
- ✅ Otomatis deploy setiap push ke `main`
- ✅ Build otomatis dengan Vite
- ✅ PWA update otomatis

### Backend (Google Apps Script)
- ✅ Workflow siap digunakan
- ✅ Perlu setup Google Cloud credentials
- ✅ Otomatis deploy setiap perubahan di `backend/`

---

## 🚀 Setup dalam 5 Menit

### 1. Jalankan Setup Script
```bash
npm run setup:gascicd
```
Script ini akan memandu Anda dengan langkah-langkahnya.

### 2. Buat Service Account
Ikuti panduan di [`docs/GAS_CICD_SETUP.md`](./GAS_CICD_SETUP.md)

### 3. Add GitHub Secrets
Pergi ke: https://github.com/Deadra-code/Deb-s_POS/settings/secrets/actions

Tambahkan:
- `GAS_SCRIPT_ID` - Script ID dari .clasp.json
- `GAS_SERVICE_ACCOUNT_KEY` - JSON key dari service account

### 4. Test Deployment
```bash
git push origin main
```

Atau manual via GitHub Actions tab → "Deploy Backend (GAS)" → "Run workflow"

---

## 📊 Deployment Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    git push origin main                     │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          │                               │
          ▼                               ▼
┌─────────────────────┐       ┌─────────────────────┐
│  Frontend Deploy    │       │  Backend Deploy     │
│  (GitHub Pages)     │       │  (Google Apps Script)│
│                     │       │                     │
│  1. npm ci          │       │  1. clasp login     │
│  2. npm run build   │       │  2. clasp push      │
│  3. Upload to Pages │       │  3. clasp deploy    │
└─────────────────────┘       └─────────────────────┘
          │                               │
          └───────────────┬───────────────┘
                          ▼
              ┌───────────────────────┐
              │   Deployment Complete │
              │   Frontend + Backend  │
              └───────────────────────┘
```

---

## 🎯 Commands

| Command | Deskripsi |
|---------|-----------|
| `npm run setup:gascicd` | Interactive setup wizard |
| `npm run deploy:all` | Build frontend + deploy backend (manual) |
| `npm run deploy:backend` | Deploy backend saja (manual) |
| `npm run build` | Build frontend untuk production |

---

## 🔍 Monitoring

### GitHub Actions
https://github.com/Deadra-code/Deb-s_POS/actions

Lihat status deployment di sini.

### Deployment Logs
- Frontend: GitHub Pages deployment section
- Backend: GitHub Actions logs → "Deploy Backend (GAS)" workflow

---

## ⚠️ Troubleshooting

### Workflow tidak jalan?
1. Check **Actions** tab di GitHub
2. Pastikan secrets sudah ditambahkan
3. Check workflow file: `.github/workflows/deploy-gas.yml`

### Permission error?
1. Pastikan service account punya **Editor** access ke GAS
2. Check email service account benar
3. Regenerate JSON key jika perlu

### Build failed?
1. Check logs di GitHub Actions
2. Test build lokal: `npm run build`
3. Fix error dan push lagi

---

## 📖 Dokumentasi Lengkap

- **Setup Guide**: [`docs/GAS_CICD_SETUP.md`](./docs/GAS_CICD_SETUP.md)
- **Deployment Guide**: [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)
- **Scripts Reference**: [`docs/SCRIPTS.md`](./docs/SCRIPTS.md)

---

**Selamat! Deployment sekarang otomatis! 🎉**

Setiap `git push` akan deploy frontend + backend secara otomatis.
