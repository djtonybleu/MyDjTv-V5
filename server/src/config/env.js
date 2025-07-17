import Joi from 'joi';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = Joi.object({
  // Database
  DATABASE_URL: Joi.string().uri().required(),
  
  // Server
  PORT: Joi.number().port().default(5000),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  CLIENT_URL: Joi.string().uri().required(),
  
  // Authentication
  JWT_SECRET: Joi.string().min(32).required(),
  
  // Spotify API
  SPOTIFY_CLIENT_ID: Joi.string().required(),
  SPOTIFY_CLIENT_SECRET: Joi.string().required(),
  
  // Stripe
  STRIPE_SECRET_KEY: Joi.string().pattern(/^sk_(test_|live_)/).required(),
  STRIPE_WEBHOOK_SECRET: Joi.string().pattern(/^whsec_/).required(),
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: Joi.string().required(),
  CLOUDINARY_API_KEY: Joi.string().required(),
  CLOUDINARY_API_SECRET: Joi.string().required(),
  
  // Push Notifications
  VAPID_PUBLIC_KEY: Joi.string().optional(),
  VAPID_PRIVATE_KEY: Joi.string().optional(),
  VAPID_EMAIL: Joi.string().email().optional(),
  
  // Redis Cache
  REDIS_URL: Joi.string().uri().optional().default('redis://localhost:6379'),
  
  // Database Pool Configuration
  DB_POOL_MIN: Joi.number().integer().min(0).optional().default(2),
  DB_POOL_MAX: Joi.number().integer().min(1).optional().default(20),
  DB_POOL_IDLE_TIMEOUT: Joi.number().integer().min(1000).optional().default(30000),
  DB_POOL_CONNECTION_TIMEOUT: Joi.number().integer().min(1000).optional().default(5000)
}).unknown();

const { error, value: env } = envSchema.validate(process.env);

if (error) {
  console.error('❌ Environment validation failed:');
  console.error(error.details.map(detail => `  - ${detail.message}`).join('\n'));
  process.exit(1);
}

export default env;