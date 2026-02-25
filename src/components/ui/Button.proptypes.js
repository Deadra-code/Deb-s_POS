import PropTypes from 'prop-types';

/**
 * Button Component with PropTypes
 */
const Button = ({ 
  variant = 'default', 
  size = 'default', 
  asChild = false, 
  className, 
  children, 
  ...props 
}) => {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </Comp>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']),
  size: PropTypes.oneOf(['default', 'sm', 'lg', 'icon', 'iconSm']),
  asChild: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
};

export { Button };
