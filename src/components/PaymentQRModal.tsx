import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
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
const POLL_INTERVAL = 3000; // Poll every 3 seconds

export function PaymentQRModal({ isOpen, onClose, onPaymentComplete, template }: PaymentQRModalProps) {
  const [copied, setCopied] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed'>('pending');
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Generate UPI QR URL with transaction reference
  const transactionRef = transactionId ? transactionId.slice(0, 8).toUpperCase() : '';
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${template.price}&cu=INR&tn=${encodeURIComponent(`REEL-${transactionRef}`)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUrl)}`;

  // Create transaction when modal opens
  useEffect(() => {
    if (isOpen && user && !transactionId) {
      createTransaction();
    }
    
    // Cleanup on close
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [isOpen, user]);

  // Start polling when transaction is created
  useEffect(() => {
    if (transactionId && isOpen && paymentStatus === 'pending') {
      startPolling();
    }
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [transactionId, isOpen, paymentStatus]);

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

  const startPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    setIsPolling(true);
    
    // Poll for payment status
    pollIntervalRef.current = setInterval(async () => {
      if (!transactionId || !user) return;
      
      try {
        const { data, error } = await supabase
          .from('ad_transactions')
          .select('status')
          .eq('id', transactionId)
          .eq('user_id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data.status === 'completed') {
          // Payment verified!
          setPaymentStatus('completed');
          setIsPolling(false);
          
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          
          toast({ 
            title: '✅ Payment Verified!', 
            description: 'Starting video generation...' 
          });
          
          // Small delay for UX
          setTimeout(() => {
            onPaymentComplete();
          }, 1000);
        }
      } catch (error) {
        console.error('Error polling payment status:', error);
      }
    }, POLL_INTERVAL);
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    setTransactionId(null);
    setPaymentStatus('pending');
    setIsPolling(false);
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
          {paymentStatus === 'completed' ? (
            // Payment success state
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center animate-pulse">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-green-600">Payment Verified!</h3>
              <p className="text-sm text-muted-foreground text-center">
                Starting video generation...
              </p>
            </div>
          ) : (
            <>
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
                <div className="p-4 bg-white rounded-2xl shadow-lg border-2 border-dashed border-pink-200 relative">
                  <img 
                    src={qrCodeUrl} 
                    alt="UPI Payment QR" 
                    className="w-[200px] h-[200px]"
                  />
                  {isPolling && (
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 bg-amber-100 rounded-full border border-amber-300">
                      <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                      <span className="text-xs font-medium text-amber-700">Waiting for payment...</span>
                    </div>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground text-center">
                  Scan with any UPI app (GPay, PhonePe, Paytm)
                </p>
              </div>

              {/* Transaction Reference */}
              {transactionRef && (
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Reference ID</p>
                  <p className="font-mono font-bold text-sm">REEL-{transactionRef}</p>
                </div>
              )}

              {/* UPI ID Copy */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
                <QrCode className="w-5 h-5 text-muted-foreground" />
                <span className="flex-1 text-sm font-mono">{UPI_ID}</span>
                <button
                  onClick={copyUpiId}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Auto-verification notice */}
              <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-center">
                <div className="flex items-center justify-center gap-2 text-green-700">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Payment will be verified automatically</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Complete payment and we'll detect it instantly
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
