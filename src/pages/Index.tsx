import { useState } from 'react';
import { Header } from '@/components/Header';
import { RangoliDivider, PaisleyCorner, IndianFlagIcon, DiyaIcon } from '@/components/IndianPatterns';
import { MeshBackground } from '@/components/MeshBackground';
import { TemplateCard } from '@/components/TemplateCard';
import { ReferenceInputCollector } from '@/components/ReferenceInputCollector';
import { ImageReviewGrid } from '@/components/ImageReviewGrid';
import { VideoComposing } from '@/components/VideoComposing';
import { GeneratingState } from '@/components/GeneratingState';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { FAQSection } from '@/components/FAQSection';
import { CTASection } from '@/components/CTASection';
import { Footer } from '@/components/Footer';
import { RegistrationModal } from '@/components/RegistrationModal';
import { PaymentQRModal } from '@/components/PaymentQRModal';
import { useAuth } from '@/hooks/useAuth';
import { useUserCredits } from '@/hooks/useUserCredits';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { REEL_TEMPLATES } from '@/data/templates';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReelTemplate, GeneratedImage, CollectedInputs } from '@/types';

type AppStatus = 'template' | 'upload' | 'generating' | 'review' | 'payment' | 'videos' | 'composing' | 'complete';

interface VideoProgress {
  id: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  videoUrl?: string;
}

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showPaymentQR, setShowPaymentQR] = useState(false);

  const { user } = useAuth();
  const { isRegistered, refetch } = useUserCredits();
  const { toast } = useToast();

  // Reel creation state
  const [selectedTemplate, setSelectedTemplate] = useState<ReelTemplate | null>(null);
  const [collectedInputs, setCollectedInputs] = useState<CollectedInputs>({});
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [generatedVideos, setGeneratedVideos] = useState<string[]>([]);
  const [videoProgress, setVideoProgress] = useState<VideoProgress[]>([]);
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
  const [appStatus, setAppStatus] = useState<AppStatus>('template');
  const [regeneratingImageId, setRegeneratingImageId] = useState<string | null>(null);

  const handleSelectTemplate = (template: ReelTemplate) => {
    if (!user || !isRegistered()) {
      setShowRegistration(true);
      return;
    }

    setSelectedTemplate(template);
    setCollectedInputs({});
    setGeneratedImages([]);
    setGeneratedVideos([]);
    setFinalVideoUrl(null);
    setAppStatus('upload');
  };

  // Build reference images for a specific shot based on its useInputs + presetReferenceImages
  const buildShotReferences = (shot: typeof selectedTemplate extends null ? never : NonNullable<typeof selectedTemplate>['shots'][0]) => {
    const refs: string[] = [];

    // Add user-provided inputs
    for (const inputId of shot.useInputs) {
      if (collectedInputs[inputId]) {
        refs.push(collectedInputs[inputId]);
      }
    }

    // Add preset scene references
    if (shot.presetReferenceImages) {
      refs.push(...shot.presetReferenceImages);
    }

    return refs;
  };

  const handleGenerateClick = async () => {
    if (!selectedTemplate) return;
    await startGeneration();
  };

  const startGeneration = async () => {
    if (!selectedTemplate) return;

    setAppStatus('generating');

    // Initialize images from shots
    const initialImages: GeneratedImage[] = selectedTemplate.shots.map((shot) => ({
      id: `img-${shot.id}`,
      shotId: shot.id,
      prompt: shot.prompt,
      imageUrl: '',
      status: 'generating' as const
    }));
    setGeneratedImages(initialImages);

    // Generate all images in parallel - each shot gets its own references
    const imagePromises = selectedTemplate.shots.map(async (shot, i) => {
      try {
        const shotReferences = buildShotReferences(shot);

        const response = await supabase.functions.invoke('generate-image', {
          body: {
            prompt: shot.prompt,
            referenceImages: shotReferences
          }
        });

        if (response.error) throw response.error;

        setGeneratedImages((prev) => prev.map((img) =>
        img.shotId === shot.id ? { ...img, imageUrl: response.data.imageUrl, status: 'complete' as const } : img
        ));

        return { success: true, index: i };
      } catch (error: unknown) {
        console.error(`Error generating shot ${shot.id}:`, error);
        const message = error instanceof Error ? error.message : 'Generation failed';
        toast({
          variant: 'destructive',
          title: `Shot ${shot.id} Error`,
          description: message
        });
        setGeneratedImages((prev) => prev.map((img) =>
        img.shotId === shot.id ? { ...img, status: 'error' as const } : img
        ));

        return { success: false, index: i };
      }
    });

    await Promise.all(imagePromises);
    setAppStatus('review');
  };

  const handleRegenerateImage = async (imageId: string) => {
    if (!selectedTemplate) return;

    const image = generatedImages.find((img) => img.id === imageId);
    if (!image) return;

    const shot = selectedTemplate.shots.find((s) => s.id === image.shotId);
    if (!shot) return;

    setRegeneratingImageId(imageId);

    try {
      const shotReferences = buildShotReferences(shot);

      const response = await supabase.functions.invoke('generate-image', {
        body: {
          prompt: shot.prompt,
          referenceImages: shotReferences
        }
      });

      if (response.error) throw response.error;

      setGeneratedImages((prev) => prev.map((img) =>
      img.id === imageId ? { ...img, imageUrl: response.data.imageUrl, status: 'complete' as const } : img
      ));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Regeneration failed';
      toast({
        variant: 'destructive',
        title: 'Regeneration Error',
        description: message
      });
    }

    setRegeneratingImageId(null);
  };

  const handleGenerateVideosClick = () => {
    setShowPaymentQR(true);
  };

  const handlePaymentComplete = async () => {
    setShowPaymentQR(false);
    await generateVideos();
  };

  // Helper: poll a single video until complete or failed
  const pollVideoStatus = async (requestId: string, index: number): Promise<string | null> => {
    const maxAttempts = 120; // 4 minutes at 2s intervals
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        const res = await supabase.functions.invoke('check-video-status', {
          body: { requestId }
        });

        if (res.error) {
          console.error(`Poll error for video ${index}:`, res.error);
          continue;
        }

        const data = res.data;
        if (data?.status === 'complete' && data?.videoUrl) {
          return data.videoUrl;
        }
        if (data?.status === 'failed') {
          throw new Error(data.error || 'Video generation failed');
        }
        // still processing — continue polling
      } catch (err) {
        if (attempt >= maxAttempts - 3) throw err;
        console.error(`Poll attempt ${attempt} error:`, err);
      }
    }
    throw new Error('Video generation timed out after 4 minutes');
  };

  const generateVideos = async () => {
    if (!selectedTemplate) return;

    setAppStatus('videos');

    const initialProgress: VideoProgress[] = generatedImages.map((img, i) => ({
      id: `video-${i}`,
      status: 'pending' as const
    }));
    setVideoProgress(initialProgress);

    // Step 1: Submit all video jobs in parallel
    const jobPromises = generatedImages.map(async (img, i) => {
      setVideoProgress(prev => prev.map((v, idx) =>
        idx === i ? { ...v, status: 'generating' as const } : v
      ));

      try {
        const shot = selectedTemplate.shots.find(s => s.id === img.shotId);
        const videoPrompt = shot?.videoPrompt || '';

        const response = await supabase.functions.invoke('generate-video', {
          body: { imageUrl: img.imageUrl, prompt: videoPrompt }
        });

        if (response.error) throw response.error;
        if (response.data?.error) throw new Error(response.data.error);

        // If completed synchronously
        if (response.data?.status === 'complete' && response.data?.videoUrl) {
          setVideoProgress(prev => prev.map((v, idx) =>
            idx === i ? { ...v, status: 'complete' as const, videoUrl: response.data.videoUrl } : v
          ));
          return response.data.videoUrl as string;
        }

        const requestId = response.data?.requestId;
        if (!requestId) throw new Error('No requestId returned from submit');

        // Step 2: Poll for this video
        const videoUrl = await pollVideoStatus(requestId, i);
        
        setVideoProgress(prev => prev.map((v, idx) =>
          idx === i ? { ...v, status: 'complete' as const, videoUrl } : v
        ));
        return videoUrl;
      } catch (error: unknown) {
        console.error(`Error generating video ${i}:`, error);
        setVideoProgress(prev => prev.map((v, idx) =>
          idx === i ? { ...v, status: 'error' as const } : v
        ));
        toast({
          variant: 'destructive',
          title: `Video ${i + 1} Error`,
          description: error instanceof Error ? error.message : 'Generation failed'
        });
        return null;
      }
    });

    const results = await Promise.all(jobPromises);
    const validVideoUrls = results.filter((url): url is string => url !== null);

    if (validVideoUrls.length === 0) {
      toast({
        variant: 'destructive',
        title: 'All Videos Failed',
        description: 'Could not generate any video clips. Please try again.'
      });
      setAppStatus('review');
      return;
    }

    setGeneratedVideos(validVideoUrls);
    setAppStatus('composing');
    await composeReel(validVideoUrls);
  };

  const composeReel = async (videoUrls: string[]) => {
    if (!selectedTemplate) return;

    try {
      const response = await supabase.functions.invoke('compose-reel', {
        body: {
          videoUrls,
          templateId: selectedTemplate.creatomateTemplateId
        }
      });

      if (response.error) throw response.error;

      setFinalVideoUrl(response.data.videoUrl);
      setAppStatus('complete');

      toast({
        title: '🎉 Reel Created!',
        description: 'Your viral video is ready to download'
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Composition failed';
      toast({
        variant: 'destructive',
        title: 'Composition Error',
        description: message
      });
    }
  };

  const handleStartOver = () => {
    setSelectedTemplate(null);
    setCollectedInputs({});
    setGeneratedImages([]);
    setGeneratedVideos([]);
    setVideoProgress([]);
    setFinalVideoUrl(null);
    setAppStatus('template');
  };

  const handleRegistrationComplete = () => {
    setShowRegistration(false);
    refetch();
    toast({
      title: 'Welcome!',
      description: 'You can now create amazing reels!'
    });
  };

  const renderContent = () => {
    if (appStatus === 'template') {
      return (
        <div className="w-full max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-5 max-w-3xl mx-auto relative">
            <PaisleyCorner className="absolute -top-8 -left-4 hidden lg:block" />
            <PaisleyCorner className="absolute -top-8 -right-4 hidden lg:block" flip />

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-brand-saffron/10 to-brand-gold/10 border border-brand-gold/30">
              <IndianFlagIcon size={16} />
              <span className="text-sm font-semibold text-foreground/80">From India to World</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              Create Viral Reels<br />with AI
            </h1>
            
            <RangoliDivider className="max-w-xs mx-auto" />
            
            <p className="text-base text-muted-foreground max-w-lg mx-auto">
              Pick a trending template, upload your photo, and get a ready-to-post reel in minutes.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-6">
              <DiyaIcon size={18} className="text-brand-saffron inline mr-2" />
              Trending Templates
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {REEL_TEMPLATES.map((template) =>
              <TemplateCard
                key={template.id}
                template={template}
                onSelect={handleSelectTemplate} />

              )}
            </div>
          </div>
        </div>);

    }

    if (appStatus === 'upload' && selectedTemplate) {
      return (
        <div className="w-full">
          <Button
            variant="ghost"
            onClick={handleStartOver}
            className="mb-6 gap-2">
            
            <ArrowLeft className="w-4 h-4" />
            Back to Templates
          </Button>
          
          <ReferenceInputCollector
            template={selectedTemplate}
            collectedInputs={collectedInputs}
            onInputsChange={setCollectedInputs}
            onGenerate={handleGenerateClick}
            isGenerating={false} />
          
        </div>);

    }

    if (appStatus === 'generating' && selectedTemplate) {
      return (
        <GeneratingState
          template={selectedTemplate}
          images={generatedImages} />);


    }

    if (appStatus === 'review') {
      return (
        <ImageReviewGrid
          images={generatedImages}
          onRegenerate={handleRegenerateImage}
          onGenerateVideos={handleGenerateVideosClick}
          regeneratingId={regeneratingImageId}
          isGeneratingVideos={false} />);


    }

    return (
      <VideoComposing
        status={appStatus as 'videos' | 'composing' | 'complete'}
        finalVideoUrl={finalVideoUrl}
        onStartOver={handleStartOver}
        videoProgress={videoProgress} />);


  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-x-hidden relative">
      <MeshBackground />
      
      <Header
        view="studio"
        setView={() => {}}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen} />
      

      <main className="flex-1 pt-14 lg:pt-16 w-full relative z-10">
        <div className="flex-1 flex flex-col items-center py-8 lg:py-16 px-6 animate-slide-up max-w-[1400px] mx-auto">
          {renderContent()}
        </div>

        <HowItWorksSection />
        <FAQSection />
        <CTASection />
      </main>

      <Footer />

      <RegistrationModal
        isOpen={showRegistration}
        onClose={() => setShowRegistration(false)}
        onComplete={handleRegistrationComplete} />
      

      {selectedTemplate &&
      <PaymentQRModal
        isOpen={showPaymentQR}
        onClose={() => setShowPaymentQR(false)}
        onPaymentComplete={handlePaymentComplete}
        template={selectedTemplate} />

      }
    </div>);

};

export default Index;