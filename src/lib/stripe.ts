import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePublishableKey) {
    console.warn('Stripe publishable key not configured. Payment features will be disabled.');
    return Promise.resolve(null);
  }

  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }

  return stripePromise;
};

export const isStripeConfigured = !!stripePublishableKey;

// Stripe Payment Link - Create this in your Stripe Dashboard
// Dashboard -> Payment Links -> Create payment link -> Select your $4.99/month product
// Then paste the URL here
export const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/your_payment_link';

// For Stripe Checkout with backend, you would create a checkout session
// This requires a backend endpoint - we'll use Supabase Edge Functions for this
export async function createCheckoutSession(priceId: string, userId: string): Promise<string | null> {
  // This would call your Supabase Edge Function
  // For now, we'll use the payment link approach which doesn't need a backend
  console.log('Creating checkout session for price:', priceId, 'user:', userId);
  return null;
}
