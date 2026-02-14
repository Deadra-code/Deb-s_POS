import { useState, useMemo, useCallback } from 'react';
import { Loader } from 'lucide-react';
import { fetchData } from '../services/api';
import Icon from '../components/ui/Icon';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';
import ProductImage from '../components/ui/ProductImage';

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

export default POS;
