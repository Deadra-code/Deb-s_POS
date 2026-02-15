import { useState, useEffect, useMemo } from 'react';
import { fetchData } from '../services/api';
import StatsCards from '../components/history/StatsCards';
import TransactionList from '../components/history/TransactionList';
import haptics from '../services/haptics';
import PullToRefresh from '../components/ui/PullToRefresh';

const OrderHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));

    useEffect(() => {
        fetchData('getReport').then(res => {
            setTransactions(res.transactions || []);
            setLoading(false);
        }).catch(() => setLoading(false));
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
        <div className="p-4 md:p-8 h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 pb-24 text-slate-800 dark:text-slate-100 transition-colors duration-300 relative">
            <PullToRefresh onRefresh={() => {
                setLoading(true);
                fetchData('getReport').then(res => {
                    setTransactions(res.transactions || []);
                    setLoading(false);
                }).catch(() => setLoading(false));
            }} isRefreshing={loading} />
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100">Riwayat Pesanan</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Rekap transaksi & bagi hasil.</p>
                </div>
                <input type="date" className="bg-white dark:bg-slate-900 border dark:border-slate-800 p-3 rounded-2xl font-black text-slate-700 dark:text-slate-200 shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" value={filterDate} onChange={e => {
                    haptics.tick();
                    setFilterDate(e.target.value);
                }} />
            </div>

            <StatsCards stats={stats} />
            <TransactionList list={stats.list} loading={loading} />
        </div>
    );
};

export default OrderHistory;
