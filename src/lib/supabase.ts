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

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  accountType: 'lover' | 'artist' | string;
  bio?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Fetch profile row from public.profiles for a given user UUID
 */
export async function fetchUserProfile(userId: string): Promise<AuthResponse<UserProfile>> {
  if (!supabase) {
    return { data: null, error: new Error('Supabase client is not initialized.') };
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    if (!data) {
      return { data: null, error: null };
    }

    return {
      data: {
        id: data.id,
        fullName: data.full_name || '',
        email: data.email || '',
        avatarUrl: data.avatar_url || null,
        accountType: data.account_type || 'lover',
        bio: data.bio || null,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      },
      error: null
    };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

/**
 * Ensures a profile row exists in public.profiles.
 * If not present, creates/completes it using authenticated user data.
 * If the database table does not exist yet (PGRST205), safely falls back to auth metadata.
 */
export async function ensureUserProfile(
  user: User,
  fallbackMeta?: { fullName?: string; accountType?: string }
): Promise<AuthResponse<UserProfile>> {
  if (!supabase) {
    return { data: null, error: new Error('Supabase client is not initialized.') };
  }

  const fullName = 
    user.user_metadata?.full_name || 
    fallbackMeta?.fullName || 
    user.email?.split('@')[0] || 
    '';
  const email = user.email || '';
  const accountType = 
    user.user_metadata?.account_type || 
    fallbackMeta?.accountType || 
    'lover';
  const avatarUrl = user.user_metadata?.avatar_url || null;

  try {
    // 1. Attempt to fetch existing profile row
    const existing = await fetchUserProfile(user.id);
    if (existing.data) {
      return existing;
    }

    // 2. Profile row not found, attempt upsert
    const payload = {
      id: user.id,
      full_name: fullName,
      email: email,
      account_type: accountType,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString()
    };

    const { data: upserted, error: upsertErr } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select('*')
      .maybeSingle();

    if (upsertErr) {
      // Table may not have been created yet in SQL editor; gracefully provide in-memory profile
      return {
        data: {
          id: user.id,
          fullName,
          email,
          avatarUrl,
          accountType,
          bio: null
        },
        error: null
      };
    }

    return {
      data: {
        id: upserted?.id || user.id,
        fullName: upserted?.full_name || fullName,
        email: upserted?.email || email,
        avatarUrl: upserted?.avatar_url || avatarUrl,
        accountType: upserted?.account_type || accountType,
        bio: upserted?.bio || null,
        createdAt: upserted?.created_at,
        updatedAt: upserted?.updated_at
      },
      error: null
    };
  } catch (err: any) {
    return {
      data: {
        id: user.id,
        fullName,
        email,
        avatarUrl,
        accountType,
        bio: null
      },
      error: null
    };
  }
}

/**
 * Update user profile row in public.profiles
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<AuthResponse<UserProfile>> {
  if (!supabase) {
    return { data: null, error: new Error('Supabase client is not initialized.') };
  }

  try {
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    if (updates.fullName !== undefined) payload.full_name = updates.fullName;
    if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;
    if (updates.accountType !== undefined) payload.account_type = updates.accountType;
    if (updates.bio !== undefined) payload.bio = updates.bio;

    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select('*')
      .maybeSingle();

    if (error) {
      return { data: null, error: new Error(error.message) };
    }

    return {
      data: {
        id: data?.id || userId,
        fullName: data?.full_name ?? updates.fullName ?? '',
        email: data?.email ?? updates.email ?? '',
        avatarUrl: data?.avatar_url ?? updates.avatarUrl ?? null,
        accountType: data?.account_type ?? updates.accountType ?? 'lover',
        bio: data?.bio ?? updates.bio ?? null,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at
      },
      error: null
    };
  } catch (err: any) {
    return { data: null, error: err };
  }
}
