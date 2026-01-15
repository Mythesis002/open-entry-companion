import { RefreshCw, Check, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { GeneratedImage } from '@/types';

interface ImageReviewGridProps {
  images: GeneratedImage[];
  onRegenerate: (imageId: string) => void;
  onGenerateVideos: () => void;
  regeneratingId: string | null;
  isGeneratingVideos: boolean;
}

export const ImageReviewGrid = ({
  images,
  onRegenerate,
  onGenerateVideos,
  regeneratingId,
  isGeneratingVideos
}: ImageReviewGridProps) => {
  const allComplete = images.every(img => img.status === 'complete');

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold font-display">Review Your Shots</h2>
        <p className="text-muted-foreground">
          Click regenerate on any shot you want to redo, or proceed to video creation
        </p>
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={image.id} className="relative group">
            <div className="aspect-[9/16] rounded-2xl overflow-hidden bg-muted">
              {image.status === 'generating' || regeneratingId === image.id ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-pink-500/20 to-orange-500/20">
                  <div className="w-12 h-12 rounded-full border-4 border-t-pink-500 border-pink-500/20 animate-spin" />
                  <p className="text-sm text-muted-foreground">Generating...</p>
                </div>
              ) : image.status === 'error' ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-destructive/10">
                  <p className="text-sm text-destructive">Failed</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onRegenerate(image.id)}
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <>
                  <img 
                    src={image.imageUrl} 
                    alt={`Shot ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onRegenerate(image.id)}
                      disabled={!!regeneratingId}
                      className="gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Regenerate
                    </Button>
                  </div>
                  
                  {/* Check badge */}
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </>
              )}
            </div>
            
            {/* Shot label */}
            <div className="mt-2 text-center">
              <p className="text-sm font-medium">Shot {index + 1}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Generate videos button */}
      <Button
        onClick={onGenerateVideos}
        disabled={!allComplete || !!regeneratingId || isGeneratingVideos}
        size="lg"
        className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
      >
        {isGeneratingVideos ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">⏳</span> Creating Videos...
          </span>
        ) : (
          <>
            <Video className="w-5 h-5 mr-2" />
            Generate Videos
          </>
        )}
      </Button>
    </div>
  );
};
