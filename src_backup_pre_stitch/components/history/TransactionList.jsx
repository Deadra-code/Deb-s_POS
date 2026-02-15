import { Loader } from 'lucide-react';

const TransactionList = ({ list, loading }) => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 font-bold text-slate-700 dark:text-slate-200">Daftar Transaksi</div>
            {loading ? (
                <div className="p-8 flex justify-center"><Loader className="animate-spin text-emerald-600" /></div>
            ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {list.length === 0 && <div className="p-8 text-center text-slate-400 dark:text-slate-500 font-medium whitespace-pre-wrap">Tidak ada transaksi pada tanggal ini.</div>}
                    {list.map((t, idx) => (
                        <div key={idx} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">#{t.id || 'N/A'}</span>
                                    <span className={`ml-2 text-[10px] px-2 py-0.5 rounded font-bold uppercase ${t.status === 'Selesai' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'}`}>{t.status}</span>
                                </div>
                                <div className="font-mono text-xs text-slate-400">{t.jam || t.date}</div>
                            </div>
                            <div className="space-y-1 mb-2">
                                {t.items.map((i, ii) => (
                                    <div key={ii} className="flex justify-between text-xs">
                                        <span className="text-slate-600 dark:text-slate-400">
                                            {i.qty}x {i.nama}
                                            <span className="text-[10px] text-slate-400 dark:text-slate-500 italic ml-1">({i.milik})</span>
                                        </span>
                                        <span className="font-medium text-slate-800 dark:text-slate-200">{parseInt(i.harga * i.qty).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center border-t border-dashed border-slate-200 dark:border-slate-700 pt-2 mt-2">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total</span>
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Rp {parseInt(t.total).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TransactionList;
