import React, { useState, useEffect } from 'react';
import { X, Search, Loader2, UserPlus, UserCheck, ShieldCheck } from 'lucide-react';
import { UserProfileSummary, fetchFollowersList, fetchFollowingList } from '../lib/social';
import { useSocial } from '../context/SocialContext';
import { useAuth } from '../context/AuthContext';

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  title: 'Followers' | 'Following';
  onSelectUser: (userId: string) => void;
}

export const FollowListModal: React.FC<FollowListModalProps> = ({
  isOpen,
  onClose,
  targetUserId,
  title,
  onSelectUser,
}) => {
  const { user: currentUser } = useAuth();
  const { isUserOnline, isFollowing, toggleFollow } = useSocial();

  const [users, setUsers] = useState<UserProfileSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterQuery, setFilterQuery] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !targetUserId) return;

    let isMounted = true;
    setIsLoading(true);

    const load = async () => {
      try {
        let list: UserProfileSummary[] = [];
        if (title === 'Followers') {
          list = await fetchFollowersList(targetUserId);
        } else {
          list = await fetchFollowingList(targetUserId);
        }
        if (isMounted) {
          setUsers(list);
        }
      } catch (err) {
        console.error('Failed to load list:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [isOpen, targetUserId, title]);

  if (!isOpen) return null;

  const filteredUsers = users.filter((u) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.accountType && u.accountType.toLowerCase().includes(q))
    );
  });

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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="w-full max-w-md bg-[#0d0d0d] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-serif text-base tracking-wider uppercase text-white font-medium">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search input inside modal */}
        <div className="p-4 border-b border-white/5 bg-black/40">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input
              type="text"
              placeholder={`Search ${title.toLowerCase()}...`}
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#141414] border border-white/10 text-xs text-white placeholder-white/30 outline-none focus:border-amber-400/50 transition-colors"
            />
          </div>
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-white/40 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
              <span className="text-xs font-mono tracking-wider">Loading {title.toLowerCase()}...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-white/40">
              <p className="text-xs">No {title.toLowerCase()} found.</p>
            </div>
          ) : (
            filteredUsers.map((u) => {
              const online = isUserOnline(u.id);
              const following = isFollowing(u.id);
              const isSelf = currentUser?.id === u.id;

              return (
                <div
                  key={u.id}
                  onClick={() => {
                    onSelectUser(u.id);
                    onClose();
                  }}
                  className="p-3 rounded-2xl hover:bg-white/[0.04] border border-transparent hover:border-white/5 flex items-center justify-between gap-3 cursor-pointer transition-colors group"
                >
                  {/* Left: Avatar with Online indicator & details */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-white/10 flex items-center justify-center overflow-hidden">
                        {u.avatarUrl ? (
                          <img
                            src={u.avatarUrl}
                            alt={u.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-serif font-bold text-white/80">
                            {u.fullName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      {/* Green online dot */}
                      {online && (
                        <span
                          className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black ring-1 ring-emerald-400/40"
                          title="Active now"
                        />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white truncate group-hover:text-amber-300 transition-colors">
                          {u.fullName}
                        </span>
                        {u.accountType === 'artist' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase shrink-0">
                            Artist
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-white/40">
                        <span className="truncate">@{u.username}</span>
                        {online && (
                          <span className="text-[10px] text-emerald-400 font-medium shrink-0">
                            &bull; Active now
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Follow Button */}
                  {!isSelf && (
                    <button
                      type="button"
                      disabled={togglingId === u.id}
                      onClick={(e) => handleToggle(e, u.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                        following
                          ? 'bg-white/10 hover:bg-rose-500/20 hover:text-rose-300 text-white/80 border border-white/10'
                          : 'bg-[#C85A32] hover:bg-[#B34D27] text-white shadow-xs'
                      }`}
                    >
                      {togglingId === u.id ? (
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
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
