import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Dumbbell, Timer, Activity, Flame, Footprints, Bike, Waves, Move, Plus } from 'lucide-react';

interface WorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutForm: {
    type: string;
    duration: string;
    intensity: string;
    metric: string;
    notes: string;
  };
  setWorkoutForm: (updater: (prev: any) => any) => void;
  onSubmit: () => void;
}

export default function WorkoutModal({ isOpen, onClose, workoutForm, setWorkoutForm, onSubmit }: WorkoutModalProps) {
  const activityTypes = [
    { id: 'running', label: 'Run', icon: <Footprints className="w-5 h-5" /> },
    { id: 'cycling', label: 'Cycle', icon: <Bike className="w-5 h-5" /> },
    { id: 'weightlifting', label: 'Lift', icon: <Dumbbell className="w-5 h-5" /> },
    { id: 'swimming', label: 'Swim', icon: <Waves className="w-5 h-5" /> },
    { id: 'hiit', label: 'HIIT', icon: <Flame className="w-5 h-5" /> },
    { id: 'yoga', label: 'Yoga', icon: <Move className="w-5 h-5" /> },
    { id: 'walking', label: 'Walk', icon: <Footprints className="w-5 h-5" /> },
    { id: 'other', label: 'Other', icon: <Plus className="w-5 h-5" /> }
  ];

  const intensities = ['low', 'medium', 'high', 'max'];

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
            className="bg-theme-card w-full max-w-xl rounded-[40px] overflow-hidden border border-theme shadow-2xl relative z-70"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-theme-primary px-8 py-10 text-on-primary relative">
              <h3 className="text-3xl font-black italic tracking-wider leading-none">LOG SESSION</h3>
              <p className="text-theme-main/80 text-[10px] font-black tracking-[0.3em] uppercase mt-2">FUEL YOUR PROGRESS</p>
              <button 
                onClick={onClose}
                className="absolute top-8 right-8 w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"
              >
                <span className="text-theme-main font-black text-xs">✕</span>
              </button>
            </div>

            <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {/* Activity Type */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-theme-muted tracking-widest uppercase pl-1">ACTIVITY TYPE</label>
                <div className="grid grid-cols-4 gap-3">
                  {activityTypes.map((activity) => (
                    <button
                      key={activity.id}
                      onClick={() => setWorkoutForm(prev => ({ ...prev, type: activity.id }))}
                      className={cn(
                        "flex flex-col items-center gap-3 p-4 rounded-2xl transition-all border group",
                        workoutForm.type === activity.id 
                          ? "bg-theme-primary border-theme-primary text-on-primary shadow-xl shadow-orange-500/20" 
                          : "bg-theme-bg/50 border-theme text-theme-muted hover:bg-theme-primary/5 hover:border-theme-primary/20"
                      )}
                    >
                      <div className="group-hover:scale-110 transition-transform">{activity.icon}</div>
                      <span className="text-[9px] font-black uppercase tracking-widest">{activity.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Duration */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-theme-muted tracking-widest uppercase pl-1">DURATION (MIN)</label>
                  <div className="relative group">
                    <Timer className="w-5 h-5 text-theme-muted absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-theme-primary transition-colors" />
                    <input 
                      type="number" 
                      value={workoutForm.duration}
                      onChange={(e) => setWorkoutForm(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full bg-theme-bg/50 border border-theme rounded-2xl py-4 pl-14 pr-6 text-theme-main font-black focus:outline-none focus:border-theme-primary transition-all text-sm shadow-inner"
                      placeholder="30"
                    />
                  </div>
                </div>

                {/* Metric */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-theme-muted tracking-widest uppercase pl-1">
                    {['running', 'cycling', 'walking', 'swimming'].includes(workoutForm.type) ? 'DISTANCE (KM)' : 'VOLUME (KG)'}
                  </label>
                  <div className="relative group">
                    <Activity className="w-5 h-5 text-theme-muted absolute left-5 top-1/2 -translate-y-1/2 group-focus-within:text-theme-primary transition-colors" />
                    <input 
                      type="number" 
                      value={workoutForm.metric}
                      onChange={(e) => setWorkoutForm(prev => ({ ...prev, metric: e.target.value }))}
                      className="w-full bg-theme-bg/50 border border-theme rounded-2xl py-4 pl-14 pr-12 text-theme-main font-black focus:outline-none focus:border-theme-primary transition-all text-sm shadow-inner"
                      placeholder={['running', 'cycling', 'walking', 'swimming'].includes(workoutForm.type) ? "5.0" : "40"}
                    />
                  </div>
                </div>
              </div>

              {/* Intensity */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-theme-muted tracking-widest uppercase pl-1">INTENSITY LEVEL</label>
                <div className="flex bg-theme-bg/50 border border-theme rounded-[24px] p-2 gap-2 shadow-inner">
                  {intensities.map((level) => (
                    <button
                      key={level}
                      onClick={() => setWorkoutForm(prev => ({ ...prev, intensity: level }))}
                      className={cn(
                        "flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        workoutForm.intensity === level 
                          ? "bg-theme-primary text-on-primary shadow-lg shadow-orange-500/20" 
                          : "text-theme-muted hover:text-theme-main"
                      )}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-theme-muted tracking-widest uppercase pl-1">POST-WORKOUT NOTES</label>
                <textarea 
                  value={workoutForm.notes}
                  onChange={(e) => setWorkoutForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-theme-bg/50 border border-theme rounded-[24px] py-4 px-6 text-theme-main text-sm font-bold focus:outline-none focus:border-theme-primary transition-all resize-none h-28 shadow-inner"
                  placeholder="How did you feel during the session?"
                />
              </div>
            </div>

            <div className="p-8 bg-theme-card border-t border-theme">
              <button 
                onClick={onSubmit}
                className="w-full bg-theme-primary text-on-primary font-black italic tracking-widest py-6 rounded-[24px] hover:bg-theme-primary/90 transition-all shadow-xl shadow-orange-500/30 active:scale-[0.98] flex items-center justify-center gap-3"
              >
                COMPLETE SESSION
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
