import express from 'express';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import fs from 'fs';
import authRoutes from './routes/authRoutes.js';
import reservationRoutes from './routes/reservationRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import planRoutes from './routes/planRoutes.js';
import calculatorRoutes from './routes/calculatorRoutes.js';
import { getSeats } from './controllers/reservationController.js';
import Content from './models/Content.js';

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
  'http://localhost:5000',
  'https://deven-co-work.onrender.com'
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
app.use('/api/plans', planRoutes);
app.use('/api/calculator', calculatorRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/admin', adminRoutes);
app.get('/api/seats', getSeats);

// Health check endpoint
app.get('/api/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

// Production / Static Serving: Inject dynamic CMS Favicon into initial HTML for social crawlers (WhatsApp, Facebook, Twitter)
const clientBuildPath = path.resolve(__dirname, '../client/dist');

const serveDynamicHtml = async (req, res, next) => {
  if (path.extname(req.path)) {
    return next();
  }
  try {
    const indexPath = path.resolve(clientBuildPath, 'index.html');
    if (!fs.existsSync(indexPath)) {
      return res.send('API Server is running...');
    }

    let html = fs.readFileSync(indexPath, 'utf8');

    // Query published content for CMS Favicon & initial CMS state injection
    const published = await Content.findOne({ key: 'published' }).lean();
    let faviconUrl = '';
    if (published && published.globalSettings && published.globalSettings.favicon) {
      const val = published.globalSettings.favicon;
      if (typeof val === 'string') faviconUrl = val;
      else if (typeof val === 'object' && val !== null) faviconUrl = val.url || '';
    }

    if (!faviconUrl) {
      faviconUrl = 'https://www.devencowork.com/favicon.svg';
    } else if (!faviconUrl.startsWith('http://') && !faviconUrl.startsWith('https://')) {
      const host = req.get('host') || 'www.devencowork.com';
      const protocol = req.protocol || 'https';
      faviconUrl = `${protocol}://${host}${faviconUrl.startsWith('/') ? '' : '/'}${faviconUrl}`;
    }

    const updatedAt = published && published.updatedAt ? new Date(published.updatedAt).getTime() : '';
    let finalSocialUrl = faviconUrl;
    if (updatedAt) {
      finalSocialUrl += (faviconUrl.includes('?') ? '&' : '?') + `v=${updatedAt}`;
    }

    // Dynamically replace og:image, twitter:image, and icon tags in initial HTML
    html = html.replace(/<meta property="og:image" content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${finalSocialUrl}" />`);
    html = html.replace(/<meta name="twitter:image" content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${finalSocialUrl}" />`);
    html = html.replace(/<link rel="icon" [^>]*>/i, `<link rel="icon" type="image/svg+xml" href="${finalSocialUrl}" />`);

    // Inject published CMS data as window.__INITIAL_CMS_DATA__ to guarantee instant zero-flash render
    if (published) {
      const initialPayload = JSON.parse(JSON.stringify(published));
      delete initialPayload._id;
      delete initialPayload.__v;
      delete initialPayload.key;
      const initialScript = `<script>window.__INITIAL_CMS_DATA__ = ${JSON.stringify(initialPayload).replace(/</g, '\\u003c')};</script>`;
      if (html.includes('</head>')) {
        html = html.replace('</head>', `${initialScript}\n</head>`);
      } else {
        html = initialScript + html;
      }
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  } catch (err) {
    console.error('Error injecting dynamic CMS metadata:', err);
    return res.sendFile(path.resolve(clientBuildPath, 'index.html'));
  }
};

if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath, { index: false }));
  app.use(serveDynamicHtml);
} else {
  app.get('/', serveDynamicHtml);
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
