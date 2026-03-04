import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TemplateStats {
  likes_count: number;
  used_count: number;
  is_trending: boolean;
}

export function useTemplateEngagement(templateId: string) {
  const [stats, setStats] = useState<TemplateStats>({ likes_count: 0, used_count: 0, is_trending: false });
  const [userLiked, setUserLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from('templates')
        .select('likes_count, used_count, is_trending')
        .eq('id', templateId)
        .single();
      if (data) setStats(data);

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: like } = await supabase
          .from('user_likes')
          .select('id')
          .eq('template_id', templateId)
          .eq('user_id', session.user.id)
          .maybeSingle();
        setUserLiked(!!like);
      }
      setLoading(false);
    };
    fetchStats();
  }, [templateId]);

  const toggleLike = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;

    if (userLiked) {
      await supabase.from('user_likes').delete()
        .eq('template_id', templateId)
        .eq('user_id', session.user.id);
      await supabase.from('templates').update({ likes_count: Math.max(0, stats.likes_count - 1) }).eq('id', templateId);
      setStats(s => ({ ...s, likes_count: Math.max(0, s.likes_count - 1) }));
      setUserLiked(false);
    } else {
      await supabase.from('user_likes').insert({ template_id: templateId, user_id: session.user.id });
      await supabase.from('templates').update({ likes_count: stats.likes_count + 1 }).eq('id', templateId);
      setStats(s => ({ ...s, likes_count: s.likes_count + 1 }));
      setUserLiked(true);
    }
    return true;
  }, [templateId, userLiked, stats.likes_count]);

  const incrementUsed = useCallback(async () => {
    await supabase.from('templates').update({ used_count: stats.used_count + 1 }).eq('id', templateId);
    setStats(s => ({ ...s, used_count: s.used_count + 1 }));
  }, [templateId, stats.used_count]);

  return { stats, userLiked, toggleLike, incrementUsed, loading };
}
