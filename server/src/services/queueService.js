import Queue from 'bull';
import env from '../config/env.js';
import logger from '../config/logger.js';

// Create queues for different types of background jobs
export const fileProcessingQueue = new Queue('file processing', {
  redis: {
    port: new URL(env.REDIS_URL).port || 6379,
    host: new URL(env.REDIS_URL).hostname || 'localhost',
    password: new URL(env.REDIS_URL).password || undefined
  },
  defaultJobOptions: {
    removeOnComplete: 10, // Keep only 10 completed jobs
    removeOnFail: 50,     // Keep 50 failed jobs for debugging
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
});

export const emailQueue = new Queue('email notifications', {
  redis: {
    port: new URL(env.REDIS_URL).port || 6379,
    host: new URL(env.REDIS_URL).hostname || 'localhost', 
    password: new URL(env.REDIS_URL).password || undefined
  },
  defaultJobOptions: {
    removeOnComplete: 5,
    removeOnFail: 20,
    attempts: 2,
    backoff: {
      type: 'fixed',
      delay: 5000
    }
  }
});

// File processing job handlers
fileProcessingQueue.process('commercial-upload', async (job) => {
  const { filePath, venueId, metadata } = job.data;
  logger.info('Processing commercial upload', { filePath, venueId });

  try {
    // Simulate file processing (could be video transcoding, audio optimization, etc.)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Here you would typically:
    // 1. Validate file format and content
    // 2. Optimize/compress the file
    // 3. Upload to final storage (Cloudinary)
    // 4. Update database with final URL
    // 5. Notify user of completion
    
    logger.info('Commercial upload processed successfully', { 
      filePath, 
      venueId,
      jobId: job.id 
    });
    
    return { 
      success: true, 
      message: 'Commercial processed successfully',
      finalUrl: `https://processed-url.com/${venueId}/${job.id}`
    };
  } catch (error) {
    logger.error('Commercial upload processing failed', { 
      error: error.message,
      filePath,
      venueId,
      jobId: job.id
    });
    throw error;
  }
});

// Email notification job handlers
emailQueue.process('welcome-email', async (job) => {
  const { userEmail, userName } = job.data;
  logger.info('Sending welcome email', { userEmail });

  try {
    // Simulate email sending (integrate with SendGrid, Nodemailer, etc.)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    logger.info('Welcome email sent successfully', { userEmail });
    return { success: true, message: 'Welcome email sent' };
  } catch (error) {
    logger.error('Failed to send welcome email', { error: error.message, userEmail });
    throw error;
  }
});

emailQueue.process('subscription-notification', async (job) => {
  const { userEmail, action, planName } = job.data;
  logger.info('Sending subscription notification', { userEmail, action });

  try {
    // Simulate subscription email
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    logger.info('Subscription notification sent', { userEmail, action });
    return { success: true, message: 'Subscription notification sent' };
  } catch (error) {
    logger.error('Failed to send subscription notification', { 
      error: error.message, 
      userEmail,
      action 
    });
    throw error;
  }
});

// Queue event listeners for monitoring
fileProcessingQueue.on('completed', (job, result) => {
  logger.info('File processing job completed', { 
    jobId: job.id, 
    type: job.name,
    result: result.message 
  });
});

fileProcessingQueue.on('failed', (job, err) => {
  logger.error('File processing job failed', { 
    jobId: job.id, 
    type: job.name,
    error: err.message,
    attempts: job.attemptsMade
  });
});

emailQueue.on('completed', (job, result) => {
  logger.info('Email job completed', { 
    jobId: job.id, 
    type: job.name,
    recipient: job.data.userEmail
  });
});

emailQueue.on('failed', (job, err) => {
  logger.error('Email job failed', { 
    jobId: job.id, 
    type: job.name,
    error: err.message,
    recipient: job.data.userEmail
  });
});

// Helper functions for adding jobs
export const addFileProcessingJob = async (type, data, options = {}) => {
  try {
    const job = await fileProcessingQueue.add(type, data, options);
    logger.info('File processing job added', { jobId: job.id, type });
    return job;
  } catch (error) {
    logger.error('Failed to add file processing job', { error: error.message, type });
    throw error;
  }
};

export const addEmailJob = async (type, data, options = {}) => {
  try {
    const job = await emailQueue.add(type, data, options);
    logger.info('Email job added', { jobId: job.id, type });
    return job;
  } catch (error) {
    logger.error('Failed to add email job', { error: error.message, type });
    throw error;
  }
};

// Queue status and monitoring
export const getQueueStats = async () => {
  try {
    const [fileStats, emailStats] = await Promise.all([
      fileProcessingQueue.getJobCounts(),
      emailQueue.getJobCounts()
    ]);

    return {
      fileProcessing: fileStats,
      email: emailStats,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Failed to get queue stats', { error: error.message });
    return null;
  }
};

// Graceful shutdown
export const closeQueues = async () => {
  logger.info('Closing job queues...');
  await Promise.all([
    fileProcessingQueue.close(),
    emailQueue.close()
  ]);
  logger.info('Job queues closed');
};