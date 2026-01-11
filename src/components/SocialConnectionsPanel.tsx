import { Youtube, Instagram, Check, Loader2, X, Link2 } from 'lucide-react';
import { useSocialConnections } from '@/hooks/useSocialConnections';

export function SocialConnectionsPanel() {
  const {
    loading,
    connecting,
    connectYouTube,
    connectInstagram,
    disconnect,
    isConnected,
    getConnection,
  } = useSocialConnections();

  const youtubeConnection = getConnection('youtube');
  const instagramConnection = getConnection('instagram');

  return (
    <div className="w-full glass-card p-6 lg:p-8 card-shadow">
      <div className="flex items-center gap-3 mb-6">
        <Link2 className="w-5 h-5 text-primary" />
        <h3 className="text-sm font-extrabold uppercase tracking-widest text-foreground/60">
          Connect & Post Directly
        </h3>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Connect your YouTube and Instagram accounts to post your generated ads directly to your channels.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* YouTube Connection */}
        <div className={`relative p-5 rounded-2xl border-2 transition-all ${
          isConnected('youtube') 
            ? 'border-red-500/30 bg-red-500/5' 
            : 'border-foreground/10 bg-card/30 hover:bg-card/50'
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isConnected('youtube') ? 'bg-red-500' : 'bg-foreground/10'
              }`}>
                <Youtube className={`w-5 h-5 ${isConnected('youtube') ? 'text-white' : 'text-foreground/50'}`} />
              </div>
              <div>
                <h4 className="font-bold text-sm">YouTube</h4>
                {youtubeConnection && (
                  <p className="text-xs text-muted-foreground">{youtubeConnection.platform_username}</p>
                )}
              </div>
            </div>
            {isConnected('youtube') && (
              <button
                onClick={() => disconnect('youtube')}
                className="p-1.5 rounded-lg hover:bg-foreground/10 transition-colors"
                title="Disconnect"
              >
                <X className="w-4 h-4 text-foreground/40" />
              </button>
            )}
          </div>

          {isConnected('youtube') ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-green-600">
              <Check className="w-3.5 h-3.5" />
              Connected
            </div>
          ) : (
            <button
              onClick={connectYouTube}
              disabled={connecting === 'youtube' || loading}
              className="w-full h-10 rounded-xl bg-red-500 text-white font-bold text-xs uppercase tracking-wider hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {connecting === 'youtube' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect YouTube'
              )}
            </button>
          )}
        </div>

        {/* Instagram Connection */}
        <div className={`relative p-5 rounded-2xl border-2 transition-all ${
          isConnected('instagram') 
            ? 'border-pink-500/30 bg-gradient-to-br from-pink-500/5 to-purple-500/5' 
            : 'border-foreground/10 bg-card/30 hover:bg-card/50'
        }`}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isConnected('instagram') 
                  ? 'bg-gradient-to-br from-pink-500 to-purple-500' 
                  : 'bg-foreground/10'
              }`}>
                <Instagram className={`w-5 h-5 ${isConnected('instagram') ? 'text-white' : 'text-foreground/50'}`} />
              </div>
              <div>
                <h4 className="font-bold text-sm">Instagram</h4>
                {instagramConnection && (
                  <p className="text-xs text-muted-foreground">@{instagramConnection.platform_username}</p>
                )}
              </div>
            </div>
            {isConnected('instagram') && (
              <button
                onClick={() => disconnect('instagram')}
                className="p-1.5 rounded-lg hover:bg-foreground/10 transition-colors"
                title="Disconnect"
              >
                <X className="w-4 h-4 text-foreground/40" />
              </button>
            )}
          </div>

          {isConnected('instagram') ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-green-600">
              <Check className="w-3.5 h-3.5" />
              Connected
            </div>
          ) : (
            <button
              onClick={connectInstagram}
              disabled={connecting === 'instagram' || loading}
              className="w-full h-10 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-xs uppercase tracking-wider hover:from-pink-600 hover:to-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {connecting === 'instagram' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect Instagram'
              )}
            </button>
          )}
        </div>
      </div>

      {(isConnected('youtube') || isConnected('instagram')) && (
        <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
          <p className="text-xs text-green-700 font-medium">
            ✓ Your generated ads can now be posted directly to your connected accounts!
          </p>
        </div>
      )}
    </div>
  );
}
