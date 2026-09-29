/**
 * entry-server.jsx
 * Server-side render entry used exclusively by scripts/prerender.mjs.
 *
 * The shim below patches wouter's memoryLocation issue:
 * useSyncExternalStore (used by wouter) requires a getServerSnapshot
 * argument in React 18's renderToString, which wouter omits.
 * We patch React's own copy here — same bundle, same instance.
 */

import React from 'react';

// Patch before anything else imports useSyncExternalStore.
const _origUSES = React.useSyncExternalStore;
if (typeof _origUSES === 'function') {
  React.useSyncExternalStore = function patchedUSES(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  ) {
    return _origUSES(subscribe, getSnapshot, getServerSnapshot ?? getSnapshot);
  };
}

import { renderToString } from 'react-dom/server';
import App from './App';

/**
 * Render the React tree for a given URL path.
 * @param {string} url - e.g. '/' or '/thank-you'
 */
export function render(url) {
  return renderToString(
    React.createElement(App, { ssrLocation: url })
  );
}
