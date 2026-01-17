import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, XCircle, Camera, QrCode, IndianRupee } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ReelTemplate } from '@/types';

interface UPIPaymentScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
  template: ReelTemplate;
}

type PaymentStatus = 'scanning' | 'processing' | 'success' | 'failed';

export function UPIPaymentScanner({ isOpen, onClose, onPaymentComplete, template }: UPIPaymentScannerProps) {
  const [status, setStatus] = useState<PaymentStatus>('scanning');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Create transaction when modal opens
  useEffect(() => {
    if (isOpen && user && !transactionId) {
      createTransaction();
    }
    return () => {
      stopCamera();
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [isOpen, user]);

  // Start camera when in scanning mode
  useEffect(() => {
    if (isOpen && status === 'scanning') {
      startCamera();
    }
    return () => {
      if (status !== 'scanning') {
        stopCamera();
      }
    };
  }, [isOpen, status]);

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
      toast({ variant: 'destructive', title: 'Error setting up payment' });
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        // Start scanning for QR codes
        requestAnimationFrame(scanQRCode);
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Camera Access Required',
        description: 'Please allow camera access to scan QR codes'
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const scanQRCode = async () => {
    if (!videoRef.current || !canvasRef.current || status !== 'scanning') return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(scanQRCode);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      // Use BarcodeDetector API if available
      if ('BarcodeDetector' in window) {
        // @ts-ignore - BarcodeDetector is not in TS types yet
        const detector = new BarcodeDetector({ formats: ['qr_code'] });
        const barcodes = await detector.detect(canvas);
        
        if (barcodes.length > 0) {
          const qrData = barcodes[0].rawValue;
          await handleQRScanned(qrData);
          return;
        }
      }
    } catch (error) {
      console.log('QR detection error:', error);
    }

    // Continue scanning
    if (status === 'scanning') {
      requestAnimationFrame(scanQRCode);
    }
  };

  const handleQRScanned = async (qrData: string) => {
    // Parse UPI QR data
    const upiData = parseUPIQR(qrData);
    
    if (!upiData || !upiData.vpa) {
      toast({ 
        variant: 'destructive', 
        title: 'Invalid QR Code',
        description: 'Please scan a valid UPI QR code'
      });
      return;
    }

    stopCamera();
    setStatus('processing');

    try {
      await initiateUPIPayment(upiData.vpa);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Payment initiation failed';
      setErrorMessage(message);
      setStatus('failed');
    }
  };

  const parseUPIQR = (qrData: string): { vpa: string; amount?: number } | null => {
    try {
      // UPI QR format: upi://pay?pa=upi@id&pn=Name&am=100&cu=INR
      const url = new URL(qrData);
      if (url.protocol !== 'upi:') return null;

      const params = new URLSearchParams(url.search);
      const vpa = params.get('pa');
      const amount = params.get('am');

      if (!vpa) return null;

      return {
        vpa,
        amount: amount ? parseFloat(amount) : undefined
      };
    } catch {
      // Try alternate parsing for malformed URLs
      const match = qrData.match(/pa=([^&]+)/);
      if (match) {
        return { vpa: match[1] };
      }
      return null;
    }
  };

  const initiateUPIPayment = async (vpa: string) => {
    if (!user || !transactionId) {
      throw new Error('Please wait, setting up payment...');
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await supabase.functions.invoke('initiate-upi-payment', {
      body: {
        transaction_id: transactionId,
        amount: template.price,
        vpa: vpa,
        description: `${template.name} Reel`
      }
    });

    if (response.error) {
      throw new Error(response.error.message || 'Failed to initiate payment');
    }

    // Start polling for payment status
    startPaymentPolling();
  };

  const startPaymentPolling = () => {
    // Poll every 3 seconds for payment status
    const interval = setInterval(async () => {
      if (!transactionId) return;

      try {
        const { data, error } = await supabase
          .from('ad_transactions')
          .select('status')
          .eq('id', transactionId)
          .single();

        if (error) throw error;

        if (data.status === 'completed') {
          clearInterval(interval);
          setStatus('success');
          setTimeout(() => {
            onPaymentComplete();
          }, 1500);
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setErrorMessage('Payment was declined or cancelled');
          setStatus('failed');
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000);

    setPollingInterval(interval);

    // Timeout after 5 minutes
    setTimeout(() => {
      if (status === 'processing') {
        clearInterval(interval);
        setErrorMessage('Payment timeout. Please try again.');
        setStatus('failed');
      }
    }, 5 * 60 * 1000);
  };

  const handleRetry = () => {
    setStatus('scanning');
    setErrorMessage('');
    startCamera();
  };

  const handleClose = () => {
    stopCamera();
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    setTransactionId(null);
    setStatus('scanning');
    setErrorMessage('');
    onClose();
  };

  // For demo/testing: manual UPI ID input
  const [manualVPA, setManualVPA] = useState('');
  const handleManualSubmit = async () => {
    if (!manualVPA.includes('@')) {
      toast({ variant: 'destructive', title: 'Invalid UPI ID' });
      return;
    }
    setStatus('processing');
    try {
      await initiateUPIPayment(manualVPA);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Payment failed';
      setErrorMessage(message);
      setStatus('failed');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {status === 'scanning' && 'Scan Your UPI QR'}
            {status === 'processing' && 'Processing Payment'}
            {status === 'success' && 'Payment Successful'}
            {status === 'failed' && 'Payment Failed'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {status === 'scanning' && `Pay ₹${template.price} for ${template.name}`}
            {status === 'processing' && 'Please approve the payment request in your UPI app'}
            {status === 'success' && 'Your payment has been confirmed!'}
            {status === 'failed' && errorMessage}
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

          {/* Scanning State */}
          {status === 'scanning' && (
            <div className="space-y-4">
              {/* Camera View */}
              <div className="relative aspect-square bg-black rounded-2xl overflow-hidden border-2 border-dashed border-pink-200">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* QR Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-2 border-white/80 rounded-lg">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-pink-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-pink-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-pink-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-pink-400 rounded-br-lg" />
                  </div>
                </div>

                {/* Camera Icon if no stream */}
                {!streamRef.current && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80">
                    <Camera className="w-12 h-12 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Starting camera...</p>
                  </div>
                )}
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Point camera at any UPI QR code to pay
              </p>

              {/* Manual UPI ID Input (fallback) */}
              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground text-center mb-2">Or enter UPI ID manually</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualVPA}
                    onChange={(e) => setManualVPA(e.target.value)}
                    placeholder="yourname@upi"
                    className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                  <Button
                    onClick={handleManualSubmit}
                    disabled={!manualVPA}
                    size="sm"
                    className="bg-pink-500 hover:bg-pink-600"
                  >
                    Pay
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Processing State */}
          {status === 'processing' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-pink-500 animate-spin" />
                <QrCode className="w-8 h-8 text-pink-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center">
                <p className="font-semibold">Waiting for payment...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Check your UPI app for the payment request
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Listening for confirmation
              </div>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-green-600">Payment Confirmed!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Starting video generation...
                </p>
              </div>
            </div>
          )}

          {/* Failed State */}
          {status === 'failed' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-red-600">Payment Failed</p>
                <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
              </div>
              <Button
                onClick={handleRetry}
                className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
