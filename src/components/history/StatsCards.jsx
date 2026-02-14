import Icon from '../ui/Icon';

const StatsCards = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-1">Milik Debby</div>
                    <div className="text-2xl font-bold text-emerald-600">Rp {(stats.profit.Debby / 1000).toLocaleString()}k</div>
                    <div className="text-xs text-slate-400 mt-1">Omzet: Rp {(stats.revenue.Debby / 1000).toLocaleString()}k</div>
                </div>
                <Icon name="user" className="absolute right-[-10px] bottom-[-10px] text-emerald-50 w-24 h-24" />
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="relative z-10">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-1">Milik Mama</div>
                    <div className="text-2xl font-bold text-blue-600">Rp {(stats.profit.Mama / 1000).toLocaleString()}k</div>
                    <div className="text-xs text-slate-400 mt-1">Omzet: Rp {(stats.revenue.Mama / 1000).toLocaleString()}k</div>
                </div>
                <Icon name="heart" className="absolute right-[-10px] bottom-[-10px] text-blue-50 w-24 h-24" />
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <div className="text-slate-400 text-xs font-bold uppercase mb-1">Total Profit Harian</div>
                <div className="text-2xl font-bold text-slate-800">Rp {(stats.profit.Total / 1000).toLocaleString()}k</div>
                <div className="text-xs text-slate-400 mt-1">{stats.list.length} Transaksi</div>
            </div>
        </div>
    );
};

export default StatsCards;
