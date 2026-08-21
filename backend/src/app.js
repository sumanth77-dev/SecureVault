import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Middlewares
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';
import { apiLimiter } from './middleware/rateLimitMiddleware.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import folderRoutes from './routes/folderRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import shareRoutes from './routes/shareRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

const app = express();

// Trust reverse proxy (Render, Heroku, etc.) for HTTPS detection and secure cookies
app.set('trust proxy', 1);

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:5000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-unlock-token']
}));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// General rate limiter on API
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SecureVault API',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/shares', shareRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
