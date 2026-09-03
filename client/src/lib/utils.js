import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getMediaUrl(val) {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && val !== null) return val.url || '';
  return '';
}

export function getAbsoluteMediaUrl(val, fallback = '/favicon.svg') {
  let url = getMediaUrl(val);
  if (!url) url = fallback;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://www.devencowork.com';
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function updateFavicon(faviconUrl) {
  if (!faviconUrl) return;
  let linkFavicon = document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
  if (!linkFavicon) {
    linkFavicon = document.createElement('link');
    linkFavicon.setAttribute('rel', 'icon');
    document.head.appendChild(linkFavicon);
  }
  if (linkFavicon.getAttribute('href') !== faviconUrl) {
    linkFavicon.setAttribute('href', faviconUrl);
  }
}
