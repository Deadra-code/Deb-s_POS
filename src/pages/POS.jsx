import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  ShoppingBag,
  PlusCircle,
  Star,
  X,
  ArrowRight,
  ChefHat,
  Loader2,
  XCircle,
} from '../components/ui/icons';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/Dialog';
import { ScrollArea } from '../components/ui/ScrollArea';
import { Toaster, useToast } from '../hooks';
import { saveOrder, getTopItems } from '../services/indexeddb-api';
import { formatCurrency } from '../utils/format';
import haptics from '../services/haptics';

// Product Card Component
const ProductCard = ({ item, onClick }) => {
  const isOutOfStock = item.status === 'Habis' || item.stock <= 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={() => !isOutOfStock && onClick(item)}
      className={`relative bg-white dark:bg-slate-900 rounded-xl p-4 cursor-pointer transition-all duration-200 shadow-md hover:shadow-xl ${
        isOutOfStock ? 'opacity-50 cursor-not-allowed grayscale' : 'active:scale-95'
      }`}
    >
      {item.stock <= 5 && !isOutOfStock && (
        <Badge variant="warning" size="sm" className="absolute top-2 right-2">
          Stok Menipis
        </Badge>
      )}
      
      <div className="aspect-square bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-700 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
        {item.foto ? (
          <img src={item.foto} alt={item.nama} className="w-full h-full object-cover" />
        ) : (
          <ChefHat size={40} className="text-emerald-300 dark:text-emerald-600" />
        )}
      </div>
      
      <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-1 line-clamp-2">
        {item.nama}
      </h3>
      
      <div className="flex items-center justify-between">
        <span className="text-emerald-600 dark:text-emerald-400 font-black text-sm">
          {formatCurrency(item.harga)}
        </span>
        <Badge variant={isOutOfStock ? 'destructive' : 'success'} size="sm">
          {isOutOfStock ? 'Habis' : `Stok: ${item.stock}`}
        </Badge>
      </div>
    </motion.div>
  );
};

