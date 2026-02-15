import { useMemo } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import Icon from '../ui/Icon';
import haptics from '../../services/haptics';

const CartItem = ({ item, onUpdateQty }) => {
    // Separate variants and regular modifiers
    const variants = item.modifiers?.filter(m => m.isVariant) || [];
    const addons = item.modifiers?.filter(m => !m.isVariant) || [];

    // Swipe Logic
    const x = useMotionValue(0);
    const controls = useAnimation();
    const bgOpacity = useTransform(x, [-100, 0], [1, 0]);

    const itemTotal = useMemo(() => item.Harga * item.qty, [item.Harga, item.qty]);
    const formattedPrice = useMemo(() => `Rp ${parseInt(item.Harga).toLocaleString()}`, [item.Harga]);

    const handleUpdate = (d) => {
        onUpdateQty(item.cartId, d);
    };

    const handleDragEnd = async (event, info) => {
        if (info.offset.x < -80) {
            // Swiped Left - Delete
            haptics.error();
            await controls.start({ x: -500, transition: { duration: 0.2 } });
            onUpdateQty(item.cartId, -item.qty); // Remove all
        } else {
            // Snap back
            controls.start({ x: 0 });
        }
    };

    return (
        <div className="relative overflow-hidden mb-4 rounded-2xl">
            {/* Background Layer (Trash Icon) */}
            <motion.div
                style={{ opacity: bgOpacity }}
                className="absolute inset-0 bg-red-500 rounded-2xl flex items-center justify-end pr-6 z-0"
            >
                <Icon name="trash-2" className="text-white" size={24} />
            </motion.div>

            {/* Foreground Layer (Content) */}
            <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
                animate={controls}
                style={{ x, touchAction: "none" }}
                className="relative z-10 bg-white dark:bg-slate-900 flex justify-between items-center p-4 rounded-2xl border border-slate-50 dark:border-slate-800 shadow-sm"
            >
                <div className="flex-1 min-w-0 pr-4">
                    <div className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{item.Nama_Menu}</div>

                    {/* Variants */}
                    {variants.length > 0 && (
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wide">
                            {variants.map(v => v.name.includes(':') ? v.name.split(':')[1].trim() : v.name).join(', ')}
                        </div>
                    )}

                    {/* Add-ons */}
                    {addons.length > 0 && (
                        <div className="text-[10px] text-blue-500 dark:text-blue-400 italic">
                            + {addons.map(m => m.name.replace('Tambah ', '')).join(', ')}
                        </div>
                    )}

                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{formattedPrice}</div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 shadow-inner h-10" onPointerDown={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => handleUpdate(-1)}
                            className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                            aria-label="Kurangi jumlah"
                        >
                            <Icon name="minus" size={16} />
                        </button>
                        <span className="w-6 text-center text-sm font-black text-slate-800 dark:text-slate-100">{item.qty}</span>
                        <button
                            onClick={() => handleUpdate(1)}
                            className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-emerald-500 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
                            aria-label="Tambah jumlah"
                        >
                            <Icon name="plus" size={16} />
                        </button>
                    </div>
                    <div className="text-right min-w-[70px]">
                        <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">Rp {itemTotal.toLocaleString()}</div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default CartItem;
