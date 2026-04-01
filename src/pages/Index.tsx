import { useState, useEffect } from 'react';
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
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { ReelTemplate, GeneratedImage, CollectedInputs } from '@/types';

type AppStatus = 'template' | 'upload' | 'generating' | 'review' | 'payment' | 'videos' | 'composing' | 'complete';

interface VideoProgress {
  id: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
  videoUrl?: string;
}

const WORKFLOW_STORAGE_KEY = 'opentry_workflow_state';

interface PersistedWorkflowState {
  appStatus: AppStatus;
  selectedTemplateId: string;
  generatedImages: GeneratedImage[];
  paidTransactionId: string | null;
  generatedVideos: string[];
  finalVideoUrl: string | null;
  savedAt: number;
}

function saveWorkflowState(state: PersistedWorkflowState) {
  try { localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(state)); } catch {}
}

function loadWorkflowState(): PersistedWorkflowState | null {
  try {
    const raw = localStorage.getItem(WORKFLOW_STORAGE_KEY);
    if (!raw) return null;
    const state: PersistedWorkflowState = JSON.parse(raw);
    // Expire after 1 hour
    if (Date.now() - state.savedAt > 60 * 60 * 1000) {
      localStorage.removeItem(WORKFLOW_STORAGE_KEY);
      return null;
    }
    return state;
  } catch { return null; }
}

function clearWorkflowState() {
  try { localStorage.removeItem(WORKFLOW_STORAGE_KEY); } catch {}
}

