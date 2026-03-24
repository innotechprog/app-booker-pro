import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import type { WorkExperienceItem, EducationItem, CertificationItem, SkillItem } from "@/features/smartApply/pages/SmartApplyProfilePage";

const ACCENT = "#1e3a5f";

/** Shared "professional paper" style applied to all templates */
const CARD_BASE = "bg-white text-slate-900 overflow-hidden min-h-[280px] rounded-lg border border-slate-300/80 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.55)]";
const PROFESSIONAL_CANVAS =
  "font-sans antialiased [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:leading-tight [&_h1]:text-slate-900 [&_h2]:text-[10px] [&_h2]:font-semibold [&_h2]:uppercase [&_h2]:tracking-[0.16em] [&_h2]:text-slate-700 [&_p]:text-slate-700 [&_p]:leading-relaxed [&_li]:text-slate-700 [&_li]:leading-relaxed [&_.text-gray-900]:!text-slate-900 [&_.text-gray-800]:!text-slate-800 [&_.text-gray-700]:!text-slate-700 [&_.text-gray-600]:!text-slate-600 [&_.text-gray-500]:!text-slate-500 [&_.border-gray-100]:!border-slate-200/70 [&_.border-gray-200]:!border-slate-200 [&_.cv-dark-sidebar_h1]:!text-white [&_.cv-dark-sidebar_h2]:!text-white [&_.cv-dark-sidebar_p]:!text-white/90 [&_.cv-dark-sidebar_li]:!text-white/90 [&_.cv-dark-sidebar_.text-gray-900]:!text-white [&_.cv-dark-sidebar_.text-gray-800]:!text-white/90 [&_.cv-dark-sidebar_.text-gray-700]:!text-white/85 [&_.cv-dark-sidebar_.text-gray-600]:!text-white/80 [&_.cv-dark-sidebar_.text-gray-500]:!text-white/70";

/** Section header – clean uppercase with accent support */
function SectionHeader({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <h2
      className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600 border-b border-slate-200 pb-1.5 mb-2"
      style={accent ? { color: accent, borderColor: accent + "40" } : undefined}
    >
      {children}
    </h2>
  );
}

/** Renders a QR code that links to the online CV. */
function CvQrCode({ url, size = 56, className = "" }: { url: string; size?: number; className?: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!url) return;
    QRCode.toDataURL(url, { width: size, margin: 1, color: { dark: "#000", light: "#fff" } })
      .then(setDataUrl)
      .catch(() => {});
  }, [url, size]);
  if (!dataUrl) return null;
  return (
    <img
      src={dataUrl}
      alt="Scan for online CV"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      title="Scan to view online CV"
    />
  );
}

/** Fixed QR row placed at top so it never overlays CV content. */
function CvOnlineQrHeader({ url }: { url: string }) {
  return (
    <header className="shrink-0 flex items-center justify-between gap-3 px-4 py-2 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Online CV</span>
      <div className="flex items-center gap-2 shrink-0">
        <CvQrCode url={url} size={44} className="rounded border border-slate-200 bg-white p-0.5" />
        <span className="text-[9px] text-slate-500 leading-tight text-right hidden sm:inline">Scan to view</span>
      </div>
    </header>
  );
}

/** Body text baseline for px presets (12px ≈ zoom 1). */
export const CV_FONT_BASELINE_PX = 12;
const CV_FONT_SCALE_MIN = 10 / CV_FONT_BASELINE_PX;
const CV_FONT_SCALE_MAX = 14 / CV_FONT_BASELINE_PX;
/** Presets: approximate body size at 10 / 12 / 14px via CSS zoom */
export const CV_FONT_SCALE_OPTIONS = [
  { label: "10px", value: CV_FONT_SCALE_MIN },
  { label: "12px", value: 1 },
  { label: "14px", value: CV_FONT_SCALE_MAX },
] as const;

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

export interface CustomSection {
  id: string;
  title: string;
  content: string;
}

/** Renders custom sections block for paid templates */
function CustomSectionsBlock({ sections, accent, className = "" }: { sections: CustomSection[]; accent?: string; className?: string }) {
  if (!sections?.length) return null;
  const color = accent || ACCENT;
  return (
    <>
      {sections.map((s) => (
        s.title.trim() || s.content.trim() ? (
          <section key={s.id} className={className}>
            <h2 className="text-[11px] font-semibold uppercase tracking-wider border-b border-gray-200 pb-1 mb-1.5" style={{ color }}>{s.title || "Section"}</h2>
            <p className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">{s.content || "—"}</p>
          </section>
        ) : null
      ))}
    </>
  );
}

function contactLine(p: CvPreviewData["personal"]): string {
  return [p.email, p.phone, p.currentLocation].filter(Boolean).join(" • ");
}

function normalizeEmail(email: string): string {
  if (!email) return "";
  const normalized = (email || "")
    .normalize("NFKC")
    .replace(/[\u0000-\u001F\u007F-\u009F\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180B-\u180E\u2000-\u200F\u2028-\u202F\u205F-\u206F\u3000\u3164\uFE00-\uFE0F\uFEFF\uFFA0]/g, "")
    .replace(/\s+/g, "")
    .trim();

  const [localPart, ...domainParts] = normalized.split("@");
  const cleanLocal = (localPart || "").replace(/[^A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]/g, "");
  const cleanDomain = domainParts
    .join("@")
    .replace(/[^A-Za-z0-9.-]/g, "")
    .replace(/\.{2,}/g, ".")
    .replace(/^-+|-+$/g, "");

  return cleanLocal && cleanDomain ? `${cleanLocal}@${cleanDomain}` : "";
}

function normalizeText(value: string): string {
  return (value || "")
    .replace(/[\u00A0\u200B-\u200D\uFEFF]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeOptionalText(value?: string): string | undefined {
  if (value == null) return undefined;
  const normalized = normalizeText(value);
  return normalized || undefined;
}

function linksLine(p: CvPreviewData["personal"]): string {
  return [p.linkedinUrl, p.website].filter(Boolean).join(" • ");
}

function buildPersonalDetailsSection(personal: CvPreviewData["personal"]): CustomSection | null {
  const lines: string[] = [];
  const dateOfBirth = normalizeText(personal.dateOfBirth);
  const gender = normalizeText(personal.gender);
  const nationality = normalizeText(personal.nationality);
  const linkedinUrl = normalizeText(personal.linkedinUrl);
  const website = normalizeText(personal.website);
  if (dateOfBirth) lines.push(`Date of birth: ${dateOfBirth}`);
  if (gender) lines.push(`Gender: ${gender}`);
  if (nationality) lines.push(`Nationality: ${nationality}`);
  if (linkedinUrl) lines.push(`LinkedIn: ${linkedinUrl}`);
  if (website) lines.push(`Website: ${website}`);
  if (lines.length === 0) return null;
  return {
    id: "personal-details-auto",
    title: "Personal Details",
    content: lines.join("\n"),
  };
}

const CvLinkTrackingContext = React.createContext<((url: string) => void) | null>(null);

/** Renders email as a clickable mailto link when onLinkClick is available */
function EmailLink({ email, className = "text-inherit" }: { email: string; className?: string }) {
  const onLinkClick = React.useContext(CvLinkTrackingContext);
  if (!email) return null;
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) return null;
  return <a href={`mailto:${cleanEmail}`} className={`${className} underline hover:opacity-80`} onClick={() => onLinkClick?.(`mailto:${cleanEmail}`)}>{cleanEmail}</a>;
}

/** Renders phone as a clickable tel link when onLinkClick is available */
function PhoneLink({ phone, className = "text-inherit" }: { phone: string; className?: string }) {
  const onLinkClick = React.useContext(CvLinkTrackingContext);
  if (!phone) return null;
  const cleanPhone = normalizeText(phone);
  if (!cleanPhone) return null;
  return <a href={`tel:${cleanPhone}`} className={`${className} underline hover:opacity-80`} onClick={() => onLinkClick?.(`tel:${cleanPhone}`)}>{cleanPhone}</a>;
}

/** Renders contact + links; links are clickable and optionally tracked */
function ContactLinksContent({ personal }: { personal: CvPreviewData["personal"] }) {
  const onLinkClick = React.useContext(CvLinkTrackingContext);
  const parts: React.ReactNode[] = [];
  const sep = " • ";
  const sep2 = " · ";
  if (personal.email) {
    const cleanEmail = normalizeEmail(personal.email);
    parts.push(<a key="e" href={`mailto:${cleanEmail}`} className="text-inherit underline hover:opacity-80" onClick={() => onLinkClick?.(`mailto:${cleanEmail}`)}>{cleanEmail}</a>);
  }
  if (personal.phone) {
    const cleanPhone = normalizeText(personal.phone);
    parts.push(<a key="p" href={`tel:${cleanPhone}`} className="text-inherit underline hover:opacity-80" onClick={() => onLinkClick?.(`tel:${cleanPhone}`)}>{cleanPhone}</a>);
  }
  if (personal.currentLocation) parts.push(<span key="l">{normalizeText(personal.currentLocation)}</span>);
  const contactParts = parts;
  const linkParts: React.ReactNode[] = [];
  if (personal.linkedinUrl) {
    const href = /^https?:\/\//i.test(personal.linkedinUrl) ? personal.linkedinUrl : `https://${personal.linkedinUrl}`;
    const cleanLinkedin = normalizeText(personal.linkedinUrl);
    linkParts.push(<a key="li" href={href} target="_blank" rel="noopener noreferrer" className="text-inherit underline hover:opacity-80" onClick={() => onLinkClick?.(href)}>{cleanLinkedin}</a>);
  }
  if (personal.website) {
    const href = /^https?:\/\//i.test(personal.website) ? personal.website : `https://${personal.website}`;
    const cleanWebsite = normalizeText(personal.website);
    linkParts.push(<a key="w" href={href} target="_blank" rel="noopener noreferrer" className="text-inherit underline hover:opacity-80" onClick={() => onLinkClick?.(href)}>{cleanWebsite}</a>);
  }
  const hasContact = contactParts.length > 0;
  const hasLinks = linkParts.length > 0;
  if (!hasContact && !hasLinks) return null;
  const contactEl = hasContact ? contactParts.flatMap((p, i) => (i === 0 ? [p] : [sep, p])) : null;
  const linkEl = hasLinks ? linkParts.flatMap((p, i) => (i === 0 ? [p] : [sep, p])) : null;
  return <>{contactEl}{hasContact && hasLinks && sep2}{linkEl}</>;
}

function getInitials(fullName: string): string {
  if (!fullName || !fullName.trim()) return "?";
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0].slice(0, 2) || "?").toUpperCase();
}

