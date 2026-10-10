import React from 'react';
import { Sparkles, ShieldCheck, Heart, Award } from 'lucide-react';

interface AuthArtworkPanelProps {
  quote?: string;
  artist?: string;
  artworkTitle?: string;
  imageSrc?: string;
}

export const AuthArtworkPanel: React.FC<AuthArtworkPanelProps> = ({
  quote = "An interactive universe of computational sculpture & spatial refraction. Collect art directly from verified creators.",
  artist = "M. Prasanna",
  artworkTitle = "Moonlit Hearts Mandala",
  imageSrc = "/moon_mandala.jpg"
}) => {
  return (
    <div className="h-full flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0d0d0d]/70 p-6 backdrop-blur-xl relative overflow-hidden group">
      
      {/* Background radial glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-16 translate-x-16 pointer-events-none" />

      {/* Top Tag & Security Badge */}
      <div className="relative z-10 flex items-center justify-between text-xs mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-amber-300 font-mono text-[10px] tracking-wider uppercase">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Curated Exhibit</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-white/50 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Verified Certificate</span>
        </div>
      </div>

      {/* Featured Artwork Preview */}
      <div className="relative z-10 my-auto">
        <div className="relative rounded-xl overflow-hidden border border-white/15 bg-black/50 shadow-2xl">
          <div className="h-64 sm:h-72 w-full overflow-hidden relative">
            <img 
              src={imageSrc} 
              alt={artworkTitle}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Overlay Info */}
            <div className="absolute bottom-3 left-3 right-3 text-white">
              <span className="font-mono text-[9px] uppercase tracking-widest text-amber-400 block mb-0.5">
                Artwork Spotlight
              </span>
              <h4 className="font-serif text-sm font-bold tracking-wide truncate">
                {artworkTitle}
              </h4>
              <p className="text-[11px] text-white/70 font-light">
                Created by {artist}
              </p>
            </div>
          </div>

          <div className="px-4 py-3 bg-[#111111]/90 border-t border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-white/60">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-[10px] tracking-wider uppercase">Traditional Medium</span>
            </div>
            <div className="flex items-center gap-1 text-white/50 text-[11px]">
              <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
              <span>Curator Pick</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quote & Platform Stats */}
      <div className="relative z-10 mt-6 space-y-4">
        <blockquote className="font-serif italic text-xs leading-relaxed text-white/70 border-l border-amber-400/60 pl-3">
          “{quote}”
        </blockquote>

        <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4 text-center">
          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
            <span className="font-mono text-sm font-bold text-white block">2,400+</span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-white/40">Artworks</span>
          </div>
          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
            <span className="font-mono text-sm font-bold text-white block">850+</span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-white/40">Artists</span>
          </div>
        </div>
      </div>

    </div>
  );
};
