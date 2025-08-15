-- First, let's update the existing user (Carlos Juls) to have admin role
UPDATE public.profiles 
SET role = 'admin'::user_role 
WHERE first_name = 'Carlos' AND last_name = 'Juls';

-- Update the handle_new_user function to respect the role from signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, role, first_name, last_name)
  VALUES (
    new.id, 
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'user'::user_role),  -- Use role from signup or default to 'user'
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name'
  );
  RETURN new;
END;
$function$;