import { supabase } from './supabase';

export interface UserProfileSummary {
  id: string;
  fullName: string;
  username: string;
  avatarUrl: string | null;
  accountType: 'lover' | 'artist' | string;
  bio?: string | null;
  isOnline?: boolean;
  lastSeenAt?: string;
  showOnlineStatus?: boolean;
}

export interface FollowStats {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

/**
 * Derive a clean @username from username, email, or full name
 */
export function deriveUsername(profile: {
  username?: string | null;
  email?: string | null;
  full_name?: string | null;
}): string {
  if (profile.username && profile.username.trim()) {
    return profile.username.trim().replace(/^@+/, '');
  }
  if (profile.email && profile.email.includes('@')) {
    return profile.email.split('@')[0].toLowerCase().replace(/[^a-z0-9._]/g, '');
  }
  if (profile.full_name && profile.full_name.trim()) {
    return profile.full_name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9._]/g, '');
  }
  return 'creator';
}

/**
 * Format last seen time in a friendly, Instagram-style human string
 */
export function formatLastActive(lastSeenAt?: string | null): string {
  if (!lastSeenAt) return 'Offline';

  try {
    const lastDate = new Date(lastSeenAt);
    const now = new Date();
    const diffMs = now.getTime() - lastDate.getTime();
    if (diffMs < 0 || isNaN(diffMs)) return 'Offline';

    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 2) return 'Active just now';
    if (diffMin < 60) return `Active ${diffMin}m ago`;
    if (diffHours < 24) return `Active ${diffHours}h ago`;
    if (diffDays === 1) return 'Active yesterday';
    if (diffDays < 7) return `Active ${diffDays}d ago`;
    return 'Offline';
  } catch {
    return 'Offline';
  }
}

/**
 * Fetch followers count and following count for a given user
 */
export async function fetchFollowStats(
  targetUserId: string,
  currentUserId?: string | null
): Promise<FollowStats> {
  if (!supabase || !targetUserId) {
    return { followersCount: 0, followingCount: 0, isFollowing: false };
  }

  try {
    // 1. Count followers
    const { count: followersCount, error: err1 } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', targetUserId);

    // 2. Count following
    const { count: followingCount, error: err2 } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', targetUserId);

    // 3. Check if current user is following target
    let isFollowing = false;
    if (currentUserId && currentUserId !== targetUserId) {
      const { data: followRecord, error: err3 } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId)
        .maybeSingle();

      if (!err3 && followRecord) {
        isFollowing = true;
      }
    }

    // Gracefully handle case where table does not exist yet
    if (err1?.code === 'PGRST205' || err2?.code === 'PGRST205') {
      return getLocalFollowStats(targetUserId, currentUserId);
    }

    return {
      followersCount: followersCount || 0,
      followingCount: followingCount || 0,
      isFollowing,
    };
  } catch (err) {
    console.warn('fetchFollowStats fallback:', err);
    return getLocalFollowStats(targetUserId, currentUserId);
  }
}

/**
 * Check if current user is following target user
 */
export async function checkIsFollowing(
  followerId: string,
  followingId: string
): Promise<boolean> {
  if (!supabase || !followerId || !followingId || followerId === followingId) return false;

  try {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();

    if (error) {
      return getLocalIsFollowing(followerId, followingId);
    }

    return !!data;
  } catch {
    return getLocalIsFollowing(followerId, followingId);
  }
}

/**
 * Follow a user
 */
export async function followUser(
  followerId: string,
  followingId: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: 'Database not connected' };
  if (!followerId || !followingId) return { success: false, error: 'Authentication required' };
  if (followerId === followingId) return { success: false, error: 'Cannot follow yourself' };

  try {
    const { error } = await supabase.from('follows').insert({
      follower_id: followerId,
      following_id: followingId,
    });

    if (error) {
      if (error.code === '23505') {
        // Unique violation: already following
        saveLocalFollow(followerId, followingId, true);
        return { success: true };
      }
      if (error.code === 'PGRST205') {
        // Table not created yet; save locally so UI works smoothly
        saveLocalFollow(followerId, followingId, true);
        return { success: true };
      }
      return { success: false, error: error.message };
    }

    saveLocalFollow(followerId, followingId, true);
    return { success: true };
  } catch (err: any) {
    saveLocalFollow(followerId, followingId, true);
    return { success: true };
  }
}

/**
 * Unfollow a user
 */
export async function unfollowUser(
  followerId: string,
  followingId: string
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: 'Database not connected' };
  if (!followerId || !followingId) return { success: false, error: 'Authentication required' };

  try {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) {
      if (error.code === 'PGRST205') {
        saveLocalFollow(followerId, followingId, false);
        return { success: true };
      }
      return { success: false, error: error.message };
    }

    saveLocalFollow(followerId, followingId, false);
    return { success: true };
  } catch (err: any) {
    saveLocalFollow(followerId, followingId, false);
    return { success: true };
  }
}

/**
 * Fetch the list of followers for a given user
 */
