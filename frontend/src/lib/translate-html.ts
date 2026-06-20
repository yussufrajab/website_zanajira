/**
 * Strip HTML tags to get plain text for translation.
 */
export function stripHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Wrap translated plain text back into <p> tags for the TipTap editor.
 */
export function wrapInParagraphs(text: string): string {
  if (!text) return "";
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (paragraphs.length === 0) return `<p>${text}</p>`;
  return paragraphs.map((p) => `<p>${p}</p>`).join("");
}
