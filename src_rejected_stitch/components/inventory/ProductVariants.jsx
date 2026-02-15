import Icon from '../ui/Icon';

const ProductVariants = ({ variantGroups, setVariantGroups }) => {
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
            const raw = value.split(',');
            const trimmed = raw.map(o => o.trim());
            newGroups[index].options = trimmed.filter(o => o !== '');
            // Store raw display value for input retention
            newGroups[index].optionsDisplay = value;
        }
        setVariantGroups(newGroups);
    };

    return (
        <div className="space-y-4 pt-4">
            <div className="border-b dark:border-slate-800 pb-2 flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 border-l-4 border-blue-500 pl-2">Varian (Pilihan Menu)</h3>
                <button
                    type="button"
                    onClick={handleAddGroup}
                    className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2.5 rounded-lg font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1"
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
                            className="absolute -top-2 -right-2 w-8 h-8 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center shadow-sm hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                            aria-label="Hapus Grup Varian"
                        >
                            <Icon name="x" size={14} />
                        </button>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Nama Pilihan (Contoh: Jenis Sambal)</label>
                                <input
                                    className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-bold text-slate-800 dark:text-slate-100 overflow-hidden"
                                    value={group.name}
                                    onChange={e => handleGroupChange(idx, 'name', e.target.value)}
                                    placeholder="Misal: Pilihan Sambal"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Daftar Opsi (Pisahkan dengan koma)</label>
                                <input
                                    className="w-full border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-800 dark:text-slate-100 overflow-hidden"
                                    defaultValue={group.optionsDisplay !== undefined ? group.optionsDisplay : group.options.join(', ')}
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
    );
};

export default ProductVariants;
