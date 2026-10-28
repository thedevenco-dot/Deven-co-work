import { marked } from 'marked';

/**
 * Configure marked options for GitHub Flavored Markdown (GFM)
 * Supports tables, strikethrough, autolinks, lists, etc.
 */
marked.setOptions({
  gfm: true,
  breaks: false, // Standard Markdown paragraph behavior (blank line = new paragraph)
});

/**
 * Remove duplicate article title if the content starts with the article's H1 or title
 */
function removeLeadingTitle(content, articleTitle) {
  if (!content || !articleTitle) return content;
  const cleanTitle = articleTitle.trim().toLowerCase();

  // 1. If HTML, check for leading <h1>...</h1> or <h2>...</h2>
  const htmlTitleMatch = content.match(/^\s*<h[12][^>]*>([\s\S]*?)<\/h[12]>/i);
  if (htmlTitleMatch) {
    const headingText = htmlTitleMatch[1].replace(/<[^>]*>/g, '').trim().toLowerCase();
    if (headingText === cleanTitle) {
      return content.replace(/^\s*<h[12][^>]*>[\s\S]*?<\/h[12]>\s*/i, '');
    }
  }

  // 2. If Markdown/Text, check first 1-3 lines
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const lineTrimmed = lines[i].trim();
    if (!lineTrimmed) continue;
    const stripped = lineTrimmed.replace(/^#+\s*/, '').trim().toLowerCase();
    if (stripped === cleanTitle) {
      lines.splice(i, 1);
      while (lines[i] !== undefined && lines[i].trim() === '') {
        lines.splice(i, 1);
      }
      return lines.join('\n');
    }
    break;
  }

  return content;
}

/**
 * Helper to determine if a line represents a heading
 */
