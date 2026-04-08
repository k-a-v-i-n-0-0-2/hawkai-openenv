import React from 'react';
import { motion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

const CustomDumbbell = ({ color }: { color: string }) => (
  <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 10px 8px rgba(0,0,0,0.3))' }}>
    {/* Bar */}
    <rect x="20" y="45" width="60" height="10" fill={color} rx="2" />
    <rect x="20" y="45" width="60" height="4" fill="white" fillOpacity="0.3" rx="2" />
    
    {/* Left Weights */}
    <rect x="10" y="20" width="15" height="60" fill={color} rx="4" />
    <rect x="10" y="20" width="5" height="60" fill="white" fillOpacity="0.3" rx="2" />
    <rect x="5" y="30" width="5" height="40" fill={color} rx="2" />
    <rect x="5" y="30" width="2" height="40" fill="white" fillOpacity="0.3" rx="1" />
    
    {/* Right Weights */}
    <rect x="75" y="20" width="15" height="60" fill={color} rx="4" />
    <rect x="75" y="20" width="5" height="60" fill="white" fillOpacity="0.3" rx="2" />
    <rect x="90" y="30" width="5" height="40" fill={color} rx="2" />
    <rect x="90" y="30" width="2" height="40" fill="white" fillOpacity="0.3" rx="1" />
  </svg>
);

export default function DumbbellLoader() {
  const { theme } = useTheme();

  const getColor = () => {
    switch (theme) {
      case 'light': return '#0ea5e9'; // Sky blue
      case 'dark': return '#9ca3af'; // Grey
      case 'fitpro': default: return '#FF6B00'; // Theme orange
    }
  };

  const color = getColor();

  return (
    <div className="relative flex items-center justify-center w-full h-48 overflow-hidden">
      <motion.div
        className="absolute flex gap-12 items-center"
        animate={{
          x: ['-100vw', '100vw'],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* First Dumbbell */}
        <motion.div
          animate={{ 
            rotate: 360,
            y: [0, -15, 0, -15, 0]
          }}
          transition={{ 
            rotate: { duration: 0.9, repeat: Infinity, ease: "linear" },
            y: { duration: 0.9, repeat: Infinity, ease: "easeInOut" }
          }}
          className="relative"
        >
          <CustomDumbbell color={color} />
          {/* Motion Blur Trail */}
          <motion.div 
            className="absolute inset-0 blur-xl opacity-40 -z-10 rounded-full" 
            style={{ backgroundColor: color }} 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }}
          />
        </motion.div>
        
        {/* Second Dumbbell */}
        <motion.div
          animate={{ 
            rotate: 360,
            y: [0, -15, 0, -15, 0]
          }}
          transition={{ 
            rotate: { duration: 0.9, repeat: Infinity, ease: "linear" },
            y: { duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: 0.2 }
          }}
          className="relative mt-12"
        >
          <CustomDumbbell color={color} />
          {/* Motion Blur Trail */}
          <motion.div 
            className="absolute inset-0 blur-xl opacity-40 -z-10 rounded-full" 
            style={{ backgroundColor: color }} 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: 0.2 }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
