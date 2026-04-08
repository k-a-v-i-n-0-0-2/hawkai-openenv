import React from 'react';
import { motion } from 'framer-motion';

export default function StreakFireLoader() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a0a0a] overflow-hidden">
      {/* Background Radial Glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0.3, 0.8], scale: [0.5, 1, 2.5] }}
        transition={{ duration: 1.8, ease: "easeIn" }}
        className="absolute inset-0 bg-[radial-gradient(circle,_#FF6B0022_0%,_transparent_70%)] pointer-events-none"
      />

      {/* Main Fire Animation Container */}
      <div className="relative flex items-center justify-center">
        {/* Outer Glow Expansion */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: [0, 4, 30], opacity: [0, 0.5, 1] }}
          transition={{ 
            duration: 1.8, 
            times: [0, 0.4, 1],
            ease: [0.4, 0, 0.2, 1] 
          }}
          className="absolute w-32 h-32 rounded-full bg-gradient-to-t from-[#FF6B00] via-[#FF0055] to-transparent blur-[60px]"
        />

        {/* The Growing Flame */}
        <motion.div
          initial={{ scale: 0.1, opacity: 0, y: 0 }}
          animate={{ 
            scale: [0.1, 1, 40], 
            opacity: [0, 1, 1],
            y: [0, -10, 0]
          }}
          transition={{ 
            scale: { times: [0, 0.3, 1], duration: 1.8, ease: "easeInOut" },
            opacity: { times: [0, 0.1, 1], duration: 1.5 },
            y: { repeat: Infinity, duration: 0.2, ease: "easeInOut" }
          }}
          className="relative w-24 h-24"
        >
          {/* Flame Core Layers */}
          <motion.div 
            animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
            transition={{ repeat: Infinity, duration: 0.1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Core SVG Flame for cleaner look */}
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(255,107,0,0.8)]">
              <defs>
                <linearGradient id="fireGradient" x1="50%" y1="100%" x2="50%" y2="0%">
                  <stop offset="0%" stopColor="#FF0000" />
                  <stop offset="50%" stopColor="#FF6B00" />
                  <stop offset="100%" stopColor="#FFE500" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <path 
                d="M50 95C65 95 80 80 80 60C80 40 50 5 50 5C50 5 20 40 20 60C20 80 35 95 50 95Z" 
                fill="url(#fireGradient)"
                filter="url(#glow)"
              />
              <path 
                d="M50 85C60 85 70 75 70 60C70 45 50 20 50 20C50 20 30 45 30 60C30 75 40 85 50 85Z" 
                fill="#FFF" 
                fillOpacity="0.4"
              />
            </svg>
          </motion.div>

          {/* Particle Sparks */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ 
                x: (Math.random() - 0.5) * 150, 
                y: -Math.random() * 250, 
                opacity: 0,
                scale: 0,
                rotate: Math.random() * 360
              }}
              transition={{ 
                duration: 1, 
                repeat: Infinity, 
                delay: i * 0.15,
                ease: "easeOut" 
              }}
              className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-yellow-200 rounded-full blur-[0.5px] shadow-[0_0_8px_#FFE500]"
            />
          ))}
        </motion.div>
      </div>

      {/* Screen Fill Transition Layer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 1] }}
        transition={{ times: [0, 0.85, 1], duration: 1.8 }}
        className="absolute inset-0 bg-[#FF6B00] pointer-events-none mix-blend-screen"
      />

      {/* Subliminal Message / Logo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ times: [0, 0.2, 0.8], duration: 1.8 }}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 text-theme-main/40 font-black tracking-[0.5em] text-[10px] uppercase"
      >
        Igniting Consistency
      </motion.div>
    </div>
  );
}
