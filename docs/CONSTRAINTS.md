# Constraints & Anti-Patterns

Dokumen ini berisi **batasan, larangan, dan anti-patterns** yang TIDAK BOLEH diterapkan di Deb's POS Pro.

---

## 🚫 JANGAN DITERAPKAN (Hard Constraints)

### 1. **JANGAN Tambah Dependensi Berat Tanpa Persetujuan**

**Dilarang:**
- ❌ Menambah library > 100KB tanpa diskusi
- ❌ UI component libraries (Material-UI, Ant Design, Chakra)
- ❌ State management berat (Redux, MobX) untuk kasus sederhana

**Alasan:**
- Bundle size sudah 1.3MB
- Aplikasi harus tetap ringan dan cepat
- React + Tailwind sudah cukup untuk 95% use case

**Alternatif:**
- ✅ Gunakan utility functions sendiri
- ✅ Context API untuk shared state
- ✅ Custom hooks untuk logic reuse

---

### 2. **JANGAN Ubah Arsitektur Backend GAS**

**Dilarang:**
- ❌ Migrasi ke Node.js/Express tanpa persetujuan
- ❌ Ganti Google Sheets dengan database lain (MySQL, MongoDB)
- ❌ Tambah layer middleware yang kompleks

**Alasan:**
- GAS sudah berfungsi baik
- Google Sheets mudah di-manage oleh user non-teknis
- Zero server maintenance cost

**Alternatif jika perlu scale:**
- ✅ Optimize GAS code (query optimization)
- ✅ Tambah caching layer di frontend
- ✅ Archive old data ke spreadsheet terpisah

---

### 3. **JANGAN Tambah Fitur Yang Memperumit UX**

**Dilarang:**
- ❌ Multi-step checkout yang panjang
- ❌ Form dengan > 10 fields sekaligus
- ❌ Navigation > 3 level deep
- ❌ Modal bertumpuk (modal dalam modal)

**Alasan:**
- User adalah kasir yang butuh kecepatan
- Mobile-first design harus tetap simple
- One-hand operation untuk POS

**Prinsip:**
- ✅ Maksimal 2 klik untuk aksi umum
- ✅ Form maksimal 5 fields per screen
- ✅ Flat navigation structure

---

### 4. **JANGAN Gunakan Pattern Yang Merusak Performance**

**Dilarang:**
```jsx
// ❌ State update di render body
function Component() {
  const [count, setCount] = useState(0);
  setCount(count + 1); // INFINITE LOOP!
  return <div>{count}</div>;
}

// ❌ Object/function di dependency array tanpa memo
function Component({ data }) {
  useEffect(() => {
    // Ini akan trigger setiap render!
  }, [data]); // data adalah object reference baru
}

// ❌ Inline function di JSX tanpa useCallback
<button onClick={() => handleClick()} /> // New function setiap render
```

**Wajib:**
```jsx
// ✅ useEffect dengan cleanup
useEffect(() => {
  const timer = setInterval(...);
  return () => clearInterval(timer);
}, []);

// ✅ Memoize expensive calculations
const filtered = useMemo(() => {
  return data.filter(...);
}, [data, filter]);

// ✅ useCallback untuk event handlers
const handleClick = useCallback(() => {
  // logic
}, [dependencies]);
```

---

### 5. **JANGAN Hardcode Values**

**Dilarang:**
```javascript
// ❌ Hardcoded API URL
const API_URL = 'https://script.google.com/...';

// ❌ Hardcoded colors
className="bg-[#10b981]"

// ❌ Hardcoded text
<h1>Deb's Kitchen</h1>
```

**Wajib:**
```javascript
// ✅ Environment variables
const API_URL = import.meta.env.VITE_API_URL;

// ✅ Tailwind utility classes
className="bg-emerald-500"

// ✅ Config/constants
import { STORE_NAME } from '../config/store';
<h1>{STORE_NAME}</h1>
```

---

### 6. **JANGAN Skip Error Handling**

**Dilarang:**
```javascript
// ❌ Empty catch block
try {
  await fetchData();
} catch (e) {
  // Silent fail - user tidak tahu ada error
}

// ❌ Console.log saja
catch (e) {
  console.log(e); // User tidak dapat feedback
}
```

**Wajib:**
```javascript
// ✅ Proper error handling
try {
  await fetchData();
} catch (e) {
  console.error('API Error:', e);
  setToast({ msg: 'Gagal mengambil data', type: 'error' });
  // Optionally: report to monitoring service
}
```

