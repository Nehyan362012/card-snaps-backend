import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Sparkles, Mail, Lock, User, Eye, EyeOff, Chrome, ArrowRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthEnhancedProps {
    onAuthSuccess: (user: any) => void;
}

interface AuthFormDataType {
    email: string;
    password: string;
    fullName: string;
}

export const AuthEnhanced: React.FC<AuthEnhancedProps> = ({ onAuthSuccess }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [formData, setFormData] = useState<AuthFormDataType>({
        email: '',
        password: '',
        fullName: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev: AuthFormDataType) => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
        setError('');
        setSuccess('');
    };

    const validateForm = () => {
        if (!formData.email || !formData.email.includes('@')) {
            setError('Please enter a valid email address');
            return false;
        }
        if (!formData.password || formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return false;
        }
        if (isSignUp && !formData.fullName.trim()) {
            setError('Please enter your full name');
            return false;
        }
        return true;
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (isSignUp) {
                // Sign up with email and password
                const { data, error } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.fullName,
                            display_name: formData.fullName
                        }
                    }
                });

                if (error) throw error;
                
                // Show confirmation message for signup
                if (data.user && !data.session) {
                    setSuccess('Account created! Please check your email to confirm.');
                }
            } else {
                // Sign in with email and password
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password
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
        setSuccess('');

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                }
            });

            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Google authentication failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-black relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[100px] animate-pulse animation-delay-2000"></div>
                <div className="absolute bottom-[20%] left-[30%] w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[80px] animate-pulse animation-delay-4000"></div>
            </div>

            <motion.div 
                className="w-full max-w-md relative z-10"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                {/* Main Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-8">
                    {/* Logo and Title */}
                    <motion.div 
                        className="text-center mb-8"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Card Snaps</h1>
                        <p className="text-slate-300 text-sm">
                            {isSignUp ? 'Create your account' : 'Welcome back'}
                        </p>
                    </motion.div>

                    {/* Error and Success Messages */}
                    <AnimatePresence>
                        {error && (
                            <motion.div 
                                className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {error}
                            </motion.div>
                        )}
                        {success && (
                            <motion.div 
                                className="mb-6 p-4 rounded-xl bg-green-500/20 border border-green-500/30 text-green-300 text-sm flex items-center gap-2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <CheckCircle className="w-4 h-4" />
                                {success}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Auth Form */}
                    <motion.form 
                        onSubmit={handleEmailAuth} 
                        className="space-y-5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        {isSignUp && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4, duration: 0.3 }}
                            >
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        name="fullName"
                                        placeholder="Full Name"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        required={isSignUp}
                                    />
                                </div>
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: isSignUp ? 0.5 : 0.4, duration: 0.3 }}
                        >
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: isSignUp ? 0.6 : 0.5, duration: 0.3 }}
                        >
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleInputChange}
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
                        </motion.div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: isSignUp ? 0.7 : 0.6, duration: 0.3 }}
                            whileHover={{ scale: loading ? 1 : 1.02 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                                </>
                            ) : (
                                <>
                                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </motion.button>
                    </motion.form>

                    {/* Divider */}
                    <div className="my-8 flex items-center">
                        <div className="flex-1 h-px bg-white/10"></div>
                        <span className="px-4 text-slate-400 text-sm">or continue with</span>
                        <div className="flex-1 h-px bg-white/10"></div>
                    </div>

                    {/* Google OAuth Button */}
                    <motion.button
                        onClick={handleGoogleAuth}
                        disabled={loading}
                        className="w-full py-4 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.3 }}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Chrome className="w-5 h-5" />
                        )}
                        <span>Continue with Google</span>
                    </motion.button>

                    {/* Toggle Auth Mode */}
                    <motion.div 
                        className="mt-8 text-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9, duration: 0.3 }}
                    >
                        <p className="text-slate-400 text-sm">
                            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                            <button
                                type="button"
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setError('');
                                    setSuccess('');
                                    setFormData({ email: '', password: '', fullName: '' });
                                }}
                                className="ml-2 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                            >
                                {isSignUp ? 'Sign In' : 'Sign Up'}
                            </button>
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};
