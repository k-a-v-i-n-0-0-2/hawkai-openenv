import { motion } from 'motion/react';

export default function ProfileGoals() {
  const goals = [
    { label: "Weight Loss", current: "72 kg", target: "68 kg", progress: 65, color: "var(--theme-primary)" },
    { label: "Daily Steps", current: "8,500", target: "10,000", progress: 85, color: "var(--secondary-blue)" }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between mb-2 px-2">
        <h3 className="text-xl font-black tracking-tight">Active Goals</h3>
        <button className="text-[10px] font-black text-theme-primary tracking-widest uppercase hover:underline underline-offset-4">EDIT ALL</button>
      </div>

      <div className="space-y-4">
        {goals.map((goal, i) => (
          <div key={i} className="glass-card rounded-[32px] p-6 border border-theme hover:bg-theme-primary/[0.02] transition-all group">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-[10px] font-black text-theme-muted uppercase tracking-[0.2em]">{goal.label}</span>
                <p className="text-2xl font-black tracking-tighter mt-1">{goal.current}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black text-theme-muted uppercase tracking-widest opacity-60">TARGET</span>
                <p className="text-sm font-black text-theme-main mt-1 opacity-80">{goal.target}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="h-3 w-full bg-theme-border/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${goal.progress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.2 }}
                  className="h-full rounded-full shadow-[0_0_12px_rgba(255,107,0,0.4)]"
                  style={{ backgroundColor: goal.color }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-black tracking-widest text-theme-muted uppercase">
                <span>{goal.progress}% COMPLETE</span>
                <span>{30 - (goal.progress % 30)} DAYS LEFT</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
