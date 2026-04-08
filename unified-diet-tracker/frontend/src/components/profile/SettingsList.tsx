import { ChevronRight, Flame, Palette, User, Activity, Dumbbell, Bell, Share2, Shield, HelpCircle, LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface SettingsListProps {
  streak: number;
  theme: string;
  onThemeClick: () => void;
  onNotificationsClick: () => void;
  onSocialClick: () => void;
  onWorkoutClick: () => void;
  onLogoutClick: () => void;
  onStreaksClick: () => void;
}

export default function SettingsList({ 
  streak, theme, onThemeClick, onNotificationsClick, onSocialClick, onWorkoutClick, onLogoutClick, onStreaksClick 
}: SettingsListProps) {
  
  const menuItems = [
    { 
      label: 'Streak Leaderboard', 
      icon: <Flame className="w-5 h-5 text-theme-primary" />, 
      activeIcon: true,
      subValue: `🔥 ${streak} DAYS`,
      onClick: onStreaksClick
    },
    { 
      label: 'Theme Mode', 
      icon: <Palette className="w-5 h-5 text-theme-muted" />, 
      subValue: theme.toUpperCase(),
      onClick: onThemeClick 
    },
    { 
      label: 'Personal Information', 
      icon: <User className="w-5 h-5 text-theme-muted" />, 
      onClick: () => {} 
    },
    { 
      label: 'Connected Devices', 
      icon: <Activity className="w-5 h-5 text-theme-muted" />, 
      subValue: 'APPLE WATCH',
      onClick: () => {} 
    },
    { 
      label: 'Workout Tracking', 
      icon: <Dumbbell className="w-5 h-5 text-theme-muted" />, 
      onClick: onWorkoutClick 
    },
    { 
      label: 'Notifications', 
      icon: <Bell className="w-5 h-5 text-theme-muted" />, 
      onClick: onNotificationsClick 
    },
    { 
      label: 'Social Sharing', 
      icon: <Share2 className="w-5 h-5 text-theme-muted" />, 
      onClick: onSocialClick 
    },
    { 
      label: 'Privacy & Security', 
      icon: <Shield className="w-5 h-5 text-theme-muted" />, 
      onClick: () => {} 
    },
    { 
      label: 'Help & Support', 
      icon: <HelpCircle className="w-5 h-5 text-theme-muted" />, 
      onClick: () => {} 
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4 px-2">
        <h3 className="text-xl font-black tracking-tight">Account Settings</h3>
        <div className="flex-1 h-px bg-theme-border/5" />
      </div>

      <div className="glass-card rounded-[40px] border border-theme overflow-hidden divide-y divide-theme-border/5 bg-theme-card/30">
        {menuItems.map((item, i) => (
          <motion.button 
            key={i}
            whileHover={{ backgroundColor: 'rgba(255,107,0,0.03)' }}
            onClick={item.onClick}
            className="w-full flex items-center justify-between p-6 transition-all group"
          >
            <div className="flex items-center gap-5">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center border border-theme bg-theme-card transition-all group-hover:scale-110",
                item.activeIcon ? "border-theme-primary/20 bg-theme-primary/5" : "group-hover:border-theme-primary/20"
              )}>
                {item.icon}
              </div>
              <span className="font-black text-base tracking-tight">{item.label}</span>
            </div>
            
            <div className="flex items-center gap-3">
              {item.subValue && (
                <span className="text-[10px] font-black text-theme-primary tracking-widest uppercase bg-theme-primary/10 px-3 py-1.5 rounded-full">
                  {item.subValue}
                </span>
              )}
              <ChevronRight className="w-5 h-5 text-theme-muted group-hover:text-theme-primary transition-colors" />
            </div>
          </motion.button>
        ))}
      </div>

      <button 
        onClick={onLogoutClick}
        className="w-full glass-card border border-red-500/10 hover:bg-red-500/5 text-red-500 font-black py-6 rounded-[32px] transition-all flex items-center justify-center gap-3 mt-4 group"
      >
        <LogOut className="w-6 h-6 group-hover:scale-110 transition-transform" />
        LOG OUT ACCOUNT
      </button>
    </div>
  );
}
