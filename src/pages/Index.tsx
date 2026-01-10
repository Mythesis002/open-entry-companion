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
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-x-hidden">
      <Header 
        view={view} 
        setView={setView} 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen} 
      />

      <main className="flex-1 pt-14 lg:pt-16 max-w-[1400px] mx-auto w-full relative">
        {/* Mesh gradient background - only visible on studio view */}
        {view === 'studio' && !isGenerating && <MeshBackground />}

        {view === 'studio' ? (
          <div className="flex-1 flex flex-col items-center py-8 lg:py-16 px-6 animate-slide-up">
            {!isGenerating ? (
              <div className="w-full max-w-5xl flex flex-col items-center gap-12">
                {/* Hero Text */}
                <div className="text-center space-y-4 max-w-2xl relative">
                  <h1 className="text-5xl lg:text-7xl font-extrabold font-display leading-[1] tracking-tighter text-foreground">
                    AI Video<br/>Ads for Business
                  </h1>
                  <p className="text-sm lg:text-lg text-muted-foreground font-medium">
                    Create free viral video commercials in seconds.
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
