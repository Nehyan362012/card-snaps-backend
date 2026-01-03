
import React, { useEffect } from 'react';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../services/supabaseClient';
import { Sparkles } from 'lucide-react';

interface AuthProps {
    onAuthSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                onAuthSuccess();
            }
        });

        return () => subscription.unsubscribe();
    }, [onAuthSuccess]);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] animate-blob"></div>
                <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
            </div>

            <div className="w-full max-w-md glass-panel p-8 md:p-12 rounded-[2.5rem] border border-white/10 relative z-10 shadow-2xl animate-fade-in-up">
                <div className="text-center mb-10">
                    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-cyan-500 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6 animate-float">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Card Snaps</h1>
                    <p className="text-slate-400 text-lg">Sign in to continue your learning journey</p>
                </div>

                <SupabaseAuth
                    supabaseClient={supabase}
                    appearance={{
                        theme: ThemeSupa,
                        variables: {
                            default: {
                                colors: {
                                    brand: '#6366f1',
                                    brandAccent: '#4f46e5',
                                },
                            },
                        },
                        className: {
                            container: 'auth-container',
                            button: 'auth-button',
                            input: 'auth-input',
                        },
                    }}
                    providers={['google']}
                    redirectTo={window.location.origin}
                />
            </div>
        </div>
    );
};
                    <p className="text-slate-400 font-medium">Create your local study profile.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-4">What should we call you?</label>
                        <div className="relative group">
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-indigo-500 transition-all shadow-inner text-lg font-bold"
                                required
                                autoFocus
                            />
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm flex items-center gap-3 animate-shake">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || !name.trim()}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Start Learning'}
                        {!isLoading && <ArrowRight className="w-5 h-5" />}
                    </button>
                </form>
                
                <p className="mt-6 text-center text-xs text-slate-500">
                    Data is stored locally on this device.
                </p>
            </div>
        </div>
    );
};
