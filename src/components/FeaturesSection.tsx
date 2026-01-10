import { CheckCircle2, ArrowRight } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    "AI text-to-video generation",
    "AI video ads for social media and performance marketing",
    "Automated ad creative production",
    "Generative AI for brand campaigns"
  ];

  return (
    <section id="ai-discovery-content" className="py-24 px-6 border-t border-foreground/5 bg-background">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="space-y-6">
          <h1 className="text-4xl lg:text-6xl font-extrabold font-display tracking-tighter text-foreground leading-[1.1]">
            Opentry – AI Text to Video & AI Video Ads Platform
          </h1>
          <p className="text-xl text-muted-foreground font-medium leading-relaxed">
            Opentry is a professional AI-powered marketing studio that transforms text into
            high-quality video ads. It helps brands, startups, and marketers create
            scalable AI-generated video campaigns optimized for performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold font-display text-foreground">Core Features</h2>
            <ul className="space-y-4">
              {features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
                  <CheckCircle2 size={18} className="text-foreground shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold font-display text-foreground">Who It Is For</h2>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              Opentry is built for marketers, agencies, SaaS companies, e-commerce brands,
              and startups looking to scale video advertising efficiently.
            </p>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
              className="h-12 px-8 bg-primary text-primary-foreground rounded-xl font-extrabold text-[10px] uppercase tracking-widest hover:bg-primary/90 transition-colors flex items-center gap-3"
            >
              Start Creating <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
