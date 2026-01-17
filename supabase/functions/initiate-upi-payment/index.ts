import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentRequest {
  transaction_id: string;
  amount: number;
  vpa: string;
  description: string;
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

    const { transaction_id, amount, vpa, description }: PaymentRequest = await req.json();

    // Validate VPA format
    if (!vpa || !vpa.includes('@')) {
      throw new Error('Invalid UPI ID format');
    }

    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);

    // Step 1: Create Razorpay Order
    console.log('Creating Razorpay order...');
    const orderData = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: transaction_id,
      notes: {
        user_id: user.id,
        transaction_id: transaction_id
      }
    };

    const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error('Razorpay order error:', errorText);
      throw new Error('Failed to create payment order');
    }

    const order = await orderResponse.json();
    console.log('Created Razorpay order:', order.id);

    // Update transaction with Razorpay order ID
    await supabase
      .from('ad_transactions')
      .update({ razorpay_order_id: order.id })
      .eq('id', transaction_id)
      .eq('user_id', user.id);

    // Step 2: Initiate UPI Collect Payment
    console.log('Initiating UPI collect payment to:', vpa);
    const paymentData = {
      amount: amount * 100,
      currency: 'INR',
      order_id: order.id,
      email: user.email || 'customer@example.com',
      contact: '9999999999', // Required by Razorpay, will use VPA for actual payment
      method: 'upi',
      vpa: vpa,
      description: description,
      notes: {
        user_id: user.id,
        transaction_id: transaction_id
      }
    };

    const paymentResponse = await fetch('https://api.razorpay.com/v1/payments/create/json', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error('Razorpay payment error:', errorText);
      
      // Parse error for user-friendly message
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error?.description) {
          throw new Error(errorJson.error.description);
        }
      } catch (parseError) {
        // Use generic message if parsing fails
      }
      throw new Error('Failed to initiate UPI payment. Please check your UPI ID.');
    }

    const payment = await paymentResponse.json();
    console.log('UPI payment initiated:', payment.razorpay_payment_id);

    // Update transaction with payment ID
    await supabase
      .from('ad_transactions')
      .update({ 
        razorpay_payment_id: payment.razorpay_payment_id,
        status: 'awaiting_payment'
      })
      .eq('id', transaction_id)
      .eq('user_id', user.id);

    return new Response(JSON.stringify({
      success: true,
      order_id: order.id,
      payment_id: payment.razorpay_payment_id,
      message: 'UPI payment request sent. Please approve in your UPI app.'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
