import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Target, Zap, Activity, ShieldCheck, Microscope } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { cn } from '../lib/utils';
import PageTransition from '../components/PageTransition';
import { useUser } from '../context/UserContext';
import { motion } from 'motion/react';

export default function DetailsInput() {
  const { navigateWithLoading } = useNavigation();
  const { age: existingAge, setAge } = useUser();
  const [localAge, setLocalAge] = useState(existingAge || '24');
  const [goal, setGoal] = useState('Build Muscle');
  const [activity, setActivity] = useState('Moderately active');

  const handleContinue = () => {
    setAge(localAge);
    navigateWithLoading('/dashboard');
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-6 py-12 bg-theme-bg">
        {/* Cinematic Backdrop */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=1470&auto=format&fit=crop" 
            alt="Workout Background" 
            className="w-full h-full object-cover scale-110 blur-[4px] brightness-[0.2]"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-theme-bg via-theme-bg/95 to-transparent" />
          
          <div className="absolute top-0 right-0 w-1/2 h-full bg-theme-primary/5 -skew-x-12 translate-x-24 blur-[100px]" />
        </div>

        {/* Auth Card */}
        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-xl glass-card rounded-[32px] sm:rounded-[40px] p-6 sm:p-14 shadow-2xl shadow-black/60 border border-white/10 overflow-hidden group"
        >
          {/* Scanning Beam Effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[40px]">
            <motion.div 
              animate={{ translateX: ['-100%', '200%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
            />
          </div>

          <button 
            onClick={() => navigateWithLoading(-1)}
            className="absolute top-6 left-6 md:top-10 md:left-10 w-10 h-10 md:w-12 md:h-12 rounded-[16px] md:rounded-[20px] bg-theme-bg/50 border border-white/5 flex items-center justify-center hover:bg-theme-primary/10 hover:border-theme-primary/20 transition-all group/back z-20"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-theme-muted group-hover/back:text-theme-primary transition-colors" />
          </button>

          <div className="flex flex-col items-center mb-8 md:mb-12 mt-6 md:mt-8 relative z-10">
            <h2 className="text-2xl md:text-5xl font-black tracking-tighter text-center mb-2 md:mb-3 italic uppercase leading-none">Refine Biometrics</h2>
            <div className="flex items-center gap-2 md:gap-3">
              <Microscope className="w-3.5 h-3.5 md:w-4 md:h-4 text-theme-primary/60" />
              <p className="text-[9px] md:text-[10px] font-black text-theme-muted tracking-[0.2em] md:tracking-[0.3em] uppercase opacity-40">Calibrating neural plan</p>
            </div>
          </div>

          <div className="space-y-12 relative z-10">
            {/* Age Input */}
            <div className="space-y-3 md:space-y-4">
              <label className="text-[9px] md:text-[10px] font-black text-theme-muted tracking-[0.2em] md:tracking-[0.3em] uppercase ml-1 opacity-40 flex items-center gap-2 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-theme-primary/40" />
                TEMPORAL AGE
              </label>
              <div className="relative group">
                <input 
                  type="number" 
                  value={localAge}
                  onChange={(e) => setLocalAge(e.target.value)}
                  className="w-full bg-theme-bg/60 border border-white/5 rounded-[20px] md:rounded-[24px] py-4 md:py-5 px-6 md:px-8 text-xl md:text-2xl font-black transition-all focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary/40 tracking-tighter"
                />
                <span className="absolute right-6 md:right-8 top-1/2 -translate-y-1/2 text-[8px] md:text-[10px] font-black text-theme-muted opacity-20 uppercase tracking-widest leading-none">YEARS</span>
              </div>
            </div>

            {/* Goal Selector */}
            <div className="space-y-4 md:space-y-5">
              <label className="text-[9px] md:text-[10px] font-black text-theme-muted tracking-[0.2em] md:tracking-[0.3em] uppercase ml-1 opacity-40 flex items-center gap-2 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-theme-primary/40" />
                PRIMARY OBJECTIVE
              </label>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {['Weight Loss', 'Build Muscle', 'Endurance', 'General Health'].map((g) => (
                  <button 
                    key={g}
                    onClick={() => setGoal(g)}
                    className={cn(
                      "group py-4 md:py-5 px-2 rounded-[20px] md:rounded-[24px] border transition-all text-[9px] md:text-[11px] font-black uppercase tracking-wider md:tracking-widest relative overflow-hidden",
                      goal === g 
                        ? "bg-theme-primary/10 border-theme-primary/40 text-theme-primary shadow-xl shadow-orange-500/10" 
                        : "bg-theme-bg/40 border-white/5 text-theme-muted hover:bg-white/[0.02]"
                    )}
                  >
                    {goal === g && (
                      <motion.div layoutId="activeGoal" className="absolute inset-0 bg-theme-primary/5 backdrop-blur-sm -z-10" />
                    )}
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Level */}
            <div className="space-y-4 md:space-y-5">
              <label className="text-[9px] md:text-[10px] font-black text-theme-muted tracking-[0.2em] md:tracking-[0.3em] uppercase ml-1 opacity-40 flex items-center gap-2 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-theme-primary/40" />
                METABOLIC ENGINE LOAD
              </label>
              <div className="space-y-3 md:space-y-4">
                {[
                  { id: 'Steady State', label: 'Not active', icon: <Zap className="w-4 h-4 md:w-5 md:h-5" /> },
                  { id: 'Variable Load', label: 'Moderately active', icon: <Activity className="w-4 h-4 md:w-5 md:h-5" /> },
                  { id: 'High Intensity', label: 'Highly active', icon: <Microscope className="w-4 h-4 md:w-5 md:h-5" /> }
                ].map((a) => (
                  <button 
                    key={a.label}
                    onClick={() => setActivity(a.label)}
                    className={cn(
                      "w-full py-3.5 md:py-5 px-5 md:px-8 rounded-[20px] md:rounded-[24px] border flex items-center gap-4 md:gap-5 transition-all group relative overflow-hidden",
                      activity === a.label 
                        ? "bg-theme-primary/10 border-theme-primary/40 text-theme-primary shadow-xl shadow-orange-500/10" 
                        : "bg-theme-bg/40 border-white/5 text-theme-muted hover:bg-white/[0.02]"
                    )}
                  >
                    <div className={cn("p-2 rounded-xl transition-colors shrink-0", activity === a.label ? "bg-theme-primary/20 text-theme-primary shadow-lg" : "bg-white/5 text-theme-muted opacity-20")}>
                      {a.icon}
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-[8px] md:text-[10px] font-black opacity-30 mb-0.5 tracking-widest uppercase truncate">{a.id}</p>
                      <p className={cn("font-black text-[11px] md:text-sm uppercase tracking-tight md:tracking-wide truncate", activity === a.label ? "text-theme-primary" : "text-theme-muted")}>{a.label}</p>
                    </div>
                    {activity === a.label && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto w-7 h-7 md:w-8 md:h-8 bg-theme-primary rounded-[10px] md:rounded-[12px] flex items-center justify-center shadow-2xl shadow-orange-500/40 shrink-0">
                        <Check className="w-4 h-4 md:w-5 md:h-5 text-theme-main stroke-[3px]" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleContinue}
              className="w-full bg-theme-primary text-on-primary font-black py-4 md:py-6 rounded-[20px] md:rounded-[24px] transition-all shadow-2xl shadow-orange-500/30 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 md:gap-4 text-[11px] md:text-sm tracking-[0.15em] md:tracking-[0.2em] mt-4 md:mt-6 uppercase"
            >
              FINALIZE NEURAL PROFILE
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            <div className="space-y-5 pt-8">
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-4 bg-theme-primary rounded-full" />
                  <span className="text-[10px] font-black tracking-[0.3em] text-theme-muted uppercase opacity-40">ONBOARDING PROGRESS</span>
                </div>
                <span className="text-[10px] font-black text-theme-primary tracking-widest uppercase">STEP 03 / 04</span>
              </div>
              <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden shadow-inner p-[2px]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '75%' }}
                  className="h-full bg-theme-primary rounded-full shadow-[0_0_15px_rgba(255,107,0,0.6)]"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Global Security Branding */}
        <div className="absolute top-10 right-10 flex items-center gap-3 opacity-20 hidden md:flex">
          <ShieldCheck className="w-4 h-4 text-theme-primary" />
          <p className="text-[10px] font-black tracking-widest uppercase text-theme-muted">BIO_DATA_ENCRYPTED</p>
        </div>
      </div>
    </PageTransition>
  );
}
