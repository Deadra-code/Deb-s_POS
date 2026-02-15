import { useState, useEffect } from 'react';
import Icon from '../ui/Icon';
import ProductVariants from './ProductVariants';

const ProductForm = ({ initialData, onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        Nama_Menu: '',
        Kategori: 'Makanan',
        Harga: 0,
        Modal: 0,
        Stock: 0,
        Status: 'Tersedia',
        Foto_URL: '',
        Milik: 'Debby',
        Varian: ''
    });

    const [variantGroups, setVariantGroups] = useState([]);

    useEffect(() => {
        if (initialData) {
            queueMicrotask(() => {
                setFormData(prev => {
                    if (JSON.stringify(prev) === JSON.stringify(initialData)) return prev;
                    return initialData;
                });

                if (initialData.Varian) {
                    const rawGroups = initialData.Varian.split('|');
                    const groups = rawGroups.map(g => {
                        const [name, opts] = g.split(':');
                        const rawOptions = opts ? opts.split(',') : [];
                        const options = rawOptions.map(o => o.trim());

                        return {
                            name: name.trim(),
                            options: options,
                            optionsDisplay: opts ? opts.trim() : ''
                        };
                    });
                    setVariantGroups(groups);
                } else {
                    setVariantGroups([]);
                }
            });
        }
    }, [initialData]);

    const handleAddGroup = () => {
        setVariantGroups([...variantGroups, { name: '', options: [] }]);
    };

    const handleRemoveGroup = (index) => {
        setVariantGroups(variantGroups.filter((_, i) => i !== index));
    };

    const handleGroupChange = (index, field, value) => {
        const newGroups = [...variantGroups];
        if (field === 'name') {
            newGroups[index].name = value;
        } else if (field === 'options') {
            // Split by comma and trim
            const raw = value.split(',');
            const trimmed = raw.map(o => o.trim());
            newGroups[index].options = trimmed.filter(o => o !== '');
        }
        setVariantGroups(newGroups);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        // Convert groups back to string
        const varianString = variantGroups
            .filter(g => g.name && g.options.length > 0)
            .map(g => `${g.name}: ${g.options.join(', ')}`)
            .join(' | ');

        onSubmit({ ...formData, Varian: varianString });
    };

    return (
        <form onSubmit={handleFormSubmit} className="space-y-6 text-slate-800 dark:text-slate-100">
            {/* Basic Info Section */}
            <div className="space-y-4">
                <div className="border-b dark:border-slate-800 pb-2 mb-4">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 border-l-4 border-emerald-500 pl-2">Informasi Produk</h3>
                </div>

                <div className="space-y-1">
                    <label htmlFor="nama_produk" className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Nama Produk</label>
                    <input
                        id="nama_produk"
                        required
                        className="w-full border border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm overflow-hidden"
                        value={formData.Nama_Menu}
                        onChange={e => setFormData({ ...formData, Nama_Menu: e.target.value })}
                        placeholder="Contoh: Ayam Bakar Spesial"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label htmlFor="harga" className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400">Harga Jual (Rp)</label>
                        <input
                            id="harga"
                            type="number"
                            required
                            className="w-full border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-emerald-800 dark:text-emerald-300"
                            value={formData.Harga}
                            onChange={e => setFormData({ ...formData, Harga: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="modal" className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Modal (Rp)</label>
                        <input
                            id="modal"
                            type="number"
                            required
                            className="w-full border border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 outline-none text-slate-800 dark:text-slate-100"
                            value={formData.Modal}
                            onChange={e => setFormData({ ...formData, Modal: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label htmlFor="stock" className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Stok Awal</label>
                        <input
                            id="stock"
                            type="number"
                            required
                            className="w-full border border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-100"
                            value={formData.Stock}
                            onChange={e => setFormData({ ...formData, Stock: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="kategori" className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Kategori</label>
                        <select
                            id="kategori"
                            className="w-full border border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-100"
                            value={formData.Kategori}
                            onChange={e => setFormData({ ...formData, Kategori: e.target.value })}
                        >
                            <option>Makanan</option>
                            <option>Minuman</option>
                            <option>Cemilan</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Pemilik Keuntungan</label>
                    <div className="flex gap-2">
                        {['Debby', 'Mama'].map(owner => (
                            <button
                                key={owner}
                                type="button"
                                onClick={() => setFormData({ ...formData, Milik: owner })}
                                className={`flex-1 py-3 rounded-xl border font-bold transition-all ${formData.Milik === owner ? 'bg-slate-800 dark:bg-emerald-600 text-white border-slate-800 dark:border-emerald-600 shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-500'}`}
                            >
                                {owner}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Variants Section */}
            <ProductVariants variantGroups={variantGroups} setVariantGroups={setVariantGroups} />

            <div className="pt-6">
                <button
                    disabled={loading}
                    className="w-full bg-emerald-600 dark:bg-emerald-500 text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-50 active:scale-95 transition-all text-lg shadow-emerald-500/20"
                >
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;
