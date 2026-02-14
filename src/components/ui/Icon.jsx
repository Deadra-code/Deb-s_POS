import * as LucideIcons from 'lucide-react';

/**
 * Icon Component Wrapper (Supaya kompatibel dengan style lama)
 */
const Icon = ({ name, size = 20, className = "" }) => {
    // Convert kebab-case to PascalCase (e.g. chef-hat -> ChefHat)
    const pascalName = name.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('');
    const LucideIcon = LucideIcons[pascalName] || LucideIcons.HelpCircle; // Fallback icon

    return <LucideIcon size={size} className={className} />;
};

export default Icon;
