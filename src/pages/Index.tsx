import { useState } from 'react';
import { Header } from '@/components/Header';
import { MeshBackground } from '@/components/MeshBackground';
import { TemplateCard } from '@/components/TemplateCard';
import { ReferenceImageUpload } from '@/components/ReferenceImageUpload';
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
import type { ReelTemplate, GeneratedImage } from '@/types';

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
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [generatedVideos, setGeneratedVideos] = useState<string[]>([]);
  const [videoProgress, setVideoProgress] = useState<VideoProgress[]>([]);
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
  const [appStatus, setAppStatus] = useState<AppStatus>('template');
  const [regeneratingImageId, setRegeneratingImageId] = useState<string | null>(null);

  const handleSelectTemplate = (template: ReelTemplate) => {
    // Check if user needs to register
    if (!user || !isRegistered()) {
      setShowRegistration(true);
      return;
    }
    
    setSelectedTemplate(template);
    setReferenceImages([]);
    setGeneratedImages([]);
    setGeneratedVideos([]);
    setFinalVideoUrl(null);
    setAppStatus('upload');
  };

  // Generate images for FREE (no payment needed)
  const handleGenerateClick = async () => {
    if (!selectedTemplate || referenceImages.length < selectedTemplate.referenceImagesRequired) return;
    await startGeneration();
  };

  const startGeneration = async () => {
    if (!selectedTemplate) return;

    setAppStatus('generating');
    
    // Initialize images as generating
    const initialImages: GeneratedImage[] = selectedTemplate.prompts.map((prompt, i) => ({
      id: `img-${i}`,
      prompt,
      imageUrl: '',
      status: 'generating' as const
    }));
    setGeneratedImages(initialImages);

    // Generate all images in parallel
    const imagePromises = selectedTemplate.prompts.map(async (prompt, i) => {
      try {
        const response = await supabase.functions.invoke('generate-image', {
          body: {
            prompt,
            referenceImages: referenceImages
          }
        });

        if (response.error) throw response.error;

        setGeneratedImages(prev => prev.map((img, idx) =>
          idx === i ? { ...img, imageUrl: response.data.imageUrl, status: 'complete' as const } : img
        ));
        
        return { success: true, index: i };
      } catch (error: unknown) {
        console.error(`Error generating image ${i}:`, error);
        const message = error instanceof Error ? error.message : 'Generation failed';
        toast({
          variant: 'destructive',
          title: `Image ${i + 1} Error`,
          description: message
        });
        setGeneratedImages(prev => prev.map((img, idx) =>
          idx === i ? { ...img, status: 'error' as const } : img
        ));
        
        return { success: false, index: i };
      }
    });

    // Wait for all images to complete
    await Promise.all(imagePromises);

    // Move to review stage
    setAppStatus('review');
  };

  const handleRegenerateImage = async (imageId: string) => {
    if (!selectedTemplate) return;
    
    const imageIndex = generatedImages.findIndex(img => img.id === imageId);
    if (imageIndex === -1) return;

    setRegeneratingImageId(imageId);

    try {
      const response = await supabase.functions.invoke('generate-image', {
        body: {
          prompt: selectedTemplate.prompts[imageIndex],
          referenceImages: referenceImages
        }
      });

      if (response.error) throw response.error;

      setGeneratedImages(prev => prev.map(img =>
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

  // Show payment QR before video generation
  const handleGenerateVideosClick = () => {
    setShowPaymentQR(true);
  };

  // After payment, start video generation
  const handlePaymentComplete = async () => {
    setShowPaymentQR(false);
    await generateVideos();
  };

  const generateVideos = async () => {
    if (!selectedTemplate) return;

    setAppStatus('videos');

    // Initialize video progress tracking
    const initialProgress: VideoProgress[] = generatedImages.map((img, i) => ({
      id: `video-${i}`,
      status: 'pending' as const
    }));
    setVideoProgress(initialProgress);

    // Generate all videos in parallel with individual progress tracking
    const videoPromises = generatedImages.map(async (img, i) => {
      // Mark as generating
      setVideoProgress(prev => prev.map((v, idx) => 
        idx === i ? { ...v, status: 'generating' as const } : v
      ));

      try {
        console.log(`Starting video generation ${i + 1}/${generatedImages.length}`);
        
        const response = await supabase.functions.invoke('generate-video', {
          body: {
            imageUrl: img.imageUrl,
            prompt: selectedTemplate.videoPrompts[i] || selectedTemplate.videoPrompts[0]
          }
        });

        if (response.error) throw response.error;
        
        const videoUrl = response.data.videoUrl;
        console.log(`Video ${i + 1} complete:`, videoUrl);

        // Mark as complete with video URL
        setVideoProgress(prev => prev.map((v, idx) => 
          idx === i ? { ...v, status: 'complete' as const, videoUrl } : v
        ));

        return videoUrl;
      } catch (error: unknown) {
        console.error(`Error generating video ${i}:`, error);
        
        // Mark as error
        setVideoProgress(prev => prev.map((v, idx) => 
          idx === i ? { ...v, status: 'error' as const } : v
        ));

        toast({
          variant: 'destructive',
          title: `Video ${i + 1} Error`,
          description: error instanceof Error ? error.message : 'Generation failed'
        });

        // Use image as fallback
        return img.imageUrl;
      }
    });

    // Wait for all videos to complete in parallel
    const videoUrls = await Promise.all(videoPromises);

    setGeneratedVideos(videoUrls);
    setAppStatus('composing');

    // Compose final reel
    await composeReel(videoUrls);
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
    setReferenceImages([]);
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
    // Template selection
    if (appStatus === 'template') {
      return (
        <div className="w-full max-w-5xl mx-auto space-y-12">
          {/* Hero */}
          <div className="text-center space-y-5 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-50 to-orange-50 border border-pink-100">
              <span className="text-pink-500 text-sm">🔥</span>
              <span className="text-sm font-semibold text-foreground/80">AI-Powered Viral Reels</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold leading-[1.1] tracking-tight text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              Create Viral Reels<br/>with AI
            </h1>
            <p className="text-base text-muted-foreground max-w-lg mx-auto">
              Pick a trending template, upload your photo, and get a ready-to-post reel in minutes.
            </p>
          </div>

          {/* Template grid */}
          <div>
            <h2 className="text-xl font-bold mb-6">🎬 Trending Templates</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {REEL_TEMPLATES.map(template => (
                <TemplateCard 
                  key={template.id} 
                  template={template} 
                  onSelect={handleSelectTemplate}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Image upload stage
    if (appStatus === 'upload' && selectedTemplate) {
      return (
        <div className="w-full">
          <Button
            variant="ghost"
            onClick={handleStartOver}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Templates
          </Button>
          
          <ReferenceImageUpload
            template={selectedTemplate}
            images={referenceImages}
            onImagesChange={setReferenceImages}
            onGenerate={handleGenerateClick}
            isGenerating={false}
          />
        </div>
      );
    }

    // Generating images stage (FREE - no payment)
    if (appStatus === 'generating' && selectedTemplate) {
      return (
        <GeneratingState
          template={selectedTemplate}
          images={generatedImages}
        />
      );
    }

    // Image review stage - Pay to generate videos
    if (appStatus === 'review') {
      return (
        <ImageReviewGrid
          images={generatedImages}
          onRegenerate={handleRegenerateImage}
          onGenerateVideos={handleGenerateVideosClick}
          regeneratingId={regeneratingImageId}
          isGeneratingVideos={false}
        />
      );
    }

    // Video generation / composing / complete
    return (
      <VideoComposing
        status={appStatus as 'videos' | 'composing' | 'complete'}
        finalVideoUrl={finalVideoUrl}
        onStartOver={handleStartOver}
        videoProgress={videoProgress}
      />
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-x-hidden relative">
      <MeshBackground />
      
      <Header 
        view="studio"
        setView={() => {}}
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
      />

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
        onComplete={handleRegistrationComplete}
      />

      {selectedTemplate && (
        <PaymentQRModal
          isOpen={showPaymentQR}
          onClose={() => setShowPaymentQR(false)}
          onPaymentComplete={handlePaymentComplete}
          template={selectedTemplate}
        />
      )}
    </div>
  );
};

export default Index;
