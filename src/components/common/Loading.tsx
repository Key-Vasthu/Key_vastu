import React from 'react';
import { motion } from 'framer-motion';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ size = 'md', text = 'Loading...', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const Spinner = () => (
    <div className="relative">
      {/* Outer ring */}
      <motion.div
        className={`${sizeClasses[size]} rounded-full border-4 border-earth-200`}
        style={{ borderTopColor: '#d4a418', borderRightColor: '#f97316' }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      {/* Inner mandala */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: -360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="0 0 40 40" className={size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'}>
          <circle cx="20" cy="20" r="6" fill="none" stroke="#d4a418" strokeWidth="1" />
          <line x1="20" y1="14" x2="20" y2="6" stroke="#d4a418" strokeWidth="1" />
          <line x1="20" y1="26" x2="20" y2="34" stroke="#d4a418" strokeWidth="1" />
          <line x1="14" y1="20" x2="6" y2="20" stroke="#d4a418" strokeWidth="1" />
          <line x1="26" y1="20" x2="34" y2="20" stroke="#d4a418" strokeWidth="1" />
        </svg>
      </motion.div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-cream-50/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
        <Spinner />
        {text && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-earth-600 font-medium"
          >
            {text}
          </motion.p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Spinner />
      {text && <p className="mt-4 text-earth-600 font-medium">{text}</p>}
    </div>
  );
};

export default Loading;

