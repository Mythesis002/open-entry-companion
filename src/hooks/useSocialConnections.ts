import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SocialConnection {
  platform: string;
  platform_username: string;
  platform_user_id: string;
  created_at: string;
  extra_data: Record<string, any>;
}

// Generate a unique session ID for this browser session
const getSessionId = () => {
  let sessionId = localStorage.getItem('opentry_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('opentry_session_id', sessionId);
  }
  return sessionId;
};

export function useSocialConnections() {
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  const sessionId = getSessionId();

  const fetchConnections = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-connections?session_id=${sessionId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );

      const result = await response.json();

      if (result.connections) {
        setConnections(result.connections);
      }
    } catch (err) {
      console.error('Error fetching connections:', err);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchConnections();

    // Listen for OAuth callback messages
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'youtube-auth-success') {
        toast.success(`Connected to YouTube: ${event.data.channelName}`);
        fetchConnections();
        setConnecting(null);
      } else if (event.data?.type === 'youtube-auth-error') {
        toast.error(`YouTube connection failed: ${event.data.error}`);
        setConnecting(null);
      } else if (event.data?.type === 'instagram-auth-success') {
        toast.success(`Connected to Instagram: ${event.data.username}`);
        fetchConnections();
        setConnecting(null);
      } else if (event.data?.type === 'instagram-auth-error') {
        toast.error(`Instagram connection failed: ${event.data.error}`);
        setConnecting(null);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [fetchConnections]);

  const connectYouTube = async () => {
    setConnecting('youtube');
    try {
      const redirectUri = window.location.origin;
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/youtube-auth?action=authorize&session_id=${sessionId}&redirect_uri=${encodeURIComponent(redirectUri)}`,
        {
          method: 'GET',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );

      const data = await response.json();
      
      if (data.authUrl) {
        // Open OAuth popup
        const popup = window.open(data.authUrl, 'youtube-auth', 'width=600,height=700');
        
        // Check if popup was blocked
        if (!popup) {
          toast.error('Please allow popups to connect your YouTube account');
          setConnecting(null);
        }
      } else {
        toast.error('Failed to start YouTube connection');
        setConnecting(null);
      }
    } catch (err) {
      console.error('YouTube connect error:', err);
      toast.error('Failed to connect YouTube');
      setConnecting(null);
    }
  };

  const connectInstagram = async () => {
    setConnecting('instagram');
    try {
      const redirectUri = window.location.origin;
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/instagram-auth?action=authorize&session_id=${sessionId}&redirect_uri=${encodeURIComponent(redirectUri)}`,
        {
          method: 'GET',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );

      const data = await response.json();
      
      if (data.authUrl) {
        const popup = window.open(data.authUrl, 'instagram-auth', 'width=600,height=700');
        
        if (!popup) {
          toast.error('Please allow popups to connect your Instagram account');
          setConnecting(null);
        }
      } else {
        toast.error('Failed to start Instagram connection');
        setConnecting(null);
      }
    } catch (err) {
      console.error('Instagram connect error:', err);
      toast.error('Failed to connect Instagram');
      setConnecting(null);
    }
  };

  const disconnect = async (platform: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/disconnect-social`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ sessionId, platform }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success(`Disconnected from ${platform}`);
        fetchConnections();
      } else {
        toast.error(`Failed to disconnect from ${platform}`);
      }
    } catch (err) {
      console.error('Disconnect error:', err);
      toast.error(`Failed to disconnect from ${platform}`);
    }
  };

  const postToSocial = async (platforms: string[], caption: string, videoUrl?: string, imageUrl?: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/post-to-social`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ sessionId, platforms, caption, videoUrl, imageUrl }),
        }
      );

      const result = await response.json();
      return result;
    } catch (err) {
      console.error('Post to social error:', err);
      throw err;
    }
  };

  const isConnected = (platform: string) => {
    return connections.some(c => c.platform === platform);
  };

  const getConnection = (platform: string) => {
    return connections.find(c => c.platform === platform);
  };

  return {
    connections,
    loading,
    connecting,
    connectYouTube,
    connectInstagram,
    disconnect,
    postToSocial,
    isConnected,
    getConnection,
    refetch: fetchConnections,
  };
}
