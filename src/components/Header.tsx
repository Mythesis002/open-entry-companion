import { Menu } from 'lucide-react';

interface HeaderProps {
  view: 'studio' | 'social';
  setView: (view: 'studio' | 'social') => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

export function Header({ view, setView, isMenuOpen, setIsMenuOpen }: HeaderProps) {
  return (
    <header className="fixed top-0 w-full h-14 lg:h-16 glass z-[100] border-b border-transparent px-6 lg:px-12 flex items-center justify-between">
      <div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={() => setView('studio')}
      >
        <div className="w-8 h-8 bg-card rounded-lg flex items-center justify-center shadow-sm">
          <img 
            src="https://res.cloudinary.com/dkr5qwdjd/image/upload/v1767983303/opentry.png" 
            className="w-8 h-8" 
            alt="Opentry AI video ads logo" 
          />
        </div>
        <span className="text-base font-extrabold font-display tracking-tighter">Opentry</span>
      </div>
      
      <nav className="hidden lg:flex items-center gap-10">
        <button 
          onClick={() => setView('studio')} 
          className={`text-xs font-bold transition-colors ${view === 'studio' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Studio
        </button>
        <button 
          onClick={() => setView('social')} 
          className={`text-xs font-bold transition-colors ${view === 'social' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Automation
        </button>
        <div className="h-4 w-px bg-border" />
        <button className="h-9 px-4 bg-secondary border border-border rounded-lg text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground hover:bg-accent transition-colors">
          Docs
        </button>
      </nav>
      
      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)} 
        className="lg:hidden p-2 text-foreground"
      >
        <Menu size={20} />
      </button>
    </header>
  );
}
