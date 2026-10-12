import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { 
  supabase, 
  isSupabaseConfigured, 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithOAuth, 
  sendPasswordResetEmail, 
  signOutUser,
  UserProfile,
  ensureUserProfile,
  updateUserProfile
} from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isProfileLoading: boolean;
  isConfigured: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false);

  // Helper function to load and synchronize profile for a given user
  const syncProfile = async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }
    setIsProfileLoading(true);
    try {
      const res = await ensureUserProfile(currentUser);
      if (res.data) {
        setProfile(res.data);
      }
    } catch (err) {
      console.error('Error synchronizing user profile:', err);
    } finally {
      setIsProfileLoading(false);
    }
  };

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Check active session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await syncProfile(session.user);
      }
      setIsLoading(false);
    }).catch(() => {
      setIsLoading(false);
    });

    // Listen for authentication state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      const newUser = newSession?.user ?? null;
      setUser(newUser);
      if (newUser) {
        await syncProfile(newUser);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (user) {
      await syncProfile(user);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { success: false, error: 'User is not logged in.' };
    }
    const res = await updateUserProfile(user.id, updates);
    if (res.error) {
      return { success: false, error: res.error.message };
    }
    if (res.data) {
      setProfile(res.data);
    }
    return { success: true };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await signInWithEmail(email, password);
    if (error) {
      return { success: false, error: error.message };
    }
    setUser(data?.user ?? null);
    setSession(data?.session ?? null);
    if (data?.user) {
      await syncProfile(data.user);
    }
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

    if (data?.user) {
      // Attempt to ensure profile creation immediately
      try {
        await ensureUserProfile(data.user, {
          fullName: params.fullName,
          accountType: params.accountType
        });
      } catch (e) {
        // Fallback or database trigger handles it
      }
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
    if (data?.user) {
      await syncProfile(data.user);
    }
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
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isProfileLoading,
        isConfigured: isSupabaseConfigured,
        refreshProfile,
        updateProfile,
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
