import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const THEME_MOCKUPS = {
  fitpro: {
    bg: '#0a0a0a',
    card: '#1A1B1E',
    primary: '#FF6B00',
    secondary1: '#00E5FF',
    secondary2: '#B388FF',
    muted: 'rgba(255,255,255,0.2)',
    border: 'rgba(255,255,255,0.05)',
    activeBorder: '#FF6B00',
    activeShadow: '0 0 15px rgba(255,107,0,0.3)',
    name: 'FitPro',
    desc: 'Vibrant and energetic'
  },
  light: {
    bg: '#f8fafc',
    card: '#ffffff',
    primary: '#0ea5e9',
    secondary1: '#0ea5e9',
    secondary2: '#0ea5e9',
    muted: 'rgba(0,0,0,0.2)',
    border: 'rgba(0,0,0,0.05)',
    activeBorder: '#0ea5e9',
    activeShadow: '0 0 15px rgba(14,165,233,0.3)',
    name: 'Light',
    desc: 'Clean and minimalist'
  },
  dark: {
    bg: '#000000',
    card: '#111111',
    primary: '#ffffff',
    secondary1: '#4b5563',
    secondary2: '#4b5563',
    muted: 'rgba(255,255,255,0.2)',
    border: 'rgba(255,255,255,0.05)',
    activeBorder: '#ffffff',
    activeShadow: '0 0 15px rgba(255,255,255,0.1)',
    name: 'Dark',
    desc: 'Sleek and modern'
  }
} as const;

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  onThemeSelect: (themeId: string) => void;
}

export default function ThemeModal({ isOpen, onClose, currentTheme, onThemeSelect }: ThemeModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-theme-card w-full max-w-xl rounded-[40px] p-8 md:p-10 border border-theme shadow-2xl relative z-70"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8 px-2">
              <div>
                <h3 className="text-2xl font-black tracking-tight">Appearance</h3>
                <p className="text-xs text-theme-muted font-bold tracking-widest uppercase mt-1">Customize your experience</p>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 rounded-2xl bg-theme-bg/50 border border-theme flex items-center justify-center hover:bg-theme-primary/10 transition-colors"
              >
                <span className="text-theme-muted font-black text-xs">✕</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(Object.entries(THEME_MOCKUPS) as [keyof typeof THEME_MOCKUPS, typeof THEME_MOCKUPS[keyof typeof THEME_MOCKUPS]][]).map(([themeId, config]) => {
                const isActive = currentTheme === themeId;
                return (
                  <button 
                    key={themeId}
                    onClick={() => onThemeSelect(themeId)}
                    className="flex flex-col items-center gap-4 group"
                  >
                    <div 
                      className={cn(
                        "w-full aspect-[4/5] rounded-[24px] p-4 flex flex-col gap-3 border-2 transition-all group-hover:scale-105",
                        !isActive && "border-theme-border/5 group-hover:border-theme-primary/20"
                      )}
                      style={{ 
                        backgroundColor: config.bg,
                        borderColor: isActive ? config.activeBorder : undefined,
                        boxShadow: isActive ? config.activeShadow : undefined
                      }}
                    >
                      {/* Header */}
                      <div className="flex justify-between items-center">
                        <div className="w-10 h-2 rounded-full" style={{ backgroundColor: config.muted }}></div>
                        <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: config.card, borderColor: config.border }}></div>
                      </div>
                      {/* Hero Card */}
                      <div className="w-full h-12 rounded-xl p-3 flex flex-col justify-end border" style={{ backgroundColor: config.card, borderColor: config.border }}>
                        <div className="w-3/4 h-2 rounded-full mb-1" style={{ backgroundColor: config.primary }}></div>
                        <div className="w-1/2 h-1 rounded-full" style={{ backgroundColor: config.muted }}></div>
                      </div>
                      {/* Grid Items */}
                      <div className="grid grid-cols-2 gap-2 flex-1">
                        <div className="rounded-lg p-2 flex flex-col gap-2 border" style={{ backgroundColor: config.card, borderColor: config.border }}>
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: config.secondary1 }}></div>
                          <div className="w-full h-1 rounded-full" style={{ backgroundColor: config.muted }}></div>
                        </div>
                        <div className="rounded-lg p-2 flex flex-col gap-2 border" style={{ backgroundColor: config.card, borderColor: config.border }}>
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: config.secondary2 }}></div>
                          <div className="w-full h-1 rounded-full" style={{ backgroundColor: config.muted }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-1">
                      <span 
                        className="text-sm font-black tracking-widest uppercase" 
                        style={{ color: isActive ? config.activeBorder : 'var(--theme-muted)' }}
                      >
                        {config.name}
                      </span>
                      <div 
                        className="w-2 h-2 rounded-full transition-all mt-1" 
                        style={{ 
                          backgroundColor: isActive ? config.activeBorder : 'transparent',
                          boxShadow: isActive ? config.activeShadow : 'none'
                        }}
                      ></div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            <div className="mt-10 p-6 bg-theme-primary/5 rounded-[24px] border border-theme-primary/10">
              <p className="text-xs text-theme-muted font-black uppercase text-center tracking-widest leading-relaxed">
                Premium themes are unlocked for <span className="text-theme-primary">PRO</span> members only. Enjoy full customization.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
