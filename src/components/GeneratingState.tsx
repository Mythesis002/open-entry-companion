import { Loader2 } from 'lucide-react';
import type { ReelTemplate, GeneratedImage } from '@/types';

interface GeneratingStateProps {
  template: ReelTemplate;
  images: GeneratedImage[];
}

export function GeneratingState({ template, images }: GeneratingStateProps) {
  const completedCount = images.filter(img => img.status === 'complete').length;
  const totalCount = template.shots;

  return (
    <div className="flex flex-col items-center gap-8 max-w-sm w-full text-center py-8">
      {/* Image Generation Placeholders - ChatGPT style */}
      <div className="w-full grid grid-cols-3 gap-3">
        {images.map((img, index) => (
          <div
            key={img.id}
            className="relative aspect-[9/16] rounded-2xl overflow-hidden"
          >
            {img.status === 'complete' && img.imageUrl ? (
              // Completed image
              <img 
                src={img.imageUrl} 
                alt={`Shot ${index + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              // Blurred placeholder - ChatGPT style
              <div className="w-full h-full relative">
                {/* Animated gradient background */}
                <div 
                  className={`absolute inset-0 ${
                    img.status === 'generating' 
                      ? 'animate-pulse' 
                      : ''
                  }`}
                  style={{
                    background: img.status === 'generating'
                      ? 'linear-gradient(135deg, rgba(236,72,153,0.3) 0%, rgba(251,146,60,0.3) 50%, rgba(168,85,247,0.3) 100%)'
                      : 'linear-gradient(135deg, rgba(148,163,184,0.2) 0%, rgba(148,163,184,0.1) 100%)',
                  }}
                />
                
                {/* Blur overlay effect */}
                <div 
                  className="absolute inset-0 backdrop-blur-xl"
                  style={{
                    background: img.status === 'generating'
                      ? 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)'
                      : 'radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 70%)',
                  }}
                />

                {/* Shimmer effect for generating state */}
                {img.status === 'generating' && (
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

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  {img.status === 'generating' ? (
                    <>
                      <div className="w-10 h-10 rounded-full border-2 border-pink-500/30 border-t-pink-500 animate-spin" />
                      <span className="text-xs font-medium text-foreground/70">Generating...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                        <span className="text-sm font-bold text-muted-foreground">{index + 1}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Waiting...</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Shot number badge */}
            <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <span className="text-xs font-bold text-white">{index + 1}</span>
            </div>

            {/* Completed checkmark */}
            {img.status === 'complete' && (
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-xs text-white">✓</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Status text */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold">
          Generating {completedCount}/{totalCount} shots
        </h2>
        <p className="text-sm text-muted-foreground">
          Creating AI images for <span className="font-medium text-foreground">{template.name}</span>
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-pink-500 to-orange-500 transition-all duration-500 ease-out"
          style={{ width: `${(completedCount / totalCount) * 100}%` }}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        This may take a few minutes. Please don't close this page.
      </p>
    </div>
  );
}
