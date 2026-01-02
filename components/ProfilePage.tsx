
import React, { useState, useRef } from 'react';
import { UserProfile, Deck, Test, UserStats } from '../types';
import { Camera, User, Save, RefreshCw, Layers, Calendar, Clock, Trophy, Star, Check } from 'lucide-react';
import { soundService } from '../services/soundService';
import { CustomSelect } from './CustomSelect';

interface ProfilePageProps {
  userProfile: UserProfile;
  stats: UserStats;
  decks: Deck[];
  tests: Test[];
  onSaveProfile: (profile: UserProfile) => void;
  themeColor: string;
}

const GRADES = [
    "Kindergarten", "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade",
    "6th Grade", "7th Grade", "8th Grade", "9th Grade (Freshman)", "10th Grade (Sophomore)",
    "11th Grade (Junior)", "12th Grade (Senior)", "University (Year 1)", "University (Year 2)",
    "University (Year 3)", "University (Year 4+)", "Post-Graduate/Masters", "PhD"
];

const AVATAR_SEEDS = [
    "Felix", "Aneka", "Zack", "Midnight", "Luna", "Bandit", 
    "Spooky", "Abby", "Chester", "Daisy", "Willow", "Gizmo"
];

export const ProfilePage: React.FC<ProfilePageProps> = ({ 
    userProfile, 
    stats,
    decks, 
    tests, 
    onSaveProfile,
    themeColor
}) => {
  const [name, setName] = useState(userProfile.name);
  const [avatar, setAvatar] = useState(userProfile.avatar);
  const [grade, setGrade] = useState(userProfile.gradeLevel);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      soundService.playClick();
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRandomizeAvatar = () => {
      soundService.playPop();
      const randomSeed = Math.random().toString(36).substring(7);
      setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`);
  };

  const selectPresetAvatar = (seed: string) => {
      soundService.playClick();
      setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);
  };

  const handleSave = () => {
      soundService.playSuccess();
      onSaveProfile({ name, avatar, gradeLevel: grade });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 animate-fade-in-up pb-32">
        <div className="flex items-center gap-4 mb-8">
            <div className={`w-14 h-14 rounded-2xl bg-${themeColor}-500 flex items-center justify-center text-white shadow-lg shadow-${themeColor}-500/40`}>
                <User className="w-7 h-7" />
            </div>
            <div>
                <h1 className="text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">Edit Profile</h1>
                <p className="text-[var(--text-secondary)]">Customize your identity and view stats.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Left: Editor */}
            <div className="xl:col-span-7 space-y-8">
                <div className="glass-panel p-8 rounded-[2.5rem] border border-[var(--glass-border)] relative overflow-hidden">
                    {/* Background effect */}
                    <div className={`absolute top-0 right-0 w-64 h-64 bg-${themeColor}-500/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none`}></div>

                    {/* Current Avatar */}
                    <div className="flex flex-col items-center mb-8 relative z-10">
                        <div className="relative group mb-6">
                            <div className="w-40 h-40 rounded-full border-4 border-[var(--glass-border)] shadow-2xl overflow-hidden bg-[var(--input-bg)]">
                                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-2 right-2 p-3 bg-white text-black rounded-full shadow-lg hover:scale-110 transition-transform"
                                title="Upload Custom"
                            >
                                <Camera className="w-5 h-5" />
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>
                        
                        {/* Avatar Grid */}
                        <div className="w-full">
                            <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-3 text-center">Choose an Avatar</p>
                            <div className="grid grid-cols-6 gap-2 sm:gap-3 mb-4">
                                {AVATAR_SEEDS.map(seed => (
                                    <button 
                                        key={seed}
                                        onClick={() => selectPresetAvatar(seed)}
                                        className="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-indigo-500 hover:scale-110 transition-all bg-[var(--input-bg)]"
                                    >
                                        <img 
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} 
                                            alt={seed} 
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={handleRandomizeAvatar}
                                className="w-full py-2 rounded-xl border border-[var(--glass-border)] hover:bg-[var(--input-bg)] text-[var(--text-secondary)] text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                            >
                                <RefreshCw className="w-4 h-4" /> Randomize
                            </button>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-6 relative z-10">
                        <div>
                            <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2 pl-1">Display Name</label>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    className="w-full bg-[var(--input-bg)] glass-input border border-[var(--glass-border)] rounded-2xl pl-5 pr-5 py-4 font-bold text-[var(--text-primary)] outline-none focus:border-indigo-500 transition-all text-lg"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2 pl-1">Academic Level</label>
                            <CustomSelect 
                                value={grade} 
                                onChange={setGrade} 
                                options={GRADES.map(g => ({value: g, label: g}))} 
                            />
                        </div>

                        <div className="pt-4">
                            <button 
                                onClick={handleSave}
                                className={`w-full py-4 bg-gradient-to-r from-${themeColor}-600 to-${themeColor}-500 hover:brightness-110 text-white rounded-2xl font-bold shadow-xl shadow-${themeColor}-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 text-lg`}
                            >
                                <Save className="w-5 h-5" /> Save Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Summary Stats */}
            <div className="xl:col-span-5 space-y-6">
                <div className={`p-8 rounded-[2.5rem] bg-gradient-to-br from-${themeColor}-600 to-${themeColor}-800 text-white shadow-2xl relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="relative z-10 flex items-center justify-between mb-8">
                        <div>
                            <div className="text-white/70 font-bold uppercase tracking-widest text-xs mb-1">Current Level</div>
                            <div className="text-5xl font-black">{stats.level}</div>
                        </div>
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <Trophy className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1 bg-black/20 rounded-2xl p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-1 text-white/80 font-bold text-xs uppercase">
                                <Star className="w-3 h-3" /> Total XP
                            </div>
                            <div className="text-xl font-black">{stats.xp.toLocaleString()}</div>
                        </div>
                        <div className="flex-1 bg-black/20 rounded-2xl p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-1 text-white/80 font-bold text-xs uppercase">
                                <Layers className="w-3 h-3" /> Cards
                            </div>
                            <div className="text-xl font-black">{stats.cardsLearned}</div>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-8 rounded-[2.5rem] border border-[var(--glass-border)]">
                    <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-[var(--text-tertiary)]" /> Study Activity
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-[var(--input-bg)] rounded-2xl">
                            <div className="text-sm font-bold text-[var(--text-secondary)]">Time Spent</div>
                            <div className="text-lg font-black text-[var(--text-primary)]">{Math.floor(stats.minutesStudied / 60)}h {stats.minutesStudied % 60}m</div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-[var(--input-bg)] rounded-2xl">
                            <div className="text-sm font-bold text-[var(--text-secondary)]">Questions Answered</div>
                            <div className="text-lg font-black text-[var(--text-primary)]">{stats.totalQuestionsAnswered}</div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-[var(--input-bg)] rounded-2xl">
                            <div className="text-sm font-bold text-[var(--text-secondary)]">Created Decks</div>
                            <div className="text-lg font-black text-[var(--text-primary)]">{decks.length}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
