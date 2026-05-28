import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { ConversationList } from '@/components/messages/ConversationList';
import { MessageThread } from '@/components/messages/MessageThread';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const conversationId = searchParams.get('conversation');
  
  const { conversations, loading: convsLoading, fetchConversations, getOrCreateConversation } = useConversations();
  const { messages, loading: msgsLoading, sendMessage } = useMessages(conversationId);
  
  const [otherUserName, setOtherUserName] = useState<string>('');
  const [itemTitle, setItemTitle] = useState<string>('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  // Start a new conversation from URL params (when coming from item detail)
  useEffect(() => {
    const sellerId = searchParams.get('seller');
    const itemId = searchParams.get('item');
    
    if (sellerId && user && sellerId !== user.id) {
      getOrCreateConversation(sellerId, itemId || undefined).then((convId) => {
        if (convId) {
          setSearchParams({ conversation: convId });
          fetchConversations();
        }
      });
    }
  }, [searchParams, user]);

  // Fetch conversation details when selected
  useEffect(() => {
    const fetchConversationDetails = async () => {
      if (!conversationId || !user) return;
      
      const { data: conv } = await supabase
        .from('conversations')
        .select('*, item:items(title)')
        .eq('id', conversationId)
        .maybeSingle();

      if (conv) {
        const otherUserId = conv.participant_one === user.id 
          ? conv.participant_two 
          : conv.participant_one;
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', otherUserId)
          .maybeSingle();
        
        setOtherUserName(profile?.full_name || 'User');
        setItemTitle(conv.item?.title || '');
      }
    };

    fetchConversationDetails();
  }, [conversationId, user]);

  const handleSelectConversation = (id: string) => {
    setSearchParams({ conversation: id });
  };

  const handleBack = () => {
    setSearchParams({});
    setOtherUserName('');
    setItemTitle('');
  };

  if (!user) return null;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-[320px_1fr] min-h-[600px]">
            {/* Conversation List - hidden on mobile when viewing a conversation */}
            <div className={`border-r ${conversationId ? 'hidden md:block' : ''}`}>
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Messages
                </CardTitle>
              </CardHeader>
              <ConversationList
                conversations={conversations}
                loading={convsLoading}
                selectedId={conversationId}
                onSelect={handleSelectConversation}
              />
            </div>

            {/* Message Thread */}
            <div className={`flex flex-col ${!conversationId ? 'hidden md:flex' : ''}`}>
              {conversationId ? (
                <>
                  <CardHeader className="border-b py-3">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        onClick={handleBack}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <div>
                        <CardTitle className="text-base">{otherUserName}</CardTitle>
                        {itemTitle && (
                          <p className="text-sm text-muted-foreground">Re: {itemTitle}</p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <div className="flex-1">
                    <MessageThread
                      messages={messages}
                      loading={msgsLoading}
                      onSend={sendMessage}
                    />
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 space-y-6">
                  <div className="text-center max-w-sm space-y-2">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary mb-2">
                      <MessageSquare className="h-8 w-8" />
                    </div>
                    <p className="text-lg font-bold text-foreground">Select a conversation</p>
                    <p className="text-xs text-muted-foreground">Choose a conversation from the left to read buyer inquiries or send messages</p>
                  </div>

                  {/* Dummy Purchase Message Samples Preview Card */}
                  <div className="w-full max-w-md p-4 rounded-xl border bg-muted/40 text-left space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-primary border-b pb-2">
                      <span>🏷️ Sample Buyer Purchase Inquiries</span>
                      <span className="text-[10px] bg-primary/10 px-2 py-0.5 rounded-full">Demo</span>
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-card border space-y-1">
                        <div className="flex justify-between font-bold text-foreground">
                          <span>Rahul Sharma</span>
                          <span className="text-[10px] text-muted-foreground">10 mins ago</span>
                        </div>
                        <p className="text-muted-foreground italic">"Hi! Is your Cordless Drill still available for purchase? Can I pay $15 via UPI for advance booking?"</p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-card border space-y-1">
                        <div className="flex justify-between font-bold text-foreground">
                          <span>Priya Verma</span>
                          <span className="text-[10px] text-muted-foreground">1 hour ago</span>
                        </div>
                        <p className="text-muted-foreground italic">"Hello, I am interested in buying the Air Fryer. Where can we meet for pickup?"</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Messages;