// Cart Item Component
const CartItem = ({ item, onUpdateQty }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-xl p-3"
    >
      <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
        {item.foto ? (
          <img src={item.foto} alt={item.nama} className="w-full h-full object-cover" />
        ) : (
          <ChefHat size={24} className="text-emerald-300 dark:text-emerald-600" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate">
          {item.nama}
        </h4>
        <p className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">
          {formatCurrency(item.harga)}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg"
          onClick={() => onUpdateQty(item.cartId, -1)}
        >
          -
        </Button>
        <span className="font-bold text-slate-800 dark:text-white w-6 text-center">
          {item.qty}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-lg"
          onClick={() => onUpdateQty(item.cartId, 1)}
        >
          +
        </Button>
      </div>
    </motion.div>
  );
};

// Checkout Modal Component
const CheckoutModal = ({ isOpen, onClose, total, payMethod, setPayMethod, onCheckout, loading }) => {
  const paymentMethods = ['Tunai', 'QRIS', 'Transfer'];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Pembayaran</DialogTitle>
          <DialogDescription>
            Pilih metode pembayaran dan proses transaksi
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Pembayaran</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(total)}
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.map((method) => (
                <Button
                  key={method}
                  variant={payMethod === method ? 'default' : 'outline'}
                  className="h-12"
                  onClick={() => setPayMethod(method)}
                >
                  {method}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button onClick={onCheckout} disabled={loading} className="gap-2">
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Memproses...
              </>
            ) : (
              <>
                Bayar Sekarang
                <ArrowRight size={18} />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Custom Item Modal
const CustomItemModal = ({ isOpen, onClose, customItem, setCustomItem, onAdd }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pesanan Manual</DialogTitle>
          <DialogDescription>
            Tambahkan pesanan custom/manual
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Nama Item
            </label>
            <Input
              placeholder="Contoh: Nasi Goreng Spesial"
              value={customItem.name}
              onChange={(e) => setCustomItem({ ...customItem, name: e.target.value })}
              className="h-12"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Harga
            </label>
            <Input
              type="number"
              placeholder="Contoh: 25000"
              value={customItem.price}
              onChange={(e) => setCustomItem({ ...customItem, price: e.target.value })}
              className="h-12"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={onAdd}>Tambahkan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const POS = ({ menu, refreshData, loading: menuLoading }) => {
  const { toast } = useToast();
  
  const [cart, setCart] = useState([]);
  const categories = useMemo(() => ['All', ...new Set(menu.map((i) => i.kategori || 'Lainnya'))], [menu]);
  const [cat, setCat] = useState('All');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('Dine In');
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payMethod, setPayMethod] = useState('Tunai');
  const [customItemOpen, setCustomItemOpen] = useState(false);
  const [customItem, setCustomItem] = useState({ name: '', price: '' });
  const [topItemNames, setTopItemNames] = useState([]);

  // Load top items
  useEffect(() => {
    const loadTopItems = async () => {
      try {
        const items = await getTopItems(5);
        setTopItemNames(items);
      } catch (err) {
        console.error('Failed to load top items:', err);
      }
    };
    loadTopItems();
  }, []);

  const favoriteProducts = useMemo(() => {
    return topItemNames
      .map((name) => menu.find((i) => i.nama === name))
      .filter(Boolean);
  }, [topItemNames, menu]);

  const addToCart = useCallback((item) => {
    if (item.status === 'Habis' || item.stock <= 0) {
      toast({
        title: 'Stok Habis!',
        variant: 'destructive',
      });
      return;
    }

    setCart((p) => {
      const ex = p.find((i) => i.cartId === item.id);
      if (ex && ex.qty >= item.stock) {
        toast({
          title: 'Stok Max!',
          variant: 'destructive',
        });
        return p;
      }

      if (ex) {
        return p.map((i) =>
          i.cartId === item.id ? { ...i, qty: i.qty + 1 } : i
        );
      } else {
        return [
          ...p,
          {
            ...item,
            cartId: item.id,
            qty: 1,
          },
        ];
      }
    });

    haptics.tap();
    toast({
      title: `+1 ${item.nama}`,
      variant: 'success',
    });
  }, [toast]);

  const handleItemClick = (item) => {
    addToCart(item);
  };

  const addCustomItem = () => {
    if (!customItem.name || !customItem.price) {
      toast({
        title: 'Isi nama dan harga!',
        variant: 'destructive',
      });
      return;
    }

    const newItem = {
      id: `custom-${Date.now()}`,
      nama: customItem.name,
      harga: parseInt(customItem.price),
      kategori: 'Custom',
      stock: 999,
      status: 'Tersedia',
    };

    addToCart(newItem);
    setCustomItem({ name: '', price: '' });
    setCustomItemOpen(false);
  };

  const updateQty = (cartId, delta) => {
    haptics.tick();
    setCart((p) =>
      p
        .map((i) => ({ ...i, qty: Math.max(0, i.qty + delta) }))
        .filter((i) => i.qty > 0)
    );
  };

  const total = cart.reduce((a, b) => a + b.harga * b.qty, 0);

  const handleCheckout = async () => {
    setLoading(true);

    try {
      const order = {
        orderNumber: `ORD-${Date.now()}`,
        tanggal: new Date().toISOString().split('T')[0],
        jam: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        items: cart.map((i) => ({
          nama: i.nama,
          qty: i.qty,
          harga: i.harga,
        })),
        total,
        payment: payMethod,
        type: tab,
        status: 'Proses',
        tax: 0,
        service: 0,
      };

      await saveOrder(order);

      haptics.success();
      toast({
        title: 'Transaksi Berhasil!',
        variant: 'success',
      });

      setCart([]);
      setCartOpen(false);
      setCheckoutOpen(false);
      refreshData();
    } catch (err) {
      haptics.error();
      toast({
        title: 'Transaksi Gagal',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return menu.filter(
      (i) =>
        (cat === 'All' || i.kategori === cat) &&
        i.nama.toLowerCase().includes(search.toLowerCase())
    );
  }, [menu, cat, search]);

  return (
    <>
      <Toaster />
      <section className="flex flex-col md:flex-row h-full bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300 relative">
        {/* Left Content (Menu Grid) */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Search and Categories */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <Input
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 pl-12 rounded-xl h-14"
                placeholder="Cari menu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <nav className="flex bg-white dark:bg-slate-900 p-1.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-x-auto w-full md:w-auto">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    haptics.tick();
                    setCat(c);
                  }}
                  className={`px-4 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                    cat === c
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-500 dark:text-slate-400 hover:text-emerald-500'
                  }`}
                >
                  {c === 'All' ? 'Semua' : c}
                </button>
              ))}
            </nav>
          </header>

          {/* Custom Item Button */}
          <Button
            variant="outline"
            className="w-full mb-6 h-14 border-2 border-dashed border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
            onClick={() => setCustomItemOpen(true)}
          >
            <PlusCircle size={20} />
            Pesanan Manual
          </Button>

          {/* Best Sellers */}
          {favoriteProducts.length > 0 && cat === 'All' && !search && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Star className="text-yellow-500 fill-yellow-500" size={16} />
                <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                  Paling Terlaris 🔥
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {favoriteProducts.map((item) => (
                  <ProductCard
                    key={`fav-${item.id}`}
                    item={item}
                    onClick={handleItemClick}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Product Grid */}
          <section className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {menuLoading ? (
              Array(8)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-white dark:bg-slate-900 rounded-xl p-4 animate-pulse"
                  >
                    <div className="aspect-square bg-slate-200 dark:bg-slate-700 rounded-lg mb-3" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2 w-3/4" />
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                  </div>
                ))
            ) : filtered.length === 0 ? (
              <div className="col-span-full text-center py-20 text-slate-400 dark:text-slate-500 flex flex-col items-center">
                <XCircle size={48} className="mb-4 opacity-50" />
                <p className="font-bold">Tidak ada menu ditemukan</p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearch('');
                    setCat('All');
                  }}
                >
                  Reset Pencarian
                </Button>
              </div>
            ) : (
              filtered.map((item) => (
                <ProductCard key={item.id} item={item} onClick={handleItemClick} />
              ))
            )}
          </section>
        </main>

        {/* Desktop Cart */}
        <aside className="hidden md:flex w-[380px] bg-white dark:bg-slate-900 border-l dark:border-slate-800 flex-col h-full shadow-xl z-20">
          <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center">
            <h2 className="font-bold text-xl flex gap-2 items-center">
              <ShoppingBag className="text-emerald-500" />
              Pesanan
            </h2>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {['Dine In', 'Takeaway'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                    tab === t
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <ScrollArea className="flex-1 p-6">
            {cart.length === 0 ? (
              <div className="text-center text-slate-400 dark:text-slate-500 py-20 flex flex-col items-center">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart size={40} className="opacity-20" />
                </div>
                <p className="text-sm font-medium">Belum ada pesanan</p>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {cart.map((item) => (
                    <CartItem key={item.cartId} item={item} onUpdateQty={updateQty} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </ScrollArea>

          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-end pt-2">
              <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                Total Pembayaran
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-black text-xl">
                {formatCurrency(total)}
              </span>
            </div>
            <Button
              onClick={() => setCheckoutOpen(true)}
              disabled={!cart.length}
              className="w-full h-12 text-base"
            >
              Proses Pembayaran
              <ArrowRight size={18} />
            </Button>
          </div>
        </aside>

        {/* Mobile Cart Button */}
        {cart.length > 0 && (
          <div className="md:hidden fixed bottom-20 left-4 right-4 z-50">
            <Button
              onClick={() => setCartOpen(true)}
              className="w-full h-14 shadow-xl"
            >
              <div className="flex items-center justify-between w-full">
                <Badge variant="secondary" className="bg-white/20">
                  {cart.length} Item
                </Badge>
                <span className="font-black">{formatCurrency(total)}</span>
              </div>
            </Button>
          </div>
        )}

        {/* Mobile Cart Dialog */}
        <Dialog open={cartOpen} onOpenChange={setCartOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShoppingBag className="text-emerald-500" />
                Pesanan
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-3 py-4">
                {cart.map((item) => (
                  <CartItem key={item.cartId} item={item} onUpdateQty={updateQty} />
                ))}
              </div>
            </ScrollArea>
            <DialogFooter className="flex-col gap-2 sm:flex-row">
              <div className="flex justify-between w-full py-2">
                <span className="text-slate-500 dark:text-slate-400 text-sm">Total</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(total)}
                </span>
              </div>
              <Button
                onClick={() => {
                  setCartOpen(false);
                  setCheckoutOpen(true);
                }}
                className="flex-1"
              >
                Lanjut Bayar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Checkout Modal */}
        <CheckoutModal
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          total={total}
          payMethod={payMethod}
          setPayMethod={setPayMethod}
          onCheckout={handleCheckout}
          loading={loading}
        />

        {/* Custom Item Modal */}
        <CustomItemModal
          isOpen={customItemOpen}
          onClose={() => setCustomItemOpen(false)}
          customItem={customItem}
          setCustomItem={setCustomItem}
          onAdd={addCustomItem}
        />
      </section>
    </>
  );
};

export default POS;
