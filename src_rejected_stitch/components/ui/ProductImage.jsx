import { useState } from 'react';
import Icon from './Icon';

/**
 * Image Component
 */
const ProductImage = ({ src, alt }) => {
    const [err, setErr] = useState(false);
    if (!src || err) return <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600"><Icon name="utensils-crossed" size={24} /></div>;
    return <img src={src} alt={alt} className="w-full h-full object-cover" onError={() => setErr(true)} loading="lazy" />;
};

export default ProductImage;
