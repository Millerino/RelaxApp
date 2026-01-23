import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    // Get environment variables
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecretKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables");
      return new Response("Server configuration error", { status: 500 });
    }

    // Import Stripe dynamically
    const Stripe = (await import("https://esm.sh/stripe@13.6.0?target=deno")).default;
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Processing event:", event.type);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const customerEmail = session.customer_email || session.customer_details?.email;

        console.log("Checkout completed for:", customerEmail);

        if (customerEmail) {
          // Find user by email
          const { data: userData, error: userError } = await supabase.auth.admin.listUsers();

          if (userError) {
            console.error("Error fetching users:", userError);
            break;
          }

          const user = userData.users.find((u) => u.email === customerEmail);

          if (user) {
            console.log("Found user:", user.id);

            // Upsert subscription record
            const { error: upsertError } = await supabase
              .from("subscriptions")
              .upsert({
                user_id: user.id,
                stripe_customer_id: session.customer,
                stripe_subscription_id: session.subscription,
                status: "active",
                created_at: new Date().toISOString(),
              }, { onConflict: "user_id" });

            if (upsertError) {
              console.error("Error upserting subscription:", upsertError);
            } else {
              console.log("Subscription activated for user:", user.id);
            }
          } else {
            console.log("No user found with email:", customerEmail);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const status = subscription.status === "active" ? "active" : "inactive";

        console.log("Subscription updated:", subscription.id, "Status:", status);

        const { error } = await supabase
          .from("subscriptions")
          .update({ status })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error("Error updating subscription:", error);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;

        console.log("Subscription canceled:", subscription.id);

        const { error } = await supabase
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", subscription.id);

        if (error) {
          console.error("Error canceling subscription:", error);
        }
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
