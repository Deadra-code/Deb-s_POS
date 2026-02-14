import { useState, useEffect, useMemo } from 'react';
import { Loader } from 'lucide-react';
import { fetchData } from '../services/api';
import Icon from '../components/ui/Icon';
import RevenueChart from '../components/analytics/RevenueChart';
import SetoranReport from '../components/analytics/SetoranReport';
import TopItemsList from '../components/analytics/TopItemsList';

const Analytics = () => {
    const [data, setData] = useState({ transactions: [] });
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('HARI_INI'); // HARI_INI, MINGGU_INI, BULAN_INI, TAHUN_INI
    const [ownerFilter, setOwnerFilter] = useState('ALL'); // ALL, Debby, Mama

    useEffect(() => {
        fetchData('getReport').then(res => {
            setData(res); setLoading(false);
        }).catch(e => setLoading(false));
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
        let debbyTotal = 0;
        let mamaTotal = 0;

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

                    if (t.owner === 'Debby') debbyTotal += val;
                    else if (t.owner === 'Mama') mamaTotal += val;
                }

                filteredCount++;
                let trxRevenue = 0;
                let trxProfit = 0;
                let hasItems = false;

                if (t.items && Array.isArray(t.items)) {
                    t.items.forEach(i => {
                        const itemOwner = i.milik || "Debby";
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
            debbyTotal,
            mamaTotal
        };
    }, [data, period, ownerFilter]);

    if (loading) return <div className="flex h-full items-center justify-center text-emerald-600"><Loader className="animate-spin" size={32} /></div>;

    return (
        <div className="p-4 md:p-8 h-full overflow-y-auto bg-slate-50 pb-24 text-slate-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
                    <p className="text-slate-500 text-sm">Analisa performa bisnis.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-3">
                    <select className="bg-white border border-slate-300 p-2 rounded-lg text-sm font-bold shadow-sm outline-none" value={period} onChange={e => setPeriod(e.target.value)}>
                        <option value="HARI_INI">Hari Ini</option>
                        <option value="MINGGU_INI">Minggu Ini</option>
                        <option value="BULAN_INI">Bulan Ini</option>
                        <option value="TAHUN_INI">Tahun Ini</option>
                    </select>
                    <select className="bg-white border border-slate-300 p-2 rounded-lg text-sm font-bold shadow-sm outline-none" value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)}>
                        <option value="ALL">Semua Pemilik</option>
                        <option value="Debby">Debby</option>
                        <option value="Mama">Mama</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-1">Total Omzet</div>
                    <div className="text-2xl font-bold text-slate-800">Rp {(stats.revenue / 1000).toLocaleString()}k</div>
                    <div className="text-emerald-500 text-xs font-bold mt-2 flex items-center gap-1"><Icon name="trending-up" size={14} /> Gross Revenue</div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-1">Profit Bersih</div>
                    <div className="text-2xl font-bold text-emerald-600">Rp {(stats.profit / 1000).toLocaleString()}k</div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-1">Transaksi</div>
                    <div className="text-2xl font-bold text-blue-600">{stats.orders}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <div className="text-slate-400 text-xs font-bold uppercase mb-1">Rata-rata Order</div>
                    <div className="text-2xl font-bold text-purple-600">Rp {stats.orders ? Math.round(stats.revenue / stats.orders).toLocaleString() : 0}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <RevenueChart data={stats.chartData} />

                {/* --- SETORAN REPORT SECTION --- */}
                {/* --- SETORAN REPORT SECTION --- */}
                {period === 'HARI_INI' && <SetoranReport stats={stats} />}

                <TopItemsList items={stats.topItems} />
            </div>
        </div>
    );
};

export default Analytics;
