import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, User, Fingerprint, Activity } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import PageTransition from '../components/PageTransition';
import { useUser } from '../context/UserContext';
import { motion } from 'motion/react';

export default function NameInput() {
  const { navigateWithLoading } = useNavigation();
  const { setUserName, userName: existingName } = useUser();
  const [name, setName] = useState(existingName || '');

  const handleContinue = () => {
    if (name.trim()) {
      setUserName(name.trim());
      navigateWithLoading('/details');
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-6 bg-theme-bg">
        {/* Cinematic Backdrop */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop" 
            alt="Training Background" 
            className="w-full h-full object-cover scale-110 blur-[3px] brightness-[0.2]"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-theme-bg via-theme-bg/90 to-transparent" />
          
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-theme-primary/20 rounded-full blur-[150px] animate-pulse" />
          </div>
        </div>

        {/* Auth Card */}
        <motion.div 
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-md glass-card rounded-[32px] sm:rounded-[40px] p-8 md:p-14 shadow-2xl shadow-black/60 border border-white/10 overflow-hidden group"
        >
          {/* Scanning Beam Effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[40px]">
            <motion.div 
              animate={{ translateX: ['-100%', '200%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
            />
          </div>

          <button 
            onClick={() => navigateWithLoading(-1)}
            className="absolute top-6 left-6 md:top-10 md:left-10 w-10 h-10 md:w-12 md:h-12 rounded-[16px] md:rounded-[20px] bg-theme-bg/50 border border-white/5 flex items-center justify-center hover:bg-theme-primary/10 hover:border-theme-primary/20 transition-all group/back z-20"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-theme-muted group-hover/back:text-theme-primary transition-colors" />
          </button>

          <div className="flex flex-col items-center mb-10 md:mb-12 mt-6 md:mt-8 relative z-10">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="w-16 h-16 md:w-20 md:h-20 rounded-[28px] md:rounded-[32px] bg-theme-primary/10 flex items-center justify-center mb-6 md:mb-8 border border-theme-primary/20 shadow-xl shadow-orange-500/10 shrink-0"
            >
              <Fingerprint className="w-8 h-8 md:w-10 md:h-10 text-theme-primary" />
            </motion.div>
            <h2 className="text-2xl md:text-4xl font-black tracking-tighter text-center mb-2 md:mb-3 italic uppercase leading-none">Identity Matrix</h2>
            <div className="flex items-center gap-2 md:gap-3">
              <Activity className="w-3 h-3 text-theme-primary/60 animate-pulse" />
              <p className="text-[9px] md:text-[10px] font-black text-theme-muted tracking-[0.2em] md:tracking-[0.3em] uppercase opacity-40">Athletic designation required</p>
            </div>
          </div>

          <div className="space-y-10 md:space-y-12 relative z-10">
            <div className="space-y-3 md:space-y-4">
              <label className="text-[9px] md:text-[10px] font-black text-theme-muted tracking-[0.2em] md:tracking-[0.3em] uppercase ml-1 opacity-40">SPECIFY FULL NAME</label>
              <div className="relative group">
                <input 
                  autoFocus
                  type="text" 
                  placeholder="DESIGNATION NAME" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleContinue()}
                  className="w-full bg-theme-bg/60 border border-white/5 rounded-[20px] md:rounded-[24px] py-5 md:py-6 px-6 md:px-8 text-xl md:text-2xl font-black transition-all focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary/40 placeholder:text-theme-muted/10 tracking-tight"
                />
                <div className="absolute right-5 md:right-6 top-1/2 -translate-y-1/2 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-theme-primary/20 group-focus-within:bg-theme-primary group-focus-within:animate-pulse transition-colors" />
              </div>
            </div>

            <button 
              onClick={handleContinue}
              disabled={!name.trim()}
              className="w-full bg-theme-primary text-on-primary font-black py-4 md:py-5 rounded-[20px] md:rounded-[24px] transition-all shadow-2xl shadow-orange-500/30 hover:scale-[1.02] active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed flex items-center justify-center gap-3 md:gap-4 text-[11px] md:text-sm tracking-[0.15em] md:tracking-[0.2em] uppercase"
            >
              COMMIT PROFILE
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            <div className="space-y-5">
              <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-4 bg-theme-primary rounded-full" />
                  <span className="text-[10px] font-black tracking-[0.3em] text-theme-muted uppercase opacity-40">ONBOARDING PROGRESS</span>
                </div>
                <span className="text-[10px] font-black text-theme-primary tracking-widest uppercase">STEP 01 / 04</span>
              </div>
              <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden shadow-inner p-[2px]">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '25%' }}
                  className="h-full bg-theme-primary rounded-full shadow-[0_0_15px_rgba(255,107,0,0.6)]"
                />
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Cinematic Detail */}
        <div className="absolute top-10 left-10 opacity-10 pointer-events-none hidden lg:block">
          <p className="text-[10px] font-black tracking-[0.5em] text-theme-muted uppercase vertical-text">AUTH_SEQUENCE_INITIATED</p>
        </div>
      </div>
    </PageTransition>
  );
}
