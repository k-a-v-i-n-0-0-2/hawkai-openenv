import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Droplet, 
  Heart, 
  Moon, 
  Zap, 
  Target, 
  CheckCircle2, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  BarChart2, 
  Shield 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { useNavigation } from '../context/NavigationContext';
import PageTransition from '../components/PageTransition';
import { useUser } from '../context/UserContext';
import { 
  motion, 
  useMotionValue, 
  useTransform, 
  animate, 
  useReducedMotion 
} from 'motion/react';
import { StatCard, MetricGrid } from '../components/StatCard';
import PageHeader from '../components/PageHeader';

const CountUp = ({ value, duration = 1.5, delay = 0 }: { value: number, duration?: number, delay?: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest).toLocaleString());
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value.toLocaleString());
      return;
    }
    const controls = animate(count, value, { duration, delay, ease: "easeOut" });
    return controls.stop;
  }, [value, duration, delay, shouldReduceMotion, count]);

  return <motion.span>{shouldReduceMotion ? displayValue : rounded}</motion.span>;
};

const energyData = [
  { time: '6AM', val1: 40, val2: 30 },
  { time: '9AM', val1: 70, val2: 50 },
  { time: '12PM', val1: 85, val2: 60 },
  { time: '3PM', val1: 60, val2: 80 },
  { time: '6PM', val1: 40, val2: 40 },
  { time: '9PM', val1: 20, val2: 30 },
];

