const DOMPurify = require('isomorphic-dompurify');

const sanitizeHtml = (html) => {
  if (!html) return html;
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'class', 'style', 'rel']
  });
};

module.exports = { sanitizeHtml };
