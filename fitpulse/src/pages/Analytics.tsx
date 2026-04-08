import React from 'react';
import { ChevronLeft, ChevronRight, Activity, Flame, Zap, Droplet, Moon, Heart, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import PageTransition from '../components/PageTransition';
import { StatCard, MetricGrid } from '../components/StatCard';
import { cn } from '../lib/utils';
import PageHeader from '../components/PageHeader';

const activityData = [
  { day: 'MON', value: 45 },
  { day: 'TUE', value: 82 },
  { day: 'WED', value: 60 },
  { day: 'THU', value: 95 },
  { day: 'FRI', value: 30 },
  { day: 'SAT', value: 70 },
  { day: 'SUN', value: 50 },
];

export default function Analytics() {
  return (
    <PageTransition>
      <div className="flex flex-col">
        <PageHeader 
          title="ANALYTICS" 
          subtitle="Data-driven performance insights & trends"
        >
          <div className="flex items-center gap-2 bg-theme-card/50 rounded-2xl p-1 border border-theme">
            <button className="px-5 py-2 rounded-xl bg-theme-primary text-on-primary text-[10px] font-black tracking-widest uppercase shadow-lg shadow-orange-500/10">WEEK</button>
            <button className="px-5 py-2 rounded-xl text-theme-muted text-[10px] font-black tracking-widest uppercase hover:text-theme-main transition-colors">MONTH</button>
          </div>
        </PageHeader>

        {/* Date Selector Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10 md:mb-12">
          <div className="flex items-center gap-3 md:gap-4">
            <button className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-theme-card border border-theme flex items-center justify-center hover:border-theme-primary/30 transition-all group shrink-0">
              <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-theme-muted group-hover:text-theme-primary transition-colors" />
            </button>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <Calendar className="w-3 md:w-3.5 h-3 md:h-3.5 text-theme-primary shrink-0" />
                <span className="text-base md:text-lg font-black tracking-tight uppercase truncate">MAR 10 - 16, 2026</span>
              </div>
              <span className="text-[8px] md:text-[9px] font-black text-theme-primary tracking-[0.2em] uppercase opacity-60">CURRENT PERIOD</span>
            </div>
            <button className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-theme-card border border-theme flex items-center justify-center opacity-30 cursor-not-allowed shrink-0">
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-theme-muted" />
            </button>
          </div>
          
          <div className="flex items-center gap-3 px-4 md:px-5 py-2 md:py-2.5 rounded-2xl bg-theme-card/30 border border-theme border-dashed self-start sm:self-auto">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <span className="text-[9px] md:text-[10px] font-black text-theme-muted tracking-widest uppercase">Sync Status: 100%</span>
          </div>
        </div>

        {/* Main Chart Card */}
        <div className="glass-card p-6 sm:p-10 mb-10 md:mb-12 relative overflow-hidden group">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8 mb-8 md:mb-12">
            <div>
              <h3 className="text-[9px] md:text-xs font-black tracking-[0.2em] text-theme-muted uppercase mb-2 md:mb-3 opacity-60">ACTIVITY PERFORMANCE</h3>
              <div className="flex items-baseline gap-3 md:gap-4">
                <span className="text-4xl md:text-7xl font-black tracking-tighter leading-none">78<span className="text-xl md:text-2xl text-theme-muted ml-2 opacity-40">/100</span></span>
                <div className="bg-green-500/10 border border-green-500/20 px-3 md:px-4 py-1 md:py-1.5 rounded-full flex items-center gap-2">
                  <div className="w-1 md:w-1.5 h-1 md:h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[8px] md:text-[10px] font-black text-green-500 tracking-wider uppercase">↑ 12% vs LAST WK</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-64 md:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 900 }} 
                  dy={15} 
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', padding: '12px 16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: 'var(--primary)', textTransform: 'uppercase' }}
                />
                <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={28}>
                  {activityData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.value > 80 ? 'var(--primary)' : 'var(--primary-glow)'} 
                      className="hover:fill-theme-primary transition-colors cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="mb-12">
          <div className="flex items-center gap-6 mb-8">
            <h3 className="text-xl md:text-2xl font-black italic tracking-tight">KEY PERFORMANCE METRICS</h3>
            <div className="flex-1 h-px bg-theme-border/5" />
          </div>
          <MetricGrid cols={4}>
            <StatCard label="Calories" value="2,450" unit="kcal/day" icon={<Flame />} trend={{ value: '150', isUp: true }} color="#FF0055" />
            <StatCard label="Active Time" value="1h 12m" unit="avg" icon={<Activity />} trend={{ value: '8m', isUp: false }} color="#FF6B00" />
            <StatCard label="Sleep Duration" value="7.4" unit="hrs" icon={<Moon />} trend={{ value: '0.2', isUp: true }} color="#B388FF" />
            <StatCard label="Resting HR" value="58" unit="bpm" icon={<Heart />} trend={{ value: 'STABLE', isUp: true }} color="#00E5FF" />
          </MetricGrid>
        </div>

        {/* AI Smart Insights */}
        <div className="mb-12">
          <div className="flex items-center gap-6 mb-10 text-theme-primary">
            <Zap className="w-6 h-6 fill-theme-primary" />
            <h3 className="text-xl md:text-2xl font-black italic tracking-tight uppercase">Predictive Insights</h3>
            <div className="flex-1 h-px bg-theme-primary/10" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <div className="glass-card p-6 md:p-8 border-l-4 border-l-theme-primary flex gap-4 md:gap-6 group hover:bg-theme-primary/[0.02] transition-all">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-theme-primary/10 flex items-center justify-center shrink-0 border border-theme-primary/20 group-hover:scale-110 transition-transform shadow-lg shadow-theme-glow">
                <Zap className="w-6 h-6 md:w-7 md:h-7 text-theme-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-base md:text-xl mb-1 md:mb-2 tracking-tight italic uppercase">MORNING ROUTINE POWER</h4>
                <p className="text-[11px] md:text-sm text-theme-muted leading-relaxed font-medium">Your recovery scores are <span className="text-theme-primary font-black">15% HIGHER</span> on days you complete 10 mins of stretching before 08:00 AM.</p>
              </div>
            </div>
            
            <div className="glass-card p-6 md:p-8 border-l-4 border-l-cyan-500 flex gap-4 md:gap-6 group hover:bg-cyan-500/[0.02] transition-all">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                <Droplet className="w-6 h-6 md:w-7 md:h-7 text-cyan-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-base md:text-xl mb-1 md:mb-2 tracking-tight italic uppercase">WEEKEND HYDRATION</h4>
                <p className="text-[11px] md:text-sm text-theme-muted leading-relaxed font-medium">You consistently under-hydrate by <span className="text-cyan-500 font-black">~30%</span> on SATURDAYS. Reaching 3.5L could significanty boost energy.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
