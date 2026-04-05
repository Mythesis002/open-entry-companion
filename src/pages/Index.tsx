import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ImagePlus } from 'lucide-react';
import { ChatPanel } from '@/components/ecommerce/ChatPanel';
import { ToolsSidebar } from '@/components/ecommerce/ToolsSidebar';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

import { useToast } from '@/hooks/use-toast';

import opentryLogo from '@/assets/opentry-logo.png';

export default function Index() {
  const [showTools, setShowTools] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({ title: 'Signed out' });
  };

  return (
    <>
      <Helmet>
        <title>Opentry — AI E-Commerce Research Assistant</title>
        <meta name="description" content="Your AI-powered e-commerce assistant. Research stores, compare products, analyze trends, and create stunning product ads." />
        <link rel="canonical" href="https://opentry.in" />
      </Helmet>

      <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-border bg-background/80 backdrop-blur-sm flex items-center justify-between px-4 shrink-0 z-20">
          <div className="flex items-center gap-3">
            <img src={opentryLogo} alt="Opentry" className="h-7" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            <span className="text-base font-bold font-display text-foreground hidden sm:inline">Opentry</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showTools ? 'default' : 'outline'}
              size="sm"
              className="gap-2 rounded-lg text-xs"
              onClick={() => setShowTools(!showTools)}
            >
              <ImagePlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tools</span>
            </Button>

            {user ? (
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-xs">
                Sign Out
              </Button>
            ) : (
              <Button size="sm" onClick={() => navigate('/auth')} className="text-xs rounded-lg">
                Sign In
              </Button>
            )}
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat — always visible */}
          <div className="flex-1 min-w-0">
            <ChatPanel />
          </div>

          {/* Tools sidebar — toggled */}
          {showTools && (
            <div className="w-[400px] shrink-0 hidden lg:block">
              <ToolsSidebar />
            </div>
          )}
        </div>

        {/* Mobile tools overlay */}
        {showTools && (
          <div className="fixed inset-0 z-30 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowTools(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-[90%] max-w-[400px] bg-background shadow-2xl">
              <ToolsSidebar />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
