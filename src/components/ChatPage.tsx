import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Search, 
  ChevronDown, 
  PlusSquare, 
  Phone, 
  Video, 
  Info, 
  Smile, 
  Image, 
  Heart, 
  Send,
  ArrowLeft,
  CheckCircle2,
  X,
  Loader2,
  AlertCircle,
  LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocial } from '../context/SocialContext';
import { 
  ConversationItem, 
  ChatMessage, 
  ChatParticipant, 
  fetchUserConversations, 
  fetchConversationMessages, 
  sendChatMessage, 
  markConversationAsRead, 
  getOrCreateConversation, 
  searchProfiles, 
  subscribeToMessages, 
  subscribeToInbox, 
  getInitials 
} from '../lib/chat';

interface ChatPageProps {
  onNavigate?: (tab: string) => void;
  targetUserId?: string | null;
  targetUserName?: string | null;
}

export const ChatPage: React.FC<ChatPageProps> = ({ 
  onNavigate,
  targetUserId,
  targetUserName
}) => {
  const { user, profile } = useAuth();
  const { 
    isUserOnline, 
    getUserStatusText, 
    chatTargetUserId, 
    chatTargetUserName, 
    clearChatTarget, 
    openUserProfile 
  } = useSocial();

  const [activeTab, setActiveTab] = useState<'primary' | 'general' | 'requests'>('primary');
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatInput, setChatInput] = useState('');

  // Messages state for currently active conversation
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState<boolean>(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Message Modal state
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [suggestedProfiles, setSuggestedProfiles] = useState<ChatParticipant[]>([]);
  const [isSearchingProfiles, setIsSearchingProfiles] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, [messages]);

  // Load user's conversations
  const loadConversations = async (keepSelection = true) => {
    if (!user) {
      setConversations([]);
      setIsLoadingConversations(false);
      return;
    }

    try {
      const convList = await fetchUserConversations(user.id);
      setConversations(convList);

      // If we don't have a selected conversation yet, optionally pick the first one on desktop
      if (!keepSelection && convList.length > 0 && window.innerWidth >= 768) {
        setSelectedConversationId(convList[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // Initial conversations fetch and Realtime Inbox subscription
  useEffect(() => {
    if (!user) {
      setIsLoadingConversations(false);
      return;
    }

    loadConversations(false);

    // Subscribe to inbox changes (new messages, new conversations)
    const unsubscribeInbox = subscribeToInbox(user.id, () => {
      loadConversations(true);
    });

    return () => {
      unsubscribeInbox();
    };
  }, [user]);

  // Handle external navigation target (e.g. from artwork page or artist profile)
  useEffect(() => {
    const checkTargetUser = async () => {
      const explicitTargetId = targetUserId || chatTargetUserId || window.sessionStorage.getItem('sana_chat_target_id');
      const explicitTargetName = targetUserName || chatTargetUserName || window.sessionStorage.getItem('sana_chat_target_name');
      const explicitArtwork = window.sessionStorage.getItem('sana_chat_artwork_title');

      if (!user) return;

      if (explicitArtwork) {
        window.sessionStorage.removeItem('sana_chat_artwork_title');
        setChatInput(`Hi! I'm interested in commissioning or inquiring about "${explicitArtwork}".`);
      }

      let resolvedUserId = explicitTargetId;

      if (!resolvedUserId && explicitTargetName) {
        window.sessionStorage.removeItem('sana_chat_target_name');
        const profiles = await searchProfiles(explicitTargetName, user.id);
        if (profiles.length > 0) {
          resolvedUserId = profiles[0].id;
        }
      }

      if (resolvedUserId && resolvedUserId !== user.id) {
        window.sessionStorage.removeItem('sana_chat_target_id');
        clearChatTarget();
        const res = await getOrCreateConversation(user.id, resolvedUserId);
        if (res.conversationId) {
          await loadConversations(true);
          setSelectedConversationId(res.conversationId);
        }
      }
    };

    checkTargetUser();
  }, [targetUserId, targetUserName, chatTargetUserId, chatTargetUserName, user]);

  // Fetch messages and subscribe to Realtime when selectedConversationId changes
  useEffect(() => {
    if (!selectedConversationId || !user) {
      setMessages([]);
      return;
    }

    let isSubscribed = true;
    setIsLoadingMessages(true);
    setErrorMessage(null);

    // 1. Fetch message history
    fetchConversationMessages(selectedConversationId)
      .then((history) => {
        if (isSubscribed) {
          setMessages(history);
          setIsLoadingMessages(false);
          // Mark incoming unread messages as read
          markConversationAsRead(selectedConversationId, user.id);
          // Update local unread counter in list
          setConversations((prev) =>
            prev.map((c) => (c.id === selectedConversationId ? { ...c, unreadCount: 0 } : c))
          );
        }
      })
      .catch((err) => {
        if (isSubscribed) {
          setErrorMessage('Could not load messages');
          setIsLoadingMessages(false);
        }
      });

    // 2. Real-time subscription for new messages in this conversation
    const unsubscribe = subscribeToMessages(selectedConversationId, (newMsg) => {
      if (!isSubscribed) return;
      setMessages((prev) => {
        // Prevent duplicate appending
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });

      // Mark as read immediately if it's from the other person
      if (newMsg.sender_id !== user.id) {
        markConversationAsRead(selectedConversationId, user.id);
      }
    });

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, [selectedConversationId, user]);

  // Search profiles for New Message Modal
  useEffect(() => {
    if (!showNewMessageModal || !user) return;

    let isMounted = true;
    setIsSearchingProfiles(true);

    const timer = setTimeout(async () => {
      const results = await searchProfiles(modalSearchQuery, user.id);
      if (isMounted) {
        setSuggestedProfiles(results);
        setIsSearchingProfiles(false);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [showNewMessageModal, modalSearchQuery, user]);

  // Handle Send Message
  const handleSend = async () => {
    if (!chatInput.trim() || !selectedConversationId || !user || isSending) return;

    const content = chatInput.trim();
    setIsSending(true);
    setErrorMessage(null);

    // Optimistic message placeholder
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      conversation_id: selectedConversationId,
      sender_id: user.id,
      content,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setChatInput('');

    // Persist to Supabase
    const { message: savedMsg, error } = await sendChatMessage(
      selectedConversationId,
      user.id,
      content
    );

    setIsSending(false);

    if (error) {
      setErrorMessage(`Failed to send: ${error}`);
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setChatInput(content); // Restore unsent text
    } else if (savedMsg) {
      // Replace optimistic message with actual persisted row
      setMessages((prev) => prev.map((m) => (m.id === tempId ? savedMsg : m)));
      // Update last message in local conversation list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversationId
            ? {
                ...c,
                last_message_text: content,
                last_message_at: savedMsg.created_at,
              }
            : c
        )
      );
    }
  };

  // Keyboard navigation: Enter sends, Shift+Enter adds newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle selecting or creating a conversation from the New Message modal
  const handleStartChatWithUser = async (targetUserId: string) => {
    if (!user) return;
    setIsSearchingProfiles(true);
    const res = await getOrCreateConversation(user.id, targetUserId);
    setIsSearchingProfiles(false);

    if (res.conversationId) {
      await loadConversations(true);
      setSelectedConversationId(res.conversationId);
      setShowNewMessageModal(false);
      setModalSearchQuery('');
    } else {
      alert(`Could not start chat: ${res.error}`);
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-rose-100 text-rose-700 border-rose-200',
      'bg-blue-100 text-blue-700 border-blue-200',
      'bg-amber-100 text-amber-700 border-amber-200',
      'bg-emerald-100 text-emerald-700 border-emerald-200',
      'bg-purple-100 text-purple-700 border-purple-200',
      'bg-indigo-100 text-indigo-700 border-indigo-200',
      'bg-orange-100 text-orange-700 border-orange-200',
      'bg-teal-100 text-teal-700 border-teal-200',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const formatMessageTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatInboxTimestamp = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'now';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'requests') return conv.unreadCount > 0;
    return true;
  });

  const activeConversation = conversations.find((c) => c.id === selectedConversationId);

  // If user is not authenticated, render an elegant Instagram-style sign in prompt
  if (!user) {
    return (
      <div className="relative w-full max-w-4xl mx-auto bg-white border border-[#EFEFEF] rounded-2xl shadow-xl text-[#262626] font-sans p-12 text-center flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-20 h-20 rounded-full border-2 border-[#262626] flex items-center justify-center mb-6">
          <MessageSquare className="w-10 h-10 text-[#262626] stroke-[1.5]" />
        </div>
        <h2 className="text-2xl font-semibold text-[#262626] mb-2 tracking-tight">Your Direct Messages</h2>
        <p className="text-sm text-[#737373] max-w-md mb-8 leading-relaxed">
          Sign in to view your conversations, chat privately with artists, negotiate custom artworks, and receive real-time commission updates.
        </p>
        <button
          onClick={() => onNavigate ? onNavigate('Login') : null}
          className="px-8 py-3 bg-[#0095F6] hover:bg-[#1877F2] text-white font-semibold text-sm rounded-xl cursor-pointer transition-colors shadow-sm flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" /> Sign In to Sana Arts
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-6xl mx-auto bg-white border border-[#EFEFEF] rounded-2xl shadow-xl text-[#262626] font-sans flex h-[80vh] overflow-hidden">
      
      {/* LEFT SIDEBAR: Conversations List */}
      <div className={`w-full md:w-[360px] border-r border-[#EFEFEF] flex flex-col bg-white ${
        selectedConversationId !== null ? 'hidden md:flex' : 'flex'
      }`}>
        
        {/* Top Header Row */}
        <div className="p-4 px-5 border-b border-[#EFEFEF] flex justify-between items-center select-none bg-white">
          <div className="flex items-center gap-2 cursor-pointer font-bold text-base hover:opacity-80">
            <span className="truncate max-w-[200px]">
              {profile?.fullName || user.email?.split('@')[0]}
            </span>
            <ChevronDown className="w-4 h-4 text-[#737373]" />
          </div>
          <button 
            onClick={() => setShowNewMessageModal(true)}
            className="text-[#262626] hover:text-[#0095F6] transition-colors cursor-pointer p-1 rounded-lg hover:bg-[#F2F2F2]" 
            title="New Message"
          >
            <PlusSquare className="w-6 h-6 stroke-[1.8]" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3 border-b border-[#F7F7F7]">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E8E]" />
            <input 
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#EFEFEF] border-none rounded-lg text-sm placeholder-[#8E8E8E] text-[#262626] outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-[#EFEFEF] text-xs font-semibold select-none text-[#737373]">
          {(['primary', 'general', 'requests'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-center border-b cursor-pointer capitalize transition-colors ${
                activeTab === tab 
                  ? 'border-black text-black font-bold' 
                  : 'border-transparent hover:text-black'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Conversation Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#FAFAFA]">
          {isLoadingConversations ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-[#737373]">
              <Loader2 className="w-6 h-6 animate-spin mb-2 text-[#0095F6]" />
              <span className="text-xs">Loading conversations...</span>
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => {
              const isSelected = selectedConversationId === conv.id;
              const hasUnread = conv.unreadCount > 0;
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={`flex items-center gap-3.5 px-5 py-3.5 cursor-pointer transition-colors select-none ${
                    isSelected ? 'bg-[#F2F2F2]' : 'hover:bg-[#FAFAFA]'
                  }`}
                >
                  {/* Profile Avatar */}
                  <div className="relative flex-shrink-0">
                    {conv.otherUser.avatarUrl ? (
                      <img 
                        src={conv.otherUser.avatarUrl} 
                        alt={conv.otherUser.name} 
                        className="w-12 h-12 rounded-full object-cover border border-gray-200"
                      />
                    ) : (
                      <div className={`w-12 h-12 rounded-full border flex items-center justify-center font-bold text-xs ${getAvatarColor(conv.otherUser.name)}`}>
                        {conv.otherUser.initials}
                      </div>
                    )}
                    {isUserOnline(conv.otherUser.id) && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#1ED760] border-2 border-white rounded-full" />
                    )}
                  </div>

                  {/* Account Name & Message Snippet */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-sm truncate ${hasUnread ? 'font-bold text-black' : 'font-semibold text-[#262626]'}`}>
                        {conv.otherUser.name}
                      </span>
                      <span className="text-[11px] text-[#8E8E8E] flex-shrink-0">
                        {formatInboxTimestamp(conv.last_message_at)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <span className={`text-xs truncate ${hasUnread ? 'font-semibold text-black' : 'text-[#737373]'}`}>
                        {conv.last_message_text || 'Started a conversation'}
                      </span>
                      {hasUnread && (
                        <span className="w-2.5 h-2.5 bg-[#0095F6] rounded-full flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center select-none">
              <MessageSquare className="w-10 h-10 text-[#A8A8A8] mb-3 stroke-[1.5]" />
              <span className="text-sm font-semibold text-[#262626]">No messages yet</span>
              <span className="text-xs text-[#737373] mt-1 max-w-[220px]">
                {searchQuery 
                  ? `No conversations match "${searchQuery}"` 
                  : "Send a direct message to an artist or collector to start a conversation."}
              </span>
              <button 
                onClick={() => setShowNewMessageModal(true)}
                className="mt-4 px-4 py-2 bg-[#0095F6] hover:bg-[#1877F2] text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-sm"
              >
                New Message
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR: Chat Viewport */}
      <div className={`flex-1 flex flex-col bg-white ${
        selectedConversationId === null ? 'hidden md:flex' : 'flex'
      }`}>
        
        {activeConversation ? (
          <div className="flex flex-col h-full bg-white">
            
            {/* Active Chat Header */}
            <div className="px-5 py-3.5 border-b border-[#EFEFEF] flex justify-between items-center select-none bg-white">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedConversationId(null)}
                  className="p-1 -ml-1 hover:bg-[#FAFAFA] rounded-full text-[#262626] md:hidden cursor-pointer"
                  title="Back to Inbox"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                {/* Profile Picture */}
                <div 
                  onClick={() => {
                    if (activeConversation.otherUser.id && onNavigate) {
                      openUserProfile(activeConversation.otherUser.id);
                      onNavigate('Profile');
                    }
                  }}
                  className="relative cursor-pointer hover:opacity-90 transition-opacity"
                  title={`View ${activeConversation.otherUser.name}'s profile`}
                >
                  {activeConversation.otherUser.avatarUrl ? (
                    <img 
                      src={activeConversation.otherUser.avatarUrl} 
                      alt={activeConversation.otherUser.name} 
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-xs ${getAvatarColor(activeConversation.otherUser.name)}`}>
                      {activeConversation.otherUser.initials}
                    </div>
                  )}
                  {isUserOnline(activeConversation.otherUser.id) && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#1ED760] border-2 border-white rounded-full" />
                  )}
                </div>
                
                <div>
                  <div 
                    onClick={() => {
                      if (activeConversation.otherUser.id && onNavigate) {
                        openUserProfile(activeConversation.otherUser.id);
                        onNavigate('Profile');
                      }
                    }}
                    className="flex items-center gap-1.5 cursor-pointer group"
                    title={`View ${activeConversation.otherUser.name}'s profile`}
                  >
                    <span className="font-bold text-sm text-[#262626] group-hover:text-[#0095F6] transition-colors">
                      {activeConversation.otherUser.name}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-[#EFEFEF] text-[#737373]">
                      {activeConversation.otherUser.accountType}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#737373] flex items-center gap-1">
                    {isUserOnline(activeConversation.otherUser.id) ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1ED760]" />
                        <span className="text-emerald-600 font-medium">Active now</span>
                      </>
                    ) : (
                      <span>{getUserStatusText(activeConversation.otherUser.id)}</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 items-center text-[#262626]">
                <button 
                  className="hover:text-[#737373] cursor-pointer" 
                  title="Voice Call"
                  onClick={() => alert("Voice calling is currently disabled.")}
                >
                  <Phone className="w-5 h-5 stroke-[1.8]" />
                </button>
                <button 
                  className="hover:text-[#737373] cursor-pointer" 
                  title="Video Call"
                  onClick={() => alert("Video calling is currently disabled.")}
                >
                  <Video className="w-5 h-5 stroke-[1.8]" />
                </button>
                <button 
                  className="hover:text-[#737373] cursor-pointer" 
                  title="View Profile"
                  onClick={() => {
                    if (activeConversation.otherUser.id && onNavigate) {
                      openUserProfile(activeConversation.otherUser.id);
                      onNavigate('Profile');
                    } else {
                      alert(`Participant: ${activeConversation.otherUser.name}\nID: ${activeConversation.otherUser.id}`);
                    }
                  }}
                >
                  <Info className="w-5 h-5 stroke-[1.8]" />
                </button>
              </div>
            </div>

            {/* Error Notification Banner if any */}
            {errorMessage && (
              <div className="px-4 py-2 bg-rose-50 border-b border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Messages Scroll Container */}
            <div className="flex-1 bg-white p-6 overflow-y-auto flex flex-col gap-3">
              {isLoadingMessages ? (
                <div className="flex-1 flex flex-col items-center justify-center text-[#737373] py-12">
                  <Loader2 className="w-6 h-6 animate-spin mb-2 text-[#0095F6]" />
                  <span className="text-xs">Loading message history...</span>
                </div>
              ) : messages.length > 0 ? (
                messages.map((msg) => {
                  const isMine = msg.sender_id === user.id;
                  return (
                    <div 
                      key={msg.id}
                      className={`flex flex-col max-w-[75%] md:max-w-[65%] ${
                        isMine ? 'ml-auto items-end' : 'mr-auto items-start'
                      }`}
                    >
                      <div 
                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                          isMine
                            ? 'bg-[#0095F6] text-white rounded-br-xs'
                            : 'bg-[#EFEFEF] text-[#262626] rounded-bl-xs'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-[#A8A8A8] mt-1 px-1 select-none">
                        {formatMessageTime(msg.created_at)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
                  <div className={`w-16 h-16 rounded-full border mb-3 flex items-center justify-center font-bold text-lg ${getAvatarColor(activeConversation.otherUser.name)}`}>
                    {activeConversation.otherUser.initials}
                  </div>
                  <h3 className="font-bold text-base text-[#262626]">{activeConversation.otherUser.name}</h3>
                  <p className="text-xs text-[#737373] mt-1">Send a message to start direct conversation.</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Rounded Message Input */}
            <div className="p-4 bg-white border-t border-[#EFEFEF]">
              <div className="flex items-center gap-3 border border-[#DBDBDB] rounded-full px-4 py-2 bg-white focus-within:border-gray-400 transition-colors">
                <button 
                  className="text-[#262626] hover:text-[#737373] cursor-pointer"
                  title="Insert Emoji"
                >
                  <Smile className="w-5.5 h-5.5" />
                </button>

                <textarea 
                  ref={textareaRef}
                  rows={1}
                  placeholder="Message..."
                  value={chatInput}
                  disabled={isSending}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 text-sm bg-transparent border-none outline-none text-[#262626] placeholder-[#8E8E8E] resize-none max-h-28 py-1"
                />
                
                {chatInput.trim() ? (
                  <button 
                    onClick={handleSend}
                    disabled={isSending}
                    className="text-[#0095F6] hover:text-[#00376B] font-bold text-sm cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Send'
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-3 text-[#262626]">
                    <button 
                      className="hover:text-[#737373] cursor-pointer" 
                      title="Attach Image"
                      onClick={() => alert("Image attachment feature is available for commissioned art uploads.")}
                    >
                      <Image className="w-5 h-5" />
                    </button>
                    <button 
                      className="hover:text-red-500 cursor-pointer transition-colors" 
                      title="Send Heart" 
                      onClick={() => {
                        setChatInput('❤️');
                      }}
                    >
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          // Empty state when no conversation is selected
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none bg-white">
            <div className="w-24 h-24 rounded-full border-2 border-black flex items-center justify-center mb-4">
              <MessageSquare className="w-12 h-12 text-black stroke-[1.5]" />
            </div>
            <h2 className="text-xl font-light text-[#262626] mb-1">Your messages</h2>
            <p className="text-xs text-[#737373] max-w-xs mb-6">
              Send private direct messages to artists or collectors.
            </p>
            <button 
              onClick={() => setShowNewMessageModal(true)}
              className="px-5 py-2.5 bg-[#0095F6] hover:bg-[#1877F2] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
            >
              Send Message
            </button>
          </div>
        )}

      </div>

      {/* NEW MESSAGE MODAL */}
      {showNewMessageModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 relative flex flex-col max-h-[85vh]">
            <button 
              onClick={() => setShowNewMessageModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-black cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-base font-bold text-[#262626] mb-4">New Direct Message</h3>
            
            {/* Search Input for users */}
            <div className="relative mb-4">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Search artist or collector name..."
                value={modalSearchQuery}
                onChange={(e) => setModalSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F5F5F5] border border-gray-300 rounded-xl text-sm outline-none focus:border-[#0095F6] focus:bg-white text-black"
                autoFocus
              />
            </div>

            {/* Profile search results */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 min-h-[220px]">
              {isSearchingProfiles ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mb-2 text-[#0095F6]" />
                  <span className="text-xs">Finding creators...</span>
                </div>
              ) : suggestedProfiles.length > 0 ? (
                suggestedProfiles.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleStartChatWithUser(p.id)}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {p.avatarUrl ? (
                          <img 
                            src={p.avatarUrl} 
                            alt={p.name} 
                            className="w-10 h-10 rounded-full object-cover border"
                          />
                        ) : (
                          <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-xs ${getAvatarColor(p.name)}`}>
                            {p.initials}
                          </div>
                        )}
                        {isUserOnline(p.id) && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#1ED760] border-2 border-white rounded-full" />
                        )}
                      </div>
                      <div>
                        <span className="font-semibold text-sm text-[#262626] block">{p.name}</span>
                        <span className="text-[11px] text-[#737373] capitalize">{p.accountType}</span>
                      </div>
                    </div>
                    <button className="px-3.5 py-1.5 bg-[#0095F6] hover:bg-[#1877F2] text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors">
                      Chat
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400 text-xs">
                  {modalSearchQuery ? 'No artists or users found.' : 'Search by name to start a chat.'}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#737373] hover:text-black cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
