// Supabase Edge Function: Manage Subscription (cancel / resume)
// Deploy via Supabase Dashboard → Edge Functions
//
// This function REQUIRES JWT verification (keep it enabled!)
// It uses the authenticated user's ID to look up their Stripe customer ID.
//
// Required secrets:
//   STRIPE_SECRET_KEY - from Stripe Dashboard → Developers → API keys

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    if (!stripeSecretKey) {
      return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get the authenticated user from the JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify the user's JWT using the service role key
    const token = authHeader.replace('Bearer ', '')
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get the user's Stripe customer ID from profiles
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single()

    if (!profile?.stripe_customer_id) {
      return new Response(JSON.stringify({ error: 'No subscription found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { action } = await req.json()

    // List active subscriptions for this customer
    const subsResponse = await fetch(
      `https://api.stripe.com/v1/customers/${profile.stripe_customer_id}/subscriptions?limit=1`,
      { headers: { Authorization: `Bearer ${stripeSecretKey}` } }
    )
    const subsData = await subsResponse.json()
    const subscription = subsData.data?.[0]

    if (!subscription) {
      return new Response(JSON.stringify({ error: 'No active subscription' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'cancel') {
      // Cancel at end of billing period (not immediately)
      const cancelResponse = await fetch(
        `https://api.stripe.com/v1/subscriptions/${subscription.id}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${stripeSecretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'cancel_at_period_end=true',
        }
      )
      const cancelData = await cancelResponse.json()

      if (cancelData.error) {
        console.error('Stripe cancel error:', cancelData.error)
        return new Response(JSON.stringify({ error: cancelData.error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Log full response for debugging
      console.log('Stripe cancel response:', JSON.stringify(cancelData))

      // Update profile with cancellation info
      const periodEndTimestamp = cancelData.current_period_end
      const periodEnd = periodEndTimestamp
        ? new Date(periodEndTimestamp * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // fallback: 30 days
      await supabaseAdmin
        .from('profiles')
        .update({
          subscription_status: 'canceling',
          premium_until: periodEnd,
        })
        .eq('id', user.id)

      console.log('Subscription canceled for user:', user.id, 'until:', periodEnd)

      return new Response(JSON.stringify({
        success: true,
        premium_until: periodEnd,
        status: 'canceling',
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })

    } else if (action === 'resume') {
      // Resume a subscription that was set to cancel at period end
      const resumeResponse = await fetch(
        `https://api.stripe.com/v1/subscriptions/${subscription.id}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${stripeSecretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'cancel_at_period_end=false',
        }
      )
      const resumeData = await resumeResponse.json()

      if (resumeData.error) {
        console.error('Stripe resume error:', resumeData.error)
        return new Response(JSON.stringify({ error: resumeData.error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Update profile back to active
      await supabaseAdmin
        .from('profiles')
        .update({
          subscription_status: 'active',
          is_premium: true,
        })
        .eq('id', user.id)

      console.log('Subscription resumed for user:', user.id)

      return new Response(JSON.stringify({
        success: true,
        status: 'active',
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })

    } else {
      return new Response(JSON.stringify({ error: 'Invalid action. Use "cancel" or "resume".' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

  } catch (err) {
    console.error('manage-subscription error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
