import { useState, useMemo, useEffect } from 'react';
import Modal from '../ui/Modal';
import Icon from '../ui/Icon';

const HARDCODED_ADDONS = [
    { id: 'm1', name: 'Tambah Telur Dadar', price: 5000 },
    { id: 'm2', name: 'Tambah Telur 1/2 Matang', price: 6000 },
    { id: 'm3', name: 'Tambah Nasi Setengah', price: 3000 },
    { id: 'm4', name: 'Porsi Besar', price: 5000 },
];

const ModifierModal = ({ isOpen, onClose, item, activeAddons, setActiveAddons, onConfirm }) => {
    const [selectedVariants, setSelectedVariants] = useState({});

    // Parse Varian string: "Sambal: Matah, Merah | Level: 1, 2"
    const variantGroups = useMemo(() => {
        if (!item?.Varian) return [];
        const groups = item.Varian.split('|');
        return groups.map(group => {
            const [name, opts] = group.split(':');
            const rawOptions = opts.split(',');
            return {
                name: name.trim(),
                options: rawOptions.map(o => o.trim())
            };
        });
    }, [item]);

    // Reset variants when item changes
    useEffect(() => {
        if (isOpen) setSelectedVariants({});
    }, [isOpen]);

    const handleConfirm = () => {
        // Convert variants into a consistent "modifier" format
        const variants = Object.entries(selectedVariants).map(([group, val]) => ({
            id: `var-${group}-${val}`,
            name: `${group}: ${val}`,
            price: 0,
            isVariant: true
        }));
        onConfirm(variants);
    };

    const isMissingRequired = variantGroups.some(g => !selectedVariants[g.name]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Pilihan & Tambahan"
            footer={
                <button
                    onClick={handleConfirm}
                    disabled={isMissingRequired}
                    className={`w-full py-4.5 rounded-2xl font-black shadow-xl shadow-emerald-500/10 transition-all active:scale-[0.98] h-14 ${isMissingRequired ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed' : 'bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600'}`}
                >
                    {isMissingRequired ? 'Pilih Varian Dahulu...' : (
                        <span className="flex items-center justify-center gap-2">Tambahkan ke Keranjang <Icon name="plus" size={18} /></span>
                    )}
                </button>
            }
        >
            <div className="space-y-8">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-inner">
                    <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Menu Terpilih</div>
                    <div className="font-black text-slate-800 dark:text-slate-100 text-xl">{item?.Nama_Menu}</div>
                </div>

                {/* Dynamic Variants */}
                {variantGroups.map(group => (
                    <div key={group.name} className="space-y-4">
                        <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            {group.name} <span className="text-red-500 font-black">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {group.options.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setSelectedVariants(p => ({ ...p, [group.name]: opt }))}
                                    className={`py-4 px-4 rounded-2xl border-2 font-black text-sm transition-all active:scale-90 ${selectedVariants[group.name] === opt ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-lg shadow-emerald-500/10' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Hardcoded Add-ons */}
                <div className="space-y-4">
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Tambahan (Add-ons)</label>
                    <div className="space-y-3">
                        {HARDCODED_ADDONS.map(m => {
                            const active = activeAddons.find(x => x.id === m.id);
                            return (
                                <button
                                    key={m.id}
                                    onClick={() => setActiveAddons(p => active ? p.filter(x => x.id !== m.id) : [...p, m])}
                                    className={`w-full flex justify-between items-center p-4.5 rounded-2xl border-2 transition-all active:scale-[0.98] ${active ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-700 dark:text-blue-400 shadow-lg shadow-blue-500/10' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                >
                                    <span className="font-black text-sm flex items-center gap-2">
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${active ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-200 dark:border-slate-700'}`}>
                                            {active && <Icon name="check" size={12} />}
                                        </div>
                                        {m.name}
                                    </span>
                                    <span className={`text-xs font-black p-1.5 rounded-lg ${active ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>+ Rp {m.price.toLocaleString()}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ModifierModal;
