-- Add UPDATE policy for conversations so participants can update updated_at
CREATE POLICY "Participants can update conversations"
ON public.conversations
FOR UPDATE
USING ((auth.uid() = participant_one) OR (auth.uid() = participant_two))
WITH CHECK ((auth.uid() = participant_one) OR (auth.uid() = participant_two));