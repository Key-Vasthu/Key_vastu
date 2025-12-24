import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

interface AshtadikpalakasDisplayProps {
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  className?: string;
}

// The 8 Directional Guardians (Ashtadikpalakas)
const dikpalakas = [
  {
    direction: 'E',
    angle: 0,
    name: 'Indra',
    sanskrit: 'इन्द्र',
    title: 'King of Devas',
    element: 'Sun',
    color: '#f97316',
    symbol: '⚡',
    vasthu: 'Main entrance, prosperity',
  },
  {
    direction: 'SE',
    angle: 45,
    name: 'Agni',
    sanskrit: 'अग्नि',
    title: 'Fire God',
    element: 'Fire',
    color: '#ef4444',
    symbol: '🔥',
    vasthu: 'Kitchen, fire elements',
  },
  {
    direction: 'S',
    angle: 90,
    name: 'Yama',
    sanskrit: 'यम',
    title: 'Lord of Death',
    element: 'Earth',
    color: '#22c55e',
    symbol: '⚖️',
    vasthu: 'Ancestors, dharma',
  },
  {
    direction: 'SW',
    angle: 135,
    name: 'Nirrti',
    sanskrit: 'निर्ऋति',
    title: 'Goddess of Dissolution',
    element: 'Earth',
    color: '#a855f7',
    symbol: '💀',
    vasthu: 'Master bedroom, stability',
  },
  {
    direction: 'W',
    angle: 180,
    name: 'Varuna',
    sanskrit: 'वरुण',
    title: 'Lord of Waters',
    element: 'Water',
    color: '#06b6d4',
    symbol: '🌊',
    vasthu: 'Water storage, dining',
  },
  {
    direction: 'NW',
    angle: 225,
    name: 'Vayu',
    sanskrit: 'वायु',
    title: 'Wind God',
    element: 'Air',
    color: '#94a3b8',
    symbol: '💨',
    vasthu: 'Guest room, movement',
  },
  {
    direction: 'N',
    angle: 270,
    name: 'Kubera',
    sanskrit: 'कुबेर',
    title: 'Lord of Wealth',
    element: 'Mercury',
    color: '#fbbf24',
    symbol: '💰',
    vasthu: 'Treasury, valuables',
  },
  {
    direction: 'NE',
    angle: 315,
    name: 'Ishana',
    sanskrit: 'ईशान',
    title: 'Lord Shiva',
    element: 'Water',
    color: '#60a5fa',
    symbol: '🕉️',
    vasthu: 'Puja room, meditation',
  },
];

const AshtadikpalakasDisplay: React.FC<AshtadikpalakasDisplayProps> = ({
  size = 'md',
  interactive = true,
  className,
}) => {
  const [selectedGuardian, setSelectedGuardian] = useState<typeof dikpalakas[0] | null>(null);

  const sizeValues = {
    sm: { container: 240, radius: 90, iconSize: 28 },
    md: { container: 340, radius: 130, iconSize: 40 },
    lg: { container: 440, radius: 170, iconSize: 52 },
  };

  const { container, radius, iconSize } = sizeValues[size];
  const center = container / 2;

  const getPosition = (angle: number) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x: center + radius * Math.cos(rad),
      y: center + radius * Math.sin(rad),
    };
  };

  return (
    <div className={cn('relative', className)}>
      <div
        className="relative"
        style={{ width: container, height: container }}
      >
        {/* Center compass */}
        <div 
          className="absolute z-10 flex items-center justify-center"
          style={{
            left: center - 48, // 48 = half of w-24 (96px)
            top: center - 48,
            width: 96,
            height: 96,
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            className="w-24 h-24 rounded-full border-4 border-gold-400 bg-gradient-to-br from-astral-800 to-astral-900 flex items-center justify-center shadow-lg"
          >
            <div className="text-center">
              <span className="text-2xl text-gold-400">🧭</span>
              <p className="text-[8px] text-gold-300 font-display mt-1">VASTHU</p>
            </div>
          </motion.div>
        </div>

        {/* Connection lines */}
        <svg
          className="absolute inset-0 pointer-events-none"
          width={container}
          height={container}
        >
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d4a418" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#d4a418" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#d4a418" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          {dikpalakas.map((guardian) => {
            const pos = getPosition(guardian.angle);
            return (
              <line
                key={guardian.direction}
                x1={center}
                y1={center}
                x2={pos.x}
                y2={pos.y}
                stroke="url(#lineGradient)"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
            );
          })}
          {/* Outer circle */}
          <circle
            cx={center}
            cy={center}
            r={radius + iconSize / 2 + 10}
            fill="none"
            stroke="#d4a418"
            strokeWidth="1"
            strokeDasharray="8,4"
            opacity="0.4"
          />
        </svg>

        {/* Guardian icons */}
        {dikpalakas.map((guardian) => {
          const pos = getPosition(guardian.angle);
          const isSelected = selectedGuardian?.direction === guardian.direction;

          return (
            <motion.div
              key={guardian.direction}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: guardian.angle / 500, type: 'spring' }}
              className="absolute"
              style={{
                left: pos.x - iconSize / 2,
                top: pos.y - iconSize / 2,
                width: iconSize,
                height: iconSize,
              }}
            >
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedGuardian(isSelected ? null : guardian)}
                className={cn(
                  'w-full h-full rounded-full flex flex-col items-center justify-center shadow-lg transition-all duration-300 relative',
                  isSelected ? 'ring-4 ring-gold-400' : ''
                )}
                style={{
                  backgroundColor: guardian.color,
                  boxShadow: isSelected ? `0 0 20px ${guardian.color}` : undefined,
                }}
              >
                <span className="text-white" style={{ fontSize: iconSize * 0.35 }}>
                  {guardian.symbol}
                </span>
                
                {/* Direction label - centered in the circle */}
                <span className="text-white font-bold drop-shadow-lg leading-none" style={{ fontSize: iconSize * 0.25 }}>
                  {guardian.direction}
                </span>
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* Info panel */}
      {interactive && selectedGuardian && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white rounded-xl shadow-lg border-2 border-gold-200 overflow-hidden"
        >
          <div
            className="h-2"
            style={{ backgroundColor: selectedGuardian.color }}
          />
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                style={{ backgroundColor: selectedGuardian.color }}
              >
                {selectedGuardian.symbol}
              </div>
              <div>
                <h3 className="text-xl font-display font-bold text-astral-500">
                  {selectedGuardian.name}
                </h3>
                <p className="text-lg font-sanskrit text-saffron-600">
                  {selectedGuardian.sanskrit}
                </p>
                <p className="text-sm text-earth-500">{selectedGuardian.title}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-earth-50 rounded-lg p-3">
                <p className="text-earth-400 text-xs uppercase tracking-wide mb-1">Direction</p>
                <p className="font-semibold text-earth-800">{selectedGuardian.direction} ({selectedGuardian.angle}°)</p>
              </div>
              <div className="bg-earth-50 rounded-lg p-3">
                <p className="text-earth-400 text-xs uppercase tracking-wide mb-1">Element</p>
                <p className="font-semibold text-earth-800">{selectedGuardian.element}</p>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-gold-50 rounded-lg border border-gold-200">
              <p className="text-xs text-gold-600 uppercase tracking-wide mb-1">Vasthu Significance</p>
              <p className="text-earth-700">{selectedGuardian.vasthu}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AshtadikpalakasDisplay;

