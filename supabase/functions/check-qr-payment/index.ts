import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckRequest {
  qr_id: string;
  transaction_id: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay keys not configured');
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

    const { qr_id, transaction_id }: CheckRequest = await req.json();

    // Fetch QR code payments from Razorpay
    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    
    const response = await fetch(`https://api.razorpay.com/v1/payments/qr_codes/${qr_id}/payments`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Razorpay check error:', errorText);
      throw new Error('Failed to check payment status');
    }

    const paymentsData = await response.json();
    console.log('QR Payments:', JSON.stringify(paymentsData));

    // Check if any payment is captured
    const payments = paymentsData.items || [];
    const capturedPayment = payments.find((p: any) => p.status === 'captured');

    if (capturedPayment) {
      console.log('Payment captured:', capturedPayment.id);

      // Update transaction status
      const { error: updateError } = await supabase
        .from('ad_transactions')
        .update({ 
          status: 'completed',
          razorpay_payment_id: capturedPayment.id,
          paid_at: new Date().toISOString()
        })
        .eq('id', transaction_id)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating transaction:', updateError);
      }

      return new Response(JSON.stringify({ 
        paid: true,
        payment_id: capturedPayment.id,
        amount: capturedPayment.amount / 100
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      paid: false,
      payments_count: payments.length
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
