import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, CheckCircle2, IndianRupee, AlertCircle } from 'lucide-react';
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

// Razorpay Key ID (public/publishable key)
const RAZORPAY_KEY_ID = "rzp_live_R9sCSgyncgleJR";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function PaymentQRModal({ isOpen, onClose, onPaymentComplete, template }: PaymentQRModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load Razorpay SDK
  useEffect(() => {
    if (!document.getElementById('razorpay-script')) {
      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

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

  const createRazorpayOrder = async (transactionId: string) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    const response = await supabase.functions.invoke('create-razorpay-order', {
      body: { amount: template.price, transaction_id: transactionId },
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    if (response.error) throw new Error(response.error.message);
    return response.data;
  };

  const verifyPayment = async (
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
    transaction_id: string
  ) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    const response = await supabase.functions.invoke('verify-razorpay-payment', {
      body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, transaction_id },
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    if (response.error) throw new Error(response.error.message);
    return response.data;
  };

  const initiatePayment = useCallback(async () => {
    if (!user || isLoading) return;

    setIsLoading(true);
    setError(null);
    setPaymentStatus('processing');

    try {
      // Step 1: Create transaction
      const transactionId = await createTransaction();
      if (!transactionId) throw new Error('Failed to create transaction');

      // Step 2: Create Razorpay order
      const orderData = await createRazorpayOrder(transactionId);

      // Step 3: Open Razorpay checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Opentry',
        description: `Generate videos for ${template.name}`,
        order_id: orderData.order_id,
        prefill: {
          email: user.email || '',
        },
        theme: {
          color: '#ec4899',
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
            setPaymentStatus('idle');
          }
        },
        handler: async (response: any) => {
          try {
            // Verify payment
            await verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              transactionId
            );

            setPaymentStatus('completed');
            toast({ 
              title: '✅ Payment Successful!', 
              description: 'Starting video generation...' 
            });

            setTimeout(() => {
              onPaymentComplete();
            }, 1500);
          } catch (verifyError: any) {
            console.error('Payment verification failed:', verifyError);
            setError('Payment verification failed. Please contact support.');
            setPaymentStatus('failed');
          }
        },
      };

      if (window.Razorpay) {
        const razorpay = new window.Razorpay(options);
        razorpay.on('payment.failed', (response: any) => {
          console.error('Payment failed:', response.error);
          setError(response.error.description || 'Payment failed. Please try again.');
          setPaymentStatus('failed');
          setIsLoading(false);
        });
        razorpay.open();
      } else {
        throw new Error('Razorpay SDK not loaded');
      }
    } catch (err: any) {
      console.error('Payment initiation error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
      setPaymentStatus('failed');
      setIsLoading(false);
    }
  }, [user, template, isLoading, onPaymentComplete, toast]);

  const handleClose = () => {
    if (paymentStatus !== 'processing') {
      setPaymentStatus('idle');
      setError(null);
      setIsLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">Complete Payment</DialogTitle>
          <DialogDescription className="text-center">
            Pay ₹{template.price} to generate videos for {template.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {paymentStatus === 'completed' ? (
            // Payment success state
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center animate-pulse">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-green-600">Payment Successful!</h3>
              <p className="text-sm text-muted-foreground text-center">
                Starting video generation...
              </p>
            </div>
          ) : paymentStatus === 'failed' ? (
            // Payment failed state
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-destructive" />
              </div>
              <h3 className="text-xl font-bold text-destructive">Payment Failed</h3>
              <p className="text-sm text-muted-foreground text-center">
                {error || 'Something went wrong. Please try again.'}
              </p>
              <Button onClick={() => { setPaymentStatus('idle'); setError(null); }} variant="outline">
                Try Again
              </Button>
            </div>
          ) : (
            <>
              {/* Price Display */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-pink-50 to-orange-50 border border-pink-200 text-center">
                <div className="flex items-center justify-center gap-1 text-4xl font-bold text-foreground">
                  <IndianRupee className="w-8 h-8" />
                  <span>{template.price}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">One-time payment for video generation</p>
              </div>

              {/* Payment Features */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Secure Payment</p>
                    <p className="text-xs text-muted-foreground">Powered by Razorpay</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <span className="text-lg">📱</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">UPI, Cards & More</p>
                    <p className="text-xs text-muted-foreground">GPay, PhonePe, Paytm, Cards, NetBanking</p>
                  </div>
                </div>
              </div>

              {/* Pay Now Button */}
              <Button 
                onClick={initiatePayment}
                disabled={isLoading}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white rounded-xl"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay ₹{template.price} Now
                  </>
                )}
              </Button>

              {/* Payment methods hint */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" className="h-6 opacity-50" />
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>UPI</span>
                  <span>•</span>
                  <span>Cards</span>
                  <span>•</span>
                  <span>NetBanking</span>
                  <span>•</span>
                  <span>Wallets</span>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
