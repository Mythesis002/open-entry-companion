import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserCredits {
  id: string;
  user_id: string;
  credits: number;
  trial_ends_at: string;
  upi_verified: boolean;
  created_at: string;
  updated_at: string;
}

export function useUserCredits() {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setCredits(null);
      setLoading(false);
      return;
    }

    fetchCredits();
  }, [user]);

  const fetchCredits = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching credits:', error);
        return;
      }

      setCredits(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const isTrialActive = () => {
    if (!credits) return false;
    return new Date(credits.trial_ends_at) > new Date();
  };

  const isRegistered = () => {
    return credits?.upi_verified === true;
  };

  const getDaysRemaining = () => {
    if (!credits) return 0;
    const now = new Date();
    const trialEnd = new Date(credits.trial_ends_at);
    const diff = trialEnd.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return {
    credits,
    loading,
    isTrialActive,
    isRegistered,
    getDaysRemaining,
    refetch: fetchCredits
  };
}
