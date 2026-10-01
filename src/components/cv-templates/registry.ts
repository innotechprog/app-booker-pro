import type { FC } from "react";
import type { CvPreviewData } from "./types";
import { Template1 } from "./Template1";
import { Template2 } from "./Template2";
import { Template3 } from "./Template3";
import { Template4 } from "./Template4";
import { Template5 } from "./Template5";

export const CV_TEMPLATE_COUNT = 5;

const TEMPLATES: Record<number, FC<{ data: CvPreviewData }>> = {
  1: Template1,
  2: Template2,
  3: Template3,
  4: Template4,
  5: Template5,
};

export function getCvTemplateComponent(templateId: number): FC<{ data: CvPreviewData }> {
  const id = Math.max(1, Math.min(CV_TEMPLATE_COUNT, templateId));
  return TEMPLATES[id] || Template1;
}
