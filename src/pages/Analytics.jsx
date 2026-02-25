import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ScrollArea } from '../components/ui/ScrollArea';
import { Toaster } from '../hooks';
import { getSalesReport } from '../services/indexeddb-api';
import { formatCurrency } from '../utils/format';
import haptics from '../services/haptics';

// Simple Bar Chart Component
const SimpleBarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-slate-400 dark:text-slate-500">
        <p className="text-sm">Tidak ada data</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.revenue));

  return (
    <div className="h-48 flex items-end gap-2 pt-4">
      {data.map((item, index) => (
        <div key={index} className="flex-1 flex flex-col items-center gap-1">
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: `${(item.revenue / maxValue) * 100}%`, opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg min-h-[4px]"
          />
          <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full text-center">
            {item.name.slice(5)} {/* Extract MM-DD from date */}
          </span>
        </div>
      ))}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, trend, color = 'emerald' }) => {
  const colors = {
    emerald: 'from-emerald-500 to-teal-400',
    blue: 'from-blue-500 to-cyan-400',
    purple: 'from-purple-500 to-pink-400',
    orange: 'from-orange-500 to-red-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {title}
              </p>
              <p className="text-xl font-black text-slate-800 dark:text-white mt-1">
                {value}
              </p>
              {trend !== undefined && (
                <div className={`flex items-center gap-1 mt-1 text-xs ${trend >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  <span className="font-bold">{Math.abs(trend)}% dari kemarin</span>
                </div>
              )}
            </div>
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-lg`}>
              <Icon className="text-white" size={24} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Top Items List Component
const TopItemsList = ({ items }) => {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400 dark:text-slate-500">
        <Package size={40} className="mx-auto mb-2 opacity-20" />
        <p className="text-sm">Belum ada data penjualan</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-xl p-3"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                #{index + 1}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-800 dark:text-white text-sm truncate">
                {item.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {item.qty} terjual • {formatCurrency(item.revenue)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
};

const Analytics = ({ loading: parentLoading }) => {
  const [data, setData] = useState({
    transactions: [],
    totalRevenue: 0,
    totalOrders: 0,
    salesByDate: [],
    topItems: [],
  });
  const [localLoading, setLocalLoading] = useState(true);
  const [period, setPeriod] = useState('HARI_INI');

  const isLoading = parentLoading || localLoading;

  useEffect(() => {
    const loadData = async () => {
      setLocalLoading(true);
      try {
        const report = await getSalesReport();
        setData(report);
      } catch (err) {
        console.error('Failed to load sales report:', err);
      } finally {
        setLocalLoading(false);
      }
    };
    loadData();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    let filteredTransactions = data.transactions || [];

    // Filter by period
    if (period === 'HARI_INI') {
      filteredTransactions = filteredTransactions.filter(
        (t) => new Date(t.createdAt).toDateString() === now.toDateString()
      );
    } else if (period === 'MINGGU_INI') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredTransactions = filteredTransactions.filter(
        (t) => new Date(t.createdAt) >= weekAgo
      );
    } else if (period === 'BULAN_INI') {
      filteredTransactions = filteredTransactions.filter(
        (t) =>
          new Date(t.createdAt).getMonth() === now.getMonth() &&
          new Date(t.createdAt).getFullYear() === now.getFullYear()
      );
    }

    const revenue = filteredTransactions.reduce((sum, t) => sum + (t.total || 0), 0);
    const orders = filteredTransactions.length;

    // Calculate profit (assuming 30% average margin)
    const profit = revenue * 0.3;

    return {
      revenue,
      profit,
      orders,
      avgOrderValue: orders > 0 ? revenue / orders : 0,
    };
  }, [data, period]);

  const periodButtons = [
    { id: 'HARI_INI', label: 'Hari Ini' },
    { id: 'MINGGU_INI', label: 'Minggu Ini' },
    { id: 'BULAN_INI', label: 'Bulan Ini' },
  ];

  return (
    <>
      <Toaster />
      <main className="p-4 md:p-6 h-full overflow-y-auto bg-slate-50 dark:bg-slate-950">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">
              Dashboard Bisnis
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Analisis performa penjualan
            </p>
          </div>

          <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            {periodButtons.map((btn) => (
              <button
                key={btn.id}
                onClick={() => {
                  haptics.tick();
                  setPeriod(btn.id);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  period === btn.id
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-500 dark:text-slate-400 hover:text-emerald-500'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-32" />
                        </div>
                        <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
            <Card className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" />
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded" />
              </CardContent>
            </Card>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Penjualan"
                value={formatCurrency(stats.revenue)}
                icon={DollarSign}
                trend={12}
                color="emerald"
              />
              <StatCard
                title="Total Pesanan"
                value={stats.orders}
                icon={ShoppingCart}
                trend={8}
                color="blue"
              />
              <StatCard
                title="Estimasi Profit"
                value={formatCurrency(stats.profit)}
                icon={TrendingUp}
                trend={15}
                color="purple"
              />
              <StatCard
                title="Rata-rata/Order"
                value={formatCurrency(stats.avgOrderValue)}
                icon={Package}
                trend={-3}
                color="orange"
              />
            </div>

            {/* Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar size={20} className="text-emerald-500" />
                  Grafik Penjualan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleBarChart data={data.salesByDate || []} />
              </CardContent>
            </Card>

            {/* Top Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package size={20} className="text-emerald-500" />
                    Produk Terlaris
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <TopItemsList items={data.topItems || []} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp size={20} className="text-emerald-500" />
                    Ringkasan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">
                      Transaksi Berhasil
                    </span>
                    <Badge variant="success">{data.transactions.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">
                      Periode
                    </span>
                    <span className="font-bold text-slate-800 dark:text-white text-sm">
                      {period === 'HARI_INI'
                        ? 'Hari Ini'
                        : period === 'MINGGU_INI'
                        ? '7 Hari Terakhir'
                        : 'Bulan Ini'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">
                      Margin Profit
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      ~30%
                    </span>
                  </div>
                  <div className="pt-4">
                    <Button className="w-full" variant="outline">
                      Export Laporan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </main>
    </>
  );
};

export default Analytics;
