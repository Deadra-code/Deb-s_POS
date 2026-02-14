import { useState, useEffect } from 'react';
import { fetchData } from '../services/api';
import Modal from '../components/ui/Modal';

const SettingsModal = ({ isOpen, onClose }) => {
    const [config, setConfig] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) fetchData('getSettings').then(setConfig);
    }, [isOpen]);

    const save = () => {
        setLoading(true);
        fetchData('saveSettings', 'POST', config).then(() => {
            setLoading(false); onClose(); alert("Disimpan!");
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Pengaturan Toko" footer={<button onClick={save} disabled={loading} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</button>}>
            <div className="space-y-4 text-slate-800">
                <div><label className="text-xs font-bold uppercase text-slate-500">Nama Toko</label><input className="w-full border p-2 rounded-lg bg-white" value={config.Store_Name || ''} onChange={e => setConfig({ ...config, Store_Name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-bold uppercase text-slate-500">Pajak (%)</label><input type="number" className="w-full border p-2 rounded-lg bg-white" value={config.Tax_Rate || ''} onChange={e => setConfig({ ...config, Tax_Rate: e.target.value })} /></div>
                    <div><label className="text-xs font-bold uppercase text-slate-500">Service (%)</label><input type="number" className="w-full border p-2 rounded-lg bg-white" value={config.Service_Charge || ''} onChange={e => setConfig({ ...config, Service_Charge: e.target.value })} /></div>
                </div>
            </div>
        </Modal>
    );
};

export default SettingsModal;
