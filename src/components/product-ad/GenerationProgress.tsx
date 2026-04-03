import { useState, useEffect, useRef } from 'react';
import { GENERATION_STEPS, type GenerationStep } from './types';
import { Sparkles } from 'lucide-react';

interface GenerationProgressProps {
  currentStep: GenerationStep;
  productImage: string | null;
  adFormat?: 'square' | 'portrait' | 'landscape';
}

const ASPECT_MAP: Record<string, string> = {
  square: 'aspect-square',
  portrait: 'aspect-[4/5]',
  landscape: 'aspect-[1200/628]',
};

const TIPS = [
  'Analyzing colors, textures & composition…',
  'Designing the perfect lighting setup…',
  'Crafting headline & call-to-action…',
  'Applying Rule of Thirds placement…',
  'Adding depth-of-field & polish…',
  'Rendering final high-res output…',
];

export function GenerationProgress({ currentStep, productImage, adFormat = 'square' }: GenerationProgressProps) {
  const currentIndex = GENERATION_STEPS.findIndex((s) => s.id === currentStep);
  const progressPercent = Math.min(((currentIndex + 1) / GENERATION_STEPS.length) * 100, 100);
  const [tipIndex, setTipIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());

  // Rotate tips
  useEffect(() => {
    const iv = setInterval(() => setTipIndex((i) => (i + 1) % TIPS.length), 3000);
    return () => clearInterval(iv);
  }, []);

  // Elapsed timer
  useEffect(() => {
    const iv = setInterval(() => setElapsed(Math.floor((Date.now() - startRef.current) / 1000)), 1000);
    return () => clearInterval(iv);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const aspect = ASPECT_MAP[adFormat] || 'aspect-square';

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-6 py-8">
      {/* Canvas area — the blurred product image with shimmer overlay */}
      <div className={`relative w-full ${aspect} rounded-3xl overflow-hidden border border-border/50 shadow-2xl`}>
        {/* Base: blurred product image as background */}
        {productImage && (
          <img
            src={productImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-60"
          />
        )}

        {/* Animated gradient wash */}
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            background:
              'linear-gradient(135deg, hsl(var(--primary) / 0.25) 0%, hsl(var(--accent) / 0.2) 40%, hsl(var(--primary) / 0.15) 100%)',
          }}
        />

        {/* Shimmer sweep */}
        <div
          className="absolute inset-0 animate-shimmer"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, hsl(var(--primary) / 0.15) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
          }}
        />

        {/* Radial glow in center */}
        <div
          className="absolute inset-0 animate-glow-pulse"
          style={{
            background: 'radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.2) 0%, transparent 60%)',
          }}
        />

        {/* Center content: small product thumbnail + sparkle */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
          {productImage && (
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-background/50 shadow-lg animate-float">
              <img src={productImage} alt="Product" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/70 backdrop-blur-md border border-border/50 shadow-md">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-foreground transition-all duration-500">
              {GENERATION_STEPS[currentIndex]?.description || 'Creating your ad…'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom info strip */}
      <div className="w-full space-y-3">
        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))',
            }}
          />
        </div>

        {/* Status row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="transition-all duration-500">{TIPS[tipIndex]}</span>
          <span className="tabular-nums">{formatTime(elapsed)}</span>
        </div>
      </div>
    </div>
  );
}
