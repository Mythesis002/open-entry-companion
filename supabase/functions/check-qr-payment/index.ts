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

    // Fetch QR code status from Razorpay
    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    
    const response = await fetch(`https://api.razorpay.com/v1/payments/qr_codes/${qr_id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Razorpay fetch error:', errorText);
      throw new Error('Failed to fetch QR code status');
    }

    const qrCode = await response.json();
    console.log('QR code status:', qrCode.status, 'payments_count:', qrCode.payments_count_received);

    // Check if payment received
    const isPaid = qrCode.status === 'closed' && qrCode.payments_count_received > 0;
    
    if (isPaid) {
      // Get the payment details
      const paymentsResponse = await fetch(`https://api.razorpay.com/v1/payments/qr_codes/${qr_id}/payments`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      let paymentId = null;
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        if (paymentsData.items && paymentsData.items.length > 0) {
          paymentId = paymentsData.items[0].id;
        }
      }

      // Update transaction status
      const { error: updateError } = await supabase
        .from('ad_transactions')
        .update({ 
          status: 'completed',
          razorpay_payment_id: paymentId,
          paid_at: new Date().toISOString()
        })
        .eq('id', transaction_id)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating transaction:', updateError);
      }
    }

    return new Response(JSON.stringify({
      paid: isPaid,
      status: qrCode.status,
      payments_received: qrCode.payments_count_received || 0,
      amount_received: qrCode.payments_amount_received || 0
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
