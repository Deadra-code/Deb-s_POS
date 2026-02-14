import { useState } from 'react';
import { Loader } from 'lucide-react';
import { fetchData } from '../services/api';
import Icon from '../components/ui/Icon';
import Modal from '../components/ui/Modal';
import ProductImage from '../components/ui/ProductImage';
import ProductForm from '../components/inventory/ProductForm';

const Inventory = ({ menu, refreshData }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleAdd = () => {
        setEditData(null);
        setModalOpen(true);
    };

    const handleEdit = (item) => {
        setEditData(item);
        setModalOpen(true);
    };

    const handleSubmit = (formData) => {
        setLoading(true);
        const rowIndex = editData ? editData._rowIndex : null;
        const payload = { ...formData, isNew: !editData, _rowIndex: rowIndex };

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
                    <h1 className="text-2xl font-bold text-slate-800">Management Menu</h1>
                    <p className="text-slate-500 text-sm">Kelola daftar menu dan varian rasa.</p>
                </div>
                <button onClick={handleAdd} className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold flex gap-2 shadow-lg hover:bg-emerald-700 active:scale-95 transition-transform"><Icon name="plus" size={20} /> Produk Baru</button>
            </div>

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
                                            <div>
                                                <div className="font-bold text-slate-800">{item.Nama_Menu}</div>
                                                {item.Varian && <div className="text-[10px] text-blue-500 font-medium">Varian: {item.Varian.split('|').length} Grup</div>}
                                            </div>
                                        </td>
                                        <td className="p-4 font-bold text-slate-700">Rp {parseInt(item.Harga).toLocaleString()}</td>
                                        <td className="p-4 text-slate-500 text-xs">Rp {parseInt(item.Modal).toLocaleString()}</td>
                                        <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${item.Stock < 5 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>{item.Stock}</span></td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => handleEdit(item)} className="p-2 hover:bg-slate-100 rounded-lg text-blue-600" title="Edit"><Icon name="pencil" size={16} /></button>
                                                <button onClick={() => handleDelete(item)} className="p-2 hover:bg-red-50 rounded-lg text-red-600" title="Hapus"><Icon name="trash-2" size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editData ? "Edit Menu" : "Tambah Menu Baru"}>
                <ProductForm
                    initialData={editData}
                    onSubmit={handleSubmit}
                    loading={loading}
                />
            </Modal>
        </div >
    );
};

export default Inventory;
