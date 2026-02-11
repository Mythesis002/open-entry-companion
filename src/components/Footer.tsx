import opentryLogo from '@/assets/opentry-logo.png';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-6 px-6">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <img 
            src={opentryLogo} 
            className="w-7 h-7" 
            alt="Opentry logo" 
          />
          <span className="text-sm font-semibold">Opentry</span>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <button className="hover:text-foreground transition-colors">Privacy</button>
          <button className="hover:text-foreground transition-colors">Terms</button>
          <button className="hover:text-foreground transition-colors">Support</button>
        </div>

        <p className="text-xs text-muted-foreground">
          © 2026 Opentry
        </p>
      </div>
    </footer>
  );
}
