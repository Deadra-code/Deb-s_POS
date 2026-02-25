import * as IconRegistry from './icons';
import { memo } from 'react';

// Simple cache for icon names
const nameCache = new Map();

/**
 * Icon Component Wrapper (Supaya kompatibel dengan style lama)
 */
const Icon = memo(({ name, size = 20, className = "" }) => {
    let pascalName = nameCache.get(name);

    if (!pascalName) {
        // Convert kebab-case to PascalCase (e.g. chef-hat -> ChefHat)
        const parts = name.split('-');
        const pascalParts = parts.map(part => part.charAt(0).toUpperCase() + part.slice(1));
        pascalName = pascalParts.join('');
        nameCache.set(name, pascalName);
    }

    const LucideIcon = IconRegistry[pascalName] || IconRegistry.HelpCircle; // Fallback icon

    return <LucideIcon size={size} className={className} />;
});

Icon.displayName = 'Icon';

export default Icon;
