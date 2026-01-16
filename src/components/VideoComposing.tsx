import { Download, Share2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoComposingProps {
  status: 'videos' | 'composing' | 'complete';
  finalVideoUrl: string | null;
  onStartOver: () => void;
}

export const VideoComposing = ({
  status,
  finalVideoUrl,
  onStartOver
}: VideoComposingProps) => {
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
            {status === 'videos' ? 'Creating Videos' : 'Composing Your Reel'}
          </h2>
          <p className="text-muted-foreground">
            {status === 'videos' 
              ? 'Animating your images into video clips...' 
              : 'Stitching videos together with effects and transitions...'}
          </p>
        </div>

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
                <span>Creating video clips</span>
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
