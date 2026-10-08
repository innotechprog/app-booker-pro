import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { layoutCvPages, pageVerticalStrip, type CvPageLayout } from "./cvPdfPages";

function sameLayout(a: CvPageLayout[] | null, b: CvPageLayout[]): boolean {
  if (!a || a.length !== b.length) return false;
  return a.every((page, index) => {
    const other = b[index];
    if (page.width !== other.width || page.height !== other.height || page.pieces.length !== other.pieces.length) {
      return false;
    }
    return page.pieces.every((piece, pieceIndex) => {
      const next = other.pieces[pieceIndex];
      return (
        piece.sx === next.sx &&
        piece.sy === next.sy &&
        piece.sw === next.sw &&
        piece.sh === next.sh &&
        piece.dx === next.dx &&
        piece.dy === next.dy &&
        piece.dh === next.dh
      );
    });
  });
}

/**
 * Shows the CV as separate A4 sheets once it is taller than one page.
 * Each sheet starts on a section or item boundary.
 */
export function CvMultiPagePreview({ children }: { children: ReactNode }) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<CvPageLayout[] | null>(null);

  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const measure = () => {
      const next = layoutCvPages(el);
      setPages((current) => (sameLayout(current, next) ? current : next));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  });

  const multi = !!pages && pages.length > 1;

  return (
    <div className="relative w-full min-w-0 max-w-full">
      <div
        ref={measureRef}
        aria-hidden={multi || undefined}
        className={
          multi
            ? "absolute left-0 top-0 w-full max-w-full min-w-0 invisible pointer-events-none"
            : "w-full max-w-full min-w-0"
        }
      >
        {children}
      </div>
      {multi && pages && (
        <div className="space-y-3 rounded-md bg-slate-200/80 p-2 w-full min-w-0 max-w-full">
          {pages.map((page, index) => {
            const strip = pageVerticalStrip(page);
            return (
            <div key={index} className="w-full min-w-0 max-w-full">
              <div
                className="relative mx-auto overflow-hidden bg-white shadow-md w-full max-w-full min-w-0"
                style={{ height: strip.sh }}
              >
                <div className="absolute inset-x-0 top-0 overflow-hidden min-w-0" style={{ height: strip.sh }}>
                  <div
                    className="absolute left-0 top-0 w-full max-w-full min-w-0 box-border"
                    style={{ marginTop: -strip.sy }}
                  >
                    {children}
                  </div>
                </div>
              </div>
              <p className="mt-1 text-right text-[10px] font-medium text-slate-500">
                Page {index + 1} of {pages.length}
              </p>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
