
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
        // Check if Supabase is configured
        import('../services/supabaseClient').then(({ isSupabaseConfigured }) => {
            if (!isSupabaseConfigured) {
                console.warn('Supabase not configured - auth will not work');
                // Optionally show a message to user
                return;
            }
        });

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
