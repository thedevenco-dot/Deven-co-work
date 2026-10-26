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
import adminRoutes from './routes/adminRoutes.js';
import planRoutes from './routes/planRoutes.js';
import calculatorRoutes from './routes/calculatorRoutes.js';
import spinWheelRoutes from './routes/spinWheelRoutes.js';
import { getSeats } from './controllers/reservationController.js';
import Content from './models/Content.js';
import Event from './models/Event.js';
import BlogPost from './models/BlogPost.js';
import eventRoutes from './routes/eventRoutes.js';
import blogRoutes from './routes/blogRoutes.js';

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
  'https://deven-co-work.onrender.com',
  'https://deven-co-work-1tfk.onrender.com',
  'https://spin.devencowork.com'
];
if (process.env.CORS_ALLOWED_ORIGIN) {
  allowedOrigins.push(process.env.CORS_ALLOWED_ORIGIN);
}
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Allow server/curl/postman
    const isAllowed =
      allowedOrigins.indexOf(origin) !== -1 ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.devencowork.com') ||
      /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin) ||
      /^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/.test(origin) ||
      /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+(:\d+)?$/.test(origin) ||
      process.env.NODE_ENV !== 'production';
    if (isAllowed) {
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

const spinLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 spins per hour
  message: { success: false, message: 'Too many spin attempts. Please try again after an hour.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Mount Rate Limiters
app.use(globalLimiter);
app.use('/api/auth/login', strictLimiter);
app.use('/api/spin-wheel/spin', spinLimiter);
app.use('/api/spin-wheel/leads', strictLimiter);
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
app.use('/api/spin-wheel', spinWheelRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/blog', blogRoutes);
app.get('/api/seats', getSeats);

// Health check endpoint
app.get('/api/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

// Dynamic Sitemap endpoint
app.get('/sitemap.xml', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const staticRoutes = [
      { loc: 'https://www.devencowork.com/', priority: '1.0', changefreq: 'weekly' },
      { loc: 'https://www.devencowork.com/events', priority: '0.8', changefreq: 'monthly' },
      { loc: 'https://www.devencowork.com/about', priority: '0.8', changefreq: 'monthly' },
      { loc: 'https://www.devencowork.com/blog', priority: '0.8', changefreq: 'monthly' },
      { loc: 'https://www.devencowork.com/private-cabins', priority: '0.8', changefreq: 'monthly' },
      { loc: 'https://www.devencowork.com/meeting-room', priority: '0.8', changefreq: 'monthly' },
      { loc: 'https://www.devencowork.com/podcast-studio', priority: '0.8', changefreq: 'monthly' },
      { loc: 'https://www.devencowork.com/free-trial', priority: '0.8', changefreq: 'monthly' },
      { loc: 'https://www.devencowork.com/pricing', priority: '0.8', changefreq: 'monthly' },
      { loc: 'https://www.devencowork.com/amenities', priority: '0.8', changefreq: 'monthly' },
      { loc: 'https://www.devencowork.com/faq', priority: '0.8', changefreq: 'monthly' },
      { loc: 'https://www.devencowork.com/cost-calculator', priority: '0.8', changefreq: 'monthly' },
      { loc: 'https://www.devencowork.com/contact', priority: '0.8', changefreq: 'monthly' },
    ];

    const publishedPosts = await BlogPost.find({ status: 'published' }).select('slug updatedAt publishedAt').lean();
    const blogUrls = (publishedPosts || []).map(p => ({
      loc: `https://www.devencowork.com/blog/${p.slug}`,
      priority: '0.7',
      changefreq: 'weekly',
      lastmod: (p.updatedAt || p.publishedAt || new Date()).toISOString().split('T')[0]
    }));

    const allUrls = [...staticRoutes, ...blogUrls];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod || today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600');
    return res.send(xml);
  } catch (err) {
    res.status(500).send('Error generating sitemap');
  }
});

// Production / Static Serving: Inject dynamic CMS metadata into initial HTML for social crawlers (WhatsApp, Facebook, Twitter, Google)
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

    // Query published content for CMS metadata & initial CMS state injection
    const published = await Content.findOne({ key: 'published' }).lean();

    const resolveMediaUrl = (val) => {
      if (!val) return '';
      if (typeof val === 'string') return val;
      if (typeof val === 'object' && val !== null) return val.url || '';
      return '';
    };

    const makeAbsolute = (url) => {
      if (!url) return '';
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      const host = req.get('host') || 'www.devencowork.com';
      const protocol = req.protocol || 'https';
      return `${protocol}://${host}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    // ── Favicon (browser tab icon) ────────────────────────────────────────────
    let faviconUrl = resolveMediaUrl(published?.globalSettings?.favicon);
    if (!faviconUrl) faviconUrl = 'https://www.devencowork.com/favicon-96x96.png';
    faviconUrl = makeAbsolute(faviconUrl);

    // ── OG / Social Image (used in Google Search, WhatsApp, Facebook, Twitter)
    // Priority: seo.ogImage → globalSettings.ogImage → fallback static og-image
    let ogImageUrl =
      resolveMediaUrl(published?.seo?.ogImage) ||
      resolveMediaUrl(published?.globalSettings?.ogImage) ||
      'https://www.devencowork.com/favicon.png';
    ogImageUrl = makeAbsolute(ogImageUrl);

    // Append cache-busting version param based on last publish timestamp
    const updatedAt = published?.updatedAt ? new Date(published.updatedAt).getTime() : '';
    const withVersion = (url) => updatedAt ? url + (url.includes('?') ? '&' : '?') + `v=${updatedAt}` : url;

    const finalFaviconUrl = withVersion(faviconUrl);
    const finalOgImageUrl = withVersion(ogImageUrl);

    // ── Inject into HTML ──────────────────────────────────────────────────────
    // og:image and twitter:image → social preview image (NOT the favicon)
    html = html.replace(/<meta property="og:image" content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${finalOgImageUrl}" />`);
    html = html.replace(/<meta name="twitter:image" content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${finalOgImageUrl}" />`);
    // Browser tab icon → favicon only
    html = html.replace(/<link rel="icon" [^>]*>/i, `<link rel="icon" type="image/png" href="${finalFaviconUrl}" />`);

    // ── Route-Specific SEO & Metadata Overrides ──────────────────────────────
    const reqPath = req.path.toLowerCase().replace(/\/$/, '') || '/';

    // 1. /blog/:slug (Dynamic Blog Article Route)
    if (reqPath.startsWith('/blog/') && reqPath !== '/blog') {
      const slug = reqPath.replace(/^\/blog\//, '').trim();

      // Look up published post
      let post = await BlogPost.findOne({ slug, status: 'published' }).lean();

      // If not found, check previousSlugs for permanent 301 redirect
      if (!post) {
        const redirected = await BlogPost.findOne({ previousSlugs: slug, status: 'published' }).lean();
        if (redirected) {
          return res.redirect(301, `/blog/${redirected.slug}`);
        }
        // Unknown or draft slug: return genuine 404 per requirements
        res.status(404);
        const notFoundTitle = 'Article Not Found | Deven Co-Work';
        html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${notFoundTitle}</title>`);
        html = html.replace(/<meta\s+[^>]*name=["']robots["'][^>]*\/?>/i, '<meta name="robots" content="noindex, nofollow" />');
        return res.send(html);
      }

      // Found article: rewrite metadata
      const articleTitle = `${post.seoTitle || post.title} | Deven Co-Work`;
      const articleDesc = post.seoDescription || post.excerpt;
      const canonicalUrl = `https://www.devencowork.com/blog/${post.slug}`;
      const articleCover = resolveMediaUrl(post.socialImage || post.coverImage) || finalOgImageUrl;
      const articleCoverAbs = makeAbsolute(articleCover);

      html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${articleTitle}</title>`);
      html = html.replace(/<meta\s+[^>]*name=["']description["'][^>]*\/?>/i, `<meta name="description" content="${articleDesc.replace(/"/g, '&quot;')}" />`);

      const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />`;
      if (/<link\s+[^>]*rel=["']canonical["'][^>]*\/?>/i.test(html)) {
        html = html.replace(/<link\s+[^>]*rel=["']canonical["'][^>]*\/?>/i, canonicalTag);
      } else {
        html = html.replace('</head>', `${canonicalTag}\n</head>`);
      }

      html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${articleTitle.replace(/"/g, '&quot;')}" />`);
      html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${articleDesc.replace(/"/g, '&quot;')}" />`);
      html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
      html = html.replace(/<meta property="og:image" content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${articleCoverAbs}" />`);

      html = html.replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${articleTitle.replace(/"/g, '&quot;')}" />`);
      html = html.replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${articleDesc.replace(/"/g, '&quot;')}" />`);
      html = html.replace(/<meta name="twitter:image" content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${articleCoverAbs}" />`);

      // BlogPosting JSON-LD Schema
      const blogPostingSchema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        'headline': post.title,
        'description': post.excerpt,
        'image': articleCoverAbs ? [articleCoverAbs] : undefined,
        'author': {
          '@type': 'Person',
          'name': post.author || 'Deven Co-Work Team',
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'Deven Co-Work',
          'url': 'https://www.devencowork.com',
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://res.cloudinary.com/cyxow5rb/image/upload/v1790711830/deven_cowork/hupv1daduww9ykgc6t52.png',
          },
        },
        'datePublished': post.publishedAt || post.createdAt,
        'dateModified': post.updatedAt || post.publishedAt || post.createdAt,
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': canonicalUrl,
        },
      };

      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.devencowork.com/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': 'https://www.devencowork.com/blog' },
          { '@type': 'ListItem', 'position': 3, 'name': post.title, 'item': canonicalUrl },
        ],
      };

      const articleScripts = `
<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
<script type="application/ld+json">${JSON.stringify(blogPostingSchema)}</script>
<script>window.__INITIAL_BLOG_POST__ = ${JSON.stringify(post).replace(/</g, '\\u003c')};</script>`;
      html = html.replace('</head>', `${articleScripts}\n</head>`);
    }

    // 2. /events
    else if (reqPath === '/events') {
      const pageTitle = 'Events & Founder Community Meetups in Raipur | Deven Co-Work';
      const pageDesc = 'Discover upcoming workshops, founder meetups, and networking events at Deven Co-Work in Shankar Nagar, Raipur. Join our active founder community.';
      const canonicalUrl = 'https://www.devencowork.com/events';

      html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${pageTitle}</title>`);
      html = html.replace(/<meta\s+[^>]*name=["']description["'][^>]*\/?>/i, `<meta name="description" content="${pageDesc}" />`);
      html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${pageTitle}" />`);
      html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${pageDesc}" />`);
      html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
      html = html.replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${pageTitle}" />`);
      html = html.replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${pageDesc}" />`);

      const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />`;
      if (/<link\s+[^>]*rel=["']canonical["'][^>]*\/?>/i.test(html)) {
        html = html.replace(/<link\s+[^>]*rel=["']canonical["'][^>]*\/?>/i, canonicalTag);
      } else {
        html = html.replace('</head>', `${canonicalTag}\n</head>`);
      }

      // Fetch published upcoming events for Schema.org Event markup
      const upcomingEvents = await Event.find({
        status: 'published',
        $or: [{ endAt: { $gte: new Date() } }, { startAt: { $gte: new Date() } }],
      }).limit(5).lean();

      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.devencowork.com/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Events', 'item': canonicalUrl },
        ],
      };

      const eventSchemas = upcomingEvents.map((ev) => ({
        '@context': 'https://schema.org',
        '@type': 'Event',
        'name': ev.title,
        'description': ev.excerpt,
        'startDate': ev.startAt,
        'endDate': ev.endAt,
        'eventStatus': 'https://schema.org/EventScheduled',
        'eventAttendanceMode': 'https://schema.org/OfflineEventAttendanceMode',
        'location': {
          '@type': 'Place',
          'name': 'Deven Co-Work',
          'address': {
            '@type': 'PostalAddress',
            'streetAddress': 'VIP Estate, A1, VIP Colony, Shankar Nagar',
            'addressLocality': 'Raipur',
            'addressRegion': 'Chhattisgarh',
            'postalCode': '492001',
            'addressCountry': 'IN',
          },
        },
        'organizer': {
          '@type': 'Organization',
          'name': ev.organizer || 'Deven Co-Work',
          'url': 'https://www.devencowork.com',
        },
      }));

      const eventsScript = `
