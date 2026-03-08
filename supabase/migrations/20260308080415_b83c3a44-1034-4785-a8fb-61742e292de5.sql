
CREATE TABLE public.seo_tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  tool_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  tagline TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  meta_title TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  
  -- Comparison data
  opentry_features JSONB NOT NULL DEFAULT '[]'::jsonb,
  competitor_features JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Quick stats
  pricing_info TEXT NOT NULL DEFAULT 'Free',
  is_open_source BOOLEAN NOT NULL DEFAULT false,
  ease_of_trial_score INTEGER NOT NULL DEFAULT 8,
  
  -- SEO juice
  lsi_keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  people_also_ask JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_tool_slugs JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Freshness signals
  status TEXT NOT NULL DEFAULT 'online',
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Public read access (SEO pages must be crawlable)
ALTER TABLE public.seo_tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read seo_tools" ON public.seo_tools FOR SELECT USING (true);

-- Voting table
CREATE TABLE public.seo_tool_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id UUID REFERENCES public.seo_tools(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tool_id, user_id)
);

ALTER TABLE public.seo_tool_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read votes" ON public.seo_tool_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON public.seo_tool_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own votes" ON public.seo_tool_votes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
