import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface QRRequest {
  amount: number;
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

    const { amount, transaction_id }: QRRequest = await req.json();

    // Create Razorpay QR Code
    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    
    // Close time: 15 minutes from now
    const closeBy = Math.floor(Date.now() / 1000) + 900;
    
    const qrData = {
      type: "upi_qr",
      name: `Opentry Video - ${transaction_id.substring(0, 8)}`,
      usage: "single_use",
      fixed_amount: true,
      payment_amount: amount * 100, // Razorpay expects paise
      description: "Opentry Video Generation",
      close_by: closeBy,
      notes: {
        user_id: user.id,
        transaction_id: transaction_id
      }
    };

    console.log('Creating QR code with data:', JSON.stringify(qrData));

    const response = await fetch('https://api.razorpay.com/v1/payments/qr_codes', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(qrData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Razorpay QR error:', errorText);
      throw new Error('Failed to create QR code');
    }

    const qrCode = await response.json();
    console.log('Created QR code:', qrCode.id);

    // Update transaction with QR code ID
    const { error: updateError } = await supabase
      .from('ad_transactions')
      .update({ 
        razorpay_order_id: qrCode.id,
      })
      .eq('id', transaction_id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating transaction:', updateError);
    }

    // Log full response for debugging
    console.log('Full QR response:', JSON.stringify(qrCode));

    return new Response(JSON.stringify({
      qr_id: qrCode.id,
      qr_image_url: qrCode.image_url,
      amount: amount,
      // Use short_url for clean QR generation - this is the real payment link
      payment_link: qrCode.short_url,
      // Use the deep link for direct UPI app opening
      upi_link: qrCode.short_url,
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
