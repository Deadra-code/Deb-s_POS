import { useEffect } from 'react';
import Icon from './Icon';

/**
 * Toast Notification
 */
const Toast = ({ msg, type = 'success', onClose }) => {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
    return (
        <div className="fixed top-5 right-5 z-[120] animate-in slide-in-from-right fade-in duration-300">
            <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${type === 'error' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                <Icon name={type === 'error' ? 'alert-circle' : 'check-circle'} size={20} /> <span className="font-bold text-sm">{msg}</span>
            </div>
        </div>
    );
};

export default Toast;
