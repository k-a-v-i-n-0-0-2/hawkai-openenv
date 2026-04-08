import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Twitter, Instagram, Facebook, Link as LinkIcon, Check } from 'lucide-react';

interface SocialModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  profilePic: string | null;
  shareMessage: string;
  setShareMessage: (msg: string) => void;
  shareStat: 'streak' | 'workouts' | 'minutes';
  setShareStat: (stat: 'streak' | 'workouts' | 'minutes') => void;
  autoShare: boolean;
  setAutoShare: (val: boolean) => void;
}

export default function SocialModal({ 
  isOpen, onClose, userName, profilePic, shareMessage, setShareMessage, 
  shareStat, setShareStat, autoShare, setAutoShare 
}: SocialModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-theme-card w-full max-w-lg rounded-[40px] p-8 md:p-10 border border-theme shadow-2xl relative z-70"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8 px-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-theme-primary/10 border border-theme-primary/20 flex items-center justify-center">
                  <Share2 className="w-6 h-6 text-theme-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">Social Connect</h3>
                  <p className="text-[10px] font-black text-theme-muted tracking-widest uppercase mt-1">Show off your progress</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 rounded-2xl bg-theme-bg/50 border border-theme flex items-center justify-center hover:bg-theme-primary/10 transition-colors"
              >
                <span className="text-theme-muted font-black text-xs">✕</span>
              </button>
            </div>
            
            <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {/* Preview Card */}
              <div className="bg-gradient-to-br from-theme-primary/30 to-secondary-blue/30 p-1 rounded-[32px] shadow-2xl shadow-orange-500/10">
                <div className="bg-theme-card rounded-[28px] p-6 border border-white/5">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-theme-bg border border-theme overflow-hidden shadow-inner">
                      {profilePic ? (
                        <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-theme-primary font-black text-xs">AR</div>
                      )}
                    </div>
                    <div>
                      <p className="font-black text-base tracking-tight">{userName || 'FitPro Athlete'}</p>
                      <p className="text-[9px] font-black text-theme-muted uppercase tracking-widest">FITPRO PERFORMANCE</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-theme-main/90 leading-relaxed italic mb-6">"{shareMessage}"</p>
                  
                  <div className="bg-theme-bg/50 rounded-2xl p-6 border border-theme flex items-center justify-between shadow-inner">
                    <div className="text-center flex-1">
                      <p className="text-3xl font-black text-theme-primary tracking-tighter">
                        {shareStat === 'streak' ? '12' : shareStat === 'workouts' ? '84' : '4.2k'}
                      </p>
                      <p className="text-[8px] font-black text-theme-muted uppercase tracking-[0.2em] mt-1">
                        {shareStat === 'streak' ? 'WEEK STREAK' : shareStat === 'workouts' ? 'TOTAL WORKOUTS' : 'ACTIVE MINUTES'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-6">
                <div>
                  <label className="text-[9px] font-black tracking-widest uppercase text-theme-muted mb-3 block pl-2">HIGHLIGHT STAT</label>
                  <div className="flex bg-theme-bg/50 border border-theme rounded-2xl p-1.5 gap-1 shadow-inner">
                    {['streak', 'workouts', 'minutes'].map((stat) => (
                      <button
                        key={stat}
                        onClick={() => setShareStat(stat as any)}
                        className={cn(
                          "flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                          shareStat === stat 
                            ? "bg-theme-primary text-on-primary shadow-lg shadow-orange-500/20" 
                            : "text-theme-muted hover:text-theme-main"
                        )}
                      >
                        {stat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black tracking-widest uppercase text-theme-muted mb-3 block pl-2">SHARE TO</label>
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { id: 'tw', label: 'Twitter', icon: <Twitter className="w-5 h-5" />, color: "bg-[#1DA1F2]/10 text-[#1DA1F2] border-[#1DA1F2]/20 shadow-[#1DA1F2]/5" },
                      { id: 'in', label: 'Instagram', icon: <Instagram className="w-5 h-5" />, color: "bg-[#E1306C]/10 text-[#E1306C] border-[#E1306C]/20 shadow-[#E1306C]/5" },
                      { id: 'fb', label: 'Facebook', icon: <Facebook className="w-5 h-5" />, color: "bg-[#4267B2]/10 text-[#4267B2] border-[#4267B2]/20 shadow-[#4267B2]/5" },
                      { id: 'li', label: 'Copy Link', icon: <LinkIcon className="w-5 h-5" />, color: "bg-white/5 text-theme-muted border-theme-border/10 shadow-white/5" }
                    ].map((platform) => (
                      <button key={platform.id} className="flex flex-col items-center gap-3 group">
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center border transition-all group-hover:scale-110 shadow-lg",
                          platform.color
                        )}>
                          {platform.icon}
                        </div>
                        <span className="text-[8px] font-black text-theme-muted uppercase tracking-widest">{platform.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="glass-card rounded-[32px] p-6 border border-theme-border/5 bg-theme-card/50 flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-sm tracking-tight">Auto-Share Achievements</h4>
                    <p className="text-[9px] font-black text-theme-muted uppercase tracking-widest mt-1">Celebrate together</p>
                  </div>
                  <button 
                    onClick={() => setAutoShare(!autoShare)}
                    className={cn("w-14 h-7 rounded-full relative transition-all border border-theme-border/10", autoShare ? "bg-theme-primary" : "bg-theme-border/5")}
                  >
                    <motion.div 
                      layout
                      className="absolute top-1 left-1 bottom-1 w-5 rounded-full bg-white shadow-md"
                      animate={{ x: autoShare ? 28 : 0 }}
                    />
                  </button>
                </div>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-full bg-theme-primary text-on-primary font-black tracking-widest py-5 rounded-[24px] mt-8 hover:bg-theme-primary/90 transition-all shadow-xl shadow-orange-500/20 active:scale-[0.98]"
            >
              SAVE SETTINGS
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
