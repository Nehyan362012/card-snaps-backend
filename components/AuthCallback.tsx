import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

export const AuthCallback: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                console.log('Auth callback: Processing...');
                
                // Get the session after OAuth redirect
                const { data, error } = await supabase.auth.getSession();
                if (!error) {
                    // Also refresh the session to ensure it’s persisted after OAuth
                    await supabase.auth.refreshSession();
                }
                
                if (error) {
                    console.error('Auth callback error:', error);
                    setError(error.message || 'Authentication failed');
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 3000);
                    return;
                }

                if (data.session) {
                    console.log('Auth callback: Success!');
                    setSuccess(true);
                    // Redirect to main app after a short delay
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1500);
                } else {
                    console.log('Auth callback: No session found');
                    setError('No authentication session found. Please try again.');
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 3000);
                }
            } catch (err: any) {
                console.error('Auth callback exception:', err);
                setError(err.message || 'Authentication failed');
                setTimeout(() => {
                    window.location.href = '/';
                }, 3000);
            } finally {
                setLoading(false);
            }
        };

        handleAuthCallback();
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[100px] animate-pulse animation-delay-2000"></div>
            </div>

            <div className="w-full max-w-md glass-panel p-8 md:p-12 rounded-[2.5rem] border border-white/10 relative z-10 shadow-2xl text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6">
                    <Sparkles className="w-8 h-8 text-white" />
                </div>
                
                {loading && (
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-4">Completing Authentication...</h1>
                        <div className="w-12 h-12 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                        <p className="text-slate-400 mt-4">Please wait while we sign you in.</p>
                    </div>
                )}
                
                {error && (
                    <div>
                        <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/30 mx-auto flex items-center justify-center mb-6">
                            <AlertCircle className="w-8 h-8 text-red-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-red-400 mb-4">Authentication Error</h1>
                        <p className="text-slate-400 mb-2">{error}</p>
                        <p className="text-slate-500 text-sm">Redirecting you back...</p>
                    </div>
                )}
                
                {success && (
                    <div>
                        <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500/30 mx-auto flex items-center justify-center mb-6">
                            <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-green-400 mb-4">Success!</h1>
                        <p className="text-slate-400 mb-2">You've been successfully signed in.</p>
                        <p className="text-slate-500 text-sm">Redirecting you to the app...</p>
                    </div>
                )}
            </div>
        </div>
    );
};
