import { useState, useEffect } from 'react';
import { fetchData } from '../services/api';
import Icon from '../components/ui/Icon';
import KitchenOrderCard from '../components/kitchen/KitchenOrderCard';
import haptics from '../services/haptics';
import PullToRefresh from '../components/ui/PullToRefresh';

const Kitchen = () => {
    const [orders, setOrders] = useState([]);

    const fetchOrders = () => {
        fetchData('getOrders').then(res => {
            const safe = res || [];
            const parsed = safe.map(o => {
                try {
                    return { ...o, items: typeof o.Items_JSON === 'string' ? JSON.parse(o.Items_JSON) : o.Items_JSON || [] };
                } catch (e) {
                    if (process.env.NODE_ENV === 'development') {
                        console.error("Error parsing kitchen items", e);
                    }
                    return { ...o, items: [] };
                }
            }).filter(o => o.status !== 'Selesai' && o.Status !== 'Selesai');
            setOrders(parsed);
        });
    };

    useEffect(() => { fetchOrders(); const t = setInterval(fetchOrders, 15000); return () => clearInterval(t); }, []);

    const done = (id) => {
        haptics.success();
        setOrders(p => p.filter(o => o.ID_Order !== id));
        const payload = { id, status: 'Selesai' };
        fetchData('updateOrderStatus', 'POST', payload);
    };

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 p-4 pb-24 text-slate-800 dark:text-slate-100 font-sans h-full overflow-y-auto w-full transition-colors duration-300 relative">
            <PullToRefresh onRefresh={fetchOrders} isRefreshing={false} />
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white dark:bg-slate-950 z-10 py-2">
                <h1 className="text-xl font-bold flex items-center gap-3"><span className="bg-emerald-500 p-2 rounded-lg text-white"><Icon name="chef-hat" size={20} /></span> Kitchen Monitor</h1>
                <button type="button" onClick={() => { haptics.tap(); fetchOrders(); }} className="p-2 bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500"><Icon name="refresh-cw" size={20} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {orders.length === 0 && <div className="col-span-full flex flex-col items-center justify-center py-32 opacity-50 text-slate-400"><Icon name="coffee" size={64} className="mb-4" /><p>Semua pesanan selesai!</p></div>}
                {orders.map(o => (
                    <KitchenOrderCard key={o.ID_Order} order={o} onDone={done} />
                ))}
            </div>
        </div>
    );
};

export default Kitchen;