---

### 7. **JANGAN Langsung Commit Tanpa Test**

**Dilarang:**
- ❌ Commit tanpa build (`npm run build`)
- ❌ Commit tanpa lint check (`npm run lint`)
- ❌ Commit besar (> 500 lines) tanpa code review

**Wajib:**
```bash
# Pre-commit checklist
npm run lint      # 0 errors
npm run build     # Success
npm test          # Pass
git diff          # Review changes
```

---

## ⚠️ WARNING Patterns (Hati-hati!)

### 1. **localStorage Overuse**

**Risk:**
- Storage limit 5-10MB
- Sync issues across tabs
- No reactive updates

**Guideline:**
- ✅ Cache max 1MB data
- ✅ Always have fallback if cache miss
- ✅ Clear cache on version change

---

### 2. **useEffect Tanpa Cleanup**

**Risk:**
- Memory leaks
- Multiple subscriptions
- Stale closures

**Guideline:**
```javascript
// Always cleanup
useEffect(() => {
  const subscription = ...;
  return () => subscription.unsubscribe();
}, []);
```

---

### 3. **Prop Drilling > 3 Level**

**Risk:**
- Hard to maintain
- Accidental prop changes

**Guideline:**
- Level 1-2: Props OK
- Level 3+: Consider Context
- Level 4+: Refactor component structure

---

### 4. **Async Operations Tanpa Loading State**

**Risk:**
- User tidak tahu proses berjalan
- Double submissions

**Guideline:**
```javascript
// Always show loading state
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  try {
    await apiCall();
  } finally {
    setLoading(false); // Always reset!
  }
};
```

---

## 🎯 Design Principles (Yang Harus Dipatuhi)

### 1. **Mobile-First**
- Semua fitur harus usable di layar 360px width
- Touch target minimal 44x44px
- No hover-only interactions

### 2. **Offline-First**
- Critical actions harus bisa di-queue offline
- Show clear offline indicator
- Auto-sync when back online

### 3. **Accessibility**
- Semantic HTML (button, not div onClick)
- ARIA labels untuk icon buttons
- Keyboard navigation support
- Color contrast WCAG AA

### 4. **Performance Budget**
- Initial load < 3s on 3G
- Time to Interactive < 5s
- Bundle size per chunk < 500KB

---

## 📋 Pre-Implementation Checklist

Sebelum implement fitur baru, jawab:

- [ ] Apakah fitur ini penting untuk core POS functionality?
- [ ] Apakah ada cara lebih simple untuk achieve hal yang sama?
- [ ] Bagaimana impact ke bundle size?
- [ ] Apakah tetap usable di mobile?
- [ ] Apakah perlu error handling khusus?
- [ ] Apakah perlu loading state?
- [ ] Apakah perlu test coverage?
- [ ] Apakah perlu dokumentasi?

**Jika 3+ jawaban "tidak" atau "tidak yakin" → DISKUSIKAN DULU**

---

## 🔧 Tech Stack Decisions (Final)

| Category | Choice | Alternatives Diterima? |
|----------|--------|------------------------|
| Framework | React 19 | ❌ No (sudah stabil) |
| Styling | Tailwind CSS | ❌ No (konsistensi) |
| Icons | Lucide React | ✅ Yes (jika lebih ringan) |
| Charts | Recharts | ✅ Yes (jika lebih kecil) |
| State | Context + useState | ❌ No Redux/MobX |
| Build | Vite | ❌ No (sudah optimal) |
| Backend | Google Apps Script | ❌ No (user requirement) |
| Database | Google Sheets | ❌ No (user requirement) |
| Testing | Vitest + Playwright | ✅ Yes (tools tambahan OK) |

---

## 📞 When In Doubt

Jika tidak yakin apakah sesuatu boleh diterapkan:

1. **Check dokumen ini**
2. **Check RDP.md** untuk roadmap
3. **Check CHECKLIST.md** untuk prioritas
4. **TANYA USER** sebelum implement

**Better to ask than to refactor later!**

---

## 📝 Revision History

| Date | Change | Reason |
|------|--------|--------|
| 2026-02-24 | Initial creation | Need clear constraints documentation |

---

**Dokumen ini WAJIB dibaca sebelum implementasi fitur baru.**
