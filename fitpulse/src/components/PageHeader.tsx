import React, { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
}

/**
 * Standardized Header for all FitPro pages.
 * Ensures consistent alignment, typography, and action placement.
 */
export default function PageHeader({ 
  title, 
  subtitle, 
  children, 
  className 
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12 pt-6 md:pt-0", className)}>
      <div className="flex-1 min-w-0">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight italic uppercase text-theme-main leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[9px] md:text-xs text-theme-muted font-black tracking-[0.2em] md:tracking-[0.3em] uppercase mt-2 md:mt-3 opacity-60 md:opacity-70 leading-relaxed max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
      
      {children && (
        <div className="flex items-center gap-3 md:gap-4 shrink-0 overflow-x-auto no-scrollbar pb-1 md:pb-0 -mx-1 px-1">
          {children}
        </div>
      )}
    </div>
  );
}
