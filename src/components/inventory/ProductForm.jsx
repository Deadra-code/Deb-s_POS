import { useState, useEffect } from 'react';
import Icon from '../ui/Icon';

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
            setFormData(initialData);
            // Parse Varian string: "Group: Op1, Op2 | Group2: OpA, OpB"
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
                    <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Nama Produk</label>
                    <input
                        required
                        className="w-full border border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-sm"
                        value={formData.Nama_Menu}
                        onChange={e => setFormData({ ...formData, Nama_Menu: e.target.value })}
                        placeholder="Contoh: Ayam Bakar Spesial"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400">Harga Jual (Rp)</label>
                        <input
                            type="number"
                            required
                            className="w-full border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-emerald-800 dark:text-emerald-300"
                            value={formData.Harga}
                            onChange={e => setFormData({ ...formData, Harga: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Modal (Rp)</label>
                        <input
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
                        <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Stok Awal</label>
                        <input
                            type="number"
                            required
                            className="w-full border border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-800 dark:text-slate-100"
                            value={formData.Stock}
                            onChange={e => setFormData({ ...formData, Stock: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">Kategori</label>
                        <select
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
            <div className="space-y-4 pt-4">
                <div className="border-b dark:border-slate-800 pb-2 flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 border-l-4 border-blue-500 pl-2">Varian (Pilihan Menu)</h3>
                    <button
                        type="button"
                        onClick={handleAddGroup}
                        className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1"
                    >
                        <Icon name="plus" size={14} /> Tambah Grup
                    </button>
                </div>

                <div className="space-y-4">
                    {variantGroups.length === 0 && (
                        <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Belum ada varian rasa/pilihan.<br />Klik tombol di atas untuk menambah.</p>
                        </div>
                    )}

                    {variantGroups.map((group, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl relative border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-right-2">
                            <button
                                type="button"
                                onClick={() => handleRemoveGroup(idx)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center shadow-sm hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                            >
                                <Icon name="x" size={14} />
                            </button>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Nama Pilihan (Contoh: Jenis Sambal)</label>
                                    <input
                                        className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-slate-800 dark:text-slate-100"
                                        value={group.name}
                                        onChange={e => handleGroupChange(idx, 'name', e.target.value)}
                                        placeholder="Misal: Pilihan Sambal"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Daftar Opsi (Pisahkan dengan koma)</label>
                                    <input
                                        className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 dark:text-slate-100"
                                        defaultValue={group.optionsDisplay || group.options.join(', ')}
                                        onBlur={e => handleGroupChange(idx, 'options', e.target.value)}
                                        placeholder="Misal: Matah, Merah, Ijo"
                                    />
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {group.options.map((opt, i) => (
                                            <span key={i} className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{opt}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

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
