/**
 * HTML Sanitization and Text Utilities for Deven Co-Work CMS
 */

// Allowed HTML tags for article rich text content
const ALLOWED_TAGS = new Set([
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote',
  'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
  'a', 'img', 'br', 'hr', 'code', 'pre', 'span', 'div',
  'figure', 'figcaption', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
]);

// Allowed attributes per tag or globally
const ALLOWED_ATTRS = new Set([
  'href', 'title', 'target', 'rel', 'src', 'alt', 'width', 'height',
  'class', 'id', 'loading'
]);

/**
 * Sanitize an HTML string on the server to prevent XSS attacks while preserving
 * standard editorial formatting.
 *
 * @param {string} rawHtml
 * @returns {string} Clean, safe HTML
 */
export function sanitizeHtml(rawHtml) {
  if (typeof rawHtml !== 'string') return '';
  if (!rawHtml.trim()) return '';

  let sanitized = rawHtml;

  // 1. Remove script tags and contents
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Remove style tags and contents
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // 3. Remove object, embed, applet, iframe (except safe embeds if needed)
  sanitized = sanitized.replace(/<(object|embed|applet)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '');

  // 4. Strip on* event handlers (e.g. onload, onerror, onclick, onmouseover)
  sanitized = sanitized.replace(/\s*on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // 5. Strip javascript: or data: in href and src (except data:image/)
  sanitized = sanitized.replace(/href\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, 'href="#"');
  sanitized = sanitized.replace(/src\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '');

  // 6. Ensure external links have rel="noopener noreferrer"
  sanitized = sanitized.replace(/<a\s+([^>]*?)href=(["']https?:\/\/[^"']+["'])([^>]*?)>/gi, (match, before, href, after) => {
    let combined = `${before} href=${href} ${after}`;
    if (!/rel=/i.test(combined)) {
      combined += ' rel="noopener noreferrer"';
    }
    if (!/target=/i.test(combined)) {
      combined += ' target="_blank"';
    }
    return `<a ${combined.trim()}>`;
  });

  return sanitized.trim();
}

/**
 * Generate a clean, URL-safe slug from a string.
 *
 * @param {string} text
 * @returns {string} URL slug
 */
export function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
}

/**
 * Estimate reading time in minutes based on text/html word count.
 * Average reading speed: 200 words per minute.
 *
 * @param {string} htmlOrText
 * @returns {number} reading time in minutes (minimum 1)
 */
export function calculateReadingTime(htmlOrText) {
  if (!htmlOrText) return 1;
  const stripped = htmlOrText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = stripped ? stripped.split(' ').length : 0;
  return Math.max(1, Math.ceil(wordCount / 200));
}
