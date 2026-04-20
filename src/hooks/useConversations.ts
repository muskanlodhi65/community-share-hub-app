import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Conversation {
  id: string;
  item_id: string | null;
  participant_one: string;
  participant_two: string;
  created_at: string;
  updated_at: string;
  item?: {
    title: string;
    image_url: string | null;
  };
  other_user?: {
    full_name: string | null;
    avatar_url: string | null;
  };
  last_message?: {
    content: string;
    created_at: string;
    is_read: boolean;
    sender_id: string;
  };
  unread_count: number;
}

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    if (!user) return;
    
    setLoading(true);
    
    const { data: convData, error } = await supabase
      .from('conversations')
      .select(`
        *,
        item:items(title, image_url)
      `)
      .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
      .order('updated_at', { ascending: false });

    if (error || !convData) {
      setLoading(false);
      return;
    }

    // Fetch last messages and other user profiles
    const enrichedConversations = await Promise.all(
      convData.map(async (conv) => {
        const otherUserId = conv.participant_one === user.id 
          ? conv.participant_two 
          : conv.participant_one;

        // Get other user's profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', otherUserId)
          .maybeSingle();

        // Get last message
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('content, created_at, is_read, sender_id')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Get unread count
        const { count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('is_read', false)
          .neq('sender_id', user.id);

        return {
          ...conv,
          other_user: profile,
          last_message: lastMessage || undefined,
          unread_count: count || 0,
        };
      })
    );

    setConversations(enrichedConversations);
    setLoading(false);
  };

  const getOrCreateConversation = async (otherUserId: string, itemId?: string) => {
    if (!user) return null;

    // Check if conversation exists
    let query = supabase
      .from('conversations')
      .select('id')
      .or(`and(participant_one.eq.${user.id},participant_two.eq.${otherUserId}),and(participant_one.eq.${otherUserId},participant_two.eq.${user.id})`);
    
    if (itemId) {
      query = query.eq('item_id', itemId);
    } else {
      query = query.is('item_id', null);
    }
    
    const { data: existing } = await query.maybeSingle();

    if (existing) return existing.id;

    // Create new conversation
    const { data: newConv, error } = await supabase
      .from('conversations')
      .insert({
        participant_one: user.id,
        participant_two: otherUserId,
        item_id: itemId || null,
      })
      .select('id')
      .single();

    if (error) return null;
    return newConv.id;
  };

  useEffect(() => {
    fetchConversations();
  }, [user]);

  return { conversations, loading, fetchConversations, getOrCreateConversation };
};
