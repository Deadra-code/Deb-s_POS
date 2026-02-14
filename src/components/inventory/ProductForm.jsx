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
                const groups = initialData.Varian.split('|').map(g => {
                    const [name, opts] = g.split(':');
                    return {
                        name: name.trim(),
                        options: opts.split(',').map(o => o.trim())
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
            newGroups[index].options = value.split(',').map(o => o.trim()).filter(o => o !== '');
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
        <form onSubmit={handleFormSubmit} className="space-y-6 text-slate-800">
            {/* Basic Info Section */}
            <div className="space-y-4">
                <div className="border-b pb-2 mb-4">
                    <h3 className="font-bold text-slate-800 border-l-4 border-emerald-500 pl-2">Informasi Produk</h3>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold uppercase text-slate-500">Nama Produk</label>
                    <input
                        required
                        className="w-full border border-slate-200 p-3 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        value={formData.Nama_Menu}
                        onChange={e => setFormData({ ...formData, Nama_Menu: e.target.value })}
                        placeholder="Contoh: Ayam Bakar Spesial"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-emerald-700">Harga Jual (Rp)</label>
                        <input
                            type="number"
                            required
                            className="w-full border border-emerald-100 bg-emerald-50 p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-emerald-800"
                            value={formData.Harga}
                            onChange={e => setFormData({ ...formData, Harga: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-slate-500">Modal (Rp)</label>
                        <input
                            type="number"
                            required
                            className="w-full border border-slate-200 p-3 rounded-xl bg-slate-50 focus:ring-2 focus:ring-slate-400 outline-none"
                            value={formData.Modal}
                            onChange={e => setFormData({ ...formData, Modal: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-slate-500">Stok Awal</label>
                        <input
                            type="number"
                            required
                            className="w-full border border-slate-200 p-3 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={formData.Stock}
                            onChange={e => setFormData({ ...formData, Stock: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold uppercase text-slate-500">Kategori</label>
                        <select
                            className="w-full border border-slate-200 p-3 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
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
                    <label className="text-xs font-bold uppercase text-slate-500">Pemilik Keuntungan</label>
                    <div className="flex gap-2">
                        {['Debby', 'Mama'].map(owner => (
                            <button
                                key={owner}
                                type="button"
                                onClick={() => setFormData({ ...formData, Milik: owner })}
                                className={`flex-1 py-3 rounded-xl border font-bold transition-all ${formData.Milik === owner ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-500 border-slate-200'}`}
                            >
                                {owner}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Variants Section */}
            <div className="space-y-4 pt-4">
                <div className="border-b pb-2 flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 border-l-4 border-blue-500 pl-2">Varian (Pilihan Menu)</h3>
                    <button
                        type="button"
                        onClick={handleAddGroup}
                        className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 transition-colors flex items-center gap-1"
                    >
                        <Icon name="plus" size={14} /> Tambah Grup
                    </button>
                </div>

                <div className="space-y-4">
                    {variantGroups.length === 0 && (
                        <div className="text-center py-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <p className="text-xs text-slate-400 font-medium">Belum ada varian rasa/pilihan.<br />Klik tombol di atas untuk menambah.</p>
                        </div>
                    )}

                    {variantGroups.map((group, idx) => (
                        <div key={idx} className="bg-slate-50 p-4 rounded-2xl relative border border-slate-100 animate-in fade-in slide-in-from-right-2">
                            <button
                                type="button"
                                onClick={() => handleRemoveGroup(idx)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-sm hover:bg-red-200"
                            >
                                <Icon name="x" size={14} />
                            </button>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-400">Nama Pilihan (Contoh: Jenis Sambal)</label>
                                    <input
                                        className="w-full border border-slate-200 p-2.5 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold"
                                        value={group.name}
                                        onChange={e => handleGroupChange(idx, 'name', e.target.value)}
                                        placeholder="Misal: Pilihan Sambal"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-400">Daftar Opsi (Pisahkan dengan koma)</label>
                                    <input
                                        className="w-full border border-slate-200 p-2.5 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        value={group.options.join(', ')}
                                        onChange={e => handleGroupChange(idx, 'options', e.target.value)}
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
                    className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-emerald-700 disabled:opacity-50 active:scale-95 transition-all text-lg"
                >
                    {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
            </div>
        </form>
    );
};

export default ProductForm;
