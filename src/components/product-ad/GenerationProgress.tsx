import { GENERATION_STEPS, type GenerationStep } from './types';
import { Check, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface GenerationProgressProps {
  currentStep: GenerationStep;
  productImage: string | null;
}

export function GenerationProgress({ currentStep, productImage }: GenerationProgressProps) {
  const currentIndex = GENERATION_STEPS.findIndex((s) => s.id === currentStep);
  const progressPercent = ((currentIndex + 1) / GENERATION_STEPS.length) * 100;
  const currentStepInfo = GENERATION_STEPS[currentIndex];

  return (
    <div className="w-full max-w-2xl mx-auto text-center space-y-8 py-12">
      {/* Product thumbnail */}
      {productImage && (
        <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden border border-border shadow-md">
          <img src={productImage} alt="Product" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Current step heading */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold font-display">{currentStepInfo?.label}...</h2>
        <p className="text-muted-foreground max-w-md mx-auto">{currentStepInfo?.description}</p>
      </div>

      {/* Progress bar */}
      <div className="max-w-sm mx-auto space-y-2">
        <Progress value={progressPercent} className="h-2" />
        <p className="text-xs text-muted-foreground">
          Step {currentIndex + 1} of {GENERATION_STEPS.length}
        </p>
      </div>

      {/* Step list */}
      <div className="max-w-xs mx-auto space-y-3">
        {GENERATION_STEPS.map((step, i) => {
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <div key={step.id} className="flex items-center gap-3">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${
                  isDone
                    ? 'bg-primary text-primary-foreground'
                    : isCurrent
                    ? 'bg-primary/20 text-primary border-2 border-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isDone ? (
                  <Check className="w-4 h-4" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <span className="text-xs font-medium">{i + 1}</span>
                )}
              </div>
              <span
                className={`text-sm ${
                  isDone ? 'text-foreground line-through opacity-60' : isCurrent ? 'text-foreground font-medium' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground animate-pulse">Please don't close this page</p>
    </div>
  );
}
