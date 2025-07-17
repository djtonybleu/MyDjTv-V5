// Error tracking setup - uncomment and configure when ready to use Sentry
// import * as Sentry from '@sentry/node';
// import env from './env.js';

export const initializeErrorTracking = () => {
  // Uncomment and configure with your Sentry DSN when ready
  /*
  if (env.NODE_ENV === 'production' && env.SENTRY_DSN) {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      environment: env.NODE_ENV,
      tracesSampleRate: 0.1,
      integrations: [
        new Sentry.Integrations.Http({ breadcrumbs: true, tracing: true })
      ]
    });
    
    console.log('✅ Sentry error tracking initialized');
  }
  */
};

export const captureException = (error, context = {}) => {
  // Fallback to console logging if Sentry is not configured
  console.error('Error captured:', error, context);
  
  // Uncomment when Sentry is configured
  // if (env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { extra: context });
  // }
};

export const captureMessage = (message, level = 'info', context = {}) => {
  console.log(`[${level.toUpperCase()}]`, message, context);
  
  // Uncomment when Sentry is configured
  // if (env.NODE_ENV === 'production') {
  //   Sentry.captureMessage(message, level, { extra: context });
  // }
};