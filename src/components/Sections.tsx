import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Cpu, Eye, ArrowRight, ChevronRight, Send, 
  Mail, Phone, MapPin, User, Search, Heart, MessageCircle,
  Share2, Bookmark, X, Play, Star, ShoppingCart, Calendar, 
  Clock, Award, Check, UserCheck, Video, MoreVertical, 
  Paperclip, Image, Camera, Mic, Smile, FileText, Lock, 
  Shield, BellOff, Languages, Pin, Plus, CheckCheck, 
  FileDown, DollarSign, Info, ChevronLeft, Settings
} from 'lucide-react';
import { GlassPanel } from './GlassPanel';
import { ChatPage } from './ChatPage';
import { ProfilePage } from './ProfilePage';

interface SectionsProps {
  scrollFraction: number;
}

export const Sections: React.FC<SectionsProps> = ({ scrollFraction }) => {
  const [selectedArt, setSelectedArt] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '', role: 'Collector' });
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Artist Profile Page State Hooks
  const [profileTab, setProfileTab] = useState('Gallery');
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedProfileArt, setSelectedProfileArt] = useState<number | null>(null);
  const [cart, setCart] = useState<number[]>([]);
  const [showCartToast, setShowCartToast] = useState(false);
  const [commissionType, setCommissionType] = useState('Portrait');
  const [showCommissionSuccess, setShowCommissionSuccess] = useState(false);

  // Discover Feed state hooks
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFeedItem, setSelectedFeedItem] = useState<number | null>(null);
  const [likedItems, setLikedItems] = useState<Record<number, boolean>>({});
  const [bookmarkedItems, setBookmarkedItems] = useState<Record<number, boolean>>({});
  const [feedLimit, setFeedLimit] = useState(6);
  const [isFeedLoading, setIsFeedLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [feedComments, setFeedComments] = useState<Record<number, Array<{ user: string; text: string }>>>({
    1: [
      { user: "dev_ajay", text: "Stunning colors! This is beautiful." },
      { user: "prasanna_m", text: "Excellent latency density matching." }
    ],
    2: [
      { user: "elena_r", text: "Refractions are so clean!" }
    ],
    3: [
      { user: "varma_ajay", text: "The future of interactive interfaces is here." }
    ],
    4: [
      { user: "prasanna_m", text: "Our main innovation hub!" }
    ],
    5: [
      { user: "coder_1", text: "Love the dynamic contrast." }
    ],
    6: [
      { user: "quantum_tech", text: "Amazing latency stats." }
    ]
  });

  const handleLikeItem = (id: number) => {
    setLikedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBookmarkItem = (id: number) => {
    setBookmarkedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddComment = (id: number) => {
    if (!commentText.trim()) return;
    const newComment = { user: "anonymous_curator", text: commentText.trim() };
    setFeedComments(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), newComment]
    }));
    setCommentText('');
  };

  // --- CHAT PAGE STATE ---
  const [activeConvId, setActiveConvId] = useState<number>(1);
  const [activeChatTab, setActiveChatTab] = useState<string>('All');
  const [showRightInfoPanel, setShowRightInfoPanel] = useState<boolean>(false);
  const [chatSearchQuery, setChatSearchQuery] = useState<string>('');
  const [chatInput, setChatInput] = useState<string>('');
  
  // Negotiation offering states
  const [negotiationStatus, setNegotiationStatus] = useState<'Pending' | 'Accepted' | 'Countered'>('Pending');
  const [activeOfferPrice, setActiveOfferPrice] = useState<number>(2850);
  const [showCounterInput, setShowCounterInput] = useState<boolean>(false);
  const [counterVal, setCounterVal] = useState<string>('');

  // Blocking, muting, translation, starred and pinned
  const [blockedUsers, setBlockedUsers] = useState<Record<number, boolean>>({});
  const [mutedConversations, setMutedConversations] = useState<Record<number, boolean>>({});
  const [pinnedMessages, setPinnedMessages] = useState<Record<string, boolean>>({});
  const [starredMessages, setStarredMessages] = useState<Record<string, boolean>>({});
  const [translatedMessages, setTranslatedMessages] = useState<Record<string, string>>({});
  
  // Typing indicators
  const [typingStatus, setTypingStatus] = useState<Record<number, boolean>>({});

  // Message Reactions state: mapping message ID to an emoji string
  const [messageReactions, setMessageReactions] = useState<Record<string, string>>({});

  // List of conversations
  const conversationsList = [
    {
      id: 1,
      name: "Ajay Varma",
      username: "@varma_ajay",
      avatar: "/abstract_landscape.jpg",
      avatarText: "AV",
      verified: true,
      lastMsg: "Let's proceed with the Realistic Portrait commission.",
      time: "2m ago",
      unread: 2,
      online: true,
      tab: "Buying",
    },
    {
      id: 2,
      name: "M. Prasanna",
      username: "@prasanna_m",
      avatarText: "MP",
      verified: true,
      lastMsg: "We just updated the project layout guidelines.",
      time: "1h ago",
      unread: 0,
      online: false,
      tab: "Selling",
    },
    {
      id: 3,
      name: "SANA Support",
      username: "@sana_support",
      avatarText: "SS",
      verified: false,
      lastMsg: "Your certificate verification has been approved.",
      time: "Yesterday",
      unread: 0,
      online: true,
      tab: "All",
    },
    {
      id: 4,
      name: "Elena Rostova",
      username: "@elena_r",
      avatarText: "ER",
      verified: true,
      lastMsg: "Archived transaction history.",
      time: "3 days ago",
      unread: 0,
      online: false,
      tab: "Archived",
    }
  ];

  // Map of messages for each conversation
  const [chatMessages, setChatMessages] = useState<Record<number, Array<{
    id: string;
    sender: 'user' | 'artist' | 'system';
    text?: string;
    time: string;
    type: 'text' | 'image' | 'video' | 'voice' | 'pdf' | 'location' | 'artwork' | 'commission' | 'order' | 'negotiation';
    mediaUrl?: string;
    artworkTitle?: string;
    price?: string;
    desc?: string;
    statusBadge?: string;
    commissionTitle?: string;
    deliveryTime?: string;
    orderId?: string;
    orderStatus?: {
      paid: boolean;
      started: boolean;
      sketch: boolean;
      coloring: 'Pending' | 'In Progress' | 'Done';
      shipping: 'Pending' | 'Shipped' | 'Delivered';
      progress: number;
    };
    negotiationDetails?: {
      artworkName: string;
      originalPrice: number;
      buyerOffer: number;
      artistCounter: number;
    };
  }>>>({
    1: [
      {
        id: "msg-1-1",
        sender: 'artist',
        text: "Hi there! Welcome to SANA ARTS. I've finished the initial concept for the custom handmade watercolor scene.",
        time: "10:30 AM",
        type: 'text'
      },
      {
        id: "msg-1-2",
        sender: 'artist',
        time: "10:31 AM",
        type: 'image',
        mediaUrl: "/abstract_landscape.jpg",
        text: "Here is a quick progress preview of the landscape layout."
      },
      {
        id: "msg-1-3",
        sender: 'user',
        text: "This is beautiful, Ajay! Could you send me the price details and link to the available original?",
        time: "10:32 AM",
        type: 'text'
      },
      {
        id: "msg-1-4",
        sender: 'artist',
        time: "10:34 AM",
        type: 'artwork',
        artworkTitle: "Realistic Portrait",
        price: "₹3,000",
        statusBadge: "Available",
        desc: "A stunning, custom A4 hyperrealistic pencil portrait on heavyweight acid-free drawing paper.",
        mediaUrl: "/discover_ai_art.png"
      },
      {
        id: "msg-1-5",
        sender: 'artist',
        time: "10:36 AM",
        type: 'negotiation',
        negotiationDetails: {
          artworkName: "Realistic Portrait",
          originalPrice: 3000,
          buyerOffer: 2700,
          artistCounter: 2850
        }
      },
      {
        id: "msg-1-6",
        sender: 'artist',
        time: "10:37 AM",
        type: 'commission',
        commissionTitle: "Portrait Commission Proposal",
        price: "₹1,500",
        deliveryTime: "5 Days"
      },
      {
        id: "msg-1-7",
        sender: 'system',
        time: "10:38 AM",
        type: 'order',
        orderId: "#1024",
        orderStatus: {
          paid: true,
          started: true,
          sketch: true,
          coloring: 'In Progress',
          shipping: 'Pending',
          progress: 60
        }
      }
    ],
    2: [
      {
        id: "msg-2-1",
        sender: 'artist',
        text: "Hello! We are currently working on your custom oil sketch. I have attached the specifications PDF.",
        time: "Yesterday",
        type: 'text'
      },
      {
        id: "msg-2-2",
        sender: 'artist',
        time: "Yesterday",
        type: 'pdf',
        text: "sketch_specifications_v1.pdf"
      }
    ],
    3: [
      {
        id: "msg-3-1",
        sender: 'artist',
        text: "Welcome to SANA Support. How can we assist you with certificate registrations or payouts today?",
        time: "Yesterday",
        type: 'text'
      }
    ],
    4: [
      {
        id: "msg-4-1",
        sender: 'artist',
        text: "Transaction completed and archived. Thank you for collecting from SANA ARTS!",
        time: "3 days ago",
        type: 'text'
      }
    ]
  });

  const chatMessagesEndRef = React.useRef<HTMLDivElement>(null);
  
  const handleSendChatMessage = (textOverride?: string, customType?: 'text' | 'artwork' | 'image' | 'video' | 'voice' | 'pdf' | 'location') => {
    const textToSend = textOverride || chatInput.trim();
    if (!textToSend && !customType) return;

    const newMsgId = `msg-user-${Date.now()}`;
    const newMsg = {
      id: newMsgId,
      sender: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: customType || 'text',
      ...(customType === 'artwork' ? {
        artworkTitle: "Sana Fashion Concept",
        price: "₹299",
        statusBadge: "Available",
        desc: "A beautiful, hand-colored concept fashion gown sketch showcasing an elegant combination of pink and purple patterns.",
        mediaUrl: "/fashion_gown.jpg"
      } : {}),
      ...(customType === 'image' ? {
        mediaUrl: "/discover_tech_concept.png",
        text: "Attached concept render."
      } : {}),
      ...(customType === 'video' ? {
        mediaUrl: "/discover_startup_lab.png",
        text: "Shared design timelapse.mp4"
      } : {}),
      ...(customType === 'voice' ? {
        text: "Voice message (0:45)"
      } : {}),
      ...(customType === 'pdf' ? {
        text: "custom_invoice_details.pdf"
      } : {}),
      ...(customType === 'location' ? {
        text: "Shared Location: Hyderabad, India"
      } : {})
    };

    setChatMessages(prev => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] || []), newMsg]
    }));
    
    if (!textOverride) {
      setChatInput('');
    }

    // Artist simulation response
    setTypingStatus(prev => ({ ...prev, [activeConvId]: true }));
    setTimeout(() => {
      setTypingStatus(prev => ({ ...prev, [activeConvId]: false }));
      
      let replyText = "Received! Let me consult the curation team and get back to you.";
      if (activeConvId === 1) {
        replyText = "Awesome! I will update our sketch status tracker accordingly. Let me know if you want to customize dimensions.";
      } else if (activeConvId === 2) {
        replyText = "Yes, M. Prasanna here. I've noted down your layout edits.";
      }

      const replyMsg = {
        id: `msg-artist-${Date.now()}`,
        sender: 'artist' as const,
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text' as const
      };

      setChatMessages(prev => ({
        ...prev,
        [activeConvId]: [...(prev[activeConvId] || []), replyMsg]
      }));
    }, 1500);
  };

  // Luxury Artworks curated from the artist's handmade sketches and illustrations
  const artworks = [
    {
      id: 1,
      title: "Sana Fashion Concept",
      medium: "Hand-colored Ink & Pencil Sketch",
      artist: "Sana",
      year: "2024",
      desc: "A beautiful, hand-colored concept fashion gown sketch showcasing an elegant combination of pink and purple patterns.",
      image: "/fashion_gown.jpg",
      accent: "shadow-pink-500/10 border-pink-500/20",
      details: "Created on August 13, 2024. Signed by Sana."
    },
    {
      id: 2,
      title: "Moonlit Hearts Mandala",
      medium: "Pencil Sketch & Mandala Ink",
      artist: "M. Prasanna",
      year: "2026",
      desc: "An intricate, detailed pencil sketch mandala inside a crescent moon, featuring a girl casting hearts into the starry sky.",
      image: "/moon_mandala.jpg",
      accent: "shadow-zinc-500/10 border-zinc-500/20",
      details: "Handmade pencil and ink artwork signed by lead artist M. Prasanna."
    },
    {
      id: 3,
      title: "Vined Connection",
      medium: "Black Ink & Pen Sketch",
      artist: "Sana",
      year: "2024",
      desc: "An expressive black ink illustration of two hands connecting within a frame, surrounded by abstract dark vines.",
      image: "/hands_frame.jpg",
      accent: "shadow-neutral-500/10 border-neutral-500/20",
      details: "Created on November 7, 2024. Signed by Sana."
    }
  ];

  const discoverItems = [
    {
      id: 1,
      title: "Sana Fashion Concept",
      category: "Design",
      type: "image",
      thumbnail: "/fashion_gown.jpg",
      likes: 1240,
      desc: "A beautiful, hand-colored concept fashion gown sketch showcasing an elegant combination of pink and purple patterns.",
      aspect: "md:col-span-2 md:row-span-2", // Larger featured card
      shares: 340,
      bookmarks: 180
    },
    {
      id: 2,
      title: "Moonlit Hearts Mandala",
      category: "Art",
      type: "image",
      thumbnail: "/moon_mandala.jpg",
      likes: 850,
      desc: "An intricate, detailed pencil sketch mandala inside a crescent moon, featuring a girl casting hearts into the sky.",
      aspect: "md:col-span-1 md:row-span-1",
      shares: 98,
      bookmarks: 45
    },
    {
      id: 3,
      title: "Vined Connection",
      category: "Innovation",
      type: "image",
      thumbnail: "/hands_frame.jpg",
      likes: 1420,
      desc: "An expressive black ink illustration of two hands connecting within a frame, surrounded by abstract dark vines.",
      aspect: "md:col-span-1 md:row-span-2", // Tall card
      shares: 512,
      bookmarks: 310
    }
  ];

  const profileArtworks = [
    {
      id: 101,
      title: "Sana Fashion Concept",
      price: "₹299",
      status: "Available", // Available, Sold, Commission Available
      image: "/fashion_gown.jpg",
      likes: 420,
      shares: 80,
      desc: "A beautiful, hand-colored concept fashion gown sketch showcasing an elegant combination of pink and purple patterns.",
      category: "Portrait",
      medium: "Hand-colored Ink & Pencil Sketch",
      dimensions: "A3",
      timeTaken: "24 Hours",
      difficulty: "★★★★★",
      shipping: "Worldwide",
      frame: "Yes"
    },
    {
      id: 102,
      title: "Moonlit Hearts Mandala",
      price: "₹399",
      status: "Sold",
      image: "/moon_mandala.jpg",
      likes: 310,
      shares: 40,
      desc: "An intricate, detailed pencil sketch mandala inside a crescent moon, featuring a girl casting hearts into the sky.",
      category: "Mandala",
      medium: "Pencil Sketch & Mandala Ink",
      dimensions: "A2",
      timeTaken: "48 Hours",
      difficulty: "★★★★★",
      shipping: "Worldwide",
      frame: "No"
    },
    {
      id: 103,
      title: "Vined Connection",
      price: "₹249",
      status: "Available",
      image: "/hands_frame.jpg",
      likes: 620,
      shares: 110,
      desc: "An expressive black ink illustration of two hands connecting within a frame, surrounded by abstract dark vines.",
      category: "Illustration",
      medium: "Black Ink & Pen Sketch",
      dimensions: "A3",
      timeTaken: "18 Hours",
      difficulty: "★★★★☆",
      shipping: "Worldwide",
      frame: "Yes"
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email) return;
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setContactForm({ name: '', email: '', message: '', role: 'Collector' });
    }, 6000);
  };

  const getVisibleItems = () => {
    let baseItems = [...discoverItems];
    const extendedItems = [
      ...baseItems,
      ...baseItems.map(item => ({
        ...item,
        id: item.id + 10,
        title: `${item.title} (Archived Edition)`,
        likes: Math.floor(item.likes * 0.8),
      })),
      ...baseItems.map(item => ({
        ...item,
        id: item.id + 20,
        title: `${item.title} (Volumetric Study)`,
        likes: Math.floor(item.likes * 0.5),
      }))
    ];

    return extendedItems
      .filter(item => {
        const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              item.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .slice(0, feedLimit);
  };

  const handleLoadMore = () => {
    setIsFeedLoading(true);
    setTimeout(() => {
      setFeedLimit(prev => prev + 3);
      setIsFeedLoading(false);
    }, 1000);
  };

  return (
    <div className="relative text-white font-sans w-full overflow-hidden select-none">
      
      {/* 1. HERO TEXT OVERLAY (scrollFraction 0.0 -> 0.3) */}
      <section className="min-h-screen flex flex-col justify-between items-center px-4 md:px-8 py-16 text-center relative z-20 pointer-events-none">
        
        {/* Top Header & Core Title */}
        <div className="flex flex-col items-center gap-4 mt-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="uppercase tracking-[0.4em] text-[10px] md:text-xs font-semibold text-white/50"
          >
            SANA ARTS &bull; HYDERABAD &bull; INDIA
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ opacity: Math.max(1 - scrollFraction * 3.5, 0) }}
            className="font-sans text-3xl md:text-5xl tracking-[0.2em] font-extralight text-white leading-none uppercase"
          >
            SANA <span className="font-semibold bg-gradient-to-r from-white via-neutral-300 to-neutral-500 bg-clip-text text-transparent">ARTS</span>
          </motion.h1>
        </div>

        {/* DEDICATED VIEWPORT CENTER GAP (framing the spinning 3D logo completely) */}
        <div className="h-[25vh] md:h-[35vh] pointer-events-none" />

        {/* Bottom portion with descriptive text and scroll pointer */}
        <div style={{ opacity: Math.max(1 - scrollFraction * 4.5, 0) }} className="w-full max-w-4xl px-4 flex flex-col items-center gap-6 mt-auto">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs md:text-sm font-light text-white/60 max-w-xl mx-auto tracking-widest leading-relaxed uppercase"
          >
            An interactive universe of computational sculpture & spatial refraction.
            Scroll downward to split the threshold.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 pointer-events-auto cursor-pointer"
            onClick={() => window.scrollTo({ top: window.innerHeight * 0.6, behavior: 'smooth' })}
          >
            <span className="text-[9px] tracking-[0.3em] uppercase text-white/40">SCROLL TO SUBMERGE</span>
            <div className="w-[1px] h-10 bg-gradient-to-b from-white/60 to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* spacer to let the 3D logo splitting effect showcase completely */}
      <div className="h-[50vh] pointer-events-none" />

      {/* 3. DISCOVER FEED */}
      <section id="artists" className="relative z-20 max-w-7xl mx-auto px-6 md:px-12 py-24 border-t border-white/5">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 text-white/40 mb-3">
              <div className="w-8 h-[1px] bg-white/40" />
              <span className="text-xs uppercase tracking-[0.3em] font-medium font-mono">02 / DISCOVER</span>
            </div>
            <h2 className="text-3xl md:text-5xl tracking-tight font-extralight uppercase">
              Explore <span className="font-semibold">Sana Feed</span>
            </h2>
            <p className="text-sm text-white/50 max-w-xl mt-3 font-light leading-relaxed">
              Discover a curated feed of AI artworks, technology posts, and startup design concepts from SANA ARTS.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-white/30" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search feed..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#0e0e0e]/80 border border-white/10 focus:border-white/30 rounded-full outline-none text-xs tracking-wider text-white placeholder-white/20 transition-all focus:bg-[#121212]/95"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-none select-none">
          {['All', 'AI', 'Art', 'Technology', 'Startup', 'Design', 'Innovation'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setFeedLimit(6);
              }}
              className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 relative border cursor-pointer ${
                activeCategory === cat 
                  ? 'bg-white text-black border-white' 
                  : 'bg-white/5 text-white/60 border-white/10 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 auto-rows-[250px]">
          {getVisibleItems().map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: (idx % 3) * 0.1 }}
              whileHover={{ y: -6 }}
              onClick={() => setSelectedFeedItem(item.id)}
              className={`group relative rounded-2xl overflow-hidden border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-sm cursor-pointer transition-all duration-500 hover:border-white/20 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] ${item.aspect}`}
            >
              {/* Media Thumbnail */}
              <div className="absolute inset-0 w-full h-full overflow-hidden bg-zinc-950">
                <img 
                  src={item.thumbnail} 
                  alt={item.title} 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-85 transition-all duration-700 group-hover:scale-105"
                />
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />

              {/* Hover metadata display */}
              <div className="absolute bottom-0 left-0 w-full p-6 flex flex-col justify-end pointer-events-none z-10">
                <span className="text-[9px] font-mono tracking-widest text-white/40 uppercase mb-1">{item.category}</span>
                <h3 className="text-base font-semibold tracking-tight text-white line-clamp-1">{item.title}</h3>
                <p className="text-xs text-white/50 font-light line-clamp-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">{item.desc}</p>
                
                {/* Stats indicators */}
                <div className="flex gap-4 items-center mt-3 text-[10px] font-mono text-white/40">
                  <div className="flex items-center gap-1">
                    <Heart className={`w-3.5 h-3.5 ${likedItems[item.id] ? 'text-red-500 fill-red-500' : ''}`} />
                    <span>{item.likes + (likedItems[item.id] ? 1 : 0)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{(feedComments[item.id] || [
                      { user: "dev_ajay", text: "Stunning colors! This is beautiful." },
                      { user: "prasanna_m", text: "Excellent latency density matching." }
                    ]).length}</span>
                  </div>
                </div>
              </div>

              {/* Absolute glass gloss streaking */}
              <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent opacity-0 group-hover:animate-shine pointer-events-none" />
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {getVisibleItems().length === 0 && (
          <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/[0.01]">
            <p className="text-sm text-white/40 uppercase tracking-widest">No explore items match your criteria</p>
          </div>
        )}

        {/* Infinite Scroll / Lazy Load trigger button */}
        {getVisibleItems().length > 0 && (
          <div className="mt-12 text-center">
            <button
              onClick={handleLoadMore}
              disabled={isFeedLoading}
              className="px-8 py-3 bg-transparent border border-white/10 hover:border-white/30 text-white hover:bg-white/5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFeedLoading ? 'CALIBRATING NEW GRID...' : 'LOAD MORE EXPERIENCES'}
            </button>
          </div>
        )}
      </section>

      {/* 4. ABOUT SANA ARTS */}
      <section id="about" className="relative z-20 bg-black/60 backdrop-blur-sm py-24 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            
            {/* Fine Art Silhouette */}
            <div className="col-span-1 md:col-span-5 md:pr-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2 }}
                className="relative aspect-square w-full rounded-2xl bg-gradient-to-tr from-zinc-800 via-neutral-900 to-zinc-950 p-[1px]"
              >
                <div className="w-full h-full rounded-2xl bg-[#030303] flex flex-col justify-center items-center text-center p-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent)" />
                  <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mb-6 bg-white/[0.01]">
                    <Sparkles className="w-6 h-6 text-white/80" />
                  </div>
                  <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 mb-1">FOUNDER</h4>
                  <span className="text-xl font-light tracking-wider text-white/90 uppercase">M. Prasanna</span>
                  
                  <h4 className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/30 mt-4 mb-1">CO-FOUNDER</h4>
                  <span className="text-xl font-light tracking-wider text-white/90 uppercase">Ajay Varma</span>

                  <div className="w-32 h-[1px] bg-white/10 my-4" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">ESTABLISHED IN INDIA</span>
                </div>
              </motion.div>
            </div>

            {/* Editorial Content */}
            <div className="col-span-1 md:col-span-7 flex flex-col justify-center">
              <div className="flex items-center gap-3 text-white/40 mb-3">
                <div className="w-8 h-[1px] bg-white/40" />
                <span className="text-xs uppercase tracking-[0.3em] font-medium font-mono">03 / ABOUT</span>
              </div>
              <h2 className="text-3xl md:text-5xl tracking-tight font-extralight uppercase mb-6">
                About <span className="font-semibold">Sana Arts</span>
              </h2>
              
              <div className="space-y-4 text-white/70 font-light leading-relaxed text-sm md:text-base">
                <p>
                  SANA ARTS is an India-based creative company dedicated to delivering innovative digital solutions, artistic creations, and modern design experiences. Founded by M. Prasanna and co-founded by Ajay Varma, SANA ARTS was established with a vision to combine creativity, technology, and innovation to create meaningful experiences for people and businesses.
                </p>
                <p>
                  At SANA ARTS, we focus on quality, originality, and continuous growth. Our mission is to transform ideas into impactful creations while maintaining high standards of professionalism and customer satisfaction. We believe that creativity has the power to inspire, connect, and make a lasting difference.
                </p>
                <p>
                  As we continue to grow, SANA ARTS remains committed to exploring new possibilities, embracing modern technologies, and building solutions that leave a positive impact on our audience and clients.
                </p>
                <p className="italic text-white/90 font-medium pt-2 border-t border-white/5">
                  "Turning imagination into reality through creativity and innovation."
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-4 items-center">
                <a 
                  href="#contact"
                  className="px-6 py-3 rounded-full border border-white/25 bg-white text-black font-medium hover:bg-transparent hover:text-white transition-all duration-300 transform hover:scale-105 active:scale-95 text-xs tracking-wider uppercase text-center"
                >
                  Join Curation Waitlist
                </a>
                <a 
                  href="#gallery"
                  className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-white/60 hover:text-white transition-colors"
                >
                  Explore Current Collection <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4.5 CHAT SECTION */}
      <section id="chat" className="relative z-20 py-24 bg-black border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          {/* Section Header */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-3 text-white/40 mb-3 justify-center">
              <div className="w-8 h-[1px] bg-white/40" />
              <span className="text-xs uppercase tracking-[0.3em] font-medium font-mono">04 / CONVERSE</span>
            </div>
            <h2 className="text-3xl md:text-5xl tracking-tight font-extralight uppercase text-white">
              SANA <span className="font-semibold">Chat Room</span>
            </h2>
            <p className="text-sm text-white/50 max-w-md mx-auto mt-3 font-light leading-relaxed">
              Negotiate counter offers, request custom wedding commissions, and secure payments directly inside direct messages.
            </p>
          </div>

          
          {/* Render new Instagram-inspired ChatPage component */}
          <div className="rounded-xl overflow-hidden shadow-2xl">
            <ChatPage />
          </div>

        </div>
      </section>

      
      {/* 7. ARTIST PROFILE SECTION */}
      <section id="contact" className="relative z-20 py-24 bg-black border-t border-white/5 text-white/80 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          {/* Section Header */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-3 text-white/40 mb-3 justify-center">
              <div className="w-8 h-[1px] bg-white/40" />
              <span className="text-xs uppercase tracking-[0.3em] font-medium font-mono">05 / PORTFOLIO</span>
            </div>
            <h2 className="text-3xl md:text-5xl tracking-tight font-extralight uppercase text-white">
              Artist <span className="font-semibold">Profile</span>
            </h2>
            <p className="text-sm text-white/50 max-w-md mx-auto mt-3 font-light leading-relaxed mb-12">
              Manage your artist account, view your dashboard statistics, and upload your custom sketch portfolios.
            </p>
          </div>

          {/* Render new Instagram-inspired ProfilePage component */}
          <div className="rounded-xl overflow-hidden shadow-2xl">
            <ProfilePage />
          </div>

        </div>
      </section>

    </div>
  );
};
