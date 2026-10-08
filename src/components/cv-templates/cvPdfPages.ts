import { jsPDF } from "jspdf";
import { computeCuts, effectivePageSliceForWidth, type CvBlock } from "./cvPageBreaks";

export type CvPagePiece = {
  sy: number;
  sh: number;
  sx: number;
  sw: number;
  dx: number;
  dy: number;
  dh: number;
  background: string;
};

export type CvPageLayout = {
  width: number;
  height: number;
  pieces: CvPagePiece[];
};

export type CvPageCaptureFn = (
  viewport: HTMLElement,
  width: number,
  height: number
) => Promise<HTMLCanvasElement>;

function relBox(el: HTMLElement, origin: DOMRect) {
  const rect = el.getBoundingClientRect();
  return {
    top: rect.top - origin.top,
    bottom: rect.bottom - origin.top,
    left: rect.left - origin.left,
    right: rect.right - origin.left,
  };
}

function measureTotalHeight(root: HTMLElement): number {
  return Math.max(root.scrollHeight, root.offsetHeight, root.getBoundingClientRect().height);
}

function collectBlocks(scope: ParentNode, origin: DOMRect): CvBlock[] {
  const blocks: CvBlock[] = [];
  scope.querySelectorAll("[data-cv-block], [data-cv-heading]").forEach((node) => {
    const el = node as HTMLElement;
    const parentBlock = el.parentElement?.closest("[data-cv-block]");
    if (parentBlock && parentBlock !== el) return;
    const box = relBox(el, origin);
    if (box.bottom - box.top < 6 || box.right - box.left < 8) return;
    blocks.push({
      top: box.top,
      bottom: box.bottom,
      heading: el.hasAttribute("data-cv-heading"),
    });
  });
  return blocks;
}

function layoutSingle(width: number, total: number, pageSlice: number, blocks: CvBlock[]): CvPageLayout[] {
  const cuts = computeCuts(total, pageSlice, blocks);

  const pages: CvPageLayout[] = [];
  for (let i = 0; i < cuts.length - 1; i += 1) {
    const start = cuts[i];
    const end = cuts[i + 1];
    const sh = Math.max(0, end - start);
    if (sh < 1 && i > 0) continue;
    pages.push({
      width,
      height: sh,
      pieces: [
        {
          sx: 0,
          sy: start,
          sw: width,
          sh,
          dx: 0,
          dy: 0,
          dh: sh,
          background: "#ffffff",
        },
      ],
    });
  }
  return pages;
}

function roundPages(pages: CvPageLayout[]): CvPageLayout[] {
  return pages.map((page) => ({
    width: Math.round(page.width),
    height: Math.round(page.height),
    pieces: page.pieces.map((piece) => {
      const sy = Math.floor(piece.sy);
      const sx = Math.floor(piece.sx);
      const sh = Math.max(1, Math.ceil(piece.sy + piece.sh) - sy);
      const sw = Math.max(1, Math.ceil(piece.sx + piece.sw) - sx);
      return {
        ...piece,
        sx,
        sy,
        sw,
        sh,
        dx: Math.floor(piece.dx),
        dy: Math.floor(piece.dy),
        dh: sh,
      };
    }),
  }));
}

/** Vertical strip for one PDF/preview page (full CV width). */
export function pageVerticalStrip(page: CvPageLayout): { sy: number; sh: number } {
  if (page.pieces.length === 0) return { sy: 0, sh: page.height };
  const sy = Math.min(...page.pieces.map((p) => p.sy));
  const bottom = Math.max(...page.pieces.map((p) => p.sy + p.sh));
  return { sy, sh: Math.max(1, bottom - sy) };
}

/** Split a laid-out CV element into A4 pages, breaking on section and item boundaries. */
export function layoutCvPages(root: HTMLElement): CvPageLayout[] {
  const origin = root.getBoundingClientRect();
  const width = origin.width;
  const total = measureTotalHeight(root);
  if (width < 8 || total < 8) return [];

  const pageSlice = effectivePageSliceForWidth(width);
  if (total <= pageSlice + 1) {
    return roundPages([
      {
        width,
        height: total,
        pieces: [
          {
            sx: 0,
            sy: 0,
            sw: width,
            sh: total,
            dx: 0,
            dy: 0,
            dh: total,
            background: "#ffffff",
          },
        ],
      },
    ]);
  }

  // Full-width strips — same break position for main column and sidebar (Template 2).
  return roundPages(layoutSingle(width, total, pageSlice, collectBlocks(root, origin)));
}

