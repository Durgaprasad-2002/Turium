const TARGET_CHUNK_SIZE = 950;
const OVERLAP_SIZE = 180;

export function chunkText(text: string): string[] {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const chunks: string[] = [];
  let cursor = 0;

  while (cursor < normalized.length) {
    let end = Math.min(cursor + TARGET_CHUNK_SIZE, normalized.length);
    if (end < normalized.length) {
      const boundary = Math.max(
        normalized.lastIndexOf(". ", end),
        normalized.lastIndexOf("! ", end),
        normalized.lastIndexOf("? ", end),
        normalized.lastIndexOf(" ", end),
      );
      if (boundary > cursor + Math.floor(TARGET_CHUNK_SIZE * 0.55))
        end = boundary + 1;
    }

    const chunk = normalized.slice(cursor, end).trim();
    if (chunk) chunks.push(chunk);
    if (end === normalized.length) break;
    cursor = Math.max(end - OVERLAP_SIZE, cursor + 1);
  }

  return chunks;
}
