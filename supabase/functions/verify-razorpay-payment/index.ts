import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  transaction_id: string;
}

serve(async (req) => {
  // Handle CORS preflight
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

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      transaction_id 
    }: PaymentVerification = await req.json();

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(RAZORPAY_KEY_SECRET);
    const messageData = encoder.encode(body);
    
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

    if (expectedSignature !== razorpay_signature) {
      console.error('Signature mismatch');
      throw new Error('Payment verification failed');
    }

    console.log('Payment verified successfully:', razorpay_payment_id);

    // Update transaction status
    const { error: updateError } = await supabase
      .from('ad_transactions')
      .update({ 
        status: 'completed',
        razorpay_payment_id: razorpay_payment_id,
        paid_at: new Date().toISOString()
      })
      .eq('id', transaction_id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating transaction:', updateError);
      throw new Error('Failed to update transaction');
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Payment verified successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
