import { Download, Share2, RefreshCw, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

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

export const VideoComposing = ({
  status,
  finalVideoUrl,
  onStartOver,
  videoProgress = []
}: VideoComposingProps) => {
  const completedVideos = videoProgress.filter(v => v.status === 'complete').length;
  const totalVideos = videoProgress.length || 3;
  const progressPercent = status === 'composing' ? 100 : (completedVideos / totalVideos) * 100;

  if (status === 'videos' || status === 'composing') {
    return (
      <div className="w-full max-w-md mx-auto text-center space-y-8 py-16">
        {/* Loading animation */}
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-t-pink-500 border-r-purple-500 border-b-blue-500 border-l-transparent animate-spin" />
          <div className="absolute inset-4 rounded-full border-4 border-t-transparent border-r-pink-500 border-b-purple-500 border-l-blue-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl">{status === 'videos' ? '🎥' : '🎬'}</span>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold font-display">
            {status === 'videos' ? 'Creating Videos with Veo 3' : 'Composing Your Reel'}
          </h2>
          <p className="text-muted-foreground">
            {status === 'videos' 
              ? 'AI is animating your images into cinematic video clips...' 
              : 'Stitching videos together with effects and transitions...'}
          </p>
        </div>

        {/* Overall progress bar */}
        <div className="space-y-2">
          <Progress value={progressPercent} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {status === 'videos' 
              ? `${completedVideos} of ${totalVideos} videos complete`
              : 'Finalizing your reel...'}
          </p>
        </div>

        {/* Individual video progress */}
        {status === 'videos' && videoProgress.length > 0 && (
          <div className="space-y-3 text-left bg-muted/50 rounded-2xl p-5">
            {videoProgress.map((video, index) => (
              <div key={video.id} className="flex items-center gap-3">
                <div className="w-6 h-6 flex items-center justify-center">
                  {video.status === 'complete' ? (
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  ) : video.status === 'generating' ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : video.status === 'error' ? (
                    <div className="w-5 h-5 rounded-full bg-destructive flex items-center justify-center text-white text-xs">!</div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${video.status === 'complete' ? 'text-muted-foreground' : 'text-foreground'}`}>
                    Video {index + 1}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {video.status === 'complete' ? 'Done' : 
                     video.status === 'generating' ? 'Generating with Veo 3...' :
                     video.status === 'error' ? 'Failed - will retry' : 'Waiting...'}
                  </p>
                </div>
                {video.status === 'complete' && video.videoUrl && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-black">
                    <video 
                      src={video.videoUrl} 
                      className="w-full h-full object-cover"
                      muted
                      loop
                      autoPlay
                      playsInline
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Progress steps */}
        <div className="space-y-2 text-left bg-muted/50 rounded-2xl p-5">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-green-500">✓</span>
            <span className="text-muted-foreground">Images generated</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {status === 'videos' ? (
              <>
                <span className="animate-pulse">⏳</span>
                <span>Creating video clips with Veo 3 (~60-90s)</span>
              </>
            ) : (
              <>
                <span className="text-green-500">✓</span>
                <span className="text-muted-foreground">Videos created</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm">
            {status === 'composing' ? (
              <>
                <span className="animate-pulse">⏳</span>
                <span>Adding transitions & effects</span>
              </>
            ) : (
              <>
                <span className="text-muted-foreground">○</span>
                <span className="text-muted-foreground">Adding transitions & effects</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>○</span>
            <span>Final render</span>
          </div>
        </div>

        {/* Estimated time */}
        <p className="text-xs text-muted-foreground">
          {status === 'videos' 
            ? '⏱️ Video generation takes ~60-90 seconds. Please wait...'
            : '⏱️ Almost done! Final rendering in progress...'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="text-5xl">🎉</div>
        <h2 className="text-3xl font-bold font-display">Your Reel is Ready!</h2>
        <p className="text-muted-foreground">
          Download and share your viral video
        </p>
      </div>

      {/* Video preview */}
      <div className="aspect-[9/16] rounded-3xl overflow-hidden bg-black">
        {finalVideoUrl && (
          <video
            src={finalVideoUrl}
            controls
            autoPlay
            loop
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-4">
        <Button
          asChild
          size="lg"
          className="flex-1 h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
        >
          <a href={finalVideoUrl || '#'} download="reel.mp4">
            <Download className="w-5 h-5 mr-2" />
            Download
          </a>
        </Button>
        
        <Button
          size="lg"
          variant="outline"
          className="flex-1 h-14 text-lg font-bold rounded-2xl"
          onClick={() => {
            if (finalVideoUrl && navigator.share) {
              navigator.share({
                title: 'My AI Reel',
                url: finalVideoUrl
              });
            }
          }}
        >
          <Share2 className="w-5 h-5 mr-2" />
          Share
        </Button>
      </div>

      {/* Create another */}
      <Button
        variant="ghost"
        onClick={onStartOver}
        className="w-full h-12 gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Create Another Reel
      </Button>
    </div>
  );
};
