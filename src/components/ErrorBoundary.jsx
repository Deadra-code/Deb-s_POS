import React from 'react';
import { AlertTriangle, RefreshCw } from './ui/icons';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 font-sans transition-colors duration-300">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100 dark:border-slate-800 text-center overflow-hidden">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400 mx-auto mb-6">
                            <AlertTriangle size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Waduh, ada masalah!</h1>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
                            Terjadi kesalahan tak terduga dalam aplikasi. Silakan coba segarkan halaman atau hubungi pengembang.
                        </p>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                        >
                            <RefreshCw size={20} />
                            Segarkan Halaman
                        </button>
                        {process.env.NODE_ENV === 'development' && (
                            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-800 rounded-lg text-left overflow-auto max-h-40">
                                <p className="text-xs font-mono text-red-500 dark:text-red-400">{this.state.error?.toString()}</p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
