import { useState } from 'react';
import { Header } from '@/components/Header';
import { MeshBackground } from '@/components/MeshBackground';
import { TemplateCard } from '@/components/TemplateCard';
import { ReferenceImageUpload } from '@/components/ReferenceImageUpload';
import { ImageReviewGrid } from '@/components/ImageReviewGrid';
import { VideoComposing } from '@/components/VideoComposing';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { FAQSection } from '@/components/FAQSection';
import { CTASection } from '@/components/CTASection';
import { Footer } from '@/components/Footer';
import { RegistrationModal } from '@/components/RegistrationModal';
import { useAuth } from '@/hooks/useAuth';
import { useUserCredits } from '@/hooks/useUserCredits';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { REEL_TEMPLATES, getTemplateById } from '@/data/templates';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReelTemplate, GeneratedImage, ReelProject } from '@/types';

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  
  const { user } = useAuth();
  const { isRegistered, isTrialActive, getDaysRemaining, refetch } = useUserCredits();
  const { toast } = useToast();
  
  // Reel creation state
  const [selectedTemplate, setSelectedTemplate] = useState<ReelTemplate | null>(null);
  const [project, setProject] = useState<ReelProject>({
    templateId: '',
    referenceImages: [],
    generatedImages: [],
    generatedVideos: [],
    finalVideoUrl: null,
    status: 'images'
  });
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [regeneratingImageId, setRegeneratingImageId] = useState<string | null>(null);
  const [isGeneratingVideos, setIsGeneratingVideos] = useState(false);

  const handleSelectTemplate = (template: ReelTemplate) => {
    // Check if user needs to register
    if (!user || !isRegistered()) {
      setShowRegistration(true);
      return;
    }
    
    setSelectedTemplate(template);
    setProject({
      templateId: template.id,
      referenceImages: [],
      generatedImages: [],
      generatedVideos: [],
      finalVideoUrl: null,
      status: 'images'
    });
  };

  const handleGenerateImages = async () => {
    if (!selectedTemplate || project.referenceImages.length < selectedTemplate.referenceImagesRequired) return;
    
    // Check trial/payment
    if (!isTrialActive()) {
      await handlePaymentRequired();
      return;
    }

    setIsGeneratingImages(true);
    
    // Initialize images as generating
    const initialImages: GeneratedImage[] = selectedTemplate.prompts.map((prompt, i) => ({
      id: `img-${i}`,
      prompt,
      imageUrl: '',
      status: 'generating' as const
    }));
    setProject(prev => ({ ...prev, generatedImages: initialImages, status: 'review' }));

    // Generate each image
    for (let i = 0; i < selectedTemplate.prompts.length; i++) {
      try {
        const response = await supabase.functions.invoke('generate-image', {
          body: {
            prompt: selectedTemplate.prompts[i],
            referenceImages: project.referenceImages
          }
        });

        if (response.error) throw response.error;

        setProject(prev => ({
          ...prev,
          generatedImages: prev.generatedImages.map((img, idx) =>
            idx === i ? { ...img, imageUrl: response.data.imageUrl, status: 'complete' as const } : img
          )
        }));
      } catch (error: unknown) {
        console.error(`Error generating image ${i}:`, error);
        const message = error instanceof Error ? error.message : 'Generation failed';
        toast({
          variant: 'destructive',
          title: 'Generation Error',
          description: message
        });
        setProject(prev => ({
          ...prev,
          generatedImages: prev.generatedImages.map((img, idx) =>
            idx === i ? { ...img, status: 'error' as const } : img
          )
        }));
      }
    }

    setIsGeneratingImages(false);
  };

  const handleRegenerateImage = async (imageId: string) => {
    if (!selectedTemplate) return;
    
    const imageIndex = project.generatedImages.findIndex(img => img.id === imageId);
    if (imageIndex === -1) return;

    setRegeneratingImageId(imageId);

    try {
      const response = await supabase.functions.invoke('generate-image', {
        body: {
          prompt: selectedTemplate.prompts[imageIndex],
          referenceImages: project.referenceImages
        }
      });

      if (response.error) throw response.error;

      setProject(prev => ({
        ...prev,
        generatedImages: prev.generatedImages.map(img =>
          img.id === imageId ? { ...img, imageUrl: response.data.imageUrl, status: 'complete' as const } : img
        )
      }));
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

  const handleGenerateVideos = async () => {
    if (!selectedTemplate) return;

    setIsGeneratingVideos(true);
    setProject(prev => ({ ...prev, status: 'videos' }));

    const videoUrls: string[] = [];

    // Generate video for each image
    for (let i = 0; i < project.generatedImages.length; i++) {
      try {
        const response = await supabase.functions.invoke('generate-video', {
          body: {
            imageUrl: project.generatedImages[i].imageUrl,
            prompt: selectedTemplate.videoPrompts[i]
          }
        });

        if (response.error) throw response.error;
        videoUrls.push(response.data.videoUrl);
      } catch (error: unknown) {
        console.error(`Error generating video ${i}:`, error);
        // Use image as fallback
        videoUrls.push(project.generatedImages[i].imageUrl);
      }
    }

    setProject(prev => ({
      ...prev,
      generatedVideos: videoUrls.map((url, i) => ({
        id: `vid-${i}`,
        sourceImageUrl: project.generatedImages[i].imageUrl,
        videoUrl: url,
        status: 'complete' as const
      })),
      status: 'composing'
    }));

    setIsGeneratingVideos(false);

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

      setProject(prev => ({
        ...prev,
        finalVideoUrl: response.data.videoUrl,
        status: 'complete'
      }));

      // Record transaction
      if (user) {
        await supabase.from('ad_transactions').insert({
          user_id: user.id,
          amount: 29,
          status: isTrialActive() ? 'pending' : 'paid'
        });
      }

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

  const handlePaymentRequired = async () => {
    try {
      const { data: transaction, error: txError } = await supabase
        .from('ad_transactions')
        .insert({
          user_id: user!.id,
          amount: 29,
          status: 'pending'
        })
        .select()
        .single();

      if (txError) throw txError;

      const response = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: 29,
          transaction_id: transaction.id
        }
      });

      if (response.error) throw response.error;

      const orderData = response.data;

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Reel Studio',
        description: 'AI Reel Generation - ₹29',
        order_id: orderData.order_id,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verifyResponse = await supabase.functions.invoke('verify-razorpay-payment', {
            body: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              transaction_id: transaction.id
            }
          });

          if (verifyResponse.error) {
            toast({ variant: 'destructive', title: 'Payment Failed' });
            return;
          }

          toast({ title: 'Payment Successful!', description: 'Starting generation...' });
          await handleGenerateImages();
        },
        prefill: { email: user?.email },
        theme: { color: '#ec4899' }
      };

      // @ts-ignore
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Payment error';
      toast({ variant: 'destructive', title: 'Error', description: message });
    }
  };

  const handleStartOver = () => {
    setSelectedTemplate(null);
    setProject({
      templateId: '',
      referenceImages: [],
      generatedImages: [],
      generatedVideos: [],
      finalVideoUrl: null,
      status: 'images'
    });
  };

  const handleRegistrationComplete = () => {
    setShowRegistration(false);
    refetch();
    toast({
      title: 'Welcome!',
      description: `You have ${getDaysRemaining()} days of pay-later period.`
    });
  };

  const renderContent = () => {
    // Template selection
    if (!selectedTemplate) {
      return (
        <div className="w-full max-w-5xl mx-auto space-y-12">
          {/* Hero */}
          <div className="text-center space-y-5 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-50 to-orange-50 border border-pink-100">
              <span className="text-pink-500 text-sm">🔥</span>
              <span className="text-sm font-semibold text-foreground/80">AI-Powered Viral Reels</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold font-display leading-[1] tracking-tighter text-foreground">
              Reel<br/>Studio
            </h1>
            <p className="text-base lg:text-lg text-muted-foreground font-medium max-w-xl mx-auto">
              Create trending AI-generated reels in minutes. Pick a viral template, upload your photos, and let AI do the magic.
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
    if (project.status === 'images') {
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
            images={project.referenceImages}
            onImagesChange={(images) => setProject(prev => ({ ...prev, referenceImages: images }))}
            onGenerate={handleGenerateImages}
            isGenerating={isGeneratingImages}
          />
        </div>
      );
    }

    // Image review stage
    if (project.status === 'review') {
      return (
        <ImageReviewGrid
          images={project.generatedImages}
          onRegenerate={handleRegenerateImage}
          onGenerateVideos={handleGenerateVideos}
          regeneratingId={regeneratingImageId}
          isGeneratingVideos={isGeneratingVideos}
        />
      );
    }

    // Video generation / composing / complete
    return (
      <VideoComposing
        status={project.status as 'composing' | 'complete'}
        finalVideoUrl={project.finalVideoUrl}
        onStartOver={handleStartOver}
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

      <Footer setView={() => {}} />

      <RegistrationModal 
        isOpen={showRegistration}
        onClose={() => setShowRegistration(false)}
        onComplete={handleRegistrationComplete}
      />
    </div>
  );
};

export default Index;