function detectHeading(trimmed, inFaq) {
  // Never a heading if it ends with a period, comma, or semicolon
  if (trimmed.endsWith('.') || trimmed.endsWith(',') || trimmed.endsWith(';')) {
    return null;
  }

  // 1. FAQ Section Header
  if (/^(frequently asked questions|faqs?)$/i.test(trimmed)) {
    return { level: 2, text: trimmed, isFaqSection: true };
  }

  // 2. Conclusion / Final Thoughts Section
  if (/^(final thoughts|conclusion|summary|wrapping up|next steps)$/i.test(trimmed)) {
    return { level: 2, text: trimmed, isConclusion: true };
  }

  // 3. Numbered Heading e.g. "1. Location and Accessibility", "18. Small Language Shifts"
  // Format: digit(s) followed by . or ) and a capital letter/quote, short title (< 75 chars)
  const numberedHeadingMatch = trimmed.match(/^([0-9]+)[\.\)]\s+([A-Z"“][^\n]{2,75})$/);
  if (numberedHeadingMatch) {
    const headingBody = numberedHeadingMatch[2];
    if (!headingBody.endsWith('.') && headingBody.length < 75) {
      return { level: 3, text: trimmed };
    }
  }

  // 4. Standalone question ending in '?'
  if (trimmed.endsWith('?') && trimmed.length < 100) {
    return { level: 2, text: trimmed };
  }

  // 5. Section starters like "9 Things to Check...", "Why Choose...", "How to Compare..."
  if (/^([0-9]+\s+[A-Za-z]|why|what|how|where|when|who)\b/i.test(trimmed) && trimmed.length < 90) {
    return { level: 2, text: trimmed };
  }

  // 6. Short Title Case line (< 60 chars)
  if (trimmed.length >= 3 && trimmed.length < 60) {
    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length >= 2 && words.length <= 10) {
      const capitalizedWords = words.filter(w => /^[A-Z0-9]/.test(w)).length;
      if (capitalizedWords / words.length >= 0.6) {
        return { level: 2, text: trimmed };
      }
    }
  }

  return null;
}

/**
 * Auto-structure plain text or raw ChatGPT-copied text into clean Markdown.
 * Detects standalone headings, numbered sections (e.g. "1. Location and Accessibility"),
 * FAQ questions, comparison tables, blockquotes, and bullet lists without breaking existing formatting.
 *
 * @param {string} text - Raw content
 * @param {string} articleTitle - Article title to avoid duplication
 * @returns {string} Structured Markdown
 */
export function autoStructureArticle(text, articleTitle = '') {
  if (typeof text !== 'string') return '';
  if (!text.trim()) return '';

  // If text already has block-level HTML tags, do not alter it
  if (/<\/(p|h[1-6]|div|ul|ol|table|blockquote)>/i.test(text)) {
    return text;
  }

  let cleaned = removeLeadingTitle(text, articleTitle);
  const lines = cleaned.split(/\r?\n/);
  const result = [];
  let inFaq = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      result.push('');
      continue;
    }

    // Preserve existing markdown syntax
    if (
      trimmed.startsWith('#') ||
      trimmed.startsWith('>') ||
      trimmed.startsWith('|') ||
      trimmed.startsWith('- ') ||
      trimmed.startsWith('* ') ||
      trimmed.startsWith('+ ') ||
      trimmed.startsWith('```') ||
      trimmed.startsWith('[') ||
      trimmed.startsWith('!')
    ) {
      result.push(line);
      continue;
    }

    // Callouts / Blockquotes
    // "Important: Confirm the internet speed with the provider."
    // "Note: ...", "Tip: ...", "Warning: ..."
    const calloutMatch = trimmed.match(/^(important|note|tip|warning|pro tip|remember|key takeaway|example):\s*(.+)$/i);
    if (calloutMatch) {
      const label = calloutMatch[1].charAt(0).toUpperCase() + calloutMatch[1].slice(1);
      const rest = calloutMatch[2];
      result.push('');
      result.push(`> **${label}:** ${rest}`);
      result.push('');
      continue;
    }

    // Editorial language shift pattern (e.g. Speak Like a CEO)
    // "Instead of: ..." and "Say: ..."
    const speechMatch = trimmed.match(/^(instead of|say):\s*(.+)$/i);
    if (speechMatch) {
      const label = speechMatch[1].charAt(0).toUpperCase() + speechMatch[1].slice(1).toLowerCase();
      const rest = speechMatch[2];
      result.push('');
      result.push(`**${label}:** ${rest}`);
      result.push('');
      continue;
    }

    // Heading detection
    const heading = detectHeading(trimmed, inFaq);
    if (heading) {
      if (heading.isFaqSection) inFaq = true;
      if (heading.isConclusion) inFaq = false;

      result.push('');
      result.push(`${'#'.repeat(heading.level)} ${heading.text}`);
      result.push('');
      continue;
    }

    // Unicode bullet points (•, –, —)
    if (/^[•–—]\s+/.test(trimmed)) {
      result.push(`- ${trimmed.replace(/^[•–—]\s+/, '')}`);
      continue;
    }

    // Numbered list item (not a heading)
    if (/^[0-9]+[\.\)]\s+/.test(trimmed)) {
      result.push(trimmed);
      continue;
    }

    // Normal paragraph content
    result.push(line);
  }

  // Join lines and normalize excessive blank lines (max 2)
  return result.join('\n').replace(/\n{3,}/g, '\n\n');
}

/**
 * Sanitize HTML markup to prevent XSS attacks while preserving
 * standard editorial formatting tags, tables, links, images, and classes.
 *
 * @param {string} rawHtml
 * @returns {string} Clean, safe HTML
 */
