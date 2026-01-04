import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

interface AuthProps {
    onAuthSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                onAuthSuccess();
            }
        });

        return () => subscription.unsubscribe();
    }, [onAuthSuccess]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                </div>
                <SupabaseAuth
                    supabaseClient={supabase}
                    appearance={{ theme: ThemeSupa }}
                    providers={['google']}
                    redirectTo={window.location.origin}
                />
            </div>
        </div>
    );
};
