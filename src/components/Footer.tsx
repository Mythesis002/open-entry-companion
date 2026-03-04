import opentryLogo from '@/assets/opentry-logo.png';

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-12 px-6 relative overflow-hidden">
      {/* Subtle top accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-brand-saffron via-brand-gold to-brand-maroon opacity-40" />

      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <img
              src={opentryLogo}
              className="w-7 h-7"
              alt="Opentry logo"
            />
            <span className="text-sm font-bold tracking-tight">Opentry</span>
          </div>

          <div className="flex items-center gap-6 text-xs text-background/50">
            <button className="hover:text-background/80 transition-colors">Privacy</button>
            <button className="hover:text-background/80 transition-colors">Terms</button>
            <button className="hover:text-background/80 transition-colors">Support</button>
          </div>

          <p className="text-xs text-background/40">
            © 2026 Opentry. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
