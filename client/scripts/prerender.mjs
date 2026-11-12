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
 * - Prerenders all static pages, all content pages, the /blog listing,
 *   and every individual published blog post with semantic HTML and
 *   structured data.
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

// Base routes to prerender. Admin routes are private.
const baseRoutes = ['/', '/thank-you', '/events', '/about', '/blog'];

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

function formatPageTitle(rawTitle) {
  const trimmed = (rawTitle || '').trim();
  if (!trimmed) return 'Deven Co-Work';
  if (/[-|•]\s*Deven Co-Work\s*$/i.test(trimmed)) {
    return trimmed;
  }
  return `${trimmed} | Deven Co-Work`;
}

function setCanonical(html, canonicalUrl) {
  const canonicalTag = `<link rel="canonical" href="${escAttr(canonicalUrl)}" />`;
  const canonicalRegex = /<link\s+[^>]*rel=["']canonical["'][^>]*\/?>/gi;
  let replaced = false;
  html = html.replace(canonicalRegex, () => {
    if (!replaced) {
      replaced = true;
      return canonicalTag;
    }
    return '';
  });
  if (!replaced) {
    html = html.replace('</head>', () => `${canonicalTag}\n</head>`);
  }
  return html;
}

function setMetaName(html, name, content) {
  const tag = `<meta name="${escAttr(name)}" content="${escAttr(content)}" />`;
  const regex = new RegExp(`<meta\\s+[^>]*name=["']${name}["'][^>]*\\/?>`, 'i');
  if (regex.test(html)) {
    return html.replace(regex, () => tag);
  }
  return html.replace('</head>', () => `${tag}\n</head>`);
}

function setMetaProperty(html, property, content) {
  const tag = `<meta property="${escAttr(property)}" content="${escAttr(content)}" />`;
  const regex = new RegExp(`<meta\\s+[^>]*property=["']${property}["'][^>]*\\/?>`, 'i');
  if (regex.test(html)) {
    return html.replace(regex, () => tag);
  }
  return html.replace('</head>', () => `${tag}\n</head>`);
}

function updateHeadFromCms(html, cmsData) {
  const updatedItems = [];

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
    html = setMetaName(html, 'description', descVal);
    updatedItems.push('description');
  }

  // Open Graph / Twitter
  const seo = cmsData.seo || {};

  const ogTitleVal = (typeof seo.ogTitle === 'string' && seo.ogTitle.trim())
    || (typeof seo.title === 'string' && seo.title.trim())
    || '';
  if (ogTitleVal) {
    html = setMetaProperty(html, 'og:title', ogTitleVal);
    updatedItems.push('og:title');
  }

  const ogDescVal = (typeof seo.ogDescription === 'string' && seo.ogDescription.trim())
    || (typeof seo.description === 'string' && seo.description.trim())
    || '';
  if (ogDescVal) {
    html = setMetaProperty(html, 'og:description', ogDescVal);
    updatedItems.push('og:description');
  }

  const twitterTitleVal = (typeof seo.twitterTitle === 'string' && seo.twitterTitle.trim())
    || ogTitleVal
    || '';
  if (twitterTitleVal) {
    html = setMetaName(html, 'twitter:title', twitterTitleVal);
    updatedItems.push('twitter:title');
  }

  const twitterDescVal = (typeof seo.twitterDescription === 'string' && seo.twitterDescription.trim())
    || ogDescVal
    || '';
  if (twitterDescVal) {
    html = setMetaName(html, 'twitter:description', twitterDescVal);
    updatedItems.push('twitter:description');
  }

  // Share image
  const ogImg = absUrl(mediaUrl(seo.ogImage)) || absUrl(mediaUrl(cmsData.globalSettings?.ogImage));
  if (ogImg) {
    html = setMetaProperty(html, 'og:image', ogImg);
    html = setMetaName(html, 'twitter:image', ogImg);
    updatedItems.push('og:image');
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

async function fetchPublishedBlogData(root) {
  const cachePath = resolve(root, 'src', 'content', 'blog-cache.json');
  let cached = null;
  if (existsSync(cachePath)) {
    try {
      cached = JSON.parse(readFileSync(cachePath, 'utf-8'));
    } catch (e) {
      console.warn('⚠️  Error reading blog-cache.json:', e.message);
    }
  }

  try {
    const env = loadEnv('production', root, 'VITE_');
    const rawUrl = (process.env.VITE_API_URL || env.VITE_API_URL || '').trim();
    if (!rawUrl) {
      console.warn('⚠️  No VITE_API_URL found for blog data. Using cache.');
      return cached || { categories: [], posts: [], featuredPost: null, articles: [] };
    }
    const base = rawUrl.replace(/\/+$/, '');
    console.log(`📡  Fetching published blog posts from ${base}/api/blog (60s timeout)…`);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60000);

    let postsRes, catsRes;
    try {
      [postsRes, catsRes] = await Promise.all([
        fetch(`${base}/api/blog?limit=100`, { signal: controller.signal }),
        fetch(`${base}/api/blog/categories`, { signal: controller.signal }),
      ]);
    } finally {
      clearTimeout(timer);
    }

    if (!postsRes.ok) {
      console.warn(`⚠️  Blog posts fetch failed (HTTP ${postsRes.status}). Using cache if available.`);
      return cached || { categories: [], posts: [], featuredPost: null, articles: [] };
    }

    const postsJson = await postsRes.json();
    const catsJson = catsRes.ok ? await catsRes.json() : { data: [] };

    const rawPosts = Array.isArray(postsJson.posts) ? postsJson.posts : [];
    // Ensure only published posts are included
    const posts = rawPosts.filter(p => p && p.status === 'published' && p.slug);
    const categories = Array.isArray(catsJson.data) ? catsJson.data : [];
    const featuredPost = postsJson.featuredPost || (posts.length > 0 ? posts[0] : null);

    console.log(`  📰  Found ${posts.length} published blog posts from API.`);

    // Fetch full article content for each post in parallel (with timeout)
    const articles = [];
    const articlePromises = posts.map(async (p) => {
      try {
        const artRes = await fetch(`${base}/api/blog/${p.slug}`, { signal: AbortSignal.timeout(30000) });
        if (artRes.ok) {
          const artJson = await artRes.json();
          if (artJson && artJson.success && artJson.data) {
            articles.push({
              post: artJson.data,
              relatedPosts: artJson.relatedPosts || []
            });
            return;
          }
        }
      } catch (err) {
        console.warn(`⚠️  Failed to fetch full article body for ${p.slug}: ${err.message}`);
      }
      // If individual fetch failed, check cache
      if (cached && Array.isArray(cached.articles)) {
        const found = cached.articles.find(a => a.post && a.post.slug === p.slug);
        if (found) {
          articles.push(found);
          return;
        }
      }
      // Fallback: use listing post data
      articles.push({ post: p, relatedPosts: [] });
    });

    await Promise.all(articlePromises);

    const freshData = {
      fetchedAt: new Date().toISOString(),
      categories,
      featuredPost,
      posts,
      articles,
    };

    // Update local cache file
    try {
      writeFileSync(cachePath, JSON.stringify(freshData, null, 2), 'utf-8');
      console.log(`  💾  Blog cache updated at ${cachePath}`);
    } catch (e) {
      console.warn('⚠️  Could not write blog cache:', e.message);
    }

    return freshData;
  } catch (err) {
    console.warn(`⚠️  Blog fetch error: ${err.message}. Using cache if available.`);
    return cached || { categories: [], posts: [], featuredPost: null, articles: [] };
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
  const shimPath = resolve(clientRoot, 'src', 'ssr-shim.js');
  if (existsSync(shimPath)) {
    await import(pathToFileURL(shimPath).href);
  }

  // pathToFileURL is required on Windows: bare C:\... paths are not valid ESM URLs
  const { render } = await import(pathToFileURL(ssrBundlePath).href);

  // Dynamic import of SEO content pages
  const pagesModulePath = resolve(clientRoot, 'src', 'content', 'pages.js');
  const { PAGE_ORDER, PAGES, SITE } = await import(pathToFileURL(pagesModulePath).href);

  // Fetch CMS data and Blog Data before setting up routes
  const [cmsData, blogData] = await Promise.all([
    fetchPublishedContent(clientRoot),
    fetchPublishedBlogData(clientRoot),
  ]);

  if (cmsData) {
    globalThis.__SSR_CMS_DATA__ = cmsData;
  }

  const publishedPosts = (blogData && Array.isArray(blogData.posts)) ? blogData.posts : [];
  const articlesMap = new Map();
  if (blogData && Array.isArray(blogData.articles)) {
    for (const item of blogData.articles) {
      if (item && item.post && item.post.slug) {
        articlesMap.set(item.post.slug, item);
      }
    }
  }

  console.log(`\n📚  Articles available for static prerendering: ${articlesMap.size}`);

  // Compile full list of routes to prerender
  const contentRoutes = PAGE_ORDER.map(slug => PAGES[slug].path);
  const blogRoutes = publishedPosts.map(p => `/blog/${p.slug}`);
  const routes = [...baseRoutes, ...contentRoutes, ...blogRoutes];

  // ── 4. Render each route ──────────────────────────────────────────────────
  for (const url of routes) {
    console.log(`  🖊  Prerendering ${url}`);

    // Set appropriate SSR global context for the specific route
    if (url === '/blog') {
      globalThis.__SSR_BLOG_DATA__ = {
        posts: publishedPosts,
        featuredPost: blogData?.featuredPost || null,
        categories: blogData?.categories || [],
      };
    } else if (url.startsWith('/blog/')) {
      const slug = url.replace(/^\/blog\//, '').trim();
      const articleEntry = articlesMap.get(slug);
      if (articleEntry) {
        globalThis.__SSR_BLOG_POST__ = articleEntry;
      } else {
        globalThis.__SSR_BLOG_POST__ = null;
      }
    }

    let appHtml = '';
    try {
      appHtml = render(url);
    } catch (err) {
      console.warn(`  ⚠️  renderToString error for ${url}: ${err.message}`);
      console.warn('      Falling back to static fallback content in #root.');
    }

    // Inject server-rendered HTML into the #root div
    let html = template;
    if (appHtml) {
      const OPEN_TAG = '<div id="root">';
      const openIdx  = template.indexOf(OPEN_TAG);
      if (openIdx !== -1) {
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
        html = template.slice(0, openIdx + OPEN_TAG.length)
          + appHtml
          + template.slice(i);
      }
    }

    // ── Route-Specific Metadata & Scripts ───────────────────────────────────

    // 1. Home route '/'
    if (url === '/' && cmsData) {
      const scriptTag = `<script>window.__INITIAL_CMS_DATA__=${escapeJsonForScript(JSON.stringify(cmsData))};</script>`;
      html = html.replace('</head>', () => `${scriptTag}\n</head>`);

      try {
        html = updateHeadFromCms(html, cmsData);
      } catch (err) {
        console.warn(`  ⚠️  Failed to rewrite head tags from CMS: ${err.message}`);
      }

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
        const faqScriptTag = `<script type="application/ld+json">\n${faqStr}\n</script>\n`;
        html = html.replace('</head>', () => `${faqScriptTag}</head>`);
      }
    }

    // 2. '/thank-you' route
    if (url === '/thank-you') {
      html = setMetaName(html, 'robots', 'noindex, nofollow');
      html = setTag(html, /<title>[\s\S]*?<\/title>/i, '<title>Thank You | Deven Co-Work</title>');
      html = setCanonical(html, 'https://www.devencowork.com/thank-you');
      html = setMetaProperty(html, 'og:title', 'Thank You | Deven Co-Work');
      html = setMetaName(html, 'twitter:title', 'Thank You | Deven Co-Work');
    }

    // 3. '/events' route
    if (url === '/events') {
      const canonicalUrl = `${SITE.url}/events`;
      const title = 'Startup Events in Raipur | Founder Meetups & Workshops | Deven Co-Work';
      const desc = 'Discover upcoming startup events in Raipur at Deven Co-Work, Shankar Nagar. Connect at founder meetups, networking sessions, AI workshops, and community masterclasses.';

      html = setTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${escAttr(title)}</title>`);
      html = setMetaName(html, 'description', desc);
      html = setCanonical(html, canonicalUrl);
      html = setMetaProperty(html, 'og:title', title);
      html = setMetaProperty(html, 'og:description', desc);
      html = setMetaProperty(html, 'og:url', canonicalUrl);
      html = setMetaName(html, 'twitter:title', title);
      html = setMetaName(html, 'twitter:description', desc);

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

    // 4. '/about' route
    if (url === '/about') {
      const canonicalUrl = `${SITE.url}/about`;
      const title = 'About Deven Co-Work — Raipur\'s Founder & Startup Workspace';
      const desc = 'Learn about Deven Co-Work in Shankar Nagar, Raipur. Founded to provide ambitious founders, creators, and teams with world-class workspace infrastructure.';

      html = setTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${escAttr(title)}</title>`);
      html = setMetaName(html, 'description', desc);
      html = setCanonical(html, canonicalUrl);
      html = setMetaProperty(html, 'og:title', title);
      html = setMetaProperty(html, 'og:description', desc);
      html = setMetaProperty(html, 'og:url', canonicalUrl);
      html = setMetaName(html, 'twitter:title', title);
      html = setMetaName(html, 'twitter:description', desc);

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

    // 5. '/blog' listing route
    if (url === '/blog') {
      const canonicalUrl = `${SITE.url}/blog`;
      const title = 'The Deven Journal — Ideas & Insights for Founders in Raipur | Deven Co-Work';
      const desc = 'Articles, founder stories, productivity playbooks, and business insights from Deven Co-Work, Raipur\'s premier founder community.';

      html = setTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${escAttr(title)}</title>`);
      html = setMetaName(html, 'description', desc);
      html = setCanonical(html, canonicalUrl);
      html = setMetaProperty(html, 'og:title', title);
      html = setMetaProperty(html, 'og:description', desc);
      html = setMetaProperty(html, 'og:url', canonicalUrl);
      html = setMetaName(html, 'twitter:title', title);
      html = setMetaName(html, 'twitter:description', desc);

      // Inject initial blog data for immediate zero-flash hydration
      const blogInitScript = `<script>window.__INITIAL_BLOG_DATA__=${escapeJsonForScript(JSON.stringify({
        posts: publishedPosts,
        featuredPost: blogData?.featuredPost || null,
        categories: blogData?.categories || [],
      }))};</script>`;
      html = html.replace('</head>', () => `${blogInitScript}\n</head>`);

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

    // 6. Individual Blog Post routes: '/blog/:slug'
    if (url.startsWith('/blog/')) {
      const slug = url.replace(/^\/blog\//, '').trim();
      const articleEntry = articlesMap.get(slug);

      if (articleEntry && articleEntry.post) {
        const post = articleEntry.post;
        const related = articleEntry.relatedPosts || [];

        const canonicalUrl = `${SITE.url}/blog/${post.slug}`;
        const title = formatPageTitle(post.seoTitle || post.title);
        const desc = post.seoDescription || post.excerpt;

        // Resolve cover / social image
        const rawCover = post.socialImage || post.coverImage;
        const coverImg = absUrl(mediaUrl(rawCover)) || 'https://www.devencowork.com/favicon.png';

        // ── Unique Metadata & Canonical ───────────────────────────────────────
        html = setTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${escAttr(title)}</title>`);
        html = setMetaName(html, 'description', desc);
        html = setCanonical(html, canonicalUrl);
        html = setMetaName(html, 'robots', 'index, follow');

        html = setMetaProperty(html, 'og:title', title);
        html = setMetaProperty(html, 'og:description', desc);
        html = setMetaProperty(html, 'og:url', canonicalUrl);
        html = setMetaProperty(html, 'og:type', 'article');
        html = setMetaProperty(html, 'og:image', coverImg);

        html = setMetaName(html, 'twitter:card', 'summary_large_image');
        html = setMetaName(html, 'twitter:title', title);
        html = setMetaName(html, 'twitter:description', desc);
        html = setMetaName(html, 'twitter:image', coverImg);

        // ── Structured Data: BreadcrumbList ───────────────────────────────────
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
              "name": "Blog",
              "item": "https://www.devencowork.com/blog"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": post.title,
              "item": canonicalUrl
            }
          ]
        };

        // ── Structured Data: BlogPosting Schema ───────────────────────────────
        const blogPostingData = {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "description": desc,
          "image": coverImg ? [coverImg] : undefined,
          "author": {
            "@type": "Person",
            "name": post.author || "Deven Co-Work Team"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Deven Co-Work",
            "url": "https://www.devencowork.com",
            "logo": {
              "@type": "ImageObject",
              "url": "https://res.cloudinary.com/cyxow5rb/image/upload/v1790711830/deven_cowork/hupv1daduww9ykgc6t52.png"
            }
          },
          "datePublished": post.publishedAt || post.createdAt,
          "dateModified": post.updatedAt || post.publishedAt || post.createdAt,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonicalUrl
          }
        };

        // Validate JSON-LD
        JSON.parse(JSON.stringify(breadcrumbData));
        JSON.parse(JSON.stringify(blogPostingData));

        const structuredDataScript = `<script type="application/ld+json">\n${JSON.stringify(breadcrumbData, null, 2)}\n</script>\n<script type="application/ld+json">\n${JSON.stringify(blogPostingData, null, 2)}\n</script>\n`;
        html = html.replace('</head>', () => `${structuredDataScript}</head>`);

        // Inject initial article payload for client hydration
        const articleInitScript = `<script>window.__INITIAL_BLOG_POST__=${escapeJsonForScript(JSON.stringify(post))};window.__INITIAL_BLOG_RELATED_POSTS__=${escapeJsonForScript(JSON.stringify(related))};</script>`;
        html = html.replace('</head>', () => `${articleInitScript}\n</head>`);
      }
    }

    // 7. SEO content page routes (/private-cabins, /hot-desk, etc.)
    const contentSlug = PAGE_ORDER.find(s => PAGES[s].path === url);
    if (contentSlug) {
      const page = PAGES[contentSlug];
      const canonicalUrl = `${SITE.url}${page.path}`;

      if (cmsData) {
        const scriptTag = `<script>window.__INITIAL_CMS_DATA__=${escapeJsonForScript(JSON.stringify(cmsData))};</script>`;
        html = html.replace('</head>', () => `${scriptTag}</head>`);
      }

      html = setTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${escAttr(page.title)}</title>`);
      html = setMetaName(html, 'description', page.description);
      html = setCanonical(html, canonicalUrl);
      html = setMetaProperty(html, 'og:title', page.title);
      html = setMetaProperty(html, 'og:description', page.description);
      html = setMetaProperty(html, 'og:url', canonicalUrl);
      html = setMetaName(html, 'twitter:title', page.title);
      html = setMetaName(html, 'twitter:description', page.description);

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

      const extraJsonLd = `<script type="application/ld+json">\n${JSON.stringify(breadcrumbData, null, 2)}\n</script>\n<script type="application/ld+json">\n${JSON.stringify(faqData, null, 2)}\n</script>\n`;
      html = html.replace('</head>', () => `${extraJsonLd}</head>`);
    }

    // Ensure all content is visible in prerendered HTML (no inline opacity:0)
    html = html.replace(/style="([^"]*?)opacity\s*:\s*0\s*;?\s*([^"]*?)"/gi, (match, p1, p2) => {
      const rest = (p1 + p2).replace(/;\s*;/g, ';').trim().replace(/^;|;$/g, '');
      return rest ? `style="${rest}"` : '';
    });

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

  // ── 5. Generate Redirect Stubs for Previous Slugs ──────────────────────────
  for (const item of articlesMap.values()) {
    const post = item?.post;
    if (post && Array.isArray(post.previousSlugs) && post.previousSlugs.length > 0) {
      for (const oldSlug of post.previousSlugs) {
        if (!oldSlug || oldSlug === post.slug) continue;
        const redirectDir = resolve(distDir, 'blog', oldSlug);
        mkdirSync(redirectDir, { recursive: true });
        const targetUrl = `https://www.devencowork.com/blog/${post.slug}`;
        const redirectHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Redirecting to ${escAttr(post.title)}...</title>
  <meta http-equiv="refresh" content="0; url=${escAttr(targetUrl)}">
  <link rel="canonical" href="${escAttr(targetUrl)}">
  <meta name="robots" content="noindex, follow">
</head>
<body>
  <p>Redirecting to <a href="${escAttr(targetUrl)}">${escAttr(targetUrl)}</a>...</p>
</body>
</html>\n`;
        writeFileSync(resolve(redirectDir, 'index.html'), redirectHtml, 'utf-8');
        console.log(`  🔀  Written redirect: dist/blog/${oldSlug}/index.html -> /blog/${post.slug}`);
      }
    }
  }

  // ── 6. Prerender 404 Page ──────────────────────────────────────────────────
  try {
    let notFoundAppHtml = '';
    try {
      notFoundAppHtml = render('/404');
    } catch (e) {
      console.warn('⚠️  Could not render /404 component:', e.message);
    }
    let notFoundHtml = template;
    if (notFoundAppHtml) {
      const OPEN_TAG = '<div id="root">';
      const openIdx = template.indexOf(OPEN_TAG);
      if (openIdx !== -1) {
        notFoundHtml = template.replace(OPEN_TAG, `${OPEN_TAG}${notFoundAppHtml}`);
      }
    }
    notFoundHtml = setTag(notFoundHtml, /<title>[\s\S]*?<\/title>/i, '<title>404 Page Not Found | Deven Co-Work</title>');
    notFoundHtml = setMetaName(notFoundHtml, 'robots', 'noindex, nofollow');
    writeFileSync(resolve(distDir, '404.html'), notFoundHtml, 'utf-8');
    console.log('  ✅  Written: dist/404.html');
  } catch (err) {
    console.warn('⚠️  Could not generate 404.html:', err.message);
  }

  // ── 7. Generate Production Sitemap ─────────────────────────────────────────
  // Includes all public indexable static pages and every published BlogPost.
  // Excludes /thank-you (noindex), private admin pages, draft articles, and redirects.
  const today = new Date().toISOString().split('T')[0];

  const staticSitemapEntries = [
    { loc: 'https://www.devencowork.com/', lastmod: today, changefreq: 'weekly', priority: '1.0' },
    { loc: 'https://www.devencowork.com/events', lastmod: today, changefreq: 'monthly', priority: '0.8' },
    { loc: 'https://www.devencowork.com/about', lastmod: today, changefreq: 'monthly', priority: '0.8' },
    { loc: 'https://www.devencowork.com/blog', lastmod: today, changefreq: 'weekly', priority: '0.8' },
    ...contentRoutes.map((path) => ({
      loc: `https://www.devencowork.com${path}`,
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.8',
    })),
  ];

  const blogSitemapEntries = publishedPosts.map((p) => {
    const rawDate = p.updatedAt || p.publishedAt || today;
    const formattedDate = typeof rawDate === 'string'
      ? rawDate.split('T')[0]
      : new Date(rawDate).toISOString().split('T')[0];
    return {
      loc: `https://www.devencowork.com/blog/${p.slug}`,
      lastmod: formattedDate,
      changefreq: 'weekly',
      priority: '0.7',
    };
  });

  const allSitemapEntries = [...staticSitemapEntries, ...blogSitemapEntries];
  const seenLocs = new Set();
  const dedupedEntries = [];
  for (const entry of allSitemapEntries) {
    if (!seenLocs.has(entry.loc)) {
      seenLocs.add(entry.loc);
      dedupedEntries.push(entry);
    }
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${dedupedEntries.map((e) => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n')}
</urlset>\n`;

  writeFileSync(resolve(distDir, 'sitemap.xml'), sitemapXml, 'utf-8');
  writeFileSync(resolve(clientRoot, 'public', 'sitemap.xml'), sitemapXml, 'utf-8');
  console.log(`  ✅  Written: dist/sitemap.xml & client/public/sitemap.xml (${dedupedEntries.length} URLs, ${blogSitemapEntries.length} blog posts)`);

  console.log('\n🎉  Prerendering complete.\n');
}

main().catch((err) => {
  console.error('❌  Prerender failed:', err);
  process.exit(1);
});
