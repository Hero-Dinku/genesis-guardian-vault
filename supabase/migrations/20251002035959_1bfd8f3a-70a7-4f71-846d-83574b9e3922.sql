-- Phase 1: Secure User Profile Data
-- Update RLS policy to restrict profile viewing to authenticated users only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Profiles are viewable by authenticated users" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Add policy for anonymous users to view only their own profile after signup
CREATE POLICY "Users can view their own profile during signup" 
ON public.profiles 
FOR SELECT 
TO anon
USING (auth.uid() = user_id);