import Icon from '../ui/Icon';

const KitchenOrderCard = ({ order, onDone }) => {
    return (
        <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 flex flex-col shadow-lg animate-in zoom-in-95 duration-300">
            <div className={`p-4 flex justify-between items-center ${order.Tipe_Order === 'Dine In' ? 'bg-emerald-900/30 text-emerald-400 border-b border-emerald-900/50' : 'bg-blue-900/30 text-blue-400 border-b border-blue-900/50'}`}>
                <div>
                    <div className="font-bold text-lg">#{order.ID_Order.slice(-4)}</div>
                    <div className="text-[10px] uppercase font-bold tracking-wider">{order.Tipe_Order}</div>
                </div>
                <div className="font-mono text-lg font-bold">{order.Jam}</div>
            </div>
            <div className="p-4 flex-1 space-y-3">
                {order.items.map((i, idx) => (
                    <div key={idx} className="flex gap-3 text-sm items-start">
                        <span className="bg-slate-700 text-white w-6 h-6 flex items-center justify-center rounded font-bold shrink-0">{i.qty}</span>
                        <span className="text-slate-300 pt-0.5 font-medium">{i.nama}</span>
                    </div>
                ))}
            </div>
            <div className="p-3 bg-slate-900/30 border-t border-slate-700">
                <button
                    onClick={() => onDone(order.ID_Order)}
                    className="w-full py-2.5 bg-slate-700 hover:bg-emerald-600 hover:text-white rounded-lg font-bold text-sm transition-all text-slate-400 flex items-center justify-center gap-2 group"
                >
                    <Icon name="check" size={16} className="group-hover:scale-125 transition-transform" /> Selesai Masak
                </button>
            </div>
        </div>
    );
};

export default KitchenOrderCard;
