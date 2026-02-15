const TopItemsList = ({ items }) => {
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-6">Produk Terlaris</h3>
            <div className="space-y-4">
                {items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800 pb-2 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${i === 0 ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400' : i === 1 ? 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300' : 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'}`}>#{i + 1}</div>
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.name}</div>
                        </div>
                        <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{item.qty} Sold</div>
                    </div>
                ))}
                {items.length === 0 && <div className="text-center text-slate-400 dark:text-slate-500 py-10">Belum ada data penjualan</div>}
            </div>
        </div>
    );
};

export default TopItemsList;
