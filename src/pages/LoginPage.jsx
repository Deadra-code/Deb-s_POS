import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Store, ArrowRight, Loader2 } from '../components/ui/icons';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { getAll, seedInitialData } from '../services/database';
import { verifyPasscode, isHashed } from '../utils/security';
import { Toaster } from '../hooks';

const LoginPage = ({ onLogin }) => {
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);

  useEffect(() => {
    // Initialize database with seed data on first load
    const initDB = async () => {
      try {
        await seedInitialData();
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Failed to initialize database:', err);
        }
      }
    };
    initDB();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const users = await getAll('users');
      let authenticatedUser = null;

      for (const user of users) {
        // Check if password is hashed
        if (isHashed(user.password)) {
          const isValid = await verifyPasscode(passcode, user.password);
          if (isValid) {
            authenticatedUser = user;
            break;
          }
        } else {
          // Legacy plain text comparison (for backward compatibility during migration)
          if (user.password === passcode) {
            authenticatedUser = user;
            // Upgrade to hashed password
            const { hashPasscode } = await import('../utils/security.js');
            user.password = await hashPasscode(passcode);
            await import('../services/database.js').then(({ update }) => 
              update('users', user)
            );
            break;
          }
        }
      }

      if (authenticatedUser) {
        // Simulate small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 300));
        localStorage.setItem('POS_TOKEN', authenticatedUser.username);
        localStorage.setItem('POS_ROLE', authenticatedUser.role);
        onLogin(authenticatedUser.username);
      } else {
        setError('Passcode salah. Silakan coba lagi.');
        setPasscode('');
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Login error:', err);
      }
      setError('Gagal login. Pastikan database terinisialisasi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950 flex font-sans transition-colors duration-500">
        {/* Left Side - Visual (Hidden on Mobile) */}
        <AnimatePresence>
          {typeof window !== 'undefined' && window.innerWidth >= 1024 && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 to-teal-600 relative overflow-hidden items-center justify-center p-12"
            >
              <div className="z-10 text-white max-w-md">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 shadow-2xl overflow-hidden">
                    <Store size={36} className="text-white" />
                  </div>
                  <h1 className="text-5xl font-black mb-6 leading-tight">
                    Deb&apos;s Store POS System
                  </h1>
                  <p className="text-emerald-50 text-xl font-medium opacity-90 leading-relaxed">
                    Kelola inventaris, pantau laporan, dan proses transaksi lebih cepat dan elegan.
                  </p>
                </motion.div>
              </div>

              {/* Abstract Background Shapes */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl"
              />
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                }}
                className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-white/10 rounded-full blur-2xl"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full max-w-md"
          >
            {/* Mobile Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden flex items-center gap-3 mb-10"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                <Store size={24} />
              </div>
              <span className="font-black text-2xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                Deb&apos;s Store
              </span>
            </motion.div>

            <Card className="border-0 shadow-2xl shadow-emerald-500/10 dark:shadow-emerald-900/20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
              <CardContent className="p-8 sm:p-10">
                <div className="mb-10">
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight"
                  >
                    Selamat Datang!
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    className="text-slate-500 dark:text-slate-400 font-medium"
                  >
                    Input passcode untuk masuk ke sistem.
                  </motion.p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm text-center font-bold border border-red-100 dark:border-red-900/50"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="space-y-2"
                  >
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                      Passcode Sistem
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                        <Lock size={20} />
                      </div>
                      <Input
                        type={showPasscode ? 'text' : 'password'}
                        required
                        className="w-full bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 p-4 pl-12 rounded-xl outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-800 dark:text-white font-bold h-14"
                        placeholder="••••••"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasscode(!showPasscode)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        {showPasscode ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                  >
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-6 rounded-xl font-black text-lg shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale h-14"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="animate-spin" size={20} />
                          <span>Memverifikasi...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>Masuk Sekarang</span>
                          <ArrowRight size={20} />
                        </div>
                      )}
                    </Button>
                  </motion.div>
                </form>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 text-center"
                >
                  <p className="text-slate-400 dark:text-slate-600 text-xs font-medium tracking-wide">
                    © {new Date().getFullYear()} Deb&apos;s Store POS. All Rights Reserved.
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
