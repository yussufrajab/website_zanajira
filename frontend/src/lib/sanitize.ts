// Server-side HTML sanitization for rich-text bodies stored from the admin.
// Prevents stored XSS reaching the public site via `dangerouslySetInnerHTML`.
import DOMPurify from "isomorphic-dompurify";

export function sanitizeHtml(html: string): string {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "hr", "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "blockquote", "pre", "code",
      "a", "img", "strong", "em", "u", "s", "sub", "sup",
      "table", "thead", "tbody", "tr", "th", "td",
      "span", "div", "figure", "figcaption",
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "target", "rel", "width", "height", "colspan", "rowspan"],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|#|\/)/i,
  });
}