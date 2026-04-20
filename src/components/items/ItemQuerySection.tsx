import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ItemQuerySectionProps {
  itemId: string;
  ownerId: string;
  ownerName: string;
}

export const ItemQuerySection = ({ itemId, ownerId, ownerName }: ItemQuerySectionProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getOrCreateConversation } = useConversations();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const { messages, loading: msgsLoading, sendMessage } = useMessages(conversationId);

  const initConversation = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setInitializing(true);
    const convId = await getOrCreateConversation(ownerId, itemId);
    if (convId) {
      setConversationId(convId);
    }
    setInitializing(false);
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    // Auto-init conversation if not yet started
    if (!conversationId) {
      if (!user) {
        navigate('/auth');
        return;
      }
      setSending(true);
      const convId = await getOrCreateConversation(ownerId, itemId);
      if (convId) {
        setConversationId(convId);
        // Need to wait a tick for the hook to pick up the new conversationId
        setTimeout(async () => {
          const { error } = await (await import('@/integrations/supabase/client')).supabase
            .from('messages')
            .insert({
              conversation_id: convId,
              sender_id: user!.id,
              content: newMessage.trim(),
            });
          if (!error) {
            await (await import('@/integrations/supabase/client')).supabase
              .from('conversations')
              .update({ updated_at: new Date().toISOString() })
              .eq('id', convId);
            setNewMessage('');
          }
          setSending(false);
        }, 100);
      } else {
        setSending(false);
      }
      return;
    }

    setSending(true);
    const success = await sendMessage(newMessage);
    if (success) setNewMessage('');
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Ask a Question
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Show existing messages if conversation is open */}
        {conversationId && messages.length > 0 && (
          <ScrollArea className="h-48 border rounded-lg p-3">
            <div className="space-y-3">
              {messages.map((msg) => {
                const isOwn = msg.sender_id === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                        isOwn
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className={cn(
                        'text-[10px] mt-1',
                        isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      )}>
                        {format(new Date(msg.created_at), 'p')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}

        {conversationId && msgsLoading && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Message input - always visible */}
        <div className="flex gap-2">
          <Textarea
            placeholder={`Ask ${ownerName} about this item...`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[50px] resize-none text-sm"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!newMessage.trim() || sending || initializing}
            className="shrink-0"
          >
            {sending || initializing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {conversationId && (
          <Button
            variant="link"
            size="sm"
            className="p-0 h-auto text-xs"
            onClick={() => navigate(`/messages?conversation=${conversationId}`)}
          >
            View full conversation →
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
