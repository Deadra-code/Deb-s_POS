# Troubleshooting Guide

Panduan troubleshooting untuk masalah umum di Deb's POS Pro v4 (IndexedDB).

---

## Table of Contents

1. [Database Issues](#database-issues)
2. [Login Issues](#login-issues)
3. [PWA Issues](#pwa-issues)
4. [Performance Issues](#performance-issues)
5. [Browser Compatibility](#browser-compatibility)
6. [Data Recovery](#data-recovery)

---

## Database Issues

### "Database not found" Error

**Symptoms:**
```
Error: Cannot open database 'debs-pos-db'
```

**Solutions:**

1. **Check IndexedDB support:**
```javascript
if (!window.indexedDB) {
  console.error('IndexedDB not supported');
}
```

2. **Reset database:**
```javascript
// In browser console
indexedDB.deleteDatabase('debs-pos-db');
location.reload();
```

3. **Re-seed data:**
```javascript
import { seedInitialData } from './services/database';
await seedInitialData();
```

---

### Data Disappeared

**Symptoms:**
- Products/orders missing after refresh
- Empty database

**Possible Causes:**
1. Browser cache cleared
2. Incognito/Private mode used
3. Different browser/device
4. Database corruption

**Solutions:**

1. **Check if data exists:**
```javascript
// In browser console
const request = indexedDB.open('debs-pos-db', 1);
request.onsuccess = () => {
  const db = request.result;
  const tx = db.transaction('products', 'readonly');
  const store = tx.objectStore('products');
  const countRequest = store.count();
  countRequest.onsuccess = () => {
    console.log('Product count:', countRequest.result);
  };
};
```

2. **Restore from backup:**
```javascript
import { restoreData } from './services/indexeddb-api';

const file = document.querySelector('input[type="file"]').files[0];
const text = await file.text();
const backup = JSON.parse(text);
await restoreData(backup);
```

3. **Prevent future loss:**
   - Regular backup (export to JSON)
   - Don't use incognito mode
   - Don't clear browser data

---

### "Cannot read property of undefined"

**Symptoms:**
```
TypeError: Cannot read property 'map' of undefined
```

**Solutions:**

1. **Add null checks:**
```jsx
// Before
{products.map(p => <ProductCard />)}

// After
{products?.map(p => <ProductCard />)}
```

2. **Initialize state:**
```jsx
const [products, setProducts] = useState([]);
```

---

## Login Issues

### "Passcode Salah"

**Symptoms:**
```
Passcode salah. Silakan coba lagi.
```

**Solutions:**

1. **Check default credentials:**
   - Username: `admin`
   - Passcode: `admin123`

2. **Verify user exists in database:**
```javascript
import { getUsers } from './services/indexeddb-api';

const users = await getUsers();
console.log(users);
// Should include: { username: 'admin', password: 'admin123' }
```

3. **Reset to default:**
```javascript
import { addUser, clearStore } from './services/database';

await clearStore('users');
await addUser({
  username: 'admin',
  password: 'admin123',
  role: 'Owner'
});
```

---

### Login Loop (Redirects back to login)

**Symptoms:**
- Login successful but redirects back immediately
- Token not persisting

**Solutions:**

1. **Check localStorage:**
```javascript
console.log(localStorage.getItem('POS_TOKEN'));
// Should be: 'admin'
```

2. **Clear and re-login:**
```javascript
localStorage.clear();
location.reload();
```

3. **Check browser settings:**
   - Ensure localStorage enabled
   - Disable private browsing
   - Allow cookies

---

## PWA Issues

### PWA Not Installable

**Symptoms:**
- Install prompt doesn't appear
- "Add to Home Screen" missing

**Solutions:**

1. **Check requirements:**
   - Must be served via HTTPS (production)
   - Valid manifest.json
   - Service worker registered

2. **Verify manifest:**
```javascript
// In browser DevTools
// Application > Manifest
// Check: name, icons, start_url
```

3. **Check service worker:**
```javascript
// In browser DevTools
// Application > Service Workers
// Should show: Activated and running
```

4. **Clear cache and retry:**
```javascript
// Clear all storage
// Application > Storage > Clear site data
```

---

### PWA Offline Not Working

**Symptoms:**
- App doesn't work without internet
- "Offline" page shows

**Solutions:**

1. **Verify service worker:**
   - Open DevTools > Application > Service Workers
   - Check status: "Activated"
   - Click "Update" if needed

2. **Check cache:**
   - DevTools > Application > Cache Storage
   - Should have cached assets

3. **Test offline mode:**
   - DevTools > Network > Offline checkbox
   - Reload page

---

## Performance Issues

### Slow Loading

**Symptoms:**
- App takes > 3 seconds to load
- Laggy interactions

**Solutions:**

1. **Check database size:**
```javascript
const products = await getProducts();
console.log('Product count:', products.length);
// If > 1000, consider archiving
```

2. **Clear old data:**
```javascript
// Archive old orders
const orders = await getOrders();
const oldOrders = orders.filter(o => 
  new Date(o.createdAt) < new Date('2025-01-01')
);
// Export then delete old orders
```

3. **Optimize queries:**
```javascript
// Use indexes
const makanan = await getByIndex('products', 'kategori', 'Makanan');
```

---

### Memory Leaks

**Symptoms:**
- Memory usage keeps increasing
- App slows down over time

**Solutions:**

1. **Check for missing cleanup:**
```jsx
useEffect(() => {
  const interval = setInterval(...);
  return () => clearInterval(interval); // Cleanup!
}, []);
```

2. **Remove event listeners:**
```jsx
useEffect(() => {
  const handler = () => {...};
  window.addEventListener('online', handler);
  return () => window.removeEventListener('online', handler);
}, []);
```

---

## Browser Compatibility

### Safari Issues

**Common Problems:**
- IndexedDB quota limits
- PWA installation issues

**Solutions:**
1. Use Chrome/Edge for best experience
2. Increase Safari storage quota
3. Clear Safari cache

---

### Firefox Issues

**Common Problems:**
- Service worker registration fails

**Solutions:**
1. Check `about:config` > `dom.serviceWorkers.enabled`
2. Clear Firefox cache
3. Update to latest Firefox

---

### Mobile Browser Issues

**Android (Chrome):**
- PWA works best
- Full IndexedDB support

**iOS (Safari):**
- Limited PWA features
- IndexedDB supported but quota limits
- Consider using Chrome iOS

---

## Data Recovery

### Export Data (Backup)

```javascript
import { backupData } from './services/indexeddb-api';

const backup = await backupData();
const blob = new Blob([JSON.stringify(backup, null, 2)], { 
  type: 'application/json' 
});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `backup-${new Date().toISOString()}.json`;
a.click();
```

### Import Data (Restore)

```javascript
import { restoreData } from './services/indexeddb-api';

const file = document.querySelector('input[type="file"]').files[0];
const text = await file.text();
const backup = JSON.parse(text);
await restoreData(backup);
```

### Manual Data Export (Browser Console)

```javascript
// Export all data manually
const data = {};
const db = await new Promise((resolve, reject) => {
  const request = indexedDB.open('debs-pos-db', 1);
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

for (const storeName of db.objectStoreNames) {
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  const request = store.getAll();
  await new Promise(resolve => {
    request.onsuccess = () => {
      data[storeName] = request.result;
      resolve();
    };
  });
}

console.log(JSON.stringify(data, null, 2));
```

---

## Debugging Tools

### Browser DevTools

**Chrome/Edge:**
```
F12 > Application > 
  - IndexedDB
  - Local Storage
  - Service Workers
  - Cache Storage
```

**Firefox:**
```
F12 > Storage > 
  - IndexedDB
  - Local Storage
```

**Safari:**
```
Develop > Show Web Inspector > Storage
```

### Useful Console Commands

```javascript
// Check database
const req = indexedDB.open('debs-pos-db', 1);
req.onsuccess = () => console.log('DB opened');
req.onerror = () => console.error('DB error:', req.error);

// Count records
const db = ...; // from above
const tx = db.transaction('products', 'readonly');
const store = tx.objectStore('products');
const count = store.count();
count.onsuccess = () => console.log('Products:', count.result);

// Clear all data
localStorage.clear();
indexedDB.deleteDatabase('debs-pos-db');
location.reload();
```

---

## Emergency Contacts

| Issue | Priority | Action |
|-------|----------|--------|
| Database corrupted | High | Restore from backup |
| Login broken | High | Reset users store |
| PWA not working | Medium | Clear cache, re-register SW |
| Data missing | High | Restore from backup |
| Slow performance | Medium | Clear old data |

---

## Getting Help

1. **Check documentation:**
   - [DATABASE.md](./DATABASE.md)
   - [API.md](./API.md)
   - [INDEX.md](./INDEX.md)

2. **Browser console:**
   - Check for errors
   - Copy error messages

3. **Create issue:**
   - Include browser version
   - Steps to reproduce
   - Console errors

---

**Last Updated:** 2026-02-25  
**Version:** 4.0.0
