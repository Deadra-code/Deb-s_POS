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
    <button onClick={() => setView(id)} className={`flex flex-col items-center gap-1 p-2 transition-all ${view === id ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-primary dark:hover:text-primary'}`}>
        <Icon name={icon} size={24} />
        <span className={`text-[10px] ${view === id ? 'font-bold' : 'font-medium'}`}>{label}</span>
    </button>
);

const SidebarItem = ({ id, icon, label, view, setView }) => (
    <button onClick={() => setView(id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1 ${view === id ? 'bg-primary text-background-dark font-bold shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-neutral-dark dark:hover:text-slate-200'}`}>
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
        <div className="flex flex-col font-display bg-background-light dark:bg-background-dark w-full h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300">
            <div className="flex-1 overflow-hidden relative flex w-full">
                {/* Desktop Sidebar */}
                <aside className="hidden md:flex w-64 bg-white dark:bg-neutral-dark border-r border-slate-200 dark:border-primary/5 flex-col p-6 z-50 shrink-0 overflow-hidden">
                    <div className="pt-4 pb-8 border-b dark:border-primary/5 flex justify-between items-center">
                        <h2 className="font-bold text-xl flex gap-2 items-center tracking-tight text-slate-900 dark:text-white">
                            <Icon name="store" className="text-primary" /> Deb&apos;s POS
                        </h2>
                    </div>

                    <div className="flex-1 py-6">
                        <SidebarItem id="ANALYTICS" icon="bar-chart-2" label="Dashboard" view={view} setView={setView} />
                        <SidebarItem id="POS" icon="shopping-cart" label="Point of Sales" view={view} setView={setView} />
                        <SidebarItem id="INVENTORY" icon="package" label="Inventory" view={view} setView={setView} />
                        <SidebarItem id="HISTORY" icon="clock" label="Riwayat" view={view} setView={setView} />
                        <SidebarItem id="KITCHEN" icon="chef-hat" label="Kitchen View" view={view} setView={setView} />
                    </div>

                    <div className="border-t dark:border-primary/5 pt-4 space-y-2">
                        <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all" aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={20} />
                            <span className="text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>
                        <button onClick={() => setSetOpen(true)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"><Icon name="settings" size={20} /><span className="text-sm">Pengaturan</span></button>
                        <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"><Icon name="log-out" size={20} /><span className="text-sm">Keluar</span></button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 relative overflow-hidden bg-background-light dark:bg-background-dark w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={view}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="h-full w-full"
                        >
                            {view === 'ANALYTICS' && <Analytics loading={menuLoading} />}
                            {view === 'POS' && <POS menu={menuData} refreshData={refreshData} loading={menuLoading} />}
                            {view === 'INVENTORY' && <Inventory menu={menuData} refreshData={refreshData} loading={menuLoading} />}
                            {view === 'HISTORY' && <OrderHistory />}
                            {view === 'KITCHEN' && <Kitchen />}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <footer className="md:hidden glass-nav shadow-lg pt-2 pb-8 px-4 z-40 shrink-0">
                <nav className="flex justify-around items-center w-full relative">
                    <NavItem id="ANALYTICS" icon="bar-chart-2" label="Home" view={view} setView={setView} />
                    <NavItem id="POS" icon="shopping-cart" label="Kasir" view={view} setView={setView} />
                    <NavItem id="INVENTORY" icon="package" label="Stok" view={view} setView={setView} />
                    <NavItem id="HISTORY" icon="clock" label="Riwayat" view={view} setView={setView} />
                    <NavItem id="KITCHEN" icon="chef-hat" label="Dapur" view={view} setView={setView} />
                </nav>
                {/* iOS Handle Indicator */}
                <div className="h-1 w-24 bg-slate-400/20 mx-auto mt-4 rounded-full"></div>
            </footer>

            <SettingsModal isOpen={setOpen} onClose={() => setSetOpen(false)} />
        </div>
    );
};

export default DashboardLayout;
