import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

const bars = [
  { color: '#FF6B00', glowColor: 'rgba(255,107,0,0.6)',  heights: [30, 95,  50, 110, 40],  delay: 0    },
  { color: '#00E5FF', glowColor: 'rgba(0,229,255,0.6)',   heights: [60, 40,  90, 55,  80],  delay: 0.15 },
  { color: '#FF0055', glowColor: 'rgba(255,0,85,0.6)',    heights: [45, 110, 35, 95,  60],  delay: 0.3  },
  { color: '#B388FF', glowColor: 'rgba(179,136,255,0.6)', heights: [80, 55,  100, 45, 90],  delay: 0.1  },
  { color: '#00FF87', glowColor: 'rgba(0,255,135,0.6)',   heights: [50, 85,  40, 120, 55],  delay: 0.25 },
  { color: '#FFD600', glowColor: 'rgba(255,214,0,0.6)',   heights: [70, 35,  85, 50,  100], delay: 0.2  },
  { color: '#FF6B00', glowColor: 'rgba(255,107,0,0.6)',   heights: [40, 100, 60, 80,  45],  delay: 0.35 },
];

const wave1 = "M0 14 Q27 4 55 14 Q82 24 110 14 Q137 4 165 14 Q192 24 220 14";
const wave2 = "M0 14 Q27 22 55 14 Q82 6 110 14 Q137 22 165 14 Q192 6 220 14";
const wave3 = "M0 14 Q27 8 55 18 Q82 24 110 10 Q137 4 165 18 Q192 24 220 14";

export default function StatsLoader() {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [targetProgress] = useState(() => Math.floor(Math.random() * (98 - 72 + 1)) + 72);

  useEffect(() => {
    if (progress < targetProgress) {
      const timer = setTimeout(() => setProgress(prev => prev + 1), 40);
      return () => clearTimeout(timer);
    }
  }, [progress, targetProgress]);

  const getGlowColor = (color: string) => {
    if (theme === 'light') {
      // Very simple alpha reduction for light theme
      return color.replace('0.6)', '0.3)').replace('0.3)', '0.15)');
    }
    return color;
  };

  if (shouldReduceMotion) {
    return (
      <div className="relative flex flex-col items-center justify-center w-full h-56 gap-3">
        <div className="flex items-end gap-2.5 h-[130px]">
          {bars.map((bar, i) => (
            <div key={i} className="w-6 h-[78px]" style={{ backgroundColor: bar.color, opacity: 0.6, borderRadius: '4px 4px 0 0' }} />
          ))}
        </div>
        <div className="text-[#FF6B00] font-bold text-xs uppercase tracking-widest">Loading Stats...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      className="relative flex flex-col items-center justify-center w-full h-56 gap-3 overflow-hidden"
    >
      {/* Percentage Counter */}
      <div className="absolute top-4 right-8 flex flex-col items-end">
        <span className="text-[7px] text-theme-muted font-bold uppercase tracking-wider mb-1">LOADING</span>
        <div className="text-[11px] font-bold text-[#FF6B00] tracking-[0.15em]">
          {progress}%
        </div>
      </div>

      {/* Bars row wrapping for scanning beam */}
      <div className="relative flex items-end gap-2.5 h-[130px] overflow-visible">
        {/* Scanning Light Beam */}
        <motion.div
          className="absolute top-0 bottom-0 w-[40px] z-20 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)'
          }}
          animate={{ x: ['-40px', '220px'] }} // Offset based on total bars width (7 * 24 + 6 * 10)
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 0.5 }}
        />

        {bars.map((bar, i) => (
          <div key={i} className="relative flex flex-col items-center justify-end w-6 h-full">
            {/* Particles */}
            {[0, 1].map((p) => (
              <motion.div
                key={p}
                className="absolute w-1 h-1 rounded-full z-30"
                style={{ backgroundColor: bar.color }}
                initial={{ opacity: 0, y: 0, x: 0 }}
                animate={{ 
                  y: [0, -28, -50], 
                  opacity: [0, 0.9, 0], 
                  scale: [0.5, 1, 0.3],
                  x: [0, p % 2 === 0 ? 5 : -5, 0]
                }}
                transition={{ 
                  duration: 1.8, 
                  repeat: Infinity, 
                  delay: bar.delay + (p * 0.6),
                  ease: "easeOut"
                }}
              />
            ))}

            {/* Glowing Top Cap */}
            <motion.div 
              className="absolute w-full h-[3px] rounded-full z-10"
              style={{ backgroundColor: getGlowColor(bar.glowColor) }}
              animate={{ 
                boxShadow: [
                  `0 0 6px 2px ${getGlowColor(bar.glowColor)}`,
                  `0 0 16px 6px ${getGlowColor(bar.glowColor)}`,
                  `0 0 6px 2px ${getGlowColor(bar.glowColor)}`
                ]
              }}
              transition={{ duration: 1.2, repeat: Infinity, delay: bar.delay * 2 }}
              // Position this div dynamically based on the height of the bar below it
            />

            {/* Bar */}
            <motion.div
              className="w-full rounded-t-md relative"
              style={{ backgroundColor: bar.color }}
              animate={{ 
                height: [...bar.heights, bar.heights[0]],
                opacity: [0.7, 1, 0.85, 1, 0.7]
              }}
              transition={{ 
                duration: 2.5, 
                repeat: Infinity, 
                delay: bar.delay, 
                ease: [0.45, 0, 0.55, 1] 
              }}
            />
          </div>
        ))}
      </div>

      {/* Live Waveform Baseline */}
      <div className="mt-2">
        <svg width="220" height="28" viewBox="0 0 220 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <motion.path
            d={wave1}
            stroke={theme === 'light' ? 'rgba(14,165,233,0.3)' : 'rgba(255,107,0,0.5)'}
            strokeWidth="1.5"
            strokeLinecap="round"
            animate={{ d: [wave1, wave2, wave3, wave1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>
      </div>
    </motion.div>
  );
}
