import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { useAuth } from '../../context/AuthContext';

interface ForgotPasswordPageProps {
  onNavigate: (tab: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const { resetPassword, isConfigured } = useAuth();

  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValidEmail = (str: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim());
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!isValidEmail(cleanEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!isConfigured) {
      setErrorMessage(
        'Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file to enable password reset emails.'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetPassword(cleanEmail);
      if (!res.success) {
        setErrorMessage(res.error || 'Failed to dispatch password reset email.');
      } else {
        setSuccessMessage(
          res.message || 'If an account exists with this email, password reset instructions have been dispatched.'
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout 
      onNavigate={onNavigate}
      title="Reset Your Password"
      subtitle="Enter your registered email address and we'll dispatch instructions to reset your password."
      tagline="ACCOUNT RECOVERY"
      artworkTitle="Vined Connection Study"
      artist="Sana"
      quote="Connecting timeless artistic heritage with modern collectors worldwide."
      imageSrc="/hands_frame.jpg"
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

        {/* Success Alert Box */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-3 backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              {successMessage}
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleReset} className="space-y-5" noValidate>
          
          <div>
            <label 
              htmlFor="reset-email" 
              className="block text-[11px] font-mono font-medium uppercase tracking-widest text-white/60 mb-2"
            >
              Registered Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
              <input
                id="reset-email"
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-neutral-200 active:bg-neutral-300 text-black text-xs font-bold uppercase tracking-[0.15em] shadow-lg shadow-white/5 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 select-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>DISPATCHING RESET LINK...</span>
              </>
            ) : (
              <span>SEND RESET LINK</span>
            )}
          </button>

        </form>

        {/* Back to Login Link */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <button
            type="button"
            onClick={() => onNavigate('Login')}
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-amber-400 hover:text-amber-300 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO LOG IN</span>
          </button>
        </div>

      </div>
    </AuthLayout>
  );
};
