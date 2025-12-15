import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Activity, Archive, BarChart2, ChevronRight, LayoutGrid, Loader, LogOut, Minus, Plus, Search, Settings, ShoppingCart, Trash2, X, AlertCircle, CheckCircle, ChefHat, Utensils, UtensilsCrossed, Package, ShoppingBag, Pencil, RefreshCw } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import './App.css';

// URL BACKEND GOOGLE APPS SCRIPT
const API_URL = "https://script.google.com/macros/s/AKfycbzJqpegECiFzW8NkBo3qnvv7OcvoFiLH8HsRnHah1u6M7KkpMSrMwEauHX2L8md9rs9sg/exec";

// --- HELPER FUNCTION UNTUK FETCH DATA ---
const fetchData = async (action, method = 'GET', body = null) => {
  let url = `${API_URL}?action=${action}`;
  const options = {
    method: method,
  };

  if (method === 'POST') {
    // Trik GAS: Kirim data stringified via POST body
    // Gunakan text/plain untuk menghindari preflight CORS issues pada GAS
    return fetch(url, {
      method: "POST",
      body: JSON.stringify(body)
    }).then(res => res.json());
  }

  return fetch(url).then(res => res.json());
};

// --- KOMPONEN UI DASAR ---

// Icon Component Wrapper (Supaya kompatibel dengan style lama)
const Icon = ({ name, size = 20, className = "" }) => {
  // Convert kebab-case to PascalCase (e.g. chef-hat -> ChefHat)
  const pascalName = name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
  const LucideIcon = LucideIcons[pascalName] || LucideIcons.HelpCircle; // Fallback icon

  return <LucideIcon size={size} className={className} />;
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children, footer, size = "md" }) => {
  if (!isOpen) return null;
  const maxW = size === 'lg' ? 'max-w-4xl' : size === 'xl' ? 'max-w-6xl' : 'max-w-md';

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 text-black">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className={`bg-white w-full ${maxW} rounded-t-2xl md:rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300 md:zoom-in-95`} onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b flex justify-between items-center bg-white rounded-t-2xl shrink-0 sticky top-0 z-20">
          <h3 className="font-bold text-lg text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><Icon name="x" size={20} /></button>
        </div>
        <div className="p-5 overflow-y-auto custom-scroll flex-1">{children}</div>
        {footer && <div className="p-4 border-t bg-slate-50 md:rounded-b-2xl shrink-0 pb-safe">{footer}</div>}
      </div>
    </div>
  );
};

