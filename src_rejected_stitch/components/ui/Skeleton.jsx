import { motion } from 'framer-motion';

export const Skeleton = ({ className }) => (
    <motion.div
        className={`bg-slate-200 dark:bg-slate-800 rounded-xl overflow-hidden relative ${className}`}
    >
        <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent skew-x-12"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        />
    </motion.div>
);

export const ProductCardSkeleton = () => (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[110px] overflow-hidden">
        <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="flex justify-between items-center mt-3">
            <Skeleton className="h-5 w-24" />
        </div>
    </div>
);
