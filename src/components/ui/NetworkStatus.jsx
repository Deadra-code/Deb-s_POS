import { WifiOff, RefreshCw } from 'lucide-react';
import { syncOfflineOrders } from '../../services/api';

const NetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            syncOfflineOrders(); // Trigger sync when back online
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial check if online but have pending orders
        if (navigator.onLine) {
            syncOfflineOrders();
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[200] bg-red-600 text-white px-4 py-2 text-center text-sm font-bold flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
            <WifiOff size={16} />
            Koneksi Terputus. Beberapa fitur mungkin tidak berfungsi.
        </div>
    );
};

export default NetworkStatus;
