/**
 * scripts/prerender.mjs
 *
 * Post-build static site generation (SSG) script.
 * Runs after `vite build` to inject server-rendered HTML into each
 * prebuilt route's index.html.
 *
 * - No headless browser (no Puppeteer / Playwright).
 * - Uses React's renderToString via a separate Vite SSR bundle.
 * - Fully compatible with Vercel's build environment.
 *
 * Usage:  node scripts/prerender.mjs
 * (called automatically from `npm run build`)
 */

import { build, loadEnv } from 'vite';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const clientRoot = resolve(__dirname, '..');
const distDir    = resolve(clientRoot, 'dist');

// Routes to prerender. Admin routes are excluded (private pages).
const routes = ['/', '/thank-you', '/events', '/about', '/blog'];

function escapeJsonForScript(jsonStr) {
  return jsonStr
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function mediaUrl(val) {
  if (typeof val === 'string') return val;
  if (val && typeof val === 'object' && typeof val.url === 'string') return val.url;
  return '';
}

function absUrl(u) {
  if (!u || typeof u !== 'string') return '';
  const trimmed = u.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://www.devencowork.com${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
}

function escAttr(s) {
  if (!s || typeof s !== 'string') return '';
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function setTag(html, regex, replacementString) {
  return html.replace(regex, () => replacementString);
}

function stripHtml(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/<[^>]*>/g, '').trim();
}

function updateHeadFromCms(html, cmsData) {
  const updatedItems = [];

  // Favicon (disabled so self-hosted favicons are never rewritten from CMS)
  if (false) {
    const favUrl = absUrl(mediaUrl(cmsData.globalSettings?.favicon));
    if (favUrl) {
      let typeAttr = '';
      const path = favUrl.split(/[?#]/)[0].toLowerCase();
      if (path.endsWith('.png')) typeAttr = ' type="image/png"';
      else if (path.endsWith('.svg')) typeAttr = ' type="image/svg+xml"';
      else if (path.endsWith('.ico')) typeAttr = ' type="image/x-icon"';
      else if (path.endsWith('.jpg') || path.endsWith('.jpeg')) typeAttr = ' type="image/jpeg"';
      else if (path.endsWith('.webp')) typeAttr = ' type="image/webp"';

      const favTag = `<link rel="icon"${typeAttr} href="${escAttr(favUrl)}" />`;
      const iconRegex = /<link\s+[^>]*rel=["'](?:shortcut )?icon["'][^>]*\/?>/i;
      if (iconRegex.test(html)) {
        html = setTag(html, iconRegex, favTag);
        updatedItems.push('favicon');
      }
    }
  }

  // Title
  if (typeof cmsData.seo?.title === 'string' && cmsData.seo.title.trim()) {
    const titleVal = cmsData.seo.title.trim();
    const titleRegex = /<title>[\s\S]*?<\/title>/i;
    if (titleRegex.test(html)) {
      html = setTag(html, titleRegex, `<title>${escAttr(titleVal)}</title>`);
      updatedItems.push('title');
    }
  }

  // Description
  if (typeof cmsData.seo?.description === 'string' && cmsData.seo.description.trim()) {
    const descVal = cmsData.seo.description.trim();
    const descRegex = /<meta\s+[^>]*name=["']description["'][^>]*\/?>/i;
    if (descRegex.test(html)) {
      html = setTag(html, descRegex, `<meta name="description" content="${escAttr(descVal)}" />`);
      updatedItems.push('description');
    }
  }

  // Open Graph / Twitter
  const seo = cmsData.seo || {};

  const ogTitleVal = (typeof seo.ogTitle === 'string' && seo.ogTitle.trim())
    || (typeof seo.title === 'string' && seo.title.trim())
    || '';
  if (ogTitleVal) {
    const ogTitleRegex = /<meta\s+[^>]*property=["']og:title["'][^>]*\/?>/i;
    if (ogTitleRegex.test(html)) {
      html = setTag(html, ogTitleRegex, `<meta property="og:title" content="${escAttr(ogTitleVal)}" />`);
      updatedItems.push('og:title');
    }
  }

  const ogDescVal = (typeof seo.ogDescription === 'string' && seo.ogDescription.trim())
    || (typeof seo.description === 'string' && seo.description.trim())
    || '';
  if (ogDescVal) {
    const ogDescRegex = /<meta\s+[^>]*property=["']og:description["'][^>]*\/?>/i;
    if (ogDescRegex.test(html)) {
      html = setTag(html, ogDescRegex, `<meta property="og:description" content="${escAttr(ogDescVal)}" />`);
      updatedItems.push('og:description');
    }
  }

  const twitterTitleVal = (typeof seo.twitterTitle === 'string' && seo.twitterTitle.trim())
    || ogTitleVal
    || '';
  if (twitterTitleVal) {
    const twitterTitleRegex = /<meta\s+[^>]*name=["']twitter:title["'][^>]*\/?>/i;
    if (twitterTitleRegex.test(html)) {
      html = setTag(html, twitterTitleRegex, `<meta name="twitter:title" content="${escAttr(twitterTitleVal)}" />`);
      updatedItems.push('twitter:title');
    }
  }

  const twitterDescVal = (typeof seo.twitterDescription === 'string' && seo.twitterDescription.trim())
    || ogDescVal
    || '';
  if (twitterDescVal) {
    const twitterDescRegex = /<meta\s+[^>]*name=["']twitter:description["'][^>]*\/?>/i;
    if (twitterDescRegex.test(html)) {
      html = setTag(html, twitterDescRegex, `<meta name="twitter:description" content="${escAttr(twitterDescVal)}" />`);
      updatedItems.push('twitter:description');
    }
  }

  // Share image
  const ogImg = absUrl(mediaUrl(seo.ogImage)) || absUrl(mediaUrl(cmsData.globalSettings?.ogImage));
  if (ogImg) {
    const ogImageRegex = /<meta\s+[^>]*property=["']og:image["'][^>]*\/?>/i;
    if (ogImageRegex.test(html)) {
      html = setTag(html, ogImageRegex, `<meta property="og:image" content="${escAttr(ogImg)}" />`);
      updatedItems.push('og:image');
    }
    const twitterImageRegex = /<meta\s+[^>]*name=["']twitter:image["'][^>]*\/?>/i;
    if (twitterImageRegex.test(html)) {
      html = setTag(html, twitterImageRegex, `<meta name="twitter:image" content="${escAttr(ogImg)}" />`);
      updatedItems.push('twitter:image');
    }
  }

  if (updatedItems.length > 0) {
    console.log(`  ✅  Head: ${updatedItems.join(', ')} updated from CMS`);
  }

  return html;
}

async function fetchPublishedContent(root) {
  try {
    const env = loadEnv('production', root, 'VITE_');
    const rawUrl = (process.env.VITE_API_URL || env.VITE_API_URL || '').trim();
    if (!rawUrl) {
      console.warn('⚠️  No VITE_API_URL found. Continuing with no CMS data.');
      return null;
    }
    const base = rawUrl.replace(/\/+$/, '');
    const url = `${base}/api/content/published`;
    console.log(`📡  Fetching published CMS content from ${url} (60s timeout)…`);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60000);

    let res;
    try {
      res = await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }

    if (!res.ok) {
      console.warn(`⚠️  CMS fetch failed (HTTP ${res.status} ${res.statusText}). Continuing with no CMS data.`);
      return null;
    }

    const json = await res.json();
    if (json && json.success && json.data) {
      const cmsData = JSON.parse(JSON.stringify(json.data));
      delete cmsData._id;
      delete cmsData.__v;
      delete cmsData.key;
      console.log('✅  Published CMS content loaded successfully.');
      return cmsData;
    }

    console.warn('⚠️  CMS response missing valid success/data payload. Continuing with no CMS data.');
    return null;
  } catch (err) {
    const isTimeout = err.name === 'AbortError';
    console.warn(`⚠️  CMS fetch error (${isTimeout ? 'timed out after 60s' : err.message}). Continuing with no CMS data.`);
    return null;
  }
}

async function main() {
  console.log('\n🔧  Building SSR bundle…');

  // ── 1. Build a server-side (SSR) bundle ────────────────────────────────────
  await build({
    root: clientRoot,
    configFile: resolve(clientRoot, 'vite.config.js'),
    build: {
      ssr: 'src/entry-server.jsx',
      outDir: 'dist-ssr',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          format: 'esm',
        },
        // Keep everything bundled (including react-dom/server) so there is
        // exactly ONE React instance with matching internals.
      },
    },
    logLevel: 'warn',
  });

  console.log('✅  SSR bundle ready.\n');

  // ── 2. Load the template (built index.html) ────────────────────────────────
  const template = readFileSync(resolve(distDir, 'index.html'), 'utf-8');

  // ── 3. Dynamically import the SSR bundle ──────────────────────────────────
  const ssrBundlePath = resolve(clientRoot, 'dist-ssr', 'entry-server.js');
  if (!existsSync(ssrBundlePath)) {
    throw new Error(`SSR bundle not found at ${ssrBundlePath}`);
  }

  // Apply shim BEFORE loading the SSR bundle.
  // The shim patches react via CJS require() — which is the same module
  // registry that the SSR bundle's inlined React will be resolved from
  // when Vite SSR mode externalises React by default.
  const shimPath = resolve(clientRoot, 'src', 'ssr-shim.js');
  if (existsSync(shimPath)) {
    await import(pathToFileURL(shimPath).href);
  }

  // pathToFileURL is required on Windows: bare C:\... paths are not valid ESM URLs
  const { render } = await import(pathToFileURL(ssrBundlePath).href);

  // Dynamic import of SEO content pages
  const pagesModulePath = resolve(clientRoot, 'src', 'content', 'pages.js');
  const { PAGE_ORDER, PAGES, SITE } = await import(pathToFileURL(pagesModulePath).href);

  // Add the 6 SEO content page paths to the routes list
  const contentRoutes = PAGE_ORDER.map(slug => PAGES[slug].path);
  for (const p of contentRoutes) {
    if (!routes.includes(p)) routes.push(p);
  }

  // Fetch published CMS content before rendering routes
  const cmsData = await fetchPublishedContent(clientRoot);
  if (cmsData) {
    globalThis.__SSR_CMS_DATA__ = cmsData;
  }

  // ── 4. Render each route ──────────────────────────────────────────────────
  for (const url of routes) {
    console.log(`  🖊  Prerendering ${url}`);

    let appHtml = '';
    try {
      appHtml = render(url);
    } catch (err) {
      console.warn(`  ⚠️  renderToString error for ${url}: ${err.message}`);
      console.warn('      Falling back to static fallback content in #root.');
    }

    // Inject server-rendered HTML into the #root div.
    // We use a split approach (not regex) to reliably handle any multi-line
    // fallback content already inside #root.
    let html = template;
    if (appHtml) {
      const OPEN_TAG = '<div id="root">';
      const openIdx  = template.indexOf(OPEN_TAG);
      if (openIdx !== -1) {
        // Find the matching closing </div> by tracking nesting depth
        let depth = 1;
        let i = openIdx + OPEN_TAG.length;
        while (i < template.length && depth > 0) {
          if (template[i] === '<') {
            if (template.startsWith('</div>', i)) {
              depth--;
              if (depth === 0) break;
              i += 6;
              continue;
            } else if (template.startsWith('<div', i)) {
              depth++;
            }
          }
          i++;
        }
        // i now points to the start of the closing </div>
        const closeEnd = i + 6; // length of '</div>'
        html = template.slice(0, openIdx + OPEN_TAG.length)
          + appHtml
          + template.slice(i);
      }
    }

    // For the '/' route only (not '/thank-you'), after the app HTML is injected,
    // also inject inline script immediately before </head> if cmsData was fetched
    if (url === '/' && cmsData) {
      const scriptTag = `<script>window.__INITIAL_CMS_DATA__=${escapeJsonForScript(JSON.stringify(cmsData))};</script>`;
      html = html.replace('</head>', () => `${scriptTag}</head>`);

      try {
        html = updateHeadFromCms(html, cmsData);
      } catch (err) {
        console.warn(`  ⚠️  Failed to rewrite head tags from CMS: ${err.message}`);
      }

      // Build FAQPage JSON-LD from published FAQ items of the CMS data
      const rawFaqs = Array.isArray(cmsData.faq) ? cmsData.faq : [];
      const publishedFaqs = rawFaqs.filter(item => item && item.published !== false && (item.question || item.answer));
      if (publishedFaqs.length > 0) {
        const faqData = {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": publishedFaqs.map(item => ({
            "@type": "Question",
            "name": stripHtml(item.question),
            "acceptedAnswer": {
              "@type": "Answer",
              "text": stripHtml(item.answer)
            }
          }))
        };
        const faqStr = JSON.stringify(faqData, null, 2);
        JSON.parse(faqStr);
        const faqScriptTag = `<script type="application/ld+json">\n${faqStr}\n</script>\n`;
        html = html.replace('</head>', () => `${faqScriptTag}</head>`);
      }
    }

    // Handle '/thank-you' route ONLY
    if (url === '/thank-you') {
      // robots meta -> <meta name="robots" content="noindex, nofollow" /> (exactly one robots tag)
      const robotsRegex = /<meta\s+[^>]*name=["']robots["'][^>]*\/?>/i;
      if (robotsRegex.test(html)) {
        html = setTag(html, robotsRegex, '<meta name="robots" content="noindex, nofollow" />');
      } else {
        html = html.replace('</head>', () => '<meta name="robots" content="noindex, nofollow" />\n</head>');
      }

      // <title> -> Thank You | Deven Co-Work
      html = setTag(html, /<title>[\s\S]*?<\/title>/i, '<title>Thank You | Deven Co-Work</title>');

      // canonical -> https://www.devencowork.com/thank-you
      const canonicalRegex = /<link\s+[^>]*rel=["']canonical["'][^>]*\/?>/i;
      if (canonicalRegex.test(html)) {
        html = setTag(html, canonicalRegex, '<link rel="canonical" href="https://www.devencowork.com/thank-you" />');
      } else {
        html = html.replace('</head>', () => '<link rel="canonical" href="https://www.devencowork.com/thank-you" />\n</head>');
      }

      // og:title and twitter:title -> Thank You | Deven Co-Work
      html = setTag(html, /<meta\s+[^>]*property=["']og:title["'][^>]*\/?>/i, '<meta property="og:title" content="Thank You | Deven Co-Work" />');
      html = setTag(html, /<meta\s+[^>]*name=["']twitter:title["'][^>]*\/?>/i, '<meta name="twitter:title" content="Thank You | Deven Co-Work" />');
    }

    // Handle /events route
    if (url === '/events') {
      const canonicalUrl = `${SITE.url}/events`;
      const title = 'Startup Events in Raipur | Founder Meetups & Workshops | Deven Co-Work';
      const desc = 'Discover upcoming startup events in Raipur at Deven Co-Work, Shankar Nagar. Connect at founder meetups, networking sessions, AI workshops, and community masterclasses.';

      html = setTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${escAttr(title)}</title>`);
      html = setTag(html, /<meta\s+[^>]*name=["']description["'][^>]*\/?>/i, `<meta name="description" content="${escAttr(desc)}" />`);
      html = setTag(html, /<meta property="og:title" content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escAttr(title)}" />`);
      html = setTag(html, /<meta property="og:description" content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escAttr(desc)}" />`);
      html = setTag(html, /<meta property="og:url" content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${escAttr(canonicalUrl)}" />`);
      html = setTag(html, /<meta name="twitter:title" content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${escAttr(title)}" />`);
      html = setTag(html, /<meta name="twitter:description" content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${escAttr(desc)}" />`);

      const canonicalRegex = /<link\s+[^>]*rel=["']canonical["'][^>]*\/?>/i;
      if (canonicalRegex.test(html)) {
        html = setTag(html, canonicalRegex, `<link rel="canonical" href="${escAttr(canonicalUrl)}" />`);
      } else {
        html = html.replace('</head>', () => `<link rel="canonical" href="${escAttr(canonicalUrl)}" />\n</head>`);
      }

      const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.devencowork.com/" },
          { "@type": "ListItem", "position": 2, "name": "Events", "item": canonicalUrl }
        ]
      };
      html = html.replace('</head>', () => `<script type="application/ld+json">\n${JSON.stringify(breadcrumbData, null, 2)}\n</script>\n</head>`);
    }

    // Handle /about route
    if (url === '/about') {
      const canonicalUrl = `${SITE.url}/about`;
      const title = 'About Deven Co-Work — Raipur\'s Founder & Startup Workspace';
      const desc = 'Learn about Deven Co-Work in Shankar Nagar, Raipur. Founded to provide ambitious founders, creators, and teams with world-class workspace infrastructure.';

      html = setTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${escAttr(title)}</title>`);
      html = setTag(html, /<meta\s+[^>]*name=["']description["'][^>]*\/?>/i, `<meta name="description" content="${escAttr(desc)}" />`);
      html = setTag(html, /<meta property="og:title" content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escAttr(title)}" />`);
      html = setTag(html, /<meta property="og:description" content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escAttr(desc)}" />`);
      html = setTag(html, /<meta property="og:url" content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${escAttr(canonicalUrl)}" />`);
      html = setTag(html, /<meta name="twitter:title" content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${escAttr(title)}" />`);
      html = setTag(html, /<meta name="twitter:description" content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${escAttr(desc)}" />`);

      const canonicalRegex = /<link\s+[^>]*rel=["']canonical["'][^>]*\/?>/i;
      if (canonicalRegex.test(html)) {
        html = setTag(html, canonicalRegex, `<link rel="canonical" href="${escAttr(canonicalUrl)}" />`);
      } else {
        html = html.replace('</head>', () => `<link rel="canonical" href="${escAttr(canonicalUrl)}" />\n</head>`);
      }

      const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.devencowork.com/" },
          { "@type": "ListItem", "position": 2, "name": "About Us", "item": canonicalUrl }
        ]
      };
      html = html.replace('</head>', () => `<script type="application/ld+json">\n${JSON.stringify(breadcrumbData, null, 2)}\n</script>\n</head>`);
    }

    // Handle /blog route
    if (url === '/blog') {
      const canonicalUrl = `${SITE.url}/blog`;
      const title = 'The Deven Journal — Ideas & Insights for Founders in Raipur | Deven Co-Work';
      const desc = 'Articles, founder stories, productivity playbooks, and business insights from Deven Co-Work, Raipur\'s premier founder community.';

      html = setTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${escAttr(title)}</title>`);
      html = setTag(html, /<meta\s+[^>]*name=["']description["'][^>]*\/?>/i, `<meta name="description" content="${escAttr(desc)}" />`);
      html = setTag(html, /<meta property="og:title" content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${escAttr(title)}" />`);
      html = setTag(html, /<meta property="og:description" content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${escAttr(desc)}" />`);
      html = setTag(html, /<meta property="og:url" content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${escAttr(canonicalUrl)}" />`);
      html = setTag(html, /<meta name="twitter:title" content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${escAttr(title)}" />`);
      html = setTag(html, /<meta name="twitter:description" content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${escAttr(desc)}" />`);

      const canonicalRegex = /<link\s+[^>]*rel=["']canonical["'][^>]*\/?>/i;
      if (canonicalRegex.test(html)) {
        html = setTag(html, canonicalRegex, `<link rel="canonical" href="${escAttr(canonicalUrl)}" />`);
      } else {
        html = html.replace('</head>', () => `<link rel="canonical" href="${escAttr(canonicalUrl)}" />\n</head>`);
      }

      const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.devencowork.com/" },
          { "@type": "ListItem", "position": 2, "name": "Blog", "item": canonicalUrl }
        ]
      };
      html = html.replace('</head>', () => `<script type="application/ld+json">\n${JSON.stringify(breadcrumbData, null, 2)}\n</script>\n</head>`);
    }

    // Handle SEO content page routes
    const contentSlug = PAGE_ORDER.find(s => PAGES[s].path === url);
    if (contentSlug) {
      const page = PAGES[contentSlug];

      // For the new routes, embed window.__INITIAL_CMS_DATA__ exactly as is done for '/' (but NOT for /thank-you)
      if (cmsData) {
        const scriptTag = `<script>window.__INITIAL_CMS_DATA__=${escapeJsonForScript(JSON.stringify(cmsData))};</script>`;
        html = html.replace('</head>', () => `${scriptTag}</head>`);
      }

      // Do NOT apply updateHeadFromCms to the new routes (it must stay '/' only), because their titles come from pages.js.
      // For each new route, rewrite in the final HTML using function replacers in html.replace and escAttr:
      // <title>, meta name="description", <link rel="canonical"> (create it if missing) = SITE.url + path,
      // og:title, og:description, og:url, twitter:title, twitter:description. Keep og:image and twitter:image as they are.
      const canonicalUrl = `${SITE.url}${page.path}`;

      // Title
      html = setTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${escAttr(page.title)}</title>`);

      // Description
      html = setTag(html, /<meta\s+[^>]*name=["']description["'][^>]*\/?>/i, `<meta name="description" content="${escAttr(page.description)}" />`);

      // Canonical
      const canonicalRegex = /<link\s+[^>]*rel=["']canonical["'][^>]*\/?>/i;
      if (canonicalRegex.test(html)) {
        html = setTag(html, canonicalRegex, `<link rel="canonical" href="${escAttr(canonicalUrl)}" />`);
      } else {
        html = html.replace('</head>', () => `<link rel="canonical" href="${escAttr(canonicalUrl)}" />\n</head>`);
      }

      // og:title
      html = setTag(html, /<meta\s+[^>]*property=["']og:title["'][^>]*\/?>/i, `<meta property="og:title" content="${escAttr(page.title)}" />`);

      // og:description
      html = setTag(html, /<meta\s+[^>]*property=["']og:description["'][^>]*\/?>/i, `<meta property="og:description" content="${escAttr(page.description)}" />`);

      // og:url
      html = setTag(html, /<meta\s+[^>]*property=["']og:url["'][^>]*\/?>/i, `<meta property="og:url" content="${escAttr(canonicalUrl)}" />`);

      // twitter:title
      html = setTag(html, /<meta\s+[^>]*name=["']twitter:title["'][^>]*\/?>/i, `<meta name="twitter:title" content="${escAttr(page.title)}" />`);

      // twitter:description
      html = setTag(html, /<meta\s+[^>]*name=["']twitter:description["'][^>]*\/?>/i, `<meta name="twitter:description" content="${escAttr(page.description)}" />`);

      // Before </head> add two extra <script type="application/ld+json"> blocks per new route:
      // BreadcrumbList (Home -> this page, with absolute URLs) and FAQPage built from faqs.
      // Keep existing LocalBusiness block. JSON.parse every generated block to check it.
      const breadcrumbData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.devencowork.com/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": page.breadcrumb || page.h1,
            "item": canonicalUrl
          }
        ]
      };
      const breadcrumbStr = JSON.stringify(breadcrumbData, null, 2);
      JSON.parse(breadcrumbStr);

      const faqData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": (page.faqs || []).map((faq) => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.a
          }
        }))
      };
      const faqStr = JSON.stringify(faqData, null, 2);
      JSON.parse(faqStr);

      const extraJsonLd = `<script type="application/ld+json">\n${breadcrumbStr}\n</script>\n<script type="application/ld+json">\n${faqStr}\n</script>\n`;
      html = html.replace('</head>', () => `${extraJsonLd}</head>`);

      // Ensure all content is visible in prerendered HTML (no inline opacity:0)
      html = html.replace(/style="([^"]*?)opacity\s*:\s*0\s*;?\s*([^"]*?)"/gi, (match, p1, p2) => {
        const rest = (p1 + p2).replace(/;\s*;/g, ';').trim().replace(/^;|;$/g, '');
        return rest ? `style="${rest}"` : '';
      });
    }

    // Write output file
    if (url === '/') {
      writeFileSync(resolve(distDir, 'index.html'), html, 'utf-8');
    } else {
      const outDir = resolve(distDir, url.replace(/^\//, ''));
      mkdirSync(outDir, { recursive: true });
      writeFileSync(resolve(outDir, 'index.html'), html, 'utf-8');
    }

    const size = Buffer.byteLength(html, 'utf-8');
    console.log(`  ✅  Written: dist${url === '/' ? '/index.html' : url + '/index.html'} (${(size / 1024).toFixed(1)} kB)`);
  }

  // Try fetching published blog posts to include in the generated static sitemap
  let publishedBlogUrls = [];
  try {
    const env = loadEnv('production', clientRoot, 'VITE_');
    const rawUrl = (process.env.VITE_API_URL || env.VITE_API_URL || '').trim();
    if (rawUrl) {
      const base = rawUrl.replace(/\/+$/, '');
      const blogRes = await fetch(`${base}/api/blog?limit=100`, { signal: AbortSignal.timeout(5000) });
      if (blogRes.ok) {
        const blogData = await blogRes.json();
        if (blogData && Array.isArray(blogData.posts)) {
          publishedBlogUrls = blogData.posts.map(p => `/blog/${p.slug}`);
          console.log(`  📰  Found ${publishedBlogUrls.length} published blog posts for sitemap.`);
        }
      }
    }
  } catch (err) {
    // Graceful fallback to static routes
  }

  // Generate dist/sitemap.xml listing public indexable pages only (NOT /thank-you),
  // absolute https://www.devencowork.com URLs, <lastmod> = today's date (YYYY-MM-DD).
  const today = new Date().toISOString().split('T')[0];
  const sitemapUrls = ['/', '/events', '/about', '/blog', ...contentRoutes, ...publishedBlogUrls];
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map((u) => `  <url>
    <loc>${SITE.url}${u === '/' ? '/' : u}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u === '/' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${u === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>\n`;

  writeFileSync(resolve(distDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  console.log(`  ✅  Written: dist/sitemap.xml (${sitemapUrls.length} URLs, today: ${today})`);

  console.log('\n🎉  Prerendering complete.\n');
}

main().catch((err) => {
  console.error('❌  Prerender failed:', err);
  process.exit(1);
});
