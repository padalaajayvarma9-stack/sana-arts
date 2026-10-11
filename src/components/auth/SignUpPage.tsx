import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Palette, Sparkles, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { SocialAuthButtons } from './SocialAuthButtons';
import { useAuth } from '../../context/AuthContext';

interface SignUpPageProps {
  onNavigate: (tab: string) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigate }) => {
  const { signUp, signInWithProvider, isConfigured } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState<'lover' | 'artist'>('lover');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);

  const isValidEmail = (str: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Form Validations
    const cleanName = fullName.trim();
    const cleanEmail = email.trim();

    if (!cleanName) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (cleanName.length < 2) {
      setErrorMessage('Full name must be at least 2 characters.');
      return;
    }
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!isValidEmail(cleanEmail)) {
      setErrorMessage('Please enter a valid email address (e.g. name@example.com).');
      return;
    }
    if (!password) {
      setErrorMessage('Please create a password.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (!confirmPassword) {
      setErrorMessage('Please confirm your password.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password entry.');
      return;
    }

    if (!isConfigured) {
      setErrorMessage(
        'Supabase authentication is not configured yet. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY are configured in your environment variables.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await signUp({
        email: cleanEmail,
        password,
        fullName: cleanName,
        accountType
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Registration failed. Please try again.');
      } else {
        if (res.message) {
          setSuccessMessage(res.message);
        } else {
          onNavigate('Home');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'facebook') => {
    setErrorMessage(null);

    if (!isConfigured) {
      setErrorMessage(
        `Supabase is not configured yet. Configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY, and enable the ${
          provider === 'google' ? 'Google' : 'Facebook'
        } OAuth provider in your Supabase project.`
      );
      return;
    }

    setIsSocialLoading(true);
    try {
      const res = await signInWithProvider(provider);
      if (!res.success) {
        setErrorMessage(res.error || `Failed to initiate ${provider} registration.`);
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
      title="Create Your Account"
      subtitle="Join an ecosystem connecting independent artists and discerning art collectors."
      tagline="BECOME A MEMBER"
      artworkTitle="Fashion Concept Gown Sketch"
      artist="Sana"
      quote="Empowering artists to monetize their vision and collectors to acquire bespoke, timeless traditional media."
      imageSrc="/fashion_gown.jpg"
    >
      <div className="w-full">
        
        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-5 p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-3 backdrop-blur-md">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              {errorMessage}
            </div>
          </div>
        )}

        {/* Success Alert Box */}
        {successMessage && (
          <div className="mb-5 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-3 backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              {successMessage}
            </div>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSignUp} className="space-y-4" noValidate>
          
          {/* Account Type Selector: Art Lover vs Artist */}
          <div>
            <label className="block text-[11px] font-mono font-medium uppercase tracking-widest text-white/60 mb-2">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              
              {/* Art Lover Option */}
              <button
                type="button"
                onClick={() => setAccountType('lover')}
                className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col gap-1.5 select-none ${
                  accountType === 'lover'
                    ? 'border-amber-400 bg-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.1)]'
                    : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 rounded-lg ${accountType === 'lover' ? 'bg-amber-400 text-black' : 'bg-white/10 text-white/60'}`}>
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  {accountType === 'lover' && (
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                      Selected
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-bold text-xs text-white block">Art Lover</span>
                  <span className="text-[11px] text-white/50 leading-tight block">Discover & collect art</span>
                </div>
              </button>

              {/* Artist Option */}
              <button
                type="button"
                onClick={() => setAccountType('artist')}
                className={`p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col gap-1.5 select-none ${
                  accountType === 'artist'
                    ? 'border-amber-400 bg-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.1)]'
                    : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 rounded-lg ${accountType === 'artist' ? 'bg-amber-400 text-black' : 'bg-white/10 text-white/60'}`}>
                    <Palette className="w-3.5 h-3.5" />
                  </div>
                  {accountType === 'artist' && (
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/30">
                      Selected
                    </span>
                  )}
                </div>
                <div>
                  <span className="font-bold text-xs text-white block">Artist</span>
                  <span className="text-[11px] text-white/50 leading-tight block">Showcase & sell works</span>
                </div>
              </button>

            </div>
          </div>

          {/* Full Name Input */}
          <div>
            <label 
              htmlFor="signup-name" 
              className="block text-[11px] font-mono font-medium uppercase tracking-widest text-white/60 mb-1.5"
            >
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Clara Oswald"
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-[#121212]/80 hover:border-white/20 focus:border-white/40 text-sm text-white placeholder-white/20 outline-none transition-all duration-200 focus:ring-1 focus:ring-white/20"
              />
            </div>
          </div>

          {/* Email Address Input */}
          <div>
            <label 
              htmlFor="signup-email" 
              className="block text-[11px] font-mono font-medium uppercase tracking-widest text-white/60 mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                disabled={isSubmitting}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-[#121212]/80 hover:border-white/20 focus:border-white/40 text-sm text-white placeholder-white/20 outline-none transition-all duration-200 focus:ring-1 focus:ring-white/20"
              />
            </div>
          </div>

          {/* Passwords Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Password */}
            <div>
              <label 
                htmlFor="signup-password" 
                className="block text-[11px] font-mono font-medium uppercase tracking-widest text-white/60 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 chars"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-white/10 bg-[#121212]/80 hover:border-white/20 focus:border-white/40 text-sm text-white placeholder-white/20 outline-none transition-all duration-200 focus:ring-1 focus:ring-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer p-0.5"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label 
                htmlFor="signup-confirm-password" 
                className="block text-[11px] font-mono font-medium uppercase tracking-widest text-white/60 mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                <input
                  id="signup-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-white/10 bg-[#121212]/80 hover:border-white/20 focus:border-white/40 text-sm text-white placeholder-white/20 outline-none transition-all duration-200 focus:ring-1 focus:ring-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer p-0.5"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
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
                <span>CREATING ACCOUNT...</span>
              </>
            ) : (
              <span>CREATE ACCOUNT</span>
            )}
          </button>

        </form>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="border-t border-white/10 w-full" />
          <span className="bg-[#080808] px-3 text-[10px] font-mono uppercase tracking-widest text-white/40 absolute">
            or sign up with
          </span>
        </div>

        {/* Social Registration */}
        <SocialAuthButtons 
          onSelectProvider={handleSocialAuth}
          isLoading={isSocialLoading}
          disabled={isSubmitting}
        />

        {/* Existing User Login Link */}
        <div className="mt-6 pt-5 border-t border-white/5 text-center text-xs text-white/50">
          <span>Already have an account? </span>
          <button
            type="button"
            onClick={() => onNavigate('Login')}
            className="font-bold text-white hover:text-amber-300 ml-1 transition-colors cursor-pointer"
          >
            Log In
          </button>
        </div>

      </div>
    </AuthLayout>
  );
};
