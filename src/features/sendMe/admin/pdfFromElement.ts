import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/**
 * Renders a DOM node to a multi-page A4 PDF (same approach as Smart Apply CV export).
 */
export async function pdfFromElement(element: HTMLElement, fileName: string): Promise<void> {
  const a4PxWidth = 794;
  const exportHost = document.createElement("div");
  exportHost.style.position = "fixed";
  exportHost.style.left = "-100000px";
  exportHost.style.top = "0";
  exportHost.style.width = `${a4PxWidth}px`;
  exportHost.style.padding = "0";
  exportHost.style.margin = "0";
  exportHost.style.background = "#ffffff";
  exportHost.style.zIndex = "-1";
  exportHost.style.pointerEvents = "none";
  document.body.appendChild(exportHost);

  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = `${a4PxWidth}px`;
  clone.style.maxWidth = "none";
  clone.style.minWidth = "0";
  clone.style.margin = "0";
  clone.style.background = "#ffffff";
  exportHost.appendChild(clone);

  let canvas: HTMLCanvasElement;
  try {
    canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: a4PxWidth,
      scrollX: 0,
      scrollY: 0,
    });
  } finally {
    if (document.body.contains(exportHost)) {
      document.body.removeChild(exportHost);
    }
  }

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 24;
  const imgWidth = pageWidth - margin * 2;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = margin;
  pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
  heightLeft -= pageHeight - margin * 2;

  while (heightLeft > 0) {
    position = margin + (heightLeft - imgHeight);
    pdf.addPage();
    pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
    heightLeft -= pageHeight - margin * 2;
  }

  const safe = fileName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  pdf.save(`${safe || "sendme-document"}.pdf`);
}
