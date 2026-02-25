import Icon from './Icon';

/**
 * Modal Component
 */
const Modal = ({ isOpen, onClose, title, children, footer, size = "md" }) => {
    if (!isOpen) return null;
    const maxW = size === 'lg' ? 'max-w-4xl' : size === 'xl' ? 'max-w-6xl' : 'max-w-md';

    const handleContentClick = (e) => e.stopPropagation();

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 text-black dark:text-white transition-all duration-300">
            <button type="button"
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity border-none w-full h-full cursor-default"
                onClick={onClose}
                aria-label="Tutup modal"
                tabIndex="-1"
            ></button>
            <div
                className={`bg-white dark:bg-slate-900 w-full ${maxW} rounded-t-2xl md:rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300 md:zoom-in-95 border border-transparent dark:border-slate-800 overflow-hidden`}
                onClick={handleContentClick}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <div className="p-5 border-b dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 shrink-0 sticky top-0 z-20">
                    <h3 id="modal-title" className="font-bold text-xl text-slate-800 dark:text-slate-100">{title}</h3>
                    <button type="button" onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 transition-colors" aria-label="Tutup"><Icon name="x" size={20} /></button>
                </div>
                <div className="p-6 overflow-y-auto custom-scroll flex-1 text-slate-700 dark:text-slate-300">{children}</div>
                {footer && <div className="p-5 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 md:rounded-b-2xl shrink-0 pb-safe">{footer}</div>}
            </div>
        </div>
    );
};

export default Modal;
