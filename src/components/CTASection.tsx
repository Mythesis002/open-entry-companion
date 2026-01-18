import { ArrowUp } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-16 px-6 relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 border-t border-border/50">
      <div className="max-w-2xl mx-auto relative text-center">
        {/* Headline */}
        <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground mb-4">
          Ready to Create Your Viral Reel?
        </h2>
        
        <p className="text-muted-foreground text-base max-w-md mx-auto mb-8">
          Pick a template and start creating in seconds. No design skills needed.
        </p>
        
        {/* CTA Button */}
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="inline-flex items-center gap-2 h-12 px-8 bg-foreground text-background rounded-xl font-semibold text-sm hover:bg-foreground/90 transition-all hover:scale-105 shadow-lg"
        >
          <ArrowUp size={16} />
          Start Creating
        </button>
      </div>
    </section>
  );
}
