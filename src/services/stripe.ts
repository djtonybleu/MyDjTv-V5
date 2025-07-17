import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const getStripe = () => stripePromise;

export const createCheckoutSession = async (priceId: string) => {
  const stripe = await getStripe();
  if (!stripe) throw new Error('Stripe not loaded');

  const response = await fetch('/api/payments/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ priceId }),
  });

  const session = await response.json();
  
  const result = await stripe.redirectToCheckout({
    sessionId: session.id,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }
};

export const createPaymentIntent = async (amount: number) => {
  const response = await fetch('/api/payments/create-payment-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount }),
  });

  return await response.json();
};