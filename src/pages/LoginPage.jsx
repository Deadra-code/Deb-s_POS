import { useState } from 'react';
import { Loader, Utensils } from 'lucide-react';
import { fetchData } from '../services/api';
import Icon from '../components/ui/Icon';
import haptics from '../services/haptics';

const LoginPage = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const payload = { username, password };
        fetchData('login', 'POST', payload).then(res => {
            setLoading(false);
            if (res.success) {
                haptics.success();
                onLogin(res.token);
            } else {
                haptics.error();
                setError(res.error || "Login Gagal");
            }
        }).catch(err => {
            haptics.error();
            setLoading(false);
            setError("Gagal menghubungi server");
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><Utensils size={100} /></div>

                <div className="text-center mb-8 relative z-10">
                    <div className="w-20 h-20 bg-emerald-500 dark:bg-emerald-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-emerald-500/20 rotate-3">
                        <Utensils size={40} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Deb's POS Pro</h1>
                    <p className="text-slate-400 dark:text-slate-500 text-sm font-medium mt-1">Silakan login untuk melanjutkan</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                    {error && (
                        <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm text-center font-bold border border-red-100 dark:border-red-900/50 animate-bounce">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase text-slate-400 dark:text-slate-500 ml-1">Username</label>
                        <input
                            type="text"
                            required
                            className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all shadow-inner"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="admin"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold uppercase text-slate-400 dark:text-slate-500 ml-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-700 focus:ring-4 focus:ring-emerald-500/20 outline-none transition-all shadow-inner"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        disabled={loading}
                        className="w-full py-4.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader className="animate-spin" /> : <>Masuk Aplikasi <Icon name="arrow-right" size={20} /></>}
                    </button>
                </form>

                <div className="mt-10 text-center text-[10px] font-bold uppercase tracking-widest text-slate-300 dark:text-slate-700">
                    &copy; 2025 Deb's Manager System
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
