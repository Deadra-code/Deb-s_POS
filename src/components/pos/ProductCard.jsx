import { motion } from 'framer-motion';
import haptics from '../../services/haptics';

const ProductCard = ({ item, onClick, rank }) => {
    return (
        <motion.article
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
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
            className="bg-white dark:bg-neutral-card rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-primary/5 active:scale-95 transition-all cursor-pointer hover:shadow-lg relative group"
        >
            {rank && (
                <div className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shadow-lg z-20 
                    ${rank === 1 ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-white ring-2 ring-yellow-100 dark:ring-yellow-900/40' :
                        rank === 2 ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-white' :
                            rank === 3 ? 'bg-gradient-to-br from-orange-300 to-orange-500 text-white' :
                                'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                    #{rank}
                </div>
            )}

            <div className="relative aspect-square bg-slate-100 dark:bg-neutral-dark overflow-hidden">
                <img
                    alt={item.Nama_Menu}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                    src={item.Gambar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.Nama_Menu)}&background=102218&color=13ec6d`}
                />
                <div className="absolute top-2 right-2">
                    {item.Stock <= 0 ? (
                        <span className="bg-slate-800/80 backdrop-blur-md text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">Habis</span>
                    ) : item.Stock < 10 ? (
                        <span className="bg-orange-500 text-white text-[9px] font-black px-2 py-1 rounded-lg">STOK: {item.Stock}</span>
                    ) : (
                        <span className="bg-primary/90 text-background-dark text-[9px] font-black px-2 py-1 rounded-lg">STOK: {item.Stock}</span>
                    )}
                </div>
            </div>

            <div className="p-3">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-[13px] leading-snug line-clamp-2 h-9 mb-1">{item.Nama_Menu}</h3>
                <p className="text-primary font-black text-sm">Rp {parseInt(item.Harga).toLocaleString()}</p>
            </div>
        </motion.article>
    );
};

export default ProductCard;
