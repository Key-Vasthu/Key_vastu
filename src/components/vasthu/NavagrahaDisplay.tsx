import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

interface NavagrahaDisplayProps {
  layout?: 'grid' | 'circle';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  className?: string;
}

// 9 Planets (Navagrahas) in Vedic Astrology
const navagrahas = [
  {
    name: 'Surya',
    english: 'Sun',
    sanskrit: 'सूर्य',
    symbol: '☉',
    color: '#f97316',
    day: 'Sunday',
    gemstone: 'Ruby',
    metal: 'Gold',
    direction: 'East',
    deity: 'Lord Sun',
  },
  {
    name: 'Chandra',
    english: 'Moon',
    sanskrit: 'चन्द्र',
    symbol: '☽',
    color: '#e2e8f0',
    day: 'Monday',
    gemstone: 'Pearl',
    metal: 'Silver',
    direction: 'North-West',
    deity: 'Lord Moon',
  },
  {
    name: 'Mangal',
    english: 'Mars',
    sanskrit: 'मंगल',
    symbol: '♂',
    color: '#ef4444',
    day: 'Tuesday',
    gemstone: 'Red Coral',
    metal: 'Copper',
    direction: 'South',
    deity: 'Lord Kartikeya',
  },
  {
    name: 'Budha',
    english: 'Mercury',
    sanskrit: 'बुध',
    symbol: '☿',
    color: '#22c55e',
    day: 'Wednesday',
    gemstone: 'Emerald',
    metal: 'Bronze',
    direction: 'North',
    deity: 'Lord Vishnu',
  },
  {
    name: 'Guru',
    english: 'Jupiter',
    sanskrit: 'गुरु',
    symbol: '♃',
    color: '#fbbf24',
    day: 'Thursday',
    gemstone: 'Yellow Sapphire',
    metal: 'Gold',
    direction: 'North-East',
    deity: 'Lord Brahma',
  },
  {
    name: 'Shukra',
    english: 'Venus',
    sanskrit: 'शुक्र',
    symbol: '♀',
    color: '#ec4899',
    day: 'Friday',
    gemstone: 'Diamond',
    metal: 'Silver',
    direction: 'South-East',
    deity: 'Goddess Lakshmi',
  },
  {
    name: 'Shani',
    english: 'Saturn',
    sanskrit: 'शनि',
    symbol: '♄',
    color: '#1e3a5f',
    day: 'Saturday',
    gemstone: 'Blue Sapphire',
    metal: 'Iron',
    direction: 'West',
    deity: 'Lord Yama',
  },
  {
    name: 'Rahu',
    english: 'North Node',
    sanskrit: 'राहु',
    symbol: '☊',
    color: '#6366f1',
    day: 'Saturday',
    gemstone: 'Hessonite',
    metal: 'Lead',
    direction: 'South-West',
    deity: 'Goddess Durga',
  },
  {
    name: 'Ketu',
    english: 'South Node',
    sanskrit: 'केतु',
    symbol: '☋',
    color: '#78716c',
    day: 'Tuesday',
    gemstone: "Cat's Eye",
    metal: 'Lead',
    direction: 'North-West',
    deity: 'Lord Ganesha',
  },
];

