import { ArrowUp } from 'lucide-react';
import { MandalaBorder, DiyaIcon } from '@/components/IndianPatterns';

export function CTASection() {
  return (
    <section className="py-12 px-6 bg-gradient-to-b from-brand-saffron/10 to-brand-maroon/10 border-t border-brand-gold/20 relative">
      <MandalaBorder className="absolute top-0 left-0 right-0" />
      
      <div className="max-w-md mx-auto text-center">
        <DiyaIcon size={28} className="text-brand-gold mx-auto mb-3" />
        <h2 className="text-lg font-bold mb-2">
          Ready to Create?
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Pick a template and start in seconds.
        </p>
        
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="inline-flex items-center gap-2 h-10 px-6 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-all"
        >
          <ArrowUp size={14} />
          Start Now
        </button>
      </div>
    </section>
  );
}
