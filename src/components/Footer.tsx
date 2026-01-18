import { Instagram, Twitter } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative bg-card border-t border-border py-8 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-foreground rounded-xl flex items-center justify-center">
              <span className="text-background font-bold text-sm">R</span>
            </div>
            <span className="text-lg font-bold">Reel Studio</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <button className="hover:text-foreground transition-colors">Privacy</button>
            <button className="hover:text-foreground transition-colors">Terms</button>
            <button className="hover:text-foreground transition-colors">Support</button>
          </div>

          {/* Social */}
          <div className="flex items-center gap-2">
            {[Instagram, Twitter].map((Icon, i) => (
              <button 
                key={i}
                className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © 2025 Reel Studio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
