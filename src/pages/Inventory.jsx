import { useState } from 'react';
import { Loader } from 'lucide-react';
import { fetchData } from '../services/api';
import Icon from '../components/ui/Icon';
import Modal from '../components/ui/Modal';
import ProductImage from '../components/ui/ProductImage';
import ProductForm from '../components/inventory/ProductForm';
import haptics from '../services/haptics';
import PullToRefresh from '../components/ui/PullToRefresh';

const Inventory = ({ menu, refreshData }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [loading, setLoading] = useState(false);

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

    const handleSubmit = (formData) => {
        setLoading(true);
        const rowIndex = editData ? editData._rowIndex : null;
        const payload = { ...formData, isNew: !editData, _rowIndex: rowIndex };

        fetchData('saveProduct', 'POST', payload)
            .then(() => {
                haptics.success();
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
            haptics.error();
            setLoading(true);
            const payload = { rowIndex: item._rowIndex };
            fetchData('deleteProduct', 'POST', payload)
                .then(() => { haptics.success(); setLoading(false); refreshData(); })
                .catch(err => {
                    haptics.error();
                    setLoading(false);
                    alert("Gagal menghapus");
                });
        }
    };

    return (
        <main className="p-4 md:p-8 h-full overflow-y-auto pb-24 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative">
            <PullToRefresh onRefresh={refreshData} isRefreshing={loading} />
            {loading && <div className="fixed inset-0 z-[120] bg-white/50 flex items-center justify-center"><Loader className="animate-spin text-emerald-600" size={40} /></div>}

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Management Menu</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Kelola daftar menu dan varian rasa.</p>
                </div>
                <button onClick={handleAdd} className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold flex gap-2 shadow-lg hover:bg-emerald-700 active:scale-95 transition-transform"><Icon name="plus" size={20} /> Produk Baru</button>
            </div>

            <div className="space-y-4">
                {/* MOBILE VIEW (Cards) */}
                <section className="md:hidden space-y-3">
                    {menu.map((item, idx) => (
                        <article key={item.ID || idx} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-md border border-slate-100 dark:border-slate-800 flex gap-4 transition-all active:scale-[0.98]">
                            <div className="w-20 h-20 rounded-xl bg-gray-50 dark:bg-slate-800 overflow-hidden shrink-0 border border-gray-100 dark:border-slate-700">
                                <ProductImage src={item.Foto_URL} alt={item.Nama_Menu} />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-gray-800 text-sm truncate pr-2 w-full">
                                            {item.Nama_Menu}
                                            {item.Varian && <span className="ml-1 text-[8px] bg-blue-100 text-blue-600 px-1 rounded uppercase">Var</span>}
                                        </h3>
                                    </div>
                                    <div className="text-xs text-gray-500 mb-1">{item.Kategori}</div>
                                </div>

                                <div className="flex justify-between items-end mt-2">
                                    <div>
                                        <div className="text-[10px] uppercase text-gray-400 font-bold">Harga Jual</div>
                                        <div className="font-bold text-emerald-600 text-sm">Rp {parseInt(item.Harga).toLocaleString()}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.Stock < 5 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{item.Stock}</span>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleEdit(item)} className="p-1.5 bg-blue-50 rounded-md text-blue-600" aria-label="Edit produk"><Icon name="pencil" size={14} /></button>
                                            <button onClick={() => handleDelete(item)} className="p-1.5 bg-red-50 rounded-md text-red-600" aria-label="Hapus produk"><Icon name="trash-2" size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </section>

                {/* DESKTOP VIEW (Table) */}
                <div className="hidden md:block bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] tracking-widest">
                                <tr>
                                    <th className="p-4">Produk</th>
                                    <th className="p-4">Harga Jual</th>
                                    <th className="p-4">Modal</th>
                                    <th className="p-4">Stok</th>
                                    <th className="p-4">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {menu.map((item, idx) => (
                                    <tr key={item.ID || idx} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b dark:border-slate-800 last:border-0">
                                        <td className="p-5 flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-100 dark:border-slate-700 shadow-sm">
                                                <ProductImage src={item.Foto_URL} alt={item.Nama_Menu} />
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-800 dark:text-slate-100">{item.Nama_Menu}</div>
                                                {item.Varian && <div className="text-[10px] text-blue-500 dark:text-blue-400 font-black uppercase tracking-tighter">Varian: {item.Varian.split('|').length} Grup</div>}
                                            </div>
                                        </td>
                                        <td className="p-5 font-black text-emerald-600 dark:text-emerald-400">Rp {parseInt(item.Harga).toLocaleString()}</td>
                                        <td className="p-5 text-slate-500 dark:text-slate-400 text-xs font-medium">Rp {parseInt(item.Modal).toLocaleString()}</td>
                                        <td className="p-5"><span className={`px-3 py-1.5 rounded-lg text-xs font-black ${item.Stock < 5 ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>{item.Stock}</span></td>
                                        <td className="p-5">
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEdit(item)} className="p-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400 transition-all active:scale-90" aria-label="Edit" title="Edit"><Icon name="pencil" size={18} /></button>
                                                <button onClick={() => handleDelete(item)} className="p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-red-600 dark:text-red-400 transition-all active:scale-90" aria-label="Hapus" title="Hapus"><Icon name="trash-2" size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editData ? "Edit Produk" : "Tambah Produk"}>
                <ProductForm initialData={editData} onSubmit={handleSubmit} loading={loading} />
            </Modal>
        </main>
    );
};

export default Inventory;
