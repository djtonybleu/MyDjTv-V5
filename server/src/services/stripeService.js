import Stripe from 'stripe';
import prisma from '../config/prisma.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createSubscription = async (userId, priceId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    let customerId = user.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user.id.toString() }
      });
      customerId = customer.id;
      
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId }
      });
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent']
    });

    return {
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret
    };
  } catch (error) {
    console.error('Stripe subscription error:', error);
    throw error;
  }
};

export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await updateUserSubscription(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await cancelUserSubscription(event.data.object);
      break;
    case 'invoice.payment_succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
  }

  res.json({ received: true });
};

const updateUserSubscription = async (subscription) => {
  try {
    const user = await prisma.user.findFirst({ 
      where: { stripeCustomerId: subscription.customer }
    });
    
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: subscription.status === 'active' ? 'active' : 'inactive',
          subscriptionPlan: 'premium',
          subscriptionId: subscription.id,
          expiresAt: new Date(subscription.current_period_end * 1000)
        }
      });
    }
  } catch (error) {
    console.error('Update subscription error:', error);
  }
};

const cancelUserSubscription = async (subscription) => {
  try {
    const user = await prisma.user.findFirst({ 
      where: { subscriptionId: subscription.id }
    });
    
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: 'expired',
          subscriptionPlan: 'free'
        }
      });
    }
  } catch (error) {
    console.error('Cancel subscription error:', error);
  }
};