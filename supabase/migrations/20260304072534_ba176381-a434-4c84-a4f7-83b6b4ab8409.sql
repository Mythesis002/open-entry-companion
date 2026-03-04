-- Templates table for real engagement tracking
CREATE TABLE public.templates (
  id text PRIMARY KEY,
  likes_count integer NOT NULL DEFAULT 0,
  used_count integer NOT NULL DEFAULT 0,
  is_trending boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- User likes table
CREATE TABLE public.user_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  template_id text NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, template_id)
);

-- RLS
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_likes ENABLE ROW LEVEL SECURITY;

-- Templates: public read
CREATE POLICY "Anyone can read templates" ON public.templates FOR SELECT USING (true);

-- User likes: public read, authenticated write
CREATE POLICY "Anyone can read likes" ON public.user_likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON public.user_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike their own" ON public.user_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Seed the car-sinking template
INSERT INTO public.templates (id, likes_count, used_count, is_trending)
VALUES ('car-sinking', 0, 0, true);

-- Trigger for updated_at
CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON public.templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();