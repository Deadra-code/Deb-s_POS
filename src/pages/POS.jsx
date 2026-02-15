import { useState, useMemo, useCallback, useEffect } from 'react';
import { Loader } from 'lucide-react';
import { fetchData } from '../services/api';
import Icon from '../components/ui/Icon';
import Modal from '../components/ui/Modal';
import Toast from '../components/ui/Toast';
import ProductCard from '../components/pos/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import CartItem from '../components/pos/CartItem';
import ModifierModal from '../components/pos/ModifierModal';
import CustomItemModal from '../components/pos/CustomItemModal';
import CheckoutModal from '../components/pos/CheckoutModal';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import haptics from '../services/haptics';
import PullToRefresh from '../components/ui/PullToRefresh';

const POS = ({ menu, refreshData, loading: menuLoading }) => {
    const [cart, setCart] = useState([]);
    const categories = useMemo(() => ['All', ...new Set(menu.map(i => i.Kategori))], [menu]);
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
    const [topItemNames, setTopItemNames] = useState([]);

    useEffect(() => {
        fetchData('getTopItems').then(res => {
            if (res.topItems) setTopItemNames(res.topItems);
        }).catch(() => { });
    }, []);

    const favoriteProducts = useMemo(() => {
        return topItemNames.map(name => menu.find(i => i.Nama_Menu === name)).filter(Boolean);
    }, [topItemNames, menu]);

    const addToCart = useCallback((item, modifiers = []) => {
        // Find if item with SAME modifiers and variants already exists
        const modifierIds = modifiers.map(m => m.id).sort().join(',');
        const itemId = `${item.ID}-${modifierIds}`;

        if (!item.ID.toString().startsWith('custom-')) {
            if (item.Status === 'Habis' || item.Stock <= 0) return setToast({ msg: 'Stok Habis!', type: 'error' });
        }

        setCart(p => {
            const ex = p.find(i => i.cartId === itemId);
            if (ex && !item.ID.toString().startsWith('custom-') && ex.qty >= item.Stock) {
                setToast({ msg: 'Stok Max!', type: 'error' });
                return p;
            }

            const itemPrice = parseInt(item.Harga) + modifiers.reduce((a, b) => a + (b.price || 0), 0);

            if (ex) {
                const newCart = p.map(i => i.cartId === itemId ? { ...i, qty: i.qty + 1 } : i);
                return newCart;
            } else {
                const newCart = [...p, {
                    ...item,
                    cartId: itemId,
                    qty: 1,
                    baseHarga: parseInt(item.Harga),
                    Harga: itemPrice, // Store modified price
                    modifiers: modifiers
                }];
                return newCart;
            }
        });
        haptics.tap();
        setToast({ msg: `+1 ${item.Nama_Menu}${modifiers.length ? ' (Modified)' : ''}` });
    }, []);

    const handleItemClick = (item) => {
        // Open Modal if it has Variants OR is Category Makanan (for hardcoded add-ons)
        if (item.Varian || item.Kategori === 'Makanan') {
            setSelectedItemForMod(item);
            setActiveModifiers([]);
            setModifierModalOpen(true);
        } else {
            addToCart(item);
        }
    };

    const confirmModifierAdd = (variants = []) => {
        const allModifiers = [...variants, ...activeModifiers];
        addToCart(selectedItemForMod, allModifiers);
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

    const updateQty = (cartId, d) => {
        haptics.tick();
        setCart(p => p.map(i => i.cartId === cartId ? { ...i, qty: Math.max(0, i.qty + d) } : i).filter(i => i.qty > 0));
    };
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
                haptics.success();
                setCart([]); setCartOpen(false); setCheckoutOpen(false); setLoading(false);
                if (res.offline) {
                    setToast({ msg: "Transaksi Disimpan Offline ⚠️", type: 'warning' });
                } else {
                    setToast({ msg: "Transaksi Berhasil!" });
                }
                refreshData();
            })
            .catch(err => {
                haptics.error();
                setLoading(false);
                alert("Transaksi Gagal: " + err);
            });
    };

    const filtered = useMemo(() => menu.filter(i => (cat === 'All' || i.Kategori === cat) && i.Nama_Menu.toLowerCase().includes(search.toLowerCase())), [menu, cat, search]);

    return (
        <section className="flex flex-col md:flex-row h-full bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300 relative" aria-label="Point of Sale">
            <PullToRefresh onRefresh={refreshData} isRefreshing={loading} />
            {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

            {/* Left Content (Menu Grid) */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scroll">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="relative w-full md:w-96 group">
                        <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                        <input
                            className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 pl-12 rounded-3xl shadow-sm outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800 dark:text-slate-100 transition-all placeholder:text-slate-400"
                            placeholder="Cari menu apa hari ini?..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {search && <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1" aria-label="Bersihkan pencarian">
                            <Icon name="x-circle" size={20} />
                        </button>}
                    </div>

                    <nav className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-800 overflow-x-auto no-scrollbar w-full md:w-auto" aria-label="Kategori Menu">
                        {categories.map(c => (
                            <button
                                key={c}
                                onClick={() => { haptics.tick(); setCat(c); }}
                                className={`px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${cat === c ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400'}`}
                            >
                                {c === 'All' ? 'Semua' : c}
                            </button>
                        ))}
                    </nav>
                </header>

                <button onClick={() => setCustomItemOpen(true)} className="w-full flex items-center justify-center gap-2 py-4 mb-8 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-2xl border-2 border-dashed border-emerald-200 dark:border-emerald-900/50 font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all active:scale-[0.98]">
                    <Icon name="plus-circle" size={20} /> Pesanan Manual (Custom)
                </button>

                <section className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6" aria-label="Daftar Menu">
                    {favoriteProducts.length > 0 && cat === 'All' && !search && (
                        <div className="col-span-full animate-in fade-in slide-in-from-top duration-500 mb-4">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="flex items-center justify-center w-6 h-6 bg-yellow-100 text-yellow-600 rounded-lg">
                                    <Icon name="star" size={14} />
                                </span>
                                <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm italic">Paling Terlaris 🔥</h3>
                            </div>
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                {favoriteProducts.map((item, idx) => (
                                    <ProductCard
                                        key={`fav-${item.ID}`}
                                        item={item}
                                        onClick={handleItemClick}
                                        rank={idx + 1}
                                    />
                                ))}
                            </div>
                            <div className="h-px bg-slate-100 dark:bg-slate-800 mt-6 w-full"></div>
                        </div>
                    )}

                    {/* Skeleton / Product Grid */}
                    {menuLoading ? (
                        Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
                    ) : (
                        filtered.map(item => (
                            <ProductCard key={item.ID} item={item} onClick={handleItemClick} />
                        ))
                    )}

                    {!menuLoading && filtered.length === 0 && (
                        <div className="col-span-full text-center py-20 text-slate-400 dark:text-slate-500 flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
                            <Icon name="search-x" size={48} className="mb-4 opacity-50" />
                            <p className="font-bold">Tidak ada menu ditemukan</p>
                            <button onClick={() => { setSearch(''); setCat('All'); }} className="mt-4 text-emerald-600 dark:text-emerald-400 font-bold text-sm underline">Reset Pencarian</button>
                        </div>
                    )}
                </section>
            </main>

            {/* Desktop Cart (Right) */}
            <aside className="hidden md:flex w-[380px] bg-white dark:bg-slate-900 border-l dark:border-slate-800 flex-col h-full shadow-2xl z-20 text-slate-800 dark:text-slate-100 transition-all" aria-label="Ringkasan Pesanan">
                <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0">
                    <h2 className="font-bold text-xl flex gap-2 items-center"><Icon name="shopping-bag" className="text-emerald-500" /> Pesanan</h2>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
                        {['Dine In', 'Takeaway'].map(t => (
                            <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all active:scale-95 ${tab === t ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>{t}</button>
                        ))}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {cart.length === 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-slate-400 dark:text-slate-500 py-20 flex flex-col items-center">
                            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <Icon name="shopping-cart" size={40} className="opacity-20" />
                            </div>
                            <p className="text-sm font-medium">Belum ada pesanan</p>
                        </motion.div>
                    )}
                    <AnimatePresence>
                        {cart.map(item => (
                            <motion.div
                                key={item.cartId}
                                layout
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20, scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            >
                                <CartItem item={item} onUpdateQty={updateQty} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t dark:border-slate-800 space-y-4">
                    <div className="flex justify-between font-bold text-xl pt-2">
                        <span className="text-slate-500 dark:text-slate-400 text-sm font-medium self-end pb-1">Total Pembayaran</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-black" data-testid="cart-total">Rp {total.toLocaleString()}</span>
                    </div>
                    <button
                        onClick={() => setCheckoutOpen(true)}
                        disabled={!cart.length}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:grayscale transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        Proses Pembayaran <Icon name="arrow-right" size={18} />
                    </button>
                </div>
            </aside>

            {/* Mobile Cart Button */}
            {cart.length > 0 && (
                <div className="md:hidden fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom">
                    <button onClick={() => setCartOpen(true)} className="w-full bg-emerald-600 text-white py-3 rounded-xl shadow-xl font-bold flex justify-between px-6 items-center active:scale-95 transition-transform">
                        <div className="flex items-center gap-2"><span className="bg-white/20 px-2 py-0.5 rounded text-xs">{cart.length} Item</span></div>
                        <span data-testid="cart-total">Rp {total.toLocaleString()}</span>
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
                activeAddons={activeModifiers}
                setActiveAddons={setActiveModifiers}
                onConfirm={confirmModifierAdd}
            />
        </section>
    );
};

export default POS;