/**
 * Capture each page in its own viewport (no slicing a single tall canvas).
 * Matches what you see in the multi-page preview and avoids clipped lines.
 */
export async function captureCvToPdf(
  mount: HTMLElement,
  pdf: jsPDF,
  captureViewport: CvPageCaptureFn,
  margin = 24
): Promise<void> {
  const pages = layoutCvPages(mount);
  const parent = mount.parentElement;
  if (!parent) throw new Error("CV mount has no parent");

  const width = Math.round(mount.getBoundingClientRect().width) || 794;
  const pageList =
    pages.length > 0
      ? pages
      : [
          {
            width,
            height: measureTotalHeight(mount),
            pieces: [],
          } as CvPageLayout,
        ];

  const viewport = document.createElement("div");
  viewport.setAttribute("data-cv-page-viewport", "1");
  viewport.style.width = `${width}px`;
  viewport.style.overflow = "hidden";
  viewport.style.background = "#ffffff";
  viewport.style.position = "relative";

  parent.insertBefore(viewport, mount);
  viewport.appendChild(mount);

  const pageWidthPt = pdf.internal.pageSize.getWidth();
  const pageHeightPt = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidthPt - margin * 2;
  const maxImgHeight = pageHeightPt - margin * 2;

  try {
    for (let index = 0; index < pageList.length; index += 1) {
      const strip =
        pageList[index].pieces.length > 0
          ? pageVerticalStrip(pageList[index])
          : { sy: 0, sh: pageList[index].height };

      viewport.style.height = `${strip.sh}px`;
      mount.style.marginTop = `${-strip.sy}px`;

      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

      const canvas = await captureViewport(viewport, width, strip.sh);
      const imgHeight = Math.min(maxImgHeight, (canvas.height * imgWidth) / Math.max(1, canvas.width));

      if (index > 0) pdf.addPage();
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", margin, margin, imgWidth, imgHeight);
    }
  } finally {
    mount.style.marginTop = "";
    parent.insertBefore(mount, viewport);
    viewport.remove();
  }
}

/** @deprecated Use captureCvToPdf — kept for callers that already have one tall canvas. */
export function addCvElementToPdf(pdf: jsPDF, canvas: HTMLCanvasElement, root: HTMLElement, margin = 24): void {
  const pages = layoutCvPages(root);
  const origin = root.getBoundingClientRect();
  const scaleX = canvas.width / Math.max(1, origin.width);
  const scaleY = canvas.height / Math.max(1, measureTotalHeight(root));
  const pageWidth = pdf.internal.pageSize.getWidth();
  const imgWidth = pageWidth - margin * 2;
  const maxImgHeight = pdf.internal.pageSize.getHeight() - margin * 2;

  const painted =
    pages.length > 0
      ? pages
      : [
          {
            width: origin.width,
            height: measureTotalHeight(root),
            pieces: [
              {
                sx: 0,
                sy: 0,
                sw: origin.width,
                sh: measureTotalHeight(root),
                dx: 0,
                dy: 0,
                dh: measureTotalHeight(root),
                background: "#ffffff",
              },
            ],
          },
        ];

  painted.forEach((page, index) => {
    const { sy, sh } = pageVerticalStrip(page);
    if (index > 0) pdf.addPage();
    const slice = document.createElement("canvas");
    slice.width = Math.max(1, Math.round(page.width * scaleX));
    slice.height = Math.max(1, Math.round(sh * scaleY));
    const ctx = slice.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, slice.width, slice.height);
    ctx.drawImage(
      canvas,
      0,
      sy * scaleY,
      page.width * scaleX,
      sh * scaleY,
      0,
      0,
      slice.width,
      slice.height
    );
    const imgHeight = Math.min(maxImgHeight, (slice.height * imgWidth) / slice.width);
    pdf.addImage(slice.toDataURL("image/jpeg", 0.92), "JPEG", margin, margin, imgWidth, imgHeight);
  });
}
