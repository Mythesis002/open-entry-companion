import { ArrowUp } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-12 px-6 bg-muted/50 border-t border-border/50">
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-lg font-bold mb-2">
          Ready to Create?
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Pick a template and start in seconds.
        </p>
        
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="inline-flex items-center gap-2 h-10 px-6 bg-foreground text-background rounded-lg font-medium text-sm hover:bg-foreground/90 transition-all"
        >
          <ArrowUp size={14} />
          Start Now
        </button>
      </div>
    </section>
  );
}
