import { useState, useEffect, useCallback } from 'react';
import { Download, Share2, RefreshCw, Check, Loader2, Sparkles, Clock, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [showStacking, setShowStacking] = useState(false);
  const [showFinalReveal, setShowFinalReveal] = useState(false);

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

  // Trigger stacking animation when composing starts
  useEffect(() => {
    if (status === 'composing') {
      setShowStacking(true);
    }
  }, [status]);

  // Trigger final reveal when complete
  useEffect(() => {
    if (status === 'complete') {
      // Short delay for the stacking to finish visually
      const timer = setTimeout(() => {
        setShowStacking(false);
        setShowFinalReveal(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const completedVideos = videoProgress.filter(v => v.status === 'complete').length;
  const totalVideos = videoProgress.length || 3;

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

  // GENERATING / COMPOSING states
  if (status === 'videos' || status === 'composing') {
    return (
      <div className="w-full max-w-md mx-auto text-center space-y-6 py-8">
        {/* Clip Grid — ChatGPT-style blurred placeholders */}
        <div className="w-full grid grid-cols-3 gap-3">
          <AnimatePresence mode="popLayout">
            {videoProgress.map((video, index) => (
              <motion.div
                key={video.id}
                layout
                className="relative aspect-[9/16] rounded-2xl overflow-hidden"
                // Stacking animation: when composing, cards stack to center
                animate={showStacking ? {
                  x: index === 0 ? 40 : index === 2 ? -40 : 0,
                  y: index === 1 ? -10 : 10,
                  rotate: index === 0 ? -6 : index === 2 ? 6 : 0,
                  scale: index === 1 ? 1.05 : 0.95,
                  zIndex: index === 1 ? 3 : 2 - Math.abs(index - 1),
                } : {
                  x: 0, y: 0, rotate: 0, scale: 1, zIndex: 1,
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: showStacking ? index * 0.15 : 0 }}
              >
                {video.status === 'complete' && video.videoUrl ? (
                  // Completed — show mini preview
                  <div className="w-full h-full relative">
                    <video
                      src={video.videoUrl}
                      className="w-full h-full object-cover"
                      muted loop autoPlay playsInline
                    />
                    {/* Completed checkmark */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center"
                    >
                      <Check className="w-3 h-3 text-white" />
                    </motion.div>
                  </div>
                ) : (
                  // Blurred placeholder — matches image generation style
                  <div className="w-full h-full relative">
                    <div
                      className={`absolute inset-0 ${video.status === 'generating' ? 'animate-pulse' : ''}`}
                      style={{
                        background: video.status === 'generating'
                          ? 'linear-gradient(135deg, hsl(var(--primary) / 0.3) 0%, hsl(330 80% 60% / 0.3) 50%, hsl(270 70% 60% / 0.3) 100%)'
                          : 'linear-gradient(135deg, hsl(var(--muted) / 0.4) 0%, hsl(var(--muted) / 0.2) 100%)',
                      }}
                    />
                    {/* Blur overlay */}
                    <div
                      className="absolute inset-0 backdrop-blur-xl"
                      style={{
                        background: video.status === 'generating'
                          ? 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)'
                          : 'radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 70%)',
                      }}
                    />
                    {/* Shimmer effect */}
                    {video.status === 'generating' && (
                      <div className="absolute inset-0 overflow-hidden">
                        <div
                          className="absolute inset-0 animate-shimmer"
                          style={{
                            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                            backgroundSize: '200% 100%',
                          }}
                        />
                      </div>
                    )}
                    {/* Center icon */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      {video.status === 'generating' ? (
                        <>
                          <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                          <span className="text-xs font-medium text-foreground/70">Generating...</span>
                        </>
                      ) : video.status === 'error' ? (
                        <span className="text-xs font-bold text-destructive">Failed</span>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                            <Film className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <span className="text-xs text-muted-foreground">Queued</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
                {/* Shot number badge */}
                <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{index + 1}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Composing overlay label */}
        {showStacking && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-sm font-semibold text-foreground">Mixing clips into your reel...</span>
          </motion.div>
        )}

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
          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-pink-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{
                width: status === 'composing'
                  ? `${85 + (elapsed % 15)}%`
                  : `${(completedVideos / totalVideos) * 75}%`
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {status === 'videos'
              ? `${completedVideos} of ${totalVideos} clips ready`
              : 'Adding transitions & rendering...'}
          </p>
        </div>

        {/* Fun fact ticker */}
        <AnimatePresence mode="wait">
          <motion.div
            key={factIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="bg-primary/5 border border-primary/10 rounded-xl px-4 py-3"
          >
            <p className="text-sm text-foreground/70">{FUN_FACTS[factIndex]}</p>
          </motion.div>
        </AnimatePresence>

        {/* Pipeline steps */}
        <div className="space-y-1.5 text-left bg-muted/30 rounded-2xl p-4 text-sm">
          <StepRow done label="Images generated" />
          <StepRow done={status === 'composing'} active={status === 'videos'} label="Video clips (~60-90s)" />
          <StepRow active={status === 'composing'} label="Transitions & final render" />
        </div>
      </div>
    );
  }

  // COMPLETE state — final reveal
  return (
    <motion.div
      className="w-full max-w-lg mx-auto space-y-6"
      initial={showFinalReveal ? { opacity: 0, scale: 0.9 } : false}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 180, damping: 18 }}
    >
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="text-5xl"
        >
          🎉
        </motion.div>
        <h2 className="text-3xl font-bold font-display">Your Reel is Ready!</h2>
        <p className="text-muted-foreground">Download and share your viral video</p>
      </div>

      <motion.div
        className="aspect-[9/16] rounded-3xl overflow-hidden bg-black shadow-2xl"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {finalVideoUrl && (
          <video src={finalVideoUrl} controls autoPlay loop className="w-full h-full object-contain" />
        )}
      </motion.div>

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
    </motion.div>
  );
};

function StepRow({ done, active, label }: { done?: boolean; active?: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      {done ? (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-500 text-xs">✓</motion.span>
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
