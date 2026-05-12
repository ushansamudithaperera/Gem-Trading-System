import morgan from 'morgan';
import { logger } from '../config/logger';

// Create a stream object for morgan to write to Winston
const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Morgan middleware with custom format
export const loggingMiddleware = morgan(':method :url :status :response-time ms - :res[content-length]', { stream });

// Simple request logger for development (colored)
export const devLoggingMiddleware = morgan('dev');