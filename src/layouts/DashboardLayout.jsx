import { useState, useEffect, useCallback } from 'react';
import { fetchData } from '../services/api';
import Icon from '../components/ui/Icon';
import SettingsModal from '../components/SettingsModal';
import Analytics from '../pages/Analytics';
import POS from '../pages/POS';
import Inventory from '../pages/Inventory';
import OrderHistory from '../pages/OrderHistory';
import Kitchen from '../pages/Kitchen';
import NetworkStatus from '../components/ui/NetworkStatus';

const DashboardLayout = ({ view, setView, onLogout }) => {
    const [menuData, setMenuData] = useState([]);
    const [setOpen, setSetOpen] = useState(false);

    const refreshData = useCallback(() => {
        const cached = localStorage.getItem('MENU_CACHE');
        if (cached) setMenuData(JSON.parse(cached));

        fetchData('getMenu').then(res => {
            setMenuData(res);
            localStorage.setItem('MENU_CACHE', JSON.stringify(res));
        }).catch(e => console.error("Err load menu", e));
    }, []);

    useEffect(() => { refreshData(); }, [refreshData]);

    const NavItem = ({ id, icon, label }) => (
        <button onClick={() => setView(id)} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${view === id ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}>
            <Icon name={icon} size={24} className={view === id ? 'fill-emerald-50' : ''} />
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    );

    const SidebarItem = ({ id, icon, label }) => (
        <button onClick={() => setView(id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1 ${view === id ? 'bg-emerald-50 text-emerald-600 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
            <Icon name={icon} size={20} />
            <span className="text-sm">{label}</span>
        </button>
    );

    return (
        <div className="flex flex-col font-sans bg-slate-50 w-full h-screen text-slate-800">
            <div className="flex-1 overflow-hidden relative flex w-full">
                {/* Desktop Sidebar */}
                <div className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col p-6 z-50 shrink-0">
                    <div className="font-bold text-xl mb-10 flex items-center gap-2 text-slate-800">
                        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white"><Icon name="utensils" size={18} /></div>
                        Deb's Manager
                    </div>
                    <nav className="flex-1">
                        <SidebarItem id="ANALYTICS" icon="bar-chart-2" label="Dashboard" />
                        <SidebarItem id="POS" icon="shopping-cart" label="Point of Sales" />
                        <SidebarItem id="INVENTORY" icon="package" label="Inventory" />
                        <SidebarItem id="HISTORY" icon="clock" label="Riwayat" />
                        <SidebarItem id="KITCHEN" icon="chef-hat" label="Kitchen View" />
                    </nav>
                    <div className="border-t pt-4 space-y-2">
                        <button onClick={() => setSetOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800"><Icon name="settings" size={20} /><span className="text-sm">Pengaturan</span></button>
                        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700"><Icon name="log-out" size={20} /><span className="text-sm">Keluar</span></button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 relative overflow-hidden bg-[#F8FAFC] w-full">
                    {view === 'ANALYTICS' && <Analytics />}
                    {view === 'POS' && <POS menu={menuData} refreshData={refreshData} />}
                    {view === 'INVENTORY' && <Inventory menu={menuData} refreshData={refreshData} />}
                    {view === 'HISTORY' && <OrderHistory />}
                    {view === 'KITCHEN' && <Kitchen />}
                </div>
            </div>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden bg-white border-t flex justify-around p-2 pb-safe z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] shrink-0">
                <NavItem id="POS" icon="shopping-cart" label="Kasir" />
                <NavItem id="INVENTORY" icon="package" label="Stok" />
                <NavItem id="HISTORY" icon="clock" label="Riwayat" />
                <NavItem id="ANALYTICS" icon="bar-chart-2" label="Bisnis" />
                <NavItem id="KITCHEN" icon="chef-hat" label="Dapur" />
                <button onClick={onLogout} className="flex flex-col items-center gap-1 p-2 rounded-xl text-red-400">
                    <Icon name="log-out" size={24} />
                    <span className="text-[10px] font-medium">Keluar</span>
                </button>
            </div>

            <SettingsModal isOpen={setOpen} onClose={() => setSetOpen(false)} />
        </div>
    );
};

export default DashboardLayout;
