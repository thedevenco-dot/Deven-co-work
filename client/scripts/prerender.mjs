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

// Routes to prerender.  Admin routes are excluded (private pages).
const routes = ['/', '/thank-you'];

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

function updateHeadFromCms(html, cmsData) {
  const updatedItems = [];

  // Favicon
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

  console.log('\n🎉  Prerendering complete.\n');
}

main().catch((err) => {
  console.error('❌  Prerender failed:', err);
  process.exit(1);
});
