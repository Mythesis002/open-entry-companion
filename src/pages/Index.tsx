import { useState } from 'react';
import { Header } from '@/components/Header';
import { MeshBackground } from '@/components/MeshBackground';
import { BusinessTypeSelector } from '@/components/BusinessTypeSelector';
import { BrandDetailsForm } from '@/components/BrandDetailsForm';
import { GeneratingState } from '@/components/GeneratingState';
import { RecentAdsCarousel } from '@/components/RecentAdsCarousel';
import { AboutSection } from '@/components/AboutSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import { FAQSection } from '@/components/FAQSection';
import { Footer } from '@/components/Footer';
import { SocialConnectionsPanel } from '@/components/SocialConnectionsPanel';
import type { AdInputs, BusinessType } from '@/types';

const Index = () => {
  const [view, setView] = useState<'studio' | 'social'>('studio');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  
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
    
    setIsGenerating(true);
    
    // Simulate generation process
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

      <main className="flex-1 pt-14 lg:pt-16 max-w-[1400px] mx-auto w-full relative z-10">
        {view === 'studio' ? (
          <div className="flex-1 flex flex-col items-center py-8 lg:py-16 px-6 animate-slide-up">
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

        {/* Recent Ads Carousel */}
        <RecentAdsCarousel />

        {/* About Section */}
        <AboutSection />

        {/* Features Section */}
        <FeaturesSection />

        {/* FAQ Section */}
        <FAQSection />
      </main>

      {/* Footer */}
      <Footer setView={setView} />
    </div>
  );
};

export default Index;
