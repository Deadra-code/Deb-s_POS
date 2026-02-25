import Icon from '../ui/Icon';
import haptics from '../../services/haptics';

const KitchenOrderCard = ({ order, onDone }) => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col shadow-lg animate-in zoom-in-95 duration-300">
            <div className={`p-4 flex justify-between items-center ${order.Tipe_Order === 'Dine In' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-b dark:border-emerald-900/50' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-b dark:border-blue-900/50'}`}>
                <div>
                    <div className="font-bold text-lg text-slate-800 dark:text-white">#{order.ID_Order.slice(-4)}</div>
                    <div className="text-[10px] uppercase font-bold tracking-wider opacity-70">{order.Tipe_Order}</div>
                </div>
                <div className="font-mono text-lg font-bold text-slate-700 dark:text-slate-300">{order.Jam}</div>
            </div>
            <div className="p-4 flex-1 space-y-3">
                {order.items.map((i, idx) => (
                    <div key={idx} className="flex gap-3 text-sm items-start">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 w-7 h-7 flex items-center justify-center rounded-lg font-bold shrink-0 overflow-hidden">{i.qty}</span>
                        <span className="text-slate-600 dark:text-slate-300 pt-0.5 font-medium">{i.nama}</span>
                    </div>
                ))}
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                <button type="button"
                    onClick={() => {
                        haptics.tap();
                        onDone(order.ID_Order);
                    }}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2 group"
                >
                    <Icon name="check" size={18} className="group-hover:scale-125 transition-transform" /> Selesai Masak
                </button>
            </div>
        </div>
    );
};

export default KitchenOrderCard;
