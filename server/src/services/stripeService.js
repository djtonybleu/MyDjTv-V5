import Stripe from 'stripe';
import User from '../models/User.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createSubscription = async (userId, priceId) => {
  try {
    const user = await User.findById(userId);
    
    let customerId = user.subscription.stripeCustomerId;
    
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: user._id.toString() }
      });
      customerId = customer.id;
      
      user.subscription.stripeCustomerId = customerId;
      await user.save();
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
    const user = await User.findOne({ 
      'subscription.stripeCustomerId': subscription.customer 
    });
    
    if (user) {
      user.subscription.status = subscription.status === 'active' ? 'active' : 'inactive';
      user.subscription.plan = 'premium';
      user.subscription.subscriptionId = subscription.id;
      user.subscription.expiresAt = new Date(subscription.current_period_end * 1000);
      await user.save();
    }
  } catch (error) {
    console.error('Update subscription error:', error);
  }
};

const cancelUserSubscription = async (subscription) => {
  try {
    const user = await User.findOne({ 
      'subscription.subscriptionId': subscription.id 
    });
    
    if (user) {
      user.subscription.status = 'expired';
      user.subscription.plan = 'free';
      await user.save();
    }
  } catch (error) {
    console.error('Cancel subscription error:', error);
  }
};