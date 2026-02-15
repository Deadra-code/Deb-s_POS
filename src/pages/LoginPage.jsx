import { useState } from 'react';
import { motion } from 'framer-motion';
import { fetchData } from '../services/api';
import Icon from '../components/ui/Icon';

const LoginPage = ({ onLogin }) => {
    const [pass, setPass] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const payload = { passcode: pass };
        fetchData('login', 'POST', payload).then(res => {
            setLoading(false);
            if (res.success) {
                onLogin(res.token);
            } else {
                setError(res.error || "Login Gagal");
            }
        }).catch(() => {
            setLoading(false);
            setError("Gagal menghubungi server");
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans transition-colors duration-500">
            {/* Left Side - Visual (Hidden on Mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-emerald-600 dark:bg-emerald-500 relative overflow-hidden items-center justify-center p-12">
                <div className="z-10 text-white max-w-md">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 shadow-2xl">
                            <Icon name="layout" size={32} />
                        </div>
                        <h1 className="text-5xl font-black mb-6 leading-tight">Deb&apos;s Store POS System</h1>
                        <p className="text-emerald-50 text-xl font-medium opacity-90 leading-relaxed">
                            Kelola inventaris, pantau laporan, dan proses transaksi lebih cepat dan elegan.
                        </p>
                    </motion.div>
                </div>

                {/* Abstract Background Shapes */}
                <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-20">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                            <Icon name="layout" size={20} />
                        </div>
                        <span className="font-black text-2xl tracking-tight text-emerald-600 dark:text-emerald-500">Deb&apos;s Store</span>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Selamat Datang!</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Input passcode untuk masuk ke sistem.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm text-center font-bold border border-red-100 dark:border-red-900/50">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">Passcode Sistem</label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                    <Icon name="lock" size={20} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-4 pl-12 rounded-2xl outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all text-slate-800 dark:text-white font-bold"
                                    placeholder="••••••"
                                    value={pass}
                                    onChange={(e) => setPass(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-600 dark:bg-emerald-500 text-white py-4.5 rounded-2xl font-black text-lg shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 dark:hover:bg-emerald-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale h-16 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Icon name="loader-2" className="animate-spin" size={20} />
                                    <span>Memverifikasi...</span>
                                </div>
                            ) : (
                                <>Masuk Sekarang <Icon name="arrow-right" size={20} /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-900 text-center">
                        <p className="text-slate-400 dark:text-slate-600 text-xs font-medium tracking-wide">
                            &copy; {new Date().getFullYear()} Deb&apos;s Store POS. All Rights Reserved.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
