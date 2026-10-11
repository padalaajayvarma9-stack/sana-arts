/// <reference types="vite/client" />
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// Retrieve Supabase environment variables safely using static Vite replacements
// Supports both VITE_SUPABASE_PUBLISHABLE_KEY (modern Supabase) and VITE_SUPABASE_ANON_KEY (legacy)
const getEnvVar = (val: unknown): string => (typeof val === 'string' ? val.trim() : '');

const supabaseUrl: string = 
  getEnvVar(import.meta.env.VITE_SUPABASE_URL) || 
  getEnvVar((import.meta as any).env?.VITE_SUPABASE_URL);

const supabasePublishableKey: string = 
  getEnvVar(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) || 
  getEnvVar(import.meta.env.VITE_SUPABASE_ANON_KEY) || 
  getEnvVar((import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY) || 
  getEnvVar((import.meta as any).env?.VITE_SUPABASE_ANON_KEY);

// Check if credentials have been supplied
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabasePublishableKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  !supabaseUrl.includes('your-project-id')
);

// Create Supabase client singleton if configured
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      }
    })
  : null;

export interface AuthResponse<T = any> {
  data: T | null;
  error: Error | null;
}

/**
 * Sign in user with email and password
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResponse<{ user: User | null; session: Session | null }>> {
  if (!supabase) {
    return {
      data: null,
      error: new Error(
        'Supabase is not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your environment variables.'
      )
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) return { data: null, error };
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

/**
 * Sign up user with email, password, and custom profile metadata (e.g., accountType, full_name)
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  metadata: { fullName: string; accountType: 'lover' | 'artist' }
): Promise<AuthResponse<{ user: User | null; session: Session | null }>> {
  if (!supabase) {
    return {
      data: null,
      error: new Error(
        'Supabase is not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your environment variables.'
      )
    };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata.fullName,
          account_type: metadata.accountType
        }
      }
    });
    if (error) return { data: null, error };
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

/**
 * Initiate OAuth sign in (Google or Facebook)
 */
export async function signInWithOAuth(provider: 'google' | 'facebook'): Promise<AuthResponse<void>> {
  if (!supabase) {
    return {
      data: null,
      error: new Error(
        `Supabase is not configured yet. Set up ${provider.charAt(0).toUpperCase() + provider.slice(1)} OAuth provider in your Supabase dashboard and configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.`
      )
    };
  }

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) return { data: null, error };
    return { data: null, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string): Promise<AuthResponse<void>> {
  if (!supabase) {
    return {
      data: null,
      error: new Error(
        'Supabase is not configured yet. Please add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your environment variables to enable password resets.'
      )
    };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) return { data: null, error };
    return { data: null, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

/**
 * Sign out the current user
 */
export async function signOutUser(): Promise<AuthResponse<void>> {
  if (!supabase) {
    return { data: null, error: null };
  }

  try {
    const { error } = await supabase.auth.signOut();
    if (error) return { data: null, error };
    return { data: null, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}
