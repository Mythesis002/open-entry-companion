import { useState } from 'react';
import { Header } from '@/components/Header';
import { MeshBackground } from '@/components/MeshBackground';
import { BusinessTypeSelector } from '@/components/BusinessTypeSelector';
import { BrandDetailsForm } from '@/components/BrandDetailsForm';
import { GeneratingState } from '@/components/GeneratingState';
import { VideoCarousel } from '@/components/VideoCarousel';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { AboutSection } from '@/components/AboutSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { PricingSection } from '@/components/PricingSection';
import { FAQSection } from '@/components/FAQSection';
import { CTASection } from '@/components/CTASection';
import { Footer } from '@/components/Footer';
import { SocialConnectionsPanel } from '@/components/SocialConnectionsPanel';
import { RegistrationModal } from '@/components/RegistrationModal';
import { useAuth } from '@/hooks/useAuth';
import { useUserCredits } from '@/hooks/useUserCredits';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { AdInputs, BusinessType } from '@/types';

const Index = () => {
  const [view, setView] = useState<'studio' | 'social'>('studio');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [showRegistration, setShowRegistration] = useState(false);
  
  const { user } = useAuth();
  const { isRegistered, isTrialActive, getDaysRemaining, refetch } = useUserCredits();
  const { toast } = useToast();
  
  const [inputs, setInputs] = useState<AdInputs>({
    businessType: 'product',
    brandName: '',
    productName: '',
    description: '',
    brandLogo: null,
    productImages: [],
    mood: 'cinematic',
    audience: 'general',
    objective: 'awareness'
  });

  const isFormValid = inputs.productName.length > 0 && inputs.productImages.length > 0;

  const handleGenerate = async () => {
    if (!isFormValid) return;
    
    // Check if user needs to register
    if (!user || !isRegistered()) {
      setShowRegistration(true);
      return;
    }

    // Check if trial is active or payment is needed
    if (!isTrialActive()) {
      // Need to process payment via Razorpay
      await handlePaymentRequired();
      return;
    }
    
    // Trial active - proceed with generation
    await proceedWithGeneration();
  };

  const handlePaymentRequired = async () => {
    try {
      // Create transaction record
      const { data: transaction, error: txError } = await supabase
        .from('ad_transactions')
        .insert({
          user_id: user!.id,
          amount: 29,
          status: 'pending',
          ad_inputs: inputs as any
        })
        .select()
        .single();

      if (txError) throw txError;

      // Create Razorpay order
      const { data: session } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: 29,
          transaction_id: transaction.id
        }
      });

      if (response.error) throw response.error;

      const orderData = response.data;

      // Load Razorpay checkout
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'OpenTry Ad Studio',
        description: 'Video Ad Generation - ₹29',
        order_id: orderData.order_id,
        handler: async function (response: any) {
          // Verify payment
          const verifyResponse = await supabase.functions.invoke('verify-razorpay-payment', {
            body: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              transaction_id: transaction.id
            }
          });

          if (verifyResponse.error) {
            toast({
              variant: "destructive",
              title: "Payment Failed",
              description: "Could not verify payment"
            });
            return;
          }

          toast({
            title: "Payment Successful!",
            description: "Starting ad generation..."
          });

          await proceedWithGeneration();
        },
        prefill: {
          email: user?.email
        },
        theme: {
          color: '#6366f1'
        }
      };

      // @ts-ignore - Razorpay types
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  };

  const proceedWithGeneration = async () => {
    setIsGenerating(true);
    
    const steps = [
      "Analyzing Brand",
      "Writing Script", 
      "Recording Voice",
      "Painting Scene 1",
      "Painting Scene 2",
      "Painting Scene 3",
      "Rendering Video"
    ];
    
    for (const step of steps) {
      setGenerationStep(step);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    setIsGenerating(false);
    setGenerationStep("");

    // Record transaction for trial period
    if (user && isTrialActive()) {
      await supabase.from('ad_transactions').insert({
        user_id: user.id,
        amount: 29,
        status: 'pending',
        ad_inputs: inputs as any
      });
    }
  };

  const handleRegistrationComplete = () => {
    setShowRegistration(false);
    refetch();
    toast({
      title: "Welcome!",
      description: `You have ${getDaysRemaining()} days of pay-later period.`
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-x-hidden relative">
      {/* Global Mesh gradient background */}
      {view === 'studio' && !isGenerating && <MeshBackground />}
      
      <Header 
        view={view} 
        setView={setView} 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
      />

      <main className="flex-1 pt-14 lg:pt-16 w-full relative z-10">
        {view === 'studio' ? (
          <div className="flex-1 flex flex-col items-center py-8 lg:py-16 px-6 animate-slide-up max-w-[1400px] mx-auto">
            {!isGenerating ? (
              <div className="w-full max-w-5xl flex flex-col items-center gap-12">
                {/* Hero Text */}
                <div className="text-center space-y-5 max-w-3xl relative">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-50 to-purple-50 border border-cyan-100">
                    <span className="text-cyan-600 text-sm">✦</span>
                    <span className="text-sm font-semibold text-foreground/80">AI-Powered Video Ads</span>
                  </div>
                  
                  <h1 className="text-5xl lg:text-7xl font-extrabold font-display leading-[1] tracking-tighter text-foreground">
                    OpenTry<br/>Ad Studio
                  </h1>
                  <p className="text-base lg:text-lg text-muted-foreground font-medium max-w-xl mx-auto">
                    Create stunning video ads in minutes. Upload your brand assets, describe your offer, and let AI craft professional commercials for local businesses.
                  </p>
                </div>

                {/* Business Type Selector */}
                <div className="w-full">
                  <BusinessTypeSelector
                    selected={inputs.businessType}
                    onSelect={(type: BusinessType) => setInputs(prev => ({ ...prev, businessType: type }))}
                  />
                </div>

                {/* Brand Details Form */}
                <BrandDetailsForm 
                  inputs={inputs}
                  setInputs={setInputs}
                  onGenerate={handleGenerate}
                  isValid={isFormValid}
                />

                {/* Social Connections Panel */}
                <SocialConnectionsPanel />
              </div>
            ) : (
              <GeneratingState step={generationStep} />
            )}
          </div>
        ) : (
          <div className="container mx-auto px-6 py-20 text-center">
            <h2 className="text-2xl font-extrabold font-display">
              Automation Hub coming soon.
            </h2>
            <button 
              onClick={() => setView('studio')} 
              className="mt-6 h-12 px-8 bg-primary text-primary-foreground rounded-xl font-bold"
            >
              Back to Studio
            </button>
          </div>
        )}

        {/* Video Carousel - Vertical videos with click-to-play */}
        <VideoCarousel />

        {/* How It Works */}
        <HowItWorksSection />

        {/* About Section */}
        <AboutSection />

        {/* Features Section */}
        <FeaturesSection />

        {/* Testimonials */}
        <TestimonialsSection />

        {/* Pricing Section */}
        <PricingSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* Final CTA */}
        <CTASection />
      </main>

      {/* Footer */}
      <Footer setView={setView} />

      {/* Registration Modal */}
      <RegistrationModal 
        isOpen={showRegistration}
        onClose={() => setShowRegistration(false)}
        onComplete={handleRegistrationComplete}
      />
    </div>
  );
};

export default Index;
