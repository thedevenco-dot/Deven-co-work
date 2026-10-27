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

export function optimizeImageUrl(url, width) {
  if (typeof url !== 'string') return url;
  const marker = '/image/upload/';
  if (!url.includes('res.cloudinary.com') || !url.includes(marker)) return url;
  if (/\/image\/upload\/[^/]*(f_auto|q_auto|w_\d+)/.test(url)) return url;
  const t = `f_auto,q_auto${width ? `,w_${width},c_limit` : ''}`;
  return url.replace(marker, `${marker}${t}/`);
}

export function optimizeVideoUrl(url) {
  if (typeof url !== 'string') return url;
  const marker = '/video/upload/';
  if (!url.includes('res.cloudinary.com') || !url.includes(marker)) return url;
  if (/\/video\/upload\/[^/]*(q_auto|vc_|w_\d+)/.test(url)) return url;
  return url.replace(marker, `${marker}q_auto:eco,w_960/`);
}

export function getAbsoluteMediaUrl(val, fallback = '/favicon-96x96.png') {
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
  const optimizedUrl = optimizeImageUrl(faviconUrl, 96);
  let linkFavicon = document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
  if (!linkFavicon) {
    linkFavicon = document.createElement('link');
    linkFavicon.setAttribute('rel', 'icon');
    document.head.appendChild(linkFavicon);
  }
  if (linkFavicon.getAttribute('href') !== optimizedUrl) {
    linkFavicon.setAttribute('href', optimizedUrl);
  }
}
