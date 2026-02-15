import { useEffect } from 'react';
import Icon from './Icon';

/**
 * Toast Notification
 */
const Toast = ({ msg, type = 'success', onClose }) => {
    useEffect(() => {
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [onClose]);

    const styles = {
        success: 'bg-emerald-50 dark:bg-emerald-900/40 border-emerald-100 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400',
        error: 'bg-red-50 dark:bg-red-950/40 border-red-100 dark:border-red-900/50 text-red-700 dark:text-red-400',
        warning: 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-900/50 text-amber-700 dark:text-amber-400',
        info: 'bg-blue-50 dark:bg-blue-950/40 border-blue-100 dark:border-blue-900/50 text-blue-700 dark:text-blue-400'
    };

    const icons = {
        success: 'check-circle',
        error: 'alert-circle',
        warning: 'alert-triangle',
        info: 'info'
    };

    const barColors = {
        success: 'bg-emerald-500',
        error: 'bg-red-500',
        warning: 'bg-amber-500',
        info: 'bg-blue-500'
    };

    return (
        <div className="fixed top-5 right-5 z-[120] animate-in slide-in-from-right fade-in duration-300">
            <div className={`flex flex-col gap-0 rounded-2xl shadow-2xl border overflow-hidden ${styles[type] || styles.success}`}>
                <div className="flex items-center gap-3 px-5 py-4">
                    <Icon name={icons[type] || icons.success} size={20} />
                    <span className="font-bold text-sm tracking-tight">{msg}</span>
                </div>
                {/* Progress Bar */}
                <div className="h-1 w-full bg-black/5 dark:bg-white/5">
                    <div
                        className={`h-full animate-progress-shrink origin-left ${barColors[type] || barColors.success}`}
                        style={{ animationDuration: '3000ms' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Toast;
