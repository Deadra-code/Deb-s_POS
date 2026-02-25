import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Pencil,
  Trash2,
  ChefHat,
  Package,
  DollarSign,
  AlertCircle,
  Loader2,
  Search,
  X,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../components/ui/Dialog';
import { Toaster, useToast } from '../hooks';
import { saveProduct, deleteProduct } from '../services/indexeddb-api';
import { formatCurrency } from '../utils/format';
import haptics from '../services/haptics';

// Product Form Modal
const ProductForm = ({ initialData, onSubmit, loading, onClose }) => {
  const [formData, setFormData] = useState({
    nama: initialData?.nama || '',
    kategori: initialData?.kategori || 'Makanan',
    harga: initialData?.harga || '',
    modal: initialData?.modal || '',
    stock: initialData?.stock || '',
    status: initialData?.status || 'Tersedia',
    owner: initialData?.owner || 'Debby',
    varian: initialData?.varian || '',
    foto: initialData?.foto || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      harga: parseInt(formData.harga) || 0,
      modal: parseInt(formData.modal) || 0,
      stock: parseInt(formData.stock) || 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
          Nama Menu
        </label>
        <Input
          placeholder="Contoh: Nasi Goreng Spesial"
          value={formData.nama}
          onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
          className="h-12"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Kategori
          </label>
          <select
            value={formData.kategori}
            onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
            className="flex h-12 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="Makanan">Makanan</option>
            <option value="Minuman">Minuman</option>
            <option value="Snack">Snack</option>
            <option value="Dessert">Dessert</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Pemilik
          </label>
          <select
            value={formData.owner}
            onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
            className="flex h-12 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="Debby">Debby</option>
            <option value="Mama">Mama</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Harga Jual (Rp)
          </label>
          <Input
            type="number"
            placeholder="25000"
            value={formData.harga}
            onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
            className="h-12"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Modal (Rp)
          </label>
          <Input
            type="number"
            placeholder="15000"
            value={formData.modal}
            onChange={(e) => setFormData({ ...formData, modal: e.target.value })}
            className="h-12"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
          Stok
        </label>
        <Input
          type="number"
          placeholder="50"
          value={formData.stock}
          onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
          className="h-12"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="flex h-12 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="Tersedia">Tersedia</option>
            <option value="Habis">Habis</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
            Varian
          </label>
          <Input
            placeholder="Level: Sedang, Pedas"
            value={formData.varian}
            onChange={(e) => setFormData({ ...formData, varian: e.target.value })}
            className="h-12"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
          URL Foto
        </label>
        <Input
          placeholder="https://..."
          value={formData.foto}
          onChange={(e) => setFormData({ ...formData, foto: e.target.value })}
          className="h-12"
        />
      </div>

      <DialogFooter className="pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Batal
        </Button>
        <Button type="submit" disabled={loading} className="gap-2">
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Menyimpan...
            </>
          ) : (
            <>
              {initialData ? 'Update' : 'Tambah'}
              <Package size={18} />
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

const Inventory = ({ menu, refreshData, loading: parentLoading }) => {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const isLoading = parentLoading || localLoading;

  const categories = useMemo(() => {
    const cats = new Set(menu.map((i) => i.kategori || 'Lainnya'));
    return ['All', ...cats];
  }, [menu]);

  const filteredMenu = useMemo(() => {
    return menu.filter(
      (item) =>
        (filterCategory === 'All' || item.kategori === filterCategory) &&
        item.nama.toLowerCase().includes(search.toLowerCase())
    );
  }, [menu, filterCategory, search]);

  const handleAdd = () => {
    haptics.tap();
    setEditData(null);
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    haptics.tap();
    setEditData(item);
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    setLocalLoading(true);

    try {
      await saveProduct(formData);
      haptics.success();
      toast({
        title: 'Berhasil menyimpan produk!',
        variant: 'success',
      });
      setModalOpen(false);
      refreshData();
    } catch (err) {
      console.error(err);
      toast({
        title: 'Gagal menyimpan produk',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLocalLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`Hapus ${item.nama}?`)) return;

    haptics.error();
    setLocalLoading(true);

    try {
      await deleteProduct(item.id);
      haptics.success();
      toast({
        title: 'Berhasil menghapus produk!',
        variant: 'success',
      });
      refreshData();
    } catch (err) {
      toast({
        title: 'Gagal menghapus',
        variant: 'destructive',
      });
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <>
      <Toaster />
      <main className="p-4 md:p-6 h-full overflow-y-auto bg-slate-50 dark:bg-slate-950">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">
              Management Menu
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Kelola daftar menu dan stok
            </p>
          </div>
          <Button onClick={handleAdd} className="gap-2 h-12">
            <Plus size={20} />
            Produk Baru
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={filterCategory === cat ? 'default' : 'outline'}
                onClick={() => {
                  haptics.tick();
                  setFilterCategory(cat);
                }}
                className="whitespace-nowrap"
              >
                {cat === 'All' ? 'Semua' : cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Loading Overlay */}
        {localLoading && (
          <div className="fixed inset-0 z-40 bg-black/20 dark:bg-black/50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-2xl flex items-center gap-3">
              <Loader2 className="animate-spin text-emerald-500" size={32} />
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Memproses...
              </span>
            </div>
          </div>
        )}

        {/* Mobile View (Cards) */}
        <section className="md:hidden space-y-3">
          {isLoading ? (
            Array(5)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4 flex gap-4">
                    <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                      <div className="flex justify-between items-end mt-4">
                        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                        <div className="flex gap-1">
                          <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded" />
                          <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : filteredMenu.length === 0 ? (
            <div className="text-center py-20 text-slate-400 dark:text-slate-500">
              <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-bold">Tidak ada produk ditemukan</p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredMenu.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-4 flex gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-700 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-100 dark:border-slate-700">
                        {item.foto ? (
                          <img
                            src={item.foto}
                            alt={item.nama}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ChefHat size={32} className="text-emerald-300 dark:text-emerald-600" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-slate-800 dark:text-white text-sm truncate">
                              {item.nama}
                            </h3>
                            <Badge
                              variant={item.stock < 5 ? 'destructive' : 'default'}
                              size="sm"
                            >
                              Stok: {item.stock}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {item.kategori}
                          </p>
                        </div>

                        <div className="flex justify-between items-end mt-2">
                          <div>
                            <p className="text-[10px] uppercase text-slate-400 font-bold">
                              Harga
                            </p>
                            <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                              {formatCurrency(item.harga)}
                            </p>
                          </div>

                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(item)}
                            >
                              <Pencil size={14} />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-700"
                              onClick={() => handleDelete(item)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </section>

        {/* Desktop View (Table) */}
        <Card className="hidden md:block overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="p-4">Produk</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4">Harga</th>
                  <th className="p-4">Modal</th>
                  <th className="p-4">Stok</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                          <div className="space-y-2">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" />
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16" />
                        </td>
                        <td className="p-4">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                        </td>
                        <td className="p-4">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                        </td>
                        <td className="p-4">
                          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-12" />
                        </td>
                        <td className="p-4">
                          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                          </div>
                        </td>
                      </tr>
                    ))
                ) : filteredMenu.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-20 text-center text-slate-400 dark:text-slate-500">
                      <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                      <p className="font-bold">Tidak ada produk ditemukan</p>
                    </td>
                  </tr>
                ) : (
                  filteredMenu.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-700 rounded-xl flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-700">
                          {item.foto ? (
                            <img
                              src={item.foto}
                              alt={item.nama}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ChefHat size={24} className="text-emerald-300 dark:text-emerald-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-black text-slate-800 dark:text-white">
                            {item.nama}
                          </div>
                          {item.varian && (
                            <div className="text-[10px] text-blue-500 font-black uppercase">
                              Varian tersedia
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">{item.kategori}</Badge>
                      </td>
                      <td className="p-4 font-black text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(item.harga)}
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">
                        {formatCurrency(item.modal)}
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={item.stock < 5 ? 'destructive' : 'success'}
                          size="sm"
                        >
                          {item.stock}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={item.status === 'Tersedia' ? 'success' : 'destructive'}>
                          {item.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Pencil size={18} />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(item)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Product Form Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editData ? 'Edit Produk' : 'Tambah Produk Baru'}</DialogTitle>
              <DialogDescription>
                {editData
                  ? 'Update informasi produk'
                  : 'Isi form di bawah untuk menambah produk baru'}
              </DialogDescription>
            </DialogHeader>
            <ProductForm
              initialData={editData}
              onSubmit={handleSubmit}
              loading={localLoading}
              onClose={() => setModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </main>
    </>
  );
};

export default Inventory;
