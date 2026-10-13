import { supabase } from './supabase';

export interface ChatParticipant {
  id: string;
  name: string;
  avatarUrl: string | null;
  accountType: string;
  initials: string;
  online?: boolean;
}

export interface ConversationItem {
  id: string;
  participant1_id: string;
  participant2_id: string;
  last_message_text: string;
  last_message_at: string;
  created_at: string;
  otherUser: ChatParticipant;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

/**
 * Extract initials from a name
 */
export function getInitials(name: string): string {
  if (!name) return 'SA';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Fetch all conversations for the authenticated user, enriched with the other participant's profile and unread count.
 */
export async function fetchUserConversations(currentUserId: string): Promise<ConversationItem[]> {
  if (!supabase || !currentUserId) return [];

  try {
    // 1. Fetch conversations where user is participant1 or participant2
    const { data: convs, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .or(`participant1_id.eq.${currentUserId},participant2_id.eq.${currentUserId}`)
      .order('last_message_at', { ascending: false });

    if (convError) {
      console.warn('Error fetching conversations from Supabase:', convError.message);
      return [];
    }

    if (!convs || convs.length === 0) return [];

    // 2. Collect other participant IDs
    const otherUserIds = convs.map((c) =>
      c.participant1_id === currentUserId ? c.participant2_id : c.participant1_id
    );

    // 3. Fetch profiles for these users
    const { data: profiles, error: profError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, account_type')
      .in('id', otherUserIds);

    if (profError) {
      console.warn('Error fetching profiles for conversations:', profError.message);
    }

    const profilesMap = new Map<string, any>();
    if (profiles) {
      profiles.forEach((p) => profilesMap.set(p.id, p));
    }

    // 4. Fetch unread counts for each conversation
    const convIds = convs.map((c) => c.id);
    const { data: unreadData } = await supabase
      .from('messages')
      .select('conversation_id')
      .in('conversation_id', convIds)
      .neq('sender_id', currentUserId)
      .eq('is_read', false);

    const unreadCountMap: Record<string, number> = {};
    if (unreadData) {
      unreadData.forEach((m) => {
        unreadCountMap[m.conversation_id] = (unreadCountMap[m.conversation_id] || 0) + 1;
      });
    }

    // 5. Build enriched list
    return convs.map((c) => {
      const otherId = c.participant1_id === currentUserId ? c.participant2_id : c.participant1_id;
      const prof = profilesMap.get(otherId);
      const name = prof?.full_name || 'Artisan';
      return {
        id: c.id,
        participant1_id: c.participant1_id,
        participant2_id: c.participant2_id,
        last_message_text: c.last_message_text || '',
        last_message_at: c.last_message_at || c.created_at,
        created_at: c.created_at,
        unreadCount: unreadCountMap[c.id] || 0,
        otherUser: {
          id: otherId,
          name,
          avatarUrl: prof?.avatar_url || null,
          accountType: prof?.account_type || 'artist',
          initials: getInitials(name),
          online: true,
        },
      };
    });
  } catch (err) {
    console.error('fetchUserConversations error:', err);
    return [];
  }
}

/**
 * Fetch messages for a specific conversation in chronological order
 */
export async function fetchConversationMessages(conversationId: string): Promise<ChatMessage[]> {
  if (!supabase || !conversationId) return [];

  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Error fetching messages from Supabase:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('fetchConversationMessages error:', err);
    return [];
  }
}

/**
 * Send a message and persist to Supabase
 */
export async function sendChatMessage(
  conversationId: string,
  senderId: string,
  content: string
): Promise<{ message: ChatMessage | null; error: string | null }> {
  if (!supabase) return { message: null, error: 'Database client not connected' };
  if (!content.trim()) return { message: null, error: 'Message cannot be empty' };

  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content.trim(),
        is_read: false,
      })
      .select('*')
      .single();

    if (error) {
      return { message: null, error: error.message };
    }

    return { message: data, error: null };
  } catch (err: any) {
    return { message: null, error: err.message || 'Failed to send message' };
  }
}

