import Icon from './Icon';

/**
 * Modal Component
 */
const Modal = ({ isOpen, onClose, title, children, footer, size = "md" }) => {
    if (!isOpen) return null;
    const maxW = size === 'lg' ? 'max-w-4xl' : size === 'xl' ? 'max-w-6xl' : 'max-w-md';

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 text-black">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className={`bg-white w-full ${maxW} rounded-t-2xl md:rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300 md:zoom-in-95`} onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b flex justify-between items-center bg-white rounded-t-2xl shrink-0 sticky top-0 z-20">
                    <h3 className="font-bold text-lg text-slate-800">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><Icon name="x" size={20} /></button>
                </div>
                <div className="p-5 overflow-y-auto custom-scroll flex-1">{children}</div>
                {footer && <div className="p-4 border-t bg-slate-50 md:rounded-b-2xl shrink-0 pb-safe">{footer}</div>}
            </div>
        </div>
    );
};

export default Modal;
