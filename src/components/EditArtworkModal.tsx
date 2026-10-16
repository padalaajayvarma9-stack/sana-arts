import React, { useState } from 'react';
import { X, Loader2, Save, Tag } from 'lucide-react';
import { Artwork, updateArtwork, ARTWORK_CATEGORIES } from '../lib/artworks';

interface EditArtworkModalProps {
  artwork: Artwork;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSuccess: (updated: Artwork) => void;
}

export const EditArtworkModal: React.FC<EditArtworkModalProps> = ({
  artwork,
  isOpen,
  onClose,
  onUpdateSuccess
}) => {
  const [title, setTitle] = useState(artwork.title);
  const [description, setDescription] = useState(artwork.description || '');
  const [category, setCategory] = useState(artwork.category);
  const [price, setPrice] = useState(artwork.price.toString());
  const [status, setStatus] = useState<'Available' | 'Sold'>(artwork.status);
  const [medium, setMedium] = useState(artwork.medium || '');
  const [dimensions, setDimensions] = useState(artwork.dimensions || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim()) {
      setErrorMsg('Artwork title is required.');
      return;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      setErrorMsg('Please enter a valid non-negative price.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await updateArtwork(artwork.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        price: numericPrice,
        status,
        medium: medium.trim() || undefined,
        dimensions: dimensions.trim() || undefined
      });

      if (error || !data) {
        throw error || new Error('Failed to update artwork.');
      }

      onUpdateSuccess(data);
      onClose();
    } catch (err: any) {
      console.error('Update error:', err);
      setErrorMsg(err.message || 'Failed to save changes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0e0e0e] border border-white/10 rounded-2xl p-6 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-amber-400" />
            <h3 className="font-serif text-base tracking-wider uppercase text-white font-medium">
              Edit Artwork Details
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full text-white/50 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1">
              Title
            </label>
            <input 
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white outline-none focus:border-amber-400/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-white/10 text-xs text-white outline-none focus:border-amber-400/50 transition-colors cursor-pointer"
              >
                {ARTWORK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1">
                Price (INR ₹)
              </label>
              <input 
                type="number"
                required
                min="0"
                step="1"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white outline-none focus:border-amber-400/50 transition-colors font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Available' | 'Sold')}
                className="w-full px-3 py-2 rounded-lg bg-[#141414] border border-white/10 text-xs text-white outline-none focus:border-amber-400/50 transition-colors cursor-pointer"
              >
                <option value="Available">🟢 Available</option>
                <option value="Sold">🔴 Sold</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1">
                Dimensions
              </label>
              <input 
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                placeholder="e.g. A3 (29.7 x 42 cm)"
                className="w-full px-3.5 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white outline-none focus:border-amber-400/50 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1">
              Medium
            </label>
            <input 
              type="text"
              value={medium}
              onChange={(e) => setMedium(e.target.value)}
              placeholder="e.g. Graphite Pencil & Ink"
              className="w-full px-3.5 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white outline-none focus:border-amber-400/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-white/50 mb-1">
              Description
            </label>
            <textarea 
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white outline-none focus:border-amber-400/50 transition-colors resize-none leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white/50 hover:text-white hover:bg-white/5 cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-[#C85A32] hover:bg-[#B34D27] text-white cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
