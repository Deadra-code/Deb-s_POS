import Icon from '../ui/Icon';
import Modal from '../ui/Modal';
import { Loader } from '../ui/icons';

const CheckoutModal = ({ isOpen, onClose, total, payMethod, setPayMethod, onCheckout, loading }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Konfirmasi Pembayaran">
            <div className="text-center py-6 text-slate-800 dark:text-slate-100">
                <div className="text-slate-500 dark:text-slate-400 mb-2 text-sm font-medium">Total Tagihan</div>
                <div className="text-5xl font-black text-emerald-600 dark:text-emerald-400 mb-8 border-b dark:border-slate-800 pb-6">Rp {total.toLocaleString()}</div>

                <div className="text-left mb-6">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase mb-4 block tracking-widest">Pilih Metode Pembayaran</label>
                    <div className="grid grid-cols-3 gap-3">
                        {['Tunai', 'QRIS', 'Dana'].map(m => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => setPayMethod(m)}
                                className={`py-4 rounded-2xl border-2 font-black text-sm transition-all active:scale-90 ${payMethod === m ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-lg shadow-emerald-500/20' : 'border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onCheckout}
                    disabled={loading}
                    className="w-full py-4.5 rounded-2xl font-black text-white bg-emerald-600 dark:bg-emerald-500 shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 dark:hover:bg-emerald-600 flex justify-center items-center gap-3 mt-4 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale h-14"
                >
                    {loading ? <Loader className="animate-spin" size={24} /> : (
                        <>Bayar via {payMethod} <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center overflow-hidden"><Icon name="arrow-right" size={18} /></div></>
                    )}
                </button>
            </div>
        </Modal>
    );
};

export default CheckoutModal;