export function sanitizeArticleHtml(rawHtml) {
  if (typeof rawHtml !== 'string') return '';
  if (!rawHtml.trim()) return '';

  let sanitized = rawHtml;

  // 1. Remove script tags and contents
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Remove style tags and contents
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // 3. Remove object, embed, applet, iframe
  sanitized = sanitized.replace(/<(object|embed|applet|iframe)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '');

  // 4. Strip on* event handlers (e.g. onload, onerror, onclick, onmouseover)
  sanitized = sanitized.replace(/\s*on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  // 5. Strip javascript: or vbscript: in href and src
  sanitized = sanitized.replace(/href\s*=\s*(?:"(?:javascript|vbscript):[^"]*"|'(?:javascript|vbscript):[^']*')/gi, 'href="#"');
  sanitized = sanitized.replace(/src\s*=\s*(?:"(?:javascript|vbscript):[^"]*"|'(?:javascript|vbscript):[^']*')/gi, '');

  // 6. Ensure external links have rel="noopener noreferrer" and target="_blank"
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
 * Wrap tables in an overflow container for responsive horizontal scrolling
 */
function wrapTables(html) {
  if (!html || !html.includes('<table')) return html;
  return html.replace(/(<div[^>]*class="[^"]*article-table-wrapper[^"]*"[^>]*>)?\s*(<table[\s\S]*?<\/table>)\s*(<\/div>)?/gi, (match, openDiv, table) => {
    return `<div class="article-table-wrapper">${table}</div>`;
  });
}

/**
 * Apply dedicated editorial drop-cap and intro classes to the introductory paragraph.
 * Only applies if the first paragraph starts with an alphabetic character and has substantial content.
 * Renders normally if unsuitable.
 *
 * @param {string} html
 * @returns {string} HTML with intro and dropcap classes applied when suitable
 */
export function applyEditorialDropcap(html) {
  if (!html || typeof html !== 'string') return html;

  // Search before the first heading
  const firstHeadingIdx = html.search(/<h[1-6]\b/i);
  const searchLimit = firstHeadingIdx !== -1 ? firstHeadingIdx : html.length;
  const beforeHeading = html.slice(0, searchLimit);
  const afterHeading = html.slice(searchLimit);

  // Match the first <p> tag before any heading
  const pMatch = beforeHeading.match(/<p(\s+[^>]*)?>([\s\S]*?)<\/p>/i);
  if (!pMatch) return html;

  const fullTag = pMatch[0];
  const attrs = pMatch[1] || '';
  const innerHtml = pMatch[2];
  const innerText = innerHtml.replace(/<[^>]*>/g, '').trim();

  // Must start with an English letter, not start with quote or digit, and have at least 45 chars
  const isSuitable = /^[A-Za-z]/.test(innerText) && innerText.length >= 45 && !/^["'“‘0-9]/.test(innerText);

  if (!isSuitable) return html;

  let newAttrs = attrs;
  if (/class=["']/i.test(newAttrs)) {
    newAttrs = newAttrs.replace(/class=["']([^"']*)["']/i, (m, c) => `class="${c} article-intro article-dropcap"`);
  } else {
    newAttrs = ` class="article-intro article-dropcap"${newAttrs}`;
  }

  const newP = `<p${newAttrs}>${innerHtml}</p>`;
  const updatedBefore = beforeHeading.replace(fullTag, newP);
  return updatedBefore + afterHeading;
}

/**
 * Complete rendering pipeline:
 * Takes raw content (HTML, Markdown, or Plain Text) and converts it to
 * professional, sanitized editorial HTML ready for frontend rendering.
 *
 * @param {string} content - Raw content from DB or editor
 * @param {string} articleTitle - Article title to prevent duplicate H1
 * @param {'auto'|'markdown'|'html'} [format='auto'] - Content format hint
 * @returns {string} Sanitized editorial HTML
 */
export function renderArticleContent(content, articleTitle = '', format = 'auto') {
  if (typeof content !== 'string') return '';
  if (!content.trim()) return '';

  // Determine if content is HTML
  const hasBlockHtml = /<\/(p|h[1-6]|div|ul|ol|table|blockquote)>/i.test(content) || /<(h[1-6]|table|ul|ol|p)\b/i.test(content);
  const isHtml = format === 'html' || (format === 'auto' && hasBlockHtml);

  let rawHtml = '';

  if (isHtml) {
    // Content is already HTML
    rawHtml = removeLeadingTitle(content, articleTitle);
  } else {
    // Content is Markdown or Plain Text
    const structuredMarkdown = autoStructureArticle(content, articleTitle);
    rawHtml = marked.parse(structuredMarkdown, { gfm: true, breaks: false });
  }

  // Wrap tables for responsive horizontal scrolling
  const withTableWrappers = wrapTables(rawHtml);

  // Apply editorial intro and drop cap styling when suitable
  const withDropCap = applyEditorialDropcap(withTableWrappers);

  // Sanitize markup
  return sanitizeArticleHtml(withDropCap);
}

/**
 * Generate a clean, URL-safe slug from a string.
 */
export function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Estimate reading time in minutes based on word count.
 * Average reading speed: 200 words per minute.
 */
export function calculateReadingTime(content) {
  if (!content) return 1;
  const stripped = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = stripped ? stripped.split(' ').filter(Boolean).length : 0;
  return Math.max(1, Math.ceil(wordCount / 200));
}
