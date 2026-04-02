import { Download, RotateCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { AdPlan } from './types';

function toStr(val: unknown): string {
  if (val == null) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'object') return Object.values(val as Record<string, unknown>).filter(Boolean).map(toStr).join(', ');
  return String(val);
}

interface AdResultViewProps {
  adPlan: AdPlan;
  generatedAdUrl: string;
  onReset: () => void;
}

export function AdResultView({ adPlan, generatedAdUrl, onReset }: AdResultViewProps) {
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      const res = await fetch(generatedAdUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `product-ad-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: 'Downloaded!', description: 'Your ad image has been saved.' });
    } catch {
      toast({ title: 'Download failed', variant: 'destructive' });
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Ad Ready
        </div>
        <h2 className="text-2xl font-bold font-display">{toStr(adPlan.headline)}</h2>
        <p className="text-sm text-muted-foreground">{toStr(adPlan.subheadline)}</p>
      </div>

      {/* Ad Image — hero */}
      <div className="rounded-2xl overflow-hidden border border-border shadow-xl bg-muted/10">
        <img src={generatedAdUrl} alt="Generated product ad" className="w-full object-contain" />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleDownload} size="lg" className="flex-1 gap-2 h-12 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground border-0 hover:opacity-90">
          <Download className="w-4 h-4" /> Download Ad
        </Button>
        <Button onClick={onReset} variant="outline" size="lg" className="gap-2 h-12 rounded-xl">
          <RotateCcw className="w-4 h-4" /> Create Another
        </Button>
      </div>

      {/* Minimal info strip */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
        <span>{toStr(adPlan.productName)}</span>
        <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
        <span>{toStr(adPlan.designStyle)}</span>
        <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{toStr(adPlan.ctaText)}</span>
      </div>
    </div>
  );
}
