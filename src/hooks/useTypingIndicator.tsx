import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useTypingIndicator(conversationId: string | null, currentUserId: string | null) {
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!conversationId || !currentUserId) return;

    const channel: RealtimeChannel = supabase.channel(`typing:${conversationId}`, {
      config: {
        presence: {
          key: currentUserId,
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        // Check if anyone other than current user is typing
        const otherUsers = Object.keys(state).filter(key => key !== currentUserId);
        const someoneTyping = otherUsers.some(key => {
          const presences = state[key];
          return presences.some((p: any) => p.typing === true);
        });
        setIsOtherUserTyping(someoneTyping);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUserId]);

  const startTyping = () => {
    if (!conversationId || !currentUserId) return;

    const channel = supabase.channel(`typing:${conversationId}`);
    channel.track({ typing: true, userId: currentUserId });

    // Clear any existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Stop typing after 2 seconds of inactivity
    const timeout = setTimeout(() => {
      stopTyping();
    }, 2000);

    setTypingTimeout(timeout);
  };

  const stopTyping = () => {
    if (!conversationId || !currentUserId) return;

    const channel = supabase.channel(`typing:${conversationId}`);
    channel.track({ typing: false, userId: currentUserId });

    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }
  };

  return {
    isOtherUserTyping,
    startTyping,
    stopTyping,
  };
}
