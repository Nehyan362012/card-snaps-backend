import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Sparkles, Mail, Lock, User, Eye, EyeOff, Chrome } from 'lucide-react';

interface AuthWorkingProps {
    onAuthSuccess: (user: any) => void;
}

export const AuthWorking: React.FC<AuthWorkingProps> = ({ onAuthSuccess }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Check for existing session
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                onAuthSuccess(session.user);
            }
        };
        checkSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                onAuthSuccess(session.user);
            }
        });

        return () => subscription.unsubscribe();
    }, [onAuthSuccess]);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            if (isSignUp) {
                // Sign up
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            display_name: fullName
                        }
                    }
                });

                if (error) throw error;
                
                if (data.user && !data.session) {
                    setMessage('Account created! Please check your email to confirm.');
                }
            } else {
                // Sign in
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });

            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Google authentication failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-black">
            {/* Main Card */}
            <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Card Snaps</h1>
                    <p className="text-slate-300 text-sm">
                        {isSignUp ? 'Create your account' : 'Welcome back'}
                    </p>
                </div>

                {/* Error/Success Message */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-300 text-sm">
                        {message}
                    </div>
                )}

                {/* Auth Form */}
                <form onSubmit={handleEmailAuth} className="space-y-5">
                    {isSignUp && (
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                required={isSignUp}
                            />
                        </div>
                    )}

                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            required
                            minLength={6}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                            </>
                        ) : (
                            <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="my-8 flex items-center">
                    <div className="flex-1 h-px bg-white/10"></div>
                    <span className="px-4 text-slate-400 text-sm">or continue with</span>
                    <div className="flex-1 h-px bg-white/10"></div>
                </div>

                {/* Google OAuth Button */}
                <button
                    onClick={handleGoogleAuth}
                    disabled={loading}
                    className="w-full py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <Chrome className="w-5 h-5" />
                    )}
                    <span>Continue with Google</span>
                </button>

                {/* Toggle Auth Mode */}
                <div className="mt-8 text-center">
                    <p className="text-slate-400 text-sm">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError('');
                            setMessage('');
                            setEmail('');
                            setPassword('');
                            setFullName('');
                        }}
                        className="ml-2 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                    >
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </button>
                </div>
            </div>
        </div>
    );
};
