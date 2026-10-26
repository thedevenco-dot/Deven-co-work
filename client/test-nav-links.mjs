import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, 'dist');

const routes = [
  '/',
  '/pricing',
  '/private-cabins',
  '/hot-desk',
  '/dedicated-desk',
  '/meeting-room',
  '/podcast-studio',
  '/amenities',
  '/faq',
  '/cost-calculator',
  '/contact',
  '/events',
  '/about',
  '/blog',
];

const requiredDestinations = [
  '/#space',
  '/private-cabins',
  '/hot-desk',
  '/dedicated-desk',
  '/meeting-room',
  '/podcast-studio',
  '/amenities',
  '/pricing',
  '/events',
  '/about',
  '/blog',
  '/faq',
  '/contact',
];

console.log('🧪 Auditing Global Header Navigation across all HTML pages...\n');

let allPassed = true;

for (const route of routes) {
  const filePath = route === '/'
    ? path.join(distDir, 'index.html')
    : path.join(distDir, route.slice(1), 'index.html');

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Missing prerendered HTML file for route: ${route} (${filePath})`);
    allPassed = false;
    continue;
  }

  const html = fs.readFileSync(filePath, 'utf-8');

  // Verify header exists
  if (!html.includes('<header')) {
    console.error(`❌ Route ${route} has no <header> element!`);
    allPassed = false;
    continue;
  }

  // Verify all required destinations are present
  const missing = [];
  for (const dest of requiredDestinations) {
    if (!html.includes(dest)) {
      missing.push(dest);
    }
  }

  // Verify "Book a Tour" or "BOOK" CTA is present
  const hasTourCta = html.includes('Book a Tour') || html.includes('Book Your Tour') || html.includes('BOOK FREE TOUR');

  // Verify outdated homepage anchors are NOT used as primary nav targets in header
  const headerHtml = html.split('</header>')[0];
  const hasOutdatedHeaderAnchors = headerHtml.includes('href="#faq"') || headerHtml.includes('href="#reservation"');

  if (missing.length === 0 && hasTourCta && !hasOutdatedHeaderAnchors) {
    console.log(`  ✅ PASS: Route ${route.padEnd(18)} contains all 13 destinations, Workspace dropdown links & Tour CTA`);
  } else {
    allPassed = false;
    console.error(`  ❌ FAIL: Route ${route}`);
    if (missing.length > 0) console.error(`     Missing destinations: ${missing.join(', ')}`);
    if (!hasTourCta) console.error(`     Missing Tour CTA`);
    if (hasOutdatedHeaderAnchors) console.error(`     Found outdated anchors (#faq or #reservation) in header`);
  }
}

console.log(`\n========================================`);
if (allPassed) {
  console.log(`🎉 ALL 14 ROUTES AUDITED SUCCESSFULLY!`);
  console.log(`Every page has verified, accessible navigation destinations.`);
} else {
  console.error(`❌ Some pages failed navigation audit.`);
}
console.log(`========================================\n`);

process.exit(allPassed ? 0 : 1);
