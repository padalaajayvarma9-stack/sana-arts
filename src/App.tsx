import React, { useState, useEffect } from 'react';
import { ThreeCanvas } from './components/ThreeCanvas';
import { Sections } from './components/Sections';
import { GalleryPage } from './components/GalleryPage';
import { ChatPage } from './components/ChatPage';
import { ProfilePage } from './components/ProfilePage';
import { LoginPage } from './components/auth/LoginPage';
import { SignUpPage } from './components/auth/SignUpPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocialProvider, useSocial } from './context/SocialContext';
import { AccountSearchModal } from './components/AccountSearchModal';
import { 
  Sparkles, 
  Search, 
  Bell, 
  MessageCircle, 
  Heart, 
  ShoppingCart, 
  User as UserIcon,
  LogOut
} from 'lucide-react';

const isPageReload = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    const navEntries = window.performance?.getEntriesByType?.('navigation');
    if (navEntries && navEntries.length > 0) {
      if ((navEntries[0] as PerformanceNavigationTiming).type === 'reload') {
        return true;
      }
    }
    if ((window.performance as any)?.navigation?.type === 1) {
      return true;
    }
    if (window.sessionStorage?.getItem('sana_was_reloaded') === 'true') {
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

const getTabFromPath = (path: string): string => {
  const cleanPath = path.toLowerCase().replace(/\/+$/, '') || '/';
  if (cleanPath === '/gallery') return 'Gallery';
  if (cleanPath === '/chat') return 'Chat';
  if (cleanPath === '/profile') return 'Profile';
  if (cleanPath === '/login' || cleanPath === '/signin') return 'Login';
  if (cleanPath === '/signup' || cleanPath === '/register') return 'SignUp';
  if (cleanPath === '/forgot-password' || cleanPath === '/reset-password') return 'ForgotPassword';
  return 'Home';
};

function AppContent() {
  const { user, profile, signOut } = useAuth();
  const { 
    targetProfileId, 
    setTargetProfileId, 
    openUserProfile, 
    openChatWithUser 
  } = useSocial();
  const [scrollFraction, setScrollFraction] = useState(0);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      // Disable automatic browser scroll restoration so it never jumps down to any section
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }

      const isReload = isPageReload();

      // When user refreshes, ALWAYS keep to Home section and reset scroll to top
      if (isReload) {
        if (window.location.pathname !== '/' || window.location.hash || window.location.search) {
          window.history.replaceState(null, '', '/');
        }
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        return 'Home';
      }

      return getTabFromPath(window.location.pathname);
    }
    return 'Home';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Track page reloads across browser sessions & beforeunload events
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        sessionStorage.setItem('sana_was_reloaded', 'true');
      } catch {}
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Guarantee redirection to Home and top scroll (0,0) whenever refreshed
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    if (isPageReload()) {
      setActiveTab('Home');
      if (window.location.pathname !== '/' || window.location.hash || window.location.search) {
        window.history.replaceState(null, '', '/');
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    try {
      sessionStorage.removeItem('sana_was_reloaded');
    } catch {}
  }, []);

  // Sync active tab and target user ID with browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const newTab = getTabFromPath(window.location.pathname);
      setActiveTab(newTab);
      if (newTab === 'Profile') {
        const params = new URLSearchParams(window.location.search);
        const profileId = params.get('id');
        setTargetProfileId(profileId || null);
      }
    };

    // Check initial query params on mount
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const initialProfileId = params.get('id');
      if (initialProfileId) {
        setTargetProfileId(initialProfileId);
      }
    }

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setTargetProfileId]);

  // Initial loading delay with smooth fade-out for asset & WebGL initialization
  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 600);

    const unmountTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1100);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  // 1. Smoothly tracking native viewport scroll positions
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        setScrollFraction(scrollTop / scrollHeight);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handler for navbar tab switching
  const handleTabSwitch = (tab: string, explicitProfileId?: string | null) => {
    setActiveTab(tab);

    if (tab === 'Profile') {
      if (explicitProfileId !== undefined) {
        setTargetProfileId(explicitProfileId);
      }
    }
    
    // Sync browser URL pathname with active view
    let targetPath = '/';
    if (tab === 'Gallery') targetPath = '/gallery';
    else if (tab === 'Chat') targetPath = '/chat';
    else if (tab === 'Profile') {
      const activeId = explicitProfileId !== undefined ? explicitProfileId : targetProfileId;
      targetPath = activeId ? `/profile?id=${activeId}` : '/profile';
    }
    else if (tab === 'Login') targetPath = '/login';
    else if (tab === 'SignUp') targetPath = '/signup';
    else if (tab === 'ForgotPassword') targetPath = '/forgot-password';

    if (window.location.pathname + window.location.search !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }

    // Scroll to top immediately for dedicated views and Home
    if (
      tab === 'Gallery' || 
      tab === 'Profile' || 
      tab === 'Chat' || 
      tab === 'Login' || 
      tab === 'SignUp' || 
      tab === 'ForgotPassword' ||
      tab === 'Home'
    ) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } else {
      setTimeout(() => {
        let sectionId = '';
        if (tab === 'Explore') sectionId = 'artists';
        else if (tab === 'About') sectionId = 'about';
        
        if (sectionId) {
          const el = document.getElementById(sectionId);
          el?.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    }
  };

  const handleAddToCart = (id: number) => {
    setCartCount(prev => prev + 1);
    alert("Artwork added to your SANA Shopping Cart!");
  };

  const isGalleryActive = activeTab === 'Gallery';
  // Auth view check

  return (
    <div className="relative min-h-screen w-full bg-[#020202] text-white">
      {/* Sleek Loading Overlay with Smooth Fade-Out */}
      {isLoading && (
        <div 
          className={`fixed inset-0 z-50 bg-[#020202] flex flex-col items-center justify-center text-white transition-opacity duration-500 ease-out ${
            isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4" />
          <span className="font-serif text-lg tracking-[0.3em] font-bold animate-pulse">SANA ARTS</span>
          <span className="text-[10px] font-mono tracking-widest text-white/40 mt-2 uppercase">LOADING EXHIBIT...</span>
        </div>
      )}

      {/* 3D Immersive R3F WebGL Backdrop */}
      <ThreeCanvas scrollFraction={scrollFraction} />

      {/* Foreground Interactive HTML Sections */}
      <div className="relative w-full z-10">
        
        {/* GLOBAL PREMIUM STICKY NAVIGATION HEADER */}
        <header className="fixed top-0 left-0 w-full z-30 px-6 py-4 border-b border-white/[0.03] bg-black/75 text-white flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-md">
          {/* Logo on Left */}
          <div className="flex items-center gap-2 cursor-pointer select-none" onClick={() => handleTabSwitch('Home')}>
            <span className="font-serif text-lg font-bold tracking-[0.3em] text-white">SANA ARTS</span>
          </div>

          {/* Navigation Links in Center / Left-Center */}
          <nav className="flex gap-6 items-center text-[11px] font-bold uppercase tracking-[0.15em] select-none text-white/50">
            {['Home', 'Explore', 'Gallery', 'Profile', 'Chat', 'About'].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => {
                    if (tab === 'Profile') {
                      handleTabSwitch('Profile', null);
                    } else {
                      handleTabSwitch(tab);
                    }
                  }}
                  className={`hover:translate-y-[-1px] transition-all cursor-pointer relative pb-1 ${
                    isActive 
                      ? 'text-white font-extrabold border-b-2 border-white'
                      : 'hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </nav>

          {/* Clean Search Bar */}
          <div 
            onClick={() => setIsSearchModalOpen(true)}
            className="relative w-full md:w-60 cursor-pointer"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input 
              type="text" 
              placeholder="Search drawings or artists..." 
              value={searchQuery}
              onFocus={() => setIsSearchModalOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchModalOpen(true);
              }}
              className="w-full pl-9 pr-4 py-1.5 rounded-full text-xs font-medium outline-none border border-white/10 bg-[#0e0e0e]/80 text-white placeholder-white/20 focus:border-white/30 transition-colors cursor-pointer"
            />
          </div>

          {/* Icons and Auth on the Right */}
          <div className="flex gap-3 sm:gap-4 items-center select-none">
            <button className="p-2 rounded-full hover:bg-neutral-500/10 transition-colors relative cursor-pointer text-white/60 hover:text-white" title="Notifications">
              <Bell className="w-4.5 h-4.5" />
            </button>
            
            <button 
              onClick={() => handleTabSwitch('Chat')}
              className="p-2 rounded-full hover:bg-neutral-500/10 transition-colors relative cursor-pointer text-white/60 hover:text-white" 
              title="Messages"
            >
              <MessageCircle className="w-4.5 h-4.5" />
            </button>
            
            <button className="p-2 rounded-full hover:bg-neutral-500/10 transition-colors relative cursor-pointer text-white/60 hover:text-white" title="Wishlist">
              <Heart className="w-4.5 h-4.5" />
            </button>
            
            <button className="p-2 rounded-full hover:bg-neutral-500/10 transition-colors relative cursor-pointer text-white/60 hover:text-white" title="Shopping Cart">
              <ShoppingCart className="w-4.5 h-4.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-850 text-white rounded-full flex items-center justify-center text-[9px] font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile or Sign In Link */}
            {user ? (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleTabSwitch('Profile', null)}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-white flex items-center gap-1.5 px-2.5" 
                  title="Profile"
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="text-[11px] font-medium tracking-wide max-w-[90px] truncate hidden sm:inline">
                    {profile?.fullName || user.user_metadata?.full_name || user.email?.split('@')[0]}
                  </span>
                </button>
                <button
                  onClick={signOut}
                  className="p-2 rounded-full hover:bg-neutral-500/10 transition-colors cursor-pointer text-white/60 hover:text-rose-400"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleTabSwitch('Login')}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide border border-white/20 hover:border-white/50 bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => handleTabSwitch('SignUp')}
                  className="hidden md:inline-flex px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-[#C85A32] hover:bg-[#B34D27] text-white shadow-xs transition-all cursor-pointer"
                >
                  Join
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Floating live scroll tracker sidebar widget (Apple-aesthetic) */}
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col gap-6 items-center">
          <span className="text-[9px] font-mono tracking-widest text-white/30 rotate-90 origin-center translate-y-8 select-none">
            {(scrollFraction * 100).toFixed(0)}% EXHIBIT DEPTH
          </span>
          <div className="w-[1px] h-32 bg-white/10 relative rounded-full">
            <div 
              className="absolute w-[3px] -left-[1px] rounded-full bg-white transition-all duration-150"
              style={{ 
                top: `${scrollFraction * 100}%`,
                height: '20px'
              }}
            />
          </div>
          <Sparkles className="w-3.5 h-3.5 text-white/40 animate-pulse mt-4" />
        </div>

        {/* PRIMARY VIEWPORTS ROUTING */}
        <div className="pt-24 px-4 sm:px-6 md:px-8">
          {activeTab === 'Login' ? (
            <LoginPage onNavigate={handleTabSwitch} />
          ) : activeTab === 'SignUp' ? (
            <SignUpPage onNavigate={handleTabSwitch} />
          ) : activeTab === 'ForgotPassword' ? (
            <ForgotPasswordPage onNavigate={handleTabSwitch} />
          ) : isGalleryActive ? (
            <GalleryPage onNavigate={handleTabSwitch} onAddToCart={handleAddToCart} />
          ) : activeTab === 'Chat' ? (
            <div className="px-6 py-8">
              <ChatPage onNavigate={handleTabSwitch} />
            </div>
          ) : activeTab === 'Profile' ? (
            <div className="px-6 py-8">
              <ProfilePage 
                onNavigate={handleTabSwitch} 
                targetUserId={targetProfileId}
                onOpenChat={(targetUid, targetName) => {
                  openChatWithUser(targetUid, targetName);
                  handleTabSwitch('Chat');
                }}
              />
            </div>
          ) : (
            <Sections scrollFraction={scrollFraction} onNavigate={handleTabSwitch} />
          )}
        </div>

        {/* INSTAGRAM-STYLE ACCOUNT SEARCH MODAL */}
        <AccountSearchModal
          isOpen={isSearchModalOpen}
          onClose={() => {
            setIsSearchModalOpen(false);
            setSearchQuery('');
          }}
          onSelectUser={(selectedUserId) => {
            setIsSearchModalOpen(false);
            setSearchQuery('');
            openUserProfile(selectedUserId);
            handleTabSwitch('Profile', selectedUserId);
          }}
          initialQuery={searchQuery}
        />

      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocialProvider>
        <AppContent />
      </SocialProvider>
    </AuthProvider>
  );
}
