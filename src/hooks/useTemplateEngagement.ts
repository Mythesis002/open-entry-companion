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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;

    const { data: currentTemplate } = await supabase
      .from('templates')
      .select('used_count')
      .eq('id', templateId)
      .maybeSingle();

    if (!currentTemplate) return false;

    const nextUsedCount = currentTemplate.used_count + 1;
    const { error } = await supabase
      .from('templates')
      .update({ used_count: nextUsedCount })
      .eq('id', templateId);

    if (error) return false;

    setStats(s => ({ ...s, used_count: nextUsedCount }));
    return true;
  }, [templateId]);

  return { stats, userLiked, toggleLike, incrementUsed, loading };
}
