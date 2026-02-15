import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { fetchData } from '../services/api';
import Icon from '../components/ui/Icon';
import SettingsModal from '../components/SettingsModal';
import Analytics from '../pages/Analytics';
import POS from '../pages/POS';
import Inventory from '../pages/Inventory';
import OrderHistory from '../pages/OrderHistory';
import Kitchen from '../pages/Kitchen';
import { motion, AnimatePresence } from 'framer-motion';
const NavItem = ({ id, icon, label, view, setView }) => (
    <button onClick={() => setView(id)} className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${view === id ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'}`}>
        <Icon name={icon} size={24} className={view === id ? 'fill-emerald-50' : ''} />
        <span className="text-[10px] font-medium">{label}</span>
    </button>
);

const SidebarItem = ({ id, icon, label, view, setView }) => (
    <button onClick={() => setView(id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1 ${view === id ? 'bg-emerald-50 text-emerald-600 font-bold dark:bg-emerald-900/20 dark:text-emerald-400' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'}`}>
        <Icon name={icon} size={20} />
        <span className="text-sm">{label}</span>
    </button>
);

const DashboardLayout = ({ view, setView, onLogout }) => {
    const { theme, toggleTheme } = useTheme();
    const [menuData, setMenuData] = useState([]);
    const [setOpen, setSetOpen] = useState(false);
    const [menuLoading, setMenuLoading] = useState(true);

    const refreshData = useCallback(() => {
        setMenuLoading(true);
        const cached = localStorage.getItem('MENU_CACHE');
        if (cached) {
            setMenuData(JSON.parse(cached));
            setMenuLoading(false);
        }

        fetchData('getMenu').then(res => {
            setMenuData(res);
            localStorage.setItem('MENU_CACHE', JSON.stringify(res));
            setMenuLoading(false);
        }).catch(e => {
            console.error("Err load menu", e);
            setMenuLoading(false);
        });
    }, []);

    useEffect(() => {
        queueMicrotask(() => refreshData());
    }, [refreshData]);

    return (
        <div className="flex flex-col font-sans bg-slate-50 dark:bg-slate-950 w-full h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300">
            <div className="flex-1 overflow-hidden relative flex w-full">
                {/* Desktop Sidebar */}
                <aside className="hidden md:flex w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col p-6 z-50 shrink-0">
                    <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0">
                        <h2 className="font-bold text-xl flex gap-2 items-center"><Icon name="store" className="text-emerald-500" /> Deb&apos;s POS</h2>
                        <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-all active:rotate-12">
                            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
                        </button>
                    </div>
                    <nav className="flex-1">
                        <SidebarItem id="ANALYTICS" icon="bar-chart-2" label="Dashboard" view={view} setView={setView} />
                        <SidebarItem id="POS" icon="shopping-cart" label="Point of Sales" view={view} setView={setView} />
                        <SidebarItem id="INVENTORY" icon="package" label="Inventory" view={view} setView={setView} />
                        <SidebarItem id="HISTORY" icon="clock" label="Riwayat" view={view} setView={setView} />
                        <SidebarItem id="KITCHEN" icon="chef-hat" label="Kitchen View" view={view} setView={setView} />
                    </nav>
                    <div className="border-t dark:border-slate-800 pt-4 space-y-2">
                        <button onClick={() => setSetOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"><Icon name="settings" size={20} /><span className="text-sm">Pengaturan</span></button>
                        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"><Icon name="log-out" size={20} /><span className="text-sm">Keluar</span></button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 relative overflow-hidden bg-[#F8FAFC] dark:bg-slate-950 w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={view}
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="h-full w-full"
                        >
                            {view === 'ANALYTICS' && <Analytics />}
                            {view === 'POS' && <POS menu={menuData} refreshData={refreshData} loading={menuLoading} />}
                            {view === 'INVENTORY' && <Inventory menu={menuData} refreshData={refreshData} loading={menuLoading} />}
                            {view === 'HISTORY' && <OrderHistory />}
                            {view === 'KITCHEN' && <Kitchen />}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <footer className="md:hidden bg-white dark:bg-slate-900 border-t dark:border-slate-800 flex justify-around p-2 pb-safe z-40 shadow-[0_-4px_20_rgba(0,0,0,0.05)] shrink-0">
                <nav className="flex justify-around w-full">
                    <NavItem id="POS" icon="shopping-cart" label="Kasir" view={view} setView={setView} />
                    <NavItem id="INVENTORY" icon="package" label="Stok" view={view} setView={setView} />
                    <NavItem id="HISTORY" icon="clock" label="Riwayat" view={view} setView={setView} />
                    <NavItem id="ANALYTICS" icon="bar-chart-2" label="Bisnis" view={view} setView={setView} />
                    <NavItem id="KITCHEN" icon="chef-hat" label="Dapur" view={view} setView={setView} />
                    <button onClick={onLogout} className="flex flex-col items-center gap-1 p-2 rounded-xl text-red-500 dark:text-red-400 transition-colors" aria-label="Keluar">
                        <Icon name="log-out" size={24} />
                        <span className="text-[10px] font-medium">Keluar</span>
                    </button>
                </nav>
            </footer>

            <SettingsModal isOpen={setOpen} onClose={() => setSetOpen(false)} />
        </div>
    );
};

export default DashboardLayout;
