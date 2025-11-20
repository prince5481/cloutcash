import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useUnreadCount(currentProfileId: string | null) {
  const [totalUnread, setTotalUnread] = useState(0);
  const [unreadByConversation, setUnreadByConversation] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!currentProfileId) return;

    const fetchUnreadCounts = async () => {
      // Get all conversations for current user
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .or(`creator_id.eq.${currentProfileId},brand_id.eq.${currentProfileId}`);

      if (!conversations) return;

      const conversationIds = conversations.map(c => c.id);

      // Get unread message counts for each conversation
      const unreadCounts: Record<string, number> = {};
      let total = 0;

      for (const convId of conversationIds) {
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', convId)
          .neq('sender_id', currentProfileId)
          .is('read_at', null);

        const unreadCount = count || 0;
        unreadCounts[convId] = unreadCount;
        total += unreadCount;
      }

      setUnreadByConversation(unreadCounts);
      setTotalUnread(total);
    };

    fetchUnreadCounts();

    // Set up realtime subscription for new messages
    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchUnreadCounts();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        () => {
          fetchUnreadCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentProfileId]);

  const markConversationAsRead = async (conversationId: string) => {
    if (!currentProfileId) return;

    // Mark all unread messages in this conversation as read
    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', currentProfileId)
      .is('read_at', null);

    if (!error) {
      // Update local state
      setUnreadByConversation(prev => ({
        ...prev,
        [conversationId]: 0,
      }));
      setTotalUnread(prev => Math.max(0, prev - (unreadByConversation[conversationId] || 0)));
    }
  };

  return {
    totalUnread,
    unreadByConversation,
    markConversationAsRead,
  };
}
