import Icon from '../ui/Icon';

const CartItem = ({ item, onUpdateQty }) => {
    return (
        <div className="flex justify-between items-center border-b border-slate-50 pb-3 last:border-0 group">
            <div>
                <div className="font-bold text-sm text-slate-800">{item.Nama_Menu}</div>
                {item.modifiers?.length > 0 && (
                    <div className="text-[10px] text-slate-400 italic">
                        + {item.modifiers.map(m => m.name.replace('Tambah ', '')).join(', ')}
                    </div>
                )}
                <div className="text-xs text-slate-500">Rp {parseInt(item.Harga).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg">
                <button onClick={() => onUpdateQty(item.cartId, -1)} className="w-7 h-7 bg-white rounded flex items-center justify-center shadow-sm text-slate-500 hover:text-slate-700 active:scale-95 transition-transform">
                    <Icon name="minus" size={14} />
                </button>
                <span className="text-xs font-bold w-6 text-center">{item.qty}</span>
                <button onClick={() => onUpdateQty(item.cartId, 1)} className="w-7 h-7 bg-white rounded flex items-center justify-center shadow-sm text-emerald-600 hover:text-emerald-700 active:scale-95 transition-transform">
                    <Icon name="plus" size={14} />
                </button>
            </div>
        </div>
    );
};

export default CartItem;
