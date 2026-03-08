import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * Razorpay Webhook Handler
 * 
 * This is called by Razorpay when a QR payment is captured.
 * It verifies the webhook signature, marks the transaction as completed,
 * and the frontend will pick up the completion on next poll or page load.
 * 
 * Razorpay webhook URL should be set to:
 * https://<project-id>.supabase.co/functions/v1/razorpay-webhook
 * 
 * Events to enable: payment.captured, qr_code.credited
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay secret not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get raw body for signature verification
    const rawBody = await req.text();
    
    // Verify Razorpay webhook signature
    const razorpaySignature = req.headers.get('x-razorpay-signature');
    if (!razorpaySignature) {
      console.error('No Razorpay signature in webhook');
      return new Response(JSON.stringify({ error: 'Missing signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // HMAC SHA256 signature verification
    const encoder = new TextEncoder();
    const keyData = encoder.encode(RAZORPAY_KEY_SECRET);
    const messageData = encoder.encode(rawBody);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const expectedSignature = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (expectedSignature !== razorpaySignature) {
      console.error('Webhook signature mismatch');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Webhook signature verified ✅');

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    console.log('Webhook event:', event);

    // Handle QR code payment events
    if (event === 'qr_code.credited' || event === 'payment.captured') {
      let paymentId: string;
      let qrCodeId: string | null = null;
      let transactionNotes: any = {};

      if (event === 'qr_code.credited') {
        // QR code credited event
        const qrEntity = payload.payload?.qr_code?.entity;
        const paymentEntity = payload.payload?.payment?.entity;
        
        qrCodeId = qrEntity?.id;
        paymentId = paymentEntity?.id;
        transactionNotes = qrEntity?.notes || {};
        
        console.log('QR credited:', qrCodeId, 'Payment:', paymentId);
      } else {
        // payment.captured event
        const paymentEntity = payload.payload?.payment?.entity;
        paymentId = paymentEntity?.id;
        transactionNotes = paymentEntity?.notes || {};
        
        console.log('Payment captured:', paymentId);
      }

      // Find the transaction — either by QR code ID or by notes
      const transactionId = transactionNotes?.transaction_id;
      const userId = transactionNotes?.user_id;

      if (!transactionId) {
        // Try to find by QR code ID (razorpay_order_id stores the QR ID)
        if (qrCodeId) {
          const { data: txn, error: findErr } = await supabase
            .from('ad_transactions')
            .select('id, user_id, status')
            .eq('razorpay_order_id', qrCodeId)
            .maybeSingle();

          if (findErr || !txn) {
            console.error('Transaction not found for QR:', qrCodeId, findErr);
            // Return 200 so Razorpay doesn't retry
            return new Response(JSON.stringify({ status: 'transaction_not_found' }), {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          // Update transaction
          if (txn.status !== 'completed') {
            const { error: updateErr } = await supabase
              .from('ad_transactions')
              .update({
                status: 'completed',
                razorpay_payment_id: paymentId,
                paid_at: new Date().toISOString()
              })
              .eq('id', txn.id);

            if (updateErr) {
              console.error('Error updating transaction:', updateErr);
            } else {
              console.log('Transaction marked completed via webhook (QR lookup):', txn.id);
            }
          } else {
            console.log('Transaction already completed:', txn.id);
          }
        }

        return new Response(JSON.stringify({ status: 'ok' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Direct lookup by transaction_id from notes
      const { data: txn, error: findErr } = await supabase
        .from('ad_transactions')
        .select('id, user_id, status')
        .eq('id', transactionId)
        .maybeSingle();

      if (findErr || !txn) {
        console.error('Transaction not found:', transactionId, findErr);
        return new Response(JSON.stringify({ status: 'transaction_not_found' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (txn.status !== 'completed') {
        const { error: updateErr } = await supabase
          .from('ad_transactions')
          .update({
            status: 'completed',
            razorpay_payment_id: paymentId,
            paid_at: new Date().toISOString()
          })
          .eq('id', transactionId);

        if (updateErr) {
          console.error('Error updating transaction:', updateErr);
        } else {
          console.log('Transaction marked completed via webhook:', transactionId);
        }
      } else {
        console.log('Transaction already completed:', transactionId);
      }

      return new Response(JSON.stringify({ status: 'ok' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Unknown event — acknowledge anyway
    console.log('Unhandled webhook event:', event);
    return new Response(JSON.stringify({ status: 'ignored' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Webhook error:', error);
    // Always return 200 to prevent Razorpay retries on our errors
    return new Response(JSON.stringify({ error: error.message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
