import React, { ReactNode } from 'react';
import { Sparkles, ArrowLeft, Info } from 'lucide-react';
import { AuthArtworkPanel } from './AuthArtworkPanel';
import { useAuth } from '../../context/AuthContext';

interface AuthLayoutProps {
  children: ReactNode;
  onNavigate: (tab: string) => void;
  title: string;
  subtitle: string;
  tagline?: string;
  artworkTitle?: string;
  artist?: string;
  quote?: string;
  imageSrc?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  onNavigate,
  title,
  subtitle,
  tagline = "AUTHENTICATION PORTAL",
  artworkTitle,
  artist,
  quote,
  imageSrc
}) => {
  const { isConfigured } = useAuth();

  return (
    <div className="w-full max-w-6xl mx-auto py-6 md:py-10">
      
      {/* Supabase Integration Readiness Notice */}
      {!isConfigured && (
        <div className="mb-8 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 backdrop-blur-md text-amber-200/90 text-xs flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">
            <span className="font-semibold text-amber-300">Supabase Auth Configuration: </span>
            To connect live backend authentication, ensure <code className="px-1.5 py-0.5 rounded bg-amber-400/10 font-mono text-amber-300 text-[11px]">VITE_SUPABASE_URL</code> and <code className="px-1.5 py-0.5 rounded bg-amber-400/10 font-mono text-amber-300 text-[11px]">VITE_SUPABASE_PUBLISHABLE_KEY</code> are set in your environment variables.
          </div>
        </div>
      )}

      {/* Main Glass Split Card */}
      <div className="relative rounded-3xl border border-white/10 bg-[#080808]/80 backdrop-blur-2xl shadow-[0_30px_90px_rgba(0,0,0,0.85)] overflow-hidden">
        
        {/* Subtle Specular Top Border Light */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          
          {/* Form Column */}
          <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-between">
            <div>
              {/* Back Link & Tagline */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="inline-flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="font-mono text-[10px] tracking-[0.25em] text-white/40 uppercase">
                    {tagline}
                  </span>
                </div>
                
                <button
                  onClick={() => onNavigate('Home')}
                  className="inline-flex items-center gap-1.5 text-xs font-mono tracking-wider text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>RETURN HOME</span>
                </button>
              </div>

              {/* Title & Subtitle */}
              <div className="mb-8">
                <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2">
                  {title}
                </h1>
                <p className="text-sm text-white/60 font-light leading-relaxed">
                  {subtitle}
                </p>
              </div>

              {/* Injected Form Component */}
              {children}
            </div>

            {/* Footer note inside card */}
            <div className="pt-8 mt-8 border-t border-white/5 flex items-center justify-between text-[11px] text-white/30 font-mono">
              <span>SANA ARTS &bull; ART MARKETPLACE</span>
              <span>SECURE 256-BIT ENCRYPTION</span>
            </div>
          </div>

          {/* Artwork Showcase Column (Desktop Only) */}
          <div className="lg:col-span-5 hidden lg:block border-l border-white/5 p-8 bg-gradient-to-b from-white/[0.02] to-transparent">
            <AuthArtworkPanel 
              artworkTitle={artworkTitle}
              artist={artist}
              quote={quote}
              imageSrc={imageSrc}
            />
          </div>

        </div>

      </div>

    </div>
  );
};