const NavagrahaDisplay: React.FC<NavagrahaDisplayProps> = ({
  layout = 'grid',
  size = 'md',
  interactive = true,
  className,
}) => {
  const [selectedPlanet, setSelectedPlanet] = useState<typeof navagrahas[0] | null>(null);

  const iconSizes = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  if (layout === 'circle') {
    const containerSize = size === 'lg' ? 400 : size === 'md' ? 320 : 240;
    const radius = containerSize * 0.35;
    const center = containerSize / 2;

    return (
      <div className={cn('relative', className)}>
        <div
          className="relative"
          style={{ width: containerSize, height: containerSize }}
        >
          {/* Center - Sun */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setSelectedPlanet(navagrahas[0])}
              className={cn(
                'rounded-full flex items-center justify-center shadow-lg border-4 border-gold-400',
                iconSizes[size]
              )}
              style={{ backgroundColor: navagrahas[0].color }}
            >
              <span className="text-white">{navagrahas[0].symbol}</span>
            </motion.button>
          </motion.div>

          {/* Orbiting planets */}
          {navagrahas.slice(1).map((planet, index) => {
            const angle = (index * 45) * (Math.PI / 180);
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);

            return (
              <motion.div
                key={planet.name}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="absolute"
                style={{
                  left: x,
                  top: y,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  onClick={() => setSelectedPlanet(planet)}
                  className={cn(
                    'rounded-full flex items-center justify-center shadow-lg',
                    size === 'lg' ? 'w-14 h-14 text-xl' : size === 'md' ? 'w-11 h-11 text-lg' : 'w-8 h-8 text-sm'
                  )}
                  style={{ backgroundColor: planet.color }}
                >
                  <span className="text-white">{planet.symbol}</span>
                </motion.button>
              </motion.div>
            );
          })}

          {/* Orbit ring */}
          <svg className="absolute inset-0 pointer-events-none" width={containerSize} height={containerSize}>
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#d4a418"
              strokeWidth="1"
              strokeDasharray="4,4"
              opacity="0.3"
            />
          </svg>
        </div>

        {/* Info panel */}
        {interactive && selectedPlanet && (
          <PlanetInfoPanel planet={selectedPlanet} onClose={() => setSelectedPlanet(null)} />
        )}
      </div>
    );
  }

  // Grid layout
  return (
    <div className={cn('', className)}>
      <div className="grid grid-cols-3 gap-4">
        {navagrahas.map((planet, index) => (
          <motion.button
            key={planet.name}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05, y: -4 }}
            onClick={() => setSelectedPlanet(selectedPlanet?.name === planet.name ? null : planet)}
            className={cn(
              'rounded-xl p-4 transition-all duration-300 border-2',
              selectedPlanet?.name === planet.name
                ? 'border-gold-500 shadow-gold'
                : 'border-transparent bg-white shadow-md hover:shadow-lg'
            )}
          >
            <div
              className={cn(
                'mx-auto rounded-full flex items-center justify-center mb-3',
                iconSizes[size]
              )}
              style={{ backgroundColor: planet.color }}
            >
              <span className="text-white">{planet.symbol}</span>
            </div>
            <h4 className="font-display font-semibold text-astral-500">{planet.name}</h4>
            <p className="text-xs text-earth-500">{planet.english}</p>
            <p className="text-sm font-sanskrit text-saffron-600">{planet.sanskrit}</p>
          </motion.button>
        ))}
      </div>

      {/* Info panel */}
      {interactive && selectedPlanet && (
        <PlanetInfoPanel planet={selectedPlanet} onClose={() => setSelectedPlanet(null)} />
      )}
    </div>
  );
};

// Info Panel Component
const PlanetInfoPanel: React.FC<{
  planet: typeof navagrahas[0];
  onClose: () => void;
}> = ({ planet }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="mt-6 bg-white rounded-xl shadow-lg border-2 border-gold-200 overflow-hidden"
  >
    <div className="h-2" style={{ backgroundColor: planet.color }} />
    <div className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
          style={{ backgroundColor: planet.color }}
        >
          {planet.symbol}
        </div>
        <div>
          <h3 className="text-xl font-display font-bold text-astral-500">
            {planet.name} ({planet.english})
          </h3>
          <p className="text-lg font-sanskrit text-saffron-600">{planet.sanskrit}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div className="bg-earth-50 rounded-lg p-3">
          <p className="text-earth-400 text-xs uppercase tracking-wide mb-1">Day</p>
          <p className="font-semibold text-earth-800">{planet.day}</p>
        </div>
        <div className="bg-earth-50 rounded-lg p-3">
          <p className="text-earth-400 text-xs uppercase tracking-wide mb-1">Direction</p>
          <p className="font-semibold text-earth-800">{planet.direction}</p>
        </div>
        <div className="bg-earth-50 rounded-lg p-3">
          <p className="text-earth-400 text-xs uppercase tracking-wide mb-1">Gemstone</p>
          <p className="font-semibold text-earth-800">{planet.gemstone}</p>
        </div>
        <div className="bg-earth-50 rounded-lg p-3">
          <p className="text-earth-400 text-xs uppercase tracking-wide mb-1">Metal</p>
          <p className="font-semibold text-earth-800">{planet.metal}</p>
        </div>
      </div>

      <div className="mt-4 p-4 bg-gold-50 rounded-lg border border-gold-200">
        <p className="text-xs text-gold-600 uppercase tracking-wide mb-1">Presiding Deity</p>
        <p className="text-earth-700 font-medium">{planet.deity}</p>
      </div>
    </div>
  </motion.div>
);

export default NavagrahaDisplay;

