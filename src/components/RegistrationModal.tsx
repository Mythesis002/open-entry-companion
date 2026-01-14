import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, ArrowRight, Loader2, CheckCircle2, IndianRupee } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type Step = 'credentials' | 'upi_verification' | 'complete';

export function RegistrationModal({ isOpen, onClose, onComplete }: RegistrationModalProps) {
  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { signUp, signIn, user } = useAuth();
  const { toast } = useToast();

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      // Try to sign up first
      const { error: signUpError } = await signUp(email, password);
      
      if (signUpError) {
        // If user exists, try to sign in
        if (signUpError.message.includes('already registered')) {
          const { error: signInError } = await signIn(email, password);
          if (signInError) {
            toast({
              variant: "destructive",
              title: "Login Failed",
              description: signInError.message
            });
            setIsLoading(false);
            return;
          }
        } else {
          toast({
            variant: "destructive",
            title: "Registration Failed",
            description: signUpError.message
          });
          setIsLoading(false);
          return;
        }
      }

      // Move to UPI verification step
      setStep('upi_verification');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUPIVerification = async () => {
    setIsVerifying(true);
    
    // Simulate UPI verification (in production, this would verify the actual payment setup)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      // Create user credits entry with 5-day trial
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 5);

      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        const { error } = await supabase.from('user_credits').insert({
          user_id: session.session.user.id,
          credits: 0,
          trial_ends_at: trialEndsAt.toISOString(),
          upi_verified: true
        });

        if (error && !error.message.includes('duplicate')) {
          console.error('Error creating credits:', error);
        }
      }

      setStep('complete');
      toast({
        title: "Registration Complete!",
        description: "You can now create ads. Pay-later period: 5 days."
      });
      
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: error.message
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'credentials':
        return (
          <form onSubmit={handleCredentialsSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 font-bold"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account...</>
              ) : (
                <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </form>
        );

      case 'upi_verification':
        return (
          <div className="space-y-6">
            {/* Pricing Info */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-amber-100">
                  <IndianRupee className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-bold text-amber-800">Pay-Per-Ad Pricing</p>
                  <p className="text-sm text-amber-700">Every ad creation costs ₹29 only</p>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Scan the QR code below with Google Pay to set up auto-debit
              </p>
              
              <div className="inline-flex p-6 rounded-2xl bg-white border-2 border-dashed border-foreground/10">
                <div className="w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center">
                  <QrCode className="h-32 w-32 text-foreground/70" />
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                This sets up payment for after your 5-day trial period
              </p>
            </div>

            {/* 5-Day Trial Info */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-100">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-green-800">5-Day Pay Later</p>
                  <p className="text-sm text-green-700">Create ads now, pay after 5 days via Razorpay</p>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleUPIVerification}
              className="w-full h-12 font-bold"
              disabled={isVerifying}
            >
              {isVerifying ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
              ) : (
                <>I've Scanned the QR Code <CheckCircle2 className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center py-8 space-y-4">
            <div className="inline-flex p-4 rounded-full bg-green-100">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-xl font-bold">You're All Set!</h3>
            <p className="text-muted-foreground">
              Start creating amazing video ads now.
            </p>
          </div>
        );
    }
  };

  const getTitle = () => {
    switch (step) {
      case 'credentials':
        return 'Create Your Account';
      case 'upi_verification':
        return 'Set Up Payment';
      case 'complete':
        return 'Registration Complete';
    }
  };

  const getDescription = () => {
    switch (step) {
      case 'credentials':
        return 'Register to start creating AI-powered video ads';
      case 'upi_verification':
        return 'Link your payment method for seamless ad creation';
      case 'complete':
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{getTitle()}</DialogTitle>
          {getDescription() && (
            <DialogDescription>{getDescription()}</DialogDescription>
          )}
        </DialogHeader>
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}
