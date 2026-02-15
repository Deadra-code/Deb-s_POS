import Icon from '../ui/Icon';

const SetoranReport = ({ stats }) => {
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Icon name="book-open" size={20} /></div>
                <h2 className="font-bold text-slate-800 dark:text-slate-100">Laporan Setoran (Tutup Buku)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                    <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-1">Uang Tunai (Laci)</div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">Rp {(stats?.cashInDrawer || 0).toLocaleString()}</div>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1">Digital (Transfer/QRIS)</div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">Rp {(stats?.digitalBank || 0).toLocaleString()}</div>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-dashed border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
                <div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Setoran Debby</div>
                    <div className="font-bold text-slate-700 dark:text-slate-200">Rp {(stats?.debbyTotal || 0).toLocaleString()}</div>
                </div>
                <div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Setoran Mama</div>
                    <div className="font-bold text-slate-700 dark:text-slate-200">Rp {(stats?.mamaTotal || 0).toLocaleString()}</div>
                </div>
            </div>
        </div>
    );
};

export default SetoranReport;
