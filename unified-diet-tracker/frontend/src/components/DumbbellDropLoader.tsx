import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

const CustomDumbbell = ({ color }: { color: string }) => (
  <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 10px 8px rgba(0,0,0,0.3))' }}>
    {/* Bar */}
    <rect x="20" y="45" width="60" height="10" fill={color} rx="2" />
    <rect x="20" y="45" width="60" height="4" fill="white" fillOpacity="0.3" rx="2" />
    
    {/* Left Weights */}
    <rect x="10" y="20" width="15" height="60" fill={color} rx="4" />
    <rect x="10" y="20" width="5" height="60" fill="white" fillOpacity="0.3" rx="2" />
    <rect x="5" y="30" width="5" height="40" fill={color} rx="2" />
    <rect x="5" y="30" width="2" height="40" fill="white" fillOpacity="0.1" rx="1" />
    
    {/* Right Weights */}
    <rect x="75" y="20" width="15" height="60" fill={color} rx="4" />
    <rect x="75" y="20" width="5" height="60" fill="white" fillOpacity="0.3" rx="2" />
    <rect x="90" y="30" width="5" height="40" fill={color} rx="2" />
    <rect x="90" y="30" width="2" height="40" fill="white" fillOpacity="0.1" rx="1" />
    
    {/* Metallic Shine */}
    <rect x="25" y="48" width="50" height="1" fill="white" fillOpacity="0.2" rx="0.5" />
  </svg>
);

const Dumbbell = ({ color, delay = 0, index }: { color: string; delay?: number; index: number }) => {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay }}>
        <CustomDumbbell color={color} />
      </motion.div>
    );
  }

  return (
    <div className="relative">
      {/* Motion Blur Trail */}
      <motion.div
        initial={{ opacity: 0, height: 0, y: -500 }}
        animate={{ 
          opacity: [0, 0.6, 0.3, 0],
          height: [0, 120, 80, 0],
          y: [-500, -20, 10, 20],
          x: [0, 0, 15, 40]
        }}
        transition={{
          duration: 1.2,
          delay: delay,
          times: [0, 0.4, 0.6, 1],
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
        className="absolute left-1/2 -translate-x-1/2 w-8 blur-xl -z-10"
        style={{ 
          background: `linear-gradient(to bottom, transparent, ${color}, transparent)`
        }}
      />

      {/* Main Dumbbell Body */}
      <motion.div
        initial={{ y: -500, rotate: -25, scale: 1, x: 0 }}
        animate={{ 
          y: [-500, 0, -15, 0, 0],
          rotate: [-25, 0, 5, 0, 360],
          scaleY: [1, 0.6, 1.1, 0.9, 1],
          x: [0, 0, 5, 10, 60],
        }}
        transition={{
          y: {
            duration: 1.2,
            times: [0, 0.4, 0.55, 0.7, 1],
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: delay
          },
          rotate: {
            duration: 2,
            times: [0, 0.4, 0.55, 0.7, 1],
            ease: "easeOut",
            delay: delay
          },
          scaleY: {
            duration: 0.8,
            times: [0.35, 0.45, 0.55, 0.7, 1],
            delay: delay
          },
          x: {
            duration: 1.5,
            times: [0, 0.7, 0.8, 0.9, 1],
            ease: "easeOut",
            delay: delay
          }
        }}
        className="relative z-10"
      >
        <CustomDumbbell color={color} />
      </motion.div>
      
      {/* Floor Impact Shockwave */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [0, 2.5, 4],
          opacity: [0, 0.5, 0]
        }}
        transition={{
          duration: 0.8,
          delay: delay + 0.48, // Impact moment
          ease: "easeOut"
        }}
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-3 border border-white/20 rounded-full -z-20 blur-sm"
      />

      {/* Sweat Particle Sparks */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, opacity: 0, scale: 1 }}
          animate={{ 
            x: [(Math.random() - 0.5) * 60, (Math.random() - 0.5) * 120],
            y: [-10, -Math.random() * 80, 20],
            opacity: [0, 1, 0],
            scale: [1, 0.5, 0]
          }}
          transition={{
            duration: 0.6,
            delay: delay + 0.48 + (i * 0.02),
            ease: "easeOut"
          }}
          className="absolute left-1/2 top-3/4 w-1 h-1 rounded-full"
          style={{ backgroundColor: color }}
        />
      ))}
      
      {/* Dynamic Shadow */}
      <motion.div 
        initial={{ scale: 0.2, opacity: 0, x: 0 }}
        animate={{ 
          scale: [0.2, 1.2, 0.8, 1, 1],
          opacity: [0, 0.4, 0.2, 0.3, 0.1],
          x: [0, 0, 0, 10, 60]
        }}
        transition={{
          duration: 1.5,
          delay: delay,
          times: [0, 0.45, 0.6, 0.75, 1],
          ease: "easeOut"
        }}
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-4 bg-black/60 blur-xl rounded-full -z-10"
      />
    </div>
  );
};

export default function DumbbellDropLoader() {
  const { theme } = useTheme();

  const getColor = () => {
    switch (theme) {
      case 'light': return '#0EA5E9';
      case 'dark': return '#9CA3AF';
      case 'fitpro': default: return '#FF6B00';
    }
  };

  const color = getColor();

  return (
    <div className="flex flex-col items-center justify-center p-12 overflow-hidden w-full">
      <div className="flex gap-16 items-end relative h-32">
        <Dumbbell color={color} delay={0.2} index={0} />
        <Dumbbell color={color} delay={0} index={1} />
      </div>
      
      <motion.div
        initial={{ opacity: 0, letterSpacing: '1em' }}
        animate={{ 
          opacity: [0, 1, 0.5],
          letterSpacing: ['1em', '0.4em'],
          y: [20, 0]
        }}
        transition={{
          duration: 2.5,
          ease: "easeOut",
          delay: 1.2
        }}
        className="mt-20 text-[10px] font-black tracking-[0.4em] uppercase"
        style={{ color }}
      >
        FitPro AI • Biometric Sync
      </motion.div>
    </div>
  );
}

