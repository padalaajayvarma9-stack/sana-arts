import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowLeft, 
  DollarSign, 
  Eye, 
  ShieldCheck, 
  LogIn, 
  Tag, 
  FileText, 
  Maximize2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  uploadArtworkImage, 
  createArtwork, 
  validateArtworkInput, 
  Artwork, 
  ARTWORK_CATEGORIES, 
  MAX_FILE_SIZE 
} from '../lib/artworks';

interface UploadArtworkPageProps {
  onNavigate: (tab: string, explicitProfileId?: string | null) => void;
  onUploadSuccess?: (artwork: Artwork) => void;
}

export const UploadArtworkPage: React.FC<UploadArtworkPageProps> = ({ 
  onNavigate,
  onUploadSuccess 
}) => {
  const { user, profile } = useAuth();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('Pencil Art');
  const [price, setPrice] = useState('');
  const [medium, setMedium] = useState('');
  const [dimensions, setDimensions] = useState('');

  // Image file & preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status & Progress
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [publishedArtwork, setPublishedArtwork] = useState<Artwork | null>(null);

  // Handle file selection
  const handleFileChange = (file: File) => {
    setErrorMessage(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Please upload a valid image file (JPG, PNG, WEBP, or GIF).');
      return;
    }

    // Validate size (10 MB limit)
    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage(`Image is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 10 MB.`);
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleClearImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!user) {
      setErrorMessage('You must be signed in to upload and publish artworks.');
      return;
    }

    if (!selectedFile) {
      setErrorMessage('Please choose or drag-and-drop an artwork image to upload.');
      return;
    }

    // Input validation
    const validation = validateArtworkInput({
      title,
      description,
      category,
      price,
      file: selectedFile
    });

    if (!validation.valid) {
      setErrorMessage(validation.error || 'Please review your artwork details.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(10);

    try {
      // 1. Upload to Supabase Storage bucket ('artworks')
      const { imageUrl, imagePath } = await uploadArtworkImage(
        selectedFile,
        user.id,
        (progress) => setUploadProgress(progress)
      );

      // 2. Save metadata to public.artworks database table
      const { data: created, error: dbError } = await createArtwork({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        price: parseFloat(price),
        medium: medium.trim() || undefined,
        dimensions: dimensions.trim() || undefined,
        imageUrl,
        imagePath
      });

      if (dbError || !created) {
        throw dbError || new Error('Failed to record artwork metadata.');
      }

      setPublishedArtwork(created);
      onUploadSuccess?.(created);
    } catch (err: any) {
      console.error('Artwork upload failure:', err);
      setErrorMessage(err.message || 'An unexpected error occurred while publishing artwork.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    handleClearImage();
    setTitle('');
    setDescription('');
    setCategory('Pencil Art');
    setPrice('');
    setMedium('');
    setDimensions('');
    setPublishedArtwork(null);
    setErrorMessage(null);
    setUploadProgress(0);
  };

  // ---------------------------------------------------------------------------
  // 1. VISITOR IS LOGGED OUT: Show Luxury Access Prompt
  // ---------------------------------------------------------------------------
  if (!user) {
    return (
      <div className="w-full max-w-2xl mx-auto my-8 bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 text-white font-sans text-center shadow-2xl relative">
        <div className="w-16 h-16 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center mx-auto mb-6 text-amber-400 shadow-inner">
          <Upload className="w-8 h-8 stroke-[1.5]" />
        </div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-mono tracking-widest uppercase mb-4">
          <Sparkles className="w-3 h-3" />
          <span>Artist Studio Portal</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-serif font-light text-white mb-3">
          Publish Your Artwork on Sana Arts
        </h2>
        
        <p className="text-xs md:text-sm text-white/50 max-w-md mx-auto leading-relaxed mb-8">
          Only registered and authenticated artists can curate exhibits and upload original drawings, mandalas, or paintings to the Sana Arts marketplace.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
          <button
            onClick={() => onNavigate('Login')}
            className="flex-1 py-3 px-5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md inline-flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Upload</span>
          </button>
          
          <button
            onClick={() => onNavigate('SignUp')}
            className="flex-1 py-3 px-5 rounded-xl bg-[#C85A32] hover:bg-[#B34D27] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
          >
            Create Artist Account
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. SUCCESS STATE: Artwork Successfully Published!
  // ---------------------------------------------------------------------------
  if (publishedArtwork) {
    return (
      <div className="w-full max-w-3xl mx-auto my-8 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 text-white font-sans shadow-2xl relative">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-mono tracking-[0.3em] uppercase text-emerald-400 font-bold block mb-1">
            EXHIBIT PUBLISHED SUCCESSFULLY
          </span>
          <h2 className="text-2xl md:text-3xl font-serif text-white font-medium">
            "{publishedArtwork.title}" is Live!
          </h2>
          <p className="text-xs text-white/50 max-w-md mx-auto mt-2">
            Your artwork has been securely stored in Supabase Storage and published to your public artist profile.
          </p>
        </div>

        {/* Live Artwork Card Preview */}
        <div className="max-w-md mx-auto bg-black/60 border border-white/10 rounded-2xl p-4 shadow-xl mb-8 flex flex-col gap-4">
          <div className="aspect-[4/3] rounded-xl overflow-hidden bg-zinc-950 border border-white/5 relative">
            <img 
              src={publishedArtwork.imageUrl} 
              alt={publishedArtwork.title}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="px-1 flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-serif text-lg font-bold text-white">{publishedArtwork.title}</h3>
                <span className="text-[11px] text-white/40 font-mono tracking-wider">
                  by {profile?.fullName || user.email?.split('@')[0]}
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-950/50 text-emerald-400 border border-emerald-500/20">
                🟢 {publishedArtwork.status}
              </span>
            </div>
            
            <div className="flex items-center justify-between border-t border-white/5 pt-2 text-xs">
              <span className="text-white/50">{publishedArtwork.category}</span>
              <span className="font-serif text-base font-bold text-white">₹{publishedArtwork.price.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
          <button
            onClick={() => onNavigate('Profile', user.id)}
            className="flex-1 py-3 px-6 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md text-center"
          >
            View in My Profile
          </button>
          
          <button
            onClick={resetForm}
            className="flex-1 py-3 px-6 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
          >
            Upload Another Artwork
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 3. MAIN FORM: Artwork Details & File Uploader
  // ---------------------------------------------------------------------------
  return (
    <div className="w-full max-w-4xl mx-auto my-6 bg-[#0a0a0a]/70 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-10 md:p-12 text-white font-sans shadow-2xl relative">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8">
        <div>
          <button
            type="button"
            onClick={() => onNavigate('Profile', user.id)}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-white/40 hover:text-white transition-colors cursor-pointer mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO PROFILE</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-serif font-light text-white">
            Upload New Artwork
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Publish your drawings, paintings, or digital concepts to your Sana Arts profile gallery.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 text-[11px] font-mono text-white/60">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>RLS & Storage Secured</span>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-3 backdrop-blur-md">
          <AlertCircle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Image Selector & Live Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <label className="block text-[11px] font-mono uppercase tracking-widest text-white/60">
              Artwork Image <span className="text-amber-400">*</span>
            </label>

            <input 
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            {previewUrl ? (
              // Live Image Preview with Overlay Controls
              <div className="relative rounded-2xl overflow-hidden border border-white/15 bg-black group aspect-[4/5] flex items-center justify-center shadow-xl">
                <img 
                  src={previewUrl} 
                  alt="Artwork preview" 
                  className="w-full h-full object-contain"
                />

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-all cursor-pointer"
                    title="Replace Image"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleClearImage}
                    className="p-2.5 rounded-full bg-rose-500/60 hover:bg-rose-500/80 backdrop-blur-md text-white transition-all cursor-pointer"
                    title="Remove Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {selectedFile && (
                  <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-white/70 flex justify-between items-center truncate">
                    <span className="truncate max-w-[180px]">{selectedFile.name}</span>
                    <span>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                )}
              </div>
            ) : (
              // Drag & Drop Upload Zone
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`aspect-[4/5] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
                  isDragging 
                    ? 'border-amber-400 bg-amber-400/5' 
                    : 'border-white/15 hover:border-white/30 bg-white/[0.02] hover:bg-white/[0.04]'
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mb-4 group-hover:text-amber-400 transition-colors">
                  <Upload className="w-6 h-6 stroke-[1.5]" />
                </div>
                <h4 className="text-sm font-medium text-white mb-1">
                  Drag & Drop your artwork
                </h4>
                <p className="text-xs text-white/40 max-w-[200px] mb-4">
                  Supports JPG, PNG, WEBP, or GIF up to 10 MB
                </p>
                <span className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider transition-colors">
                  Browse Files
                </span>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Metadata Form (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            
            {/* Title */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-widest text-white/60 mb-1.5">
                Artwork Title <span className="text-amber-400">*</span>
              </label>
              <input 
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Moonlit Resonance Study"
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/40 hover:border-white/20 focus:border-amber-400/50 text-sm text-white placeholder-white/25 outline-none transition-all"
              />
            </div>

            {/* Category & Price in 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-white/60 mb-1.5">
                  Category <span className="text-amber-400">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-[#0e0e0e] hover:border-white/20 focus:border-amber-400/50 text-xs text-white outline-none transition-all cursor-pointer font-medium"
                >
                  {ARTWORK_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-[#0e0e0e] text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-white/60 mb-1.5">
                  Price (INR ₹) <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 text-xs font-mono font-bold">₹</span>
                  <input 
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="299"
                    disabled={isSubmitting}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-white/10 bg-black/40 hover:border-white/20 focus:border-amber-400/50 text-sm text-white placeholder-white/25 outline-none transition-all font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Medium & Dimensions (Optional Extras) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-white/60 mb-1.5">
                  Medium (Optional)
                </label>
                <input 
                  type="text"
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                  placeholder="e.g. Traditional Pencil & Ink"
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/40 hover:border-white/20 focus:border-white/40 text-xs text-white placeholder-white/25 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-widest text-white/60 mb-1.5">
                  Dimensions (Optional)
                </label>
                <input 
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  placeholder="e.g. A3 (29.7 x 42 cm)"
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-black/40 hover:border-white/20 focus:border-white/40 text-xs text-white placeholder-white/25 outline-none transition-all"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-widest text-white/60 mb-1.5">
                Exhibition Description
              </label>
              <textarea 
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your creative process, inspiration, or notes for collectors..."
                disabled={isSubmitting}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-black/40 hover:border-white/20 focus:border-amber-400/50 text-xs text-white placeholder-white/25 outline-none transition-all resize-none leading-relaxed"
              />
            </div>

            {/* Upload Progress Bar if submitting */}
            {isSubmitting && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center text-[10px] font-mono uppercase text-white/60">
                  <span>Uploading to Supabase Storage & Database...</span>
                  <span className="text-amber-400 font-bold">{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-[#C85A32] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Form Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => onNavigate('Profile', user.id)}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white/50 hover:text-white hover:bg-white/5 cursor-pointer transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !selectedFile}
                className="px-7 py-3 rounded-xl bg-[#C85A32] hover:bg-[#B34D27] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md inline-flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Publishing Artwork...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Publish Artwork</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      </form>

    </div>
  );
};
