export type TextPart = { type: "text"; value: string } | { type: "link"; value: string; href: string };

const urlPattern = /\bhttps?:\/\/[^\s<>"']+/gi;
const trailingPunctuation = /[.,;:!?)\]}'"]+$/;

export function linkify(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let cursor = 0;

  for (const match of text.matchAll(urlPattern)) {
    const start = match.index ?? 0;
    const raw = match[0];
    const trimmed = raw.replace(trailingPunctuation, "");

    if (start > cursor) parts.push({ type: "text", value: text.slice(cursor, start) });
    parts.push({ type: "link", value: trimmed, href: trimmed });
    cursor = start + trimmed.length;
  }

  if (cursor < text.length) parts.push({ type: "text", value: text.slice(cursor) });
  return parts;
}
