import { useState, useMemo, useEffect } from 'react';
import Modal from '../ui/Modal';

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
        return item.Varian.split('|').map(group => {
            const [name, opts] = group.split(':');
            return {
                name: name.trim(),
                options: opts.split(',').map(o => o.trim())
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
                    className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all ${isMissingRequired ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'}`}
                >
                    {isMissingRequired ? 'Pilih Varian Dahulu...' : 'Tambahkan ke Keranjang'}
                </button>
            }
        >
            <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-2xl">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Menu Terpilih</div>
                    <div className="font-bold text-slate-800 text-lg">{item?.Nama_Menu}</div>
                </div>

                {/* Dynamic Variants */}
                {variantGroups.map(group => (
                    <div key={group.name} className="space-y-3">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{group.name} <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-2 gap-2">
                            {group.options.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setSelectedVariants(p => ({ ...p, [group.name]: opt }))}
                                    className={`py-3 px-4 rounded-xl border font-bold text-sm transition-all ${selectedVariants[group.name] === opt ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Hardcoded Add-ons */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tambahan (Add-ons)</label>
                    <div className="space-y-2">
                        {HARDCODED_ADDONS.map(m => {
                            const active = activeAddons.find(x => x.id === m.id);
                            return (
                                <button
                                    key={m.id}
                                    onClick={() => setActiveAddons(p => active ? p.filter(x => x.id !== m.id) : [...p, m])}
                                    className={`w-full flex justify-between items-center p-3.5 rounded-xl border transition-all ${active ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <span className="font-bold text-sm">{m.name}</span>
                                    <span className={`text-xs font-bold ${active ? 'text-blue-600' : 'text-slate-400'}`}>+ Rp {m.price.toLocaleString()}</span>
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
