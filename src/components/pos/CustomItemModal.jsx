import Modal from '../ui/Modal';
import Icon from '../ui/Icon';

const CustomItemModal = ({ isOpen, onClose, customItem, setCustomItem, onAdd }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Tambah Pesanan Manual">
            <div className="space-y-6 text-slate-800 dark:text-slate-100">
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Nama Menu / Pesanan</label>
                    <input
                        type="text"
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800 dark:text-slate-100 shadow-inner overflow-hidden"
                        placeholder="Contoh: Ayam Geprek + Telur Dadar"
                        value={customItem.name}
                        onChange={e => setCustomItem({ ...customItem, name: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Harga (Rp)</label>
                    <input
                        type="number"
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-black text-2xl text-emerald-600 dark:text-emerald-400 shadow-inner overflow-hidden"
                        placeholder="0"
                        value={customItem.price}
                        onChange={e => setCustomItem({ ...customItem, price: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">Pemilik Keuntungan</label>
                    <div className="grid grid-cols-2 gap-3">
                        {['Debby', 'Mama'].map(m => (
                            <button type="button"
                                key={m}
                                onClick={() => setCustomItem({ ...customItem, milik: m })}
                                className={`py-4 rounded-2xl border-2 font-black text-sm transition-all active:scale-95 ${customItem.milik === m ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-lg shadow-emerald-500/10' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>
                <button type="button"
                    onClick={onAdd}
                    className="w-full py-4.5 bg-emerald-600 dark:bg-emerald-500 text-white rounded-2xl font-black shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 dark:hover:bg-emerald-600 mt-6 active:scale-[0.98] transition-all flex items-center justify-center gap-2 h-14"
                >
                    Tambahkan ke Keranjang <Icon name="plus" size={18} />
                </button>
            </div>
        </Modal>
    );
};

export default CustomItemModal;
