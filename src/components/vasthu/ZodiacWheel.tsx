import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

interface ZodiacWheelProps {
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  highlightSign?: string;
  showPlanets?: boolean;
  className?: string;
  onSignHover?: (sign: typeof zodiacSigns[0] | null) => void;
  hideTooltip?: boolean;
}

// 12 Zodiac Signs (Rashis)
const zodiacSigns = [
  { name: 'Aries', sanskrit: 'मेष', symbol: '♈', element: 'Fire', ruler: 'Mars', color: '#ef4444' },
  { name: 'Taurus', sanskrit: 'वृषभ', symbol: '♉', element: 'Earth', ruler: 'Venus', color: '#22c55e' },
  { name: 'Gemini', sanskrit: 'मिथुन', symbol: '♊', element: 'Air', ruler: 'Mercury', color: '#fbbf24' },
  { name: 'Cancer', sanskrit: 'कर्क', symbol: '♋', element: 'Water', ruler: 'Moon', color: '#94a3b8' },
  { name: 'Leo', sanskrit: 'सिंह', symbol: '♌', element: 'Fire', ruler: 'Sun', color: '#f97316' },
  { name: 'Virgo', sanskrit: 'कन्या', symbol: '♍', element: 'Earth', ruler: 'Mercury', color: '#84cc16' },
  { name: 'Libra', sanskrit: 'तुला', symbol: '♎', element: 'Air', ruler: 'Venus', color: '#ec4899' },
  { name: 'Scorpio', sanskrit: 'वृश्चिक', symbol: '♏', element: 'Water', ruler: 'Mars', color: '#dc2626' },
  { name: 'Sagittarius', sanskrit: 'धनु', symbol: '♐', element: 'Fire', ruler: 'Jupiter', color: '#8b5cf6' },
  { name: 'Capricorn', sanskrit: 'मकर', symbol: '♑', element: 'Earth', ruler: 'Saturn', color: '#6b7280' },
  { name: 'Aquarius', sanskrit: 'कुम्भ', symbol: '♒', element: 'Air', ruler: 'Saturn', color: '#06b6d4' },
  { name: 'Pisces', sanskrit: 'मीन', symbol: '♓', element: 'Water', ruler: 'Jupiter', color: '#3b82f6' },
];

// 9 Planets (Navagrahas)
const planets = [
  { name: 'Sun', sanskrit: 'सूर्य', symbol: '☉', color: '#f97316' },
  { name: 'Moon', sanskrit: 'चन्द्र', symbol: '☽', color: '#e2e8f0' },
  { name: 'Mars', sanskrit: 'मंगल', symbol: '♂', color: '#ef4444' },
  { name: 'Mercury', sanskrit: 'बुध', symbol: '☿', color: '#22c55e' },
  { name: 'Jupiter', sanskrit: 'गुरु', symbol: '♃', color: '#fbbf24' },
  { name: 'Venus', sanskrit: 'शुक्र', symbol: '♀', color: '#ec4899' },
  { name: 'Saturn', sanskrit: 'शनि', symbol: '♄', color: '#1e3a5f' },
  { name: 'Rahu', sanskrit: 'राहु', symbol: '☊', color: '#6366f1' },
  { name: 'Ketu', sanskrit: 'केतु', symbol: '☋', color: '#78716c' },
];

