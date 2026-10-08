import { useLayoutEffect, useRef, type ReactNode } from "react";

/**
 * Shrinks the CV preview to the card width when content would overflow (uses zoom so page layout stays consistent).
 */
export function CvPreviewScaler({ children }: { children: ReactNode }) {
  const shellRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const shell = shellRef.current;
    const inner = innerRef.current;
    if (!shell || !inner) return;

    const update = () => {
      const shellW = shell.clientWidth;
      if (shellW < 1) return;
      inner.style.zoom = "1";
      const contentW = inner.scrollWidth;
      const z = contentW > shellW + 1 ? Math.max(0.55, shellW / contentW) : 1;
      inner.style.zoom = z === 1 ? "1" : String(z);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(shell);
    ro.observe(inner);
    const mo = new MutationObserver(update);
    mo.observe(inner, { subtree: true, childList: true, characterData: true, attributes: true });
    return () => {
      ro.disconnect();
      mo.disconnect();
      inner.style.zoom = "1";
    };
  }, [children]);

  return (
    <div ref={shellRef} className="w-full min-w-0 max-w-full">
      <div ref={innerRef} className="w-full min-w-0 max-w-full">
        {children}
      </div>
    </div>
  );
}
