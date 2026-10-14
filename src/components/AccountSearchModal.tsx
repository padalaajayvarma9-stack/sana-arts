import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Loader2, 
  UserPlus, 
  UserCheck, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  User as UserIcon
} from 'lucide-react';
import { UserProfileSummary, searchAccounts } from '../lib/social';
import { useSocial } from '../context/SocialContext';
import { useAuth } from '../context/AuthContext';

interface AccountSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (userId: string) => void;
  initialQuery?: string;
}

export const AccountSearchModal: React.FC<AccountSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectUser,
  initialQuery = '',
}) => {
  const { user: currentUser } = useAuth();
  const { isUserOnline, isFollowing, toggleFollow } = useSocial();

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<UserProfileSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialQuery]);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const data = await searchAccounts(query, currentUser?.id);
        if (!isCancelled) {
          setResults(data);
        }
      } catch (err) {
        console.error('Account search error:', err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }, 200);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [query, isOpen, currentUser?.id]);

  if (!isOpen) return null;

  const handleToggle = async (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation();
    if (!currentUser) {
      alert('Please log in to follow artists and collectors.');
      return;
    }
    setTogglingId(targetId);
    await toggleFollow(targetId);
    setTogglingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-start justify-center pt-16 sm:pt-24 p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-[#0c0c0c] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center gap-3 bg-black/50">
          <Search className="w-5 h-5 text-amber-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search artists, collectors, or @username..."
            className="w-full bg-transparent text-sm text-white placeholder-white/30 outline-none font-medium"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
          <button
            onClick={onClose}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono uppercase tracking-wider text-white/50 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-white/40 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
              <span className="text-xs font-mono tracking-wider">Searching community accounts...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="py-16 text-center text-white/40 select-none">
              <div className="w-12 h-12 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center mx-auto mb-3 text-white/30">
                <UserIcon className="w-6 h-6 stroke-[1.2]" />
              </div>
              <p className="text-sm font-medium text-white/60 mb-1">No accounts found</p>
              <p className="text-xs text-white/30 max-w-xs mx-auto">
                {query.trim()
                  ? `No profiles matching "${query}". Try searching by artist name or keywords.`
                  : 'Type an artist or collector name to find accounts on Sana Arts.'}
              </p>
            </div>
          ) : (
            <div>
              <div className="px-3 py-1.5 flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-white/30">
                <span>{query.trim() ? 'Search Results' : 'Suggested Artists & Creators'}</span>
                <span>{results.length} found</span>
              </div>

              <div className="mt-1 space-y-1.5">
                {results.map((item) => {
                  const online = isUserOnline(item.id);
                  const following = isFollowing(item.id);
                  const isSelf = currentUser?.id === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelectUser(item.id);
                        onClose();
                      }}
                      className="p-3 rounded-2xl hover:bg-white/[0.05] border border-transparent hover:border-white/5 flex items-center justify-between gap-3 cursor-pointer transition-all group"
                    >
                      {/* Left: Avatar + Names */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="relative shrink-0">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-white/10 flex items-center justify-center overflow-hidden">
                            {item.avatarUrl ? (
                              <img
                                src={item.avatarUrl}
                                alt={item.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-base font-serif font-bold text-white/80">
                                {item.fullName.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          {/* Live presence indicator */}
                          {online && (
                            <span 
                              className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-black ring-1 ring-emerald-400/40"
                              title="Active now"
                            />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-amber-300 transition-colors">
                              {item.fullName}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase shrink-0">
                              {item.accountType === 'artist' ? 'Artist' : 'Collector'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-white/40">
                            <span className="truncate font-mono">@{item.username}</span>
                            {online ? (
                              <span className="text-[11px] text-emerald-400 font-medium shrink-0 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span>Active now</span>
                              </span>
                            ) : null}
                          </div>
                          {item.bio && (
                            <p className="text-[11px] text-white/50 truncate max-w-xs mt-0.5 font-light">
                              {item.bio}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {!isSelf && (
                          <button
                            type="button"
                            disabled={togglingId === item.id}
                            onClick={(e) => handleToggle(e, item.id)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                              following
                                ? 'bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 text-white/80 border border-white/10'
                                : 'bg-[#C85A32] hover:bg-[#B34D27] text-white shadow-xs'
                            }`}
                          >
                            {togglingId === item.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : following ? (
                              <>
                                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Following</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3.5 h-3.5" />
                                <span>Follow</span>
                              </>
                            )}
                          </button>
                        )}
                        <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
