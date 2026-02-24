# Backend Deployment Troubleshooting Guide

## ⚠️ Jika Backend Deployment Gagal

### Step 1: Check GitHub Secrets

Pastikan secrets sudah benar di:
https://github.com/Deadra-code/Deb-s_POS/settings/secrets/actions

**Required Secrets:**

1. **GAS_SCRIPT_ID**
   ```
   Value: 1cQm7WTE5VZdELD79WOPrBfyVsoXklJaOHR4dduC5HG9Fpt5JZHfuklpR
   ```

2. **GAS_SERVICE_ACCOUNT_KEY**
   ```
   Value: [SELURUH konten file debs-pos-deployment-0d1e4e083468.json]
   ```
   
   ⚠️ **PENTING**: Pastikan JSON valid!
   - Tidak ada whitespace tambahan di awal/akhir
   - Format harus persis seperti file JSON asli
   - Newlines harus tetap ada (JSON multi-line)

---

### Step 2: Verify Service Account Access

1. Buka Google Apps Script project Anda
2. Klik tombol **Share** (pojok kanan atas)
3. Pastikan email ini ada di share list dengan role **Editor**:
   ```
   github-deployer@debs-pos-deployment.iam.gserviceaccount.com
   ```

4. Jika belum ada, tambahkan:
   - Paste email: `github-deployer@debs-pos-deployment.iam.gserviceaccount.com`
   - Pilih role: **Editor**
   - **Uncheck** "Notify people"
   - Klik **Share**

---

### Step 3: Check Workflow Logs

1. Pergi ke: https://github.com/Deadra-code/Deb-s_POS/actions
2. Klik workflow **"Deploy Backend (GAS)"** yang failed
3. Klik pada job **"deploy"**
4. Expand setiap step untuk lihat detail error

**Common Errors & Solutions:**

#### Error: "Permission denied" atau "403 Forbidden"
**Cause:** Service account tidak punya access  
**Solution:** 
- Ulangi Step 2 di atas
- Pastikan role adalah **Editor**, bukan Viewer

#### Error: "Invalid credentials" atau "401 Unauthorized"
**Cause:** JSON key tidak valid  
**Solution:**
- Check format `GAS_SERVICE_ACCOUNT_KEY` di GitHub Secrets
- Copy ulang dari file `debs-pos-deployment-0d1e4e083468.json`
- Pastikan tidak ada karakter yang terhapus

#### Error: "Script not found" atau "404 Not Found"
**Cause:** Script ID salah  
**Solution:**
- Verify `GAS_SCRIPT_ID` di GitHub Secrets
- Check file `.clasp.json` di repository
- Pastikan Script ID benar: `1cQm7WTE5VZdELD79WOPrBfyVsoXklJaOHR4dduC5HG9Fpt5JZHfuklpR`

#### Error: "CLASP login failed"
**Cause:** Credential file corrupt  
**Solution:**
- Check step "Configure CLASP credentials"
- Pastikan JSON di secret valid
- Re-run workflow

---

### Step 4: Manual Test (Optional)

Test credentials secara lokal:

```bash
# Install CLASP globally
npm install -g @google/clasp

# Login dengan service account
mkdir -p ~/.clasprc
cp debs-pos-deployment-0d1e4e083468.json ~/.clasprc/.clasprc.json

# Login
clasp login --no-localhost

# Test push
clasp push
```

Jika berhasil, berarti credentials valid. Masalah ada di GitHub Actions configuration.

---

### Step 5: Re-run Workflow

Setelah fix issues:

1. Pergi ke: https://github.com/Deadra-code/Deb-s_POS/actions
2. Klik workflow yang failed
3. Klik **"Re-run jobs"** (tombol di pojok kanan atas)
4. Tunggu deployment selesai

---

## ✅ Expected Workflow Output

Jika berhasil, Anda akan lihat output seperti ini:

```
✓ Checkout code
✓ Setup Node.js 20
✓ Install dependencies
✓ Install CLASP globally
✓ CLASP credentials configured
✓ .clasp.json found
✓ CLASP login successful
✓ CLASP status check completed
Pushing code to GAS...
✓ Code pushed successfully
✓ Build completed
Creating new deployment...
✓ Deployment created
==========================================
✅ BACKEND DEPLOYMENT SUCCESSFUL
==========================================
Script ID: 1cQm7WTE5VZdELD79WOPrBfyVsoXklJaOHR4dduC5HG9Fpt5JZHfuklpR
Web App URL: https://script.google.com/macros/s/1cQm7WTE5VZdELD79WOPrBfyVsoXklJaOHR4dduC5HG9Fpt5JZHfuklpR/exec
Test URL: https://script.google.com/macros/s/1cQm7WTE5VZdELD79WOPrBfyVsoXklJaOHR4dduC5HG9Fpt5JZHfuklpR/exec?action=testIntegrity
==========================================
✓ Cleanup completed
```

---

## 🧪 Test Deployment

Setelah deployment sukses, test dengan:

### 1. Test Integrity Endpoint
```
https://script.google.com/macros/s/1cQm7WTE5VZdELD79WOPrBfyVsoXklJaOHR4dduC5HG9Fpt5JZHfuklpR/exec?action=testIntegrity
```

Expected response:
```json
{
  "ok": true,
  "issues": []
}
```

### 2. Test Login
```
POST https://script.google.com/macros/s/1cQm7WTE5VZdELD79WOPrBfyVsoXklJaOHR4dduC5HG9Fpt5JZHfuklpR/exec?action=login
Content-Type: text/plain

{
  "passcode": "admin123"
}
```

Expected response:
```json
{
  "success": true,
  "token": "...",
  "role": "Owner"
}
```

### 3. Test Frontend Connection
Buka: https://deadra-code.github.io/Deb-s_POS/

Login dan test transaksi POS.

---

## 📞 Still Having Issues?

### Collect Information

1. **Screenshot error** dari GitHub Actions logs
2. **Copy error message** lengkap
3. **Check timestamp** - pastikan looking at latest run

### Where to Get Help

1. **CLASP Documentation**: https://github.com/google/clasp
2. **GitHub Actions Docs**: https://docs.github.com/en/actions
3. **Google Apps Script API**: https://developers.google.com/apps-script/api

### Create Issue

Jika masih bermasalah, create issue dengan informasi:
- Workflow run URL
- Error message lengkap
- Step yang failed
- Sudah coba apa saja

---

## 🔒 Security Reminder

⚠️ **JANGAN PERNAH:**
- Commit file `debs-pos-deployment-*.json` ke repository
- Share service account key di public
- Post credentials di chat/email tanpa enkripsi

✅ **SELALU:**
- Gunakan GitHub Secrets untuk credentials
- Rotate credentials setiap 90 hari
- Monitor GitHub Actions logs regularly

---

**Last Updated:** 2026-02-24  
**Workflow Version:** deploy-gas.yml v2
