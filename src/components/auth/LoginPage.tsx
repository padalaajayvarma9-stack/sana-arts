import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { SocialAuthButtons } from './SocialAuthButtons';
import { useAuth } from '../../context/AuthContext';

interface LoginPageProps {
  onNavigate: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { signIn, signInWithProvider, isConfigured } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);

  // Email format validation helper
  const isValidEmail = (str: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!isValidEmail(cleanEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. name@example.com).');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (!isConfigured) {
      setErrorMessage(
        'Supabase Auth is not connected yet. Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file to log in.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signIn(cleanEmail, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Invalid email or password.');
      } else {
        onNavigate('Home');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'facebook') => {
    setErrorMessage(null);

    if (!isConfigured) {
      setErrorMessage(
        `Supabase is not configured yet. Configure the ${
          provider === 'google' ? 'Google' : 'Facebook'
        } OAuth provider in your Supabase project to test social authentication.`
      );
      return;
    }

    setIsSocialLoading(true);
    try {
      const res = await signInWithProvider(provider);
      if (!res.success) {
        setErrorMessage(res.error || `Failed to initiate ${provider} sign-in.`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'OAuth error occurred.');
    } finally {
      setIsSocialLoading(false);
    }
  };

  return (
    <AuthLayout 
      onNavigate={onNavigate}
      title="Welcome Back to Sana Arts"
      subtitle="Discover art. Support artists. Make it yours."
      tagline="CREATOR & COLLECTOR PORTAL"
      artworkTitle="Moonlit Hearts Mandala"
      artist="M. Prasanna"
      quote="Connecting passionate collectors with traditional & contemporary creators across the globe."
      imageSrc="/moon_mandala.jpg"
    >
      <div className="w-full">
        
        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-3 backdrop-blur-md">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              {errorMessage}
            </div>
          </div>
        )}

        {/* Main Login Form */}
        <form onSubmit={handleLogin} className="space-y-5" noValidate>
          
          {/* Email Input */}
          <div>
            <label 
              htmlFor="login-email" 
              className="block text-[11px] font-mono font-medium uppercase tracking-widest text-white/60 mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="collector@sanaarts.com"
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-[#121212]/80 hover:border-white/20 focus:border-white/40 text-sm text-white placeholder-white/20 outline-none transition-all duration-200 focus:ring-1 focus:ring-white/20"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label 
                htmlFor="login-password" 
                className="block text-[11px] font-mono font-medium uppercase tracking-widest text-white/60"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => onNavigate('ForgotPassword')}
                className="text-xs font-mono text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={isSubmitting}
                className="w-full pl-10 pr-11 py-3 rounded-xl border border-white/10 bg-[#121212]/80 hover:border-white/20 focus:border-white/40 text-sm text-white placeholder-white/20 outline-none transition-all duration-200 focus:ring-1 focus:ring-white/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer p-0.5"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-neutral-200 active:bg-neutral-300 text-black text-xs font-bold uppercase tracking-[0.15em] shadow-lg shadow-white/5 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 select-none mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>AUTHENTICATING...</span>
              </>
            ) : (
              <span>LOG IN</span>
            )}
          </button>

        </form>

        {/* Divider */}
        <div className="relative my-7 flex items-center justify-center">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-[#080808] px-3 text-[10px] font-mono uppercase tracking-widest text-white/40 absolute">
            or continue with
          </span>
        </div>

        {/* Social Logins */}
        <SocialAuthButtons 
          onSelectProvider={handleSocialAuth}
          isLoading={isSocialLoading}
          disabled={isSubmitting}
        />

        {/* Registration Prompt Link */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center text-xs text-white/50">
          <span>Don't have an account? </span>
          <button
            type="button"
            onClick={() => onNavigate('SignUp')}
            className="font-bold text-white hover:text-amber-300 ml-1 transition-colors cursor-pointer"
          >
            Sign Up
          </button>
        </div>

      </div>
    </AuthLayout>
  );
};
