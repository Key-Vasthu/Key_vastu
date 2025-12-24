import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'gold' | 'elevated' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className,
  onClick,
  hoverable = false,
}) => {
  const variantClasses = {
    default: 'bg-white border border-earth-100 shadow-md',
    gold: 'bg-white border-2 border-gold-200 shadow-md hover:shadow-gold hover:border-gold-400',
    elevated: 'bg-white shadow-lg',
    flat: 'bg-cream-100 border border-earth-100',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const Wrapper = onClick || hoverable ? motion.div : 'div';
  const motionProps = onClick || hoverable ? {
    whileHover: { scale: 1.02, y: -4 },
    whileTap: onClick ? { scale: 0.98 } : undefined,
  } : {};

  return (
    <Wrapper
      className={cn(
        'rounded-xl overflow-hidden transition-all duration-300',
        variantClasses[variant],
        paddingClasses[padding],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </Wrapper>
  );
};

export default Card;

