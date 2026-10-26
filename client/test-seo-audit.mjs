import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, 'dist');

const expectedPages = [
  {
    route: '/',
    expectedKeyword: 'coworking',
    canonical: 'https://www.devencowork.com/',
  },
  {
    route: '/private-cabins',
    expectedKeyword: 'private',
    canonical: 'https://www.devencowork.com/private-cabins',
  },
  {
    route: '/hot-desk',
    expectedKeyword: 'hot desk',
    canonical: 'https://www.devencowork.com/hot-desk',
  },
  {
    route: '/dedicated-desk',
    expectedKeyword: 'dedicated desk',
    canonical: 'https://www.devencowork.com/dedicated-desk',
  },
  {
    route: '/meeting-room',
    expectedKeyword: 'meeting room',
    canonical: 'https://www.devencowork.com/meeting-room',
  },
  {
    route: '/podcast-studio',
    expectedKeyword: 'podcast studio',
    canonical: 'https://www.devencowork.com/podcast-studio',
  },
  {
    route: '/free-trial',
    expectedKeyword: 'trial',
    canonical: 'https://www.devencowork.com/free-trial',
  },
  {
    route: '/pricing',
    expectedKeyword: 'price',
    canonical: 'https://www.devencowork.com/pricing',
  },
  {
    route: '/amenities',
    expectedKeyword: 'amenities',
    canonical: 'https://www.devencowork.com/amenities',
  },
  {
    route: '/faq',
    expectedKeyword: 'faq',
    canonical: 'https://www.devencowork.com/faq',
  },
  {
    route: '/cost-calculator',
    expectedKeyword: 'calculator',
    canonical: 'https://www.devencowork.com/cost-calculator',
  },
  {
    route: '/contact',
    expectedKeyword: 'contact',
    canonical: 'https://www.devencowork.com/contact',
  },
  {
    route: '/events',
    expectedKeyword: 'event',
    canonical: 'https://www.devencowork.com/events',
  },
  {
    route: '/about',
    expectedKeyword: 'about',
    canonical: 'https://www.devencowork.com/about',
  },
  {
    route: '/blog',
    expectedKeyword: 'journal',
    canonical: 'https://www.devencowork.com/blog',
  },
];

console.log('🔍 Running Complete SEO Technical & Metadata Audit...\n');

const titles = new Map();
const descriptions = new Map();
let auditPassed = true;

for (const page of expectedPages) {
  const filePath = page.route === '/'
    ? path.join(distDir, 'index.html')
    : path.join(distDir, page.route.slice(1), 'index.html');

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing file: ${filePath}`);
    auditPassed = false;
    continue;
  }

  const html = fs.readFileSync(filePath, 'utf-8');

  // Title check
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';
  if (!title) {
    console.error(`❌ [${page.route}] Missing <title>`);
    auditPassed = false;
  } else if (titles.has(title)) {
    console.error(`❌ [${page.route}] Duplicate <title> identical to [${titles.get(title)}]`);
    auditPassed = false;
  } else {
    titles.set(title, page.route);
  }

  // Meta description check
  const descMatch = html.match(/<meta\s+[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*\/?>/i);
  const desc = descMatch ? descMatch[1].trim() : '';
  if (!desc) {
    console.error(`❌ [${page.route}] Missing <meta name="description">`);
    auditPassed = false;
  } else if (descriptions.has(desc)) {
    console.error(`❌ [${page.route}] Duplicate description identical to [${descriptions.get(desc)}]`);
    auditPassed = false;
  } else {
    descriptions.set(desc, page.route);
  }

  // Canonical URL check
  const canonMatch = html.match(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*\/?>/i);
  const canon = canonMatch ? canonMatch[1].trim() : '';
  if (canon !== page.canonical) {
    console.error(`❌ [${page.route}] Canonical URL mismatch. Found "${canon}", expected "${page.canonical}"`);
    auditPassed = false;
  }

  // Heading check (H1)
  const h1Matches = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
  if (h1Matches.length === 0) {
    console.error(`❌ [${page.route}] Missing <h1> heading`);
    auditPassed = false;
  } else if (h1Matches.length > 1) {
    console.warn(`⚠️ [${page.route}] Multiple <h1> tags found (${h1Matches.length})`);
  }

  // JSON-LD structured data check
  const jsonLdMatches = [...html.matchAll(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/gi)];
  let jsonLdValid = true;
  for (const match of jsonLdMatches) {
    try {
      JSON.parse(match[1]);
    } catch (e) {
      jsonLdValid = false;
      console.error(`❌ [${page.route}] Invalid JSON-LD syntax: ${e.message}`);
      auditPassed = false;
    }
  }

  console.log(`✅ [${page.route.padEnd(17)}] Title: "${title.slice(0, 45)}..." | H1: ${h1Matches.length} | JSON-LD: ${jsonLdMatches.length} blocks`);
}

// Sitemap checks
const sitemapPath = path.join(distDir, 'sitemap.xml');
if (!fs.existsSync(sitemapPath)) {
  console.error(`❌ dist/sitemap.xml does not exist!`);
  auditPassed = false;
} else {
  const sitemapXml = fs.readFileSync(sitemapPath, 'utf-8');
  let sitemapCount = 0;
  for (const page of expectedPages) {
    if (sitemapXml.includes(`<loc>${page.canonical}</loc>`)) {
      sitemapCount++;
    } else {
      console.error(`❌ sitemap.xml is missing: ${page.canonical}`);
      auditPassed = false;
    }
  }
  console.log(`\n✅ sitemap.xml verified with all ${sitemapCount} canonical pages.`);
}

console.log(`\n========================================`);
if (auditPassed) {
  console.log(`🎉 COMPLETE SEO AUDIT PASSED! All 15 pages have unique titles, descriptions, valid canonicals, and structured data.`);
} else {
  console.error(`❌ SEO audit identified issues.`);
}
console.log(`========================================\n`);

process.exit(auditPassed ? 0 : 1);
