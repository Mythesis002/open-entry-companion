import { useState, useEffect, useCallback } from 'react';
import { Download, Share2, RefreshCw, Check, Loader2, Sparkles, Clock, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface VideoProgress {
  id: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  videoUrl?: string;
}

interface VideoComposingProps {
  status: 'videos' | 'composing' | 'complete';
  finalVideoUrl: string | null;
  onStartOver: () => void;
  videoProgress?: VideoProgress[];
}

const FUN_FACTS = [
  "🎬 Hollywood uses AI for visual effects too!",
  "📱 Reels get 2x more engagement than static posts",
  "🎨 AI can generate 1000+ unique frames per minute",
  "🌍 Short-form video is the #1 content format globally",
  "⚡ Your video is being rendered in the cloud right now",
  "🎵 Adding music increases reel views by 80%",
  "🔥 Trending reels get 10x more reach in the first hour",
  "✨ Each frame is being carefully composed by AI",
];

export const VideoComposing = ({
  status,
  finalVideoUrl,
  onStartOver,
  videoProgress = []
}: VideoComposingProps) => {
  const { toast } = useToast();
  const [elapsed, setElapsed] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  // Elapsed timer
  useEffect(() => {
    if (status === 'complete') return;
    const interval = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(interval);
  }, [status]);

  // Rotate fun facts every 8 seconds
  useEffect(() => {
    if (status === 'complete') return;
    const interval = setInterval(() => setFactIndex(i => (i + 1) % FUN_FACTS.length), 8000);
    return () => clearInterval(interval);
  }, [status]);

  const completedVideos = videoProgress.filter(v => v.status === 'complete').length;
  const totalVideos = videoProgress.length || 3;
  const progressPercent = status === 'composing' ? 85 + (elapsed % 15) : status === 'complete' ? 100 : (completedVideos / totalVideos) * 75;

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handleDownload = useCallback(async () => {
    if (!finalVideoUrl) return;
    setIsDownloading(true);
    try {
      const res = await fetch(finalVideoUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'opentry-reel.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: 'Download started!', description: 'Check your downloads folder' });
    } catch {
      toast({ variant: 'destructive', title: 'Download failed', description: 'Try right-clicking the video and "Save as"' });
    } finally {
      setIsDownloading(false);
    }
  }, [finalVideoUrl, toast]);

  if (status === 'videos' || status === 'composing') {
    return (
      <div className="w-full max-w-md mx-auto text-center space-y-6 py-12">
        {/* Animated spinner */}
        <div className="relative w-28 h-28 mx-auto">
          <div className="absolute inset-0 rounded-full border-[3px] border-t-pink-500 border-r-purple-500 border-b-blue-500 border-l-transparent animate-spin" />
          <div className="absolute inset-3 rounded-full border-[3px] border-t-transparent border-r-pink-500 border-b-purple-500 border-l-blue-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            {status === 'videos' ? <Film className="w-8 h-8 text-primary" /> : <Sparkles className="w-8 h-8 text-primary animate-pulse" />}
          </div>
        </div>

        {/* Title + elapsed */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-display">
            {status === 'videos' ? 'Creating Video Clips' : 'Composing Your Reel'}
          </h2>
          <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(elapsed)} elapsed</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <Progress value={progressPercent} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {status === 'videos'
              ? `${completedVideos} of ${totalVideos} clips ready`
              : 'Adding transitions & rendering...'}
          </p>
        </div>

        {/* Individual video progress */}
        {status === 'videos' && videoProgress.length > 0 && (
          <div className="space-y-2.5 text-left bg-muted/30 rounded-2xl p-4">
            {videoProgress.map((video, index) => (
              <div key={video.id} className="flex items-center gap-3">
                <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                  {video.status === 'complete' ? (
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  ) : video.status === 'generating' ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : video.status === 'error' ? (
                    <div className="w-5 h-5 rounded-full bg-destructive flex items-center justify-center text-white text-xs font-bold">!</div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/20" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">Clip {index + 1}</p>
                  <p className="text-xs text-muted-foreground">
                    {video.status === 'complete' ? '✓ Ready' :
                     video.status === 'generating' ? 'Generating...' :
                     video.status === 'error' ? 'Failed' : 'Queued'}
                  </p>
                </div>
                {video.status === 'complete' && video.videoUrl && (
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-black flex-shrink-0">
                    <video src={video.videoUrl} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Fun fact ticker */}
        <div className="bg-primary/5 border border-primary/10 rounded-xl px-4 py-3 transition-all duration-500">
          <p className="text-sm text-foreground/70">{FUN_FACTS[factIndex]}</p>
        </div>

        {/* Pipeline steps */}
        <div className="space-y-1.5 text-left bg-muted/30 rounded-2xl p-4 text-sm">
          <StepRow done label="Images generated" />
          <StepRow done={status === 'composing'} active={status === 'videos'} label="Video clips (~60-90s)" />
          <StepRow active={status === 'composing'} label="Transitions & final render" />
        </div>
      </div>
    );
  }

  // COMPLETE state
  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="text-5xl">🎉</div>
        <h2 className="text-3xl font-bold font-display">Your Reel is Ready!</h2>
        <p className="text-muted-foreground">Download and share your viral video</p>
      </div>

      <div className="aspect-[9/16] rounded-3xl overflow-hidden bg-black">
        {finalVideoUrl && (
          <video src={finalVideoUrl} controls autoPlay loop className="w-full h-full object-contain" />
        )}
      </div>

      <div className="flex gap-3">
        <Button
          size="lg"
          onClick={handleDownload}
          disabled={isDownloading}
          className="flex-1 h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
        >
          {isDownloading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Download className="w-5 h-5 mr-2" />}
          {isDownloading ? 'Downloading...' : 'Download'}
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="flex-1 h-14 text-lg font-bold rounded-2xl"
          onClick={() => {
            if (finalVideoUrl && navigator.share) {
              navigator.share({ title: 'My AI Reel', url: finalVideoUrl });
            }
          }}
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share
        </Button>
      </div>

      <Button variant="ghost" onClick={onStartOver} className="w-full h-12 gap-2">
        <RefreshCw className="w-4 h-4" />
        Create Another Reel
      </Button>
    </div>
  );
};

// Small helper component for pipeline steps
function StepRow({ done, active, label }: { done?: boolean; active?: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      {done ? (
        <span className="text-green-500 text-xs">✓</span>
      ) : active ? (
        <span className="animate-pulse text-xs">⏳</span>
      ) : (
        <span className="text-muted-foreground text-xs">○</span>
      )}
      <span className={done ? 'text-muted-foreground' : active ? 'text-foreground font-medium' : 'text-muted-foreground'}>
        {label}
      </span>
    </div>
  );
}
