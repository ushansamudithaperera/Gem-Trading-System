/// <reference path="./types/express.d.ts" />
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import path from 'path';

// Routes
import authRoutes from './routes/v1/auth.routes';
import userRoutes from './routes/v1/user.routes';
import gemRoutes from './routes/v1/gem.routes';
import gemstoneRoutes from './routes/v1/gemRoutes';
import bidRoutes from './routes/v1/bidRoutes';
import orderRoutes from './routes/v1/order.routes';
import cuttingRoutes from './routes/v1/cutting.routes';
import disputeRoutes from './routes/v1/dispute.routes';
import healthRoutes from './routes/v1/health.routes';
import webhookRoutes from './routes/v1/webhook.routes';

// Middleware
import { loggingMiddleware, devLoggingMiddleware } from './middleware/logging.middleware';
import { errorMiddleware } from './middleware/error.middleware';


// Config
import { env } from './config/env';


const app: Application = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'production' ? 100 : 1000,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// CORS
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
if (env.NODE_ENV === 'development') {
  app.use(devLoggingMiddleware);
} else {
  app.use(loggingMiddleware);
}

// Static files (uploaded images - for local development)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoints (no auth)
app.use('/api/v1/health', healthRoutes);

// Webhook endpoints (no auth, raw body needed for Stripe)
app.use('/api/v1/webhook', webhookRoutes);

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/gems', gemRoutes);
app.use('/api/v1/gemstones', gemstoneRoutes);
app.use('/api/v1/bids', bidRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/cutting', cuttingRoutes);
app.use('/api/v1/disputes', disputeRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// Global error handler
app.use(errorMiddleware);

export default app;