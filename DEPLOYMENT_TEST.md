# Deployment Test Guide

## 🧪 Testing CI/CD Deployment

### Current Status

**Frontend:** ✅ Working (100% success rate)  
**Backend:** ⏳ Needs verification

### How to Monitor Deployment

#### 1. Check GitHub Actions

**URL:** https://github.com/Deadra-code/Deb-s_POS/actions

**What to look for:**
- Latest commit at the TOP of the list
- Two workflows running:
  - ✅ "Deploy static content to Pages" (Frontend)
  - 🔄 "Deploy Backend (GAS)" (Backend)

#### 2. Check Individual Workflow

**Frontend:**
```
https://github.com/Deadra-code/Deb-s_POS/actions/workflows/deploy.yml
```

**Backend:**
```
https://github.com/Deadra-code/Deb-s_POS/actions/workflows/deploy-gas.yml
```

#### 3. Refresh Strategy

If you see "SORRY, SOMETHING WENT WRONG":
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Wait 10 seconds
3. Refresh again
4. Try incognito/private mode

---

## ✅ Expected Successful Output

### Frontend Deployment
```
✓ Checkout (2s)
✓ Set up Node.js (3s)
✓ Install dependencies (15s)
✓ Build (20s)
✓ Setup Pages (2s)
✓ Upload artifact (1s)
✓ Deploy to GitHub Pages (5s)

✅ Success in ~45s
```

### Backend Deployment
```
✓ Checkout code (2s)
✓ Setup Node.js 20 (3s)
✓ Install dependencies (15s)
✓ Install CLASP globally (5s)
✓ Configure CLASP credentials (2s)
✓ Verify .clasp.json exists (1s)
✓ CLASP Login (3s)
✓ CLASP Status (5s)
✓ Push code to Google Apps Script (10s)
✓ Build project (5s)
✓ Create deployment (5s)
✓ Show deployment info (1s)
✓ Cleanup sensitive data (1s)

✅ Success in ~55s
```

---

## ❌ Common Failure Patterns

### Backend Deployment Fails at "CLASP Login"

**Error:** `Error: Invalid credentials`  
**Cause:** GitHub Secret format issue  
**Fix:**
1. Go to Settings → Secrets and variables → Actions
2. Edit `GAS_SERVICE_ACCOUNT_KEY`
3. Copy ENTIRE content from `debs-pos-deployment-0d1e4e083468.json`
4. Paste WITHOUT any modifications
5. Save

### Backend Deployment Fails at "Push code"

**Error:** `Error: Permission denied`  
**Cause:** Service account doesn't have Editor access  
**Fix:**
1. Open Google Apps Script
2. Click Share
3. Add: `github-deployer@debs-pos-deployment.iam.gserviceaccount.com`
4. Role: **Editor**
5. Save

### Backend Deployment Fails at "Verify .clasp.json"

**Error:** `.clasp.json not found!`  
**Cause:** File missing or path wrong  
**Fix:**
1. Check `.clasp.json` exists in repository root
2. Verify content:
   ```json
   {
     "scriptId": "1cQm7WTE5VZdELD79WOPrBfyVsoXklJaOHR4dduC5HG9Fpt5JZHfuklpR",
     "rootDir": "./backend"
   }
   ```

---

## 🔍 Manual Verification

### Test Backend API

After successful deployment, test:

```bash
# Test integrity
curl "https://script.google.com/macros/s/1cQm7WTE5VZdELD79WOPrBfyVsoXklJaOHR4dduC5HG9Fpt5JZHfuklpR/exec?action=testIntegrity"

# Expected response:
# {"ok": true, "issues": []}
```

### Test Frontend

```
https://deadra-code.github.io/Deb-s_POS/
```

1. Login dengan passcode: `admin123`
2. Navigate to POS
3. Test checkout flow

---

## 📊 Deployment History

### Check Recent Runs

```
https://github.com/Deadra-code/Deb-s_POS/actions

Filter by:
- Branch: main
- Status: Success (for working deployments)
- Status: Failure (for debugging)
```

### Deployment Frequency

Every push to `main` triggers:
- Frontend: Always
- Backend: Only if `backend/**` or `.clasp.json` changed

---

## 🎯 Success Criteria

Deployment is 100% successful when:

- [x] Frontend workflow completes with ✓
- [x] Backend workflow completes with ✓
- [x] Both show green checkmarks
- [x] Backend API responds to test endpoint
- [x] Frontend can connect to backend
- [x] No errors in logs

---

## 📞 Troubleshooting Commands

### Run Diagnostic
```bash
npm run fix:cicd
```

### Manual Deploy
```bash
# Install CLASP
npm install -g @google/clasp

# Login
clasp login --no-localhost

# Push & Deploy
clasp push
clasp deploy --description "Manual test"
```

### Check Logs
```bash
# View recent commits
git log --oneline -5

# Check remote
git remote -v

# Verify branch
git branch
```

---

## 🚀 Quick Test Sequence

```bash
# 1. Make small change
echo "// Test deployment" >> backend/Code.gs

# 2. Commit & push
git add .
git commit -m "test: Trigger deployment"
git push origin main

# 3. Monitor
# Open: https://github.com/Deadra-code/Deb-s_POS/actions

# 4. Wait ~2 minutes
# Both workflows should complete successfully
```

---

**Last Updated:** 2026-02-24  
**Test Commit:** 76facd2  
**Expected Result:** Both frontend & backend deploy successfully
