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
  ExternalLink,
  MessageCircle,
  UserCheck,
  ArrowLeft,
  Activity,
  Users,
  Trash2,
  Edit3,
  Upload as UploadIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { FollowListModal } from './FollowListModal';
import { EditArtworkModal } from './EditArtworkModal';
import { ArtworkDetailModal } from './ArtworkDetailModal';
import { 
  fetchUserProfile, 
  UserProfile 
} from '../lib/supabase';
import { 
  fetchFollowStats, 
  FollowStats, 
  deriveUsername 
} from '../lib/social';
import { 
  fetchArtworksByArtist, 
  deleteArtwork, 
  Artwork 
} from '../lib/artworks';
import { SocialAuthButtons } from './auth/SocialAuthButtons';

interface ProfilePageProps {
  onNavigate?: (tab: string) => void;
  targetUserId?: string | null;
  onOpenChat?: (userId: string, userName?: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ 
  onNavigate,
  targetUserId: propTargetUserId,
  onOpenChat
}) => {
  const { 
    user, 
    profile, 
    isLoading, 
    isProfileLoading, 
    isConfigured,
    updateProfile, 
    signOut, 
    signIn, 
    signUp,
    signInWithProvider
  } = useAuth();

  const {
    isUserOnline,
    getUserStatusText,
    isFollowing,
    toggleFollow,
    targetProfileId,
    setTargetProfileId,
    openChatWithUser
  } = useSocial();
  
  // Resolve active profile ID being viewed (prop or context)
  const activeTargetId = propTargetUserId || targetProfileId;
  const isViewingOther = Boolean(activeTargetId && activeTargetId !== user?.id);

  const [otherProfile, setOtherProfile] = useState<UserProfile | null>(null);
  const [isLoadingOtherProfile, setIsLoadingOtherProfile] = useState<boolean>(false);

  // Follow statistics
  const [followStats, setFollowStats] = useState<FollowStats>({
    followersCount: 0,
    followingCount: 0,
    isFollowing: false
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isTogglingFollow, setIsTogglingFollow] = useState(false);

  // Follow List Modal State
  const [followModalOpen, setFollowModalOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState<'Followers' | 'Following'>('Followers');

  const [activeTab, setActiveTab] = useState<'posts' | 'artworks' | 'saved' | 'tagged'>('artworks');

  // Artwork Gallery State
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoadingArtworks, setIsLoadingArtworks] = useState<boolean>(false);
  const [selectedArtworkForDetail, setSelectedArtworkForDetail] = useState<Artwork | null>(null);
  const [selectedArtworkForEdit, setSelectedArtworkForEdit] = useState<Artwork | null>(null);
  const [deletingArtworkId, setDeletingArtworkId] = useState<string | null>(null);
  
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
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [socialProvider, setSocialProvider] = useState<'google' | 'facebook' | null>(null);

  const handleSocialAuth = async (provider: 'google' | 'facebook') => {
    setAuthErrorMessage(null);
    setAuthSuccessMessage(null);

    if (!isConfigured) {
      setAuthErrorMessage(
        `Supabase authentication is not configured yet. Configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY, and enable the ${
          provider === 'google' ? 'Google' : 'Facebook'
        } OAuth provider.`
      );
      return;
    }

    setIsSocialLoading(true);
    setSocialProvider(provider);
    try {
      const res = await signInWithProvider(provider);
      if (!res.success) {
        setAuthErrorMessage(res.error || `Failed to initiate ${provider} authentication.`);
        setIsSocialLoading(false);
        setSocialProvider(null);
      }
    } catch (err: any) {
      setAuthErrorMessage(err.message || 'OAuth error occurred.');
      setIsSocialLoading(false);
      setSocialProvider(null);
    }
  };

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [editShowOnline, setEditShowOnline] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Feedback states
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Sync edit form with profile data
  useEffect(() => {
    if (user && !isViewingOther) {
      setEditFullName(profile?.fullName || user.user_metadata?.full_name || '');
      setEditUsername(profile?.username || (user.email ? user.email.split('@')[0] : 'creator'));
      setEditBio(profile?.bio || '');
      setEditAvatarUrl(profile?.avatarUrl || user.user_metadata?.avatar_url || '');
      setEditShowOnline(profile?.showOnlineStatus !== false);
    }
  }, [profile, user, isEditModalOpen, isViewingOther]);

  // Load target user's profile if viewing another user
  useEffect(() => {
    if (!isViewingOther || !activeTargetId) {
      setOtherProfile(null);
      return;
    }

    let isMounted = true;
    setIsLoadingOtherProfile(true);

    const loadOther = async () => {
      try {
        const res = await fetchUserProfile(activeTargetId);
        if (isMounted && res.data) {
          setOtherProfile(res.data);
        }
      } catch (err) {
        console.error('Error fetching target profile:', err);
      } finally {
        if (isMounted) {
          setIsLoadingOtherProfile(false);
        }
      }
    };

    loadOther();

    return () => {
      isMounted = false;
    };
  }, [activeTargetId, isViewingOther]);

  // Load follow stats for currently viewed profile (either own or target)
  const targetIdForStats = isViewingOther ? activeTargetId : user?.id;

  const loadFollowStats = async () => {
    if (!targetIdForStats) return;
    setIsLoadingStats(true);
    try {
      const stats = await fetchFollowStats(targetIdForStats, user?.id);
      setFollowStats(stats);
    } catch (err) {
      console.error('Failed to load follow stats:', err);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const loadArtworks = async () => {
    if (!targetIdForStats) {
      setArtworks([]);
      return;
    }
    setIsLoadingArtworks(true);
    try {
      const { data, error } = await fetchArtworksByArtist(targetIdForStats);
      if (!error) {
        setArtworks(data || []);
      }
    } catch (err) {
      console.error('Failed to load artist artworks:', err);
    } finally {
      setIsLoadingArtworks(false);
    }
  };

  useEffect(() => {
    loadFollowStats();
    loadArtworks();
  }, [targetIdForStats, user?.id]);

  const handleDeleteArtwork = async (art: Artwork) => {
    setDeletingArtworkId(art.id);
    const res = await deleteArtwork(art.id, art.imagePath);
    setDeletingArtworkId(null);
    if (res.success) {
      setArtworks((prev) => prev.filter((a) => a.id !== art.id));
    } else {
      alert(res.error?.message || 'Failed to delete artwork.');
    }
  };

  const handleUpdateArtworkSuccess = (updated: Artwork) => {
    setArtworks((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  // Keep follow state in sync with global context
  useEffect(() => {
    if (isViewingOther && activeTargetId) {
      setFollowStats((prev) => ({
        ...prev,
        isFollowing: isFollowing(activeTargetId)
      }));
    }
  }, [isViewingOther, activeTargetId, isFollowing]);

  const handleToggleFollow = async () => {
    if (!activeTargetId) return;
    if (!user) {
      alert('Please log in or create an account to follow creators.');
      return;
    }

    setIsTogglingFollow(true);
    const nextState = !followStats.isFollowing;

    // Optimistic update of stats
    setFollowStats((prev) => ({
      ...prev,
      isFollowing: nextState,
      followersCount: Math.max(0, prev.followersCount + (nextState ? 1 : -1))
    }));

    const res = await toggleFollow(activeTargetId);
    setIsTogglingFollow(false);

    if (!res.success) {
      // Revert if failed
      setFollowStats((prev) => ({
        ...prev,
        isFollowing: !nextState,
        followersCount: Math.max(0, prev.followersCount + (!nextState ? 1 : -1))
      }));
    }
  };

  const handleOpenChat = () => {
    if (!activeTargetId) return;
    const participantName = otherProfile?.fullName || 'Sana Artist';

    if (onOpenChat) {
      onOpenChat(activeTargetId, participantName);
    } else {
      openChatWithUser(activeTargetId, participantName);
    }

    if (onNavigate) {
      onNavigate('Chat');
    }
  };

  const handleCopyLink = () => {
    const url = isViewingOther && activeTargetId
      ? `${window.location.origin}/profile?id=${activeTargetId}`
      : `${window.location.origin}/profile`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyId = () => {
    const idToCopy = isViewingOther && activeTargetId ? activeTargetId : user?.id;
    if (!idToCopy) return;
    navigator.clipboard.writeText(idToCopy);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);

    const res = await updateProfile({
      fullName: editFullName.trim(),
      username: editUsername.trim(),
      bio: editBio.trim() || null,
      avatarUrl: editAvatarUrl.trim() || null,
      showOnlineStatus: editShowOnline
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
            ? 'Invalid email or password. Please verify your credentials.'
            : (res.error || 'Failed to log in.')
        );
      } else {
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
          setAuthSuccessMessage(res.message);
        } else {
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
  if (isLoading || (isViewingOther && isLoadingOtherProfile)) {
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
  // 1. VISITOR IS LOGGED OUT & NOT VIEWING ANOTHER USER: Inline Login / Signup
  // ---------------------------------------------------------------------------
  if (!user && !isViewingOther) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl text-white font-sans overflow-hidden">
        
        {/* Header Banner */}
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
          {authErrorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-3 backdrop-blur-md">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{authErrorMessage}</div>
            </div>
          )}

          {authSuccessMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-3 backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{authSuccessMessage}</div>
            </div>
          )}

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
                disabled={isAuthSubmitting || isSocialLoading}
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

              {/* Divider */}
              <div className="relative my-5 flex items-center justify-center">
                <div className="border-t border-white/10 w-full" />
                <span className="bg-[#0a0a0a] px-3 text-[10px] font-mono uppercase tracking-widest text-white/40 absolute">
                  or continue with
                </span>
              </div>

              {/* Social Logins */}
              <SocialAuthButtons 
                onSelectProvider={handleSocialAuth}
                isLoading={isSocialLoading}
                loadingProvider={socialProvider}
                disabled={isAuthSubmitting}
              />

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
                disabled={isAuthSubmitting || isSocialLoading}
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

              {/* Divider */}
              <div className="relative my-5 flex items-center justify-center">
                <div className="border-t border-white/10 w-full" />
                <span className="bg-[#0a0a0a] px-3 text-[10px] font-mono uppercase tracking-widest text-white/40 absolute">
                  or sign up with
                </span>
              </div>

              {/* Social Registration */}
              <SocialAuthButtons 
                onSelectProvider={handleSocialAuth}
                isLoading={isSocialLoading}
                loadingProvider={socialProvider}
                disabled={isAuthSubmitting}
              />

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
  // 2. ACTIVE PROFILE DISPLAY (Current User or Another User)
  // ---------------------------------------------------------------------------
  const activeProfile = isViewingOther ? otherProfile : profile;
  const currentDisplayedId = isViewingOther ? activeTargetId : user?.id;

  const displayName = 
    activeProfile?.fullName || 
    (!isViewingOther ? user?.user_metadata?.full_name : 'Sana Creator') || 
    'Sana Artist';

  const email = !isViewingOther ? (activeProfile?.email || user?.email || '') : '';
  const username = deriveUsername({
    username: activeProfile?.username,
    email: !isViewingOther ? email : undefined,
    full_name: displayName
  });

  const accountType = 
    activeProfile?.accountType || 
    (!isViewingOther ? user?.user_metadata?.account_type : 'artist') || 
    'lover';

  const avatarUrl = 
    activeProfile?.avatarUrl || 
    (!isViewingOther ? user?.user_metadata?.avatar_url : null) || 
    null;

  const isTargetOnline = isUserOnline(currentDisplayedId);
  const statusText = getUserStatusText(currentDisplayedId, activeProfile?.lastSeenAt);

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#0a0a0a]/50 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl text-white font-sans pb-16 overflow-hidden">
      
      {/* Back button if viewing another user */}
      {isViewingOther && (
        <div className="px-6 pt-6 flex items-center justify-between border-b border-white/5 pb-4">
          <button
            onClick={() => setTargetProfileId(null)}
            className="inline-flex items-center gap-2 text-xs font-mono tracking-wider text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>RETURN TO MY PROFILE</span>
          </button>
          
          <div className="flex items-center gap-2 text-xs text-white/40">
            <span>Viewing artist exhibit</span>
          </div>
        </div>
      )}

      {/* 1. Profile Header Section */}
      <div className="px-6 py-8 md:px-12 md:py-10 border-b border-white/5 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-14">
        
        {/* Profile Picture Placeholder / Avatar with Presence Indicator */}
        <div className="relative flex-shrink-0 select-none">
          <div 
            onClick={() => {
              if (!isViewingOther) setIsEditModalOpen(true);
            }}
            className={`w-24 h-24 md:w-36 md:h-36 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center text-white/40 shadow-inner relative group ${
              !isViewingOther ? 'cursor-pointer hover:bg-white/[0.05]' : ''
            } transition-colors overflow-hidden`}
            title={!isViewingOther ? 'Update Profile Picture' : displayName}
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

            {!isViewingOther && (
              <>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera className="w-6 h-6 stroke-[1.5]" />
                </div>
                <div className="absolute bottom-1 right-1 w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#0095F6] hover:bg-[#1877F2] text-white flex items-center justify-center shadow transition-colors border border-black">
                  <Plus className="w-3.5 h-3.5 md:w-5 md:h-5 stroke-[2.5]" />
                </div>
              </>
            )}
          </div>

          {/* Large Online Indicator Badge */}
          {isTargetOnline && (
            <span
              className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-black ring-2 ring-emerald-400/40 animate-pulse"
              title="Active now"
            />
          )}
        </div>

        {/* Profile Info Details */}
        <div className="flex-1 flex flex-col gap-4 text-center md:text-left w-full">
          
          {/* Row 1: Name, Role Badge, Online Status, and Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-light tracking-wide text-white uppercase">
                {displayName}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/25 uppercase">
                {accountType === 'artist' ? 'Artist' : 'Art Collector'}
              </span>
            </div>

            {/* Online Status Pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/5 text-[11px] font-mono">
              <span className={`w-2 h-2 rounded-full ${isTargetOnline ? 'bg-emerald-400 animate-pulse' : 'bg-white/20'}`} />
              <span className={isTargetOnline ? 'text-emerald-400 font-medium' : 'text-white/40'}>
                {statusText}
              </span>
            </div>
            
            {/* ACTION BUTTONS */}
            <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-center sm:justify-start">
              {isViewingOther ? (
                <>
                  {/* Follow Button */}
                  <button
                    onClick={handleToggleFollow}
                    disabled={isTogglingFollow}
                    className={`px-5 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-all inline-flex items-center justify-center gap-1.5 shadow-sm ${
                      followStats.isFollowing
                        ? 'bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 text-white/90 border border-white/10'
                        : 'bg-[#C85A32] hover:bg-[#B34D27] text-white'
                    }`}
                  >
                    {isTogglingFollow ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : followStats.isFollowing ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>

                  {/* Message Button */}
                  <button
                    onClick={handleOpenChat}
                    className="px-4 py-1.5 bg-[#0095F6] hover:bg-[#1877F2] text-xs font-bold rounded-lg cursor-pointer transition-colors text-white inline-flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </button>

                  {/* Share Profile */}
                  <button 
                    onClick={handleCopyLink}
                    className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-lg cursor-pointer transition-colors text-white inline-flex items-center justify-center gap-1.5"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                    <span>{copiedLink ? 'Link Copied' : 'Share'}</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Own Profile Actions */}
                  <button 
                    onClick={() => onNavigate ? onNavigate('Upload') : null}
                    className="px-4 py-1.5 bg-[#C85A32] hover:bg-[#B34D27] text-xs font-bold rounded-lg cursor-pointer transition-colors text-white inline-flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Upload Artwork</span>
                  </button>
                  <button 
                    onClick={() => onNavigate ? onNavigate('Chat') : null}
                    className="px-4 py-1.5 bg-[#0095F6] hover:bg-[#1877F2] text-xs font-bold rounded-lg cursor-pointer transition-colors text-white inline-flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
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
                    <span>{copiedLink ? 'Link Copied' : 'Share'}</span>
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
                </>
              )}
            </div>
          </div>

          {/* Row 2: Statistics (Clickable Followers & Following!) */}
          <div className="flex justify-center md:justify-start gap-8 md:gap-10 border-y sm:border-y-0 border-white/5 py-3 sm:py-0 text-sm select-none">
            <div>
              <span className="font-semibold text-white">{artworks.length}</span> <span className="text-white/60">posts</span>
            </div>
            
            {/* Followers counter - Click to open modal */}
            <button
              type="button"
              onClick={() => {
                setFollowModalType('Followers');
                setFollowModalOpen(true);
              }}
              className="hover:text-amber-300 transition-colors cursor-pointer text-left"
              title="Click to view followers"
            >
              <span className="font-semibold text-white group-hover:text-amber-300">
                {followStats.followersCount}
              </span>{' '}
              <span className="text-white/60 hover:text-white underline-offset-4 hover:underline">
                followers
              </span>
            </button>

            {/* Following counter - Click to open modal */}
            <button
              type="button"
              onClick={() => {
                setFollowModalType('Following');
                setFollowModalOpen(true);
              }}
              className="hover:text-amber-300 transition-colors cursor-pointer text-left"
              title="Click to view following"
            >
              <span className="font-semibold text-white">
                {followStats.followingCount}
              </span>{' '}
              <span className="text-white/60 hover:text-white underline-offset-4 hover:underline">
                following
              </span>
            </button>

            <div>
              <span className="font-semibold text-white">{artworks.length}</span> <span className="text-white/60">artworks</span>
            </div>
          </div>

          {/* Row 3: Username, Email & User ID */}
          <div className="flex flex-col gap-1.5 text-sm">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="font-semibold text-white/50 font-mono">@{username}</span>
              {email ? (
                <span className="inline-flex items-center gap-1 text-xs text-white/40">
                  <Mail className="w-3 h-3 text-white/30" />
                  <span>{email}</span>
                </span>
              ) : null}
            </div>

            {/* User Bio */}
            {activeProfile?.bio ? (
              <p className="text-xs text-white/70 max-w-lg mt-1 font-light leading-relaxed">
                {activeProfile.bio}
              </p>
            ) : null}

            {/* Supabase Authenticated UUID Badge */}
            <div className="mt-2 flex items-center justify-center md:justify-start gap-2">
              <button
                onClick={handleCopyId}
                title="Click to copy User UUID"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-[10px] font-mono text-white/40 hover:text-white/70 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3 h-3 text-amber-400/70" />
                <span>UUID:</span>
                <span className="max-w-[150px] truncate">{currentDisplayedId}</span>
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
      <div className="flex justify-center border-b border-white/5 text-xs font-semibold select-none text-white/40 gap-8 sm:gap-12">
        <button
          onClick={() => setActiveTab('artworks')}
          className={`py-4 cursor-pointer transition-colors flex items-center gap-1.5 border-t-2 -mt-[2px] ${
            activeTab === 'artworks' 
              ? 'border-white text-white font-bold' 
              : 'border-transparent hover:text-white'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span className="uppercase tracking-widest text-[10px]">Artworks ({artworks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('posts')}
          className={`py-4 cursor-pointer transition-colors flex items-center gap-1.5 border-t-2 -mt-[2px] ${
            activeTab === 'posts' 
              ? 'border-white text-white font-bold' 
              : 'border-transparent hover:text-white'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span className="uppercase tracking-widest text-[10px]">Exhibits</span>
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

      {/* 3. Tab Content Area */}
      {activeTab === 'artworks' || activeTab === 'posts' ? (
        isLoadingArtworks ? (
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400 mb-3" />
            <span className="text-xs font-mono tracking-widest text-white/50 uppercase">
              Loading Artworks...
            </span>
          </div>
        ) : artworks.length > 0 ? (
          <div className="p-4 sm:p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/5">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase font-bold block">
                  {isViewingOther ? `${displayName}'s Published Collection` : 'My Artwork Gallery'}
                </span>
                <h3 className="font-serif text-lg text-white font-medium">
                  Available & Exhibited Artworks ({artworks.length})
                </h3>
              </div>
              
              {!isViewingOther && (
                <button
                  onClick={() => onNavigate?.('Upload')}
                  className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload Artwork</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {artworks.map((art) => {
                const isOwner = !isViewingOther && user?.id === art.artistId;
                return (
                  <div
                    key={art.id}
                    className="group relative bg-[#0e0e0e]/90 border border-white/10 hover:border-white/25 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col justify-between"
                  >
                    {/* Card Image */}
                    <div 
                      onClick={() => setSelectedArtworkForDetail(art)}
                      className="aspect-[4/3] bg-black/60 relative overflow-hidden cursor-pointer select-none"
                    >
                      <img 
                        src={art.imageUrl} 
                        alt={art.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />

                      {/* Hover Backdrop Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                          <Eye className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Status Pill Badge */}
                      <div className="absolute top-2.5 right-2.5">
                        <span className={`text-[9px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-full backdrop-blur-md ${
                          art.status === 'Available'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                        }`}>
                          {art.status}
                        </span>
                      </div>

                      {/* Category Tag */}
                      <div className="absolute bottom-2.5 left-2.5">
                        <span className="text-[9px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-white/70">
                          {art.category}
                        </span>
                      </div>
                    </div>

                    {/* Card Info */}
                    <div className="p-4 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 
                          onClick={() => setSelectedArtworkForDetail(art)}
                          className="font-serif text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate cursor-pointer"
                          title={art.title}
                        >
                          {art.title}
                        </h4>
                        <span className="font-serif font-bold text-sm text-white shrink-0">
                          ₹{art.price.toLocaleString()}
                        </span>
                      </div>

                      {art.description && (
                        <p className="text-[11px] text-white/50 line-clamp-2 font-light leading-relaxed">
                          {art.description}
                        </p>
                      )}

                      {/* Owner Actions (Edit & Delete) or Visitor Action */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs mt-1">
                        {isOwner ? (
                          <div className="flex items-center gap-2 w-full justify-end">
                            <button
                              type="button"
                              onClick={() => setSelectedArtworkForEdit(art)}
                              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px] font-mono"
                              title="Edit Artwork"
                            >
                              <Edit3 className="w-3 h-3 text-amber-400" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              disabled={deletingArtworkId === art.id}
                              onClick={() => {
                                if (window.confirm(`Delete "${art.title}" permanently?`)) {
                                  handleDeleteArtwork(art);
                                }
                              }}
                              className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px] font-mono border border-rose-500/20"
                              title="Delete Artwork"
                            >
                              {deletingArtworkId === art.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                              <span>Delete</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[10px] font-mono text-white/40">
                              {art.medium || 'Handmade Artwork'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedArtworkForDetail(art)}
                              className="text-[10px] font-mono uppercase tracking-wider text-amber-400 hover:text-amber-300 cursor-pointer"
                            >
                              View Details &rarr;
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-24 px-6 text-center select-none">
            <div className="w-16 h-16 rounded-full border border-white/20 border-dashed flex items-center justify-center mx-auto mb-4 text-white/60">
              <ImageIcon className="w-7 h-7 stroke-[1.2]" />
            </div>
            <h3 className="text-xl font-light text-white/90 mb-1">No artworks published yet</h3>
            <p className="text-xs text-white/40 max-w-xs mx-auto mb-6">
              {isViewingOther 
                ? `${displayName} has not published any artworks to their exhibit yet.`
                : 'Your uploaded artworks, drawings, and paintings will appear here in your curated gallery.'}
            </p>
            {!isViewingOther ? (
              <button 
                onClick={() => onNavigate?.('Upload')}
                className="px-6 py-2.5 bg-[#C85A32] hover:bg-[#B34D27] text-white text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-md tracking-wider uppercase inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Upload Your First Artwork</span>
              </button>
            ) : (
              <button 
                onClick={() => onNavigate?.('Gallery')}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors tracking-wider uppercase"
              >
                Explore Gallery Exhibits
              </button>
            )}
          </div>
        )
      ) : activeTab === 'saved' ? (
        <div className="py-24 px-6 text-center select-none">
          <div className="w-16 h-16 rounded-full border border-white/20 border-dashed flex items-center justify-center mx-auto mb-4 text-white/60">
            <Bookmark className="w-7 h-7 stroke-[1.2]" />
          </div>
          <h3 className="text-xl font-light text-white/90 mb-1">No saved artworks</h3>
          <p className="text-xs text-white/40 max-w-xs mx-auto mb-6">
            Save unique sketches, mandalas, or paintings while browsing the gallery to revisit them later.
          </p>
          <button 
            onClick={() => onNavigate?.('Gallery')}
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors tracking-wider uppercase"
          >
            Explore Gallery
          </button>
        </div>
      ) : (
        <div className="py-24 px-6 text-center select-none">
          <div className="w-16 h-16 rounded-full border border-white/20 border-dashed flex items-center justify-center mx-auto mb-4 text-white/60">
            <UserSquare2 className="w-7 h-7 stroke-[1.2]" />
          </div>
          <h3 className="text-xl font-light text-white/90 mb-1">No tagged photos</h3>
          <p className="text-xs text-white/40 max-w-xs mx-auto">
            When other collectors or artists tag {isViewingOther ? displayName : 'you'} in collaborative exhibits, they will appear here.
          </p>
        </div>
      )}

      {/* 4. Edit Profile Modal (Own Profile Only) */}
      {!isViewingOther && isEditModalOpen && (
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
                  Username (@handle)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 text-xs font-mono">@</span>
                  <input 
                    type="text" 
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                    placeholder="creator_handle"
                    className="w-full pl-8 pr-3.5 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white placeholder-white/30 outline-none focus:border-amber-400/50 transition-colors font-mono"
                  />
                </div>
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

              {/* Online Presence Privacy Toggle */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-medium text-white">Show Activity Status</span>
                  <span className="text-[11px] text-white/40 block leading-tight">
                    Allow others to see when you are currently online
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditShowOnline(!editShowOnline)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    editShowOnline ? 'bg-emerald-500' : 'bg-neutral-800'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                      editShowOnline ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
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

      {/* 5. Followers & Following Modal */}
      {followModalOpen && targetIdForStats && (
        <FollowListModal
          isOpen={followModalOpen}
          onClose={() => setFollowModalOpen(false)}
          targetUserId={targetIdForStats}
          title={followModalType}
          onSelectUser={(selectedId) => {
            if (selectedId === user?.id) {
              setTargetProfileId(null);
            } else {
              setTargetProfileId(selectedId);
            }
          }}
        />
      )}

      {/* 6. Edit Artwork Modal */}
      {selectedArtworkForEdit && (
        <EditArtworkModal
          artwork={selectedArtworkForEdit}
          isOpen={Boolean(selectedArtworkForEdit)}
          onClose={() => setSelectedArtworkForEdit(null)}
          onUpdateSuccess={(updated) => {
            handleUpdateArtworkSuccess(updated);
            if (selectedArtworkForDetail?.id === updated.id) {
              setSelectedArtworkForDetail(updated);
            }
          }}
        />
      )}

      {/* 7. Artwork Detail Preview Modal */}
      {selectedArtworkForDetail && (
        <ArtworkDetailModal
          artwork={selectedArtworkForDetail}
          isOpen={Boolean(selectedArtworkForDetail)}
          isOwner={!isViewingOther && user?.id === selectedArtworkForDetail.artistId}
          artistName={displayName}
          onClose={() => setSelectedArtworkForDetail(null)}
          onEdit={(art) => setSelectedArtworkForEdit(art)}
          onDelete={(art) => handleDeleteArtwork(art)}
          onOpenChat={() => {
            if (onOpenChat && activeTargetId) {
              onOpenChat(activeTargetId, displayName);
            }
          }}
        />
      )}

    </div>
  );
};

