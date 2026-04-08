import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

export default function SaladLoader() {
  const { theme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  const getColors = () => {
    switch (theme) {
      case 'light': return { bowl: '#ffffff', rim: '#f3f4f6', shadow: 'rgba(0,0,0,0.05)', steam: 'rgba(14,165,233,0.3)', splash: 'rgba(255,255,255,0.8)', juice: '#86efac' };
      case 'dark': return { bowl: '#374151', rim: '#1f2937', shadow: 'rgba(0,0,0,0.3)', steam: 'rgba(255,255,255,0.1)', splash: 'rgba(255,255,255,0.2)', juice: '#ef4444' };
      case 'fitpro': default: return { bowl: '#2A2B2E', rim: '#1A1B1E', shadow: 'rgba(0,0,0,0.5)', steam: 'rgba(255,107,0,0.2)', splash: 'rgba(255,255,255,0.1)', juice: '#FF6B00' };
    }
  };

  const colors = getColors();

  const ingredients = [
    {
      id: 'cabbage',
      x: 80,
      v: 2.2, // Velocity factor (duration)
      delay: 0,
      juiceColor: '#86efac',
      shape: (
        <g>
          <path d="M -18 5 C -22 -12 -5 -22 8 -15 C 22 -8 18 12 5 18 C -8 22 -12 18 -18 5 Z" fill="#bbf7d0"/>
          <path d="M -5 14 Q 0 0 8 -12" fill="none" stroke="#86efac" strokeWidth="2" strokeLinecap="round"/>
        </g>
      )
    },
    {
      id: 'tomato',
      x: 115,
      v: 1.8,
      delay: 0.4,
      juiceColor: '#ef4444',
      shape: (
        <g>
          <circle cx="0" cy="0" r="16" fill="#ef4444"/>
          <path d="M -10 -8 A 12 12 0 0 1 -4 -14" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.4"/>
        </g>
      )
    },
    {
      id: 'carrot',
      x: 90,
      v: 2.5,
      delay: 0.8,
      juiceColor: '#f97316',
      shape: (
        <g>
          <circle cx="0" cy="0" r="15" fill="#f97316"/>
          <circle cx="0" cy="0" r="10" fill="#fb923c"/>
          <circle cx="0" cy="0" r="4" fill="#ea580c"/>
        </g>
      )
    },
    {
      id: 'onion',
      x: 125,
      v: 2.0,
      delay: 1.2,
      juiceColor: '#e9d5ff',
      shape: (
        <g>
          <circle cx="0" cy="0" r="16" fill="#faf5ff" stroke="#d8b4fe" strokeWidth="2"/>
          <circle cx="0" cy="0" r="11" fill="none" stroke="#e9d5ff" strokeWidth="2"/>
        </g>
      )
    },
    {
      id: 'strawberry',
      x: 105,
      v: 1.6,
      delay: 1.6,
      juiceColor: '#f43f5e',
      shape: (
        <g>
          <path d="M 0 14 C -12 14 -14 -2 -9 -9 C -4 -14 4 -14 9 -9 C 14 -2 12 14 0 14 Z" fill="#f43f5e"/>
          <path d="M 0 -9 Q -6 -14 -10 -11 Q -3 -9 0 -9 Q 3 -9 10 -11 Q 6 -14 0 -9" fill="#22c55e"/>
        </g>
      )
    }
  ];

  if (shouldReduceMotion) {
    return (
      <div className="flex items-center justify-center h-48">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#FF6B00] font-black tracking-widest uppercase">
          Preparing Fresh Mix...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center w-full h-48 overflow-hidden">
      <motion.svg 
        width="200" 
        height="200" 
        viewBox="0 0 200 200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Floor Shadow */}
        <ellipse cx="100" cy="175" rx="45" ry="8" fill={colors.shadow} />

        {/* Back Rim of Bowl */}
        <ellipse cx="100" cy="140" rx="50" ry="15" fill={colors.rim} />

        {/* Falling Ingredients with Splatter and Wobble */}
        {ingredients.map((item, i) => (
          <React.Fragment key={item.id}>
            {/* Juice Splatter Burst on Impact */}
            <g transform={`translate(${item.x}, 145)`}>
              {[...Array(8)].map((_, j) => (
                <motion.circle
                  key={j}
                  r={Math.random() * 2 + 1}
                  fill={item.juiceColor}
                  initial={{ opacity: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 0.8, 0],
                    x: [(Math.cos(j * 45 * Math.PI / 180) * 0), (Math.cos(j * 45 * Math.PI / 180) * 40)],
                    y: [(Math.sin(j * 45 * Math.PI / 180) * 0), (Math.sin(j * 45 * Math.PI / 180) * 30 - 20)]
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 2.5,
                    delay: item.delay + item.v * 0.4, // Sync with landing
                    ease: "easeOut"
                  }}
                />
              ))}
            </g>

            {/* Ingredient with gravity and wobble */}
            <motion.g
              initial={{ y: -100, x: item.x, opacity: 0, rotate: 0 }}
              animate={{
                y: [-100, 145, 135, 145],
                opacity: [0, 1, 1, 1, 0],
                rotate: [0, 180, 175, 180, 0], // Final settle
                scale: [1, 1, 1, 1, 0.5]
              }}
              transition={{
                duration: item.v + 1,
                repeat: Infinity,
                times: [0, 0.4, 0.5, 0.6, 1],
                ease: ["easeIn", "easeOut", "easeIn", "linear"],
                delay: item.delay
              }}
            >
              <item.shape.type {...item.shape.props}>
                {/* Wobble Settle Animation applied directly to rotation internally */}
                <motion.g
                  animate={{
                    rotate: [0, 4, -3, 2, 0]
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatDelay: item.v + 1 - 0.6,
                    delay: item.delay + item.v * 0.4
                  }}
                >
                  {item.shape.props.children}
                </motion.g>
              </item.shape.type>
            </motion.g>
          </React.Fragment>
        ))}

        {/* Front of Bowl */}
        <path d="M 50 140 C 50 195 150 195 150 140 Z" fill={colors.bowl} />
        
        {/* Rim Shine Sweep */}
        <motion.ellipse
          cx="100"
          cy="142"
          rx="48"
          ry="12"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
          initial={{ opacity: 0, pathLength: 0 }}
          animate={{
            opacity: [0, 0.6, 0],
            pathLength: [0, 1, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            times: [0, 0.5, 1],
            ease: "easeInOut"
          }}
        />

        {/* Top Highlight Rim */}
        <path d="M 50 140 C 50 155 150 155 150 140" stroke="rgba(255,255,255,0.1)" strokeWidth="1" fill="none" />
      </motion.svg>
    </div>
  );
}