const getAuthHeaders = async () => {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const Index = () => {
  const navigate = useNavigate();
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
  const [paidTransactionId, setPaidTransactionId] = useState<string | null>(null);

  // Restore workflow state on mount — from localStorage first, then check DB for paid transactions
  useEffect(() => {
    if (!user) return;

    // Step 1: Try localStorage
    const saved = loadWorkflowState();
    if (saved) {
      const template = REEL_TEMPLATES.find(t => t.id === saved.selectedTemplateId);
      if (template) {
        setSelectedTemplate(template);
        setGeneratedImages(saved.generatedImages);
        setPaidTransactionId(saved.paidTransactionId);
        setGeneratedVideos(saved.generatedVideos);
        setFinalVideoUrl(saved.finalVideoUrl);
        if (saved.appStatus === 'complete' && saved.finalVideoUrl) {
          setAppStatus('complete');
        } else if (saved.appStatus === 'review' || saved.appStatus === 'videos' || saved.appStatus === 'composing') {
          setAppStatus('review');
        } else {
          setAppStatus(saved.appStatus);
        }
        return; // localStorage state found, don't check DB
      }
    }

    // Step 2: Check DB for paid-but-unprocessed transactions (covers browser-close scenario)
    const checkPaidTransactions = async () => {
      try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: paidTxns, error } = await supabase
          .from('ad_transactions')
          .select('id, ad_inputs, status, generation_status, generated_images, final_video_url')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .in('generation_status', ['pending', 'generating'])
          .gte('paid_at', twentyFourHoursAgo)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error || !paidTxns || paidTxns.length === 0) return;

        const txn = paidTxns[0];
        const adInputs = txn.ad_inputs as any;
        const templateId = adInputs?.templateId;

        if (!templateId) return;

        const template = REEL_TEMPLATES.find(t => t.id === templateId);
        if (!template) return;

        // User has a paid transaction with no video generated — show resume
        setPaidTransactionId(txn.id);
        setSelectedTemplate(template);

        // If images were saved in the transaction, restore them
        const savedImages = txn.generated_images as unknown as GeneratedImage[] | null;
        if (savedImages && Array.isArray(savedImages) && savedImages.length > 0) {
          setGeneratedImages(savedImages);
          setAppStatus('review');
          toast({
            title: '💰 Paid Order Found',
            description: 'You have a paid order. Tap "Generate Videos" to continue — no extra charge!',
          });
        } else {
          // Payment completed but no images — user needs to re-upload and generate
          setAppStatus('upload');
          toast({
            title: '💰 Paid Order Found',
            description: 'You have a paid order. Upload your photo and generate images — video generation is already paid!',
          });
        }
      } catch (err) {
        console.error('Error checking paid transactions:', err);
      }
    };

    checkPaidTransactions();
  }, [user]);

  // Persist workflow state whenever key values change (after payment)
  useEffect(() => {
    if (paidTransactionId && selectedTemplate && (appStatus === 'review' || appStatus === 'videos' || appStatus === 'composing' || appStatus === 'complete')) {
      saveWorkflowState({
        appStatus,
        selectedTemplateId: selectedTemplate.id,
        generatedImages,
        paidTransactionId,
        generatedVideos,
        finalVideoUrl,
        savedAt: Date.now(),
      });

      // Also save images to the DB transaction for recovery after browser close
      if (generatedImages.length > 0 && generatedImages.every(img => img.status === 'complete')) {
        supabase
          .from('ad_transactions')
          .update({ 
            generated_images: generatedImages as any,
            generation_status: appStatus === 'complete' ? 'complete' : 'generating'
          })
          .eq('id', paidTransactionId)
          .then(({ error }) => {
            if (error) console.error('Error saving images to transaction:', error);
          });
      }

      // Save final video URL to DB
      if (finalVideoUrl && appStatus === 'complete') {
        supabase
          .from('ad_transactions')
          .update({ 
            final_video_url: finalVideoUrl,
            generation_status: 'complete'
          })
          .eq('id', paidTransactionId)
          .then(({ error }) => {
            if (error) console.error('Error saving final video to transaction:', error);
          });
      }
    }
  }, [appStatus, generatedImages, generatedVideos, finalVideoUrl, paidTransactionId, selectedTemplate]);

  const handleSelectTemplate = (template: ReelTemplate) => {
    if (!user) {
      setShowRegistration(true);
      return;
    }

    setSelectedTemplate(template);
    setCollectedInputs({});
    setGeneratedImages([]);
    setGeneratedVideos([]);
    setFinalVideoUrl(null);
    setPaidTransactionId(null);
    setAppStatus('upload');
  };

  const buildShotReferences = (shot: typeof selectedTemplate extends null ? never : NonNullable<typeof selectedTemplate>['shots'][0]) => {
    const refs: string[] = [];
    for (const inputId of shot.useInputs) {
      if (collectedInputs[inputId]) {
        refs.push(collectedInputs[inputId]);
      }
    }
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


    const initialImages: GeneratedImage[] = selectedTemplate.shots.map((shot) => ({
      id: `img-${shot.id}`,
      shotId: shot.id,
      prompt: shot.prompt,
      imageUrl: '',
      status: 'generating' as const
    }));
    setGeneratedImages(initialImages);

    const headers = await getAuthHeaders();

    const imagePromises = selectedTemplate.shots.map(async (shot, i) => {
      try {
        const shotReferences = buildShotReferences(shot);

        const response = await supabase.functions.invoke('generate-image', {
          body: { prompt: shot.prompt, referenceImages: shotReferences },
          headers
        });

        if (response.error) throw response.error;

        setGeneratedImages((prev) => prev.map((img) =>
          img.shotId === shot.id ? { ...img, imageUrl: response.data.imageUrl, status: 'complete' as const } : img
        ));

        return { success: true, index: i };
      } catch (error: unknown) {
        console.error(`Error generating shot ${shot.id}:`, error);
        const message = error instanceof Error ? error.message : 'Generation failed';
        toast({ variant: 'destructive', title: `Shot ${shot.id} Error`, description: message });
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
      const headers = await getAuthHeaders();

      const response = await supabase.functions.invoke('generate-image', {
        body: { prompt: shot.prompt, referenceImages: shotReferences },
        headers
      });

      if (response.error) throw response.error;

      setGeneratedImages((prev) => prev.map((img) =>
        img.id === imageId ? { ...img, imageUrl: response.data.imageUrl, status: 'complete' as const } : img
      ));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Regeneration failed';
      toast({ variant: 'destructive', title: 'Regeneration Error', description: message });
    }

    setRegeneratingImageId(null);
  };

  const handleGenerateVideosClick = () => {
    // If already paid (e.g., resuming after refresh), skip payment modal
    if (paidTransactionId) {
      generateVideos(paidTransactionId);
      return;
    }
    setShowPaymentQR(true);
  };

  const handlePaymentComplete = async (transactionId: string) => {
    setShowPaymentQR(false);
    setPaidTransactionId(transactionId);
    await generateVideos(transactionId);
  };

  const pollVideoStatus = async (requestId: string, statusUrl: string, responseUrl: string, index: number): Promise<string | null> => {
    const maxAttempts = 120;
    const headers = await getAuthHeaders();
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 3000));

      try {
        const res = await supabase.functions.invoke('check-video-status', {
          body: { requestId, statusUrl, responseUrl },
          headers
        });

        if (res.error) { console.error(`Poll error for video ${index}:`, res.error); continue; }

        const data = res.data;
        if (data?.status === 'complete' && data?.videoUrl) return data.videoUrl;
        if (data?.status === 'failed') throw new Error(data.error || 'Video generation failed');
      } catch (err) {
        if (attempt >= maxAttempts - 3) throw err;
        console.error(`Poll attempt ${attempt} error:`, err);
      }
    }
    throw new Error('Video generation timed out after 6 minutes');
  };

  const generateVideos = async (transactionId: string) => {
    if (!selectedTemplate) return;

    setAppStatus('videos');

    const initialProgress: VideoProgress[] = generatedImages.map((img, i) => ({
      id: `video-${i}`,
      status: 'pending' as const
    }));
    setVideoProgress(initialProgress);

    const headers = await getAuthHeaders();

    const jobPromises = generatedImages.map(async (img, i) => {
      setVideoProgress(prev => prev.map((v, idx) =>
        idx === i ? { ...v, status: 'generating' as const } : v
      ));

      try {
        const shot = selectedTemplate.shots.find(s => s.id === img.shotId);
        const videoPrompt = shot?.videoPrompt || '';

        const response = await supabase.functions.invoke('generate-video', {
          body: { 
            imageUrl: img.imageUrl, 
            prompt: videoPrompt,
            transactionId  // Pass transaction ID for server-side payment verification
          },
          headers
        });

        if (response.error) throw response.error;
        if (response.data?.error) throw new Error(response.data.error);

        if (response.data?.status === 'complete' && response.data?.videoUrl) {
          setVideoProgress(prev => prev.map((v, idx) =>
            idx === i ? { ...v, status: 'complete' as const, videoUrl: response.data.videoUrl } : v
          ));
          return response.data.videoUrl as string;
        }

        const requestId = response.data?.requestId;
        const statusUrl = response.data?.statusUrl;
        const responseUrl = response.data?.responseUrl;
        if (!requestId || !statusUrl || !responseUrl) throw new Error('No requestId/URLs returned from submit');

        const videoUrl = await pollVideoStatus(requestId, statusUrl, responseUrl, i);
        
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
    const requiredCount = selectedTemplate.shots.length;

    if (validVideoUrls.length === 0) {
      toast({ variant: 'destructive', title: 'All Videos Failed', description: 'Could not generate any video clips. Please try again.' });
      setAppStatus('review');
      return;
    }

    if (validVideoUrls.length < requiredCount) {
      toast({ variant: 'destructive', title: `${requiredCount - validVideoUrls.length} clip(s) failed`, description: 'Some clips failed to generate. Please go back and retry.' });
      setAppStatus('review');
      return;
    }

    setGeneratedVideos(validVideoUrls);
    setAppStatus('composing');
    await composeReel(validVideoUrls);
  };

  const pollComposeStatus = async (renderId: string): Promise<string> => {
    const maxAttempts = 90;
    const headers = await getAuthHeaders();
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      try {
        const res = await supabase.functions.invoke('compose-reel', {
          body: { renderId },
          headers
        });
        if (res.error) { console.error('Compose poll error:', res.error); continue; }
        if (res.data?.status === 'complete' && res.data?.videoUrl) return res.data.videoUrl;
        if (res.data?.status === 'failed') throw new Error(res.data.error || 'Render failed');
      } catch (err) {
        if (attempt >= maxAttempts - 3) throw err;
      }
    }
    throw new Error('Composition timed out after 3 minutes');
  };

  const composeReel = async (videoUrls: string[]) => {
    if (!selectedTemplate) return;

    try {
      const headers = await getAuthHeaders();

      const response = await supabase.functions.invoke('compose-reel', {
        body: { videoUrls, templateId: selectedTemplate.creatomateTemplateId },
        headers
      });

      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);

      if (response.data?.status === 'complete' && response.data?.videoUrl) {
        setFinalVideoUrl(response.data.videoUrl);
        setAppStatus('complete');
        toast({ title: '🎉 Reel Created!', description: 'Your viral video is ready to download' });
        return;
      }

      const renderId = response.data?.renderId;
      if (!renderId) throw new Error('No render ID returned');

      const finalUrl = await pollComposeStatus(renderId);
      setFinalVideoUrl(finalUrl);
      setAppStatus('complete');
      toast({ title: '🎉 Reel Created!', description: 'Your viral video is ready to download' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Composition failed';
      toast({ variant: 'destructive', title: 'Composition Error', description: message });
      setAppStatus('review');
    }
  };

  const handleStartOver = () => {
    setSelectedTemplate(null);
    setCollectedInputs({});
    setGeneratedImages([]);
    setGeneratedVideos([]);
    setVideoProgress([]);
    setFinalVideoUrl(null);
    setPaidTransactionId(null);
    setAppStatus('template');
    clearWorkflowState();
  };

  const handleRegistrationComplete = () => {
    setShowRegistration(false);
    refetch();
    toast({ title: 'Welcome!', description: 'You can now create amazing reels!' });
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
                <TemplateCard key={template.id} template={template} onSelect={handleSelectTemplate} />
              )}
            </div>
          </div>
        </div>
      );
    }

    if (appStatus === 'upload' && selectedTemplate) {
      return (
        <div className="w-full">
          <Button variant="ghost" onClick={handleStartOver} className="mb-6 gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Templates
          </Button>
          <ReferenceInputCollector
            template={selectedTemplate}
            collectedInputs={collectedInputs}
            onInputsChange={setCollectedInputs}
            onGenerate={handleGenerateClick}
            isGenerating={false}
          />
        </div>
      );
    }

    if (appStatus === 'generating' && selectedTemplate) {
      return <GeneratingState template={selectedTemplate} images={generatedImages} />;
    }

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
      
      <Header view="studio" setView={() => {}} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

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
