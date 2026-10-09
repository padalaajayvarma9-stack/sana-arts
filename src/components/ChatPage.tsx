import React, { useState } from 'react';
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
  X
} from 'lucide-react';

interface ChatPageProps {
  onNavigate?: (tab: string) => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'primary' | 'general' | 'requests'>('primary');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatInput, setChatInput] = useState('');

  // Prepopulated accounts removed completely as requested (empty list)
  const [accounts, setAccounts] = useState<Array<{ id: string; name: string; verified: boolean; online: boolean; initials: string }>>([]);
  const [messagesByAccount, setMessagesByAccount] = useState<Record<string, Array<{ id: string; text: string; sender: 'user' | 'other'; time: string }>>>({});

  // New message modal state
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newRecipientName, setNewRecipientName] = useState('');

  const handleCreateNewChat = () => {
    if (!newRecipientName.trim()) return;
    const name = newRecipientName.trim();
    const parts = name.split(' ');
    const initials = parts.length > 1 
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();

    const newAccount = {
      id: Date.now().toString(),
      name,
      verified: false,
      online: true,
      initials,
    };

    setAccounts(prev => [newAccount, ...prev]);
    setSelectedAccountId(newAccount.id);
    setNewRecipientName('');
    setShowNewMessageModal(false);
  };

  const handleSend = () => {
    if (!chatInput.trim() || !selectedAccountId) return;
    const text = chatInput.trim();
    const newMsg = {
      id: Date.now().toString(),
      text,
      sender: 'user' as const,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessagesByAccount(prev => ({
      ...prev,
      [selectedAccountId]: [...(prev[selectedAccountId] || []), newMsg]
    }));
    setChatInput('');
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

  const filteredAccounts = accounts.filter(acc => 
    acc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeAccount = accounts.find(acc => acc.id === selectedAccountId);
  const activeMessages = selectedAccountId ? (messagesByAccount[selectedAccountId] || []) : [];

  return (
    <div className="relative w-full max-w-6xl mx-auto bg-white border border-[#EFEFEF] rounded-xl shadow-sm text-[#262626] font-sans flex h-[80vh] overflow-hidden">
      
      {/* LEFT SIDEBAR: Account List */}
      <div className={`w-full md:w-[350px] border-r border-[#EFEFEF] flex flex-col bg-white ${
        selectedAccountId !== null ? 'hidden md:flex' : 'flex'
      }`}>
        
        {/* Top Header Row */}
        <div className="p-5 border-b border-[#EFEFEF] flex justify-between items-center select-none">
          <div className="flex items-center gap-1.5 cursor-pointer font-bold text-base hover:opacity-80">
            <span>SANA Inbox</span>
            <ChevronDown className="w-4 h-4 text-[#737373]" />
          </div>
          <button 
            onClick={() => setShowNewMessageModal(true)}
            className="text-[#262626] hover:text-[#0095F6] transition-colors cursor-pointer" 
            title="New Message"
          >
            <PlusSquare className="w-5.5 h-5.5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E8E]" />
            <input 
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#EFEFEF] border-none rounded-lg text-sm placeholder-[#8E8E8E] text-black outline-none focus:ring-1 focus:ring-gray-300"
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

        {/* Account Row List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#FDFDFD]">
          {filteredAccounts.length > 0 ? (
            filteredAccounts.map((acc) => {
              const isSelected = selectedAccountId === acc.id;
              return (
                <div
                  key={acc.id}
                  onClick={() => setSelectedAccountId(acc.id)}
                  className={`flex items-center gap-3.5 px-5 py-3 cursor-pointer transition-colors select-none ${
                    isSelected ? 'bg-[#F2F2F2]' : 'hover:bg-[#FAFAFA]'
                  }`}
                >
                  {/* Profile Image Wrapper */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-11 h-11 rounded-full border flex items-center justify-center font-bold text-xs ${getAvatarColor(acc.name)}`}>
                      {acc.initials}
                    </div>
                    {acc.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#1ED760] border-2 border-white rounded-full" />
                    )}
                  </div>

                  {/* Account Name */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-sm text-[#262626] truncate">{acc.name}</span>
                      {acc.verified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0095F6] fill-[#0095F6] stroke-white flex-shrink-0" />
                      )}
                    </div>
                    <span className="text-[11px] text-[#737373] block mt-0.5">
                      {acc.online ? 'Active now' : 'Offline'}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none">
              <MessageSquare className="w-10 h-10 text-[#A8A8A8] mb-3 stroke-[1.5]" />
              <span className="text-sm font-semibold text-[#262626]">No messages yet</span>
              <span className="text-xs text-[#737373] mt-1 max-w-[200px]">
                {searchQuery ? `No accounts match "${searchQuery}"` : "Click 'New Message' to start a conversation with an artist or collector."}
              </span>
              <button 
                onClick={() => setShowNewMessageModal(true)}
                className="mt-4 px-4 py-2 bg-[#0095F6] hover:bg-[#1877F2] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
              >
                New Message
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDEBAR: Chat Area */}
      <div className={`flex-1 flex flex-col bg-white ${
        selectedAccountId === null ? 'hidden md:flex' : 'flex'
      }`}>
        
        {activeAccount ? (
          // Active selected conversation
          <div className="flex flex-col h-full bg-white">
            
            {/* Top Chat Bar */}
            <div className="px-5 py-4 border-b border-[#EFEFEF] flex justify-between items-center select-none bg-white">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setSelectedAccountId(null)}
                  className="p-1 -ml-1 hover:bg-[#FAFAFA] rounded-full text-[#262626] md:hidden cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                {/* Profile Picture */}
                <div className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold text-xs ${getAvatarColor(activeAccount.name)}`}>
                  {activeAccount.initials}
                </div>
                
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-sm text-[#262626]">{activeAccount.name}</span>
                    {activeAccount.verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0095F6] fill-[#0095F6] stroke-white" />
                    )}
                  </div>
                  <span className="text-[10px] text-[#737373] block mt-0.5">
                    {activeAccount.online ? 'Active now' : 'Offline'}
                  </span>
                </div>
              </div>

              {/* Action Icons */}
              <div className="flex gap-4 items-center text-[#262626]">
                <button className="hover:text-[#737373] cursor-pointer" title="Voice Call" onClick={() => alert("Call feature is disabled in preview")}>
                  <Phone className="w-5 h-5" />
                </button>
                <button className="hover:text-[#737373] cursor-pointer" title="Video Call" onClick={() => alert("Video feature is disabled in preview")}>
                  <Video className="w-5 h-5" />
                </button>
                <button className="hover:text-[#737373] cursor-pointer" title="Details" onClick={() => alert(`Showing info profile details for ${activeAccount.name}`)}>
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 bg-white p-6 overflow-y-auto flex flex-col gap-3">
              {activeMessages.length > 0 ? (
                activeMessages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex flex-col max-w-[70%] ${
                      msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                    }`}
                  >
                    <div 
                      className={`px-4 py-2.5 rounded-2xl text-sm ${
                        msg.sender === 'user'
                          ? 'bg-[#0095F6] text-white rounded-br-xs'
                          : 'bg-[#EFEFEF] text-[#262626] rounded-bl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-[#A8A8A8] mt-1 px-1">{msg.time}</span>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                  <div className={`w-16 h-16 rounded-full border mb-3 flex items-center justify-center font-bold text-lg ${getAvatarColor(activeAccount.name)}`}>
                    {activeAccount.initials}
                  </div>
                  <h3 className="font-bold text-base text-[#262626]">{activeAccount.name}</h3>
                  <p className="text-xs text-[#737373] mt-1">Start a conversation with {activeAccount.name}</p>
                </div>
              )}
            </div>

            {/* Bottom Rounded Message Input */}
            <div className="p-4 bg-white border-t border-[#EFEFEF]">
              <div className="flex items-center gap-3 border border-[#DBDBDB] rounded-full px-4 py-2.5 bg-white">
                <button className="text-[#262626] hover:text-[#737373] cursor-pointer">
                  <Smile className="w-5.5 h-5.5" />
                </button>
                <input 
                  type="text"
                  placeholder="Message..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSend();
                  }}
                  className="flex-1 text-sm bg-transparent border-none outline-none text-[#262626] placeholder-[#8E8E8E]"
                />
                
                {chatInput.trim() ? (
                  <button 
                    onClick={handleSend}
                    className="text-[#0095F6] hover:text-[#00376B] font-bold text-sm cursor-pointer"
                  >
                    Send
                  </button>
                ) : (
                  <div className="flex items-center gap-3 text-[#262626]">
                    <button className="hover:text-[#737373] cursor-pointer" title="Attach Image">
                      <Image className="w-5 h-5" />
                    </button>
                    <button className="hover:text-red-500 cursor-pointer" title="Send Heart" onClick={() => alert("Heart reaction sent")}>
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          // Empty state when no account is selected
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none bg-white">
            <div className="w-24 h-24 rounded-full border-2 border-black flex items-center justify-center mb-4">
              <MessageSquare className="w-12 h-12 text-black stroke-[1.5]" />
            </div>
            <h2 className="text-xl font-light text-[#262626] mb-1">Your messages</h2>
            <p className="text-xs text-[#737373] max-w-xs mb-6">
              Send private messages to an artist or buyer.
            </p>
            <button 
              onClick={() => setShowNewMessageModal(true)}
              className="px-4 py-2 bg-[#0095F6] hover:bg-[#1877F2] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
            >
              Send Message
            </button>
          </div>
        )}

      </div>

      {/* NEW MESSAGE MODAL */}
      {showNewMessageModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-200 relative">
            <button 
              onClick={() => setShowNewMessageModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-base font-bold text-[#262626] mb-4">New Message</h3>
            
            <label className="block text-xs font-semibold text-[#737373] uppercase tracking-wider mb-2">
              To: (Artist or User Name)
            </label>
            <input 
              type="text"
              placeholder="e.g. Sana, Art Collector, Support..."
              value={newRecipientName}
              onChange={(e) => setNewRecipientName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateNewChat();
              }}
              className="w-full px-4 py-2.5 bg-[#F5F5F5] border border-gray-300 rounded-lg text-sm outline-none focus:border-[#0095F6] focus:bg-white text-black mb-6"
              autoFocus
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#737373] hover:text-black cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewChat}
                disabled={!newRecipientName.trim()}
                className="px-5 py-2 bg-[#0095F6] hover:bg-[#1877F2] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Chat
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