export async function fetchFollowersList(targetUserId: string): Promise<UserProfileSummary[]> {
  if (!supabase || !targetUserId) return [];

  try {
    const { data: followRows, error } = await supabase
      .from('follows')
      .select('follower_id, created_at')
      .eq('following_id', targetUserId)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST205') return getLocalFollowersList(targetUserId);
      console.warn('fetchFollowersList error:', error.message);
      return [];
    }

    if (!followRows || followRows.length === 0) return [];

    const followerIds = followRows.map((r) => r.follower_id);
    const { data: profiles, error: pError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, account_type, bio')
      .in('id', followerIds);

    if (pError || !profiles) return [];

    const profilesMap = new Map<string, any>(profiles.map((p) => [p.id, p]));

    return followerIds
      .map((id) => profilesMap.get(id))
      .filter(Boolean)
      .map((p) => ({
        id: p.id,
        fullName: p.full_name || 'Sana Artist',
        username: deriveUsername(p),
        avatarUrl: p.avatar_url || null,
        accountType: p.account_type || 'lover',
        bio: p.bio || null,
      }));
  } catch (err) {
    console.warn('fetchFollowersList fallback:', err);
    return getLocalFollowersList(targetUserId);
  }
}

/**
 * Fetch the list of users that a given user is following
 */
export async function fetchFollowingList(targetUserId: string): Promise<UserProfileSummary[]> {
  if (!supabase || !targetUserId) return [];

  try {
    const { data: followRows, error } = await supabase
      .from('follows')
      .select('following_id, created_at')
      .eq('follower_id', targetUserId)
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST205') return getLocalFollowingList(targetUserId);
      console.warn('fetchFollowingList error:', error.message);
      return [];
    }

    if (!followRows || followRows.length === 0) return [];

    const followingIds = followRows.map((r) => r.following_id);
    const { data: profiles, error: pError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, account_type, bio')
      .in('id', followingIds);

    if (pError || !profiles) return [];

    const profilesMap = new Map<string, any>(profiles.map((p) => [p.id, p]));

    return followingIds
      .map((id) => profilesMap.get(id))
      .filter(Boolean)
      .map((p) => ({
        id: p.id,
        fullName: p.full_name || 'Sana Artist',
        username: deriveUsername(p),
        avatarUrl: p.avatar_url || null,
        accountType: p.account_type || 'lover',
        bio: p.bio || null,
      }));
  } catch (err) {
    console.warn('fetchFollowingList fallback:', err);
    return getLocalFollowingList(targetUserId);
  }
}

/**
 * Search user accounts by display name or username
 * Does NOT expose email or sensitive information
 */
export async function searchAccounts(
  query: string,
  excludeUserId?: string | null,
  limit = 20
): Promise<UserProfileSummary[]> {
  if (!supabase) return [];

  const cleanQuery = query.trim().replace(/^@+/, '');

  try {
    let builder = supabase
      .from('profiles')
      .select('id, full_name, avatar_url, account_type, bio');

    if (excludeUserId) {
      builder = builder.neq('id', excludeUserId);
    }

    if (cleanQuery) {
      builder = builder.ilike('full_name', `%${cleanQuery}%`);
    }

    const { data, error } = await builder.limit(limit);

    if (error || !data) {
      return [];
    }

    return data.map((p) => ({
      id: p.id,
      fullName: p.full_name || 'Sana Creator',
      username: deriveUsername(p),
      avatarUrl: p.avatar_url || null,
      accountType: p.account_type || 'artist',
      bio: p.bio || null,
    }));
  } catch (err) {
    console.error('searchAccounts error:', err);
    return [];
  }
}

/**
 * Update the user's last seen timestamp
 */
export async function updateUserLastSeen(userId: string): Promise<void> {
  if (!supabase || !userId) return;
  try {
    await supabase
      .from('profiles')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', userId);
  } catch {
    // Ignore silent update errors
  }
}

// -----------------------------------------------------------------------------
// LOCAL STORAGE FALLBACK HELPERS (Graceful resilience before SQL migration runs)
// -----------------------------------------------------------------------------
const LOCAL_STORAGE_FOLLOWS_KEY = 'sana_arts_follows_v1';

interface LocalFollowRecord {
  followerId: string;
  followingId: string;
}

function getStoredFollows(): LocalFollowRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_FOLLOWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalFollow(followerId: string, followingId: string, isFollow: boolean): void {
  try {
    const current = getStoredFollows();
    let updated: LocalFollowRecord[];
    if (isFollow) {
      if (!current.some((f) => f.followerId === followerId && f.followingId === followingId)) {
        updated = [...current, { followerId, followingId }];
      } else {
        updated = current;
      }
    } else {
      updated = current.filter(
        (f) => !(f.followerId === followerId && f.followingId === followingId)
      );
    }
    localStorage.setItem(LOCAL_STORAGE_FOLLOWS_KEY, JSON.stringify(updated));
  } catch {}
}

function getLocalIsFollowing(followerId: string, followingId: string): boolean {
  const follows = getStoredFollows();
  return follows.some((f) => f.followerId === followerId && f.followingId === followingId);
}

function getLocalFollowStats(targetUserId: string, currentUserId?: string | null): FollowStats {
  const follows = getStoredFollows();
  const followersCount = follows.filter((f) => f.followingId === targetUserId).length;
  const followingCount = follows.filter((f) => f.followerId === targetUserId).length;
  const isFollowing = currentUserId
    ? follows.some((f) => f.followerId === currentUserId && f.followingId === targetUserId)
    : false;

  return { followersCount, followingCount, isFollowing };
}

function getLocalFollowersList(targetUserId: string): UserProfileSummary[] {
  return [];
}

function getLocalFollowingList(targetUserId: string): UserProfileSummary[] {
  return [];
}
