import { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Loader2, CheckCircle2, IndianRupee, AlertCircle, QrCode, Smartphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ReelTemplate } from '@/types';

interface PaymentQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
  template: ReelTemplate;
}

// Razorpay Key ID (public/publishable key) - for GPay intent
const RAZORPAY_KEY_ID = "rzp_live_R9sCSgyncgleJR";
const MERCHANT_VPA = "opentry@razorpay"; // Your Razorpay VPA

export function PaymentQRModal({ isOpen, onClose, onPaymentComplete, template }: PaymentQRModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'ready' | 'checking' | 'completed' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [qrId, setQrId] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // 15 minutes
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Initialize payment when modal opens
  useEffect(() => {
    if (isOpen && user && paymentStatus === 'idle') {
      initializePayment();
    }
  }, [isOpen, user]);

  // Timer countdown
  useEffect(() => {
    if (paymentStatus === 'ready' && timeLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            setPaymentStatus('failed');
            setError('QR code expired. Please try again.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [paymentStatus]);

  const createTransaction = async (): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const { data: transaction, error } = await supabase
        .from('ad_transactions')
        .insert({
          user_id: user.id,
          amount: template.price,
          status: 'pending',
          ad_inputs: { templateId: template.id, templateName: template.name }
        })
        .select()
        .single();

      if (error) throw error;
      return transaction.id;
    } catch (error) {
      console.error('Error creating transaction:', error);
      return null;
    }
  };

  const initializePayment = async () => {
    setPaymentStatus('loading');
    setError(null);

    try {
      // Step 1: Create transaction
      const txnId = await createTransaction();
      if (!txnId) throw new Error('Failed to create transaction');
      setTransactionId(txnId);

      // Step 2: Create Razorpay QR
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const response = await supabase.functions.invoke('create-razorpay-qr', {
        body: { 
          amount: template.price, 
          transaction_id: txnId,
          template_name: template.name
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.error) throw new Error(response.error.message);

      const { qr_id, image_url } = response.data;
      setQrId(qr_id);
      setQrImageUrl(image_url);
      setPaymentStatus('ready');

      // Start polling for payment
      startPolling(qr_id, txnId);

    } catch (err: any) {
      console.error('Payment initialization error:', err);
      setError(err.message || 'Failed to initialize payment');
      setPaymentStatus('failed');
    }
  };

  const startPolling = (qrId: string, txnId: string) => {
    // Poll every 3 seconds
    pollIntervalRef.current = setInterval(async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;

        const response = await supabase.functions.invoke('check-qr-payment', {
          body: { qr_id: qrId, transaction_id: txnId },
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (response.data?.paid) {
          // Payment successful!
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          
          setPaymentStatus('completed');
          toast({ 
            title: '✅ Payment Successful!', 
            description: 'Starting video generation...' 
          });

          setTimeout(() => {
            onPaymentComplete();
          }, 1500);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);
  };

  const handleGPayClick = () => {
    // Create UPI intent URL
    const upiUrl = `upi://pay?pa=${MERCHANT_VPA}&pn=Opentry&am=${template.price}&cu=INR&tn=${encodeURIComponent(`Video generation for ${template.name}`)}`;
    
    // Open UPI intent
    window.location.href = upiUrl;
  };

  const handleClose = () => {
    if (paymentStatus !== 'checking' && paymentStatus !== 'completed') {
      // Cleanup
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      setPaymentStatus('idle');
      setQrImageUrl(null);
      setQrId(null);
      setTransactionId(null);
      setTimeLeft(15 * 60);
      setError(null);
      onClose();
    }
  };

  const handleRetry = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setPaymentStatus('idle');
    setQrImageUrl(null);
    setQrId(null);
    setTransactionId(null);
    setTimeLeft(15 * 60);
    setError(null);
    initializePayment();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden bg-gradient-to-br from-background via-background to-muted/30 border-0">
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 rounded-full p-2 bg-muted/80 hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {paymentStatus === 'completed' ? (
          // Success State
          <div className="flex flex-col items-center justify-center py-16 px-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mb-6 animate-pulse">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground text-center">
              Starting video generation...
            </p>
          </div>
        ) : paymentStatus === 'failed' ? (
          // Failed State
          <div className="flex flex-col items-center justify-center py-16 px-8">
            <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
              <AlertCircle className="w-12 h-12 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold text-destructive mb-2">Payment Failed</h2>
            <p className="text-muted-foreground text-center mb-6">
              {error || 'Something went wrong. Please try again.'}
            </p>
            <Button onClick={handleRetry} variant="default">
              Try Again
            </Button>
          </div>
        ) : paymentStatus === 'loading' ? (
          // Loading State
          <div className="flex flex-col items-center justify-center py-20 px-8">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Generating payment QR...</p>
          </div>
        ) : (
          // Payment Ready State
          <div className="flex flex-col">
            {/* Header */}
            <div className="text-center pt-8 pb-4 px-6">
              <h2 className="text-2xl font-bold mb-1">Complete Payment</h2>
              <div className="flex items-center justify-center gap-1 text-3xl font-bold text-primary">
                <IndianRupee className="w-7 h-7" />
                <span>{template.price}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                for {template.name} video generation
              </p>
            </div>

            {/* QR Code Section */}
            <div className="px-6 pb-4">
              <div className="relative bg-white rounded-2xl p-4 shadow-lg mx-auto max-w-[280px]">
                {qrImageUrl ? (
                  <img 
                    src={qrImageUrl} 
                    alt="Payment QR Code" 
                    className="w-full h-auto rounded-lg"
                  />
                ) : (
                  <div className="w-full aspect-square bg-muted/50 rounded-lg flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-muted-foreground/30" />
                  </div>
                )}
                
                {/* Timer badge */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-medium shadow-md">
                  Expires in {formatTime(timeLeft)}
                </div>
              </div>
              
              <p className="text-center text-sm text-muted-foreground mt-6">
                Scan with any UPI app to pay
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 px-6 py-2">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-xs text-muted-foreground font-medium">OR</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>

            {/* GPay Button */}
            <div className="px-6 pb-8">
              <Button 
                onClick={handleGPayClick}
                className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl flex items-center justify-center gap-3"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="hsl(var(--primary))"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="hsl(142.1 76.2% 36.3%)"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="hsl(43.3 96.4% 56.3%)"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="hsl(4 90% 58%)"/>
                </svg>
                Pay with GPay
              </Button>
              
              <p className="text-center text-xs text-muted-foreground mt-3">
                Payment will be automatically verified
              </p>
            </div>

            {/* Security badge */}
            <div className="bg-muted/50 py-3 px-6 flex items-center justify-center gap-2">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-xs text-muted-foreground">Secured by Razorpay</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
