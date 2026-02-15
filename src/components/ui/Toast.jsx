import { useEffect } from 'react';
import Icon from './Icon';

/**
 * Toast Notification
 */
const Toast = ({ msg, type = 'success', onClose }) => {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
    return (
        <div className="fixed top-5 right-5 z-[120] animate-in slide-in-from-right fade-in duration-300">
            <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border ${type === 'error' ? 'bg-red-50 dark:bg-red-950/40 border-red-100 dark:border-red-900/50 text-red-700 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-100 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400'}`}>
                <Icon name={type === 'error' ? 'alert-circle' : 'check-circle'} size={20} /> <span className="font-bold text-sm tracking-tight">{msg}</span>
            </div>
        </div>
    );
};

export default Toast;
