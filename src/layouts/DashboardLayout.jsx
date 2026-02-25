import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { getAll } from '../services/database';
import { Store, Package, ShoppingCart, Clock, ChefHat, Settings, LogOut, BarChart3, Sun, Moon } from 'lucide-react';
import SettingsModal from '../components/SettingsModal';
import Analytics from '../pages/Analytics';
import POS from '../pages/POS';
import Inventory from '../pages/Inventory';
import OrderHistory from '../pages/OrderHistory';
import Kitchen from '../pages/Kitchen';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Toaster } from '../hooks';

const NavItem = ({ id, icon: Icon, label, view, setView }) => (
  <button
    onClick={() => setView(id)}
    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 active:scale-95 ${
      view === id
        ? 'text-emerald-600 dark:text-emerald-400'
        : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
    }`}
  >
    <Icon
      size={24}
      className={view === id ? 'fill-emerald-50 dark:fill-emerald-900/20' : ''}
      strokeWidth={view === id ? 2.5 : 2}
    />
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

const SidebarItem = ({ id, icon: Icon, label, view, setView }) => (
  <button
    onClick={() => setView(id)}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-1 active:scale-[0.98] ${
      view === id
        ? 'bg-emerald-50 text-emerald-600 font-bold dark:bg-emerald-900/20 dark:text-emerald-400'
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
    }`}
  >
    <Icon size={20} strokeWidth={view === id ? 2.5 : 2} />
    <span className="text-sm">{label}</span>
  </button>
);

const DashboardLayout = ({ view, setView, onLogout }) => {
  const { theme, toggleTheme } = useTheme();
  const [menuData, setMenuData] = useState([]);
  const [setOpen, setSetOpen] = useState(false);
  const [menuLoading, setMenuLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const refreshData = useCallback(async () => {
    setMenuLoading(true);
    try {
      const products = await getAll('products');
      setMenuData(products);
    } catch (err) {
      console.error('Error loading menu:', err);
    } finally {
      setMenuLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <>
      <Toaster />
      <div className="flex flex-col font-sans bg-slate-50 dark:bg-slate-950 w-full h-screen text-slate-800 dark:text-slate-200 transition-colors duration-300">
        <div className="flex-1 overflow-hidden relative flex w-full">
          {/* Desktop Sidebar */}
          <aside className="hidden md:flex w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col p-6 z-50 shrink-0 overflow-hidden">
            <div className="p-4 border-b dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0">
              <h2 className="font-bold text-lg flex gap-2 items-center text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                <Store className="text-emerald-500" size={24} />
                Deb's POS
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-9 w-9 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-all active:rotate-12"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </Button>
            </div>
            <nav className="flex-1 py-4">
              <SidebarItem id="ANALYTICS" icon={BarChart3} label="Dashboard" view={view} setView={setView} />
              <SidebarItem id="POS" icon={ShoppingCart} label="Point of Sales" view={view} setView={setView} />
              <SidebarItem id="INVENTORY" icon={Package} label="Inventory" view={view} setView={setView} />
              <SidebarItem id="HISTORY" icon={Clock} label="Riwayat" view={view} setView={setView} />
              <SidebarItem id="KITCHEN" icon={ChefHat} label="Kitchen View" view={view} setView={setView} />
            </nav>
            <div className="border-t dark:border-slate-800 pt-4 space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:hover:bg-slate-800"
                onClick={() => setSetOpen(true)}
              >
                <Settings size={20} />
                <span className="text-sm">Pengaturan</span>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20"
                onClick={onLogout}
              >
                <LogOut size={20} />
                <span className="text-sm">Keluar</span>
              </Button>
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
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="h-full w-full"
              >
                {view === 'ANALYTICS' && <Analytics loading={menuLoading} />}
                {view === 'POS' && (
                  <POS menu={menuData} refreshData={refreshData} loading={menuLoading} />
                )}
                {view === 'INVENTORY' && (
                  <Inventory menu={menuData} refreshData={refreshData} loading={menuLoading} />
                )}
                {view === 'HISTORY' && <OrderHistory />}
                {view === 'KITCHEN' && <Kitchen />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Mobile Bottom Nav */}
        <footer className="md:hidden bg-white dark:bg-slate-900 border-t dark:border-slate-800 flex justify-around p-2 pb-safe z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] shrink-0">
          <nav className="flex justify-around w-full">
            <NavItem id="POS" icon={ShoppingCart} label="Kasir" view={view} setView={setView} />
            <NavItem id="INVENTORY" icon={Package} label="Stok" view={view} setView={setView} />
            <NavItem id="HISTORY" icon={Clock} label="Riwayat" view={view} setView={setView} />
            <NavItem id="ANALYTICS" icon={BarChart3} label="Bisnis" view={view} setView={setView} />
            <NavItem id="KITCHEN" icon={ChefHat} label="Dapur" view={view} setView={setView} />
            <button
              onClick={onLogout}
              className="flex flex-col items-center gap-1 p-2 rounded-xl text-red-500 dark:text-red-400 transition-colors active:scale-95"
              aria-label="Keluar"
            >
              <LogOut size={24} />
              <span className="text-[10px] font-medium">Keluar</span>
            </button>
          </nav>
        </footer>

        <SettingsModal isOpen={setOpen} onClose={() => setSetOpen(false)} />
      </div>
    </>
  );
};

export default DashboardLayout;
