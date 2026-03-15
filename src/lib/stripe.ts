import { loadStripe } from '@stripe/stripe-js';
import type { Stripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePublishableKey) {
    return Promise.resolve(null);
  }
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

export const isStripeConfigured = !!stripePublishableKey;

// Base Stripe Payment Link for Pulsero Monthly ($4.99/month)
export const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/fZu00icuRaAV5xB8EH9R606';

/**
 * Build a Stripe payment link with user info so we can match the payment
 * to the user after they complete checkout.
 *
 * Stripe Payment Links support these query params:
 *   - prefilled_email: pre-fills the email field
 *   - client_reference_id: passed through to the checkout.session.completed webhook
 */
export function buildPaymentLink(options?: { email?: string; userId?: string }): string {
  const params = new URLSearchParams();
  if (options?.email) params.set('prefilled_email', options.email);
  if (options?.userId) params.set('client_reference_id', options.userId);

  const qs = params.toString();
  return qs ? `${STRIPE_PAYMENT_LINK}?${qs}` : STRIPE_PAYMENT_LINK;
}

// Stripe Customer Portal - configure in Stripe Dashboard → Settings → Customer portal
// Replace with your actual portal link after enabling it
export const STRIPE_CUSTOMER_PORTAL = 'https://billing.stripe.com/p/login/test_your_portal_link';
