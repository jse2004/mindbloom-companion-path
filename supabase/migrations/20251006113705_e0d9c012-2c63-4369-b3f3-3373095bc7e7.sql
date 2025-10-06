-- Allow admins to delete expert chat sessions
CREATE POLICY "Admins can delete expert chat sessions"
ON public.expert_chat_sessions
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));