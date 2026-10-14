import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { 
  UserProfileSummary, 
  followUser, 
  unfollowUser, 
  checkIsFollowing,
  fetchFollowStats,
  formatLastActive,
  updateUserLastSeen
} from '../lib/social';

interface SocialContextType {
  onlineUserIds: Set<string>;
  isUserOnline: (userId?: string | null) => boolean;
  getUserStatusText: (userId?: string | null, lastSeenAt?: string | null) => string;
  isFollowing: (targetUserId?: string | null) => boolean;
  toggleFollow: (targetUserId: string) => Promise<{ success: boolean; isFollowing: boolean }>;
  targetProfileId: string | null;
  setTargetProfileId: (id: string | null) => void;
  openUserProfile: (userId: string) => void;
  openChatWithUser: (userId: string, userName?: string) => void;
  chatTargetUserId: string | null;
  chatTargetUserName: string | null;
  clearChatTarget: () => void;
  refreshFollowStatus: (targetUserId: string) => Promise<boolean>;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

const ONLINE_PRESENCE_CHANNEL = 'sana_arts_presence_global';

export const SocialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();

  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [targetProfileId, setTargetProfileId] = useState<string | null>(null);
  const [chatTargetUserId, setChatTargetUserId] = useState<string | null>(null);
  const [chatTargetUserName, setChatTargetUserName] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // 1. SUPABASE REALTIME PRESENCE: Online / Offline Tracking
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!supabase) return;

    const channelConfig = user
      ? { config: { presence: { key: user.id } } }
      : undefined;

    const channel = supabase.channel(ONLINE_PRESENCE_CHANNEL, channelConfig);

    const syncPresence = () => {
      const state = channel.presenceState();
      const activeIds = new Set<string>();

      Object.keys(state).forEach((key) => {
        const presences = state[key];
        if (Array.isArray(presences) && presences.length > 0) {
          activeIds.add(key);
        }
      });

      setOnlineUserIds(activeIds);
    };

    channel
      .on('presence', { event: 'sync' }, syncPresence)
      .on('presence', { event: 'join' }, syncPresence)
      .on('presence', { event: 'leave' }, syncPresence)
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // If user is authenticated and hasn't disabled online visibility, track presence
          const showOnline = profile?.showOnlineStatus !== false;
          if (user && showOnline) {
            try {
              await channel.track({
                user_id: user.id,
                online_at: new Date().toISOString(),
              });
              updateUserLastSeen(user.id);
            } catch (trackErr) {
              console.warn('Realtime presence track warning:', trackErr);
            }
          }
          syncPresence();
        }
      });

    // Update last seen periodically when active
    let heartbeatInterval: any = null;
    if (user) {
      heartbeatInterval = setInterval(() => {
        updateUserLastSeen(user.id);
      }, 5 * 60 * 1000); // every 5 minutes
    }

    return () => {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (user) {
        channel.untrack().catch(() => {});
        updateUserLastSeen(user.id);
      }
      supabase.removeChannel(channel);
    };
  }, [user?.id, profile?.showOnlineStatus]);

  // Check if a specific user is currently online
  const isUserOnline = useCallback(
    (userId?: string | null): boolean => {
      if (!userId) return false;
      // Current user is online if logged in
      if (user && user.id === userId) return true;
      return onlineUserIds.has(userId);
    },
    [onlineUserIds, user]
  );

  // Friendly status string: "Active now" or "Active 2h ago" or "Offline"
  const getUserStatusText = useCallback(
    (userId?: string | null, lastSeenAt?: string | null): string => {
      if (!userId) return 'Offline';
      if (isUserOnline(userId)) return 'Active now';
      return formatLastActive(lastSeenAt);
    },
    [isUserOnline]
  );

  // ---------------------------------------------------------------------------
  // 2. FOLLOW SYSTEM: Instant Follow State & Optimistic Toggling
  // ---------------------------------------------------------------------------
  const isFollowing = useCallback(
    (targetUserId?: string | null): boolean => {
      if (!targetUserId || !user) return false;
      if (targetUserId === user.id) return false;
      return !!followingMap[targetUserId];
    },
    [followingMap, user]
  );

  const refreshFollowStatus = useCallback(
    async (targetUserId: string): Promise<boolean> => {
      if (!user || !targetUserId || user.id === targetUserId) return false;
      const following = await checkIsFollowing(user.id, targetUserId);
      setFollowingMap((prev) => ({ ...prev, [targetUserId]: following }));
      return following;
    },
    [user]
  );

  const toggleFollow = useCallback(
    async (targetUserId: string): Promise<{ success: boolean; isFollowing: boolean }> => {
      if (!user) {
        return { success: false, isFollowing: false };
      }
      if (targetUserId === user.id) {
        return { success: false, isFollowing: false };
      }

      const currentlyFollowing = !!followingMap[targetUserId];
      const nextFollowingState = !currentlyFollowing;

      // Optimistic update
      setFollowingMap((prev) => ({ ...prev, [targetUserId]: nextFollowingState }));

      try {
        let res;
        if (nextFollowingState) {
          res = await followUser(user.id, targetUserId);
        } else {
          res = await unfollowUser(user.id, targetUserId);
        }

        if (!res.success) {
          // Revert optimistic update on failure
          setFollowingMap((prev) => ({ ...prev, [targetUserId]: currentlyFollowing }));
          return { success: false, isFollowing: currentlyFollowing };
        }

        return { success: true, isFollowing: nextFollowingState };
      } catch (err) {
        // Revert on error
        setFollowingMap((prev) => ({ ...prev, [targetUserId]: currentlyFollowing }));
        return { success: false, isFollowing: currentlyFollowing };
      }
    },
    [user, followingMap]
  );

  // ---------------------------------------------------------------------------
  // 3. PROFILE & CHAT NAVIGATION INTEGRATION
  // ---------------------------------------------------------------------------
  const openUserProfile = useCallback((userId: string) => {
    setTargetProfileId(userId);
  }, []);

  const openChatWithUser = useCallback((userId: string, userName?: string) => {
    setChatTargetUserId(userId);
    setChatTargetUserName(userName || null);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('sana_chat_target_id', userId);
      if (userName) {
        window.sessionStorage.setItem('sana_chat_target_name', userName);
      }
    }
  }, []);

  const clearChatTarget = useCallback(() => {
    setChatTargetUserId(null);
    setChatTargetUserName(null);
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('sana_chat_target_id');
      window.sessionStorage.removeItem('sana_chat_target_name');
    }
  }, []);

  return (
    <SocialContext.Provider
      value={{
        onlineUserIds,
        isUserOnline,
        getUserStatusText,
        isFollowing,
        toggleFollow,
        targetProfileId,
        setTargetProfileId,
        openUserProfile,
        openChatWithUser,
        chatTargetUserId,
        chatTargetUserName,
        clearChatTarget,
        refreshFollowStatus,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = (): SocialContextType => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};
