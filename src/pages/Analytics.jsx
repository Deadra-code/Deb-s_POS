import { useState, useEffect, useMemo } from 'react';
import { Skeleton } from '../components/ui/Skeleton';
import { fetchData } from '../services/api';
import Icon from '../components/ui/Icon';
import RevenueChart from '../components/analytics/RevenueChart';
import SetoranReport from '../components/analytics/SetoranReport';
import TopItemsList from '../components/analytics/TopItemsList';
import haptics from '../services/haptics';
import PullToRefresh from '../components/ui/PullToRefresh';
import { OWNERS } from '../config/owners';

const Analytics = ({ loading: parentLoading }) => {
    const [data, setData] = useState({ transactions: [] });
    const [localLoading, setLocalLoading] = useState(true);
    const [period, setPeriod] = useState('HARI_INI'); // HARI_INI, MINGGU_INI, BULAN_INI, TAHUN_INI
    const [ownerFilter, setOwnerFilter] = useState('ALL'); // ALL, Debby, Mama

    const isLoading = parentLoading || (localLoading && !data.transactions.length);

    useEffect(() => {
        setLocalLoading(true);
        fetchData('getReport').then(res => {
            setData(res); setLocalLoading(false);
        }).catch(() => setLocalLoading(false));
    }, []);

    const stats = useMemo(() => {
        if (!data.transactions || !data.transactions.length) return { revenue: 0, profit: 0, orders: 0, chartData: [], topItems: [] };

        let revenue = 0;
        let profit = 0;
        let filteredCount = 0;
        const dailyMap = {};
        const productCount = {};
        let cashInDrawer = 0;
        let digitalBank = 0;
        const ownerTotals = {};
        OWNERS.forEach(o => ownerTotals[o] = 0);

        // --- HELPER DATE ---
        const isSameDay = (d1, d2) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
        const getWeek = d => { const onejan = new Date(d.getFullYear(), 0, 1); return Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7); };

        // FILTER TRANSAKSI BERDASARKAN WAKTU
        const now = new Date();
        data.transactions.forEach(t => {
            const tDate = new Date(t.date); // yyyy-MM-dd
            let isValidTime = false;

            if (period === 'HARI_INI') isValidTime = isSameDay(tDate, now);
            else if (period === 'MINGGU_INI') isValidTime = getWeek(tDate) === getWeek(now) && tDate.getFullYear() === now.getFullYear();
            else if (period === 'BULAN_INI') isValidTime = tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
            else if (period === 'TAHUN_INI') isValidTime = tDate.getFullYear() === now.getFullYear();
            else isValidTime = true; // Default All

            if (isValidTime && (t.status === 'Selesai' || t.status === 'Proses')) {
                const val = parseInt(t.total || 0);
                revenue += val;

                // --- SETORAN LOGIC (For Today) ---
                if (isSameDay(tDate, now)) {
                    if (t.paymentMethod === 'Tunai') cashInDrawer += val;
                    else digitalBank += val;

                    if (ownerTotals.hasOwnProperty(t.owner)) {
                        ownerTotals[t.owner] += val;
                    }
                }

                filteredCount++;
                let trxRevenue = 0;
                let trxProfit = 0;
                let hasItems = false;

                if (t.items && Array.isArray(t.items)) {
                    t.items.forEach(i => {
                        const itemOwner = i.milik || OWNERS[0];
                        if (ownerFilter === 'ALL' || itemOwner === ownerFilter) {
                            hasItems = true;
                            const itemRev = i.harga * i.qty;
                            const itemModal = i.modal || 0;
                            const itemProf = itemRev - (itemModal * i.qty);

                            trxRevenue += itemRev;
                            trxProfit += itemProf;

                            productCount[i.nama] = (productCount[i.nama] || 0) + i.qty;
                        }
                    });
                }

                if (hasItems) {
                    profit += trxProfit;

                    let key = t.date;
                    if (period === 'TAHUN_INI') key = t.date.slice(0, 7);

                    if (!dailyMap[key]) dailyMap[key] = { name: key, omzet: 0, profit: 0 };
                    dailyMap[key].omzet += trxRevenue;
                    dailyMap[key].profit += trxProfit;
                }
            }
        });

        const chartData = Object.values(dailyMap).sort((a, b) => a.name.localeCompare(b.name));
        const topItems = Object.entries(productCount)
            .map(([name, qty]) => ({ name, qty }))
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 5);

        return {
            revenue, profit, orders: filteredCount, chartData, topItems,
            cashInDrawer,
            digitalBank,
            ownerTotals
        };
    }, [data, period, ownerFilter]);

    if (isLoading) {
        return (
            <div className="p-4 md:p-8 h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 pb-24 space-y-8">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-10 w-32 rounded-lg" />
                        <Skeleton className="h-10 w-32 rounded-lg" />
                    </div>
                </div>
                <Skeleton className="h-64 w-full rounded-3xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Skeleton className="h-32 rounded-3xl" />
                    <Skeleton className="h-32 rounded-3xl" />
                    <Skeleton className="h-32 rounded-3xl" />
                </div>
                <Skeleton className="h-48 w-full rounded-3xl" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 h-full overflow-y-auto bg-slate-50 dark:bg-slate-950 pb-24 text-slate-800 dark:text-slate-100 transition-colors duration-300 relative">
            <PullToRefresh onRefresh={() => {
                setLocalLoading(true);
                fetchData('getReport').then(res => {
                    setData(res); setLocalLoading(false);
                }).catch(() => setLocalLoading(false));
            }} isRefreshing={isLoading} />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Analisa performa bisnis.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-3">
                    <select className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-2 rounded-lg text-sm font-bold shadow-sm outline-none text-slate-800 dark:text-slate-200" value={period} onChange={e => { haptics.tick(); setPeriod(e.target.value); }}>
                        <option value="HARI_INI">Hari Ini</option>
                        <option value="MINGGU_INI">Minggu Ini</option>
                        <option value="BULAN_INI">Bulan Ini</option>
                        <option value="TAHUN_INI">Tahun Ini</option>
                    </select>
                    <select className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 p-2 rounded-lg text-sm font-bold shadow-sm outline-none text-slate-800 dark:text-slate-200" value={ownerFilter} onChange={e => { haptics.tick(); setOwnerFilter(e.target.value); }}>
                        <option value="ALL">Semua Pemilik</option>
                        {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                            <Icon name="trending-up" size={24} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Omzet Kotor</h3>
                        <div className="text-2xl font-black text-slate-800 dark:text-white">
                            Rp {(stats.revenue || 0).toLocaleString('id-ID')}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                            <Icon name="pie-chart" size={24} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Laba Bersih</h3>
                        <div className="text-2xl font-black text-slate-800 dark:text-white">
                            Rp {(stats.profit || 0).toLocaleString('id-ID')}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl">
                            <Icon name="shopping-bag" size={24} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Transaksi</h3>
                        <div className="text-2xl font-black text-slate-800 dark:text-white">
                            {stats.orders || 0} Trx
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-64 w-full">
                <RevenueChart data={stats.chartData} />
            </div>

            {/* --- SETORAN REPORT SECTION --- */}
            {period === 'HARI_INI' && <div className="space-y-6"><SetoranReport stats={stats} /></div>}

            <TopItemsList items={stats.topItems} />
        </div>
    );
};

export default Analytics;
