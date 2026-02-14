import Modal from '../ui/Modal';
import { Loader } from 'lucide-react';

const CheckoutModal = ({ isOpen, onClose, total, payMethod, setPayMethod, onCheckout, loading }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Konfirmasi Pembayaran">
            <div className="text-center py-4 text-slate-800">
                <div className="text-slate-500 mb-1 text-sm">Total Tagihan</div>
                <div className="text-4xl font-bold text-slate-800 mb-6">Rp {total.toLocaleString()}</div>

                <div className="text-left mb-4">
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Pilih Metode Pembayaran</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['Tunai', 'QRIS', 'Dana'].map(m => (
                            <button key={m} onClick={() => setPayMethod(m)} className={`py-3 rounded-xl border font-bold text-sm transition-all ${payMethod === m ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{m}</button>
                        ))}
                    </div>
                </div>
                <button onClick={onCheckout} disabled={loading} className="w-full py-3.5 rounded-xl font-bold text-white bg-emerald-600 shadow-lg hover:bg-emerald-700 flex justify-center gap-2 mt-4 active:scale-95 transition-transform">
                    {loading ? <Loader className="animate-spin" /> : `Bayar via ${payMethod}`}
                </button>
            </div>
        </Modal>
    );
};

export default CheckoutModal;
