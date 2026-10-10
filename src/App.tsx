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
  const { user, signOut } = useAuth();
  const [scrollFraction, setScrollFraction] = useState(0);
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return getTabFromPath(window.location.pathname);
    }
    return 'Home';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Sync active tab with browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getTabFromPath(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
  const handleTabSwitch = (tab: string) => {
    setActiveTab(tab);
    
    // Sync browser URL pathname with active view
    let targetPath = '/';
    if (tab === 'Gallery') targetPath = '/gallery';
    else if (tab === 'Chat') targetPath = '/chat';
    else if (tab === 'Profile') targetPath = '/profile';
    else if (tab === 'Login') targetPath = '/login';
    else if (tab === 'SignUp') targetPath = '/signup';
    else if (tab === 'ForgotPassword') targetPath = '/forgot-password';

    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }

    // If not gallery or auth pages, scroll to respective section of landing page
    if (tab !== 'Gallery' && tab !== 'Login' && tab !== 'SignUp' && tab !== 'ForgotPassword') {
      window.scrollTo({ top: 0, behavior: 'instant' });
      setTimeout(() => {
        let sectionId = '';
        if (tab === 'Home') {
          // Scroll to the very top hero section
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
        else if (tab === 'Explore') sectionId = 'artists';
        else if (tab === 'Profile') sectionId = 'contact'; // profile
        else if (tab === 'About') sectionId = 'about';
        else if (tab === 'Chat') sectionId = 'chat'; // direct commissions chat
        
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
                  onClick={() => handleTabSwitch(tab)}
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
          <div className="relative w-full md:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input 
              type="text" 
              placeholder="Search drawings or artists..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-full text-xs font-medium outline-none border border-white/10 bg-[#0e0e0e]/80 text-white placeholder-white/20 focus:border-white/30 transition-colors"
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
                  onClick={() => handleTabSwitch('Profile')}
                  className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer text-white flex items-center gap-1.5 px-2.5" 
                  title="Profile"
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="text-[11px] font-medium tracking-wide max-w-[90px] truncate hidden sm:inline">
                    {user.user_metadata?.full_name || user.email?.split('@')[0]}
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
              <ProfilePage onNavigate={handleTabSwitch} />
            </div>
          ) : (
            <Sections scrollFraction={scrollFraction} />
          )}
        </div>

      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
