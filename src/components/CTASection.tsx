import { ArrowRight, Sparkles } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground to-foreground/90" />
      
      {/* Mesh overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-[150px]" />
      </div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />
      
      <div className="max-w-4xl mx-auto relative text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-8">
          <Sparkles size={14} className="text-white" />
          <span className="text-white/80 text-sm font-semibold">No credit card required</span>
        </div>
        
        {/* Headline */}
        <h2 className="text-4xl lg:text-6xl font-extrabold font-display tracking-tighter text-background mb-6 leading-[1.1]">
          Ready to Create Your<br/>First AI Video Ad?
        </h2>
        
        <p className="text-background/60 text-lg font-medium max-w-xl mx-auto mb-10">
          Join 12,000+ businesses already using Opentry to scale their video marketing.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="h-14 px-10 bg-background text-foreground rounded-2xl font-extrabold text-sm uppercase tracking-wider hover:bg-background/90 transition-all hover:scale-105 shadow-2xl flex items-center gap-3"
          >
            Start Creating Free
            <ArrowRight size={18} />
          </button>
          <button className="h-14 px-10 bg-white/10 text-background border border-white/20 rounded-2xl font-extrabold text-sm uppercase tracking-wider hover:bg-white/20 transition-all backdrop-blur-sm">
            Watch Demo
          </button>
        </div>
        
        {/* Trust logos placeholder */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <p className="text-background/40 text-xs font-bold uppercase tracking-widest mb-6">
            Trusted by leading brands
          </p>
          <div className="flex items-center justify-center gap-12 opacity-40">
            <span className="text-2xl font-extrabold text-background/60 font-display">TechFlow</span>
            <span className="text-2xl font-extrabold text-background/60 font-display">Luxe</span>
            <span className="text-2xl font-extrabold text-background/60 font-display">GrowthLabs</span>
            <span className="text-2xl font-extrabold text-background/60 font-display hidden md:block">Digital First</span>
          </div>
        </div>
      </div>
    </section>
  );
}