export default function Dashboard() {
  const { navigateWithLoading } = useNavigation();
  const { streak, setStreak, userName } = useUser();

  return (
    <PageTransition>
      <div className="flex flex-col">
        <PageHeader 
          title="DASHBOARD" 
          subtitle={`Welcome back, ${userName.split(' ')[0]}. All systems operational.`}
        >
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-2xl bg-theme-primary/10 border border-theme-primary/20 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-theme-primary animate-pulse" />
              <span className="text-[10px] font-black text-theme-primary uppercase tracking-widest">LIVE BIOMETRICS</span>
            </div>
            <button className="w-10 h-10 rounded-2xl bg-theme-card border border-theme flex items-center justify-center hover:bg-theme-primary/10 transition-colors">
              <Shield className="w-5 h-5 text-theme-muted" />
            </button>
          </div>
        </PageHeader>

        <div className="content-grid">
          {/* Main Feed (2/3) */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            
            {/* AI Energy Index Main Card */}
            <motion.div 
              whileHover={{ scale: 1.002 }}
              className="glass-card p-6 sm:p-10 relative overflow-hidden"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8 mb-8 md:mb-12">
                <div>
                  <h3 className="text-[9px] md:text-xs font-black tracking-[0.2em] text-theme-muted uppercase mb-2 md:mb-3 opacity-60">AI ENERGY INDEX</h3>
                  <p className="text-[10px] md:text-sm text-theme-muted opacity-40">Biometric synthesis</p>
                </div>
                <div className="flex items-center gap-6 md:gap-8">
                  <div className="flex flex-col items-start md:items-end">
                    <span className="text-5xl md:text-7xl font-black tracking-tighter leading-none"><CountUp value={82} /></span>
                    <div className="bg-theme-primary/10 border border-theme-primary/20 px-3 py-1 rounded-full mt-2">
                      <span className="text-[9px] font-bold text-theme-primary tracking-wider uppercase">OPTIMAL STATE</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-48 md:h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={energyData}>
                    <defs>
                      <linearGradient id="colorVal1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip 
                      contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                      itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                    />
                    <XAxis dataKey="time" hide />
                    <YAxis hide />
                    <Area type="monotone" dataKey="val1" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorVal1)" />
                    <Area type="monotone" dataKey="val2" stroke="var(--text-muted)" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-4 gap-2 mt-8 md:mt-10 pt-8 md:pt-10 border-t border-theme-border/10">
                {['Heart', 'Posture', 'Sedentary', 'Sleep'].map((label, i) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 md:gap-2">
                    <div className={cn("w-1.5 h-1.5 md:w-2 md:h-2 rounded-full", i % 2 === 0 ? "bg-theme-primary" : "bg-theme-muted/40")} />
                    <span className="text-[7px] md:text-[10px] font-black text-theme-muted uppercase tracking-widest text-center leading-tight">{label}<br/>{i % 2 === 0 ? 'OK' : 'OFF'}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Activity Metrics Grid */}
            <MetricGrid cols={2}>
              <StatCard 
                label="Active Calories" 
                value={642} 
                unit="kcal" 
                icon={<Zap className="w-5 h-5" />} 
                trend={{ value: '12%', isUp: true }}
                color="#FF6B00"
              />
              <StatCard 
                label="Steps" 
                value={8240} 
                unit="steps" 
                icon={<Activity className="w-5 h-5" />} 
                trend={{ value: '2.4k', isUp: true }}
                color="#00E5FF"
              />
              <StatCard 
                label="Hydration" 
                value={1.8} 
                unit="liters" 
                icon={<Droplet className="w-5 h-5" />} 
                trend={{ value: '0.4L', isUp: false }}
                color="#00E5FF"
              />
              <StatCard 
                label="Recovery" 
                value={92} 
                unit="%" 
                icon={<Moon className="w-5 h-5" />} 
                trend={{ value: '5%', isUp: true }}
                color="#B388FF"
              />
            </MetricGrid>

            {/* Today's Timeline */}
            <div className="glass-card p-6 sm:p-10">
              <div className="flex items-center justify-between mb-8 md:mb-10">
                <h3 className="text-lg md:text-xl font-black italic tracking-tight">TODAY'S FLOW</h3>
                <button className="text-[9px] md:text-[10px] font-black text-theme-primary tracking-[0.2em] uppercase">VIEW LOG</button>
              </div>
              <div className="space-y-8 md:space-y-10 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-theme-border/10">
                {[
                  { time: '06:30 AM', title: 'Morning Run', desc: '5.2 km • Zone 3', status: 'Done', color: 'var(--primary)' },
                  { time: '09:15 AM', title: 'Focus Block', desc: 'Deep work • 1h 45m', status: 'Active', color: '#00E5FF' },
                  { time: '12:30 PM', title: 'Power Lunch', desc: 'High Protein • 650 kcal', status: 'Pending', color: 'var(--text-muted)' },
                ].map((item, i) => (
                  <div key={i} className="relative pl-8 md:pl-10 group">
                    <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-theme-bg border-4 border-theme-card z-10 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all group-hover:scale-150 shadow-lg shadow-theme-glow" style={{ backgroundColor: item.color }} />
                    </div>
                    <div className="flex justify-between items-center bg-theme-bg/30 p-4 md:p-5 rounded-[20px] md:rounded-[24px] border border-theme-border/5 group-hover:border-theme-primary/20 transition-all">
                      <div className="min-w-0 pr-2">
                        <p className="text-[8px] md:text-[10px] font-black text-theme-muted mb-0.5 opacity-40 uppercase">{item.time}</p>
                        <h4 className="font-black text-sm md:text-base tracking-tight truncate">{item.title}</h4>
                        <p className="text-[10px] text-theme-muted font-bold opacity-60 truncate">{item.desc}</p>
                      </div>
                      <span className={cn(
                        "text-[8px] md:text-[10px] font-black px-3 md:px-4 py-1 rounded-full uppercase tracking-wider shrink-0",
                        item.status === 'Active' ? "bg-theme-primary/10 text-theme-primary border border-theme-primary/20" : "bg-white/5 text-theme-muted border border-white/5"
                      )}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Column (1/3) */}
          <div className="lg:col-span-4 flex flex-col gap-10">
            
            {/* Quick Actions */}
            <div className="glass-card p-10">
              <h3 className="text-lg font-black italic mb-8">QUICK ACTIONS</h3>
              <div className="grid grid-cols-2 gap-5">
                <button 
                  onClick={() => setStreak(streak + 1)}
                  className="flex flex-col items-center justify-center gap-4 p-8 rounded-[32px] bg-theme-primary text-on-primary shadow-xl shadow-orange-500/20 hover:scale-105 transition-all group"
                >
                  <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform" />
                  <span className="text-[11px] font-black uppercase tracking-widest">LOG</span>
                </button>
                <button 
                  onClick={() => navigateWithLoading('/nutrition')}
                  className="flex flex-col items-center justify-center gap-4 p-8 rounded-[32px] bg-theme-card border border-theme hover:bg-white/5 transition-all group"
                >
                  <Droplet className="w-8 h-8 text-theme-primary group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-black uppercase tracking-widest">WATER</span>
                </button>
              </div>
            </div>

            {/* AI Coach Snippet */}
            <div className="glass-card p-10 border-l-4 border-l-theme-primary relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-theme-primary/10 flex items-center justify-center border border-theme-primary/20">
                  <Zap className="w-5 h-5 text-theme-primary" />
                </div>
                <span className="text-[11px] font-black tracking-[0.2em] text-theme-primary uppercase">AI COACH</span>
              </div>
              <p className="text-base md:text-lg font-black leading-tight mb-6 relative z-10 italic">
                "Your focus window peaks in <span className="text-theme-primary">45 minutes</span>. Ideal time for deep work session."
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold text-theme-muted uppercase tracking-widest relative z-10">
                <Activity className="w-4 h-4" />
                <span>Biometric confidence: 94%</span>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-theme-primary/5 rounded-full -translate-y-12 translate-x-12 blur-3xl" />
            </div>

            {/* Micro Habits */}
            <div className="glass-card p-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black italic">HABIT STACK</h3>
                <span className="text-[10px] font-black text-theme-muted uppercase tracking-widest opacity-50">4 / 6 DONE</span>
              </div>
              <div className="space-y-8">
                {[
                  { label: 'Morning Movement', progress: 100, streak: 12 },
                  { label: 'Water Goal', progress: 65, streak: 5 },
                  { label: 'Mindful Minute', progress: 100, streak: 8 },
                ].map((habit) => (
                  <div key={habit.label}>
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <h5 className="text-base font-black tracking-tight uppercase">{habit.label}</h5>
                        <p className="text-[10px] font-black text-theme-muted uppercase tracking-[0.2em] mt-1 opacity-50">{habit.streak} DAY STREAK</p>
                      </div>
                      {habit.progress === 100 && <CheckCircle2 className="w-5 h-5 text-theme-primary" />}
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${habit.progress}%` }}
                        className="h-full bg-theme-primary rounded-full shadow-lg shadow-theme-glow"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Summary */}
            <div className="glass-card p-10 overflow-hidden relative group">
              <div className="absolute -top-6 -right-6 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <BarChart2 className="w-32 h-32" />
              </div>
              <h3 className="text-lg font-black italic mb-8 uppercase">Weekly Outlook</h3>
              <div className="space-y-6">
                {[
                  { label: 'Activity Level', val: '14%', isUp: true },
                  { label: 'Sleep Quality', val: '2%', isUp: false },
                  { label: 'Stress Index', val: 'STABLE', isUp: null },
                ].map((stat) => (
                  <div key={stat.label} className="flex justify-between items-center group/stat transition-colors">
                    <span className="text-sm text-theme-muted font-black tracking-wide group-hover/stat:text-theme-main uppercase">{stat.label}</span>
                    <div className={cn(
                      "flex items-center gap-1 font-black text-sm",
                      stat.isUp === true ? "text-theme-primary" : stat.isUp === false ? "text-red-500" : "text-theme-main"
                    )}>
                      {stat.isUp === true && <ArrowUpRight className="w-4 h-4" />}
                      {stat.isUp === false && <ArrowDownRight className="w-4 h-4" />}
                      <span>{stat.val}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
