import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Bookmark, 
  UserSquare2, 
  Settings, 
  Camera, 
  Plus, 
  Image as ImageIcon,
  Check,
  Copy,
  X,
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  User as UserIcon,
  Sparkles,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfilePageProps {
  onNavigate?: (tab: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { 
    user, 
    profile, 
    isLoading, 
    isProfileLoading, 
    updateProfile, 
    signOut, 
    signIn, 
    signUp, 
    signInWithProvider 
  } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'posts' | 'artworks' | 'saved' | 'tagged'>('posts');
  
  // Auth Form State for Logged-Out Visitors
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authAccountType, setAuthAccountType] = useState<'lover' | 'artist'>('lover');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthSubmitting, setIsAuthSubmitting] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null);

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Feedback states
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Sync edit form with profile data
  useEffect(() => {
    if (user) {
      setEditFullName(profile?.fullName || user.user_metadata?.full_name || '');
      setEditBio(profile?.bio || '');
      setEditAvatarUrl(profile?.avatarUrl || user.user_metadata?.avatar_url || '');
    }
  }, [profile, user, isEditModalOpen]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/profile`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyId = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

    const res = await updateProfile({
      fullName: editFullName.trim(),
      bio: editBio.trim() || null,
      avatarUrl: editAvatarUrl.trim() || null
    });

    setIsSaving(false);
    if (res.success) {
      setSaveStatus('Profile updated successfully!');
      setTimeout(() => {
        setIsEditModalOpen(false);
        setSaveStatus(null);
      }, 1000);
    } else {
      setSaveStatus(res.error || 'Failed to update profile.');
    }
  };

  // Inline Log In handler inside Profile Section
  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorMessage(null);
    setAuthSuccessMessage(null);

    const cleanEmail = authEmail.trim();
    if (!cleanEmail) {
      setAuthErrorMessage('Please enter your email address.');
      return;
    }
    if (!authPassword) {
      setAuthErrorMessage('Please enter your password.');
      return;
    }

    setIsAuthSubmitting(true);
    try {
      const res = await signIn(cleanEmail, authPassword);
      if (!res.success) {
        setAuthErrorMessage(
          res.error === 'Invalid login credentials'
            ? 'Invalid email or password. If you recently created your account, please ensure your email is verified or email confirmation is disabled in your Supabase project.'
            : (res.error || 'Failed to log in.')
        );
      } else {
        // Logged in successfully! Profile will automatically render
        setAuthEmail('');
        setAuthPassword('');
      }
    } catch (err: any) {
      setAuthErrorMessage(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  // Inline Sign Up handler inside Profile Section
  const handleInlineSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthErrorMessage(null);
    setAuthSuccessMessage(null);

    const cleanName = authFullName.trim();
    const cleanEmail = authEmail.trim();

    if (!cleanName) {
      setAuthErrorMessage('Please enter your full name.');
      return;
    }
    if (!cleanEmail) {
      setAuthErrorMessage('Please enter your email address.');
      return;
    }
    if (!authPassword) {
      setAuthErrorMessage('Please create a password.');
      return;
    }
    if (authPassword.length < 6) {
      setAuthErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (authPassword !== authConfirmPassword) {
      setAuthErrorMessage('Passwords do not match.');
      return;
    }

    setIsAuthSubmitting(true);
    try {
      const res = await signUp({
        email: cleanEmail,
        password: authPassword,
        fullName: cleanName,
        accountType: authAccountType
      });

      if (!res.success) {
        setAuthErrorMessage(res.error || 'Registration failed. Please try again.');
      } else {
        if (res.message) {
          setAuthSuccessMessage(
            `${res.message} If Supabase email confirmation is required, please check your inbox to activate your account, then log in above.`
          );
        } else {
          // Immediate session established
          setAuthSuccessMessage('Account created and logged in successfully!');
        }
      }
    } catch (err: any) {
      setAuthErrorMessage(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setIsAuthSubmitting(false);
    }
  };

  // While verifying persistent session from Supabase on mount/refresh
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto bg-[#0a0a0a]/50 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl text-white font-sans p-16 text-center select-none flex flex-col items-center justify-center min-h-[360px]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400 mb-4" />
        <span className="font-serif text-sm tracking-[0.2em] uppercase text-white/70">
          Loading Profile...
        </span>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 1. VISITOR IS LOGGED OUT: Render Inline Login & Registration in Profile
  // ---------------------------------------------------------------------------
  if (!user) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl text-white font-sans overflow-hidden">
        
        {/* Header Header Banner */}
        <div className="p-8 md:p-10 border-b border-white/5 text-center relative bg-gradient-to-b from-white/[0.03] to-transparent">
          <div className="w-16 h-16 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center mx-auto mb-4 text-white/60 shadow-inner">
            <UserSquare2 className="w-8 h-8 stroke-[1.2]" />
          </div>
          <h2 className="text-2xl font-light tracking-wide text-white mb-2">
            Sana Arts Profile Portal
          </h2>
          <p className="text-xs text-white/40 max-w-md mx-auto leading-relaxed">
            Sign in to view your collected artworks, manage creator commissions, and personalize your account profile.
          </p>

          {/* Mode Tabs: Log In vs Create Account */}
          <div className="flex justify-center mt-6">
            <div className="inline-flex p-1 rounded-xl bg-black/60 border border-white/10 select-none">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthErrorMessage(null);
                  setAuthSuccessMessage(null);
                }}
                className={`px-6 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
                  authMode === 'login'
                    ? 'bg-[#C85A32] text-white shadow-md'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setAuthErrorMessage(null);
                  setAuthSuccessMessage(null);
                }}
                className={`px-6 py-2 rounded-lg text-xs font-bold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-2 ${
                  authMode === 'signup'
                    ? 'bg-[#C85A32] text-white shadow-md'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </button>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-10">
          
          {/* Error Feedback */}
          {authErrorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-3 backdrop-blur-md">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                {authErrorMessage}
              </div>
            </div>
          )}

          {/* Success Feedback */}
          {authSuccessMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-3 backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                {authSuccessMessage}
              </div>
            </div>
          )}

          {/* TAB 1: LOG IN FORM */}
          {authMode === 'login' ? (
            <form onSubmit={handleInlineLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-medium uppercase tracking-widest text-white/50 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="your-email@example.com"
                    disabled={isAuthSubmitting}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-black/40 hover:border-white/20 focus:border-white/40 text-sm text-white placeholder-white/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-mono font-medium uppercase tracking-widest text-white/50">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => onNavigate?.('ForgotPassword')}
                    className="text-[11px] font-mono text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••••••"
                    disabled={isAuthSubmitting}
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-white/10 bg-black/40 hover:border-white/20 focus:border-white/40 text-sm text-white placeholder-white/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthSubmitting}
                className="w-full py-3 px-6 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold uppercase tracking-[0.15em] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 select-none shadow-md mt-2"
              >
                {isAuthSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Log In to Profile</span>
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-white/5 text-center flex items-center justify-between text-xs text-white/40">
                <span>Need a full screen?</span>
                <button
                  type="button"
                  onClick={() => onNavigate?.('Login')}
                  className="text-amber-400 hover:text-amber-300 font-mono inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Full Login Page</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </form>
          ) : (
            /* TAB 2: CREATE ACCOUNT FORM */
            <form onSubmit={handleInlineSignUp} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-medium uppercase tracking-widest text-white/50 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={authFullName}
                    onChange={(e) => setAuthFullName(e.target.value)}
                    placeholder="e.g. Maya Lin"
                    disabled={isAuthSubmitting}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-black/40 hover:border-white/20 focus:border-white/40 text-sm text-white placeholder-white/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-medium uppercase tracking-widest text-white/50 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="your-email@example.com"
                    disabled={isAuthSubmitting}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-black/40 hover:border-white/20 focus:border-white/40 text-sm text-white placeholder-white/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Account Type Radio Selector */}
              <div>
                <label className="block text-[11px] font-mono font-medium uppercase tracking-widest text-white/50 mb-1.5">
                  Account Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAuthAccountType('lover')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer text-center ${
                      authAccountType === 'lover'
                        ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                        : 'border-white/10 bg-black/30 text-white/50 hover:border-white/20'
                    }`}
                  >
                    Art Collector
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthAccountType('artist')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer text-center ${
                      authAccountType === 'artist'
                        ? 'border-amber-400 bg-amber-400/10 text-amber-300'
                        : 'border-white/10 bg-black/30 text-white/50 hover:border-white/20'
                    }`}
                  >
                    Artist / Creator
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-medium uppercase tracking-widest text-white/50 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="••••••••••••"
                    disabled={isAuthSubmitting}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/40 hover:border-white/20 focus:border-white/40 text-sm text-white placeholder-white/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-medium uppercase tracking-widest text-white/50 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={authConfirmPassword}
                    onChange={(e) => setAuthConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    disabled={isAuthSubmitting}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/40 hover:border-white/20 focus:border-white/40 text-sm text-white placeholder-white/20 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthSubmitting}
                className="w-full py-3 px-6 rounded-xl bg-[#C85A32] hover:bg-[#B34D27] text-white text-xs font-bold uppercase tracking-[0.15em] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 select-none shadow-md mt-2"
              >
                {isAuthSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create & Open Profile</span>
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-white/5 text-center flex items-center justify-between text-xs text-white/40">
                <span>Prefer dedicated page?</span>
                <button
                  type="button"
                  onClick={() => onNavigate?.('SignUp')}
                  className="text-amber-400 hover:text-amber-300 font-mono inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Full Sign Up Page</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. USER IS AUTHENTICATED: Display Live Account Profile
  // ---------------------------------------------------------------------------
  const displayName = profile?.fullName || user.user_metadata?.full_name || 'Art Collector';
  const email = profile?.email || user.email || '';
  const username = email ? email.split('@')[0] : 'collector';
  const accountType = profile?.accountType || user.user_metadata?.account_type || 'lover';
  const avatarUrl = profile?.avatarUrl || user.user_metadata?.avatar_url || null;

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#0a0a0a]/50 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl text-white font-sans pb-16 overflow-hidden">
      
      {/* 1. Profile Header Section */}
      <div className="px-6 py-10 md:px-12 md:py-12 border-b border-white/5 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16">
        
        {/* Profile Picture Placeholder / Avatar */}
        <div className="relative flex-shrink-0 select-none">
          <div 
            onClick={() => setIsEditModalOpen(true)}
            className="w-24 h-24 md:w-36 md:h-36 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center text-white/40 shadow-inner relative group cursor-pointer hover:bg-white/[0.05] transition-colors overflow-hidden"
            title="Update Profile Picture"
          >
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={displayName} 
                className="w-full h-full object-cover rounded-full" 
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-500/10 to-[#C85A32]/10">
                <span className="text-3xl md:text-5xl font-serif text-white/80 font-light select-none">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Camera className="w-6 h-6 stroke-[1.5]" />
            </div>

            <div className="absolute bottom-1 right-1 w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#0095F6] hover:bg-[#1877F2] text-white flex items-center justify-center shadow transition-colors border border-black">
              <Plus className="w-3.5 h-3.5 md:w-5 md:h-5 stroke-[2.5]" />
            </div>
          </div>
        </div>

        {/* Profile Info Details */}
        <div className="flex-1 flex flex-col gap-4 text-center md:text-left w-full">
          
          {/* Row 1: Name, Role Badge, and Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-light tracking-wide text-white uppercase">
                {displayName}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/25 uppercase">
                {accountType === 'artist' ? 'Artist' : 'Art Collector'}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-center sm:justify-start">
              <button 
                onClick={() => onNavigate ? onNavigate('Chat') : null}
                className="px-4 py-1.5 bg-[#0095F6] hover:bg-[#1877F2] text-xs font-bold rounded-lg cursor-pointer transition-colors text-white inline-flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Direct Messages</span>
              </button>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-lg cursor-pointer transition-colors text-white"
              >
                Edit Profile
              </button>
              <button 
                onClick={handleCopyLink}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-lg cursor-pointer transition-colors text-white inline-flex items-center justify-center gap-1.5"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                <span>{copiedLink ? 'Link Copied' : 'Share Profile'}</span>
              </button>
              <button 
                onClick={signOut}
                className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-bold rounded-lg cursor-pointer transition-colors inline-flex items-center justify-center gap-1.5 border border-rose-500/20"
                title="Sign Out of Supabase"
              >
                <span>Sign Out</span>
              </button>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="p-1.5 hover:bg-white/10 rounded-full text-white/80 hover:text-white cursor-pointer"
                title="Options"
              >
                <Settings className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>
          </div>

          {/* Row 2: Statistics */}
          <div className="flex justify-center md:justify-start gap-8 md:gap-10 border-y sm:border-y-0 border-white/5 py-3 sm:py-0 text-sm select-none">
            <div>
              <span className="font-semibold text-white">0</span> <span className="text-white/60">posts</span>
            </div>
            <div>
              <span className="font-semibold text-white">0</span> <span className="text-white/60">followers</span>
            </div>
            <div>
              <span className="font-semibold text-white">0</span> <span className="text-white/60">following</span>
            </div>
            <div>
              <span className="font-semibold text-white">0</span> <span className="text-white/60">artworks</span>
            </div>
            <div>
              <span className="font-semibold text-white">0</span> <span className="text-white/60">likes</span>
            </div>
          </div>

          {/* Row 3: Username, Email & User ID */}
          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="font-semibold text-white/50">@{username}</span>
              <span className="inline-flex items-center gap-1 text-xs text-white/40">
                <Mail className="w-3 h-3 text-white/30" />
                <span>{email}</span>
              </span>
            </div>

            {/* User Bio */}
            {profile?.bio ? (
              <p className="text-xs text-white/70 max-w-lg mt-1 font-light leading-relaxed">
                {profile.bio}
              </p>
            ) : null}

            {/* Supabase Authenticated UUID Badge */}
            <div className="mt-2 flex items-center justify-center md:justify-start gap-2">
              <button
                onClick={handleCopyId}
                title="Click to copy Supabase User UUID"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-[10px] font-mono text-white/40 hover:text-white/70 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3 h-3 text-amber-400/70" />
                <span>UUID:</span>
                <span className="max-w-[150px] truncate">{user.id}</span>
                {copiedId ? (
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                ) : (
                  <Copy className="w-2.5 h-2.5 text-white/30" />
                )}
              </button>
              {isProfileLoading && (
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400/60">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Syncing...</span>
                </span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 2. Instagram Tab Controls */}
      <div className="flex justify-center border-b border-white/5 text-xs font-semibold select-none text-white/40 gap-12">
        <button
          onClick={() => setActiveTab('posts')}
          className={`py-4 cursor-pointer transition-colors flex items-center gap-1.5 border-t-2 -mt-[2px] ${
            activeTab === 'posts' 
              ? 'border-white text-white font-bold' 
              : 'border-transparent hover:text-white'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span className="uppercase tracking-widest text-[10px]">Posts</span>
        </button>

        <button
          onClick={() => setActiveTab('artworks')}
          className={`py-4 cursor-pointer transition-colors flex items-center gap-1.5 border-t-2 -mt-[2px] ${
            activeTab === 'artworks' 
              ? 'border-white text-white font-bold' 
              : 'border-transparent hover:text-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span className="uppercase tracking-widest text-[10px]">Artworks</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`py-4 cursor-pointer transition-colors flex items-center gap-1.5 border-t-2 -mt-[2px] ${
            activeTab === 'saved' 
              ? 'border-white text-white font-bold' 
              : 'border-transparent hover:text-white'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span className="uppercase tracking-widest text-[10px]">Saved</span>
        </button>

        <button
          onClick={() => setActiveTab('tagged')}
          className={`py-4 cursor-pointer transition-colors flex items-center gap-1.5 border-t-2 -mt-[2px] ${
            activeTab === 'tagged' 
              ? 'border-white text-white font-bold' 
              : 'border-transparent hover:text-white'
          }`}
        >
          <UserSquare2 className="w-3.5 h-3.5" />
          <span className="uppercase tracking-widest text-[10px]">Tagged</span>
        </button>
      </div>

      {/* 3. Empty Artwork Area */}
      <div className="py-24 px-6 text-center select-none">
        <div className="w-16 h-16 rounded-full border border-white/20 border-dashed flex items-center justify-center mx-auto mb-4 text-white/60">
          <ImageIcon className="w-7 h-7 stroke-[1.2]" />
        </div>
        <h3 className="text-xl font-light text-white/90 mb-1">No posts yet</h3>
        <p className="text-xs text-white/40 max-w-xs mx-auto mb-6">
          Your uploaded artworks and curated collections will appear here.
        </p>
        <button 
          onClick={() => onNavigate?.('Gallery')}
          className="px-5 py-2.5 bg-[#C85A32] hover:bg-[#B34D27] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm tracking-wider uppercase"
        >
          Explore Gallery Exhibits
        </button>
      </div>

      {/* 4. Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0e0e0e] border border-white/10 rounded-2xl p-6 text-white shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-medium text-sm tracking-wider uppercase text-white">Edit Profile Details</h3>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full text-white/50 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1">
                  Full Name
                </label>
                <input 
                  type="text" 
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white placeholder-white/30 outline-none focus:border-amber-400/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1">
                  Avatar / Profile Picture URL
                </label>
                <input 
                  type="url" 
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-3.5 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white placeholder-white/30 outline-none focus:border-amber-400/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1">
                  Bio / Artist Statement
                </label>
                <textarea 
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell collectors and art enthusiasts about your practice..."
                  className="w-full px-3.5 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white placeholder-white/30 outline-none focus:border-amber-400/50 transition-colors resize-none"
                />
              </div>

              {saveStatus && (
                <div className="text-xs p-2.5 rounded bg-white/5 border border-white/10 text-amber-200">
                  {saveStatus}
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg text-xs font-bold bg-[#C85A32] hover:bg-[#B34D27] text-white cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
