import { useState } from 'react';
import { Loader, Utensils } from 'lucide-react';
import { fetchData } from '../services/api';
import Icon from '../components/ui/Icon';

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
                onLogin(res.token);
            } else {
                setError(res.error || "Login Gagal");
            }
        }).catch(err => {
            setLoading(false);
            setError("Gagal menghubungi server");
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-slate-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-emerald-200">
                        <Utensils size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Deb's POS Pro</h1>
                    <p className="text-slate-400 text-sm">Silakan login untuk melanjutkan</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-bold border border-red-100">{error}</div>}

                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Username</label>
                        <input type="text" required className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Password</label>
                        <input type="password" required className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
                    </div>

                    <button disabled={loading} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? <Loader className="animate-spin mx-auto" /> : "Masuk Aplikasi"}
                    </button>
                </form>

                <div className="mt-8 text-center text-xs text-slate-300">
                    &copy; 2025 Deb's Manager System
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
