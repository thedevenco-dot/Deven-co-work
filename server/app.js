import express from 'express';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import { getSeats } from './controllers/reservationController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: false, // Turned off to allow Google Maps and other external embed scripts
  crossOriginEmbedderPolicy: false
}));

// CORS Configuration (Production constraints)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5000'
];
if (process.env.CORS_ALLOWED_ORIGIN) {
  allowedOrigins.push(process.env.CORS_ALLOWED_ORIGIN);
}
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Allow server/curl/postman
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS security policy'));
  },
  credentials: true
}));

// Rate Limiting Configurations
const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per minute
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 login/booking actions per 15 minutes
  message: { success: false, message: 'Too many submissions. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Mount Rate Limiters
app.use(globalLimiter);
app.use('/api/auth/login', strictLimiter);
app.use('/api/reservations', (req, res, next) => {
  if (req.method === 'POST') {
    return strictLimiter(req, res, next);
  }
  next();
});

app.use(express.json({ limit: '50mb' })); // Support larger base64 image/video uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads serving
const uploadsPath = path.resolve(__dirname, './uploads');
app.use('/uploads', express.static(uploadsPath));

// REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/webhooks', webhookRoutes);
app.get('/api/seats', getSeats);

// Health check endpoint
app.get('/api/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

// Production environment configuration (Serve client production build)
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.resolve(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientBuildPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API Server is running in development mode...');
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`Unhandled Error: ${err.message}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default app;
