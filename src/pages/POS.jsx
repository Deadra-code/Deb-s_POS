import { useState, useMemo, useCallback } from 'react';
import { Loader } from 'lucide-react';
import { fetchData } from '../services/api';
import Icon from '../components/ui/Icon';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';
import ProductCard from '../components/pos/ProductCard';
import CartItem from '../components/pos/CartItem';
import ModifierModal from '../components/pos/ModifierModal';
import CustomItemModal from '../components/pos/CustomItemModal';
import CheckoutModal from '../components/pos/CheckoutModal';

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
    const [customItemOpen, setCustomItemOpen] = useState(false);
    const [modifierModalOpen, setModifierModalOpen] = useState(false);
    const [selectedItemForMod, setSelectedItemForMod] = useState(null);
    const [activeModifiers, setActiveModifiers] = useState([]);
    const [customItem, setCustomItem] = useState({ name: '', price: '', milik: 'Debby' });

    const addToCart = useCallback((item, modifiers = []) => {
        // Find if item with SAME modifiers already exists
        const itemId = `${item.ID}-${modifiers.map(m => m.id).sort().join(',')}`;

        if (!item.ID.toString().startsWith('custom-')) {
            if (item.Status === 'Habis' || item.Stock <= 0) return setToast({ msg: 'Stok Habis!', type: 'error' });
        }

        setCart(p => {
            const ex = p.find(i => i.cartId === itemId);
            if (ex && !item.ID.toString().startsWith('custom-') && ex.qty >= item.Stock) {
                setToast({ msg: 'Stok Max!', type: 'error' });
                return p;
            }

            const itemPrice = parseInt(item.Harga) + modifiers.reduce((a, b) => a + b.price, 0);

            if (ex) {
                return p.map(i => i.cartId === itemId ? { ...i, qty: i.qty + 1 } : i);
            } else {
                return [...p, {
                    ...item,
                    cartId: itemId,
                    qty: 1,
                    baseHarga: parseInt(item.Harga),
                    Harga: itemPrice, // Store modified price
                    modifiers: modifiers
                }];
            }
        });
        setToast({ msg: `+1 ${item.Nama_Menu}${modifiers.length ? ' (Modified)' : ''}` });
    }, []);

    const handleItemClick = (item) => {
        if (item.Kategori === 'Makanan') {
            setSelectedItemForMod(item);
            setActiveModifiers([]);
            setModifierModalOpen(true);
        } else {
            addToCart(item);
        }
    };

    const confirmModifierAdd = () => {
        addToCart(selectedItemForMod, activeModifiers);
        setModifierModalOpen(false);
        setSelectedItemForMod(null);
        setActiveModifiers([]);
    };

    const addCustomItem = () => {
        if (!customItem.name || !customItem.price) return alert("Isi nama dan harga!");
        const newItem = {
            ID: `custom-${Date.now()}`,
            Nama_Menu: customItem.name,
            Harga: parseInt(customItem.price),
            Milik: customItem.milik,
            Modal: 0,
            Kategori: 'Custom'
        };
        addToCart(newItem);
        setCustomItem({ name: '', price: '', milik: 'Debby' });
        setCustomItemOpen(false);
    };

    const updateQty = (cartId, d) => setCart(p => p.map(i => i.cartId === cartId ? { ...i, qty: Math.max(0, i.qty + d) } : i).filter(i => i.qty > 0));
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
            .then(res => {
                setCart([]); setCartOpen(false); setCheckoutOpen(false); setLoading(false);
                if (res.offline) {
                    setToast({ msg: "Transaksi Disimpan Offline ⚠️", type: 'warning' });
                } else {
                    setToast({ msg: "Transaksi Berhasil!" });
                }
                refreshData();
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
                    <button onClick={() => setCustomItemOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-700 rounded-xl border-2 border-dashed border-emerald-200 font-bold hover:bg-emerald-100 transition-colors">
                        <Icon name="plus-circle" size={18} /> Pesanan Manual (Costum)
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 pb-24 md:pb-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filtered.map(item => (
                            <ProductCard key={item.ID} item={item} onClick={handleItemClick} />
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
                        <CartItem key={item.cartId} item={item} onUpdateQty={updateQty} />
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
                        <CartItem key={item.cartId} item={item} onUpdateQty={updateQty} />
                    ))}
                </div>
            </Modal>

            {/* CHECKOUT MODAL */}
            <CheckoutModal
                isOpen={checkoutOpen}
                onClose={() => setCheckoutOpen(false)}
                total={total}
                payMethod={payMethod}
                setPayMethod={setPayMethod}
                onCheckout={handleCheckout}
                loading={loading}
            />

            {/* CUSTOM ITEM MODAL */}
            <CustomItemModal
                isOpen={customItemOpen}
                onClose={() => setCustomItemOpen(false)}
                customItem={customItem}
                setCustomItem={setCustomItem}
                onAdd={addCustomItem}
            />

            {/* MODIFIER MODAL */}
            <ModifierModal
                isOpen={modifierModalOpen}
                onClose={() => setModifierModalOpen(false)}
                item={selectedItemForMod}
                activeModifiers={activeModifiers}
                setActiveModifiers={setActiveModifiers}
                onConfirm={confirmModifierAdd}
            />
        </div>
    );
};

export default POS;
