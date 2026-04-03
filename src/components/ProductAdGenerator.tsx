import { useState, useRef, useCallback } from 'react';
import { Upload, Sparkles, ImagePlus } from 'lucide-react';
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
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please use an image under 10MB.', variant: 'destructive' });
      return;
    }
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

      setCurrentStep('generating');

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

      const { adPlan: plan, generatedImageUrl } = response.data;
      if (plan) setAdPlan(plan);

      setCurrentStep('finalizing');
      await new Promise((r) => setTimeout(r, 400));

      setGeneratedAdUrl(generatedImageUrl);
      setStage('result');
      toast({ title: '✨ Ad created!', description: 'Your product ad is ready to download.' });
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
    return <GenerationProgress currentStep={currentStep} productImage={productImage} adFormat={adFormat} />;
  }

  if (stage === 'result' && adPlan && generatedAdUrl) {
    return <AdResultView adPlan={adPlan} generatedAdUrl={generatedAdUrl} onReset={handleReset} />;
  }

  const selectedFormat = AD_FORMATS.find((f) => f.id === adFormat)!;

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* Upload area */}
      <div className="aspect-[4/3] w-full">
        {productImage ? (
          <div className="relative w-full h-full rounded-2xl overflow-hidden group border border-border bg-muted/10">
            <img src={productImage} alt="Product" className="w-full h-full object-contain p-4" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <button
                onClick={() => setProductImage(null)}
                className="px-4 py-2 rounded-xl bg-background/90 text-foreground text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                Change Photo
              </button>
            </div>
          </div>
        ) : (
          <label className="w-full h-full rounded-2xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-muted/30 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <ImagePlus className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-foreground">Upload Product Photo</p>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
            </div>
            <input ref={inputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
          </label>
        )}
      </div>

      {/* Format selector */}
      <AdFormatSelector selected={adFormat} onChange={setAdFormat} />

      {/* Generate button */}
      <Button
        onClick={handleGenerate}
        disabled={!productImage || isLoading}
        size="lg"
        className="w-full h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground border-0 gap-2"
      >
        <Sparkles className="w-5 h-5" />
        Generate {selectedFormat.label} Ad ({selectedFormat.dimensions})
      </Button>

      {/* Tips */}
      <p className="text-center text-xs text-muted-foreground">
        Use a clean, well-lit photo with plain background for best results
      </p>
    </div>
  );
}
