import { useState, useRef } from 'react';
import { Upload, Sparkles, Download, RotateCcw, ImageIcon, Palette, Type, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AdPlan {
  productName: string;
  productCategory: string;
  colors: string[];
  suggestedBackground: string;
  suggestedLighting: string;
  suggestedMood: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  adPrompt: string;
}

type Stage = 'upload' | 'analyzing' | 'result';

export function ProductAdGenerator() {
  const [stage, setStage] = useState<Stage>('upload');
  const [productImage, setProductImage] = useState<string | null>(null);
  const [adPlan, setAdPlan] = useState<AdPlan | null>(null);
  const [generatedAdUrl, setGeneratedAdUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setProductImage(ev.target?.result as string);
    reader.readAsDataURL(file);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (!productImage) return;

    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to generate product ads.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setStage('analyzing');

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const response = await supabase.functions.invoke('generate-product-ad', {
        body: { productImage },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (response.error) throw new Error(response.error.message || 'Generation failed');

      const { adPlan: plan, generatedImageUrl } = response.data;
      setAdPlan(plan);
      setGeneratedAdUrl(generatedImageUrl);
      setStage('result');
      toast({ title: '✨ Ad created!', description: `Product ad for "${plan.productName}" is ready.` });
    } catch (err: any) {
      console.error('Generation error:', err);
      toast({ title: 'Generation failed', description: err.message || 'Something went wrong', variant: 'destructive' });
      setStage('upload');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStage('upload');
    setProductImage(null);
    setAdPlan(null);
    setGeneratedAdUrl(null);
  };

  const handleDownload = async () => {
    if (!generatedAdUrl) return;
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

  if (stage === 'analyzing') {
    return (
      <div className="w-full max-w-2xl mx-auto text-center space-y-6 py-12">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center animate-pulse">
          <Sparkles className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold font-display">Analyzing Your Product...</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          AI is studying your product, planning colors, environment, text, and creating the perfect ad image.
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          {['Detecting product', 'Planning colors', 'Designing layout', 'Generating image'].map((step, i) => (
            <span key={i} className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
              {step}
            </span>
          ))}
        </div>
        {productImage && (
          <div className="w-32 h-32 mx-auto rounded-xl overflow-hidden border border-border opacity-60">
            <img src={productImage} alt="Product" className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    );
  }

  if (stage === 'result' && adPlan && generatedAdUrl) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold font-display">Your Product Ad is Ready! ✨</h2>
          <p className="text-muted-foreground">AI analyzed your product and created a professional ad image.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Generated Ad */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Generated Ad</h3>
            <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
              <img src={generatedAdUrl} alt="Generated ad" className="w-full aspect-square object-cover" />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleDownload} className="flex-1 gap-2">
                <Download className="w-4 h-4" /> Download
              </Button>
              <Button onClick={handleReset} variant="outline" className="gap-2">
                <RotateCcw className="w-4 h-4" /> New Ad
              </Button>
            </div>
          </div>

          {/* Ad Plan Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">AI Creative Plan</h3>
            <div className="space-y-3">
              <Card className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ImageIcon className="w-4 h-4 text-primary" /> Product
                </div>
                <p className="text-sm text-muted-foreground">{adPlan.productName} • {adPlan.productCategory}</p>
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
              </Card>

              <Card className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Type className="w-4 h-4 text-primary" /> Copy
                </div>
                <p className="font-bold text-foreground">{adPlan.headline}</p>
                <p className="text-sm text-muted-foreground">{adPlan.subheadline}</p>
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

  // Upload stage
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold font-display">Product Ad Generator</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Upload your product photo — AI will analyze it and create a stunning ad image with the perfect colors, background, and copy.
        </p>
      </div>

      <div className="aspect-square max-w-sm mx-auto">
        {productImage ? (
          <div className="relative w-full h-full rounded-2xl overflow-hidden group border border-border">
            <img src={productImage} alt="Product" className="w-full h-full object-cover" />
            <button
              onClick={() => setProductImage(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        ) : (
          <label className="w-full h-full rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <Upload className="w-10 h-10 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-medium">Upload Product Photo</p>
              <p className="text-sm text-muted-foreground">Clear, well-lit photo works best</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        )}
      </div>

      <div className="bg-muted/50 rounded-2xl p-5 space-y-3">
        <h4 className="font-semibold text-sm">💡 Tips for best results:</h4>
        <ul className="text-sm text-muted-foreground space-y-1.5">
          <li>• Use a clean, well-lit product photo</li>
          <li>• White or plain background works best</li>
          <li>• Show the product from its best angle</li>
          <li>• Higher resolution = better ad quality</li>
        </ul>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={!productImage || isLoading}
        size="lg"
        className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground border-0"
      >
        <Sparkles className="w-5 h-5 mr-2" />
        Generate Product Ad
      </Button>
    </div>
  );
}
