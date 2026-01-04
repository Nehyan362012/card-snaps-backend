import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { Sparkles } from 'lucide-react';

export const AuthCallback: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                const { data, error } = await supabase.auth.getSession();
                
                if (error) {
                    throw error;
                }

                if (data.session) {
                    // Successfully authenticated
                    window.location.href = '/';
                } else {
                    // No session found
                    setError('Authentication failed. Please try again.');
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 3000);
                }
            } catch (err: any) {
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
                <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] animate-blob"></div>
                <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
            </div>

            <div className="w-full max-w-md glass-panel p-8 md:p-12 rounded-[2.5rem] border border-white/10 relative z-10 shadow-2xl text-center">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-cyan-500 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-6 animate-float">
                    <Sparkles className="w-10 h-10 text-white" />
                </div>
                
                {loading ? (
                    <div>
                        <h1 className="text-2xl font-bold text-white mb-4">Completing Authentication...</h1>
                        <div className="w-12 h-12 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto"></div>
                    </div>
                ) : error ? (
                    <div>
                        <h1 className="text-2xl font-bold text-red-400 mb-4">Authentication Error</h1>
                        <p className="text-slate-400">{error}</p>
                        <p className="text-slate-500 text-sm mt-2">Redirecting you back...</p>
                    </div>
                ) : (
                    <div>
                        <h1 className="text-2xl font-bold text-green-400 mb-4">Success!</h1>
                        <p className="text-slate-400">Redirecting you to the app...</p>
                    </div>
                )}
            </div>
        </div>
    );
};
