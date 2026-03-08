
-- Add columns to track server-side generation state
ALTER TABLE public.ad_transactions 
  ADD COLUMN IF NOT EXISTS template_id text,
  ADD COLUMN IF NOT EXISTS generated_images jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS generated_videos jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS final_video_url text,
  ADD COLUMN IF NOT EXISTS generation_status text DEFAULT 'pending';

-- Allow service role to update transactions (for webhook)
-- The existing RLS policies are fine since webhook uses service role key