// Toast Notification
const Toast = ({ msg, type = 'success', onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return (
    <div className="fixed top-5 right-5 z-[120] animate-in slide-in-from-right fade-in duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${type === 'error' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
        <Icon name={type === 'error' ? 'alert-circle' : 'check-circle'} size={20} /> <span className="font-bold text-sm">{msg}</span>
      </div>
    </div>
  );
};

// Image Component
const ProductImage = ({ src, alt }) => {
  const [err, setErr] = useState(false);
  if (!src || err) return <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300"><Icon name="utensils-crossed" size={24} /></div>;
  return <img src={src} alt={alt} className="w-full h-full object-cover" onError={() => setErr(true)} loading="lazy" />;
};

// --- HALAMAN ---

// A. ANALYTICS
const Analytics = () => {
  const [data, setData] = useState({ transactions: [] });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('HARI_INI'); // HARI_INI, MINGGU_INI, BULAN_INI, TAHUN_INI
  const [ownerFilter, setOwnerFilter] = useState('ALL'); // ALL, Debby, Mama

  useEffect(() => {
    fetchData('getReport').then(res => {
      setData(res); setLoading(false);
    }).catch(e => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    if (!data.transactions || !data.transactions.length) return { revenue: 0, profit: 0, orders: 0, chartData: [], topItems: [] };

    let revenue = 0;
    let profit = 0;
    let filteredCount = 0;
    const dailyMap = {};
    const productCount = {};
    const currentDate = new Date();
    // --- HELPER DATE ---
    const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
    const getWeek = d => { const onejan = new Date(d.getFullYear(), 0, 1); return Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7); };

    // FILTER TRANSAKSI BERDASARKAN WAKTU
    const now = new Date();
    data.transactions.forEach(t => {
      const tDate = new Date(t.date); // yyyy-MM-dd
      let isValidTime = false;

      if (period === 'HARI_INI') isValidTime = isSameDay(tDate, now);
      else if (period === 'MINGGU_INI') isValidTime = getWeek(tDate) === getWeek(now) && tDate.getFullYear() === now.getFullYear();
      else if (period === 'BULAN_INI') isValidTime = tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      else if (period === 'TAHUN_INI') isValidTime = tDate.getFullYear() === now.getFullYear();
      else isValidTime = true; // Default All

      if (isValidTime && (t.status === 'Selesai' || t.status === 'Proses')) {
        // HITUNG TOTAL PER ITEM UNTUK AKURASI MILIK
        let trxRevenue = 0;
        let trxProfit = 0;
        let hasItems = false;

        if (t.items && Array.isArray(t.items)) {
          t.items.forEach(i => {
            // FILTER OWNER
            const itemOwner = i.milik || "Debby"; // Default old data to Debby
            if (ownerFilter === 'ALL' || itemOwner === ownerFilter) {
              hasItems = true;
              const itemRev = i.harga * i.qty;
              // Fallback modal ke i.modal (snapshot) jika ada, jika tidak pakai logic backend lama (estimasi) -> Disini kita pakai 0 jika data lama tidak ada modal snapshot, atau user harus relakan data lama kurang akurat profitnya.
              // Agar aman: Jika i.modal ada pakai itu. Jika tidak, coba cari di menuData global (tapi harga modal skrg mungkin beda).
              // Sederhananya: Kita pakai i.modal jika ada.
              const itemModal = i.modal || 0;
              const itemProf = itemRev - (itemModal * i.qty);

              trxRevenue += itemRev;
              trxProfit += itemProf;

              // Top Items
              productCount[i.nama] = (productCount[i.nama] || 0) + i.qty;
            }
          });
        }

        if (hasItems) {
          filteredCount++;
          revenue += trxRevenue;
          profit += trxProfit;

          // Chart Data Grouping
          // Group by Time Unit based on Filter
          let key = t.date; // Default YYYY-MM-DD
          if (period === 'TAHUN_INI') key = t.date.slice(0, 7); // YYYY-MM

          if (!dailyMap[key]) dailyMap[key] = { name: key, omzet: 0, profit: 0 };
          dailyMap[key].omzet += trxRevenue;
          dailyMap[key].profit += trxProfit;
        }
      }
    });

    const chartData = Object.values(dailyMap).sort((a, b) => a.name.localeCompare(b.name));
    const topItems = Object.entries(productCount)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return { revenue, profit, orders: filteredCount, chartData, topItems };
  }, [data, period, ownerFilter]);

  if (loading) return <div className="flex h-full items-center justify-center text-emerald-600"><Loader className="animate-spin" size={32} /></div>;

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-slate-50 pb-24 text-slate-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 text-sm">Analisa performa bisnis.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <select className="bg-white border border-slate-300 p-2 rounded-lg text-sm font-bold shadow-sm outline-none" value={period} onChange={e => setPeriod(e.target.value)}>
            <option value="HARI_INI">Hari Ini</option>
            <option value="MINGGU_INI">Minggu Ini</option>
            <option value="BULAN_INI">Bulan Ini</option>
            <option value="TAHUN_INI">Tahun Ini</option>
          </select>
          <select className="bg-white border border-slate-300 p-2 rounded-lg text-sm font-bold shadow-sm outline-none" value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)}>
            <option value="ALL">Semua Pemilik</option>
            <option value="Debby">Debby</option>
            <option value="Mama">Mama</option>
          </select>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-slate-400 text-xs font-bold uppercase mb-1">Total Omzet</div>
          <div className="text-2xl font-bold text-slate-800">Rp {(stats.revenue / 1000).toLocaleString()}k</div>
          <div className="text-emerald-500 text-xs font-bold mt-2 flex items-center gap-1"><Icon name="trending-up" size={14} /> Gross Revenue</div>
        </div>
        {/* ... KPI Cards lainnya ... */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-slate-400 text-xs font-bold uppercase mb-1">Profit Bersih</div>
          <div className="text-2xl font-bold text-emerald-600">Rp {(stats.profit / 1000).toLocaleString()}k</div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-slate-400 text-xs font-bold uppercase mb-1">Transaksi</div>
          <div className="text-2xl font-bold text-blue-600">{stats.orders}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-slate-400 text-xs font-bold uppercase mb-1">Rata-rata Order</div>
          <div className="text-2xl font-bold text-purple-600">Rp {stats.orders ? Math.round(stats.revenue / stats.orders).toLocaleString() : 0}</div>
        </div>
      </div>

      {/* CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-700 mb-6">Tren Penjualan & Profit</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                  <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                <Area type="monotone" dataKey="omzet" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" name="Omzet" />
                <Area type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorProf)" name="Profit" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Top Products */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-700 mb-6">Produk Terlaris</h3>
          <div className="space-y-4">
            {stats.topItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-700' : 'bg-orange-50 text-orange-700'}`}>#{i + 1}</div>
                  <div className="text-sm font-medium text-slate-700">{item.name}</div>
                </div>
                <div className="text-sm font-bold text-emerald-600">{item.qty} Sold</div>
              </div>
            ))}
            {stats.topItems.length === 0 && <div className="text-center text-slate-400 py-10">Belum ada data penjualan</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

// B. INVENTORY
const Inventory = ({ menu, refreshData }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ Nama_Menu: '', Kategori: 'Makanan', Harga: 0, Modal: 0, Stock: 0, Status: 'Tersedia', Foto_URL: '', Milik: 'Debby' });

  const handleAdd = () => {
    setEditData(null);
    setForm({ Nama_Menu: '', Kategori: 'Makanan', Harga: 0, Modal: 0, Stock: 0, Status: 'Tersedia', Foto_URL: '', Milik: 'Debby' });
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditData(item);
    setForm(item);
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    const rowIndex = editData ? editData._rowIndex : null;
    const payload = { ...form, isNew: !editData, _rowIndex: rowIndex };

    fetchData('saveProduct', 'POST', payload)
      .then(() => {
        setModalOpen(false); setLoading(false); refreshData();
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
        alert("Gagal menyimpan: " + err.message);
      });
  };

  const handleDelete = (item) => {
    if (confirm(`Hapus ${item.Nama_Menu}?`)) {
      setLoading(true);
      const payload = { rowIndex: item._rowIndex };
      fetchData('deleteProduct', 'POST', payload)
        .then(() => { setLoading(false); refreshData(); })
        .catch(err => {
          setLoading(false);
          alert("Gagal menghapus");
        });
    }
  };

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto pb-24 text-slate-800">
      {loading && <div className="fixed inset-0 z-[120] bg-white/50 flex items-center justify-center"><Loader className="animate-spin text-emerald-600" size={40} /></div>}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Inventory Management</h1>
        </div>
        <button onClick={handleAdd} className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold flex gap-2 shadow-lg hover:bg-emerald-700 active:scale-95 transition-transform"><Icon name="plus" size={20} /> Produk Baru</button>
      </div>

      {/* Responsive Layout: Mobile Cards & Desktop Table */}
      <div className="space-y-4">

        {/* MOBILE VIEW (Cards) */}
        <div className="md:hidden space-y-3">
          {menu.map((item, idx) => (
            <div key={item.ID || idx} className="bg-white p-3 rounded-xl shadow-md border border-slate-100 flex gap-3">
              <div className="w-20 h-20 rounded-lg bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                <ProductImage src={item.Foto_URL} alt={item.Nama_Menu} />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-gray-800 text-sm truncate pr-2 w-full">{item.Nama_Menu}</h3>
                  </div>
                  <div className="text-xs text-gray-500 mb-1">{item.Kategori}</div>
                </div>

                <div className="flex justify-between items-end mt-2">
                  <div>
                    <div className="text-[10px] uppercase text-gray-400 font-bold">Harga Jual</div>
                    <div className="font-bold text-emerald-600 text-sm">Rp {parseInt(item.Harga).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.Stock < 5 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{item.Stock} Unit</span>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(item)} className="p-1.5 bg-blue-50 rounded-md text-blue-600"><Icon name="pencil" size={14} /></button>
                      <button onClick={() => handleDelete(item)} className="p-1.5 bg-red-50 rounded-md text-red-600"><Icon name="trash-2" size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DESKTOP VIEW (Table) */}
        <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs">
                <tr>
                  <th className="p-4">Produk</th>
                  <th className="p-4">Harga Jual</th>
                  <th className="p-4">Modal</th>
                  <th className="p-4">Profit</th>
                  <th className="p-4">Stok</th>
                  <th className="p-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {menu.map((item, idx) => (
                  <tr key={item.ID || idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 overflow-hidden shrink-0 border border-slate-100">
                        <ProductImage src={item.Foto_URL} alt={item.Nama_Menu} />
                      </div>
                      <span className="font-bold text-slate-800">{item.Nama_Menu}</span>
                    </td>
                    <td className="p-4">Rp {parseInt(item.Harga).toLocaleString()}</td>
                    <td className="p-4 text-slate-500">Rp {parseInt(item.Modal).toLocaleString()}</td>
                    <td className="p-4 font-bold text-emerald-600">+Rp {(parseInt(item.Harga) - parseInt(item.Modal)).toLocaleString()}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${item.Stock < 5 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>{item.Stock}</span></td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(item)} className="p-2 hover:bg-slate-100 rounded-lg text-blue-600"><Icon name="pencil" size={16} /></button>
                        <button onClick={() => handleDelete(item)} className="p-2 hover:bg-red-50 rounded-lg text-red-600"><Icon name="trash-2" size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editData ? "Edit Produk" : "Produk Baru"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="text-xs font-bold uppercase text-slate-500">Nama Produk</label><input required className="w-full border p-2.5 rounded-lg bg-white" value={form.Nama_Menu} onChange={e => setForm({ ...form, Nama_Menu: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-bold uppercase text-emerald-700">Harga Jual</label><input type="number" required className="w-full border border-emerald-200 bg-emerald-50 p-2.5 rounded-lg" value={form.Harga} onChange={e => setForm({ ...form, Harga: e.target.value })} /></div>
            <div><label className="text-xs font-bold uppercase text-slate-500">Modal</label><input type="number" required className="w-full border p-2.5 rounded-lg bg-slate-50" value={form.Modal} onChange={e => setForm({ ...form, Modal: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-bold uppercase text-slate-500">Stok</label><input type="number" required className="w-full border p-2.5 rounded-lg bg-white" value={form.Stock} onChange={e => setForm({ ...form, Stock: e.target.value })} /></div>
            <div><label className="text-xs font-bold uppercase text-slate-500">Kategori</label><select className="w-full border p-2.5 rounded-lg bg-white" value={form.Kategori} onChange={e => setForm({ ...form, Kategori: e.target.value })}><option>Makanan</option><option>Minuman</option><option>Cemilan</option></select></div>
          </div>
          <div><label className="text-xs font-bold uppercase text-slate-500">Milik</label><select className="w-full border p-2.5 rounded-lg bg-white" value={form.Milik || 'Debby'} onChange={e => setForm({ ...form, Milik: e.target.value })}><option>Debby</option><option>Mama</option></select></div>
          <div><label className="text-xs font-bold uppercase text-slate-500">Foto URL</label><input className="w-full border p-2.5 rounded-lg bg-white" value={form.Foto_URL} onChange={e => setForm({ ...form, Foto_URL: e.target.value })} /></div>
          <button className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold shadow-lg hover:bg-emerald-700">Simpan Data</button>
        </form>
      </Modal>
    </div >
  );
};

// C. POS
const POS = ({ menu, refreshData }) => {
  const [cart, setCart] = useState([]);
  const [cat, setCat] = useState('All');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('Dine In');
  const [toast, setToast] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payMethod, setPayMethod] = useState('Tunai');

  const addToCart = useCallback((item) => {
    if (item.Status === 'Habis' || item.Stock <= 0) return setToast({ msg: 'Stok Habis!', type: 'error' });
    setCart(p => {
      const ex = p.find(i => i.ID === item.ID);
      if (ex && ex.qty >= item.Stock) { setToast({ msg: 'Stok Max!', type: 'error' }); return p; }
      return ex ? p.map(i => i.ID === item.ID ? { ...i, qty: i.qty + 1 } : i) : [...p, { ...item, qty: 1 }];
    });
    setToast({ msg: `+1 ${item.Nama_Menu}` });
  }, []);

  const updateQty = (id, d) => setCart(p => p.map(i => i.ID === id ? { ...i, qty: Math.max(0, i.qty + d) } : i).filter(i => i.qty > 0));
  const total = cart.reduce((a, b) => a + (b.Harga * b.qty), 0);

  const handleCheckout = () => {
    setLoading(true);
    const payload = {
      cart: cart.map(i => ({ nama: i.Nama_Menu, qty: i.qty, harga: i.Harga, modal: i.Modal, milik: i.Milik || "Debby" })),
      total,
      type: tab,
      paymentMethod: payMethod,
      taxVal: 0, serviceVal: 0
    };

    fetchData('saveOrder', 'POST', payload)
      .then(() => {
        setCart([]); setCartOpen(false); setCheckoutOpen(false); setLoading(false);
        setToast({ msg: "Transaksi Berhasil!" }); refreshData();
      })
      .catch(err => {
        setLoading(false);
        alert("Transaksi Gagal: " + err);
      });
  };

  const filtered = useMemo(() => menu.filter(i => (cat === 'All' || i.Kategori === cat) && i.Nama_Menu.toLowerCase().includes(search.toLowerCase())), [menu, cat, search]);

  return (
    <div className="flex flex-col md:flex-row h-full bg-[#F8FAFC]">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Product Grid (Left) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="p-4 bg-white border-b sticky top-0 z-10 space-y-3">
          <div className="relative">
            <Icon name="search" className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input className="w-full bg-slate-50 border-none pl-10 py-2 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800" placeholder="Cari..." value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 text-slate-400"><Icon name="x-circle" size={18} /></button>}
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {['All', 'Makanan', 'Minuman', 'Cemilan'].map(c => <button key={c} onClick={() => setCat(c)} className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-colors ${cat === c ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}>{c}</button>)}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-24 md:pb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(item => (
              <div key={item.ID} onClick={() => addToCart(item)} className={`bg-white p-3 rounded-2xl border border-slate-100 shadow-sm relative group cursor-pointer active:scale-95 transition-transform ${item.Stock <= 0 ? 'grayscale opacity-60' : ''}`}>
                <div className="h-28 bg-slate-100 rounded-xl mb-3 overflow-hidden relative">
                  <ProductImage src={item.Foto_URL} alt={item.Nama_Menu} />
                  {item.Stock <= 0 ? <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xs backdrop-blur-sm">HABIS</div>
                    : item.Stock < 5 && <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm animate-pulse">Sisa {item.Stock}</div>}
                </div>
                <div className="font-bold text-slate-800 text-sm leading-tight mb-1 line-clamp-2">{item.Nama_Menu}</div>
                <div className="flex justify-between items-end">
                  <span className="font-bold text-emerald-600 text-sm">{(parseInt(item.Harga) / 1000)}k</span>
                  <div className="w-7 h-7 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors"><Icon name="plus" size={16} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Cart (Right) */}
      <div className="hidden md:flex w-[350px] bg-white border-l flex-col h-full shadow-xl z-20 text-slate-800">
        <div className="p-5 border-b flex justify-between items-center bg-white sticky top-0">
          <h2 className="font-bold text-lg flex gap-2 items-center"><Icon name="shopping-bag" /> Pesanan</h2>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {['Dine In', 'Takeaway'].map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${tab === t ? 'bg-white shadow text-emerald-600' : 'text-slate-400'}`}>{t}</button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 && <div className="text-center text-slate-400 py-10 flex flex-col items-center"><Icon name="shopping-cart" size={32} className="mb-2 opacity-50" /><p className="text-sm">Keranjang Kosong</p></div>}
          {cart.map(item => (
            <div key={item.ID} className="flex justify-between items-center group border-b border-slate-50 pb-3 last:border-0">
              <div><div className="font-bold text-sm">{item.Nama_Menu}</div><div className="text-xs text-slate-400">Rp {parseInt(item.Harga).toLocaleString()}</div></div>
              <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg">
                <button onClick={() => updateQty(item.ID, -1)} className="w-6 h-6 bg-white rounded flex items-center justify-center shadow-sm text-slate-500"><Icon name="minus" size={12} /></button>
                <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                <button onClick={() => updateQty(item.ID, 1)} className="w-6 h-6 bg-white rounded flex items-center justify-center shadow-sm text-emerald-600"><Icon name="plus" size={12} /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-5 bg-slate-50 border-t space-y-2">
          <div className="flex justify-between font-bold text-lg pt-2"><span>Total</span><span>Rp {total.toLocaleString()}</span></div>
          <button onClick={() => setCheckoutOpen(true)} disabled={!cart.length} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-emerald-700 disabled:opacity-50 transition-all active:scale-95">Bayar</button>
        </div>
      </div>

      {/* Mobile Cart Button */}
      {cart.length > 0 && (
        <div className="md:hidden fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom">
          <button onClick={() => setCartOpen(true)} className="w-full bg-emerald-600 text-white py-3 rounded-xl shadow-xl font-bold flex justify-between px-6 items-center active:scale-95 transition-transform">
            <div className="flex items-center gap-2"><span className="bg-white/20 px-2 py-0.5 rounded text-xs">{cart.length} Item</span></div>
            <span>Rp {total.toLocaleString()}</span>
          </button>
        </div>
      )}

      {/* Mobile Cart Sheet */}
      <Modal isOpen={cartOpen} onClose={() => setCartOpen(false)} title="Rincian Pesanan" footer={<button onClick={() => { setCartOpen(false); setCheckoutOpen(true); }} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold">Lanjut Bayar</button>}>
        <div className="space-y-4 text-slate-800">
          {cart.map(item => (
            <div key={item.ID} className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-0">
              <div><div className="font-bold text-slate-800">{item.Nama_Menu}</div><div className="text-xs text-slate-500">Rp {parseInt(item.Harga).toLocaleString()}</div></div>
              <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-lg">
                <button onClick={() => updateQty(item.ID, -1)}><Icon name="minus" size={16} className="text-slate-500" /></button>
                <span className="font-bold w-4 text-center">{item.qty}</span>
                <button onClick={() => updateQty(item.ID, 1)}><Icon name="plus" size={16} className="text-emerald-600" /></button>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      {/* CHECKOUT MODAL */}
      <Modal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} title="Konfirmasi Pembayaran">
        <div className="text-center py-4 text-slate-800">
          <div className="text-slate-500 mb-1 text-sm">Total Tagihan</div>
          <div className="text-4xl font-bold text-slate-800 mb-6">Rp {total.toLocaleString()}</div>

          <div className="text-left mb-4">
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Pilih Metode Pembayaran</label>
            <div className="grid grid-cols-3 gap-2">
              {['Tunai', 'QRIS', 'Dana'].map(m => (
                <button key={m} onClick={() => setPayMethod(m)} className={`py-3 rounded-xl border font-bold text-sm transition-all ${payMethod === m ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{m}</button>
              ))}
            </div>
          </div>
          <button onClick={handleCheckout} disabled={loading} className="w-full py-3.5 rounded-xl font-bold text-white bg-emerald-600 shadow-lg hover:bg-emerald-700 flex justify-center gap-2 mt-4 active:scale-95 transition-transform">
            {loading ? <Loader className="animate-spin" /> : `Bayar via ${payMethod}`}
          </button>
        </div>
      </Modal>
    </div>
  );
};

// D. KITCHEN
const Kitchen = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = () => {
    fetchData('getOrders').then(res => {
      const safe = res || [];
      const parsed = safe.map(o => {
        try {
          return { ...o, items: typeof o.Items_JSON === 'string' ? JSON.parse(o.Items_JSON) : o.Items_JSON || [] };
        } catch (e) {
          console.error("Error parsing kitchen items", e);
          return { ...o, items: [] };
        }
      }).filter(o => o.status !== 'Selesai' && o.Status !== 'Selesai');
      setOrders(parsed);
    });
  };

  useEffect(() => { fetchOrders(); const t = setInterval(fetchOrders, 15000); return () => clearInterval(t); }, []);

  const done = (id) => {
    setOrders(p => p.filter(o => o.ID_Order !== id));
    const payload = { id, status: 'Selesai' };
    fetchData('updateOrderStatus', 'POST', payload);
  };

  return (
    <div className="min-h-screen bg-[#1F2937] p-4 pb-24 text-white font-sans h-full overflow-y-auto w-full">
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#1F2937] z-10 py-2">
        <h1 className="text-xl font-bold flex items-center gap-3"><span className="bg-emerald-500 p-2 rounded-lg text-white"><Icon name="chef-hat" size={20} /></span> Kitchen Monitor</h1>
        <button onClick={fetchOrders} className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"><Icon name="refresh-cw" size={20} /></button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {orders.length === 0 && <div className="col-span-full flex flex-col items-center justify-center py-32 opacity-50 text-slate-400"><Icon name="coffee" size={64} className="mb-4" /><p>Semua pesanan selesai!</p></div>}
        {orders.map(o => (
          <div key={o.ID_Order} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 flex flex-col shadow-lg animate-in zoom-in-95 duration-300">
            <div className={`p-4 flex justify-between items-center ${o.Tipe_Order === 'Dine In' ? 'bg-emerald-900/30 text-emerald-400 border-b border-emerald-900/50' : 'bg-blue-900/30 text-blue-400 border-b border-blue-900/50'}`}>
              <div><div className="font-bold text-lg">#{o.ID_Order.slice(-4)}</div><div className="text-[10px] uppercase font-bold tracking-wider">{o.Tipe_Order}</div></div>
              <div className="font-mono text-lg font-bold">{o.Jam}</div>
            </div>
            <div className="p-4 flex-1 space-y-3">
              {o.items.map((i, idx) => (<div key={idx} className="flex gap-3 text-sm items-start"><span className="bg-slate-700 text-white w-6 h-6 flex items-center justify-center rounded font-bold shrink-0">{i.qty}</span> <span className="text-slate-300 pt-0.5 font-medium">{i.nama}</span></div>))}
            </div>
            <div className="p-3 bg-slate-900/30 border-t border-slate-700"><button onClick={() => done(o.ID_Order)} className="w-full py-2.5 bg-slate-700 hover:bg-emerald-600 hover:text-white rounded-lg font-bold text-sm transition-all text-slate-400 flex items-center justify-center gap-2 group"><Icon name="check" size={16} className="group-hover:scale-125 transition-transform" /> Selesai Masak</button></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// F. LOGIN PAGE
const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = { username, password };
    fetchData('login', 'POST', payload).then(res => {
      setLoading(false);
      if (res.success) {
        onLogin(res.token);
      } else {
        setError(res.error || "Login Gagal");
      }
    }).catch(err => {
      setLoading(false);
      setError("Gagal menghubungi server");
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-emerald-200">
            <Icon name="utensils" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Deb's POS Pro</h1>
          <p className="text-slate-400 text-sm">Silakan login untuk melanjutkan</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-bold border border-red-100">{error}</div>}

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Username</label>
            <input type="text" required className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Password</label>
            <input type="password" required className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
          </div>

          <button disabled={loading} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? <Loader className="animate-spin mx-auto" /> : "Masuk Aplikasi"}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-slate-300">
          &copy; 2025 Deb's Manager System
        </div>
      </div>
    </div>
  );
};

// E. SETTINGS
const SettingsModal = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) fetchData('getSettings').then(setConfig);
  }, [isOpen]);

  const save = () => {
    setLoading(true);
    fetchData('saveSettings', 'POST', config).then(() => {
      setLoading(false); onClose(); alert("Disimpan!");
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pengaturan Toko" footer={<button onClick={save} disabled={loading} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</button>}>
      <div className="space-y-4 text-slate-800">
        <div><label className="text-xs font-bold uppercase text-slate-500">Nama Toko</label><input className="w-full border p-2 rounded-lg bg-white" value={config.Store_Name || ''} onChange={e => setConfig({ ...config, Store_Name: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="text-xs font-bold uppercase text-slate-500">Pajak (%)</label><input type="number" className="w-full border p-2 rounded-lg bg-white" value={config.Tax_Rate || ''} onChange={e => setConfig({ ...config, Tax_Rate: e.target.value })} /></div>
          <div><label className="text-xs font-bold uppercase text-slate-500">Service (%)</label><input type="number" className="w-full border p-2 rounded-lg bg-white" value={config.Service_Charge || ''} onChange={e => setConfig({ ...config, Service_Charge: e.target.value })} /></div>
        </div>
      </div>
    </Modal>
  );
};

// G. ORDER HISTORY
const OrderHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    setLoading(true);
    fetchData('getReport').then(res => {
      setTransactions(res.transactions || []);
      setLoading(false);
    }).catch(e => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const targetDate = new Date(filterDate);
    const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

    let revenue = { Debby: 0, Mama: 0, Total: 0 };
    let profit = { Debby: 0, Mama: 0, Total: 0 };
    const filteredTrx = [];

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      if (isSameDay(tDate, targetDate) && (t.status === 'Selesai' || t.status === 'Proses')) {
        filteredTrx.push(t);
        if (t.items && Array.isArray(t.items)) {
          t.items.forEach(i => {
            const owner = i.milik || "Debby";
            const rev = i.harga * i.qty;
            const prof = rev - ((i.modal || 0) * i.qty);

            if (revenue[owner] !== undefined) {
              revenue[owner] += rev;
              profit[owner] += prof;
            }
            revenue.Total += rev;
            profit.Total += prof;
          });
        }
      }
    });

    return { revenue, profit, list: filteredTrx.sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date)) };
  }, [transactions, filterDate]);

  return (
    <div className="p-4 md:p-8 h-full overflow-y-auto bg-slate-50 pb-24 text-slate-800">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Riwayat Pesanan</h1>
          <p className="text-slate-500 text-sm">Rekap transaksi & bagi hasil.</p>
        </div>
        <input type="date" className="bg-white border p-2 rounded-lg font-bold text-slate-700 shadow-sm" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
      </div>

      {/* REVENUE SHARE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-slate-400 text-xs font-bold uppercase mb-1">Milik Debby</div>
            <div className="text-2xl font-bold text-emerald-600">Rp {(stats.profit.Debby / 1000).toLocaleString()}k</div>
            <div className="text-xs text-slate-400 mt-1">Omzet: Rp {(stats.revenue.Debby / 1000).toLocaleString()}k</div>
          </div>
          <Icon name="user" className="absolute right-[-10px] bottom-[-10px] text-emerald-50 w-24 h-24" />
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="relative z-10">
            <div className="text-slate-400 text-xs font-bold uppercase mb-1">Milik Mama</div>
            <div className="text-2xl font-bold text-blue-600">Rp {(stats.profit.Mama / 1000).toLocaleString()}k</div>
            <div className="text-xs text-slate-400 mt-1">Omzet: Rp {(stats.revenue.Mama / 1000).toLocaleString()}k</div>
          </div>
          <Icon name="heart" className="absolute right-[-10px] bottom-[-10px] text-blue-50 w-24 h-24" />
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-slate-400 text-xs font-bold uppercase mb-1">Total Profit Harian</div>
          <div className="text-2xl font-bold text-slate-800">Rp {(stats.profit.Total / 1000).toLocaleString()}k</div>
          <div className="text-xs text-slate-400 mt-1">{stats.list.length} Transaksi</div>
        </div>
      </div>

      {/* TRANSACTION LIST */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b bg-slate-50 font-bold text-slate-700">Daftar Transaksi</div>
        {loading ? <div className="p-8 flex justify-center"><Loader className="animate-spin text-emerald-600" /></div> : (
          <div className="divide-y divide-slate-100">
            {stats.list.length === 0 && <div className="p-8 text-center text-slate-400">Tidak ada transaksi pada tanggal ini.</div>}
            {stats.list.map((t, idx) => (
              <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-bold text-slate-800 text-sm">#{t.id || 'N/A'}</span>
                    <span className={`ml-2 text-[10px] px-2 py-0.5 rounded font-bold uppercase ${t.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>{t.status}</span>
                  </div>
                  <div className="font-mono text-xs text-slate-400">{t.jam || t.date}</div>
                </div>
                <div className="space-y-1 mb-2">
                  {t.items.map((i, ii) => (
                    <div key={ii} className="flex justify-between text-xs">
                      <span className="text-slate-600">{i.qty}x {i.nama} <span className="text-[10px] text-slate-400 italic">({i.milik})</span></span>
                      <span className="font-medium text-slate-800">{parseInt(i.harga * i.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center border-t border-dashed border-slate-200 pt-2 mt-2">
                  <span className="text-xs font-bold text-slate-500">Total</span>
                  <span className="text-sm font-bold text-slate-800">Rp {parseInt(t.total).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// MAIN APP
function App() {
  const [token, setToken] = useState(localStorage.getItem('POS_TOKEN'));
  const [view, setView] = useState('ANALYTICS');

  // Auto Logout jika token expired (Opsional, saat ini manual logout)
  const handleLogout = () => {
    localStorage.removeItem('POS_TOKEN');
    setToken(null);
  };

  if (!token) {
    return <LoginPage onLogin={(t) => {
      localStorage.setItem('POS_TOKEN', t);
      setToken(t);
    }} />;
  }

  return <DashboardLayout view={view} setView={setView} onLogout={handleLogout} />;
}

const DashboardLayout = ({ view, setView, onLogout }) => {
  const [menuData, setMenuData] = useState([]);
  const [setOpen, setSetOpen] = useState(false);

  const refreshData = () => {
    const cached = localStorage.getItem('MENU_CACHE');
    if (cached) setMenuData(JSON.parse(cached));

    fetchData('getMenu').then(res => {
      setMenuData(res);
      localStorage.setItem('MENU_CACHE', JSON.stringify(res));
    }).catch(e => console.error("Err load menu", e));
  };

  useEffect(() => { refreshData(); }, []);

  const NavItem = ({ id, icon, label }) => (
    <button onClick={() => setView(id)} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${view === id ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>
      <Icon name={icon} size={24} className={view === id ? 'fill-emerald-50' : ''} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  const SidebarItem = ({ id, icon, label }) => (
    <button onClick={() => setView(id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1 ${view === id ? 'bg-emerald-50 text-emerald-600 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
      <Icon name={icon} size={20} />
      <span className="text-sm">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col font-sans bg-slate-50 w-full h-screen text-slate-800">
      <div className="flex-1 overflow-hidden relative flex w-full">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col p-6 z-50 shrink-0">
          <div className="font-bold text-xl mb-10 flex items-center gap-2 text-slate-800">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white"><Icon name="utensils" size={18} /></div>
            Deb's Manager
          </div>
          <nav className="flex-1">
            <SidebarItem id="ANALYTICS" icon="bar-chart-2" label="Dashboard" />
            <SidebarItem id="POS" icon="shopping-cart" label="Point of Sales" />
            <SidebarItem id="INVENTORY" icon="package" label="Inventory" />
            <SidebarItem id="HISTORY" icon="clock" label="Riwayat" />
            <SidebarItem id="KITCHEN" icon="chef-hat" label="Kitchen View" />
          </nav>
          <div className="border-t pt-4 space-y-2">
            <button onClick={() => setSetOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800"><Icon name="settings" size={20} /><span className="text-sm">Pengaturan</span></button>
            <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700"><Icon name="log-out" size={20} /><span className="text-sm">Keluar</span></button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 relative overflow-hidden bg-[#F8FAFC] w-full">
          {view === 'ANALYTICS' && <Analytics />}
          {view === 'POS' && <POS menu={menuData} refreshData={refreshData} />}
          {view === 'INVENTORY' && <Inventory menu={menuData} refreshData={refreshData} />}
          {view === 'HISTORY' && <OrderHistory />}
          {view === 'KITCHEN' && <Kitchen />}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden bg-white border-t flex justify-around p-2 pb-safe z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] shrink-0">
        <NavItem id="POS" icon="shopping-cart" label="Kasir" />
        <NavItem id="INVENTORY" icon="package" label="Stok" />
        <NavItem id="HISTORY" icon="clock" label="Riwayat" />
        <NavItem id="ANALYTICS" icon="bar-chart-2" label="Bisnis" />
        <NavItem id="KITCHEN" icon="chef-hat" label="Dapur" />
        {/* Mobile Logout (Hidden in Settings usually, but adding strict entry here) */}
        <button onClick={onLogout} className="flex flex-col items-center gap-1 p-2 rounded-xl text-red-400">
          <Icon name="log-out" size={24} />
          <span className="text-[10px] font-medium">Keluar</span>
        </button>
      </div>

      <SettingsModal isOpen={setOpen} onClose={() => setSetOpen(false)} />
    </div>
  );
}

export default App;
