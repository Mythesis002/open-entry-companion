import { Menu, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import opentryLogo from '@/assets/opentry-logo.png';

interface HeaderProps {
  view: 'studio' | 'social';
  setView: (view: 'studio' | 'social') => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

export function Header({ view, setView, isMenuOpen, setIsMenuOpen }: HeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      navigate('/auth');
    }
  };

  return (
    <header className="fixed top-0 w-full h-14 lg:h-16 glass z-[100] border-b border-transparent px-6 lg:px-12 flex items-center justify-between">
      <div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={() => setView('studio')}
      >
        <img 
          src={opentryLogo} 
          className="w-8 h-8" 
          alt="Opentry logo" 
        />
        <span className="text-base font-extrabold font-display tracking-tighter">Opentry</span>
      </div>
      
      <nav className="hidden lg:flex items-center gap-8">
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 h-9 px-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <span className="text-xs font-medium max-w-[120px] truncate">
                  {user.email?.split('@')[0]}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="text-xs text-muted-foreground cursor-default">
                {user.email}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            onClick={() => navigate('/auth')}
            size="sm"
            className="h-9 px-4 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground text-xs font-semibold"
          >
            Sign In
          </Button>
        )}
      </nav>
      
      <div className="lg:hidden flex items-center gap-3">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-xs text-muted-foreground cursor-default">
                {user.email}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            onClick={() => navigate('/auth')}
            size="sm"
            className="h-8 px-3 bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-semibold"
          >
            Sign In
          </Button>
        )}
        
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)} 
          className="p-2 text-foreground"
        >
          <Menu size={20} />
        </button>
      </div>
    </header>
  );
}
