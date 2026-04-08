import React, { useState, useRef } from 'react';
import { Settings, LogOut, Shield, Share2, ExternalLink } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useTheme } from '../context/ThemeContext';
import PageTransition from '../components/PageTransition';
import { useUser } from '../context/UserContext';
import PageHeader from '../components/PageHeader';

// Modular Components
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileGoals from '../components/profile/ProfileGoals';
import SettingsList from '../components/profile/SettingsList';
import ThemeModal from '../components/profile/ThemeModal';
import NotificationsModal from '../components/profile/NotificationsModal';
import SocialModal from '../components/profile/SocialModal';
import WorkoutModal from '../components/profile/WorkoutModal';
import ImageCropModal from '../components/profile/ImageCropModal';

export default function Profile() {
  const { navigateWithLoading } = useNavigation();
  const { theme, setTheme } = useTheme();
  const { userName, setUserName, age, setAge, streak, getInitials } = useUser();
  
  // UI States
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  
  // Feature States
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [notifications, setNotifications] = useState({
    workoutReminders: true,
    workoutDays: ['Mon', 'Wed', 'Fri'],
    workoutTime: '08:00',
    advanceNotice: '15',
    reminderType: 'push',
    goalAlerts: true,
    aiInsights: false
  });

  const [shareMessage, setShareMessage] = useState("Just crushed a new workout! 💪");
  const [shareStat, setShareStat] = useState<'streak' | 'workouts' | 'minutes'>('streak');
  const [autoShare, setAutoShare] = useState(false);

  const [workoutForm, setWorkoutForm] = useState({
    type: 'running',
    duration: '30',
    intensity: 'medium',
    metric: '',
    notes: ''
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditingImage(reader.result as string);
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <PageTransition>
      <div className="flex flex-col">
        <PageHeader 
          title="PROFILE" 
          subtitle="Manage your identity, settings, and performance parameters"
        >
          <div className="flex items-center gap-4">
            <div className="hidden md:flex px-5 py-2.5 rounded-2xl bg-theme-card/30 border border-theme border-dashed items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
              <span className="text-[10px] font-black text-theme-muted uppercase tracking-widest">ENCRYPTED CONNECTION</span>
            </div>
            <button className="w-10 h-10 rounded-2xl bg-theme-card border border-theme flex items-center justify-center hover:bg-theme-primary/10 transition-colors group">
              <Settings className="w-5 h-5 text-theme-muted group-hover:text-theme-primary" />
            </button>
          </div>
        </PageHeader>

        <div className="content-grid">
          {/* Left Column: Summary */}
          <aside className="lg:col-span-4 flex flex-col gap-10">
            <ProfileHeader 
              userName={userName}
              setUserName={setUserName}
              age={age}
              setAge={setAge}
              getInitials={getInitials}
              profilePic={profilePic}
              onImageClick={() => fileInputRef.current?.click()}
            />
            <ProfileGoals />
          </aside>

          {/* Right Column: Settings & Details */}
          <section className="lg:col-span-8 flex flex-col gap-10">
            <SettingsList 
              streak={streak}
              theme={theme}
              onThemeClick={() => setShowThemeModal(true)}
              onNotificationsClick={() => setShowNotificationsModal(true)}
              onSocialClick={() => setShowSocialModal(true)}
              onWorkoutClick={() => setShowWorkoutModal(true)}
              onLogoutClick={() => navigateWithLoading('/login')}
              onStreaksClick={() => navigateWithLoading('/streaks')}
            />
            
            <div className="glass-card p-6 sm:p-10 bg-gradient-to-r from-theme-primary/5 to-transparent flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 group overflow-hidden relative border-theme-primary/10">
              <div className="relative z-10 text-center md:text-left">
                <h4 className="text-xl md:text-2xl font-black italic tracking-tighter uppercase mb-1 md:mb-2 leading-tight">ELITE PERFORMANCE ACCESS</h4>
                <p className="text-[10px] md:text-sm text-theme-muted font-black uppercase tracking-widest opacity-60">Unlock advanced AI predictive analytics & biometric trends</p>
              </div>
              <button className="relative z-10 w-full md:w-auto px-8 md:px-10 py-4 bg-theme-primary text-on-primary font-black text-[10px] md:text-xs rounded-2xl shadow-2xl shadow-orange-500/30 group-hover:scale-105 transition-transform tracking-[0.2em] uppercase">
                UPGRADE NOW
              </button>
              <div className="absolute right-0 top-0 bottom-0 w-48 bg-theme-primary opacity-5 skew-x-[30deg] translate-x-24" />
              <ExternalLink className="absolute -bottom-8 -right-8 w-32 h-32 text-theme-primary opacity-5 rotate-12" />
            </div>

            {/* Hidden File Input */}
            <input 
              type="file" 
              accept="image/*" 
              capture="user"
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
            />
          </section>
        </div>

        {/* Modals */}
        <ThemeModal 
          isOpen={showThemeModal} 
          onClose={() => setShowThemeModal(false)} 
          currentTheme={theme}
          onThemeSelect={(id) => { setTheme(id); setShowThemeModal(false); }}
        />

        <NotificationsModal 
          isOpen={showNotificationsModal} 
          onClose={() => setShowNotificationsModal(false)}
          notifications={notifications}
          setNotifications={setNotifications}
        />

        <SocialModal 
          isOpen={showSocialModal}
          onClose={() => setShowSocialModal(false)}
          userName={userName}
          profilePic={profilePic}
          shareMessage={shareMessage}
          setShareMessage={setShareMessage}
          shareStat={shareStat}
          setShareStat={setShareStat}
          autoShare={autoShare}
          setAutoShare={setAutoShare}
        />

        <WorkoutModal 
          isOpen={showWorkoutModal}
          onClose={() => setShowWorkoutModal(false)}
          workoutForm={workoutForm}
          setWorkoutForm={setWorkoutForm}
          onSubmit={() => {
            console.log('Logging workout:', workoutForm);
            setShowWorkoutModal(false);
          }}
        />

        <ImageCropModal 
          image={editingImage}
          onClose={() => setEditingImage(null)}
          onCropComplete={setProfilePic}
        />
      </div>
    </PageTransition>
  );
}