/**
 * Mark messages in a conversation as read for the current user
 */
export async function markConversationAsRead(
  conversationId: string,
  currentUserId: string
): Promise<void> {
  if (!supabase || !conversationId || !currentUserId) return;

  try {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', currentUserId)
      .eq('is_read', false);
  } catch (err) {
    console.warn('markConversationAsRead error:', err);
  }
}

/**
 * Get or create a conversation with a specified user (artist / collector)
 */
export async function getOrCreateConversation(
  currentUserId: string,
  otherUserId: string
): Promise<{ conversationId: string | null; error: string | null }> {
  if (!supabase) return { conversationId: null, error: 'Database not connected' };
  if (!currentUserId || !otherUserId) return { conversationId: null, error: 'User IDs required' };
  if (currentUserId === otherUserId) return { conversationId: null, error: 'Cannot chat with yourself' };

  try {
    // 1. Try to invoke the RPC helper if available
    const { data: rpcConvId, error: rpcError } = await supabase.rpc('get_or_create_conversation', {
      p_other_user_id: otherUserId,
    });

    if (!rpcError && rpcConvId) {
      return { conversationId: rpcConvId, error: null };
    }

    // 2. Fallback to direct query & insert if RPC is not deployed yet
    const { data: existing, error: findError } = await supabase
      .from('conversations')
      .select('id')
      .or(
        `and(participant1_id.eq.${currentUserId},participant2_id.eq.${otherUserId}),and(participant1_id.eq.${otherUserId},participant2_id.eq.${currentUserId})`
      )
      .maybeSingle();

    if (!findError && existing?.id) {
      return { conversationId: existing.id, error: null };
    }

    // Create new conversation
    const { data: created, error: insertError } = await supabase
      .from('conversations')
      .insert({
        participant1_id: currentUserId,
        participant2_id: otherUserId,
      })
      .select('id')
      .single();

    if (insertError) {
      return { conversationId: null, error: insertError.message };
    }

    return { conversationId: created.id, error: null };
  } catch (err: any) {
    return { conversationId: null, error: err.message || 'Failed to start conversation' };
  }
}

/**
 * Search profiles for artists or collectors to message
 */
export async function searchProfiles(
  query: string,
  currentUserId: string
): Promise<ChatParticipant[]> {
  if (!supabase) return [];

  try {
    let builder = supabase
      .from('profiles')
      .select('id, full_name, avatar_url, account_type')
      .neq('id', currentUserId)
      .limit(10);

    if (query.trim()) {
      builder = builder.ilike('full_name', `%${query.trim()}%`);
    }

    const { data, error } = await builder;
    if (error || !data) return [];

    return data.map((p) => ({
      id: p.id,
      name: p.full_name || 'Sana Artist',
      avatarUrl: p.avatar_url,
      accountType: p.account_type || 'artist',
      initials: getInitials(p.full_name || 'SA'),
      online: true,
    }));
  } catch (err) {
    console.error('searchProfiles error:', err);
    return [];
  }
}

/**
 * Subscribe to real-time messages for a given conversation
 */
export function subscribeToMessages(
  conversationId: string,
  onNewMessage: (msg: ChatMessage) => void
) {
  if (!supabase || !conversationId) return () => {};

  const channelName = `chat_messages_${conversationId}`;
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        if (payload.new) {
          onNewMessage(payload.new as ChatMessage);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to conversations updates for the user's inbox
 */
export function subscribeToInbox(
  currentUserId: string,
  onInboxUpdate: () => void
) {
  if (!supabase || !currentUserId) return () => {};

  const channelName = `inbox_${currentUserId}`;
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations',
      },
      () => {
        onInboxUpdate();
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      },
      () => {
        onInboxUpdate();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
