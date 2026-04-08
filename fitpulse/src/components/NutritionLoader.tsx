import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

export default function NutritionLoader() {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  const getColors = () => {
    switch (theme) {
      case 'light': 
        return { accent: '#0ea5e9', bowl: '#ffffff', food: '#e0f2fe', glow: 'rgba(14,165,233,0.2)' };
      case 'dark': 
        return { accent: '#9ca3af', bowl: '#1f2937', food: '#374151', glow: 'rgba(156,163,175,0.15)' };
      case 'fitpro': 
      default: 
        return { accent: '#FF6B00', bowl: '#1A1B1E', food: '#2A2B2E', glow: 'rgba(255,107,0,0.25)' };
    }
  };

  const colors = getColors();

  if (shouldReduceMotion) {
    return (
      <div className="flex items-center justify-center h-48">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#FF6B00] font-black tracking-widest uppercase">
          Calculating Nutrition...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center w-full h-64 overflow-hidden">
      {/* Soft Radial Shimmer (Conic Gradient) */}
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background: `conic-gradient(from 0deg, transparent, ${colors.accent}, transparent, ${colors.accent}, transparent)`
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative">
        {/* Calorie Ring SVG (drawing around the bowl) */}
        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] -rotate-90 pointer-events-none">
          <motion.circle
            cx="90"
            cy="90"
            r="85"
            stroke={colors.accent}
            strokeWidth="2"
            fill="transparent"
            strokeDasharray="534"
            initial={{ strokeDashoffset: 534 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 2, delay: 1, ease: [0.22, 1, 0.36, 1] }}
            strokeLinecap="round"
            className="opacity-30"
          />
        </svg>

        <motion.svg 
          width="160" 
          height="160" 
          viewBox="0 -20 100 120" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="relative z-10 overflow-visible"
        >
          {/* Organic Steam Wisps */}
          {[
            { d: "M 35 45 Q 20 15 35 -15", delay: 0 },
            { d: "M 50 45 Q 65 15 50 -15", delay: 0.8 },
            { d: "M 65 45 Q 50 15 65 -15", delay: 1.6 }
          ].map((steam, i) => (
            <motion.path
              key={`steam-${i}`}
              d={steam.d}
              stroke={colors.accent}
              strokeWidth="2"
              strokeLinecap="round"
              fill="transparent"
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{
                opacity: [0, 0.4, 0],
                pathLength: [0, 1, 1],
                y: [0, -20],
                x: [0, -6, 4, -3, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2 + steam.delay,
                x: {
                  duration: 4,
                  repeat: Infinity,
                  times: [0, 0.25, 0.5, 0.75, 1],
                  ease: "easeInOut"
                }
              }}
            />
          ))}

          {/* Staggered Food Elements */}
          <motion.g
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.12,
                  delayChildren: 0.5
                }
              }
            }}
          >
            {/* Bowl Body - Slides up first */}
            <motion.g
              variants={{
                hidden: { y: 100, opacity: 0 },
                visible: { y: 0, opacity: 1, transition: { type: "spring", damping: 15 } }
              }}
            >
              <ellipse cx="50" cy="92" rx="35" ry="6" fill="black" fillOpacity="0.15" />
              <path d="M 10 55 C 10 90 90 90 90 55 Z" fill={colors.bowl} stroke={colors.accent} strokeWidth="2" />
              <ellipse cx="50" cy="55" rx="40" ry="12" fill={colors.bowl} stroke={colors.accent} strokeWidth="2" />
            </motion.g>

            {/* Food Content popping in one by one */}
            <motion.ellipse 
              cx="50" cy="55" rx="38" ry="12" fill={colors.food}
              variants={{ hidden: { scale: 0, opacity: 0 }, visible: { scale: 1, opacity: 1 } }}
            />
            
            {[
              { cx: 32, cy: 53, r: 6, op: 0.8 },
              { cx: 68, cy: 54, r: 5, op: 0.6 },
              { cx: 50, cy: 48, r: 8, op: 0.9 },
              { cx: 42, cy: 56, r: 4, op: 0.5 },
              { cx: 58, cy: 51, r: 5, op: 0.7 }
            ].map((dot, i) => (
              <motion.circle
                key={i}
                cx={dot.cx} cy={dot.cy} r={dot.r}
                fill={colors.accent}
                fillOpacity={dot.op}
                variants={{
                  hidden: { scale: 0, y: 10 },
                  visible: { scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 12 } }
                }}
              />
            ))}
          </motion.g>
        </motion.svg>
      </div>

      {/* Floating Bio-data Labels */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: [0, 1, 1, 0], x: [-20, 0, 0, 20] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
      >
        <span className="text-[9px] font-bold text-theme-muted tracking-[0.3em] uppercase">
          Biometric Analysis in Progress...
        </span>
      </motion.div>
    </div>
  );
}

