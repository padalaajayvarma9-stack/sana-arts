import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Bookmark, 
  ShoppingCart, 
  Eye, 
  X, 
  Check, 
  Share2, 
  ArrowRight, 
  Info, 
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Filter
} from 'lucide-react';

interface GalleryPageProps {
  onNavigate: (tab: string) => void;
  onAddToCart: (id: number) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ onNavigate, onAddToCart }) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedArtId, setSelectedArtId] = useState<number | null>(null);
  const [likedItems, setLikedItems] = useState<Record<number, boolean>>({});
  const [savedItems, setSavedItems] = useState<Record<number, boolean>>({});

  // Main 3 uploaded sketches details
  const artworks = [
    {
      id: 1,
      title: "Sana Fashion Concept",
      artist: "Sana",
      price: "₹500",
      status: "Available",
      medium: "Traditional Art",
      paperSize: "A3 (29.7 x 42.0 cm)",
      tools: ["✏️ Graphite Pencil", "🖊 Black Marker", "🎨 Color Pencils", "📄 Drawing Sheet"],
      timeTaken: "14 Hours",
      difficulty: "★★★★☆",
      certificate: "Yes",
      signed: "Yes",
      shipping: "Worldwide",
      desc: "A beautiful, hand-colored concept fashion gown sketch showcasing an elegant combination of pink and purple patterns, created with rich traditional textures.",
      image: "/fashion_gown.jpg",
      heightClass: "h-[450px]"
    },
    {
      id: 2,
      title: "Moonlit Hearts Mandala",
      artist: "M. Prasanna",
      price: "₹399",
      status: "Sold",
      medium: "Mandala Art",
      paperSize: "A3 (29.7 x 42.0 cm)",
      tools: ["✏️ Graphite Pencil", "🖊 Black Marker", "🧽 Kneaded Eraser", "📄 Drawing Sheet"],
      timeTaken: "22 Hours",
      difficulty: "★★★★★",
      certificate: "Yes",
      signed: "Yes",
      shipping: "Worldwide",
      desc: "An intricate, detailed pencil sketch mandala inside a crescent moon, featuring a girl casting hearts into the sky. It represents serenity and connections.",
      image: "/moon_mandala.jpg",
      heightClass: "h-[500px]"
    },
    {
      id: 3,
      title: "Vined Connection",
      artist: "Sana",
      price: "₹249",
      status: "Available",
      medium: "Pencil Art",
      paperSize: "A4 (21.0 x 29.7 cm)",
      tools: ["✏️ Graphite Pencil", "🖊 Black Marker", "📄 Drawing Sheet"],
      timeTaken: "10 Hours",
      difficulty: "★★★☆☆",
      certificate: "Yes",
      signed: "Yes",
      shipping: "Worldwide",
      desc: "An expressive black ink illustration of two hands connecting within a frame, surrounded by abstract dark vines. A study of connection and boundaries.",
      image: "/hands_frame.jpg",
      heightClass: "h-[400px]"
    }
  ];

  // Carousel artworks mock
  const recommendedArtworks = [
    {
      id: 11,
      title: "Silver Volumetric Node",
      artist: "Arthur Vance",
      price: "₹4,200",
      status: "Available",
      image: "/discover_tech_concept.png",
      medium: "Sketches"
    },
    {
      id: 12,
      title: "Chroma Latent Space",
      artist: "Elena Rostova",
      price: "₹5,800",
      status: "Available",
      image: "/discover_ai_art.png",
      medium: "Digital Art"
    },
    {
      id: 13,
      title: "India R&D Innovation Studio",
      artist: "Marcus Sol",
      price: "₹6,000",
      status: "Sold",
      image: "/discover_startup_lab.png",
      medium: "Digital Art"
    }
  ];

  // Popular artists list
  const popularArtists = [
    { name: "Sana", role: "Traditional Illustrator", initial: "S", rating: "4.9" },
    { name: "M. Prasanna", role: "Pencil Mandala Artist", initial: "MP", rating: "5.0" }
  ];

  // Filter Chips list
  const filters = [
    'All', 
    'Pencil Art', 
    'Sketches', 
    'Mandala', 
    'Portraits', 
    'Traditional Art', 
    'Abstract', 
    'Digital Art', 
    'Newest', 
    'Trending', 
    'Available', 
    'Sold'
  ];

  const handleLike = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredArtworks = artworks.filter(art => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Available') return art.status === 'Available';
    if (activeFilter === 'Sold') return art.status === 'Sold';
    if (activeFilter === 'Pencil Art') return art.medium.includes('Pencil');
    if (activeFilter === 'Sketches') return art.medium.includes('Sketch') || art.medium.includes('Pencil');
    if (activeFilter === 'Mandala') return art.medium.includes('Mandala');
    if (activeFilter === 'Traditional Art') return art.medium.includes('Traditional');
    return art.medium === activeFilter;
  });

  const selectedArt = artworks.find(art => art.id === selectedArtId);

  return (
    <div className="min-h-screen bg-transparent text-white/90 font-sans pb-24 relative overflow-hidden">
      
      {/* Ambient glass blur glow dots */}
      <div className="absolute top-48 left-1/4 w-96 h-96 rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[800px] right-1/4 w-[500px] h-[500px] rounded-full bg-orange-500/5 blur-[150px] pointer-events-none" />

      {/* HERO SECTION */}
      <section className="relative z-10 pt-32 pb-16 px-6 max-w-5xl mx-auto text-center">
        {/* Subtle watercolor texture representation */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-[10px] font-mono tracking-[0.4em] text-white/40 uppercase font-bold block mb-4 animate-pulse">SANA ARTS MARKETPLACE</span>
          <h1 className="text-5xl md:text-7xl tracking-tight font-serif text-white font-medium leading-none mb-6">
            Our Art Gallery
          </h1>
          <p className="text-sm md:text-lg text-white/60 max-w-xl mx-auto font-light leading-relaxed">
            Discover unique handmade artworks created by talented artists around the world.
          </p>
        </motion.div>
      </section>

      {/* FILTER SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 mb-12">
        <div className="bg-[#0a0a0a]/60 backdrop-blur-md border border-white/5 p-4 rounded-3xl shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/40">
            <Filter className="w-3.5 h-3.5" />
            <span>Curate Exhibition:</span>
          </div>
          
          <div className="flex flex-wrap gap-2 overflow-x-auto scrollbar-none pb-1">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider transition-all duration-300 border cursor-pointer ${
                  activeFilter === filter
                    ? 'bg-white text-black border-white shadow-md shadow-white/5'
                    : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY LAYOUT (Masonry Grid) */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 mb-24">
        {filteredArtworks.length > 0 ? (
          <div className="columns-1 sm:columns-2 md:columns-3 gap-8 space-y-8">
            {filteredArtworks.map((art) => {
              const isLiked = likedItems[art.id];
              const isSaved = savedItems[art.id];
              return (
                <motion.div
                  key={art.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  onClick={() => setSelectedArtId(art.id)}
                  className="break-inside-avoid group cursor-pointer bg-[#0a0a0a]/50 backdrop-blur-md border border-white/5 rounded-[24px] p-4 flex flex-col justify-between hover:bg-[#0f0f0f]/80 hover:border-white/20 transition-all duration-500 hover:shadow-[0_24px_50px_rgba(0,0,0,0.8)] hover:-translate-y-1.5"
                >
                  {/* Artwork Image Container */}
                  <div className="relative rounded-2xl overflow-hidden bg-black border border-white/10 shadow-inner mb-4 overflow-hidden">
                    <img 
                      src={art.image} 
                      alt={art.title} 
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23111111"/><text x="50%" y="50%" fill="%23666666" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14">SANA ARTWORK</text></svg>';
                      }}
                      className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-[1.03]" 
                    />
                    
                    {/* Hover glass overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                        <Eye className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Artwork Metadata */}
                  <div className="px-1 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-serif text-lg font-bold text-white group-hover:text-amber-500 transition-colors leading-tight">{art.title}</h3>
                        <span className="text-[11px] text-white/40 font-medium tracking-wide">by {art.artist}</span>
                      </div>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        art.status === 'Available' 
                          ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-950/50 text-rose-400 border border-rose-500/20'
                      }`}>
                        {art.status === 'Available' ? '🟢 Available' : '🔴 Sold'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1">
                      <div className="flex flex-col">
                        <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold">Medium</span>
                        <span className="text-xs font-semibold text-white/75">{art.medium}</span>
                      </div>
                      <span className="font-serif text-lg font-bold text-white">{art.price}</span>
                    </div>

                    {/* Actions row */}
                    <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-1">
                      <div className="flex gap-1">
                        <button 
                          onClick={(e) => handleLike(art.id, e)}
                          className={`p-2 rounded-full border transition-all cursor-pointer ${
                            isLiked 
                              ? 'bg-rose-950/50 border-rose-500/30 text-rose-500' 
                              : 'bg-white/5 border-white/10 text-white/60 hover:bg-rose-950/50 hover:text-rose-500 hover:border-rose-500/30'
                          }`}
                          title="Like"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
                        </button>
                        <button 
                          onClick={(e) => handleSave(art.id, e)}
                          className={`p-2 rounded-full border transition-all cursor-pointer ${
                            isSaved 
                              ? 'bg-amber-950/50 border-amber-500/30 text-amber-500' 
                              : 'bg-white/5 border-white/10 text-white/60 hover:bg-amber-950/50 hover:text-amber-500 hover:border-amber-500/30'
                          }`}
                          title="Save"
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-500' : ''}`} />
                        </button>
                      </div>

                      <div className="flex gap-1.5 items-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (art.status === 'Available') {
                              onAddToCart(art.id);
                            } else {
                              alert("This artwork is sold out.");
                            }
                          }}
                          disabled={art.status !== 'Available'}
                          className={`p-2 rounded-full border transition-all cursor-pointer ${
                            art.status === 'Available'
                              ? 'bg-white border-white text-black hover:bg-white/90 shadow-sm'
                              : 'bg-neutral-900 border-white/5 text-white/20 cursor-not-allowed'
                          }`}
                          title="Add to Cart"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 border border-dashed border-white/10 rounded-3xl bg-[#0a0a0a]/20">
            <span className="block text-2xl font-serif text-white/40 mb-2">No Artworks Found</span>
            <p className="text-xs text-white/30">No sketches in our catalog match the active filter chip.</p>
          </div>
        )}
      </section>

      {/* MORE AMAZING ART SECTION (Recommended Carousel) */}
      <section className="relative z-10 bg-black/30 border-y border-white/5 py-20 px-6 mb-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase font-bold block mb-1">CURATED EXHIBITION</span>
              <h2 className="text-2xl md:text-3xl font-serif font-medium text-white">More Amazing Art</h2>
            </div>
            <div className="flex gap-2">
              <button className="p-2 border border-white/10 hover:bg-white/5 rounded-full transition-colors cursor-pointer text-white/60 hover:text-white">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-2 border border-white/10 hover:bg-white/5 rounded-full transition-colors cursor-pointer text-white/60 hover:text-white">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {recommendedArtworks.map((rec) => (
              <div 
                key={rec.id}
                className="bg-[#0a0a0a]/50 border border-white/5 rounded-3xl p-4 flex flex-col justify-between hover:bg-[#0f0f0f]/80 transition-all duration-300"
              >
                <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-black border border-white/10 shadow-inner mb-4">
                  <img src={rec.image} alt={rec.title} className="w-full h-full object-cover opacity-60" />
                </div>
                <div>
                  <h4 className="font-serif text-base font-bold text-white truncate">{rec.title}</h4>
                  <p className="text-[11px] text-white/40">by {rec.artist} &bull; {rec.medium}</p>
                  <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-3">
                    <span className="font-serif font-bold text-sm text-white">{rec.price}</span>
                    <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider cursor-pointer hover:underline">View details</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR ARTISTS SECTION */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 mb-12">
        <div className="text-center mb-12">
          <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase font-bold block mb-1">MEET THE LEAD CREATORS</span>
          <h2 className="text-2xl md:text-3xl font-serif font-medium text-white">Popular Artists</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto gap-8">
          {popularArtists.map((artist, idx) => (
            <div 
              key={idx}
              className="bg-[#0a0a0a]/50 border border-white/5 rounded-3xl p-6 text-center hover:bg-[#0f0f0f]/80 transition-all duration-300 flex flex-col items-center"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-white/10 flex items-center justify-center text-xl font-serif text-white font-bold shadow-md mb-4">
                {artist.initial}
              </div>
              <h3 className="font-serif text-lg font-bold text-white">{artist.name}</h3>
              <p className="text-xs text-white/40 mb-2">{artist.role}</p>
              <span className="text-[11px] bg-amber-950/50 border border-amber-500/10 text-amber-500 font-bold px-2 py-0.5 rounded-full">
                ★ {artist.rating} Rating
              </span>
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => onNavigate('Profile')}
                  className="px-3 py-1.5 border border-white/10 text-white hover:bg-white hover:text-black rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Profile
                </button>
                <button 
                  onClick={() => {
                    window.sessionStorage.setItem('sana_chat_target_name', artist.name);
                    onNavigate('Chat');
                  }}
                  className="px-3.5 py-1.5 bg-[#0095F6] hover:bg-[#1877F2] text-white rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                >
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 pt-16 mt-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12 text-sm text-white/40 font-light">
          <div className="space-y-4">
            <span className="font-serif text-lg font-bold tracking-widest text-white uppercase">SANA ARTS</span>
            <p className="leading-relaxed">An exclusive, hand-crafted digital art marketplace and exhibition hub.</p>
          </div>
          <div>
            <h4 className="font-serif font-bold text-white mb-4">Collections</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white/80 transition-colors">Pencil Drawings</a></li>
              <li><a href="#" className="hover:text-white/80 transition-colors">Mandala Prints</a></li>
              <li><a href="#" className="hover:text-white/80 transition-colors">Traditional Paintings</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif font-bold text-white mb-4">Commissions</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white/80 transition-colors">Request Sketch</a></li>
              <li><a href="#" className="hover:text-white/80 transition-colors">Wedding Invitations</a></li>
              <li><a href="#" className="hover:text-white/80 transition-colors">Portraits</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-serif font-bold text-white mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => onNavigate ? onNavigate('PrivacyPolicy') : (window.location.href = '/privacy-policy')}
                  className="hover:text-white/80 transition-colors cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate ? onNavigate('TermsOfService') : (window.location.href = '/terms-of-service')}
                  className="hover:text-white/80 transition-colors cursor-pointer text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li><a href="#" className="hover:text-white/80 transition-colors">Marketplace Safety</a></li>
              <li><a href="#" className="hover:text-white/80 transition-colors">Shipping Policies</a></li>
              <li><a href="#" className="hover:text-white/80 transition-colors">Contact Curation</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 text-center text-[10px] text-white/30 font-mono tracking-widest border-t border-white/5 py-6">
          &copy; 2026 SANA ARTS. ALL CURATION RIGHTS RESERVED. ESTABLISHED IN HYDERABAD, INDIA.
        </div>
      </footer>

      {/* FULLSCREEN DETAIL MODAL */}
      <AnimatePresence>
        {selectedArt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.95, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-[#0c0c0c] w-full max-w-5xl rounded-[32px] overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-[80vh] relative text-white/80"
            >
              
              {/* Close Button */}
              <button 
                onClick={() => setSelectedArtId(null)}
                className="absolute top-4 right-4 z-10 p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left Column: Artwork Image */}
              <div className="w-full md:w-1/2 bg-black border-r border-white/10 flex items-center justify-center p-6 relative h-[40%] md:h-full select-none">
                <img 
                  src={selectedArt.image} 
                  alt={selectedArt.title} 
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-md border border-white/10"
                />
              </div>

              {/* Right Column: Information */}
              <div className="w-full md:w-1/2 flex flex-col h-[60%] md:h-full bg-[#0c0c0c]">
                
                {/* Scrollable Information Body */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-none">
                  
                  {/* Title & Artist */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <h2 className="text-2xl md:text-3xl font-serif font-bold text-white leading-tight">{selectedArt.title}</h2>
                      <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        selectedArt.status === 'Available' 
                          ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-rose-950/50 text-rose-400 border border-rose-500/20'
                      }`}>
                        {selectedArt.status === 'Available' ? '🟢 Available' : '🔴 Sold'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 flex items-center justify-center text-[10px] font-serif text-white font-bold">
                        {selectedArt.artist[0]}
                      </div>
                      <span className="text-xs text-white/40 font-medium">by <strong className="text-white">{selectedArt.artist}</strong> &bull; Lead Creator</span>
                    </div>
                  </div>

                  {/* Price Block */}
                  <div className="bg-[#121212] border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold block mb-0.5">Price Valuation</span>
                      <span className="font-serif text-2xl font-bold text-white">{selectedArt.price}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        disabled={selectedArt.status !== 'Available'}
                        onClick={() => {
                          onAddToCart(selectedArt.id);
                          setSelectedArtId(null);
                        }}
                        className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                          selectedArt.status === 'Available'
                            ? 'bg-white text-black border border-white hover:bg-white/90 shadow-sm'
                            : 'bg-neutral-900 border border-white/5 text-white/20 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                      </button>
                      <button 
                        onClick={() => {
                          window.sessionStorage.setItem('sana_chat_target_name', selectedArt.artist);
                          window.sessionStorage.setItem('sana_chat_artwork_title', selectedArt.title);
                          setSelectedArtId(null);
                          onNavigate('Chat');
                        }}
                        className="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Inquire / Buy
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold block mb-2 border-b border-white/5 pb-1">Exhibition Description</span>
                    <p className="text-xs text-white/60 leading-relaxed font-light">{selectedArt.desc}</p>
                  </div>

                  {/* Specification details */}
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold block border-b border-white/5 pb-1">Curation Details</span>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs text-white/40">
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span>Medium</span>
                        <strong className="text-white/80 font-medium">{selectedArt.medium}</strong>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span>Paper Size</span>
                        <strong className="text-white/80 font-medium">{selectedArt.paperSize}</strong>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span>Time Taken</span>
                        <strong className="text-white/80 font-medium">{selectedArt.timeTaken}</strong>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span>Difficulty</span>
                        <strong className="text-amber-500 font-bold">{selectedArt.difficulty}</strong>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span>Certificate Included</span>
                        <strong className="text-white/80 font-medium">{selectedArt.certificate}</strong>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span>Signed by Artist</span>
                        <strong className="text-white/80 font-medium">{selectedArt.signed}</strong>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-1 col-span-2">
                        <span>Shipping Available</span>
                        <strong className="text-white/80 font-medium">{selectedArt.shipping}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Tools Used Cards */}
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold block mb-3 border-b border-white/5 pb-1">Tools & Mediums Used</span>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedArt.tools.map((tool, idx) => (
                        <div 
                          key={idx}
                          className="flex items-center gap-2 p-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-white/75 shadow-sm hover:border-white/20 transition-colors"
                        >
                          <span>{tool}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Modal Footer Controls */}
                <div className="border-t border-white/10 p-4 px-6 bg-black/40 flex justify-between items-center">
                  <button 
                    onClick={() => {
                      window.sessionStorage.setItem('sana_chat_target_name', selectedArt.artist);
                      window.sessionStorage.setItem('sana_chat_artwork_title', `Custom Commission related to "${selectedArt.title}"`);
                      setSelectedArtId(null);
                      onNavigate('Chat');
                    }}
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Commission Artist <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.origin + `?artwork=${selectedArt.id}`);
                      alert('Exhibition share link copied to clipboard!');
                    }}
                    className="p-2 border border-white/10 hover:bg-white/5 rounded-full text-white/60 hover:text-white transition-colors cursor-pointer"
                    title="Share Artwork"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
