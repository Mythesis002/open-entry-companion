import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function RegistrationModal({ isOpen, onClose, onComplete }: RegistrationModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { signUp, signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      const { error: signUpError } = await signUp(email, password);
      
      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          const { error: signInError } = await signIn(email, password);
          if (signInError) {
            toast({ variant: "destructive", title: "Login Failed", description: signInError.message });
            setIsLoading(false);
            return;
          }
        } else {
          toast({ variant: "destructive", title: "Registration Failed", description: signUpError.message });
          setIsLoading(false);
          return;
        }
      }

      // Create user credits entry
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 5);

      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        await supabase.from('user_credits').insert({
          user_id: session.session.user.id,
          credits: 0,
          trial_ends_at: trialEndsAt.toISOString(),
          upi_verified: false
        });
      }

      setIsComplete(true);
      toast({ title: "Welcome!", description: "Your account is ready. Start creating reels!" });
      
      setTimeout(() => {
        setIsComplete(false);
        onComplete();
      }, 1500);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (isComplete) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-8 space-y-4">
            <div className="inline-flex p-4 rounded-full bg-green-100">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-xl font-bold">You're All Set!</h3>
            <p className="text-muted-foreground">Start creating amazing reels now.</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create Your Account</DialogTitle>
          <DialogDescription>Register to start creating AI-powered viral reels</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="h-12" />
            </div>
          </div>
          <Button type="submit" className="w-full h-12 font-bold" disabled={isLoading}>
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...</>
            ) : (
              <>Get Started <ArrowRight className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
