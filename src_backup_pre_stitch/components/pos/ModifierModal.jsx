import { useState, useMemo, useEffect } from 'react';
import Modal from '../ui/Modal';
import Icon from '../ui/Icon';
import { formatCurrency } from '../../utils/format';

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
        if (isOpen) {
            queueMicrotask(() => {
                setSelectedVariants(prev => {
                    if (Object.keys(prev).length === 0) return prev;
                    return {};
                });
            });
        }
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

    // Clean up displayed names for add-ons to avoid repetition
    const getCleanName = (name) => name.replace('Tambah ', '');

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Kustomisasi Pesanan"
            footer={
                <div className="p-1">
                    <button
                        onClick={handleConfirm}
                        disabled={isMissingRequired}
                        className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-500/10 transition-all active:scale-[0.98] h-14 flex items-center justify-center gap-2 ${isMissingRequired ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed' : 'bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 dark:hover:bg-emerald-600'}`}
                    >
                        {isMissingRequired ? 'Lengkapi Pilihan...' : (
                            <>Tambahkan ke Keranjang <Icon name="shopping-bag" size={20} /></>
                        )}
                    </button>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Hero Product Card */}
                <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Icon name="tag" size={64} className="text-emerald-500 rotate-12" />
                    </div>
                    <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Menu Terpilih</div>
                    <div className="font-black text-slate-800 dark:text-white text-2xl leading-tight w-[90%]">{item?.Nama_Menu}</div>
                    <div className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {formatCurrency(item?.Harga)}
                    </div>
                </div>

                {/* Dynamic Variants */}
                {variantGroups.map(group => (
                    <div key={group.name} className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                            {group.name} <span className="text-red-500 text-xs bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded-md font-bold">Wajib</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {group.options.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setSelectedVariants(p => ({ ...p, [group.name]: opt }))}
                                    className={`relative py-3 px-4 rounded-xl border-2 text-left transition-all duration-200 active:scale-[0.98] ${selectedVariants[group.name] === opt
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-800 dark:text-emerald-400 shadow-md shadow-emerald-500/10'
                                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'}`}
                                >
                                    <div className="font-bold text-sm">{opt}</div>
                                    {selectedVariants[group.name] === opt && (
                                        <div className="absolute top-2 right-2 text-emerald-500">
                                            <Icon name="check-circle" size={16} fill="currentColor" className="text-emerald-500" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Add-ons */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-1">Ekstra Tambahan</label>
                    <div className="space-y-2">
                        {HARDCODED_ADDONS.map(m => {
                            const active = activeAddons.find(x => x.id === m.id);
                            return (
                                <button
                                    key={m.id}
                                    onClick={() => setActiveAddons(p => active ? p.filter(x => x.id !== m.id) : [...p, m])}
                                    className={`w-full flex justify-between items-center p-3 rounded-xl border transition-all duration-200 active:scale-[0.99] group ${active
                                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500/50 shadow-md shadow-blue-500/5'
                                        : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors duration-200 ${active
                                            ? 'bg-blue-500 border-blue-500 text-white'
                                            : 'border-slate-300 dark:border-slate-600 group-hover:border-slate-400 bg-white dark:bg-slate-800'}`}>
                                            {active && <Icon name="check" size={12} strokeWidth={4} />}
                                        </div>
                                        <span className={`font-bold text-sm ${active ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {getCleanName(m.name)}
                                        </span>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${active
                                        ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500'}`}>
                                        +{formatCurrency(m.price)}
                                    </span>
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
