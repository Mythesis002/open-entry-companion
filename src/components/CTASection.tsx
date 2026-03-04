import { ArrowUp, Sparkles } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-24 px-6 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-brand-saffron/5 via-brand-gold/8 to-brand-maroon/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent border border-border mb-6">
          <Sparkles size={12} className="text-brand-gold" />
          <span className="text-xs font-medium text-muted-foreground">Start creating in seconds</span>
        </div>

        <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
          Ready to go viral?
        </h2>
        <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
          Pick a template, upload your photo, and let AI create a scroll-stopping reel for you.
        </p>

        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="inline-flex items-center gap-2 h-11 px-8 bg-foreground text-background rounded-full font-semibold text-sm hover:opacity-90 transition-all duration-300 hover:scale-105"
        >
          <ArrowUp size={14} />
          Start Creating
        </button>
      </div>
    </section>
  );
}
