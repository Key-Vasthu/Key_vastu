import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/helpers';
import Loading from './Loading';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'gold' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-saffron-500 to-saffron-600 text-white hover:from-saffron-600 hover:to-saffron-700 shadow-md hover:shadow-saffron focus-visible:ring-saffron-500',
    secondary: 'bg-gradient-to-r from-astral-500 to-astral-600 text-white hover:from-astral-600 hover:to-astral-700 shadow-md focus-visible:ring-astral-400',
    gold: 'bg-gradient-to-r from-gold-500 to-gold-600 text-white hover:from-gold-600 hover:to-gold-700 shadow-gold focus-visible:ring-gold-500',
    outline: 'border-2 border-gold-500 text-gold-600 hover:bg-gold-50 focus-visible:ring-gold-500',
    ghost: 'text-earth-600 hover:text-saffron-600 hover:bg-saffron-50',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md focus-visible:ring-red-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-5 py-2.5 text-base gap-2',
    lg: 'px-7 py-3.5 text-lg gap-2.5',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && 'w-full',
        (disabled || isLoading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="flex-shrink-0 mr-2">
            <svg
              className="animate-spin h-3.5 w-3.5 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-30"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-80"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
          {children}
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
};

export default Button;

