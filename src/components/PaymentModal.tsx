import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode, Loader2, CheckCircle2, IndianRupee, Smartphone } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ReelTemplate } from '@/types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
  template: ReelTemplate;
}

export function PaymentModal({ isOpen, onClose, onPaymentComplete, template }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handlePayment = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Please login first' });
      return;
    }

    setIsProcessing(true);

    try {
      // Create transaction
      const { data: transaction, error: txError } = await supabase
        .from('ad_transactions')
        .insert({
          user_id: user.id,
          amount: template.price,
          status: 'pending',
          ad_inputs: { templateId: template.id, templateName: template.name }
        })
        .select()
        .single();

      if (txError) throw txError;

      // Create Razorpay order
      const response = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: template.price,
          transaction_id: transaction.id
        }
      });

      if (response.error) throw response.error;

      const orderData = response.data;

      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Reel Studio',
        description: `${template.name} - ₹${template.price}`,
        order_id: orderData.order_id,
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verifyResponse = await supabase.functions.invoke('verify-razorpay-payment', {
            body: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              transaction_id: transaction.id
            }
          });

          if (verifyResponse.error) {
            toast({ variant: 'destructive', title: 'Payment verification failed' });
            setIsProcessing(false);
            return;
          }

          toast({ title: '✅ Payment Successful!', description: 'Starting reel generation...' });
          onPaymentComplete();
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          }
        },
        prefill: { email: user.email },
        theme: { color: '#ec4899' }
      };

      // @ts-ignore
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Payment error';
      toast({ variant: 'destructive', title: 'Error', description: message });
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Complete Payment</DialogTitle>
          <DialogDescription>Pay to generate your {template.name} reel</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Template Info */}
          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
            <img 
              src={template.thumbnail} 
              alt={template.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold">{template.name}</h3>
              <p className="text-sm text-muted-foreground">{template.shots} AI-generated shots</p>
            </div>
          </div>

          {/* Price Display */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-pink-50 to-orange-50 border border-pink-200 text-center">
            <div className="flex items-center justify-center gap-1 text-4xl font-bold text-foreground">
              <IndianRupee className="w-8 h-8" />
              <span>{template.price}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">One-time payment</p>
          </div>

          {/* What you get */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">What you'll get:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ {template.shots} AI-generated images with your face</li>
              <li>✓ {template.shots} animated video clips</li>
              <li>✓ Final composed reel with effects</li>
              <li>✓ Downloadable HD video</li>
            </ul>
          </div>

          {/* Pay Button */}
          <Button
            onClick={handlePayment}
            disabled={isProcessing}
            size="lg"
            className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white border-0"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Smartphone className="w-5 h-5" />
                Pay ₹{template.price} with UPI / Card
              </span>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Secure payment powered by Razorpay
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
