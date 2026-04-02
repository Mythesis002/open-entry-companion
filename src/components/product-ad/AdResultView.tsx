import { Download, RotateCcw, ImageIcon, Palette, Type, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { AdPlan } from './types';

// Safely convert any value to a renderable string
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
      a.download = `product-ad-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: 'Download failed', variant: 'destructive' });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold font-display">Your Product Ad is Ready! ✨</h2>
        <p className="text-muted-foreground">AI analyzed your product and created a professional ad image.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Generated Ad</h3>
          <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
            <img src={generatedAdUrl} alt="Generated ad" className="w-full object-contain" />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleDownload} className="flex-1 gap-2">
              <Download className="w-4 h-4" /> Download
            </Button>
            <Button onClick={onReset} variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" /> New Ad
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">AI Creative Plan</h3>
          <div className="space-y-3">
            <Card className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ImageIcon className="w-4 h-4 text-primary" /> Product
              </div>
              <p className="text-sm text-muted-foreground">{adPlan.productName} • {adPlan.productCategory}</p>
              {adPlan.targetAudience && (
                <p className="text-xs text-muted-foreground">🎯 {adPlan.targetAudience}</p>
              )}
              {adPlan.emotionalTrigger && (
                <p className="text-xs text-muted-foreground">💡 Trigger: {adPlan.emotionalTrigger}</p>
              )}
            </Card>
            <Card className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Palette className="w-4 h-4 text-primary" /> Style
              </div>
              <div className="flex gap-2 flex-wrap">
                {adPlan.colors?.map((c, i) => (
                  <span key={i} className="px-2 py-1 rounded-full bg-muted text-xs">{c}</span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{adPlan.suggestedBackground} • {adPlan.suggestedLighting} • {adPlan.suggestedMood}</p>
              {adPlan.designStyle && (
                <p className="text-xs font-medium text-muted-foreground">Design: {adPlan.designStyle}</p>
              )}
            </Card>
            <Card className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Type className="w-4 h-4 text-primary" /> Copy
              </div>
              <p className="font-bold text-foreground">{adPlan.headline}</p>
              <p className="text-sm text-muted-foreground">{adPlan.subheadline}</p>
              {adPlan.priceTag && (
                <span className="inline-block px-3 py-1 rounded-lg bg-accent text-accent-foreground text-sm font-bold">{adPlan.priceTag}</span>
              )}
            </Card>
            <Card className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Target className="w-4 h-4 text-primary" /> Call to Action
              </div>
              <span className="inline-block px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                {adPlan.ctaText}
              </span>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
