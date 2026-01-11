-- Create table for storing social platform connections
CREATE TABLE public.social_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('youtube', 'instagram')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMP WITH TIME ZONE,
  platform_user_id TEXT,
  platform_username TEXT,
  extra_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, platform)
);

-- Enable RLS
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read their own connections (by session_id)
CREATE POLICY "Anyone can read their own connections"
ON public.social_connections
FOR SELECT
USING (true);

-- Allow anyone to insert connections
CREATE POLICY "Anyone can insert connections"
ON public.social_connections
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update their own connections
CREATE POLICY "Anyone can update connections"
ON public.social_connections
FOR UPDATE
USING (true);

-- Allow anyone to delete their own connections
CREATE POLICY "Anyone can delete connections"
ON public.social_connections
FOR DELETE
USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_social_connections_updated_at
BEFORE UPDATE ON public.social_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();