import { useState, useEffect, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, CheckCircle2, IndianRupee, AlertCircle, Smartphone, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import type { ReelTemplate } from '@/types';

interface PaymentQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
  template: ReelTemplate;
}

export function PaymentQRModal({ isOpen, onClose, onPaymentComplete, template }: PaymentQRModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'qr_generated' | 'completed' | 'failed' | 'expired'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [qrData, setQrData] = useState<{
    qr_id: string;
    qr_image_url: string;
    upi_link: string;
    close_by: number;
    transaction_id: string;
  } | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutes
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Cleanup on unmount or close
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen && paymentStatus === 'idle') {
      initiatePayment();
    }
  }, [isOpen]);

  // Timer countdown
  useEffect(() => {
    if (paymentStatus === 'qr_generated' && qrData) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setPaymentStatus('expired');
            if (pollingRef.current) clearInterval(pollingRef.current);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [paymentStatus, qrData]);

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

  const createQRCode = async (transactionId: string) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    const response = await supabase.functions.invoke('create-razorpay-qr', {
      body: { amount: template.price, transaction_id: transactionId },
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    if (response.error) throw new Error(response.error.message);
    return response.data;
  };

  const checkPaymentStatus = async (qrId: string, transactionId: string) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const response = await supabase.functions.invoke('check-qr-payment', {
        body: { qr_id: qrId, transaction_id: transactionId },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (response.error) throw new Error(response.error.message);
      
      if (response.data.paid) {
        // Payment successful!
        if (pollingRef.current) clearInterval(pollingRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        
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
      console.error('Error checking payment:', err);
    }
  };

  const startPolling = (qrId: string, transactionId: string) => {
    // Poll every 3 seconds
    pollingRef.current = setInterval(() => {
      checkPaymentStatus(qrId, transactionId);
    }, 3000);
  };

  const initiatePayment = useCallback(async () => {
    if (!user || isLoading) return;

    setIsLoading(true);
    setError(null);
    setTimeRemaining(900);

    try {
      // Step 1: Create transaction
      const transactionId = await createTransaction();
      if (!transactionId) throw new Error('Failed to create transaction');

      // Step 2: Create Razorpay QR Code
      const qrResponse = await createQRCode(transactionId);
      
      setQrData({
        qr_id: qrResponse.qr_id,
        qr_image_url: qrResponse.qr_image_url,
        upi_link: qrResponse.upi_link,
        close_by: qrResponse.close_by,
        transaction_id: transactionId
      });
      
      setPaymentStatus('qr_generated');
      
      // Step 3: Start polling for payment status
      startPolling(qrResponse.qr_id, transactionId);

    } catch (err: any) {
      console.error('Payment initiation error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setPaymentStatus('failed');
    } finally {
      setIsLoading(false);
    }
  }, [user, template, isLoading, onPaymentComplete, toast]);

  const handleGPayClick = () => {
    if (qrData?.upi_link) {
      // Open GPay/UPI app
      window.location.href = qrData.upi_link;
    }
  };

  const handleClose = () => {
    if (paymentStatus !== 'qr_generated') {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      setPaymentStatus('idle');
      setError(null);
      setIsLoading(false);
      setQrData(null);
      onClose();
    }
  };

  const handleRetry = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setPaymentStatus('idle');
    setError(null);
    setQrData(null);
    initiatePayment();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-white">Complete Payment</DialogTitle>
            <DialogDescription className="text-center text-white/90">
              Pay ₹{template.price} to generate videos for {template.name}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          {paymentStatus === 'completed' ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30 animate-pulse">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-green-600">Payment Successful!</h3>
              <p className="text-sm text-muted-foreground text-center">
                Starting video generation...
              </p>
            </div>
          ) : paymentStatus === 'failed' || paymentStatus === 'expired' ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-12 h-12 text-destructive" />
              </div>
              <h3 className="text-2xl font-bold text-destructive">
                {paymentStatus === 'expired' ? 'QR Code Expired' : 'Payment Failed'}
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                {error || (paymentStatus === 'expired' ? 'The QR code has expired. Please try again.' : 'Something went wrong. Please try again.')}
              </p>
              <Button onClick={handleRetry} className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white">
                Try Again
              </Button>
            </div>
          ) : isLoading ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <Loader2 className="w-12 h-12 animate-spin text-pink-500" />
              <p className="text-muted-foreground">Generating payment QR code...</p>
            </div>
          ) : paymentStatus === 'qr_generated' && qrData ? (
            <>
              {/* Timer */}
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Timer className="w-4 h-4" />
                <span className="text-sm">Expires in {formatTime(timeRemaining)}</span>
              </div>

              {/* Amount Display */}
              <div className="text-center">
                <div className="inline-flex items-center gap-1 text-4xl font-bold text-foreground">
                  <IndianRupee className="w-8 h-8" />
                  <span>{template.price}</span>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative p-6 bg-white rounded-2xl shadow-lg border border-border">
                  <QRCodeSVG 
                    value={qrData.upi_link}
                    size={220}
                    level="H"
                    includeMargin={false}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Scan with any UPI app<br />
                  <span className="text-xs">(GPay, PhonePe, Paytm, etc.)</span>
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground">OR</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* GPay Button */}
              <Button 
                onClick={handleGPayClick}
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-[#4285F4] via-[#34A853] to-[#FBBC05] hover:opacity-90 text-white rounded-xl flex items-center justify-center gap-3 shadow-lg"
              >
                <Smartphone className="w-6 h-6" />
                <span>Pay with GPay / UPI App</span>
              </Button>

              {/* Payment status indicator */}
              <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-sm text-amber-700">Waiting for payment...</span>
              </div>

              {/* Security badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>Secured by Razorpay • 256-bit encryption</span>
              </div>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
