import { useState, useEffect, useMemo } from 'react';
import { Loader } from 'lucide-react';
import { fetchData } from '../services/api';
import Icon from '../components/ui/Icon';

const OrderHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));

    useEffect(() => {
        setLoading(true);
        fetchData('getReport').then(res => {
            setTransactions(res.transactions || []);
            setLoading(false);
        }).catch(e => setLoading(false));
    }, []);

    const stats = useMemo(() => {
        const targetDate = new Date(filterDate);
        const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

        let revenue = { Debby: 0, Mama: 0, Total: 0 };
        let profit = { Debby: 0, Mama: 0, Total: 0 };
        const filteredTrx = [];

        transactions.forEach(t => {
            const tDate = new Date(t.date);
            if (isSameDay(tDate, targetDate) && (t.status === 'Selesai' || t.status === 'Proses')) {
                filteredTrx.push(t);
                if (t.items && Array.isArray(t.items)) {
                    t.items.forEach(i => {
                        const owner = i.milik || "Debby";
                        const rev = i.harga * i.qty;
                        const prof = rev - ((i.modal || 0) * i.qty);

                        if (revenue[owner] !== undefined) {
                            revenue[owner] += rev;
                            profit[owner] += prof;
                        }
                        revenue.Total += rev;
                        profit.Total += prof;
                    });
                }
            }
        });

        return { revenue, profit, list: filteredTrx.sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date)) };
    }, [transactions, filterDate]);

    return (
        <div className="p-4 md:p-8 h-full overflow-y-auto bg-slate-50 pb-24 text-slate-800">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Riwayat Pesanan</h1>
                    <p className="text-slate-500 text-sm">Rekap transaksi & bagi hasil.</p>
                </div>
                <input type="date" className="bg-white border p-2 rounded-lg font-bold text-slate-700 shadow-sm" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
            </div>

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

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b bg-slate-50 font-bold text-slate-700">Daftar Transaksi</div>
                {loading ? <div className="p-8 flex justify-center"><Loader className="animate-spin text-emerald-600" /></div> : (
                    <div className="divide-y divide-slate-100">
                        {stats.list.length === 0 && <div className="p-8 text-center text-slate-400">Tidak ada transaksi pada tanggal ini.</div>}
                        {stats.list.map((t, idx) => (
                            <div key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className="font-bold text-slate-800 text-sm">#{t.id || 'N/A'}</span>
                                        <span className={`ml-2 text-[10px] px-2 py-0.5 rounded font-bold uppercase ${t.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>{t.status}</span>
                                    </div>
                                    <div className="font-mono text-xs text-slate-400">{t.jam || t.date}</div>
                                </div>
                                <div className="space-y-1 mb-2">
                                    {t.items.map((i, ii) => (
                                        <div key={ii} className="flex justify-between text-xs">
                                            <span className="text-slate-600">{i.qty}x {i.nama} <span className="text-[10px] text-slate-400 italic">({i.milik})</span></span>
                                            <span className="font-medium text-slate-800">{parseInt(i.harga * i.qty).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-center border-t border-dashed border-slate-200 pt-2 mt-2">
                                    <span className="text-xs font-bold text-slate-500">Total</span>
                                    <span className="text-sm font-bold text-slate-800">Rp {parseInt(t.total).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderHistory;
