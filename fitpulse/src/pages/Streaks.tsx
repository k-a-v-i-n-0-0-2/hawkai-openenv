import React, { useMemo } from 'react';
import { Flame, Trophy, TrendingUp, TrendingDown, Settings, Bell, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { useNavigation } from '../context/NavigationContext';
import PageTransition from '../components/PageTransition';
import { cn } from '../lib/utils';
import PageHeader from '../components/PageHeader';

const INITIAL_FRIENDS_DATA = [
  { name: "Arjun", streak: 21, avatar: null },
  { name: "Rahul", streak: 18, avatar: null },
  { name: "Kiran", streak: 10, avatar: null },
  { name: "Sarah", streak: 25, avatar: null },
  { name: "Mike", streak: 12, avatar: null },
];

export default function Streaks() {
  const { userName, streak, getInitials } = useUser();

  const leaderboardData = useMemo(() => {
    const data = [
      ...INITIAL_FRIENDS_DATA,
      { name: userName || "You", streak: streak, isUser: true, initials: getInitials() }
    ];
    return data.sort((a, b) => b.streak - a.streak).map((item, index) => ({
      ...item,
      rank: index + 1,
      trend: Math.random() > 0.5 ? 'up' : 'down'
    }));
  }, [userName, streak, getInitials]);

  const userRank = leaderboardData.find(item => item.isUser)?.rank || 0;

  return (
    <PageTransition>
      <div className="flex flex-col">
        <PageHeader 
          title="STREAKS" 
          subtitle="Consistency is the ultimate performance multiplier"
        >
          <div className="flex items-center gap-3">
             <button className="w-10 h-10 rounded-2xl bg-theme-card border border-theme flex items-center justify-center hover:bg-theme-primary/10 transition-colors group">
              <Share2 className="w-5 h-5 text-theme-muted group-hover:text-theme-primary" />
            </button>
            <button className="w-10 h-10 rounded-2xl bg-theme-card border border-theme flex items-center justify-center hover:bg-theme-primary/10 transition-colors group">
              <Settings className="w-5 h-5 text-theme-muted group-hover:text-theme-primary" />
            </button>
          </div>
        </PageHeader>

        <div className="content-grid">
          {/* User Sidebar (Highlighted Rank) */}
          <div className="lg:col-span-4 flex flex-col gap-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-6 sm:p-10 relative overflow-hidden bg-gradient-to-br from-theme-primary/5 to-transparent border-theme-primary/10"
            >
              <div className="absolute -top-12 -right-12 opacity-5 scale-150 rotate-12">
                <Trophy className="w-48 h-48 text-theme-primary" />
              </div>
              
              <div className="flex flex-col items-center text-center mb-10 md:mb-12 relative z-10">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-[28px] md:rounded-[32px] bg-theme-card border-2 border-theme-primary flex items-center justify-center shadow-2xl shadow-orange-500/20 mb-6 md:mb-8 group hover:scale-105 transition-transform shrink-0">
                  <span className="text-2xl md:text-3xl font-black text-theme-primary">{getInitials()}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2 md:mb-3 italic uppercase truncate max-w-full">{userName || 'User'}</h2>
                <div className="bg-theme-primary/10 border border-theme-primary/20 px-4 md:px-5 py-1.5 md:py-2 rounded-full shadow-lg shadow-orange-500/5">
                  <span className="text-[9px] md:text-[10px] font-black text-theme-primary tracking-[0.15em] md:tracking-[0.2em] uppercase">GLOBAL RANK #{userRank}</span>
                </div>
              </div>

              <div className="space-y-8 md:space-y-10 relative z-10">
                <div>
                  <p className="text-[9px] md:text-[10px] font-black text-theme-muted uppercase tracking-[0.2em] md:tracking-[0.3em] mb-3 md:mb-4 opacity-70">ACTIVE STREAK</p>
                  <div className="flex items-baseline gap-2 md:gap-3">
                    <span className="text-5xl md:text-7xl font-black tracking-tighter italic leading-none">{streak}</span>
                    <span className="text-base md:text-xl font-black text-theme-primary uppercase italic tracking-widest">DAYS 🔥</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-[9px] md:text-[10px] font-black text-theme-muted tracking-[0.2em] md:tracking-[0.3em] uppercase opacity-70">
                    <span>NEXT MILESTONE</span>
                    <span>30 DAYS</span>
                  </div>
                  <div className="h-2 md:h-2.5 w-full bg-white/5 rounded-full overflow-hidden shadow-inner flex">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((streak / 30) * 100, 100)}%` }}
                      className="h-full bg-theme-primary shadow-[0_0_20px_rgba(255,107,0,0.6)]"
                    />
                  </div>
                  <p className="text-[8px] md:text-[10px] font-black text-center text-theme-muted opacity-40 uppercase tracking-[0.2em]">COMPLETE {30 - (streak % 30)} MORE SESSIONS</p>
                </div>
              </div>
            </motion.div>

            <div className="glass-card p-8 border-l-4 border-l-theme-primary relative overflow-hidden group">
              <div className="flex items-center gap-3 mb-4 opacity-60">
                <Bell className="w-4 h-4 text-theme-primary" />
                <span className="text-[10px] font-black tracking-widest uppercase">STREAK ALERT</span>
              </div>
              <p className="text-sm md:text-base text-theme-main font-black leading-tight italic">
                "Consistency beats intensity. Even 5 mins a day keeps the neurological pathways alive."
              </p>
              <div className="absolute top-0 right-0 w-24 h-24 bg-theme-primary/5 rounded-full blur-3xl -translate-y-10 translate-x-10" />
            </div>
          </div>

          {/* Global Leaderboard Section */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            <div className="flex items-center gap-6 mb-2">
               <div className="w-10 h-10 rounded-2xl bg-theme-primary/10 flex items-center justify-center border border-theme-primary/20">
                <Trophy className="w-5 h-5 text-theme-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-black tracking-tight italic uppercase">Squad Leaderboard</h3>
              <div className="flex-1 h-px bg-theme-border/5" />
            </div>

            <div className="space-y-3 sm:space-y-4">
              {leaderboardData.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "glass-card p-4 sm:p-6 flex items-center gap-4 sm:gap-6 transition-all group hover:bg-white/[0.02] relative",
                    item.isUser && "border-theme-primary/30 bg-theme-primary/[0.04]",
                    item.rank === 1 && "border-yellow-500/30 bg-yellow-500/[0.02]",
                  )}
                >
                  <div className={cn(
                    "w-8 sm:w-12 text-center font-black italic text-xl sm:text-2xl tracking-tighter shrink-0",
                    item.rank === 1 ? "text-yellow-500" : 
                    item.rank === 2 ? "text-slate-400" : 
                    item.rank === 3 ? "text-amber-700" : "text-theme-muted opacity-40"
                  )}>
                    {item.rank}
                  </div>

                  <div className={cn(
                    "relative w-10 h-10 sm:w-14 sm:h-14 rounded-[12px] sm:rounded-2xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-105",
                    item.rank === 1 ? "bg-yellow-500/10 border-yellow-500/20 shadow-xl shadow-yellow-500/10" : "bg-theme-card border-theme"
                  )}>
                    <span className="text-[10px] sm:text-sm font-black tracking-tight">
                      {item.initials || item.name.slice(0, 2).toUpperCase()}
                    </span>
                    {item.rank === 1 && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                        <Trophy className="w-3.5 h-3.5 text-theme-bg" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <p className="font-black text-base sm:text-xl tracking-tight uppercase italic truncate">
                        {item.name}
                      </p>
                      {item.isUser && (
                        <span className="text-[8px] sm:text-[10px] font-black bg-theme-primary text-on-primary px-2 sm:px-3 py-0.5 sm:py-1 rounded-full tracking-[0.1em] sm:tracking-[0.2em] shadow-lg shadow-orange-500/20">ME</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 shrink-0 overflow-hidden">
                       {item.trend === 'up' ? (
                         <TrendingUp className="w-3 sm:w-4 h-3 sm:h-4 text-green-500 shrink-0" />
                       ) : (
                         <TrendingDown className="w-3 sm:w-4 h-3 sm:h-4 text-red-500 shrink-0" />
                       )}
                       <span className={cn("text-[8px] sm:text-[10px] font-black tracking-widest uppercase truncate opacity-60", item.trend === 'up' ? "text-green-500" : "text-red-500")}>
                         {item.trend === 'up' ? 'UP' : 'DOWN'}
                       </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-2">
                    <div className="flex items-center gap-2 sm:gap-3 justify-end">
                      <span className="text-2xl sm:text-3xl font-black tracking-tighter italic leading-none">{item.streak}</span>
                      <div className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all",
                        item.streak > 20 ? "bg-theme-primary/10" : "bg-theme-card"
                      )}>
                        <Flame className={cn("w-4 h-4 sm:w-6 sm:h-6", item.streak > 20 ? "text-theme-primary fill-theme-primary/20 animate-pulse" : "text-theme-muted opacity-20")} />
                      </div>
                    </div>
                    <p className="text-[7px] md:text-[9px] font-black text-theme-muted uppercase tracking-widest mt-1 opacity-40">DAYS</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
