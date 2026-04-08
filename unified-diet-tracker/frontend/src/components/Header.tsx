import React from 'react';
import { Bell, Zap } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useNavigation } from '../context/NavigationContext';

export default function Header() {
  const { getInitials } = useUser();
  const { navigateWithLoading } = useNavigation();

  return (
    <header className="lg:hidden px-6 pt-12 pb-6 flex items-center justify-between sticky top-0 bg-theme-bg/80 backdrop-blur-md z-40">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-theme-primary rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
          <Zap className="w-5 h-5 text-theme-main fill-white" />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-[0.1em] text-theme-main leading-none">FITPULSE</h1>
          <p className="text-[8px] font-bold tracking-[0.2em] text-theme-muted uppercase mt-1">AI HEALTH • 2026</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="w-10 h-10 rounded-full bg-theme-card flex items-center justify-center border border-theme relative group">
          <Bell className="w-4 h-4 text-theme-muted group-hover:text-theme-main transition-colors" />
          <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-theme-primary rounded-full"></div>
        </button>
        <button 
          onClick={() => navigateWithLoading('/profile')} 
          className="w-10 h-10 rounded-full bg-theme-primary/10 flex items-center justify-center border border-theme-primary/20 hover:border-theme-primary transition-all"
        >
          <span className="text-theme-primary font-bold text-sm tracking-tighter">{getInitials()}</span>
        </button>
      </div>
    </header>
  );
}
