import Modal from '../ui/Modal';
import Icon from '../ui/Icon';

const CustomItemModal = ({ isOpen, onClose, customItem, setCustomItem, onAdd }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Tambah Pesanan Manual">
            <div className="space-y-4 text-slate-800">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Nama Menu / Pesanan</label>
                    <input type="text" className="w-full p-3 bg-slate-50 border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium" placeholder="Contoh: Ayam Geprek + Telur Dadar" value={customItem.name} onChange={e => setCustomItem({ ...customItem, name: e.target.value })} />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Harga (Rp)</label>
                    <input type="number" className="w-full p-3 bg-slate-50 border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-lg" placeholder="0" value={customItem.price} onChange={e => setCustomItem({ ...customItem, price: e.target.value })} />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Pemilik Keuntungan</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['Debby', 'Mama'].map(m => (
                            <button key={m} onClick={() => setCustomItem({ ...customItem, milik: m })} className={`py-3 rounded-xl border font-bold text-sm transition-all ${customItem.milik === m ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500' : 'border-slate-200 text-slate-600'}`}>{m}</button>
                        ))}
                    </div>
                </div>
                <button onClick={onAdd} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold shadow-lg hover:bg-emerald-700 mt-4 active:scale-95 transition-transform">
                    Tambahkan ke Keranjang
                </button>
            </div>
        </Modal>
    );
};

export default CustomItemModal;
