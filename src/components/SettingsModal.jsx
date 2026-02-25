import { useState, useEffect } from 'react';
import { fetchData } from '../services/api';
import { useToast } from '../hooks';
import Modal from '../components/ui/Modal';
import Icon from './ui/Icon';

const SettingsModal = ({ isOpen, onClose }) => {
    const { toast } = useToast();
    const [config, setConfig] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchData('getSettings')
                .then(setConfig)
                .catch(() => {
                    toast({ title: 'Gagal memuat pengaturan', variant: 'destructive' });
                });
        }
    }, [isOpen, toast]);

    const save = async () => {
        setLoading(true);
        try {
            await fetchData('saveSettings', 'POST', config);
            toast({ title: 'Pengaturan berhasil disimpan', variant: 'success' });
            onClose();
        } catch {
            toast({ title: 'Gagal menyimpan pengaturan', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Pengaturan Toko"
            footer={
                <button
                    onClick={save}
                    disabled={loading}
                    className="w-full bg-slate-900 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white py-4 rounded-2xl font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 h-14"
                >
                    {loading ? <div className="animate-spin"><Icon name="loader" size={18} /></div> : (
                        <><Icon name="save" size={18} /> Simpan Perubahan</>
                    )}
                </button>
            }
        >
            <div className="space-y-6 text-slate-800 dark:text-slate-100">
                <div className="space-y-2">
                    <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Nama Toko</label>
                    <input
                        className="w-full bg-slate-50 dark:bg-slate-800 border-none p-4 rounded-2xl font-bold text-slate-800 dark:text-slate-100 shadow-inner outline-none focus:ring-2 focus:ring-emerald-500 overflow-hidden"
                        value={config.Store_Name || ''}
                        onChange={e => setConfig({ ...config, Store_Name: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Pajak (%)</label>
                        <input
                            type="number"
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none p-4 rounded-2xl font-bold text-slate-800 dark:text-slate-100 shadow-inner outline-none focus:ring-2 focus:ring-emerald-500"
                            value={config.Tax_Rate || ''}
                            onChange={e => setConfig({ ...config, Tax_Rate: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest">Service (%)</label>
                        <input
                            type="number"
                            className="w-full bg-slate-50 dark:bg-slate-800 border-none p-4 rounded-2xl font-bold text-slate-800 dark:text-slate-100 shadow-inner outline-none focus:ring-2 focus:ring-emerald-500"
                            value={config.Service_Charge || ''}
                            onChange={e => setConfig({ ...config, Service_Charge: e.target.value })}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default SettingsModal;
