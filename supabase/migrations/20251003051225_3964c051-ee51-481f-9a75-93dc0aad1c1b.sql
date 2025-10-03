-- Drop the problematic policy first
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create user_roles table using the existing user_role enum
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Add policy for admins to view all profiles using the function
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Update assessment_results policies to use the function
DROP POLICY IF EXISTS "Admins can view all assessment results" ON public.assessment_results;
CREATE POLICY "Admins can view all assessment results"
ON public.assessment_results
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Update expert_chat_sessions policies to use the function
DROP POLICY IF EXISTS "Admins can view all expert chat sessions" ON public.expert_chat_sessions;
CREATE POLICY "Admins can view all expert chat sessions"
ON public.expert_chat_sessions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update all expert chat sessions" ON public.expert_chat_sessions;
CREATE POLICY "Admins can update all expert chat sessions"
ON public.expert_chat_sessions
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow users to view their own role
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, role
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;