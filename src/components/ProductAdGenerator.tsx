import { useState, useRef, useCallback } from 'react';
import { Upload, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AdFormatSelector } from '@/components/product-ad/AdFormatSelector';
import { GenerationProgress } from '@/components/product-ad/GenerationProgress';
import { AdResultView } from '@/components/product-ad/AdResultView';
import { AD_FORMATS, type AdPlan, type AdFormat, type GenerationStep } from '@/components/product-ad/types';

type Stage = 'upload' | 'generating' | 'result';

export function ProductAdGenerator() {
  const [stage, setStage] = useState<Stage>('upload');
  const [productImage, setProductImage] = useState<string | null>(null);
  const [adFormat, setAdFormat] = useState<AdFormat>('square');
  const [currentStep, setCurrentStep] = useState<GenerationStep>('uploading');
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

  const handleGenerate = useCallback(async () => {
    if (!productImage) return;
    if (!user) {
      toast({ title: 'Sign in required', description: 'Please sign in to generate product ads.', variant: 'destructive' });
      return;
    }

    const formatConfig = AD_FORMATS.find((f) => f.id === adFormat)!;

    setIsLoading(true);
    setStage('generating');
    setCurrentStep('uploading');

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      // Simulate step progression with SSE-like timing
      setCurrentStep('analyzing');
      
      const response = await supabase.functions.invoke('generate-product-ad', {
        body: {
          productImage,
          width: formatConfig.width,
          height: formatConfig.height,
          format: adFormat,
        },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (response.error) throw new Error(response.error.message || 'Generation failed');

      const { adPlan: plan, generatedImageUrl, step } = response.data;

      // Show planning step briefly
      if (plan) {
        setCurrentStep('planning');
        setAdPlan(plan);
        await new Promise((r) => setTimeout(r, 1000));
        setCurrentStep('generating');
        await new Promise((r) => setTimeout(r, 500));
      }

      setCurrentStep('finalizing');
      await new Promise((r) => setTimeout(r, 800));

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
  }, [productImage, user, adFormat, toast]);

  const handleReset = () => {
    setStage('upload');
    setProductImage(null);
    setAdPlan(null);
    setGeneratedAdUrl(null);
    setCurrentStep('uploading');
  };

  if (stage === 'generating') {
    return <GenerationProgress currentStep={currentStep} productImage={productImage} />;
  }

  if (stage === 'result' && adPlan && generatedAdUrl) {
    return <AdResultView adPlan={adPlan} generatedAdUrl={generatedAdUrl} onReset={handleReset} />;
  }

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
            <input ref={inputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          </label>
        )}
      </div>

      {/* Format selector */}
      <AdFormatSelector selected={adFormat} onChange={setAdFormat} />

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
