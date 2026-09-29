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

import { build } from 'vite';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const clientRoot = resolve(__dirname, '..');
const distDir    = resolve(clientRoot, 'dist');

// Routes to prerender.  Admin routes are excluded (private pages).
const routes = ['/', '/thank-you'];

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
