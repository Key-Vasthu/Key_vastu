import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

interface VasthuPurushaGridProps {
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  interactive?: boolean;
  highlightZone?: string;
  className?: string;
}

// Ashtadikpalakas - 8 Directional Guardians
const dikpalakas = {
  N: { name: 'Kubera', deity: 'Lord of Wealth', element: 'Earth', color: '#fbbf24' },
  NE: { name: 'Ishana', deity: 'Lord Shiva', element: 'Water', color: '#60a5fa' },
  E: { name: 'Indra', deity: 'King of Gods', element: 'Sun', color: '#f97316' },
  SE: { name: 'Agni', deity: 'Fire God', element: 'Fire', color: '#ef4444' },
  S: { name: 'Yama', deity: 'Lord of Death', element: 'Earth', color: '#84cc16' },
  SW: { name: 'Nirrti', deity: 'Goddess of Dissolution', element: 'Earth', color: '#a855f7' },
  W: { name: 'Varuna', deity: 'Lord of Water', element: 'Water', color: '#06b6d4' },
  NW: { name: 'Vayu', deity: 'Wind God', element: 'Air', color: '#94a3b8' },
};

// Vasthu zones and their significance
const vasthuZones = [
  ['NW', 'N', 'N', 'NE'],
  ['W', 'Brahma', 'Brahma', 'E'],
  ['W', 'Brahma', 'Brahma', 'E'],
  ['SW', 'S', 'S', 'SE'],
];

const VasthuPurushaGrid: React.FC<VasthuPurushaGridProps> = ({
  size = 'md',
  showLabels = true,
  interactive = false,
  highlightZone,
  className,
}) => {
  const sizeClasses = {
    sm: 'w-48 h-48',
    md: 'w-72 h-72',
    lg: 'w-96 h-96',
  };

  const [hoveredZone, setHoveredZone] = React.useState<string | null>(null);

  const getZoneInfo = (zone: string) => {
    if (zone === 'Brahma') {
      return { name: 'Brahma Sthana', deity: 'Lord Brahma', element: 'Space', color: '#fef3c7' };
    }
    return dikpalakas[zone as keyof typeof dikpalakas];
  };

  return (
    <div className={cn('relative', className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'relative bg-cream-50 border-4 border-gold-500 rounded-lg overflow-hidden shadow-gold',
          sizeClasses[size]
        )}
      >
        {/* Direction indicators */}
        {showLabels && (
          <>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-display font-semibold text-astral-500">
              NORTH (उत्तर)
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-display font-semibold text-astral-500">
              SOUTH (दक्षिण)
            </div>
            <div className="absolute top-1/2 -left-8 -translate-y-1/2 -rotate-90 text-xs font-display font-semibold text-astral-500">
              WEST
            </div>
            <div className="absolute top-1/2 -right-8 -translate-y-1/2 rotate-90 text-xs font-display font-semibold text-astral-500">
              EAST
            </div>
          </>
        )}

        {/* Grid */}
        <div className="grid grid-cols-4 grid-rows-4 w-full h-full">
          {vasthuZones.flat().map((zone, index) => {
            const info = getZoneInfo(zone);
            const isHighlighted = highlightZone === zone || hoveredZone === zone;
            const isBrahma = zone === 'Brahma';

            return (
              <motion.div
                key={index}
                whileHover={interactive ? { scale: 1.05, zIndex: 10 } : undefined}
                onHoverStart={interactive ? () => setHoveredZone(zone) : undefined}
                onHoverEnd={interactive ? () => setHoveredZone(null) : undefined}
                className={cn(
                  'border border-gold-300 flex items-center justify-center transition-all duration-300',
                  interactive && 'cursor-pointer hover:shadow-lg',
                  isHighlighted && 'ring-2 ring-saffron-500',
                  isBrahma && 'bg-gold-100'
                )}
                style={{ backgroundColor: isHighlighted ? info?.color + '40' : undefined }}
              >
                {isBrahma ? (
                  <div className="text-center">
                    <div className="w-6 h-6 mx-auto mb-1 rounded-full bg-gold-400 flex items-center justify-center">
                      <span className="text-white text-xs">ॐ</span>
                    </div>
                  </div>
                ) : (
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: info?.color }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Vasthu Purusha silhouette overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <ellipse cx="50" cy="45" rx="25" ry="35" fill="#1e3a5f" />
            <circle cx="70" cy="25" r="12" fill="#1e3a5f" />
          </svg>
        </div>
      </motion.div>

      {/* Tooltip for hovered zone */}
      {interactive && hoveredZone && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-20 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg border border-earth-100 p-3 z-20 min-w-[200px]"
        >
          {(() => {
            const info = getZoneInfo(hoveredZone);
            return (
              <div className="text-center">
                <div
                  className="w-8 h-8 mx-auto rounded-full mb-2"
                  style={{ backgroundColor: info?.color }}
                />
                <h4 className="font-display font-semibold text-astral-500">{info?.name}</h4>
                <p className="text-sm text-earth-600">{info?.deity}</p>
                <p className="text-xs text-earth-500">Element: {info?.element}</p>
              </div>
            );
          })()}
        </motion.div>
      )}
    </div>
  );
};

export default VasthuPurushaGrid;

