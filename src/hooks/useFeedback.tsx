import { useCallback } from 'react';
import { InteractionType } from '@/types/matchmaking';
import { mockApi } from '@/lib/mockApi';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useFeedback() {
  const { user } = useAuth();

  const recordFeedback = useCallback(async (
    targetId: string,
    type: InteractionType
  ) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in',
        variant: 'destructive'
      });
      return;
    }

    try {
      await mockApi.recordInteraction(user.id, targetId, type);
      
      // Track analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', `swipe_${type}`, {
          user_id: user.id,
          target_id: targetId
        });
      }

      // Check for mutual match if this is a like/superlike
      if (type === 'like' || type === 'superlike') {
        await checkAndCreateConversation(targetId);
        
        toast({
          title: type === 'superlike' ? '⭐ Super Like!' : '❤️ Liked',
          description: 'Match saved to your preferences'
        });
      }
    } catch (error) {
      console.error('Error recording feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your action',
        variant: 'destructive'
      });
    }
  }, [user]);

  const checkAndCreateConversation = async (targetId: string) => {
    if (!user) return;

    try {
      // Get current user's profile
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id, user_type')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!userProfile) return;

      // Check for mutual match (simplified: 30% chance for demo purposes)
      // In production, this would check if both parties liked each other
      const isMutualMatch = Math.random() < 0.3;

      if (isMutualMatch) {
        // For demo: Get a random other profile to create conversation with
        const { data: otherProfiles } = await supabase
          .from('profiles')
          .select('id, user_type')
          .neq('user_id', user.id)
          .limit(1);

        if (!otherProfiles || otherProfiles.length === 0) return;

        const targetProfile = otherProfiles[0];

        // Determine creator and brand IDs
        const creatorId = userProfile.user_type === 'creator' ? userProfile.id : targetProfile.id;
        const brandId = userProfile.user_type === 'brand' ? userProfile.id : targetProfile.id;

        // Check if conversation already exists
        const { data: existingConversation } = await supabase
          .from('conversations')
          .select('id')
          .eq('creator_id', creatorId)
          .eq('brand_id', brandId)
          .maybeSingle();

        if (!existingConversation) {
          // Create new conversation
          const { error } = await supabase
            .from('conversations')
            .insert({
              creator_id: creatorId,
              brand_id: brandId,
              last_message_at: new Date().toISOString()
            });

          if (!error) {
            toast({
              title: '🎉 It\'s a Match!',
              description: 'Conversation started! Check your Messages.',
              duration: 5000,
            });
          }
        }
      }
    } catch (error) {
      console.error('Error checking for mutual match:', error);
    }
  };

  return { recordFeedback };
}
