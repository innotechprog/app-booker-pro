/** A block the paginator should not slice through when it fits on one page. */
export type CvBlock = { top: number; bottom: number; heading?: boolean };

/**
 * Usable A4 content box after the same 24pt PDF margin used by the exporter,
 * as a height/width ratio. A page of CSS `width` px is this many px tall.
 */
export const A4_CONTENT_RATIO = (841.89 - 48) / (595.28 - 48);

/** Extra vertical inset so breaks sit above the PDF page edge (avoids line clipping). */
export const PAGE_SAFE_MARGIN = 28;

export function pageSliceForWidth(width: number): number {
  return width * A4_CONTENT_RATIO;
}

export function effectivePageSliceForWidth(width: number): number {
  return Math.max(160, pageSliceForWidth(width) - PAGE_SAFE_MARGIN);
}

/**
 * Pick a vertical cut at or before `limit` that does not pass through a block
 * short enough to keep whole. Headings sitting alone at the bottom move to the next page.
 */
export function chooseCut(
  start: number,
  limit: number,
  total: number,
  blocks: CvBlock[],
  pageSlice: number
): number {
  if (limit >= total - 1) return total;

  const unbreakable = blocks.filter((block) => {
    const height = block.bottom - block.top;
    return height > 6 && height <= pageSlice * 0.98;
  });

  const edges = [limit];
  for (const block of unbreakable) {
    if (block.top > start + 2 && block.top <= limit + 0.5) edges.push(block.top);
    if (block.bottom > start + 2 && block.bottom <= limit + 0.5) edges.push(Math.min(block.bottom, limit));
  }
  edges.sort((a, b) => b - a);

  for (const y of edges) {
    if (y <= start + 12) continue;
    const crosses = unbreakable.some((block) => y > block.top + 1.5 && y < block.bottom - 1.5);
    if (crosses) continue;

    const stranded = unbreakable.find(
      (block) =>
        block.heading &&
        block.top > start + 48 &&
        block.bottom <= y + 1 &&
        y - block.bottom < 48 &&
        y - block.bottom >= -1
    );
    if (stranded) return stranded.top;
    return y;
  }

  const crossed = blocks.filter(
    (block) =>
      block.bottom - block.top > 6 &&
      block.bottom - block.top <= pageSlice * 0.98 &&
      limit > block.top + 1.5 &&
      limit < block.bottom - 1.5
  );
  for (const block of crossed) {
    if (block.top >= start + 12) return block.top;
    if (block.bottom <= limit + 6 && block.bottom > start + 8) return block.bottom;
  }

  return limit;
}

/** Inclusive start plus each page end, in the same coordinate space as `blocks`. */
export function computeCuts(total: number, pageSlice: number, blocks: CvBlock[]): number[] {
  if (pageSlice <= 0) return [0, total];
  if (total <= pageSlice + 1) return [0, total];

  const cuts = [0];
  let y = 0;
  let guard = 0;
  while (y < total - 1 && guard < 40) {
    guard += 1;
    const limit = Math.min(total, y + pageSlice);
    let next = chooseCut(y, limit, total, blocks, pageSlice);
    if (next <= y + 0.5) next = Math.min(total, y + pageSlice);
    cuts.push(next);
    y = next;
  }
  return cuts;
}
