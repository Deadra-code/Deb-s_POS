# Troubleshooting Guide

Panduan troubleshooting untuk masalah umum di Deb's POS Pro.

---

## Table of Contents

1. [Build Issues](#build-issues)
2. [Runtime Errors](#runtime-errors)
3. [API Connection](#api-connection)
4. [Authentication](#authentication)
5. [Database Issues](#database-issues)
6. [PWA Issues](#pwa-issues)
7. [Performance Issues](#performance-issues)
8. [Browser Compatibility](#browser-compatibility)

---

## Build Issues

### Error: `VITE_API_URL is undefined`

**Symptoms:**
```
ReferenceError: VITE_API_URL is not defined
```

**Solutions:**
1. Pastikan file `.env` ada di root project
2. Verify isi `.env`:
   ```env
   VITE_API_URL=https://script.google.com/macros/s/YOUR_ID/exec
   ```
3. Restart dev server:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```
4. Clear Vite cache:
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

---

### Error: `Build failed with X errors`

**Symptoms:**
```
[vite:build] Build failed with 5 errors
```

**Solutions:**
1. Run build dengan detail output:
   ```bash
   npm run build -- --debug
   ```
2. Check untuk syntax errors di code
3. Verify semua dependencies terinstall:
   ```bash
   npm install
   ```
4. Clear dan reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

---

### Error: `Failed to resolve import`

**Symptoms:**
```
Failed to resolve import "./Component" from "src/pages/Page.jsx"
```

**Solutions:**
1. Check file path dan casing (case-sensitive!)
2. Verify file exists:
   ```bash
   ls src/pages/Component.jsx
   ```
3. Check export statement di source file
4. Clear Vite cache

---

## Runtime Errors

### Error: `Cannot read property of undefined`

**Symptoms:**
```
TypeError: Cannot read property 'map' of undefined
```

**Solutions:**
1. Add null checks:
   ```jsx
   // Before
   {items.map(item => ...)}
   
   // After
   {items?.map(item => ...)}
   ```
2. Initialize state dengan default values:
   ```jsx
   const [items, setItems] = useState([]);
   ```
3. Add loading states untuk async data

---

### Error: `Maximum update depth exceeded`

**Symptoms:**
```
Error: Maximum update depth exceeded.
```

**Solutions:**
1. Check untuk infinite loops di useEffect:
   ```jsx
   // Wrong - missing dependency array
   useEffect(() => {
     setState(value + 1);
   });
   
   // Correct
   useEffect(() => {
     setState(value + 1);
   }, [value]);
   ```
2. Avoid setState di render body
3. Use functional updates untuk state yang bergantung pada previous state

---

## API Connection

### Error: `Network Error` / `Failed to fetch`

**Symptoms:**
```
TypeError: Failed to fetch
```

**Solutions:**
1. Verify `VITE_API_URL` benar
2. Test URL di browser:
   ```
   https://script.google.com/macros/s/YOUR_ID/exec?action=testIntegrity
   ```
3. Check CORS settings di GAS deployment:
   - Deploy > **ANYONE_ANONYMOUS**
4. Verify internet connection
5. Check browser console untuk CORS errors

---

### Error: `401 Unauthorized`

**Symptoms:**
```json
{ "error": "Unauthorized" }
```

**Solutions:**
1. Verify user credentials di Data_User sheet
2. Check passcode case-sensitive
3. Reset password di Google Sheets:
   ```
   Data_User > Password column
   ```

---

### Error: `404 Not Found`

**Symptoms:**
```
404 Not Found
```

**Solutions:**
1. Verify GAS Web App deployed
2. Check URL typo di `.env`
3. Redeploy GAS Web App:
   - Deploy > Manage Deployments > Edit > New Version

---

## Authentication

### Login Gagal / "Passcode Salah"

**Symptoms:**
```
Passcode Salah!
```

**Solutions:**
1. Check Data_User sheet di Google Sheets
2. Verify passcode match (case-sensitive)
3. Default credentials:
   ```
   Username: admin
   Password: admin123
   ```
4. Run `setupDatabase()` di GAS untuk reset

---

### Session Timeout

**Symptoms:**
- Redirect ke login page unexpectedly

**Solutions:**
1. Check token expiration logic
2. Clear localStorage:
   ```javascript
   localStorage.clear();
   ```
3. Re-login dengan credentials valid

---

## Database Issues

### Missing Sheets

**Symptoms:**
```
Error: Missing Sheet: Data_Menu
```

**Solutions:**
1. Run `setupDatabase()` dari GAS editor
2. Manual create sheets:
   - Data_Menu
   - Data_User
   - Riwayat_Transaksi
   - Settings
3. Verify sheet names match exactly (case-sensitive)

---

### Missing Columns

**Symptoms:**
```
Error: Missing Column in Data_Menu: Varian
```

**Solutions:**
1. Add missing column header di Google Sheets
2. Run `setupDatabase()` untuk auto-fix
3. Manual add column di position yang benar

---

### Data Not Saving

**Symptoms:**
- Save berhasil tapi data tidak muncul di Sheets

**Solutions:**
1. Check GAS execution logs (View > Executions)
2. Verify quota tidak exceeded (6 min/request)
3. Check untuk conflicting locks
4. Review GAS code untuk errors

---

## PWA Issues

### PWA Not Installable

**Symptoms:**
- Install prompt tidak muncul

**Solutions:**
1. Verify served via HTTPS
2. Check manifest.json valid:
   ```bash
   npm run build
   # Check dist/manifest.json
   ```
3. Verify service worker registered:
   - DevTools > Application > Service Workers
4. Clear browser cache dan reload

---

### PWA Offline Not Working

**Symptoms:**
- App tidak bekerja offline

**Solutions:**
1. Check service worker registration
2. Verify cache strategy di `vite.config.js`
3. Test offline mode:
   - DevTools > Application > Service Workers > Offline
4. Check localStorage untuk queued orders

---

## Performance Issues

### Slow Loading

**Symptoms:**
- App loading > 3 seconds

**Solutions:**
1. Run performance audit:
   ```bash
   npm run audit:perf
   ```
2. Check network tab untuk slow API calls
3. Implement caching:
   ```javascript
   // Cache menu data
   localStorage.setItem('menu_cache', JSON.stringify(data));
   ```
4. Lazy load components:
   ```jsx
   const Analytics = lazy(() => import('./pages/Analytics'));
   ```

---

### Memory Leaks

**Symptoms:**
- Memory usage terus meningkat

**Solutions:**
1. Check untuk missing cleanup di useEffect:
   ```jsx
   useEffect(() => {
     const interval = setInterval(...);
     return () => clearInterval(interval);
   }, []);
   ```
2. Remove event listeners on unmount
3. Use DevTools Memory profiler

---

## Browser Compatibility

### Features Not Working di Safari

**Solutions:**
1. Check untuk ES6+ features yang tidak supported
2. Verify Babel config untuk Safari target
3. Test di Safari Technology Preview

---

### Mobile Layout Broken

**Solutions:**
1. Check viewport meta tag di `index.html`
2. Test responsive breakpoints:
   ```jsx
   // Tailwind breakpoints
   sm: 640px, md: 768px, lg: 1024px
   ```
3. Use DevTools device emulation

---

## Debugging Tools

### React DevTools

Install extension:
- Chrome: [React Developer Tools](https://chrome.google.com/webstore)
- Firefox: [React Developer Tools](https://addons.mozilla.org)

Features:
- Component tree inspection
- Props/state debugging
- Performance profiling

---

### Browser DevTools

**Console:**
```javascript
// Enable verbose logging
console.log('Debug:', data);
console.table(items);
```

**Network:**
- Monitor API requests
- Check response payloads
- Verify status codes

**Application:**
- Inspect localStorage
- Check service workers
- View manifest

---

## Getting Help

### Logs & Diagnostics

1. Collect browser console logs
2. Capture network requests
3. Note steps to reproduce
4. Include environment info:
   - Browser version
   - Node.js version
   - App version

### Useful Commands

```bash
# Full audit
npm run audit

# Check dependencies
npm audit

# Outdated packages
npm outdated

# Clean install
rm -rf node_modules && npm install
```

---

## Emergency Contacts

| Issue | Priority | Action |
|-------|----------|--------|
| Login broken | High | Check Data_User sheet |
| API down | High | Verify GAS deployment |
| Build fails | Medium | Check error logs |
| PWA issues | Low | Clear cache |
