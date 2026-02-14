const ProductCard = ({ item, onClick }) => {
    return (
        <div onClick={() => onClick(item)} className={`bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative group cursor-pointer active:scale-95 transition-transform flex flex-col justify-between min-h-[100px] ${item.Stock <= 0 ? 'grayscale opacity-60' : ''}`}>
            <div>
                <div className="font-bold text-slate-800 text-sm leading-tight mb-2 line-clamp-2">{item.Nama_Menu}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.Kategori}</div>
            </div>
            <div className="flex justify-between items-center mt-3">
                <span className="font-bold text-emerald-600 text-base">Rp {parseInt(item.Harga).toLocaleString()}</span>
                {item.Stock < 5 && item.Stock > 0 && <span className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full">Sisa {item.Stock}</span>}
                {item.Stock <= 0 && <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-full">HABIS</span>}
            </div>
        </div>
    );
};

export default ProductCard;
