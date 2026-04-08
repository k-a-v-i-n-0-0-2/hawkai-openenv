import { Home, BarChart2, Droplet, User, Plus, Flame } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { ReactNode, useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { motion } from 'motion/react';
import DietChat from './DietChat';

export default function BottomNav() {
  const [showChat, setShowChat] = useState(false);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-theme-bg/95 backdrop-blur-xl border-t border-white/5 px-4 pt-4 pb-8 flex justify-between items-center z-50 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
      <div className="flex-1 flex justify-around items-center">
        <NavItem to="/dashboard" icon={<Home className="w-5 h-5" />} label="HOME" />
        <NavItem to="/analytics" icon={<BarChart2 className="w-5 h-5" />} label="STATS" />
      </div>
    
      <div className="relative w-16 flex justify-center -top-6 mx-4">
        <motion.button 
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowChat(true)} 
          className="w-14 h-14 bg-theme-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/40 text-on-primary border-4 border-theme-bg z-50 group"
        >
          <Plus className="w-7 h-7 transition-transform group-hover:scale-110" />
        </motion.button>
        <div className="absolute -inset-2 bg-theme-primary/20 blur-2xl rounded-full opacity-50 -z-10" />
      </div>

      <div className="flex-1 flex justify-around items-center">
        <NavItem to="/nutrition" icon={<Droplet className="w-5 h-5" />} label="DIET" />
        <NavItem to="/profile" icon={<User className="w-5 h-5" />} label="PROFILE" />
      </div>
    </div>
    {showChat && <DietChat onClose={() => setShowChat(false)} />}
    </>
  );
}


function NavItem({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  const location = useLocation();
  const { navigateWithLoading } = useNavigation();
  const isActive = location.pathname === to;

  return (
    <button
      onClick={() => { if (!isActive) navigateWithLoading(to); }}
      className={cn(
        "flex flex-col items-center gap-1.5 transition-all relative py-1 px-2 rounded-xl",
        isActive ? "text-theme-primary" : "text-theme-muted hover:text-theme-main"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="bottomNavGlow"
          className="absolute -top-4 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-theme-primary shadow-[0_0_12px_rgba(255,107,0,0.8)]"
        />
      )}
      <span className={cn("relative z-10 transition-transform", isActive && "scale-110")}>{icon}</span>
      <span className="text-[8px] font-black tracking-[0.2em] relative z-10 uppercase italic">{label}</span>
    </button>
  );
}

