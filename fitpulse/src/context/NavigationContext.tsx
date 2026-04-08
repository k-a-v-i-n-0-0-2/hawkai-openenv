import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from './ThemeContext';
import DumbbellDropLoader from '../components/DumbbellDropLoader';
import SaladLoader from '../components/SaladLoader';
import StreakFireLoader from '../components/StreakFireLoader';

import StatsLoader from '../components/StatsLoader';

interface NavigationContextType {
  navigateWithLoading: (to: string | number) => void;
  isLoading: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [targetRoute, setTargetRoute] = useState<string | number | null>(null);

  React.useEffect(() => {
    // Initial app startup loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const navigateWithLoading = useCallback((to: string | number) => {
    setTargetRoute(to);
    setIsLoading(true);
    // Simulate network/loading delay
    setTimeout(() => {
      if (typeof to === 'number') {
        navigate(to);
      } else {
        navigate(to);
      }
      // Keep loader for a tiny bit after navigation to allow page to render
      setTimeout(() => {
        setIsLoading(false);
        setTargetRoute(null);
      }, 500);
    }, 1500); // 1.5s loading screen to show animation
  }, [navigate]);

  // Theme-based colors
  const getLoaderColors = () => {
    switch (theme) {
      case 'light': return { bg: 'bg-white', text: 'text-[#0ea5e9]', border: 'border-[#0ea5e9]' };
      case 'dark': return { bg: 'bg-[#0a0a0a]', text: 'text-theme-muted', border: 'border-gray-500' };
      case 'fitpro': default: return { bg: 'bg-[#0a0a0a]', text: 'text-[#FF6B00]', border: 'border-[#FF6B00]' };
    }
  };

  const colors = getLoaderColors();

  return (
    <NavigationContext.Provider value={{ navigateWithLoading, isLoading }}>
      {children}
      
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`fixed inset-0 z-[100] flex flex-col items-center justify-center ${colors.bg}`}
          >
            {targetRoute === '/nutrition' 
              ? <SaladLoader /> 
              : targetRoute === '/analytics'
                ? <StatsLoader />
                : targetRoute === '/streaks' 
                  ? <StreakFireLoader /> 
                  : <DumbbellDropLoader />
            }
          </motion.div>
        )}
      </AnimatePresence>
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
