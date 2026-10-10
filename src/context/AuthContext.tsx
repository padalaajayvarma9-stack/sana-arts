import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { 
  supabase, 
  isSupabaseConfigured, 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithOAuth, 
  sendPasswordResetEmail, 
  signOutUser 
} from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (params: { email: string; password: string; fullName: string; accountType: 'lover' | 'artist' }) => Promise<{ success: boolean; error?: string; message?: string }>;
  signInWithProvider: (provider: 'google' | 'facebook') => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });

    // Listen for authentication state changes (e.g. login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await signInWithEmail(email, password);
    if (error) {
      return { success: false, error: error.message };
    }
    setUser(data?.user ?? null);
    setSession(data?.session ?? null);
    return { success: true };
  };

  const signUp = async (params: { email: string; password: string; fullName: string; accountType: 'lover' | 'artist' }) => {
    const { data, error } = await signUpWithEmail(params.email, params.password, {
      fullName: params.fullName,
      accountType: params.accountType
    });
    if (error) {
      return { success: false, error: error.message };
    }

    // Notice: if Supabase has email confirmation enabled, user is created but session is null until confirmed
    if (data?.user && !data.session) {
      return {
        success: true,
        message: 'Account created! Please check your email inbox to confirm your registration.'
      };
    }

    setUser(data?.user ?? null);
    setSession(data?.session ?? null);
    return { success: true };
  };

  const signInWithProvider = async (provider: 'google' | 'facebook') => {
    const { error } = await signInWithOAuth(provider);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const resetPassword = async (email: string) => {
    const { error } = await sendPasswordResetEmail(email);
    if (error) {
      return { success: false, error: error.message };
    }
    return { 
      success: true, 
      message: 'Password reset instructions have been sent to your email.' 
    };
  };

  const signOut = async () => {
    await signOutUser();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signInWithProvider,
        resetPassword,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
