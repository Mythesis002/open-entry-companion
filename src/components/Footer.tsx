import { Instagram, Twitter, Linkedin, Youtube, Mail, ArrowRight } from 'lucide-react';

interface FooterProps {
  setView: (view: 'studio' | 'social') => void;
}

export function Footer({ setView }: FooterProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative bg-foreground text-background overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-[1400px] mx-auto px-6 lg:px-12 pt-20 pb-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center shadow-lg">
                <img 
                  src="https://res.cloudinary.com/dkr5qwdjd/image/upload/v1767983303/opentry.png" 
                  className="w-7 h-7" 
                  alt="Opentry AI logo" 
                />
              </div>
              <span className="text-2xl font-extrabold font-display tracking-tighter">Opentry</span>
            </div>
            <p className="text-sm text-background/60 font-medium leading-relaxed max-w-sm">
              Revolutionizing business marketing with AI-powered video production. Create professional ads in minutes, not weeks.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {[
                { icon: Instagram, label: 'Instagram' },
                { icon: Twitter, label: 'Twitter' },
                { icon: Linkedin, label: 'LinkedIn' },
                { icon: Youtube, label: 'YouTube' }
              ].map(({ icon: Icon, label }) => (
                <button 
                  key={label}
                  className="w-10 h-10 rounded-xl bg-background/10 flex items-center justify-center text-background/60 hover:text-background hover:bg-background/20 transition-all duration-300"
                  aria-label={label}
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div className="lg:col-span-2 space-y-5">
            <h4 className="text-xs font-extrabold uppercase tracking-[0.2em] text-background/40">Product</h4>
            <ul className="space-y-3">
              {[
                { label: 'Studio', action: () => setView('studio') },
                { label: 'Automation', action: () => setView('social') },
                { label: 'Pricing', action: () => scrollToSection('pricing') },
                { label: 'API Access', action: () => {} }
              ].map(({ label, action }) => (
                <li key={label}>
                  <button 
                    onClick={action}
                    className="text-sm font-medium text-background/60 hover:text-background transition-colors duration-200"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div className="lg:col-span-2 space-y-5">
            <h4 className="text-xs font-extrabold uppercase tracking-[0.2em] text-background/40">Resources</h4>
            <ul className="space-y-3">
              {['Documentation', 'Help Center', 'Ad Showcase', 'Blog'].map((label) => (
                <li key={label}>
                  <button className="text-sm font-medium text-background/60 hover:text-background transition-colors duration-200">
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="lg:col-span-2 space-y-5">
            <h4 className="text-xs font-extrabold uppercase tracking-[0.2em] text-background/40">Company</h4>
            <ul className="space-y-3">
              {['About Us', 'Careers', 'Press Kit', 'Contact'].map((label) => (
                <li key={label}>
                  <button className="text-sm font-medium text-background/60 hover:text-background transition-colors duration-200">
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-2 space-y-5">
            <h4 className="text-xs font-extrabold uppercase tracking-[0.2em] text-background/40">Stay Updated</h4>
            <p className="text-sm font-medium text-background/60">
              Get weekly AI marketing insights.
            </p>
            <div className="relative">
              <input 
                className="w-full h-12 bg-background/10 border border-background/20 rounded-xl px-4 pr-12 text-sm font-medium text-background placeholder:text-background/40 outline-none focus:border-background/40 transition-colors" 
                placeholder="Your email" 
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-background text-foreground rounded-lg flex items-center justify-center hover:scale-110 transition-transform">
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-background/20 to-transparent mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-medium text-background/40">
            © 2025 Opentry AI. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map((label) => (
              <button 
                key={label}
                className="text-xs font-medium text-background/40 hover:text-background/70 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
