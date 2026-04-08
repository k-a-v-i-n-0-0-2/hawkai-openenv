import React from 'react';
import { Phone, Mail, ArrowRight, Zap, Shield, Globe } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import PageTransition from '../components/PageTransition';
import { motion } from 'motion/react';

export default function Login() {
  const { navigateWithLoading } = useNavigation();

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-6 bg-theme-bg">
        {/* Cinematic Background Canvas */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop" 
            alt="Fitness Background" 
            className="w-full h-full object-cover scale-110 blur-[4px] brightness-[0.25] transition-transform duration-[10s] hover:scale-125"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-theme-bg via-theme-bg/60 to-transparent opacity-90" />
          
          {/* Animated Particles/Glitch Effect */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-theme-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
          </div>
        </div>

        {/* Floating Auth Card */}
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
              transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
            />
          </div>

          <div className="flex flex-col items-center mb-10 md:mb-14 relative z-10">
            <motion.div 
              whileHover={{ rotate: 90 }}
              className="w-16 h-16 md:w-20 md:h-20 rounded-[28px] md:rounded-[32px] bg-theme-primary/10 flex items-center justify-center mb-6 md:mb-8 border border-theme-primary/20 shadow-xl shadow-orange-500/10 shrink-0"
            >
              <Zap className="w-8 h-8 md:w-10 md:h-10 text-theme-primary fill-theme-primary/20" />
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2 md:mb-3 italic leading-none">FITPULSE</h1>
            <div className="flex items-center gap-2 md:gap-3">
              <span className="w-6 md:w-8 h-[1px] bg-theme-primary/30" />
              <p className="text-[8px] md:text-[10px] font-black tracking-[0.3em] md:tracking-[0.4em] text-theme-primary uppercase opacity-60">NEURAL BIOMETRICS</p>
              <span className="w-6 md:w-8 h-[1px] bg-theme-primary/30" />
            </div>
          </div>

            <div className="space-y-8 md:space-y-10 relative z-10">
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[9px] md:text-[10px] font-black text-theme-muted tracking-[0.2em] uppercase opacity-40">ACCESS PROTOCOL</label>
                <div className="flex items-center gap-2">
                  <Shield className="w-3 h-3 text-theme-primary/60" />
                  <span className="text-[8px] font-black text-theme-primary/60 uppercase tracking-widest">SECURE</span>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 md:left-6 flex items-center pointer-events-none">
                  <Phone className="w-4 h-4 md:w-5 md:h-5 text-theme-muted group-focus-within:text-theme-primary transition-colors" />
                </div>
                <input 
                  type="tel" 
                  placeholder="+1 (000) 000-0000" 
                  className="w-full bg-theme-bg/60 border border-white/5 rounded-[20px] md:rounded-[24px] py-4 md:py-5 pl-14 md:pl-16 pr-6 text-base md:text-lg font-black transition-all focus:outline-none focus:ring-2 focus:ring-theme-primary/20 focus:border-theme-primary/40 placeholder:text-theme-muted/20 tracking-tight"
                />
              </div>
            </div>

            <button 
              onClick={() => navigateWithLoading('/name')}
              className="w-full bg-theme-primary text-on-primary font-black py-4 md:py-5 rounded-[20px] md:rounded-[24px] transition-all shadow-2xl shadow-orange-500/30 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 md:gap-4 text-[11px] md:text-sm tracking-[0.15em] md:tracking-[0.2em] uppercase"
            >
              INITIALIZE SESSION
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            <div className="relative flex items-center py-1 md:py-2">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink-0 mx-4 md:mx-6 text-[8px] md:text-[9px] font-black text-theme-muted tracking-[0.2em] md:tracking-[0.3em] uppercase opacity-30 italic">OR SYNC VIA</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:gap-5">
              <button className="flex items-center justify-center gap-3 md:gap-4 bg-theme-card/50 border border-white/5 rounded-[20px] md:rounded-[24px] py-4 md:py-5 hover:bg-theme-primary/[0.05] hover:border-theme-primary/20 transition-all group/btn shadow-lg">
                <Globe className="w-4 h-4 md:w-5 md:h-5 text-theme-muted group-hover/btn:text-theme-primary transition-colors" />
                <span className="font-black text-[9px] md:text-[10px] uppercase tracking-[1.5em] sm:tracking-[0.2em] text-theme-muted group-hover/btn:text-theme-main transition-colors">GOOG</span>
              </button>
              <button className="flex items-center justify-center gap-3 md:gap-4 bg-theme-card/50 border border-white/5 rounded-[20px] md:rounded-[24px] py-4 md:py-5 hover:bg-theme-primary/[0.05] hover:border-theme-primary/20 transition-all group/btn shadow-lg">
                <Mail className="w-4 h-4 md:w-5 md:h-5 text-theme-muted group-hover/btn:text-theme-primary transition-colors" />
                <span className="font-black text-[9px] md:text-[10px] uppercase tracking-[1.5em] sm:tracking-[0.2em] text-theme-muted group-hover/btn:text-theme-main transition-colors">MAIL</span>
              </button>
            </div>
          </div>

          <div className="mt-10 md:mt-14 text-center relative z-10">
            <p className="text-[9px] md:text-[10px] font-black text-theme-muted tracking-widest uppercase opacity-40 mb-2">PROBATIONARY ACCESS?</p>
            <button 
              onClick={() => navigateWithLoading('/name')} 
              className="text-theme-primary font-black text-[11px] md:text-xs tracking-[0.15em] md:tracking-[0.2em] hover:border-b border-theme-primary/40 transition-all uppercase"
            >
              CREATE NEW ATHLETE PROFILE
            </button>
          </div>
        </motion.div>

        {/* Footer Branding */}
        <div className="absolute bottom-10 left-0 right-0 flex justify-center opacity-20 pointer-events-none">
          <p className="text-[8px] font-black tracking-[1em] text-theme-muted uppercase">SYSTEM V.2.0.26 • ENCRYPTED HUB</p>
        </div>
      </div>
    </PageTransition>
  );
}
