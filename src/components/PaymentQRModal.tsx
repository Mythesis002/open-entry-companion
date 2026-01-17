import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, IndianRupee, QrCode, Copy, Check } from 'lucide-react';
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

// UPI Payment details - replace with your actual UPI ID
const UPI_ID = "your-upi@paytm"; // TODO: Replace with actual UPI ID
const MERCHANT_NAME = "Reel Studio";

export function PaymentQRModal({ isOpen, onClose, onPaymentComplete, template }: PaymentQRModalProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Generate UPI QR URL
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${template.price}&cu=INR&tn=${encodeURIComponent(`${template.name} Reel`)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;

  // Create transaction when modal opens
  useEffect(() => {
    if (isOpen && user && !transactionId) {
      createTransaction();
    }
  }, [isOpen, user]);

  const createTransaction = async () => {
    if (!user) return;
    
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
      setTransactionId(transaction.id);
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaymentDone = async () => {
    if (!user || !transactionId) {
      toast({ variant: 'destructive', title: 'Please wait, setting up payment...' });
      return;
    }

    setIsVerifying(true);

    try {
      // Update transaction as completed (in real app, you'd verify with payment gateway)
      const { error } = await supabase
        .from('ad_transactions')
        .update({ 
          status: 'completed',
          paid_at: new Date().toISOString()
        })
        .eq('id', transactionId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({ 
        title: '✅ Payment Confirmed!', 
        description: 'Starting video generation...' 
      });
      
      onPaymentComplete();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Verification failed';
      toast({ variant: 'destructive', title: 'Error', description: message });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setTransactionId(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">Scan & Pay</DialogTitle>
          <DialogDescription className="text-center">
            Pay ₹{template.price} to generate videos for {template.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Price Display */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-50 to-orange-50 border border-pink-200 text-center">
            <div className="flex items-center justify-center gap-1 text-3xl font-bold text-foreground">
              <IndianRupee className="w-7 h-7" />
              <span>{template.price}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">for video generation</p>
          </div>

          {/* QR Code */}
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-white rounded-2xl shadow-lg border-2 border-dashed border-pink-200">
              <img 
                src={qrCodeUrl} 
                alt="UPI Payment QR" 
                className="w-[200px] h-[200px]"
              />
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              Scan with any UPI app (GPay, PhonePe, Paytm)
            </p>
          </div>

          {/* UPI ID Copy */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
            <QrCode className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 text-sm font-mono">{UPI_ID}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={copyUpiId}
              className="h-8 px-2"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>1. Open any UPI app and scan the QR code</p>
            <p>2. Pay ₹{template.price} to complete</p>
            <p>3. Click "I've Paid" button below</p>
          </div>

          {/* Payment Done Button */}
          <Button
            onClick={handlePaymentDone}
            disabled={isVerifying}
            size="lg"
            className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
          >
            {isVerifying ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Verifying...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                I've Paid ₹{template.price}
              </span>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Your images are saved. Videos will generate after payment.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
