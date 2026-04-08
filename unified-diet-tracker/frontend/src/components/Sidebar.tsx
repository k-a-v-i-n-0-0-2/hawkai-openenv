import React from 'react';
import { Home, BarChart2, Droplet, User, Flame, LogOut, Zap, Activity } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useNavigation } from '../context/NavigationContext';
import { motion } from 'motion/react';

const NAV_ITEMS = [
  { to: '/dashboard', icon: Home, label: 'DASHBOARD' },
  { to: '/analytics', icon: BarChart2, label: 'STATS' },
  { to: '/nutrition', icon: Droplet, label: 'NUTRITION' },
  { to: '/profile', icon: User, label: 'PROFILE' },
];

export default function Sidebar() {
  const location = useLocation();
  const { navigateWithLoading } = useNavigation();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen fixed left-0 top-0 bg-theme-bg border-r border-white/5 z-50 overflow-hidden">
      {/* Cinematic Logo Area */}
      <div className="p-10 flex flex-col gap-6 relative">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigateWithLoading('/dashboard')}>
          <div className="w-12 h-12 bg-theme-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/30 group-hover:scale-110 transition-transform duration-500">
            <Zap className="w-6 h-6 text-theme-main fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter text-theme-main italic leading-none">FITPULSE</span>
            <span className="text-[8px] font-black tracking-[0.3em] text-theme-primary uppercase mt-1">NEURAL HUB</span>
          </div>
        </div>
        
        {/* Subtle scanning light for sidebar top */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-theme-primary/20 to-transparent" />
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-4 py-8 space-y-3">
        <p className="px-6 pb-4 text-[9px] font-black text-theme-muted tracking-[0.4em] uppercase opacity-40">BIOMETRIC MODULES</p>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <button
              key={item.to}
              onClick={() => !isActive && navigateWithLoading(item.to)}
              className={cn(
                "w-full flex items-center gap-5 px-6 py-4 rounded-2xl transition-all duration-300 relative group",
                isActive 
                  ? "bg-theme-primary/10 text-theme-primary shadow-xl shadow-orange-500/5 ring-1 ring-theme-primary/20" 
                  : "text-theme-muted hover:text-theme-main hover:bg-white/[0.03]"
              )}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeIndicator"
                  className="absolute left-0 w-1.5 h-6 bg-theme-primary rounded-full shadow-[4px_0_15px_rgba(255,107,0,0.6)]" 
                />
              )}
              <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-theme-primary" : "opacity-40")} />
              <span className="font-black text-[10px] tracking-[0.2em] uppercase italic">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-6 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-4 mb-6 px-4">
          <Activity className="w-4 h-4 text-theme-primary animate-pulse" />
          <span className="text-[10px] font-black tracking-widest text-theme-muted uppercase opacity-40">SYSTEM ARMED</span>
        </div>
        <button 
          onClick={() => navigateWithLoading('/login')}
          className="w-full flex items-center gap-5 px-6 py-4 rounded-2xl text-theme-muted hover:text-red-500 hover:bg-red-500/5 transition-all duration-300 group"
        >
          <LogOut className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
          <span className="font-black text-[10px] tracking-[0.2em] uppercase italic">LOG OUT</span>
        </button>
      </div>
    </aside>
  );
}
