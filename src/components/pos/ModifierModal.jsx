import Modal from '../ui/Modal';

const MODIFIERS = [
    { id: 'm1', name: 'Tambah Telur Dadar', price: 5000 },
    { id: 'm2', name: 'Tambah Telur 1/2 Matang', price: 6000 },
    { id: 'm3', name: 'Tambah Nasi Setengah', price: 3000 },
    { id: 'm4', name: 'Porsi Besar', price: 5000 },
];

const ModifierModal = ({ isOpen, onClose, item, activeModifiers, setActiveModifiers, onConfirm }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Pilihan Tambahan?" footer={<button onClick={onConfirm} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold">Tambahkan {activeModifiers.length ? `(${activeModifiers.length} Ekstra)` : ''}</button>}>
            <div className="space-y-4">
                <div className="bg-slate-50 p-3 rounded-xl mb-4">
                    <div className="text-xs font-bold text-slate-400 uppercase mb-1">Menu Terpilih</div>
                    <div className="font-bold text-slate-800">{item?.Nama_Menu}</div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Tambahan (Add-ons)</label>
                    {MODIFIERS.map(m => {
                        const active = activeModifiers.find(x => x.id === m.id);
                        return (
                            <button key={m.id} onClick={() => setActiveModifiers(p => active ? p.filter(x => x.id !== m.id) : [...p, m])} className={`w-full flex justify-between items-center p-3.5 rounded-xl border transition-all ${active ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500' : 'bg-white border-slate-100 text-slate-600'}`}>
                                <span className="font-bold text-sm">{m.name}</span>
                                <span className={`text-xs font-bold ${active ? 'text-emerald-600' : 'text-slate-400'}`}>+ Rp {m.price.toLocaleString()}</span>
                            </button>
                        );
                    })}
                </div>
                <button onClick={() => { onConfirm(); }} className="w-full py-3 text-slate-400 text-xs font-bold hover:text-slate-600 transition-colors mt-2">
                    Tanpa Tambahan (Add Original)
                </button>
            </div>
        </Modal>
    );
};

export default ModifierModal;
