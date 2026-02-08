import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QRRequest {
  amount: number;
  transaction_id: string;
  template_name: string;
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

    const { amount, transaction_id, template_name }: QRRequest = await req.json();

    // Create Razorpay QR Code
    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    
    // Calculate close_by (15 minutes from now)
    const closeBy = Math.floor(Date.now() / 1000) + (15 * 60);
    
    const qrData = {
      type: "upi_qr",
      name: `Opentry - ${template_name}`,
      usage: "single_use",
      fixed_amount: true,
      payment_amount: amount * 100, // Amount in paise
      description: `Video generation for ${template_name}`,
      close_by: closeBy,
      notes: {
        user_id: user.id,
        transaction_id: transaction_id
      }
    };

    console.log('Creating Razorpay QR with data:', JSON.stringify(qrData));
    
    const response = await fetch('https://api.razorpay.com/v1/payments/qr_codes', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(qrData)
    });

    const responseText = await response.text();
    console.log('Razorpay QR response:', responseText);

    if (!response.ok) {
      console.error('Razorpay QR error:', responseText);
      throw new Error(`Failed to create Razorpay QR: ${responseText}`);
    }

    const qrCode = JSON.parse(responseText);
    console.log('Created Razorpay QR:', qrCode.id);

    // Update transaction with QR code ID
    const { error: updateError } = await supabase
      .from('ad_transactions')
      .update({ razorpay_order_id: qrCode.id })
      .eq('id', transaction_id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating transaction:', updateError);
    }

    return new Response(JSON.stringify({
      qr_id: qrCode.id,
      image_url: qrCode.image_url,
      short_url: qrCode.short_url,
      amount: amount,
      close_by: closeBy
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
