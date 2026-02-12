import opentryLogo from '@/assets/opentry-logo.png';
import { MandalaBorder } from '@/components/IndianPatterns';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-6 px-6 relative">
      <MandalaBorder className="absolute top-0 left-0 right-0 opacity-40" />
      
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
        <div className="flex items-center gap-2">
          <img 
            src={opentryLogo} 
            className="w-7 h-7" 
            alt="Opentry logo" 
          />
          <span className="text-sm font-semibold">Opentry</span>
        </div>

        <div className="flex items-center gap-4 text-xs opacity-70">
          <button className="hover:opacity-100 transition-opacity">Privacy</button>
          <button className="hover:opacity-100 transition-opacity">Terms</button>
          <button className="hover:opacity-100 transition-opacity">Support</button>
        </div>

        <p className="text-xs opacity-70">
          © 2026 Opentry
        </p>
      </div>
    </footer>
  );
}
