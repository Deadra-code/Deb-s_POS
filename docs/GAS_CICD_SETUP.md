# Google Apps Script CI/CD Setup Guide

Panduan ini akan mengotomatisasi deployment backend ke Google Apps Script menggunakan GitHub Actions.

---

## 📋 Prerequisites

- Google Cloud Platform account
- Owner access ke Google Apps Script project
- Admin access ke GitHub repository

---

## 🔧 Step-by-Step Setup

### Step 1: Buat Google Cloud Project

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Klik **Create Project**
3. Nama project: `debs-pos-deployment`
4. Klik **Create**

---

### Step 2: Enable Google Apps Script API

1. Di Google Cloud Console, buka **APIs & Services** > **Library**
2. Search: "Google Apps Script API"
3. Klik **Enable**

---

### Step 3: Buat Service Account

1. Buka **APIs & Services** > **Credentials**
2. Klik **Create Credentials** > **Service Account**
3. Isi data:
   - **Service account name**: `github-deployer`
   - **Service account ID**: `github-deployer@debs-pos-deployment.iam.gserviceaccount.com`
   - **Description**: GitHub Actions deployment
4. Klik **Create and Continue**
5. Skip role assignment (optional)
6. Klik **Done**

---

### Step 4: Generate Service Account Key

1. Di halaman **Credentials**, klik service account yang baru dibuat
2. Pilih tab **Keys**
3. Klik **Add Key** > **Create new key**
4. Pilih **JSON** format
5. Klik **Create**
6. **Download file JSON** - ini akan digunakan di GitHub Secrets

⚠️ **PENTING**: Simpan file JSON ini dengan aman! Jangan commit ke repository!

---

### Step 5: Share Google Apps Script ke Service Account

1. Buka Google Apps Script project Anda
2. Klik tombol **Share** (pojok kanan atas)
3. Copy **service account email** dari Step 3:
   ```
   github-deployer@debs-pos-deployment.iam.gserviceaccount.com
   ```
4. Paste email di share dialog
5. Pilih permission: **Editor**
6. **Uncheck** "Notify people"
7. Klik **Share**

---

### Step 6: Setup GitHub Secrets

1. Buka repository GitHub: `https://github.com/Deadra-code/Deb-s_POS`
2. Pergi ke **Settings** > **Secrets and variables** > **Actions**
3. Klik **New repository secret**

#### Tambahkan secrets berikut:

**1. GAS_SCRIPT_ID**
```
Name: GAS_SCRIPT_ID
Value: 1cQm7WTE5VZdELD79WOPrBfyVsoXklJaOHR4dduC5HG9Fpt5JZHfuklpR
```

**2. GAS_SERVICE_ACCOUNT_KEY**
```
Name: GAS_SERVICE_ACCOUNT_KEY
Value: [Paste SELURUH konten file JSON dari Step 4]
```
Format JSON akan seperti ini:
```json
{
  "type": "service_account",
  "project_id": "debs-pos-deployment",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "github-deployer@debs-pos-deployment.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
}
```

**3. GAS_DEPLOYMENT_ID** (Optional - untuk update deployment existing)
```
Name: GAS_DEPLOYMENT_ID
Value: [Deployment ID dari Web App Anda]
```

---

### Step 7: Verifikasi Setup

Setelah semua secrets ditambahkan, GitHub Actions akan otomatis deploy setiap push ke `main`.

Untuk test manual:
1. Pergi ke **Actions** tab di GitHub
2. Pilih workflow **Deploy Backend (GAS)**
3. Klik **Run workflow**
4. Pilih branch `main`
5. Klik **Run workflow**

---

## 🔍 Troubleshooting

### Error: "Permission denied"
- Pastikan service account punya **Editor** access ke Apps Script
- Check email service account benar

### Error: "Invalid credentials"
- Pastikan JSON key valid (tidak ada whitespace tambahan)
- Regenerate key jika perlu

### Error: "Script not found"
- Check `GAS_SCRIPT_ID` benar
- Pastikan Anda owner dari script

---

## 📝 File Structure

```
.github/workflows/
└── deploy-gas.yml    # Workflow untuk deploy backend
```

---

## 🚀 Usage

### Automatic Deployment
Setiap push ke `main` akan trigger:
1. Frontend deploy ke GitHub Pages
2. Backend deploy ke Google Apps Script

### Manual Deployment
1. Pergi ke **Actions** tab
2. Pilih workflow **Deploy Backend (GAS)**
3. Klik **Run workflow**

---

## 🔒 Security Best Practices

1. **Jangan share** service account key
2. **Rotate credentials** setiap 90 hari
3. **Limit permissions** - service account hanya perlu Editor access
4. **Monitor logs** - check GitHub Actions logs regularly

---

## 📞 Support

Jika ada masalah:
1. Check [CLASP documentation](https://github.com/google/clasp)
2. Check [GitHub Actions logs](https://github.com/Deadra-code/Deb-s_POS/actions)
3. Review Google Cloud [IAM permissions](https://console.cloud.google.com/iam-admin/iam)

---

**Setup selesai!** 🎉

Sekarang setiap `git push` akan otomatis deploy frontend + backend.
