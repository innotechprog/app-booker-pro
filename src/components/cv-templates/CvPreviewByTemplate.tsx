import React from "react";
import type { CvPreviewData } from "./types";
import { CV_EDITOR_PREVIEW_ZOOM, CV_FONT_SCALE_MAX, CV_FONT_SCALE_MIN } from "./types";
import {
  PROFESSIONAL_CANVAS,
  CvLinkTrackingContext,
  CvOnlineQrHeader,
  buildPersonalDetailsSection,
  normalizeEmail,
  normalizeText,
  normalizeOptionalText,
} from "./shared";
import { getCvTemplateComponent } from "./registry";

export function CvPreviewByTemplate({
  templateId,
  data,
  compact,
  livePreview,
  onLinkClick,
}: {
  templateId: number;
  data: CvPreviewData;
  compact?: boolean;
  /** Smaller type in the editor side panel only */
  livePreview?: boolean;
  onLinkClick?: (url: string) => void;
}) {
  const Component = getCvTemplateComponent(templateId);
  const hasQr = !compact && !!data.cvOnlineUrl;
  const userFontScale = compact ? 1 : Math.min(CV_FONT_SCALE_MAX, Math.max(CV_FONT_SCALE_MIN, data.cvFontScale ?? 1));
  const panelZoom = livePreview ? CV_EDITOR_PREVIEW_ZOOM : 1;
  const fontScale = userFontScale * panelZoom;
  const personalDetailsSection = buildPersonalDetailsSection(data.personal);
  const existingSections = data.customSections ?? [];
  const hasPersonalDetailsSection = existingSections.some((s) => s.id === "personal-details-auto");
  const templateData: CvPreviewData = {
    ...data,
    personal: {
      ...data.personal,
      fullName: normalizeText(data.personal.fullName),
      email: normalizeEmail(data.personal.email),
      phone: normalizeText(data.personal.phone),
      currentLocation: normalizeText(data.personal.currentLocation),
      jobTitle: normalizeText(data.personal.jobTitle),
      linkedinUrl: normalizeText(data.personal.linkedinUrl),
      website: normalizeText(data.personal.website),
      dateOfBirth: normalizeText(data.personal.dateOfBirth),
      gender: normalizeText(data.personal.gender),
      nationality: normalizeText(data.personal.nationality),
    },
    overview: normalizeText(data.overview),
    workExperience:
      (data.workExperience?.length ?? 0) > 0
        ? data.workExperience.map((w) => ({
            ...w,
            company: normalizeOptionalText(w.company),
            jobTitle: normalizeOptionalText(w.jobTitle),
            startDate: normalizeOptionalText(w.startDate),
            endDate: normalizeOptionalText(w.endDate),
            description: normalizeOptionalText(w.description),
          }))
        : [
            {
              jobTitle: "Entry-Level Candidate",
              company: "Open to internships and junior roles",
              startDate: "",
              endDate: "",
              description:
                "Brings strong foundational skills, practical coursework/projects, and a growth mindset. Ready to contribute quickly while learning in a professional environment.",
            },
          ],
    education:
      (data.education?.length ?? 0) > 0
        ? data.education.map((e) => ({
            ...e,
            institution: normalizeOptionalText(e.institution),
            qualification: normalizeOptionalText(e.qualification),
            startDate: normalizeOptionalText(e.startDate),
            endDate: normalizeOptionalText(e.endDate),
          }))
        : [
            {
              qualification: "Relevant coursework and self-directed learning",
              institution: "Academic / Online Learning",
              startDate: "",
              endDate: "",
            },
          ],
    certifications: data.certifications.map((c) => ({
      ...c,
      name: normalizeText(c.name || ""),
      issuer: normalizeOptionalText(c.issuer),
      date: normalizeOptionalText(c.date),
    })),
    keySkills:
      (data.keySkills?.length ?? 0) > 0
        ? data.keySkills.map((s) => ({
            ...s,
            name: normalizeText(s.name || ""),
            level: normalizeOptionalText(s.level),
          }))
        : [
            { name: "Communication", level: "Strong" },
            { name: "Problem Solving", level: "Strong" },
            { name: "Team Collaboration", level: "Strong" },
            { name: "Adaptability", level: "Strong" },
          ],
    customSections:
      (personalDetailsSection && !hasPersonalDetailsSection
        ? [...existingSections, personalDetailsSection]
        : existingSections).map((s) => ({
        ...s,
        title: normalizeText(s.title),
        content: normalizeText(s.content),
      })),
  };
  const content = (
    <div className={`${PROFESSIONAL_CANVAS} w-full max-w-full min-w-0 box-border`}>
      <CvLinkTrackingContext.Provider value={onLinkClick ?? null}>
        {hasQr ? (
          <div className="overflow-hidden bg-white">
            <CvOnlineQrHeader url={data.cvOnlineUrl!} />
            <Component data={templateData} />
          </div>
        ) : (
          <Component data={templateData} />
        )}
      </CvLinkTrackingContext.Provider>
    </div>
  );
  const scaled = fontScale !== 1 ? (
    <div className="cv-preview-font-scale origin-top" style={{ zoom: fontScale }}>
      {content}
    </div>
  ) : content;
  if (compact) {
    return (
      <div className="cv-preview-compact h-full max-h-[373px] overflow-hidden text-[8px] [&_h1]:!text-[10px] [&_h2]:!text-[7px] [&_p]:!text-[8px] [&_li]:!text-[8px] [&_span]:!text-[8px] [&_.cv-t1-name]:!text-[10px] [&_.cv-t1-section]:!text-[7px] [&_.cv-t1-body]:!text-[8px] leading-[1.2] [&_*]:!leading-[1.2] [&_.p-5]:!p-2 [&_.p-4]:!p-2 [&_.px-5]:!px-2 [&_.px-7]:!px-2 [&_.pt-7]:!pt-2 [&_.pb-7]:!pb-2 [&_.pb-5]:!pb-2">
        {content}
      </div>
    );
  }
  return scaled;
}
