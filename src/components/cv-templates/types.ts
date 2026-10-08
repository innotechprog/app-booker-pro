import type { WorkExperienceItem, EducationItem, CertificationItem, SkillItem } from "@/features/smartApply/pages/SmartApplyProfilePage";
import type { FC } from "react";

/** Body text baseline for px presets (12px ≈ zoom 1). */
export const CV_FONT_BASELINE_PX = 12;
export const CV_FONT_SCALE_MIN = 10 / CV_FONT_BASELINE_PX;
export const CV_FONT_SCALE_MAX = 14 / CV_FONT_BASELINE_PX;
/** Presets: approximate body size at 10 / 12 / 14px via CSS zoom */
export const CV_FONT_SCALE_OPTIONS = [
  { label: "10px", value: CV_FONT_SCALE_MIN },
  { label: "12px", value: 1 },
  { label: "14px", value: CV_FONT_SCALE_MAX },
] as const;

/** CSS zoom for the CV editor live preview panel (PDF / public CV stay at 1). */
export const CV_EDITOR_PREVIEW_ZOOM = 0.68;

export interface CustomSection {
  id: string;
  title: string;
  content: string;
}

export interface CvPreviewData {
  personal: {
    fullName: string;
    email: string;
    phone: string;
    currentLocation: string;
    jobTitle: string;
    linkedinUrl: string;
    website: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
    /** Data URL (base64) of profile picture. Shown on CV when showProfilePictureOnCv is true. */
    profilePictureUrl?: string;
    /** Whether to show profile picture on CV. Default false (show initials). */
    showProfilePictureOnCv?: boolean;
  };
  overview: string;
  workExperience: WorkExperienceItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  keySkills: SkillItem[];
  /** Accent color for CV (headers, sidebars, etc.). Default #1e3a5f */
  accentColor?: string;
  /** Scales all CV text/layout proportionally. 1 ≈ 12px baseline. */
  cvFontScale?: number;
  /** Custom sections (Projects, Languages, etc.) – available for paid templates 6–20 */
  customSections?: CustomSection[];
  /** URL for online CV – when set, a QR code is shown on the CV */
  cvOnlineUrl?: string;
}

export type CvTemplateComponent = FC<{ data: CvPreviewData }>;