<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
${eventSchemas.map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n')}`;
      html = html.replace('</head>', `${eventsScript}\n</head>`);
    }

    // 3. /about
    else if (reqPath === '/about') {
      const pageTitle = published?.about?.seo?.title || 'About Deven Co-Work — Raipur\'s Premier Coworking & Founder Space';
      const pageDesc = published?.about?.seo?.description || 'Learn about Deven Co-Work in Shankar Nagar, Raipur. Our story, mission, workspace philosophy, and founder community building what\'s next.';
      const canonicalUrl = 'https://www.devencowork.com/about';

      html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${pageTitle}</title>`);
      html = html.replace(/<meta\s+[^>]*name=["']description["'][^>]*\/?>/i, `<meta name="description" content="${pageDesc}" />`);
      html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${pageTitle}" />`);
      html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${pageDesc}" />`);
      html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
      html = html.replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${pageTitle}" />`);
      html = html.replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${pageDesc}" />`);

      const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />`;
      if (/<link\s+[^>]*rel=["']canonical["'][^>]*\/?>/i.test(html)) {
        html = html.replace(/<link\s+[^>]*rel=["']canonical["'][^>]*\/?>/i, canonicalTag);
      } else {
        html = html.replace('</head>', `${canonicalTag}\n</head>`);
      }

      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.devencowork.com/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'About Us', 'item': canonicalUrl },
        ],
      };
      html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>\n</head>`);
    }

    // 4. /blog (Blog Listing Route)
    else if (reqPath === '/blog') {
      const pageTitle = 'The Deven Journal — Ideas & Insights for Founders in Raipur | Deven Co-Work';
      const pageDesc = 'Articles, founder stories, productivity playbooks, and business insights from Deven Co-Work, Raipur\'s premier founder community.';
      const canonicalUrl = 'https://www.devencowork.com/blog';

      html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${pageTitle}</title>`);
      html = html.replace(/<meta\s+[^>]*name=["']description["'][^>]*\/?>/i, `<meta name="description" content="${pageDesc}" />`);
      html = html.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${pageTitle}" />`);
      html = html.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${pageDesc}" />`);
      html = html.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
      html = html.replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${pageTitle}" />`);
      html = html.replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${pageDesc}" />`);

      const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />`;
      if (/<link\s+[^>]*rel=["']canonical["'][^>]*\/?>/i.test(html)) {
        html = html.replace(/<link\s+[^>]*rel=["']canonical["'][^>]*\/?>/i, canonicalTag);
      } else {
        html = html.replace('</head>', `${canonicalTag}\n</head>`);
      }

      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.devencowork.com/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': canonicalUrl },
        ],
      };
      html = html.replace('</head>', `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>\n</head>`);
    }

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
