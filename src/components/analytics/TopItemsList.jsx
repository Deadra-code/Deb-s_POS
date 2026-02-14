const TopItemsList = ({ items }) => {
    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-6">Produk Terlaris</h3>
            <div className="space-y-4">
                {items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-700' : 'bg-orange-50 text-orange-700'}`}>#{i + 1}</div>
                            <div className="text-sm font-medium text-slate-700">{item.name}</div>
                        </div>
                        <div className="text-sm font-bold text-emerald-600">{item.qty} Sold</div>
                    </div>
                ))}
                {items.length === 0 && <div className="text-center text-slate-400 py-10">Belum ada data penjualan</div>}
            </div>
        </div>
    );
};

export default TopItemsList;