/** Shows profile picture when available and enabled, otherwise initials. */
function CvAvatar({ name, profilePictureUrl, showProfilePictureOnCv, accentColor, className = "w-12 h-12", ring = "border-2 border-emerald-500" }: { name: string; profilePictureUrl?: string; showProfilePictureOnCv?: boolean; accentColor?: string; className?: string; ring?: string }) {
  const showImage = !!showProfilePictureOnCv && !!profilePictureUrl;
  const color = accentColor || ACCENT;
  if (showImage) {
    return (
      <img
        src={profilePictureUrl}
        alt=""
        className={`rounded-full object-cover shrink-0 ${ring} ${className}`}
      />
    );
  }
  return (
    <div className={`rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0 ${ring} ${className}`} style={{ backgroundColor: color }}>
      {getInitials(name)}
    </div>
  );
}

/** @deprecated Use CvAvatar with profile picture props. Kept for backward compatibility. */
function AvatarPlaceholder({ name, className = "w-12 h-12", ring = "border-2 border-emerald-500" }: { name: string; className?: string; ring?: string }) {
  return <CvAvatar name={name} className={className} ring={ring} />;
}

/** Split long description text into bullet-friendly lines */
function descriptionToBullets(text: string): string[] {
  const t = text.trim();
  if (!t) return [];
  const byNewline = t.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  if (byNewline.length > 1) return byNewline;
  const bySentence = t.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  if (bySentence.length > 1 && t.length > 80) return bySentence;
  return [t];
}

/** Pick readable foreground for accent backgrounds. */
function getReadableTextColor(bg: string): "#111827" | "#ffffff" {
  const hex = bg.trim();
  const normalized = hex.startsWith("#") ? hex.slice(1) : hex;
  const full = normalized.length === 3
    ? normalized.split("").map((c) => c + c).join("")
    : normalized;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return "#ffffff";
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  // Perceived luminance (sRGB)
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.6 ? "#111827" : "#ffffff";
}

