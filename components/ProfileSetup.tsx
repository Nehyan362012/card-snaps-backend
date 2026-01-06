import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { Camera, User, ArrowRight, Upload, GraduationCap, Mail, Lock, Sparkles } from 'lucide-react';
import { soundService } from '../services/soundService';
import { CustomSelect } from './CustomSelect';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

interface ProfileSetupProps {
  onSave: (profile: UserProfile) => void;
}

const GRADES = [
    "Kindergarten", "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade",
    "6th Grade", "7th Grade", "8th Grade", "9th Grade (Freshman)", "10th Grade (Sophomore)",
    "11th Grade (Junior)", "12th Grade (Senior)", "University (Year 1)", "University (Year 2)",
    "University (Year 3)", "University (Year 4+)", "Post-Graduate/Masters", "PhD"
];

// Get the correct redirect URL for OAuth
const getRedirectUrl = () => {
  const currentUrl = window.location.href.split('?')[0].split('#')[0];
  // For development, use localhost
  if (currentUrl.includes('localhost') || currentUrl.includes('127.0.0.1')) {
    return currentUrl;
  }
  // For production, use the deployed URL
  return currentUrl;
};

export const ProfileSetup: React.FC<ProfileSetupProps> = ({ onSave }) => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string>('');
  const [grade, setGrade] = useState(GRADES[9]); // Default 10th
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If Supabase is not configured, skip auth
        if (!isSupabaseConfigured) {
          console.log('Supabase not configured - skipping auth');
          setIsAuthenticated(true);
          setShowAuth(false);
          setLoading(false);
          return;
        }

        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth check error:', error);
          setIsAuthenticated(false);
          setShowAuth(true);
        } else if (session) {
          // User is already authenticated
          setIsAuthenticated(true);
          setShowAuth(false);
          // Pre-fill profile from session
          setName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '');
          setAvatar(session.user.user_metadata?.avatar_url || '');
        } else {
          // No session, show auth
          setIsAuthenticated(false);
          setShowAuth(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // On error, allow proceeding without auth
        setIsAuthenticated(true);
        setShowAuth(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Only listen for auth state changes if Supabase is configured
    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setIsAuthenticated(true);
          setShowAuth(false);
          // Pre-fill profile from session
          setName(session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '');
          setAvatar(session.user.user_metadata?.avatar_url || '');
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setShowAuth(true);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      soundService.playSuccess();
      onSave({
        name,
        avatar: avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + name,
        gradeLevel: grade
      });
    }
  };

  const handleSkipAuth = () => {
    setIsAuthenticated(true);
    setShowAuth(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth screen if Supabase is configured and user is not authenticated
  if (showAuth && isSupabaseConfigured && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] animate-blob"></div>
          <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
        </div>

        <div className="w-full max-w-md glass-panel p-8 md:p-12 rounded-[2.5rem] border border-white/10 relative z-10 shadow-2xl animate-fade-in-up backdrop-blur-xl bg-slate-900/80">
          <div className="text-center mb-10">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-cyan-500 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6 animate-float hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Welcome to Card Snaps</h1>
            <p className="text-slate-400 text-lg">Sign in to create your profile</p>
          </div>
          
          <style>{`
            .supabase-auth-ui {
              --supabase-auth-fonts: 'Inter', system-ui, sans-serif;
            }
            .supabase-auth-ui .button {
              border-radius: 1rem !important;
              font-weight: 600 !important;
              transition: all 0.2s ease !important;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
            }
            .supabase-auth-ui .button:hover {
              transform: translateY(-2px) !important;
              box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3) !important;
            }
            .supabase-auth-ui .input {
              border-radius: 0.75rem !important;
              transition: all 0.2s ease !important;
              border: 2px solid #374151 !important;
              background: #1f2937 !important;
            }
            .supabase-auth-ui .input:focus {
              border-color: #6366f1 !important;
              box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1) !important;
            }
            .supabase-auth-ui .label {
              color: #d1d5db !important;
              font-weight: 600 !important;
              margin-bottom: 0.5rem !important;
            }
            .supabase-auth-ui .message {
              border-radius: 0.75rem !important;
            }
            .supabase-auth-ui .divider {
              border-color: #374151 !important;
              margin: 1.5rem 0 !important;
            }
            .supabase-auth-ui .anchor {
              color: #818cf8 !important;
              font-weight: 500 !important;
            }
            .supabase-auth-ui .anchor:hover {
              color: #a5b4fc !important;
            }
            .supabase-auth-ui .google-button {
              background: #ffffff !important;
              color: #1f2937 !important;
              border: 2px solid #374151 !important;
              border-radius: 1rem !important;
              font-weight: 600 !important;
              padding: 0.75rem 1rem !important;
              transition: all 0.2s ease !important;
            }
            .supabase-auth-ui .google-button:hover {
              background: #f9fafb !important;
              border-color: #6366f1 !important;
              transform: translateY(-2px) !important;
              box-shadow: 0 10px 25px rgba(99, 102, 241, 0.2) !important;
            }
          `}</style>

          <div className="supabase-auth-ui">
            <SupabaseAuth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#6366f1',
                      brandAccent: '#4f46e5',
                      defaultButtonText: '#ffffff',
                      defaultButtonBackground: '#6366f1',
                      defaultButtonBorder: '#6366f1',
                      inputBackground: '#1f2937',
                      inputBorder: '#374151',
                      inputText: '#ffffff',
                      inputPlaceholder: '#9ca3af',
                      anchorTextColor: '#818cf8',
                      anchorTextHoverColor: '#a5b4fc',
                      messageText: '#ffffff',
                      messageBackground: '#374151',
                      messageBorder: '#4b5563',
                    },
                  },
                },
                className: {
                  container: 'space-y-6',
                  label: 'block text-sm font-medium text-gray-300 mb-2',
                  input: 'w-full px-4 py-3 bg-gray-800 border-2 border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all',
                  button: 'w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0',
                  divider: 'relative my-6',
                  anchor: 'text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors',
                  message: 'p-4 rounded-xl text-sm',
                },
              }}
              providers={['google']}
              redirectTo={getRedirectUrl()}
              onlyThirdPartyProviders={false}
              magicLink={true}
            />
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleSkipAuth}
              className="text-sm text-gray-400 hover:text-gray-300 underline transition-colors font-medium"
            >
              Continue without account (local storage only)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 animate-fade-in-up">
      <div className="max-w-md w-full glass-panel p-8 md:p-12 rounded-[2.5rem] relative shadow-[0_0_100px_rgba(99,102,241,0.15)] border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-xl hover:shadow-[0_0_120px_rgba(99,102,241,0.25)] transition-all duration-300">
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6 animate-float hover:scale-110 hover:rotate-3 transition-all duration-300 cursor-pointer">
             <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)] mb-2">Welcome{isAuthenticated ? ' back' : ''}!</h1>
          <p className="text-[var(--text-secondary)]">Let's set up your profile to get started.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
             <div 
               className="relative group cursor-pointer"
               onClick={() => fileInputRef.current?.click()}
             >
                <div className={`w-32 h-32 rounded-full border-4 border-[var(--glass-border)] shadow-2xl overflow-hidden transition-all duration-300 group-hover:scale-110 group-hover:border-indigo-500/70 group-hover:shadow-indigo-500/50 ${!avatar ? 'bg-[var(--input-bg)] flex items-center justify-center' : ''}`}>
                    {avatar ? (
                        <img src={avatar} alt="Profile" className="w-full h-full object-cover group-hover:brightness-110 transition-all" />
                    ) : (
                        <Camera className="w-10 h-10 text-[var(--text-tertiary)] group-hover:text-indigo-500 group-hover:scale-110 transition-all" />
                    )}
                </div>
                <div className="absolute bottom-0 right-0 p-2.5 bg-indigo-600 rounded-full text-white shadow-lg transform translate-y-1 translate-x-1 group-hover:scale-125 group-hover:bg-indigo-500 transition-all hover:rotate-12">
                    <Upload className="w-4 h-4" />
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange}
                />
             </div>
             <p className="mt-3 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider hover:text-indigo-400 transition-colors">Tap to upload photo</p>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-tertiary)] mb-2 uppercase tracking-wider pl-4">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Smith"
              className="w-full bg-[var(--input-bg)] glass-input border-2 border-[var(--glass-border)] rounded-2xl px-6 py-4 text-lg text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/70 outline-none transition-all shadow-inner hover:border-indigo-500/30 hover:shadow-md"
              autoFocus
            />
          </div>

          {/* Grade Input */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-tertiary)] mb-2 uppercase tracking-wider pl-4">Grade / Level</label>
            <div className="hover:scale-[1.01] transition-transform duration-200">
              <CustomSelect 
                  value={grade}
                  onChange={setGrade}
                  options={GRADES.map(g => ({ value: g, label: g }))}
                  icon={<GraduationCap className="w-5 h-5" />}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold text-white text-lg shadow-xl shadow-indigo-500/20 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/40 active:translate-y-0 active:scale-[0.98] flex items-center justify-center gap-2 group"
          >
            Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
};