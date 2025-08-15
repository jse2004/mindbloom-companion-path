-- Create the update function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create expert chat sessions table
CREATE TABLE public.expert_chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  admin_id UUID NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed')),
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_request_reason TEXT,
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent'))
);

-- Enable Row Level Security
ALTER TABLE public.expert_chat_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for expert chat sessions
CREATE POLICY "Users can view their own expert chat sessions" 
ON public.expert_chat_sessions 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = admin_id);

CREATE POLICY "Users can create their own expert chat sessions" 
ON public.expert_chat_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expert chat sessions" 
ON public.expert_chat_sessions 
FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() = admin_id);

-- Admins can view and update all expert chat sessions
CREATE POLICY "Admins can view all expert chat sessions" 
ON public.expert_chat_sessions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

CREATE POLICY "Admins can update all expert chat sessions" 
ON public.expert_chat_sessions 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_expert_chat_sessions_updated_at
BEFORE UPDATE ON public.expert_chat_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for expert chat sessions
ALTER TABLE public.expert_chat_sessions REPLICA IDENTITY FULL;