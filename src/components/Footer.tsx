import { Instagram, Twitter, Linkedin, Github, Mail } from 'lucide-react';

interface FooterProps {
  setView: (view: 'studio' | 'social') => void;
}

export function Footer({ setView }: FooterProps) {
  return (
    <footer className="bg-card border-t border-foreground/5 pt-24 pb-12 px-6 lg:px-12">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-20">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <img 
                  src="https://res.cloudinary.com/dkr5qwdjd/image/upload/v1767983303/opentry.png" 
                  className="w-5 h-5 invert" 
                  alt="Opentry AI logo" 
                />
              </div>
              <span className="text-xl font-extrabold font-display tracking-tighter">Opentry</span>
            </div>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed max-w-sm">
              Revolutionizing business marketing with professional-grade AI video production. High fidelity, low cost, infinite creativity.
            </p>
            <div className="flex items-center gap-4">
              <button className="w-10 h-10 rounded-full border border-foreground/5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-all">
                <Instagram size={18} />
              </button>
              <button className="w-10 h-10 rounded-full border border-foreground/5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-all">
                <Twitter size={18} />
              </button>
              <button className="w-10 h-10 rounded-full border border-foreground/5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-all">
                <Linkedin size={18} />
              </button>
              <button className="w-10 h-10 rounded-full border border-foreground/5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-all">
                <Github size={18} />
              </button>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-muted-foreground">Product</h4>
            <ul className="space-y-4">
              <li>
                <button onClick={() => setView('studio')} className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
                  Studio
                </button>
              </li>
              <li>
                <button onClick={() => setView('social')} className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
                  Automation
                </button>
              </li>
              <li>
                <button className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </button>
              </li>
              <li>
                <button className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
                  API Access
                </button>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-muted-foreground">Resources</h4>
            <ul className="space-y-4">
              <li>
                <button className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </button>
              </li>
              <li>
                <button className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
                  Help Center
                </button>
              </li>
              <li>
                <button className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
                  Ad Showcase
                </button>
              </li>
              <li>
                <button className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors">
                  Affiliate
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-muted-foreground">Stay Updated</h4>
            <p className="text-xs font-bold text-muted-foreground">
              Join 5,000+ creators getting weekly AI insights.
            </p>
            <div className="relative group">
              <input 
                className="w-full h-12 bg-secondary border border-border rounded-xl px-5 pr-12 text-xs font-bold outline-none focus:border-foreground transition-all placeholder:text-muted-foreground" 
                placeholder="Email address" 
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center hover:bg-primary/90 transition-colors">
                <Mail size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-foreground/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-extrabold text-muted-foreground/50 uppercase tracking-[0.5em]">
            Opentry AI Production © 2025
          </p>
          <div className="flex items-center gap-8">
            <button className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </button>
            <button className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </button>
            <button className="text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
              Cookie Settings
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
