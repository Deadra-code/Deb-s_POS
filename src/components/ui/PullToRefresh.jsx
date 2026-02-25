import { motion, useMotionValue, useTransform } from 'framer-motion';
import { RefreshCw } from './icons';
import { useState, useEffect } from 'react';
import haptics from '../../services/haptics';

const PullToRefresh = ({ onRefresh, isRefreshing }) => {
    const y = useMotionValue(0);
    const opacity = useTransform(y, [0, 80], [0, 1]);
    const rotate = useTransform(y, [0, 80], [0, 360]);
    const [hasTriggered, setHasTriggered] = useState(false);

    useEffect(() => {
        return y.on("change", latest => {
            if (latest > 80 && !hasTriggered && !isRefreshing) {
                haptics.tick();
                setHasTriggered(true);
                onRefresh();
            }
        });
    }, []);

    useEffect(() => {
        if (!isRefreshing) {
            queueMicrotask(() => {
                setHasTriggered(prev => {
                    if (prev === false) return prev;
                    return false;
                });
            });
            y.set(0);
        }
    }, [isRefreshing, y]);

    return (
        <motion.div
            style={{ y, opacity, touchAction: "none" }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 100 }}
            dragElastic={0.2}
            onDragEnd={() => !isRefreshing && y.set(0)}
            className="absolute top-0 left-0 right-0 z-50 flex justify-center pt-2 pointer-events-none"
        >
            <motion.div
                style={{ rotate }}
                className="bg-white dark:bg-slate-800 p-2 rounded-full shadow-lg border border-slate-100 dark:border-slate-700 text-emerald-600 dark:text-emerald-400"
            >
                <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
            </motion.div>
        </motion.div>
    );
};

export default PullToRefresh;
