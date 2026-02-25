import * as React from 'react';
import { cn } from '../../lib/utils';

const Badge = React.forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    outline: 'border border-input bg-background',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
  };

  const sizes = {
    default: 'px-2.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-[10px]',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
Badge.displayName = 'Badge';

export { Badge };
