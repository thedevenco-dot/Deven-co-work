import { marked } from 'marked';

marked.setOptions({
  gfm: true,
  breaks: false,
});

function removeLeadingTitle(content, articleTitle) {
  if (!content || !articleTitle) return content;
  const cleanTitle = articleTitle.trim().toLowerCase();

  const htmlTitleMatch = content.match(/^\s*<h[12][^>]*>([\s\S]*?)<\/h[12]>/i);
  if (htmlTitleMatch) {
    const headingText = htmlTitleMatch[1].replace(/<[^>]*>/g, '').trim().toLowerCase();
    if (headingText === cleanTitle) {
      return content.replace(/^\s*<h[12][^>]*>[\s\S]*?<\/h[12]>\s*/i, '');
    }
  }

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

export function autoStructureArticle(text, articleTitle = '') {
  if (typeof text !== 'string') return '';
  if (!text.trim()) return '';

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

    const isStandalone = trimmed.length > 0 && prevTrimmed === '' && (nextTrimmed === '' || i === lines.length - 1);

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
      if (/^(frequently asked questions|faqs?)$/i.test(trimmed)) {
        inFaq = true;
        result.push(`## ${trimmed}`);
        continue;
      }

      if (/^(final thoughts|conclusion|summary|wrapping up|next steps)$/i.test(trimmed)) {
        inFaq = false;
        result.push(`## ${trimmed}`);
        continue;
      }

      if (!trimmed.endsWith(':') && !trimmed.endsWith(',') && !trimmed.endsWith(';')) {
        if (/^[0-9]+\.\s+[A-Z]/.test(trimmed) && trimmed.length < 80 && !trimmed.endsWith('.')) {
          result.push(`### ${trimmed}`);
          continue;
        }

        if (/^[0-9]+\.\s+/.test(trimmed) && (inFaq || trimmed.endsWith('?')) && trimmed.length < 120) {
          result.push(`### ${trimmed}`);
          continue;
        }

        if (trimmed.endsWith('?') && trimmed.length < 100) {
          result.push(`## ${trimmed}`);
          continue;
        }

        if (/^([0-9]+\s+[A-Za-z]|why|what|how|where|when|who)\b/i.test(trimmed) && trimmed.length < 90 && !trimmed.endsWith('.')) {
          result.push(`## ${trimmed}`);
          continue;
        }

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

export function sanitizeArticleHtml(rawHtml) {
  if (typeof rawHtml !== 'string') return '';
  if (!rawHtml.trim()) return '';

  let sanitized = rawHtml;

  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  sanitized = sanitized.replace(/<(object|embed|applet|iframe)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '');
  sanitized = sanitized.replace(/\s*on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  sanitized = sanitized.replace(/href\s*=\s*(?:"(?:javascript|vbscript):[^"]*"|'(?:javascript|vbscript):[^']*')/gi, 'href="#"');
  sanitized = sanitized.replace(/src\s*=\s*(?:"(?:javascript|vbscript):[^"]*"|'(?:javascript|vbscript):[^']*')/gi, '');

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

function wrapTables(html) {
  if (!html || !html.includes('<table')) return html;
  return html.replace(/(<div[^>]*class="[^"]*article-table-wrapper[^"]*"[^>]*>)?\s*(<table[\s\S]*?<\/table>)\s*(<\/div>)?/gi, (match, openDiv, table, closeDiv) => {
    return `<div class="article-table-wrapper">${table}</div>`;
  });
}

export function renderArticleContent(content, articleTitle = '', format = 'auto') {
  if (typeof content !== 'string') return '';
  if (!content.trim()) return '';

  const hasBlockHtml = /<\/(p|h[1-6]|div|ul|ol|table|blockquote)>/i.test(content) || /<(h[1-6]|table|ul|ol|p)\b/i.test(content);
  const isHtml = format === 'html' || (format === 'auto' && hasBlockHtml);

  let rawHtml = '';

  if (isHtml) {
    rawHtml = removeLeadingTitle(content, articleTitle);
  } else {
    const structuredMarkdown = autoStructureArticle(content, articleTitle);
    rawHtml = marked.parse(structuredMarkdown, { gfm: true, breaks: false });
  }

  const withTableWrappers = wrapTables(rawHtml);
  return sanitizeArticleHtml(withTableWrappers);
}

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

export function calculateReadingTime(content) {
  if (!content) return 1;
  const stripped = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = stripped ? stripped.split(' ').filter(Boolean).length : 0;
  return Math.max(1, Math.ceil(wordCount / 200));
}
