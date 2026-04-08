import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Zap, Activity } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: {
    workoutReminders: boolean;
    workoutDays: string[];
    workoutTime: string;
    advanceNotice: string;
    reminderType: string;
    goalAlerts: boolean;
    aiInsights: boolean;
  };
  setNotifications: (updater: (prev: any) => any) => void;
}

export default function NotificationsModal({ isOpen, onClose, notifications, setNotifications }: NotificationsModalProps) {
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
                  <Bell className="w-6 h-6 text-theme-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">Smart Alerts</h3>
                  <p className="text-[10px] font-black text-theme-muted tracking-widest uppercase mt-1">Stay on top of your game</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 rounded-2xl bg-theme-bg/50 border border-theme flex items-center justify-center hover:bg-theme-primary/10 transition-colors"
              >
                <span className="text-theme-muted font-black text-xs">✕</span>
              </button>
            </div>
            
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {/* Workout Reminders Section */}
              <div className="glass-card rounded-[32px] p-6 border border-theme-border/5 bg-theme-card/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-black text-sm tracking-tight">Workout Reminders</h4>
                    <p className="text-[10px] font-black text-theme-muted uppercase tracking-widest mt-1">Don't miss a session</p>
                  </div>
                  <button 
                    onClick={() => setNotifications(prev => ({...prev, workoutReminders: !prev.workoutReminders}))}
                    className={cn("w-14 h-7 rounded-full transition-all relative border border-theme-border/10 shadow-inner", notifications.workoutReminders ? "bg-theme-primary" : "bg-theme-border/5")}
                  >
                    <motion.div 
                      layout
                      className="absolute top-1 left-1 bottom-1 w-5 rounded-full bg-white shadow-md"
                      animate={{ x: notifications.workoutReminders ? 28 : 0 }}
                    />
                  </button>
                </div>
                
                <AnimatePresence>
                  {notifications.workoutReminders && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-6 pt-6 border-t border-theme-border/5"
                    >
                      <div>
                        <label className="text-[9px] font-black tracking-widest uppercase text-theme-muted mb-3 block">REMINDER DAYS</label>
                        <div className="flex justify-between gap-1.5">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <button
                              key={day}
                              onClick={() => {
                                setNotifications(prev => ({
                                  ...prev,
                                  workoutDays: prev.workoutDays.includes(day)
                                    ? prev.workoutDays.filter(d => d !== day)
                                    : [...prev.workoutDays, day]
                                }))
                              }}
                              className={cn(
                                "flex-1 aspect-square rounded-2xl text-[9px] font-black flex items-center justify-center transition-all border",
                                notifications.workoutDays.includes(day) 
                                  ? "bg-theme-primary border-theme-primary text-on-primary shadow-lg shadow-orange-500/20" 
                                  : "bg-theme-card border-theme text-theme-muted hover:bg-theme-primary/10"
                              )}
                            >
                              {day[0]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-black tracking-widest uppercase text-theme-muted mb-2 block">TIME</label>
                          <input 
                            type="time" 
                            value={notifications.workoutTime}
                            onChange={(e) => setNotifications(prev => ({...prev, workoutTime: e.target.value}))}
                            className="w-full bg-theme-bg/50 border border-theme rounded-2xl p-4 text-theme-main font-black text-xs focus:outline-none focus:border-theme-primary transition-all"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-black tracking-widest uppercase text-theme-muted mb-2 block">NOTICE</label>
                          <select 
                            value={notifications.advanceNotice}
                            onChange={(e) => setNotifications(prev => ({...prev, advanceNotice: e.target.value}))}
                            className="w-full bg-theme-bg/50 border border-theme rounded-2xl p-4 text-theme-main font-black text-xs focus:outline-none focus:border-theme-primary transition-all appearance-none"
                          >
                            <option value="0">At time of event</option>
                            <option value="15">15 mins before</option>
                            <option value="30">30 mins before</option>
                            <option value="60">1 hour before</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Toggles Group */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card rounded-[32px] p-6 border border-theme-border/5 bg-theme-card/30 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Zap className="w-5 h-5 text-secondary-blue" />
                    <div>
                      <h4 className="font-black text-xs tracking-tight">Goal Alerts</h4>
                      <p className="text-[8px] font-black text-theme-muted uppercase tracking-widest">Achievements</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setNotifications(prev => ({...prev, goalAlerts: !prev.goalAlerts}))}
                    className={cn("w-10 h-5 rounded-full relative transition-all", notifications.goalAlerts ? "bg-secondary-blue" : "bg-theme-border/5")}
                  >
                    <motion.div 
                      layout
                      className="absolute top-0.5 left-0.5 bottom-0.5 w-4 rounded-full bg-white shadow-sm"
                      animate={{ x: notifications.goalAlerts ? 20 : 0 }}
                    />
                  </button>
                </div>

                <div className="glass-card rounded-[32px] p-6 border border-theme-border/5 bg-theme-card/30 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Activity className="w-5 h-5 text-secondary-purple" />
                    <div>
                      <h4 className="font-black text-xs tracking-tight">AI Insights</h4>
                      <p className="text-[8px] font-black text-theme-muted uppercase tracking-widest">Smart Tips</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setNotifications(prev => ({...prev, aiInsights: !prev.aiInsights}))}
                    className={cn("w-10 h-5 rounded-full relative transition-all", notifications.aiInsights ? "bg-secondary-purple" : "bg-theme-border/5")}
                  >
                    <motion.div 
                      layout
                      className="absolute top-0.5 left-0.5 bottom-0.5 w-4 rounded-full bg-white shadow-sm"
                      animate={{ x: notifications.aiInsights ? 20 : 0 }}
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
