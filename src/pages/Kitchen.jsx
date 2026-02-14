import { useState, useEffect } from 'react';
import { fetchData } from '../services/api';
import Icon from '../components/ui/Icon';

const Kitchen = () => {
    const [orders, setOrders] = useState([]);

    const fetchOrders = () => {
        fetchData('getOrders').then(res => {
            const safe = res || [];
            const parsed = safe.map(o => {
                try {
                    return { ...o, items: typeof o.Items_JSON === 'string' ? JSON.parse(o.Items_JSON) : o.Items_JSON || [] };
                } catch (e) {
                    console.error("Error parsing kitchen items", e);
                    return { ...o, items: [] };
                }
            }).filter(o => o.status !== 'Selesai' && o.Status !== 'Selesai');
            setOrders(parsed);
        });
    };

    useEffect(() => { fetchOrders(); const t = setInterval(fetchOrders, 15000); return () => clearInterval(t); }, []);

    const done = (id) => {
        setOrders(p => p.filter(o => o.ID_Order !== id));
        const payload = { id, status: 'Selesai' };
        fetchData('updateOrderStatus', 'POST', payload);
    };

    return (
        <div className="min-h-screen bg-[#1F2937] p-4 pb-24 text-white font-sans h-full overflow-y-auto w-full">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-[#1F2937] z-10 py-2">
                <h1 className="text-xl font-bold flex items-center gap-3"><span className="bg-emerald-500 p-2 rounded-lg text-white"><Icon name="chef-hat" size={20} /></span> Kitchen Monitor</h1>
                <button onClick={fetchOrders} className="p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors"><Icon name="refresh-cw" size={20} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {orders.length === 0 && <div className="col-span-full flex flex-col items-center justify-center py-32 opacity-50 text-slate-400"><Icon name="coffee" size={64} className="mb-4" /><p>Semua pesanan selesai!</p></div>}
                {orders.map(o => (
                    <div key={o.ID_Order} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 flex flex-col shadow-lg animate-in zoom-in-95 duration-300">
                        <div className={`p-4 flex justify-between items-center ${o.Tipe_Order === 'Dine In' ? 'bg-emerald-900/30 text-emerald-400 border-b border-emerald-900/50' : 'bg-blue-900/30 text-blue-400 border-b border-blue-900/50'}`}>
                            <div><div className="font-bold text-lg">#{o.ID_Order.slice(-4)}</div><div className="text-[10px] uppercase font-bold tracking-wider">{o.Tipe_Order}</div></div>
                            <div className="font-mono text-lg font-bold">{o.Jam}</div>
                        </div>
                        <div className="p-4 flex-1 space-y-3">
                            {o.items.map((i, idx) => (<div key={idx} className="flex gap-3 text-sm items-start"><span className="bg-slate-700 text-white w-6 h-6 flex items-center justify-center rounded font-bold shrink-0">{i.qty}</span> <span className="text-slate-300 pt-0.5 font-medium">{i.nama}</span></div>))}
                        </div>
                        <div className="p-3 bg-slate-900/30 border-t border-slate-700"><button onClick={() => done(o.ID_Order)} className="w-full py-2.5 bg-slate-700 hover:bg-emerald-600 hover:text-white rounded-lg font-bold text-sm transition-all text-slate-400 flex items-center justify-center gap-2 group"><Icon name="check" size={16} className="group-hover:scale-125 transition-transform" /> Selesai Masak</button></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Kitchen;
