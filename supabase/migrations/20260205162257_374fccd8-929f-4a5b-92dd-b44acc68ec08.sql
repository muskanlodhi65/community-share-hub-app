-- Create conversations table
CREATE TABLE public.conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
  participant_one UUID NOT NULL,
  participant_two UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(item_id, participant_one, participant_two)
);

-- Create messages table
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_conversations_participants ON public.conversations(participant_one, participant_two);

-- Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view own conversations"
ON public.conversations FOR SELECT
USING (auth.uid() = participant_one OR auth.uid() = participant_two);

CREATE POLICY "Users can create conversations"
ON public.conversations FOR INSERT
WITH CHECK (auth.uid() = participant_one OR auth.uid() = participant_two);

CREATE POLICY "Admins can view all conversations"
ON public.conversations FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their conversations"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
  )
);

CREATE POLICY "Users can mark messages as read"
ON public.messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
    AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid())
  )
);

CREATE POLICY "Admins can view all messages"
ON public.messages FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Add trigger for conversation updated_at
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;