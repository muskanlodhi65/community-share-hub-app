import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';

interface Conversation {
  id: string;
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

interface ConversationListProps {
  conversations: Conversation[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const ConversationList = ({ 
  conversations, 
  loading, 
  selectedId, 
  onSelect 
}: ConversationListProps) => {
  if (loading) {
    return (
      <div className="space-y-2 p-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 p-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-muted-foreground p-4">
        <MessageSquare className="h-10 w-10 mb-2" />
        <p className="text-center">No conversations yet</p>
        <p className="text-sm text-center">Start by contacting a seller on an item you're interested in</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="space-y-1 p-2">
        {conversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`w-full flex gap-3 p-3 rounded-lg text-left transition-colors hover:bg-muted ${
              selectedId === conv.id ? 'bg-muted' : ''
            }`}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={conv.other_user?.avatar_url || undefined} />
              <AvatarFallback>
                {conv.other_user?.full_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium truncate">
                  {conv.other_user?.full_name || 'User'}
                </span>
                {conv.unread_count > 0 && (
                  <Badge variant="default" className="h-5 min-w-5 flex items-center justify-center">
                    {conv.unread_count}
                  </Badge>
                )}
              </div>
              {conv.item && (
                <p className="text-xs text-muted-foreground truncate">
                  Re: {conv.item.title}
                </p>
              )}
              {conv.last_message && (
                <p className="text-sm text-muted-foreground truncate">
                  {conv.last_message.content}
                </p>
              )}
              {conv.last_message && (
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: true })}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};