// —— Template 1: Classic One-Column ——
function Template1({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, certifications, keySkills } = data;
  const accent = data.accentColor || ACCENT;
  return (
    <div className={`${CARD_BASE} font-sans antialiased`}>
      <div className="h-1.5 w-16 rounded-br-md" style={{ backgroundColor: accent }} />
      <div className="p-5 pb-4 border-b border-gray-100">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{personal.fullName || "Your name"}</h1>
        {personal.jobTitle && <p className="text-[13px] text-gray-600 mt-1">{personal.jobTitle}</p>}
        {(contactLine(personal) || linksLine(personal)) && (
          <p className="text-[11px] text-gray-500 mt-2 leading-relaxed"><ContactLinksContent personal={personal} /></p>
        )}
      </div>
      <div className="px-5 pb-5 space-y-4 text-sm pt-4">
        {overview && (
          <section>
            <SectionHeader accent={accent}>Professional Summary</SectionHeader>
            <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{overview}</p>
          </section>
        )}
        {workExperience.length > 0 && (
          <section>
            <SectionHeader accent={accent}>Experience</SectionHeader>
            <ul className="space-y-3">
              {workExperience.map((w, i) => {
                const bullets = w.description ? descriptionToBullets(w.description) : [];
                return (
                <li key={i} className="border-l-2 border-gray-100 pl-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-semibold text-gray-900">{w.jobTitle || "Role"}{w.company && ` — ${w.company}`}</span>
                    {(w.startDate || w.endDate) && <span className="text-gray-500 text-xs shrink-0">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>}
                  </div>
                  {bullets.length > 0 && <ul className="mt-1 list-disc list-inside text-gray-700 text-[12px] marker:text-gray-400 space-y-0.5">{bullets.map((line, j) => <li key={j}>{line}</li>)}</ul>}
                </li>
              );})}
            </ul>
          </section>
        )}
        {education.length > 0 && (
          <section>
            <SectionHeader accent={accent}>Education</SectionHeader>
            <ul className="space-y-2">
              {education.map((e, i) => (
                <li key={i} className="flex items-start justify-between gap-3">
                  <span className="font-medium text-gray-900">{e.qualification || "Qualification"}{e.institution && <span className="text-gray-600"> — {e.institution}</span>}</span>
                  {(e.startDate || e.endDate) && <span className="text-gray-500 text-xs shrink-0">{[e.startDate, e.endDate].filter(Boolean).join(" – ")}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}
        {keySkills.length > 0 && (
          <section>
            <SectionHeader accent={accent}>Skills</SectionHeader>
            <div className="flex flex-wrap gap-1.5">{keySkills.map((s, i) => <span key={i} className="px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-[11px]">{s.name}</span>)}</div>
          </section>
        )}
        {certifications.length > 0 && (
          <section>
            <SectionHeader accent={accent}>Certifications</SectionHeader>
            <ul className="space-y-1 text-gray-700">
              {certifications.map((c, i) => (
                <li key={i}>{c.name}{c.issuer && ` (${c.issuer})`}{c.date && ` — ${c.date}`}</li>
              ))}
            </ul>
          </section>
        )}
        <CustomSectionsBlock sections={data.customSections ?? []} accent={accent} className="mt-2" />
      </div>
    </div>
  );
}

// —— Template 2: Clean Lines (thin dividers, uppercase grey headings) ——
function Template2({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, certifications, keySkills } = data;
  const accent = data.accentColor || ACCENT;
  return (
    <div className={`${CARD_BASE} font-sans antialiased`}>
      <div className="h-px w-full" style={{ backgroundColor: accent }} />
      <div className="p-5">
        <h1 className="text-xl font-semibold text-gray-900 tracking-tight">{personal.fullName || "Your name"}</h1>
        {personal.jobTitle && <p className="text-sm text-gray-600">{personal.jobTitle}</p>}
        {(contactLine(personal) || linksLine(personal)) && <p className="text-xs text-gray-500 mt-1"><ContactLinksContent personal={personal} /></p>}
      </div>
      <div className="px-5 pb-5 text-sm">
        {overview && <><SectionHeader accent={accent}>Summary</SectionHeader><p className="whitespace-pre-wrap text-gray-700">{overview}</p></>}
        {workExperience.length > 0 && (
          <><SectionHeader accent={accent}>Experience</SectionHeader>
          <ul className="space-y-2">
            {workExperience.map((w, i) => (
              <li key={i}>
                <span className="font-semibold text-gray-900">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}
                {(w.startDate || w.endDate) && <span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>}
                {w.description && <p className="text-gray-700 mt-0.5">{descriptionToBullets(w.description)[0]}</p>}
              </li>
            ))}
          </ul></>
        )}
        {education.length > 0 && (
          <><SectionHeader accent={accent}>Education</SectionHeader>
          <ul className="space-y-1">
            {education.map((e, i) => (
              <li key={i}><span className="font-medium text-gray-900">{e.qualification || "—"}</span>{e.institution && ` — ${e.institution}`}</li>
            ))}
          </ul></>
        )}
        {keySkills.length > 0 && <><SectionHeader accent={accent}>Skills</SectionHeader><div className="flex flex-wrap gap-1.5">{keySkills.map((s, i) => <span key={i} className="px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-[11px]">{s.name}</span>)}</div></>}
        {certifications.length > 0 && <><SectionHeader accent={accent}>Certifications</SectionHeader><ul className="space-y-0.5 text-gray-700">{certifications.map((c, i) => <li key={i}>{c.name}{c.issuer && ` (${c.issuer})`}</li>)}</ul></>}
        <CustomSectionsBlock sections={data.customSections ?? []} accent={accent} className="mt-2" />
      </div>
    </div>
  );
}

// —— Template 3: Basic Two-Section (top block, then Experience, then Education & Skills) ——
function Template3({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const accent = data.accentColor || ACCENT;
  return (
    <div className={`${CARD_BASE} h-full flex flex-col font-sans antialiased`}>
      <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />
      <div className="p-4 bg-gradient-to-b from-gray-50/80 to-white border-b border-gray-100 shrink-0">
        <h1 className="text-base font-bold leading-tight line-clamp-1 text-gray-900">{personal.fullName || "Your name"}</h1>
        <p className="text-xs text-gray-600 mt-1 line-clamp-1"><ContactLinksContent personal={personal} /></p>
        {personal.jobTitle && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{personal.jobTitle}</p>}
      </div>
      <div className="p-4 space-y-3 text-sm flex-1 min-h-0 overflow-hidden">
        {overview && <section><SectionHeader accent={accent}>Summary</SectionHeader><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && (
          <section>
            <SectionHeader accent={accent}>Experience</SectionHeader>
            <ul className="space-y-1.5">
              {workExperience.map((w, i) => (
                <li key={i} className="flex justify-between gap-1 min-w-0">
                  <div className="min-w-0 truncate">
                    <span className="font-semibold text-gray-900">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}
                    {w.description && <p className="text-gray-600 mt-0.5">{descriptionToBullets(w.description)[0]}</p>}
                  </div>
                  {(w.startDate || w.endDate) && <span className="text-gray-500 text-xs shrink-0">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}
        <section className="border-t border-gray-100 pt-3">
          <SectionHeader accent={accent}>Education</SectionHeader>
          {education.length > 0 && (
            <ul className="space-y-0.5 mb-2">
              {education.map((e, i) => (
                <li key={i} className="truncate"><span className="font-medium text-gray-900">{e.qualification || "—"}</span>{e.institution && ` — ${e.institution}`}</li>
              ))}
            </ul>
          )}
          {keySkills.length > 0 && <><SectionHeader accent={accent}>Skills</SectionHeader><div className="flex flex-wrap gap-1.5">{keySkills.map((s, i) => <span key={i} className="px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-[11px]">{s.name}</span>)}</div></>}
          {certifications.length > 0 && <><SectionHeader accent={accent}>Certifications</SectionHeader><ul className="space-y-0.5 text-[12px] text-gray-700">{certifications.map((c, i) => <li key={i}>{c.name}</li>)}</ul></>}
          <CustomSectionsBlock sections={data.customSections ?? []} accent={accent} className="mt-2" />
        </section>
      </div>
    </div>
  );
}

// —— Template 4: Subtle Accent Bar (thin colored bar at top) ——
function Template4({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const accent = data.accentColor || ACCENT;
  return (
    <div className={`${CARD_BASE} font-sans antialiased`}>
      <div className="h-1.5 w-full rounded-t-lg" style={{ backgroundColor: accent }} />
      <div className="p-5">
        <h1 className="text-xl font-bold" style={{ color: accent }}>{personal.fullName || "Your name"}</h1>
        {personal.jobTitle && <p className="text-sm text-gray-600">{personal.jobTitle}</p>}
        <p className="text-xs text-gray-500 mt-1"><ContactLinksContent personal={personal} /></p>
      </div>
      <div className="px-5 pb-5 space-y-3 text-sm border-t border-gray-100 pt-4">
        {overview && <section><SectionHeader accent={accent}>Summary</SectionHeader><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && (
          <section>
            <SectionHeader accent={accent}>Experience</SectionHeader>
            <ul className="space-y-2">{workExperience.map((w, i) => (
              <li key={i}><span className="font-semibold text-gray-900">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}
                {(w.startDate || w.endDate) && <span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>}
                {w.description && <p className="text-gray-700 mt-0.5">{descriptionToBullets(w.description)[0]}</p>}
              </li>
            ))}</ul>
          </section>
        )}
        {education.length > 0 && (
          <section><SectionHeader accent={accent}>Education</SectionHeader>
            <ul className="space-y-1">{education.map((e, i) => (
              <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>
            ))}</ul>
          </section>
        )}
        {keySkills.length > 0 && <section><SectionHeader accent={accent}>Skills</SectionHeader><div className="flex flex-wrap gap-1.5">{keySkills.map((s, i) => <span key={i} className="px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-[11px]">{s.name}</span>)}</div></section>}
        {certifications.length > 0 && <section><SectionHeader accent={accent}>Certifications</SectionHeader><ul className="space-y-0.5">{certifications.map((c, i) => <li key={i}>{c.name}</li>)}</ul></section>}
        <CustomSectionsBlock sections={data.customSections ?? []} accent={accent} className="mt-2" />
      </div>
    </div>
  );
}

// —— Template 5: Left Accent Border ——
function Template5({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const accent = data.accentColor || ACCENT;
  return (
    <div className={`${CARD_BASE} flex font-sans antialiased`}>
      <div className="w-2 shrink-0 rounded-l-lg" style={{ backgroundColor: accent }} />
      <div className="flex-1 p-5">
        <h1 className="text-lg font-bold">{personal.fullName || "Your name"}</h1>
        {personal.jobTitle && <p className="text-sm text-gray-600">{personal.jobTitle}</p>}
        <p className="text-xs text-gray-500 mt-1"><ContactLinksContent personal={personal} /></p>
        <div className="mt-4 space-y-3 text-sm border-t border-gray-100 pt-4">
          {overview && <section><SectionHeader accent={accent}>Summary</SectionHeader><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
          {workExperience.length > 0 && (
            <section><SectionHeader accent={accent}>Experience</SectionHeader>
              <ul className="space-y-2">{workExperience.map((w, i) => (
                <li key={i}><span className="font-semibold text-gray-900">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}
                  {(w.startDate || w.endDate) && <span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>}
                  {w.description && <p className="text-gray-700 mt-0.5">{descriptionToBullets(w.description)[0]}</p>}
                </li>
              ))}</ul>
            </section>
          )}
          {education.length > 0 && <section><SectionHeader accent={accent}>Education</SectionHeader><ul className="space-y-1">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
          {keySkills.length > 0 && <section><SectionHeader accent={accent}>Skills</SectionHeader><div className="flex flex-wrap gap-1.5">{keySkills.map((s, i) => <span key={i} className="px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-[11px]">{s.name}</span>)}</div></section>}
          {certifications.length > 0 && <section><SectionHeader accent={accent}>Certifications</SectionHeader><ul className="space-y-1 text-[12px] text-gray-700">{certifications.map((c, i) => <li key={i}>{c.name}</li>)}</ul></section>}
          <CustomSectionsBlock sections={data.customSections ?? []} accent={accent} className="mt-2" />
        </div>
      </div>
    </div>
  );
}

// —— Template 6: David Miller style – single column, photo left, name uppercase, contact right, dates left in exp/edu ——
function Template6({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  return (
    <div className={CARD_BASE}>
      <div className="p-4 flex items-start gap-3 border-b border-gray-200">
        <CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={data.accentColor} className="w-14 h-14" ring="border-2 border-emerald-500" />
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold uppercase tracking-wide">{name}</h1>
          {personal.jobTitle && <p className="text-xs text-gray-600 mt-0.5">{personal.jobTitle}</p>}
        </div>
        <div className="text-right text-xs text-gray-600 shrink-0">
          <p>{personal.currentLocation}</p>
          <p><PhoneLink phone={personal.phone} /></p>
          <p><EmailLink email={personal.email} /></p>
        </div>
      </div>
      <div className="p-4 text-sm space-y-3">
        {overview && <section><SectionHeader accent={data.accentColor || ACCENT}>Summary</SectionHeader><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && (
          <section><SectionHeader accent={data.accentColor || ACCENT}>Experience</SectionHeader>
            <ul className="space-y-2">{workExperience.map((w, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-gray-500 text-xs shrink-0 w-20">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>
                <div><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && `, ${w.company}`} {personal.currentLocation && <span className="text-gray-500">· {personal.currentLocation}</span>}
                  {w.description && <ul className="list-disc pl-4 mt-0.5 text-gray-700">{descriptionToBullets(w.description).map((line, j) => <li key={j}>{line}</li>)}</ul>}
                </div>
              </li>
            ))}</ul>
          </section>
        )}
        {education.length > 0 && <section><SectionHeader accent={data.accentColor || ACCENT}>Education</SectionHeader>
          <ul className="space-y-1">{education.map((e, i) => (
            <li key={i} className="flex gap-3"><span className="text-gray-500 text-xs shrink-0 w-20">{[e.startDate, e.endDate].filter(Boolean).join(" – ")}</span><span>{e.qualification || "—"}{e.institution && `, ${e.institution}`}</span></li>
          ))}</ul>
        </section>}
        {keySkills.length > 0 && <section><SectionHeader accent={data.accentColor || ACCENT}>Skills</SectionHeader>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-700">{keySkills.map((s, i) => <span key={i}>{s.name} — {s.level || "Expert"}</span>)}</div>
        </section>}
        {certifications.length > 0 && <section><SectionHeader accent={data.accentColor || ACCENT}>Certifications</SectionHeader><ul className="space-y-0.5 text-[12px] text-gray-700">{certifications.map((c, i) => <li key={i}>{c.name}</li>)}</ul></section>}
        <CustomSectionsBlock sections={data.customSections ?? []} accent={data.accentColor} className="mt-3" />
      </div>
    </div>
  );
}

// —— Template 7: Alex Simson style – two-column header, WORK EXPERIENCE / EDUCATION / SKILLS / REFERENCES / LANGUAGES ——
function Template7({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  return (
    <div className={`${CARD_BASE} bg-gray-50/50 p-4`}>
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div className="flex items-start gap-3 border-b border-gray-100 pb-3">
          <CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={data.accentColor} className="w-14 h-14" />
          <div className="flex-1">
            <h1 className="text-base font-bold">{name}{personal.jobTitle ? `, ${personal.jobTitle}` : ""}</h1>
            <p className="text-xs text-gray-600 mt-1">{personal.currentLocation}</p>
            <p className="text-xs text-gray-600"><PhoneLink phone={personal.phone} /> · <EmailLink email={personal.email} /></p>
            {personal.website && <p className="text-xs text-gray-600">{personal.website}</p>}
          </div>
        </div>
        <div className="pt-3 space-y-3 text-sm">
          {overview && <section><SectionHeader accent={data.accentColor || ACCENT}>Summary</SectionHeader><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
          {workExperience.length > 0 && <section><SectionHeader accent={data.accentColor || ACCENT}>Work Experience</SectionHeader>
            <ul className="space-y-2">{workExperience.map((w, i) => (
              <li key={i} className="flex gap-2"><span className="text-gray-500 text-xs shrink-0 w-24">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>
                <div><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && `, ${w.company}`} {w.description && <p className="text-gray-700 mt-0.5">{descriptionToBullets(w.description)[0]}</p>}</div>
              </li>
            ))}</ul>
          </section>}
          {education.length > 0 && <section><SectionHeader accent={data.accentColor || ACCENT}>Education</SectionHeader>
            <ul className="space-y-1">{education.map((e, i) => <li key={i} className="flex gap-2"><span className="text-gray-500 text-xs shrink-0 w-24">{[e.startDate, e.endDate].filter(Boolean).join(" – ")}</span>{e.qualification || "—"}{e.institution && `, ${e.institution}`}</li>)}</ul>
          </section>}
          {keySkills.length > 0 && <section><SectionHeader accent={data.accentColor || ACCENT}>Skills</SectionHeader><div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-700">{keySkills.map((s, i) => <span key={i}>{s.name} — {s.level || "Expert"}</span>)}</div></section>}
          {certifications.length > 0 && <section><SectionHeader accent={data.accentColor || ACCENT}>Certifications</SectionHeader><ul className="space-y-0.5 text-[12px] text-gray-700">{certifications.map((c, i) => <li key={i}>{c.name}</li>)}</ul></section>}
          <section><SectionHeader accent={data.accentColor || ACCENT}>References</SectionHeader><p className="text-xs text-gray-600">Available on request</p></section>
          <CustomSectionsBlock sections={data.customSections ?? []} accent={data.accentColor} className="mt-3" />
        </div>
      </div>
    </div>
  );
}

// —— Template 8: Helen Hart style – photo left, name + title, address; contact two columns right; light blue gradient ——
function Template8({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  return (
    <div className={`${CARD_BASE} bg-gradient-to-b from-sky-50/80 to-white font-sans antialiased`}>
      <div className="p-4 border-b border-sky-100 space-y-3">
        <div className="flex items-start gap-3">
          <CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={data.accentColor} className="w-14 h-14" />
          <div>
            <h1 className="text-base font-bold">{name}{personal.jobTitle ? `, ${personal.jobTitle}` : ""}</h1>
            <p className="text-xs text-gray-600 mt-0.5">{personal.currentLocation}</p>
          </div>
        </div>
        <div className="w-full rounded-md border border-sky-100 bg-white/80 p-2 text-xs text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-1">
          <p>{personal.phone}</p>
          <p className="break-words sm:text-right"><EmailLink email={personal.email} /></p>
        </div>
      </div>
      <div className="p-4 space-y-3 text-sm">
        {overview && <section><SectionHeader accent={data.accentColor || ACCENT}>Summary</SectionHeader><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && <section><SectionHeader accent={data.accentColor || ACCENT}>Work Experience</SectionHeader>
          <ul className="space-y-2">{workExperience.map((w, i) => (
            <li key={i} className="flex gap-2"><span className="text-gray-500 text-xs shrink-0 w-24">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>
              <div><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && `, ${w.company}`} {w.description && <p className="text-gray-700 mt-0.5">{descriptionToBullets(w.description)[0]}</p>}</div>
            </li>
          ))}</ul>
        </section>}
        {education.length > 0 && <section><SectionHeader accent={data.accentColor || ACCENT}>Education</SectionHeader>
          <ul className="space-y-1">{education.map((e, i) => <li key={i} className="flex gap-2"><span className="text-gray-500 text-xs shrink-0 w-24">{[e.startDate, e.endDate].filter(Boolean).join(" – ")}</span>{e.qualification || "—"}{e.institution && `, ${e.institution}`}</li>)}</ul>
        </section>}
        {keySkills.length > 0 && <section><SectionHeader accent={data.accentColor || ACCENT}>Skills</SectionHeader><div className="flex flex-wrap gap-1.5">{keySkills.map((s, i) => <span key={i} className="px-2 py-0.5 rounded bg-sky-50 border border-sky-100 text-[11px] text-sky-800">{s.name}</span>)}</div></section>}
        {certifications.length > 0 && <section><SectionHeader accent={data.accentColor || ACCENT}>Certifications</SectionHeader><ul className="space-y-0.5 text-[12px] text-gray-700">{certifications.map((c, i) => <li key={i}>{c.name}</li>)}</ul></section>}
        <CustomSectionsBlock sections={data.customSections ?? []} accent={data.accentColor} className="mt-3" />
      </div>
    </div>
  );
}

// —— Template 9: Jack Clark style – minimal, small photo, name uppercase + title, contact below; Skills two-col Expert ——
function Template9({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  return (
    <div className={`${CARD_BASE} font-sans antialiased`}>
      <div className="p-4 flex items-center gap-3 border-b border-gray-200">
        <CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={data.accentColor} className="w-11 h-11" />
        <div>
          <h1 className="text-xs font-bold uppercase tracking-wide">{name}</h1>
          {personal.jobTitle && <p className="text-xs font-bold uppercase tracking-wide text-gray-600 mt-0.5">{personal.jobTitle}</p>}
          <p className="text-xs text-gray-500 mt-1">{personal.currentLocation} · <PhoneLink phone={personal.phone} /> · <EmailLink email={personal.email} /></p>
        </div>
      </div>
      <div className="p-4 space-y-3 text-sm">
        {overview && <section><SectionHeader accent={data.accentColor || ACCENT}>Summary</SectionHeader><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {keySkills.length > 0 && <section><SectionHeader accent={data.accentColor || ACCENT}>Skills</SectionHeader><div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-700">{keySkills.map((s, i) => <span key={i}>{s.name} — {s.level || "Expert"}</span>)}</div></section>}
        {workExperience.length > 0 && <section><SectionHeader accent={data.accentColor || ACCENT}>Experience</SectionHeader><ul className="space-y-2">{workExperience.map((w, i) => <li key={i}><span className="font-semibold text-gray-900">{w.jobTitle || "Role"}</span>{w.company && `, ${w.company}`} · {[w.startDate, w.endDate].filter(Boolean).join(" – ")} {w.description && <p className="text-gray-700 mt-0.5">{descriptionToBullets(w.description)[0]}</p>}</li>)}</ul></section>}
        {education.length > 0 && <section><SectionHeader accent={data.accentColor || ACCENT}>Education</SectionHeader><ul className="space-y-0.5">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        {certifications.length > 0 && <section><SectionHeader accent={data.accentColor || ACCENT}>Certifications</SectionHeader><ul className="space-y-0.5 text-[12px] text-gray-700">{certifications.map((c, i) => <li key={i}>{c.name}</li>)}</ul></section>}
        <CustomSectionsBlock sections={data.customSections ?? []} accent={data.accentColor} className="mt-3" />
      </div>
    </div>
  );
}

// —— Template 10: Maria Dean style – dark blue full-width header, photo in header, name + title + contact in white ——
function Template10({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  const accent = data.accentColor || ACCENT;
  const headerTextColor = getReadableTextColor(accent);
  return (
    <div className={`${CARD_BASE} font-sans antialiased`}>
      <div className="cv-dark-sidebar py-4 px-4 flex items-center gap-4" style={{ backgroundColor: accent, color: headerTextColor }}>
        <CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={data.accentColor} className="w-16 h-16 border-white" ring="border-2 border-white" />
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-inherit">{name}</h1>
          {personal.jobTitle && <p className="text-sm opacity-95" style={{ color: headerTextColor }}>{personal.jobTitle}</p>}
          <p className="text-xs opacity-90 mt-1" style={{ color: headerTextColor }}>{personal.currentLocation} · <PhoneLink phone={personal.phone} /> · <EmailLink email={personal.email} /></p>
        </div>
      </div>
      <div className="p-4 space-y-3 text-sm">
        {overview && <section><SectionHeader accent={accent}>Summary</SectionHeader><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && <section><SectionHeader accent={accent}>Work Experience</SectionHeader><ul className="space-y-2">{workExperience.map((w, i) => (<li key={i}><span className="font-semibold text-gray-900">{w.jobTitle || "Role"}</span>{w.company && `, ${w.company}`} <span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{w.description && <p className="text-gray-700 mt-0.5">{descriptionToBullets(w.description)[0]}</p>}</li>))}</ul></section>}
        {education.length > 0 && <section><SectionHeader accent={accent}>Education</SectionHeader><ul className="space-y-0.5">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        {keySkills.length > 0 && <section><SectionHeader accent={accent}>Skills</SectionHeader><div className="flex flex-wrap gap-1.5">{keySkills.map((s, i) => <span key={i} className="px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-[11px]">{s.name}</span>)}</div></section>}
        {certifications.length > 0 && <section><SectionHeader accent={accent}>Certifications</SectionHeader><ul className="space-y-0.5 text-[12px] text-gray-700">{certifications.map((c, i) => <li key={i}>{c.name}</li>)}</ul></section>}
        <CustomSectionsBlock sections={data.customSections ?? []} accent={data.accentColor} className="mt-3" />
      </div>
    </div>
  );
}

// —— Template 11: Emma Carter style – clean single column, stronger header and section spacing ——
function Template11({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const accent = data.accentColor || ACCENT;
  const name = personal.fullName || "Your name";
  const Sect = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="pt-3 mt-3 border-t border-slate-200 first:border-0 first:pt-0 first:mt-0">
      <h2 className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: accent }}>{title}</h2>
      {children}
    </section>
  );
  return (
    <div className={`${CARD_BASE} font-sans antialiased`}>
      <div className="h-1 w-full" style={{ backgroundColor: accent }} />
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={accent} className="w-12 h-12 shrink-0" ring="border-2 border-gray-200" />
          <div>
            <h1 className="text-lg font-bold uppercase tracking-tight">{name}</h1>
            {personal.jobTitle && <p className="text-xs text-gray-600 uppercase">{personal.jobTitle}</p>}
          </div>
        </div>
        <p className="text-[10px] leading-4 text-gray-500 text-right shrink-0 break-all">{personal.currentLocation}<br /><PhoneLink phone={personal.phone} /><br /><EmailLink email={personal.email} /></p>
      </div>
      <div className="px-4 pb-4 text-sm">
        {overview && <Sect title="Professional Summary"><p className="whitespace-pre-wrap text-gray-700">{overview}</p></Sect>}
        {workExperience.length > 0 && <Sect title="Experience"><ul className="space-y-3">{workExperience.map((w, i) => { const bullets = w.description ? descriptionToBullets(w.description) : []; return (<li key={i} className="flex justify-between gap-4"><div className="min-w-0"><span className="font-semibold text-gray-900">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}{bullets.length > 0 && <ul className="mt-1 list-disc list-inside text-gray-700 text-[12px] marker:text-gray-400 space-y-1">{bullets.map((line, j) => <li key={j}>{line}</li>)}</ul>}</div><span className="text-gray-500 text-xs shrink-0 text-right">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span></li>); })}</ul></Sect>}
        {education.length > 0 && <Sect title="Education"><ul className="space-y-1.5">{education.map((e, i) => (<li key={i} className="flex justify-between gap-4"><span className="font-medium text-gray-900">{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</span><span className="text-gray-500 text-xs shrink-0">{[e.startDate, e.endDate].filter(Boolean).join(" – ")}</span></li>))}</ul></Sect>}
        {keySkills.length > 0 && <Sect title="Skills"><div className="flex flex-wrap gap-1.5">{keySkills.map((s, i) => <span key={i} className="px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-[11px]">{s.name} {s.level ? `• ${s.level}` : ""}</span>)}</div></Sect>}
        {certifications.length > 0 && <Sect title="Certifications"><ul className="space-y-1 text-[12px] text-gray-700">{certifications.map((c, i) => <li key={i}><span className="font-medium text-gray-900">{c.name}</span>{c.issuer && ` (${c.issuer})`}{c.date && ` · ${c.date}`}</li>)}</ul></Sect>}
        <CustomSectionsBlock sections={data.customSections ?? []} accent={accent} className="mt-3" />
      </div>
    </div>
  );
}

// —— Template 12: Helen Willis style – classic serif profile with stronger hierarchy ——
function Template12({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  const accent = data.accentColor || ACCENT;
  const H = ({ children }: { children: React.ReactNode }) => <h2 className="text-[11px] font-semibold uppercase tracking-wider border-b border-gray-200 pb-1 mb-1.5" style={{ color: accent }}>{children}</h2>;
  return (
    <div className={`${CARD_BASE} font-serif antialiased`}>
      <div className="p-4 text-center">
        <div className="flex justify-center mb-2"><CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={accent} className="w-14 h-14" ring="border-2 border-gray-300" /></div>
        <h1 className="text-base font-bold uppercase tracking-wide">{name}</h1>
        {personal.jobTitle && <p className="text-xs text-gray-600 uppercase mt-0.5">{personal.jobTitle}</p>}
        {(contactLine(personal) || linksLine(personal)) && <p className="text-[10px] text-gray-500 mt-1"><ContactLinksContent personal={personal} /></p>}
      </div>
      <div className="px-4 pb-4 text-sm space-y-3">
        {overview && <section><H>Professional Summary</H><p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{overview}</p></section>}
        {workExperience.length > 0 && <section><H>Work Experience</H><ul className="space-y-2">{workExperience.map((w, i) => { const bullets = w.description ? descriptionToBullets(w.description) : []; return (<li key={i}><span className="font-semibold text-gray-900">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{bullets.length > 0 && <ul className="list-disc list-inside mt-1 text-gray-700 text-[12px] marker:text-gray-400 space-y-1">{bullets.map((line, j) => <li key={j}>{line}</li>)}</ul>}</li>); })}</ul></section>}
        {education.length > 0 && <section><H>Education</H><ul className="space-y-0.5">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        {keySkills.length > 0 && <section><H>Skills</H><div className="flex flex-wrap gap-1.5">{keySkills.map((s, i) => <span key={i} className="px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-[11px]">{s.name}</span>)}</div></section>}
        {certifications.length > 0 && <section><H>Certifications</H><ul className="space-y-1 text-[12px] text-gray-700">{certifications.map((c, i) => <li key={i}><span className="font-medium text-gray-900">{c.name}</span>{c.issuer && ` (${c.issuer})`}{c.date && ` · ${c.date}`}</li>)}</ul></section>}
        <CustomSectionsBlock sections={data.customSections ?? []} accent={accent} className="mt-3" />
      </div>
    </div>
  );
}

// —— Template 13: Theo Ramos style – teal sidebar with clearer right-panel hierarchy ——
function Template13({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  const accent = data.accentColor || ACCENT;
  return (
    <div className={`${CARD_BASE} h-full min-h-[980px] flex items-stretch min-w-0 font-sans antialiased`}>
      <div className="cv-dark-sidebar w-[32%] min-w-0 p-3 text-white text-xs shrink-0 flex flex-col overflow-hidden" style={{ backgroundColor: accent }}>
        <div className="flex justify-center mb-1.5 shrink-0"><CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={accent} className="w-11 h-11 border-white" ring="border-2 border-white" /></div>
        <p className="opacity-95 truncate">{personal.currentLocation}</p>
        <p className="opacity-95 truncate">{personal.phone}</p>
        <p className="opacity-95 truncate"><EmailLink email={personal.email} /></p>
        {overview && <div className="mt-1.5 flex-1 min-h-0 overflow-hidden"><h2 className="text-[10px] font-bold uppercase tracking-wider opacity-90 mb-0.5">Summary</h2><p className="whitespace-pre-wrap opacity-95 line-clamp-3 text-[10px]">{overview}</p></div>}
        {keySkills.length > 0 && <div className="mt-1.5 shrink-0"><h2 className="text-[10px] font-bold uppercase tracking-wider opacity-90 mb-0.5">Skills</h2><ul className="space-y-0.5 opacity-95 [&>li:nth-child(n+4)]:hidden">{keySkills.map((s, i) => <li key={i} className="truncate">{s.name}</li>)}</ul></div>}
      </div>
      <div className="flex-1 p-4 text-sm min-w-0 overflow-hidden flex flex-col">
        <SectionHeader accent={accent}>Work Experience</SectionHeader>
        {workExperience.length > 0 ? <ul className="space-y-1 flex-1 min-h-0 overflow-hidden [&>li:nth-child(n+3)]:hidden">{workExperience.map((w, i) => { const bullets = w.description ? descriptionToBullets(w.description) : []; return (<li key={i}><span className="font-semibold text-gray-900">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{bullets.length > 0 && <p className="text-gray-700 mt-0.5 line-clamp-2 text-[12px]">{bullets.join(" • ")}</p>}</li>); })}</ul> : <p className="text-gray-500">—</p>}
        <SectionHeader accent={accent}>Education</SectionHeader>
        {education.length > 0 ? <ul className="space-y-0.5">{education.slice(0, 2).map((e, i) => <li key={i} className="truncate">{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul> : <p className="text-gray-500">—</p>}
        <SectionHeader accent={accent}>References</SectionHeader>
        <p className="text-gray-600 text-xs truncate">{certifications.length ? certifications.map((c) => c.name).join(" · ") : "Available upon request"}</p>
        <CustomSectionsBlock sections={data.customSections ?? []} accent={accent} className="mt-2" />
      </div>
    </div>
  );
}

// —— Template 14: Alisha Hill style – icon-led sections with polished spacing ——
function Template14({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  const accent = data.accentColor || ACCENT;
  const Icon = () => <span className="inline-block w-2 h-2 rounded-full mr-1.5 shrink-0 mt-0.5 align-middle" style={{ backgroundColor: accent }} />;
  return (
    <div className={`${CARD_BASE} bg-gradient-to-b from-sky-50/80 to-white font-sans antialiased`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-full opacity-30" style={{ backgroundColor: accent }} />
            <CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={data.accentColor} className="relative w-14 h-14 border-emerald-500" ring="border-2 border-emerald-500" />
          </div>
          <div>
            <h1 className="text-base font-bold">{name}</h1>
            {personal.jobTitle && <p className="text-sm text-gray-600">{personal.jobTitle}</p>}
          </div>
        </div>
      </div>
      <div className="px-4 pb-4 text-sm space-y-3">
        {overview && <section><h2 className="text-[10px] font-bold flex items-center" style={{ color: accent }}><Icon />Summary</h2><p className="whitespace-pre-wrap text-gray-700 mt-0.5">{overview}</p></section>}
        <section><h2 className="text-[10px] font-bold flex items-center" style={{ color: accent }}><Icon />Contacts</h2><p className="text-gray-600 text-xs mt-0.5">{personal.currentLocation} · <PhoneLink phone={personal.phone} /> · <EmailLink email={personal.email} /></p></section>
        {keySkills.length > 0 && <section><h2 className="text-[10px] font-bold flex items-center" style={{ color: accent }}><Icon />Skills</h2><div className="flex flex-wrap gap-1.5 mt-0.5">{keySkills.map((s, i) => <span key={i} className="px-2 py-0.5 rounded border border-emerald-100 bg-emerald-50 text-[11px] text-emerald-800">{s.name}</span>)}</div></section>}
        {workExperience.length > 0 && <section><h2 className="text-[10px] font-bold flex items-center" style={{ color: accent }}><Icon />Experience</h2><ul className="space-y-1 mt-0.5">{workExperience.map((w, i) => { const bullets = w.description ? descriptionToBullets(w.description) : []; return (<li key={i}><span className="font-semibold text-gray-900">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`} <span className="text-gray-500 text-xs">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{bullets.length > 0 && <p className="text-[12px] text-gray-700 mt-0.5">{bullets[0]}</p>}</li>); })}</ul></section>}
        {education.length > 0 && <section><h2 className="text-[10px] font-bold flex items-center" style={{ color: accent }}><Icon />Education</h2><ul className="space-y-0.5 mt-0.5">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        {certifications.length > 0 && <section><h2 className="text-[10px] font-bold flex items-center" style={{ color: accent }}><Icon />Certifications</h2><ul className="space-y-0.5 mt-0.5 text-[12px] text-gray-700">{certifications.map((c, i) => <li key={i}><span className="font-medium text-gray-900">{c.name}</span>{c.issuer && ` (${c.issuer})`}</li>)}</ul></section>}
        <section><h2 className="text-[10px] font-bold flex items-center" style={{ color: accent }}><Icon />References</h2><p className="text-gray-600 text-xs mt-0.5">Available upon request</p></section>
        <CustomSectionsBlock sections={data.customSections ?? []} accent={accent} className="mt-2" />
      </div>
    </div>
  );
}

// —— Template 15: Samantha Lewis style – two columns; stronger professional contrast and spacing ——
function Template15({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  const accent = data.accentColor || ACCENT;
  return (
    <div className={`${CARD_BASE} min-h-[980px] flex items-stretch font-sans antialiased`}>
      <div className="w-[36%] p-3 text-sm border-r border-gray-200 bg-slate-50/50">
        <div className="py-2 px-3 mb-2 text-white font-bold text-sm rounded" style={{ backgroundColor: accent }}>{name}</div>
        {personal.jobTitle && <p className="text-xs text-gray-700 mb-2">{personal.jobTitle}</p>}
        <p className="text-[10px] text-gray-600 mb-1"><EmailLink email={personal.email} /></p>
        <p className="text-[10px] text-gray-600 mb-1">{personal.currentLocation}</p>
        <p className="text-[10px] text-gray-600 mb-3">{personal.phone}</p>
        {keySkills.length > 0 && <><h2 className="text-[10px] font-bold uppercase text-gray-600 mb-1">Skills</h2><div className="flex flex-wrap gap-1">{keySkills.slice(0, 4).map((s, i) => <span key={i} className="text-[10px] px-2 py-0.5 rounded text-white" style={{ backgroundColor: accent }}>{s.name} — {s.level || "Expert"}</span>)}</div></>}
        <h2 className="text-[10px] font-bold uppercase text-gray-600 mt-2 mb-1">Languages</h2>
        <div className="flex flex-wrap gap-1"><span className="text-[10px] px-2 py-0.5 rounded text-white" style={{ backgroundColor: accent }}>English — Native</span></div>
        {certifications.length > 0 && <><h2 className="text-[10px] font-bold uppercase text-gray-600 mt-2 mb-1">Certifications</h2><ul className="space-y-1 text-[10px] text-gray-700">{certifications.slice(0, 3).map((c, i) => <li key={i} className="truncate"><span className="font-medium">{c.name}</span></li>)}</ul></>}
      </div>
      <div className="flex-1 p-4 text-sm">
        {overview && <section className="mb-2"><SectionHeader accent={accent}>Summary</SectionHeader><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && <section><SectionHeader accent={accent}>Experience</SectionHeader><ul className="space-y-1.5">{workExperience.map((w, i) => { const bullets = w.description ? descriptionToBullets(w.description) : []; return (<li key={i}><span className="font-semibold text-gray-900">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{bullets.length > 0 && <p className="text-gray-700 text-[12px]">{bullets[0]}</p>}</li>); })}</ul></section>}
        {education.length > 0 && <section className="mt-2"><SectionHeader accent={accent}>Education</SectionHeader><ul className="space-y-0.5">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        <CustomSectionsBlock sections={data.customSections ?? []} accent={accent} className="mt-2" />
      </div>
    </div>
  );
}

// —— Template 16: Mia Bennett style – dark blue/purple left sidebar (avatar, name, contact, skills, languages); right white: Summary, Work History, Education ——
function Template16({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  const accent = data.accentColor || ACCENT;
  return (
    <div className={`${CARD_BASE} min-h-[980px] flex items-stretch font-sans antialiased`}>
      <div className="cv-dark-sidebar w-[35%] p-3 text-white text-xs" style={{ backgroundColor: accent }}>
        <div className="flex justify-center mb-2"><CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={accent} className="w-14 h-14 border-white" ring="border-2 border-white" /></div>
        <h1 className="text-center font-bold text-sm tracking-wide">{name}</h1>
        {personal.jobTitle && <p className="text-center opacity-90 text-[10px] mt-0.5">{personal.jobTitle}</p>}
        <div className="mt-2 space-y-0.5 opacity-90">
          <p>{personal.currentLocation}</p>
          <p>{personal.phone}</p>
          <p className="break-words"><EmailLink email={personal.email} /></p>
        </div>
        {keySkills.length > 0 && <div className="mt-3"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-1">Core Skills</h2><ul className="space-y-0.5 opacity-90">{keySkills.slice(0, 8).map((s, i) => <li key={i}>{s.name}</li>)}</ul></div>}
        <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Languages</h2><p className="opacity-90">English — Professional</p></div>
      </div>
      <div className="flex-1 p-4 text-sm">
        {overview && <section className="mb-3"><SectionHeader accent={accent}>Executive Summary</SectionHeader><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && <section><SectionHeader accent={accent}>Work History</SectionHeader><ul className="space-y-3">{workExperience.map((w, i) => { const bullets = w.description ? descriptionToBullets(w.description) : []; return (<li key={i}><span className="font-semibold text-gray-900">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{bullets.length > 0 && <p className="text-gray-700 text-[12px]">{bullets[0]}</p>}</li>); })}</ul></section>}
        {education.length > 0 && <section className="mt-2"><SectionHeader accent={accent}>Education</SectionHeader><ul className="space-y-1">{education.map((e, i) => <li key={i}><span className="font-medium text-gray-900">{e.qualification || "—"}</span>{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        {certifications.length > 0 && <section className="mt-2"><SectionHeader accent={accent}>Certifications</SectionHeader><ul className="space-y-1 text-[12px] text-gray-700">{certifications.map((c, i) => <li key={i}>{c.name}</li>)}</ul></section>}
        <CustomSectionsBlock sections={data.customSections ?? []} accent={accent} className="mt-2" />
      </div>
    </div>
  );
}

// —— Template 17: Ethan Cole style – main content left (name, title, contact, Summary, Work Experience, Education, References); dark blue right sidebar (avatar, Skills, Languages, Courses, Hobbies) ——
function Template17({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  return (
    <div className={`${CARD_BASE} min-h-[980px] flex items-stretch font-sans antialiased`}>
      <div className="flex-1 p-4 text-sm min-w-0">
        <h1 className="text-lg font-bold uppercase tracking-tight">{name}</h1>
        {personal.jobTitle && <p className="text-xs text-gray-600">{personal.jobTitle}</p>}
        <p className="text-[10px] text-gray-500 mt-0.5"><PhoneLink phone={personal.phone} /> · <EmailLink email={personal.email} /> · {personal.currentLocation}</p>
        {overview && <section className="mt-2"><SectionHeader accent={data.accentColor || ACCENT}>Summary</SectionHeader><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && <section className="mt-2"><SectionHeader accent={data.accentColor || ACCENT}>Work Experience</SectionHeader><ul className="space-y-2">{workExperience.map((w, i) => { const bullets = w.description ? descriptionToBullets(w.description) : []; return (<li key={i}><span className="font-semibold text-gray-900">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{bullets.length > 0 && <p className="text-gray-700 text-[12px]">{bullets[0]}</p>}</li>); })}</ul></section>}
        {education.length > 0 && <section className="mt-2"><SectionHeader accent={data.accentColor || ACCENT}>Education</SectionHeader><ul className="space-y-0.5">{education.map((e, i) => <li key={i}><span className="font-medium text-gray-900">{e.qualification || "—"}</span>{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        <section className="mt-2"><SectionHeader accent={data.accentColor || ACCENT}>References</SectionHeader><p className="text-gray-600 text-xs">{certifications.length ? certifications[0].name : "Available upon request"}</p></section>
        <CustomSectionsBlock sections={data.customSections ?? []} accent={data.accentColor} className="mt-2" />
      </div>
      <div className="cv-dark-sidebar w-[32%] p-3 text-white text-xs" style={{ backgroundColor: data.accentColor || ACCENT }}>
        <div className="flex justify-center mb-2"><CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={data.accentColor} className="w-12 h-12 border-white" ring="border-2 border-white" /></div>
        {keySkills.length > 0 && <div><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Skills</h2><div className="flex flex-wrap gap-1 opacity-95">{keySkills.slice(0, 8).map((s, i) => <span key={i} className="px-1.5 py-0.5 rounded bg-white/15 border border-white/20 text-[10px]">{s.name}</span>)}</div></div>}
        <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Languages</h2><p className="opacity-90">English — Native</p></div>
        {certifications.length > 0 && <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Courses</h2><p className="opacity-90">{certifications[0].name}</p></div>}
        <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Hobbies</h2><p className="opacity-90 text-[10px]">—</p></div>
      </div>
    </div>
  );
}

// —— Template 18: Jenna Morales style – dark teal left sidebar (avatar, name, title, Details, Skills, Languages, Links, Hobbies); right: Summary, Work Experience, Education, References ——
function Template18({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  const accent = data.accentColor || ACCENT;
  return (
    <div className={`${CARD_BASE} min-h-[980px] flex items-stretch font-sans antialiased`}>
      <div className="cv-dark-sidebar w-[36%] p-3 text-white text-xs" style={{ backgroundColor: accent }}>
        <div className="flex justify-center mb-2"><CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={data.accentColor} className="w-14 h-14 border-white" ring="border-2 border-white" /></div>
        <h1 className="text-center font-bold text-sm">{name}</h1>
        {personal.jobTitle && <p className="text-center text-[10px] opacity-90 mt-0.5">{personal.jobTitle}</p>}
        <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Details</h2><p className="opacity-90">{personal.currentLocation}</p><p className="opacity-90"><EmailLink email={personal.email} className="text-inherit" /></p><p className="opacity-90"><PhoneLink phone={personal.phone} className="text-inherit" /></p></div>
        {keySkills.length > 0 && <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Skills</h2><div className="flex flex-wrap gap-1 opacity-95">{keySkills.slice(0, 8).map((s, i) => <span key={i} className="px-1.5 py-0.5 rounded bg-white/15 border border-white/20 text-[10px]">{s.name}</span>)}</div></div>}
        <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Languages</h2><p className="opacity-90">English</p></div>
        {(personal.linkedinUrl || personal.website || certifications.length > 0) && <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Links</h2><p className="opacity-90 text-[10px]">{[personal.linkedinUrl, personal.website, certifications[0]?.name].filter(Boolean).join(" · ")}</p></div>}
        <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Hobbies</h2><p className="opacity-90 text-[10px]">—</p></div>
      </div>
      <div className="flex-1 p-4 text-sm">
        {overview && <section className="mb-2"><SectionHeader accent={accent}>Summary</SectionHeader><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && <section><SectionHeader accent={accent}>Work Experience</SectionHeader><ul className="space-y-2">{workExperience.map((w, i) => { const bullets = w.description ? descriptionToBullets(w.description) : []; return (<li key={i}><span className="font-semibold text-gray-900">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{bullets.length > 0 && <p className="text-gray-700 text-[12px]">{bullets[0]}</p>}</li>); })}</ul></section>}
        {education.length > 0 && <section className="mt-2"><SectionHeader accent={accent}>Education</SectionHeader><ul className="space-y-0.5">{education.map((e, i) => <li key={i}><span className="font-medium text-gray-900">{e.qualification || "—"}</span>{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        <section className="mt-2"><SectionHeader accent={accent}>References</SectionHeader><p className="text-gray-600 text-xs">Available upon request</p></section>
        <CustomSectionsBlock sections={data.customSections ?? []} accent={accent} className="mt-2" />
      </div>
    </div>
  );
}

// —— Template 19: Anna Rodriguez style – dark grey left sidebar (avatar, CONTACTS with icons, EDUCATION); right: orange band (job title left, name right), PROFESSIONAL SUMMARY, SKILLS two-col, WORK EXPERIENCE, LINKS ——
function Template19({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  const grey = "#4b5563";
  const accent = data.accentColor || ACCENT;
  return (
    <div className={`${CARD_BASE} min-h-[980px] flex items-stretch font-sans antialiased`}>
      <div className="cv-dark-sidebar w-[30%] p-3 text-white text-xs" style={{ backgroundColor: grey }}>
        <div className="flex justify-center mb-2"><CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={data.accentColor} className="w-12 h-12 border-white" ring="border-2 border-white" /></div>
        <h2 className="text-[10px] font-bold uppercase mb-0.5">Contacts</h2>
        <p className="opacity-90"><EmailLink email={personal.email} className="text-white" /></p>
        <p className="opacity-90">{personal.currentLocation}</p>
        <p className="opacity-90"><PhoneLink phone={personal.phone} className="text-white" /></p>
        {education.length > 0 && <div className="mt-2"><h2 className="text-[10px] font-bold uppercase mb-0.5">Education</h2><ul className="space-y-0.5 opacity-90">{education.map((e, i) => <li key={i}>{e.qualification}{e.institution && ` — ${e.institution}`}</li>)}</ul></div>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="py-2 px-4 flex justify-between items-center text-white" style={{ backgroundColor: accent }}>
          <span className="text-xs font-bold">{personal.jobTitle || "Job Title"}</span>
          <span className="text-sm font-bold uppercase tracking-wide">{name}</span>
        </div>
        <div className="p-4 text-sm">
          {overview && <section className="mb-2"><SectionHeader accent={accent}>Professional Summary</SectionHeader><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
          {keySkills.length > 0 && <section className="mb-2"><SectionHeader accent={accent}>Skills</SectionHeader><div className="flex flex-wrap gap-1.5">{keySkills.map((s, i) => <span key={i} className="px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-[11px]">{s.name}</span>)}</div></section>}
          {workExperience.length > 0 && <section><SectionHeader accent={accent}>Work Experience</SectionHeader><ul className="space-y-2">{workExperience.map((w, i) => { const bullets = w.description ? descriptionToBullets(w.description) : []; return (<li key={i}><span className="font-semibold text-gray-900">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{bullets.length > 0 && <p className="text-gray-700 text-[12px]">{bullets[0]}</p>}</li>); })}</ul></section>}
          {(certifications.length > 0 || personal.website) && <section className="mt-2"><SectionHeader accent={accent}>Links</SectionHeader><p className="text-gray-600 text-xs">{[personal.website, certifications[0]?.name].filter(Boolean).join(" · ")}</p></section>}
          <CustomSectionsBlock sections={data.customSections ?? []} accent={accent} className="mt-2" />
        </div>
      </div>
    </div>
  );
}

// —— Template 20: Mike Beckinsale style – left: avatar, name, title, Summary, Work Experience, Education, References, Languages, Links; dark blue right sidebar: DETAILS, SKILLS ——
function Template20({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  return (
    <div className={`${CARD_BASE} min-h-[980px] flex items-stretch font-sans antialiased`}>
      <div className="flex-1 p-4 text-sm min-w-0">
        <div className="flex items-start gap-3">
          <CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={data.accentColor} className="w-12 h-12 shrink-0" />
          <div>
            <h1 className="text-base font-bold">{name}</h1>
            {personal.jobTitle && <p className="text-xs text-gray-600">{personal.jobTitle}</p>}
          </div>
        </div>
        {overview && <section className="mt-2"><SectionHeader accent={data.accentColor || ACCENT}>Summary</SectionHeader><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && <section className="mt-2"><SectionHeader accent={data.accentColor || ACCENT}>Work Experience</SectionHeader><ul className="space-y-2">{workExperience.map((w, i) => { const bullets = w.description ? descriptionToBullets(w.description) : []; return (<li key={i}><span className="font-semibold text-gray-900">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{bullets.length > 0 && <p className="text-gray-700 text-[12px]">{bullets[0]}</p>}</li>); })}</ul></section>}
        {education.length > 0 && <section className="mt-2"><SectionHeader accent={data.accentColor || ACCENT}>Education</SectionHeader><ul className="space-y-0.5">{education.map((e, i) => <li key={i}><span className="font-medium text-gray-900">{e.qualification || "—"}</span>{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        <section className="mt-2"><SectionHeader accent={data.accentColor || ACCENT}>References</SectionHeader><p className="text-gray-600 text-xs">Available upon request</p></section>
        <section className="mt-2"><SectionHeader accent={data.accentColor || ACCENT}>Languages</SectionHeader><p className="text-gray-600 text-xs">English</p></section>
        {(personal.linkedinUrl || personal.website || certifications.length > 0) && <section className="mt-2"><SectionHeader accent={data.accentColor || ACCENT}>Links</SectionHeader><p className="text-gray-600 text-xs">{[personal.linkedinUrl, personal.website, certifications[0]?.name].filter(Boolean).join(" · ")}</p></section>}
        <CustomSectionsBlock sections={data.customSections ?? []} accent={data.accentColor} className="mt-2" />
      </div>
      <div className="cv-dark-sidebar w-[28%] p-3 text-white text-xs" style={{ backgroundColor: data.accentColor || ACCENT }}>
        <h2 className="text-[10px] font-bold uppercase opacity-90 mb-1">Details</h2>
        <p className="opacity-90">{personal.currentLocation}</p>
        <p className="opacity-90"><PhoneLink phone={personal.phone} className="text-inherit" /></p>
        <p className="opacity-90"><EmailLink email={personal.email} className="text-inherit" /></p>
        {keySkills.length > 0 && <div className="mt-3"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Skills</h2><ul className="space-y-0.5 opacity-90">{keySkills.map((s, i) => <li key={i}>{s.name}</li>)}</ul></div>}
      </div>
    </div>
  );
}

const TEMPLATES: Record<number, React.FC<{ data: CvPreviewData }>> = {
  1: Template1, 2: Template2, 3: Template3, 4: Template4, 5: Template5,
  6: Template6, 7: Template7, 8: Template8, 9: Template9, 10: Template10,
  11: Template11, 12: Template12, 13: Template13, 14: Template14, 15: Template15,
  16: Template16, 17: Template17, 18: Template18, 19: Template19, 20: Template20,
};

export function getCvTemplateComponent(templateId: number): React.FC<{ data: CvPreviewData }> {
  const id = Math.max(1, Math.min(20, templateId));
  return TEMPLATES[id] || Template1;
}

export function CvPreviewByTemplate({ templateId, data, compact, onLinkClick }: { templateId: number; data: CvPreviewData; compact?: boolean; onLinkClick?: (url: string) => void }) {
  const Component = getCvTemplateComponent(templateId);
  const hasQr = !compact && !!data.cvOnlineUrl;
  const fontScale = compact ? 1 : Math.min(CV_FONT_SCALE_MAX, Math.max(CV_FONT_SCALE_MIN, data.cvFontScale ?? 1));
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
    <div className={PROFESSIONAL_CANVAS}>
      <CvLinkTrackingContext.Provider value={onLinkClick ?? null}>
        {hasQr ? (
          <div className="rounded-md border border-slate-200 overflow-hidden bg-white">
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
      <div className="cv-preview-compact h-full max-h-[373px] overflow-hidden text-[8px] [&_h1]:!text-[10px] [&_h2]:!text-[7px] [&_p]:!text-[8px] [&_li]:!text-[8px] [&_span]:!text-[8px] leading-[1.2] [&_*]:!leading-[1.2] [&_.p-5]:!p-2 [&_.p-4]:!p-2 [&_.px-5]:!px-2 [&_.pb-5]:!pb-2">
        {content}
      </div>
    );
  }
  return scaled;
}

/** Minimal data for template card previews on the CV builder grid */
export const SAMPLE_CV_PREVIEW_DATA: CvPreviewData = {
  personal: {
    fullName: "Your Name",
    email: "email@example.com",
    phone: "+27 00 000 0000",
    currentLocation: "City, Country",
    jobTitle: "Job Title",
    linkedinUrl: "",
    website: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    profilePictureUrl: undefined,
    showProfilePictureOnCv: false,
  },
  overview: "Brief professional summary or career objective.",
  workExperience: [{ jobTitle: "Role", company: "Company", startDate: "2020", endDate: "Present", description: "Key responsibilities." }],
  education: [{ qualification: "Degree", institution: "University", startDate: "2016", endDate: "2019" }],
  certifications: [{ name: "Certification", issuer: "Issuer", date: "2022" }],
  keySkills: [{ name: "Skill 1", level: "Expert" }, { name: "Skill 2", level: "Advanced" }, { name: "Skill 3", level: "" }],
  accentColor: undefined,
  customSections: undefined,
};
