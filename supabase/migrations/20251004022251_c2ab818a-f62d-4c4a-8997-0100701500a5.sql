-- Create department enum
CREATE TYPE public.department_type AS ENUM (
  'College of Computing Studies',
  'College of Health Sciences',
  'College of Criminal Justice',
  'College of Education',
  'College of Business and Public Management',
  'College of Law',
  'College of Arts and Sciences'
);

-- Add department column to profiles table
ALTER TABLE public.profiles
ADD COLUMN department department_type;

-- Add comment to explain department is for users only
COMMENT ON COLUMN public.profiles.department IS 'Department affiliation - only applicable for users with role ''user'', not admins';