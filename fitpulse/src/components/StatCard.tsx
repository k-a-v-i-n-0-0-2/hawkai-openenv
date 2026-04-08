import React, { ReactNode } from 'react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  trend?: {
    value: string;
    isUp: boolean;
  };
  color?: string;
  className?: string;
}

export function StatCard({ label, value, unit, icon, trend, color = 'var(--primary)', className }: StatCardProps) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02, translateY: -5 }}
      className={cn(
        "glass-card rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 transition-all duration-300 hover:shadow-theme-glow group relative overflow-hidden",
        className
      )}
    >
      <div className="flex justify-between items-start mb-3 sm:mb-4 relative z-10">
        <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/5 group-hover:bg-theme-primary/10 transition-colors">
          {icon && React.isValidElement(icon) ? React.cloneElement(icon, { style: { color }, className: cn(icon.props.className, "w-4 h-4 sm:w-5 h-5") } as any) : icon}
        </div>
        {trend && (
          <div className={cn(
            "text-[9px] sm:text-[10px] font-black px-2 py-1 rounded-full",
            trend.isUp ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
          )}>
            {trend.isUp ? '↑' : '↓'} {trend.value}
          </div>
        )}
      </div>
      
      <p className="text-[9px] sm:text-[10px] font-black text-theme-muted uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-1 relative z-10 opacity-60">
        {label}
      </p>
      <div className="flex items-baseline gap-1 relative z-10">
        <span className="text-2xl sm:text-3xl font-black tracking-tight">{value}</span>
        {unit && <span className="text-[10px] sm:text-sm font-black text-theme-muted opacity-40">{unit}</span>}
      </div>
      
      {/* Subtle background glow for stat cards */}
      <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-white/5 rounded-full blur-2xl group-hover:bg-theme-primary/5 transition-colors" />
    </motion.div>
  );
}

interface GridProps {
  children: ReactNode;
  cols?: number;
  className?: string;
}

export function MetricGrid({ children, cols = 4, className }: GridProps) {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  }[cols as 1 | 2 | 3 | 4];

  return (
    <div className={cn("grid gap-3 sm:gap-4 md:gap-6", colClasses, className)}>
      {children}
    </div>
  );
}
