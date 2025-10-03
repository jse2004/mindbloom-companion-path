-- Add policy for admins to view all assessment results
CREATE POLICY "Admins can view all assessment results"
ON public.assessment_results
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'::user_role
  )
);