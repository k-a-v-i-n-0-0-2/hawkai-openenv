import { Camera, Award } from 'lucide-react';
import { useState, useRef } from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'motion/react';

interface ProfileHeaderProps {
  userName: string;
  setUserName: (name: string) => void;
  age: string;
  setAge: (age: string) => void;
  getInitials: () => string;
  profilePic: string | null;
  onImageClick: () => void;
}

export default function ProfileHeader({ 
  userName, setUserName, age, setAge, getInitials, profilePic, onImageClick 
}: ProfileHeaderProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAge, setIsEditingAge] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [tempAge, setTempAge] = useState(age);

  return (
    <div className="glass-card rounded-[40px] p-8 md:p-10 border border-theme flex flex-col items-center relative overflow-hidden bg-gradient-to-br from-theme-primary/5 to-transparent">
      <div className="relative mb-6">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="w-32 h-32 rounded-[40px] bg-theme-primary/10 border-4 border-theme flex items-center justify-center cursor-pointer overflow-hidden group relative shadow-2xl shadow-orange-500/10"
          onClick={onImageClick}
        >
          {profilePic ? (
            <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-4xl font-black text-theme-primary">{getInitials()}</span>
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
            <Camera className="w-8 h-8 text-theme-main" />
          </div>
        </motion.div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-theme-card rounded-2xl border border-theme flex items-center justify-center shadow-lg">
          <Award className="w-5 h-5 text-theme-primary" />
        </div>
      </div>

      <div className="text-center w-full max-w-xs">
        {isEditingName ? (
          <input 
            type="text" 
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            autoFocus
            onBlur={() => { setUserName(tempName); setIsEditingName(false); }}
            onKeyDown={(e) => e.key === 'Enter' && (setUserName(tempName), setIsEditingName(false))}
            className="w-full bg-theme-bg/50 border border-theme-primary/40 rounded-xl px-4 py-2 text-2xl font-black text-theme-main text-center focus:outline-none focus:border-theme-primary mb-2"
          />
        ) : (
          <h2 
            className="text-3xl font-black tracking-tight mb-2 cursor-pointer hover:text-theme-primary transition-colors inline-block"
            onClick={() => { setTempName(userName); setIsEditingName(true); }}
          >
            {userName || 'User'}
          </h2>
        )}

        <div className="flex flex-col items-center">
          {isEditingAge ? (
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-theme-muted tracking-widest uppercase">AGE:</span>
              <input 
                type="number" 
                value={tempAge}
                onChange={(e) => setTempAge(e.target.value)}
                autoFocus
                onBlur={() => { setAge(tempAge); setIsEditingAge(false); }}
                onKeyDown={(e) => e.key === 'Enter' && (setAge(tempAge), setIsEditingAge(false))}
                className="bg-theme-bg/50 border border-theme-primary/40 rounded-lg px-2 py-1 text-xs font-black text-theme-primary text-center focus:outline-none focus:border-theme-primary w-16"
              />
            </div>
          ) : (
            <p 
              className="text-[10px] font-black text-theme-muted tracking-[0.2em] uppercase cursor-pointer hover:text-theme-primary transition-colors"
              onClick={() => { setTempAge(age); setIsEditingAge(true); }}
            >
              {age ? `${age} YEARS OLD` : 'PRO MEMBER'}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 w-full gap-4 mt-10 pt-10 border-t border-theme-border/5">
        <div className="text-center">
          <p className="text-2xl font-black text-theme-primary tracking-tighter">12</p>
          <p className="text-[8px] font-black text-theme-muted uppercase tracking-widest mt-1">WEEKS</p>
        </div>
        <div className="text-center border-x border-theme-border/5">
          <p className="text-2xl font-black text-secondary-blue tracking-tighter">84</p>
          <p className="text-[8px] font-black text-theme-muted uppercase tracking-widest mt-1">WORKOUTS</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-secondary-purple tracking-tighter">4.2<span className="text-xs">k</span></p>
          <p className="text-[8px] font-black text-theme-muted uppercase tracking-widest mt-1">MINUTES</p>
        </div>
      </div>
    </div>
  );
}
