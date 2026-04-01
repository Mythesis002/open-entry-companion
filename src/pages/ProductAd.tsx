import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Header } from '@/components/Header';
import { MeshBackground } from '@/components/MeshBackground';
import { Footer } from '@/components/Footer';
import { ProductAdGenerator } from '@/components/ProductAdGenerator';

export default function ProductAd() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>AI Product Ad Generator — Create Stunning Ads | Opentry</title>
        <meta name="description" content="Upload your product photo and let AI create professional ad images with perfect colors, background, copy, and CTA. Free to try." />
        <link rel="canonical" href="https://opentry.in/product-ad" />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-x-hidden relative">
        <MeshBackground />
        <Header view="studio" setView={() => {}} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />

        <main className="flex-1 pt-14 lg:pt-16 w-full relative z-10">
          <div className="flex-1 flex flex-col items-center py-8 lg:py-16 px-6 animate-slide-up max-w-[1400px] mx-auto">
            <ProductAdGenerator />
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
