import { motion } from 'framer-motion';
import haptics from '../../services/haptics';

const ProductCard = ({ item, onClick, rank }) => {
    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            role="button"
            tabIndex="0"
            aria-label={`Tambah ${item.Nama_Menu} ke keranjang`}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    haptics.tap();
                    onClick(item);
                }
            }}
            onClick={() => { haptics.tap(); onClick(item); }}
            className="bg-white dark:bg-slate-900 p-3 md:p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-3 group active:scale-95 transition-all cursor-pointer hover:shadow-xl hover:border-emerald-200 dark:hover:border-emerald-800/50"
        >
            {rank && (
                <div className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md z-10 
                    ${rank === 1 ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-white ring-2 ring-yellow-100 dark:ring-yellow-900/40 scale-110' :
                        rank === 2 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-white' :
                            rank === 3 ? 'bg-gradient-to-br from-orange-300 to-orange-500 text-white' :
                                'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                    #{rank}
                </div>
            )}
            <div>
                <div className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-tight mb-2 line-clamp-2">{item.Nama_Menu}</div>
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{item.Kategori}</div>
            </div>
            <div className="flex justify-between items-center mt-3">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-base">Rp {parseInt(item.Harga).toLocaleString()}</span>
                {item.Stock < 5 && item.Stock > 0 && <span className="text-[10px] text-red-500 font-bold bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">Sisa {item.Stock}</span>}
                {item.Stock <= 0 && <span className="text-[10px] text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">HABIS</span>}
            </div>
        </motion.article>
    );
};

export default ProductCard;
