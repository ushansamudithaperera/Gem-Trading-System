import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),

  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/gemDB',

  REDIS_URL: process.env.REDIS_URL || '',

  JWT_SECRET: process.env.JWT_SECRET || 'default_secret_change_me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',

  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',

  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:5000',

  // Free Courier Mock (if no real courier API)
  COURIER_MOCK_DELAY_MS: parseInt(process.env.COURIER_MOCK_DELAY_MS || '3000', 10),

  // Auto-release timer (days)
  AUTO_RELEASE_DAYS: parseInt(process.env.AUTO_RELEASE_DAYS || '3', 10),

  // AI service (optional)
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || '',
};

// Validate critical variables in production
if (env.NODE_ENV === 'production') {
  if (!env.MONGODB_URI || env.MONGODB_URI === 'mongodb://localhost:27017/gemDB') {
    throw new Error('MONGODB_URI is required in production');
  }
  if (!env.JWT_SECRET || env.JWT_SECRET === 'default_secret_change_me') {
    throw new Error('JWT_SECRET must be set in production');
  }
}