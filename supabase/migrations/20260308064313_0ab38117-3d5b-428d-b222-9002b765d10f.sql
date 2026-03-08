
-- Fix social_connections RLS: drop overly permissive policies and add proper ones
DROP POLICY IF EXISTS "Anyone can read their own connections" ON public.social_connections;
DROP POLICY IF EXISTS "Anyone can update connections" ON public.social_connections;
DROP POLICY IF EXISTS "Anyone can delete connections" ON public.social_connections;
DROP POLICY IF EXISTS "Anyone can insert connections" ON public.social_connections;

-- Add a user_id column to social_connections for proper RLS
ALTER TABLE public.social_connections ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create proper RLS policies scoped to user_id
CREATE POLICY "Users can read their own connections"
ON public.social_connections FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own connections"
ON public.social_connections FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own connections"
ON public.social_connections FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own connections"
ON public.social_connections FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
