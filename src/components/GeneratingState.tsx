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
    <div className="flex flex-col items-center gap-10 max-w-md w-full text-center py-16">
      {/* Spinner */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-foreground/10 rounded-full" />
        <div className="absolute inset-0 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{completedCount}/{totalCount}</span>
        </div>
      </div>

      {/* Status */}
      <div className="space-y-4">
        <h2 className="text-3xl font-extrabold font-display">Generating Your Reel</h2>
        <p className="text-muted-foreground">
          Creating {template.shots} AI-generated shots for <span className="font-semibold text-foreground">{template.name}</span>
        </p>
      </div>

      {/* Progress indicators */}
      <div className="w-full space-y-3">
        {images.map((img, index) => (
          <div 
            key={img.id}
            className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
              img.status === 'complete' 
                ? 'bg-green-50 border border-green-200' 
                : img.status === 'generating'
                ? 'bg-pink-50 border border-pink-200'
                : 'bg-muted/50 border border-border'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold">
              {index + 1}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">
                Shot {index + 1}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {img.status === 'complete' ? '✓ Generated' : img.status === 'generating' ? 'Generating...' : 'Waiting...'}
              </p>
            </div>
            {img.status === 'generating' && (
              <Loader2 className="w-4 h-4 animate-spin text-pink-500" />
            )}
            {img.status === 'complete' && (
              <span className="text-green-500">✓</span>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        This may take a few minutes. Please don't close this page.
      </p>
    </div>
  );
}
