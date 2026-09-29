/**
 * src/ssr-shim.js
 *
 * Patches React.useSyncExternalStore so that calls without a
 * getServerSnapshot argument (like wouter's memoryLocation) don't throw
 * during renderToString.
 *
 * This module must be IMPORTED FIRST before react-dom/server is ever used.
 * It uses createRequire so it works in both ESM and CJS contexts.
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// resolve the exact React instance that will be used by the SSR bundle
const React = require('react');

const _orig = React.useSyncExternalStore;
if (typeof _orig === 'function') {
  React.useSyncExternalStore = function patchedUSES(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  ) {
    return _orig.call(this, subscribe, getSnapshot, getServerSnapshot ?? getSnapshot);
  };
}
