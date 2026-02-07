// Supabase Edge Function: Stripe Webhook Handler
// Deploy via Supabase Dashboard → Edge Functions → Create New
//
// Required secrets (set in Supabase Dashboard → Edge Functions → Secrets):
//   STRIPE_WEBHOOK_SECRET  - from Stripe Dashboard → Developers → Webhooks
//   STRIPE_SECRET_KEY      - from Stripe Dashboard → Developers → API keys (sk_live_...)
//
// The function automatically has access to SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (!stripeWebhookSecret || !stripeSecretKey) {
      console.error('Missing Stripe configuration')
      return new Response('Server configuration error', { status: 500 })
    }

    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      return new Response('No signature', { status: 400 })
    }

    // Verify webhook signature using Stripe's method
    const event = await verifyStripeWebhook(body, signature, stripeWebhookSecret)

    if (!event) {
      return new Response('Invalid signature', { status: 400 })
    }

    console.log('Received Stripe event:', event.type)

    // Create Supabase admin client (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const customerEmail = session.customer_details?.email || session.customer_email
        const customerId = session.customer
        const clientReferenceId = session.client_reference_id // This is the Supabase user ID

        console.log('Payment completed for:', customerEmail, 'user:', clientReferenceId)

        // Find user by client_reference_id (user ID) or email
        let query = supabase.from('profiles')

        if (clientReferenceId) {
          // Best: match by user ID
          const { error } = await query
            .update({
              is_premium: true,
              stripe_customer_id: customerId,
              subscription_status: 'active',
              premium_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            })
            .eq('id', clientReferenceId)

          if (error) console.error('Error updating by ID:', error)
          else console.log('Updated premium status for user:', clientReferenceId)
        } else if (customerEmail) {
          // Fallback: match by email
          const { error } = await supabase
            .from('profiles')
            .update({
              is_premium: true,
              stripe_customer_id: customerId,
              subscription_status: 'active',
              premium_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            })
            .eq('email', customerEmail)

          if (error) console.error('Error updating by email:', error)
          else console.log('Updated premium status for email:', customerEmail)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const customerId = subscription.customer
        const status = subscription.status // 'active', 'past_due', 'canceled', etc.

        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: status,
            is_premium: status === 'active' || status === 'trialing',
          })
          .eq('stripe_customer_id', customerId)

        if (error) console.error('Error updating subscription:', error)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customerId = subscription.customer

        const { error } = await supabase
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            is_premium: false,
          })
          .eq('stripe_customer_id', customerId)

        if (error) console.error('Error canceling subscription:', error)
        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response(`Webhook error: ${err.message}`, { status: 400 })
  }
})

// Verify Stripe webhook signature (without Stripe SDK)
async function verifyStripeWebhook(
  payload: string,
  signature: string,
  secret: string
): Promise<any | null> {
  try {
    const parts = signature.split(',').reduce((acc: Record<string, string>, part: string) => {
      const [key, value] = part.split('=')
      acc[key.trim()] = value
      return acc
    }, {})

    const timestamp = parts['t']
    const expectedSig = parts['v1']

    if (!timestamp || !expectedSig) return null

    // Check timestamp is within 5 minutes
    const timestampAge = Math.floor(Date.now() / 1000) - parseInt(timestamp)
    if (timestampAge > 300) return null

    // Compute expected signature
    const signedPayload = `${timestamp}.${payload}`
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload))
    const computedSig = Array.from(new Uint8Array(sig))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    if (computedSig !== expectedSig) return null

    return JSON.parse(payload)
  } catch {
    return null
  }
}
