import { marked } from 'marked';

/**
 * Configure marked options for GitHub Flavored Markdown (GFM)
 * Supports tables, strikethrough, autolinks, lists, etc.
 */
marked.setOptions({
  gfm: true,
  breaks: false, // Double line break for paragraphs per standard Markdown
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
      // Remove any immediately following blank lines
      while (lines[i] !== undefined && lines[i].trim() === '') {
        lines.splice(i, 1);
      }
      return lines.join('\n');
    }
    break; // Only check the very first non-empty line
  }

  return content;
}

/**
 * Auto-structure plain text or raw ChatGPT-copied text into clean Markdown.
 * Detects standalone headings, numbered sections (e.g. "1. Location and Accessibility"),
 * FAQ questions, comparison tables, and bullet lists without breaking existing formatting.
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
    const prevTrimmed = i > 0 ? lines[i - 1].trim() : '';
    const nextTrimmed = i < lines.length - 1 ? lines[i + 1].trim() : '';

    // Check if this line is an isolated standalone block (empty line before and after, or start/end of text)
    const isStandalone = trimmed.length > 0 && prevTrimmed === '' && (nextTrimmed === '' || i === lines.length - 1);

    // If it's already markdown syntax, preserve it
    const isAlreadyMarkdown =
      trimmed.startsWith('#') ||
      trimmed.startsWith('>') ||
      trimmed.startsWith('|') ||
      trimmed.startsWith('- ') ||
      trimmed.startsWith('* ') ||
      trimmed.startsWith('+ ') ||
      trimmed.startsWith('```') ||
      trimmed.startsWith('[') ||
      trimmed.startsWith('!');

    if (isStandalone && !isAlreadyMarkdown) {
      // 1. FAQ Section Header
      if (/^(frequently asked questions|faqs?)$/i.test(trimmed)) {
        inFaq = true;
        result.push(`## ${trimmed}`);
        continue;
      }

      // 2. Conclusion / Final Thoughts Section
      if (/^(final thoughts|conclusion|summary|wrapping up|next steps)$/i.test(trimmed)) {
        inFaq = false;
        result.push(`## ${trimmed}`);
        continue;
      }

      // 3. Do not convert sentences ending with ':' or ',' or '.' to headings (these are lead-ins)
      if (!trimmed.endsWith(':') && !trimmed.endsWith(',') && !trimmed.endsWith(';')) {
        // A. Numbered Section Heading like "1. Location and Accessibility"
        if (/^[0-9]+\.\s+[A-Z]/.test(trimmed) && trimmed.length < 80 && !trimmed.endsWith('.')) {
          result.push(`### ${trimmed}`);
          continue;
        }

        // B. FAQ numbered question like "1. Which is the best coworking space in Raipur?"
        if (/^[0-9]+\.\s+/.test(trimmed) && (inFaq || trimmed.endsWith('?')) && trimmed.length < 120) {
          result.push(`### ${trimmed}`);
          continue;
        }

        // C. Standalone question ending in '?'
        if (trimmed.endsWith('?') && trimmed.length < 100) {
          result.push(`## ${trimmed}`);
          continue;
        }

        // D. Section starters like "9 Things to Check...", "Why Choose...", "How to Compare..."
        if (/^([0-9]+\s+[A-Za-z]|why|what|how|where|when|who)\b/i.test(trimmed) && trimmed.length < 90 && !trimmed.endsWith('.')) {
          result.push(`## ${trimmed}`);
          continue;
        }

        // E. Short Title Case lines (e.g. "What Is a Coworking Space", "Workspace Options")
        if (trimmed.length < 60 && !trimmed.endsWith('.')) {
          const words = trimmed.split(/\s+/).filter(Boolean);
          if (words.length >= 2 && words.length <= 10) {
            const capitalizedWords = words.filter(w => /^[A-Z0-9]/.test(w)).length;
            if (capitalizedWords / words.length >= 0.6) {
              result.push(`## ${trimmed}`);
              continue;
            }
          }
        }
      }
    }

    result.push(line);
  }

  return result.join('\n');
}

/**
 * Sanitize HTML markup to prevent XSS attacks while preserving
 * standard editorial formatting tags, tables, links, images, and attributes.
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

  // 5. Strip javascript: or vbscript: or data: in href and src (except data:image/)
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
  // If already wrapped, don't double wrap
  let wrapped = html.replace(/(<div[^>]*class="[^"]*article-table-wrapper[^"]*"[^>]*>)?\s*(<table[\s\S]*?<\/table>)\s*(<\/div>)?/gi, (match, openDiv, table, closeDiv) => {
    return `<div class="article-table-wrapper">${table}</div>`;
  });
  return wrapped;
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

  // Sanitize markup
  return sanitizeArticleHtml(withTableWrappers);
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
