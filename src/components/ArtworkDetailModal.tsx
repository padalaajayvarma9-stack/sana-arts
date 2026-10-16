import React from 'react';
import { 
  X, 
  ShoppingCart, 
  MessageCircle, 
  Share2, 
  Check, 
  Trash2, 
  Edit3, 
  Calendar, 
  Tag, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';
import { Artwork } from '../lib/artworks';

interface ArtworkDetailModalProps {
  artwork: Artwork | null;
  isOpen: boolean;
  isOwner: boolean;
  artistName: string;
  onClose: () => void;
  onEdit?: (artwork: Artwork) => void;
  onDelete?: (artwork: Artwork) => void;
  onOpenChat?: () => void;
}

export const ArtworkDetailModal: React.FC<ArtworkDetailModalProps> = ({
  artwork,
  isOpen,
  isOwner,
  artistName,
  onClose,
  onEdit,
  onDelete,
  onOpenChat
}) => {
  const [copiedLink, setCopiedLink] = React.useState(false);

  if (!isOpen || !artwork) return null;

  const handleShare = () => {
    const url = `${window.location.origin}/profile?id=${artwork.artistId}#artwork-${artwork.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-4xl bg-[#0c0c0c] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[92vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black/90 border border-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LEFT: Artwork Image Container */}
        <div className="w-full md:w-1/2 bg-black flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-white/10 select-none relative group min-h-[300px]">
          <img 
            src={artwork.imageUrl} 
            alt={artwork.title}
            className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-lg border border-white/5"
          />
        </div>

        {/* RIGHT: Metadata & Details */}
        <div className="w-full md:w-1/2 flex flex-col justify-between p-6 md:p-8 overflow-y-auto">
          
          <div className="space-y-6">
            {/* Header: Title, Category & Status */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {artwork.category}
                </span>
                <span className={`text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                  artwork.status === 'Available'
                    ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-950/50 text-rose-400 border border-rose-500/20'
                }`}>
                  {artwork.status === 'Available' ? '🟢 Available' : '🔴 Sold'}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-serif text-white font-medium leading-tight">
                {artwork.title}
              </h2>
              
              <span className="text-xs text-white/40 block mt-1">
                Curated by <strong className="text-white/80">{artistName}</strong>
              </span>
            </div>

            {/* Price Valuation Card */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">
                  Original Artwork Valuation
                </span>
                <span className="text-2xl font-serif font-bold text-white mt-0.5 block">
                  ₹{artwork.price.toLocaleString()}
                </span>
              </div>

              <button
                type="button"
                onClick={handleShare}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5 text-xs font-mono"
                title="Share Artwork"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copiedLink ? 'Copied' : 'Share'}</span>
              </button>
            </div>

            {/* Description */}
            {artwork.description && (
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block mb-1.5">
                  About the Artwork
                </span>
                <p className="text-xs text-white/70 leading-relaxed font-light">
                  {artwork.description}
                </p>
              </div>
            )}

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs border-y border-white/5 py-4">
              {artwork.medium && (
                <div>
                  <span className="text-[10px] font-mono uppercase text-white/40 block">Medium</span>
                  <span className="text-white/80 font-medium">{artwork.medium}</span>
                </div>
              )}
              {artwork.dimensions && (
                <div>
                  <span className="text-[10px] font-mono uppercase text-white/40 block">Dimensions</span>
                  <span className="text-white/80 font-medium">{artwork.dimensions}</span>
                </div>
              )}
              <div>
                <span className="text-[10px] font-mono uppercase text-white/40 block">Published</span>
                <span className="text-white/80 font-medium">
                  {new Date(artwork.createdAt).toLocaleDateString(undefined, { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-white/40 block">Authenticity</span>
                <span className="text-emerald-400 font-medium inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Signed & Verified
                </span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-6 flex flex-wrap gap-3">
            {isOwner ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit?.(artwork);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <span>Edit Artwork</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to permanently delete "${artwork.title}"?`)) {
                      onClose();
                      onDelete?.(artwork);
                    }
                  }}
                  className="py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    alert(`"${artwork.title}" added to cart!`);
                  }}
                  disabled={artwork.status !== 'Available'}
                  className="flex-1 py-3 px-5 rounded-xl bg-white hover:bg-neutral-200 disabled:opacity-50 text-black text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md inline-flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{artwork.status === 'Available' ? 'Add to Cart' : 'Sold Out'}</span>
                </button>

                {onOpenChat && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenChat();
                    }}
                    className="py-3 px-5 rounded-xl bg-[#0095F6] hover:bg-[#1877F2] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center justify-center gap-2 shadow-md"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Inquire / Chat</span>
                  </button>
                )}
              </>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