const ZodiacWheel: React.FC<ZodiacWheelProps> = ({
  size = 'md',
  interactive = false,
  highlightSign,
  showPlanets = false,
  className,
  onSignHover,
  hideTooltip = false,
}) => {
  const [hoveredSign, setHoveredSign] = useState<typeof zodiacSigns[0] | null>(null);
  
  const handleSignHover = (sign: typeof zodiacSigns[0] | null) => {
    setHoveredSign(sign);
    if (onSignHover) {
      onSignHover(sign);
    }
  };
  
  const sizeValues = {
    sm: { container: 200, outerRadius: 90, innerRadius: 50, symbolSize: 16 },
    md: { container: 300, outerRadius: 135, innerRadius: 75, symbolSize: 20 },
    lg: { container: 400, outerRadius: 180, innerRadius: 100, symbolSize: 24 },
  };

  const { container, outerRadius, innerRadius, symbolSize } = sizeValues[size];
  const center = container / 2;

  return (
    <div className={cn('relative', className)}>
      <svg
        width={container}
        height={container}
        viewBox={`0 0 ${container} ${container}`}
        className="drop-shadow-lg"
      >
        <defs>
          <linearGradient id="zodiacGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4a418" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#b8860b" />
          </linearGradient>
          <linearGradient id="zodiacBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a5f" />
            <stop offset="100%" stopColor="#0f1f35" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer decorative ring */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius + 10}
          fill="none"
          stroke="url(#zodiacGold)"
          strokeWidth="2"
        />

        {/* Main wheel background */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="url(#zodiacBlue)"
          stroke="url(#zodiacGold)"
          strokeWidth="3"
        />

        {/* Division lines */}
        {zodiacSigns.map((_, index) => {
          const angle = index * 30 * (Math.PI / 180);
          const x1 = center + innerRadius * Math.cos(angle);
          const y1 = center + innerRadius * Math.sin(angle);
          const x2 = center + outerRadius * Math.cos(angle);
          const y2 = center + outerRadius * Math.sin(angle);
          return (
            <line
              key={index}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#d4a418"
              strokeWidth="1"
              opacity="0.5"
            />
          );
        })}

        {/* Inner circle */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="#0f1f35"
          stroke="url(#zodiacGold)"
          strokeWidth="2"
        />

        {/* Center Om symbol */}
        <text
          x={center}
          y={center + 8}
          textAnchor="middle"
          fontSize={size === 'lg' ? 32 : size === 'md' ? 24 : 18}
          fill="url(#zodiacGold)"
          fontFamily="serif"
        >
          ॐ
        </text>

        {/* Zodiac signs */}
        {zodiacSigns.map((sign, index) => {
          const midAngle = (index * 30 + 15 - 90) * (Math.PI / 180);
          const symbolRadius = (outerRadius + innerRadius) / 2;
          const x = center + symbolRadius * Math.cos(midAngle);
          const y = center + symbolRadius * Math.sin(midAngle);
          const isHighlighted = highlightSign === sign.name || hoveredSign?.name === sign.name;

          return (
            <g key={sign.name}>
              {/* Highlight arc */}
              {isHighlighted && (
                <path
                  d={`M ${center} ${center} 
                      L ${center + outerRadius * Math.cos((index * 30 - 90) * Math.PI / 180)} 
                        ${center + outerRadius * Math.sin((index * 30 - 90) * Math.PI / 180)}
                      A ${outerRadius} ${outerRadius} 0 0 1 
                        ${center + outerRadius * Math.cos(((index + 1) * 30 - 90) * Math.PI / 180)} 
                        ${center + outerRadius * Math.sin(((index + 1) * 30 - 90) * Math.PI / 180)}
                      Z`}
                  fill={sign.color}
                  opacity="0.3"
                  filter="url(#glow)"
                />
              )}
              
              {/* Sign symbol */}
              <text
                x={x}
                y={y + symbolSize / 3}
                textAnchor="middle"
                fontSize={symbolSize}
                fill={isHighlighted ? sign.color : '#fbbf24'}
                fontWeight="bold"
                style={{ cursor: interactive ? 'pointer' : 'default' }}
                onMouseEnter={interactive ? () => handleSignHover(sign) : undefined}
                onMouseLeave={interactive ? () => handleSignHover(null) : undefined}
              >
                {sign.symbol}
              </text>
            </g>
          );
        })}

        {/* Planet symbols (if enabled) */}
        {showPlanets && (
          <g>
            {planets.slice(0, 7).map((planet, index) => {
              const angle = (index * 51.4 + 25) * (Math.PI / 180); // Distribute around
              const radius = innerRadius * 0.6;
              const x = center + radius * Math.cos(angle);
              const y = center + radius * Math.sin(angle);
              return (
                <text
                  key={planet.name}
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fontSize={size === 'lg' ? 14 : 10}
                  fill={planet.color}
                  fontWeight="bold"
                >
                  {planet.symbol}
                </text>
              );
            })}
          </g>
        )}
      </svg>

      {/* Tooltip */}
      {interactive && hoveredSign && !hideTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-24 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-lg border border-earth-100 p-4 z-20 min-w-[220px]"
        >
          <div className="flex items-center gap-3">
            <span
              className="text-3xl"
              style={{ color: hoveredSign.color }}
            >
              {hoveredSign.symbol}
            </span>
            <div>
              <h4 className="font-display font-semibold text-astral-500">
                {hoveredSign.name}
              </h4>
              <p className="text-sm text-saffron-600 font-sanskrit">{hoveredSign.sanskrit}</p>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-earth-100 grid grid-cols-2 gap-2 text-xs text-earth-600">
            <div>
              <span className="text-earth-400">Element:</span> {hoveredSign.element}
            </div>
            <div>
              <span className="text-earth-400">Ruler:</span> {hoveredSign.ruler}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ZodiacWheel;

