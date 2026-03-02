import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import type { WorkExperienceItem, EducationItem, CertificationItem, SkillItem } from "@/pages/SmartApplyProfile";

const ACCENT = "#1e3a5f";

/** Shared card styling for a polished, paper-like CV appearance */
const CARD_BASE = "bg-white text-gray-900 overflow-hidden min-h-[280px] shadow-[0_4px_14px_-2px_rgba(0,0,0,0.08),0_8px_24px_-4px_rgba(0,0,0,0.06)] rounded-lg border border-gray-100 ring-1 ring-gray-900/5";

/** Section header – clean uppercase with accent support */
function SectionHeader({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <h2
      className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 border-b border-gray-200 pb-1.5 mb-2"
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

function linksLine(p: CvPreviewData["personal"]): string {
  return [p.linkedinUrl, p.website].filter(Boolean).join(" • ");
}

const CvLinkTrackingContext = React.createContext<((url: string) => void) | null>(null);

/** Renders contact + links; when onLinkClick is in context, email/linkedin/website become clickable and tracked */
function ContactLinksContent({ personal }: { personal: CvPreviewData["personal"] }) {
  const onLinkClick = React.useContext(CvLinkTrackingContext);
  const parts: React.ReactNode[] = [];
  const sep = " • ";
  const sep2 = " · ";
  if (personal.email) {
    parts.push(onLinkClick
      ? <a key="e" href={`mailto:${personal.email}`} className="text-inherit underline hover:opacity-80" onClick={() => onLinkClick(`mailto:${personal.email}`)}>{personal.email}</a>
      : personal.email);
  }
  if (personal.phone) {
    parts.push(onLinkClick
      ? <a key="p" href={`tel:${personal.phone}`} className="text-inherit underline hover:opacity-80" onClick={() => onLinkClick(`tel:${personal.phone}`)}>{personal.phone}</a>
      : personal.phone);
  }
  if (personal.currentLocation) parts.push(<span key="l">{personal.currentLocation}</span>);
  const contactParts = parts;
  const linkParts: React.ReactNode[] = [];
  if (personal.linkedinUrl) {
    const href = /^https?:\/\//i.test(personal.linkedinUrl) ? personal.linkedinUrl : `https://${personal.linkedinUrl}`;
    linkParts.push(onLinkClick
      ? <a key="li" href={href} target="_blank" rel="noopener noreferrer" className="text-inherit underline hover:opacity-80" onClick={() => onLinkClick(href)}>{personal.linkedinUrl}</a>
      : personal.linkedinUrl);
  }
  if (personal.website) {
    const href = /^https?:\/\//i.test(personal.website) ? personal.website : `https://${personal.website}`;
    linkParts.push(onLinkClick
      ? <a key="w" href={href} target="_blank" rel="noopener noreferrer" className="text-inherit underline hover:opacity-80" onClick={() => onLinkClick(href)}>{personal.website}</a>
      : personal.website);
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

// —— Template 1: Classic One-Column ——
function Template1({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, certifications, keySkills } = data;
  return (
    <div className={CARD_BASE}>
      <div className="p-5 pb-4">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">{personal.fullName || "Your name"}</h1>
        {personal.jobTitle && <p className="text-sm text-gray-600 mt-1">{personal.jobTitle}</p>}
        {(contactLine(personal) || linksLine(personal)) && (
          <p className="text-xs text-gray-500 mt-2 leading-relaxed"><ContactLinksContent personal={personal} /></p>
        )}
      </div>
      <div className="px-5 pb-5 space-y-4 text-sm border-t border-gray-100 pt-5">
        {overview && (
          <section>
            <SectionHeader>Summary</SectionHeader>
            <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{overview}</p>
          </section>
        )}
        {workExperience.length > 0 && (
          <section>
            <SectionHeader>Experience</SectionHeader>
            <ul className="space-y-2">
              {workExperience.map((w, i) => (
                <li key={i}>
                  <span className="font-medium">{w.jobTitle || "Role"}</span>
                  {w.company && <span className="text-gray-600"> at {w.company}</span>}
                  {(w.startDate || w.endDate) && <span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>}
                  {w.description && <p className="text-gray-700 mt-0.5">{w.description}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}
        {education.length > 0 && (
          <section>
            <SectionHeader>Education</SectionHeader>
            <ul className="space-y-2">
              {education.map((e, i) => (
                <li key={i}>
                  <span className="font-medium">{e.qualification || "Qualification"}</span>
                  {e.institution && <span className="text-gray-600"> — {e.institution}</span>}
                  {(e.startDate || e.endDate) && <span className="text-gray-500 text-xs block">{[e.startDate, e.endDate].filter(Boolean).join(" – ")}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}
        {keySkills.length > 0 && (
          <section>
            <SectionHeader>Skills</SectionHeader>
            <p className="text-gray-700">{keySkills.map((s) => s.name).filter(Boolean).join(", ") || "—"}</p>
          </section>
        )}
        {certifications.length > 0 && (
          <section>
            <SectionHeader>Certifications</SectionHeader>
            <ul className="space-y-1 text-gray-700">
              {certifications.map((c, i) => (
                <li key={i}>{c.name}{c.issuer && ` (${c.issuer})`}{c.date && ` — ${c.date}`}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

// —— Template 2: Clean Lines (thin dividers, uppercase grey headings) ——
function Template2({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, certifications, keySkills } = data;
  const H = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 border-b border-gray-100 pb-1.5 mb-2 mt-4 first:mt-0">{children}</h2>
  );
  return (
    <div className={CARD_BASE}>
      <div className="p-5">
        <h1 className="text-lg font-bold text-gray-900">{personal.fullName || "Your name"}</h1>
        {personal.jobTitle && <p className="text-sm text-gray-600">{personal.jobTitle}</p>}
        {(contactLine(personal) || linksLine(personal)) && <p className="text-xs text-gray-500 mt-1"><ContactLinksContent personal={personal} /></p>}
      </div>
      <div className="px-5 pb-5 text-sm">
        {overview && <><H>Summary</H><p className="whitespace-pre-wrap text-gray-700">{overview}</p></>}
        {workExperience.length > 0 && (
          <><H>Experience</H>
          <ul className="space-y-2">
            {workExperience.map((w, i) => (
              <li key={i}>
                <span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && ` at ${w.company}`}
                {(w.startDate || w.endDate) && <span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>}
                {w.description && <p className="text-gray-700 mt-0.5">{w.description}</p>}
              </li>
            ))}
          </ul></>
        )}
        {education.length > 0 && (
          <><H>Education</H>
          <ul className="space-y-1">
            {education.map((e, i) => (
              <li key={i}><span className="font-medium">{e.qualification || "—"}</span>{e.institution && ` — ${e.institution}`}</li>
            ))}
          </ul></>
        )}
        {keySkills.length > 0 && <><H>Skills</H><p className="text-gray-700">{keySkills.map((s) => s.name).filter(Boolean).join(", ")}</p></>}
        {certifications.length > 0 && <><H>Certifications</H><ul className="space-y-0.5 text-gray-700">{certifications.map((c, i) => <li key={i}>{c.name}{c.issuer && ` (${c.issuer})`}</li>)}</ul></>}
      </div>
    </div>
  );
}

// —— Template 3: Basic Two-Section (top block, then Experience, then Education & Skills) ——
function Template3({ data }: { data: CvPreviewData }) {
  const { personal, workExperience, education, keySkills } = data;
  return (
    <div className={`${CARD_BASE} h-full flex flex-col`}>
      <div className="p-4 bg-gray-50/80 border-b border-gray-100 shrink-0">
        <h1 className="text-base font-bold leading-tight line-clamp-1 text-gray-900">{personal.fullName || "Your name"}</h1>
        <p className="text-xs text-gray-600 mt-1 line-clamp-1"><ContactLinksContent personal={personal} /></p>
        {personal.jobTitle && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{personal.jobTitle}</p>}
      </div>
      <div className="p-4 space-y-3 text-sm flex-1 min-h-0 overflow-hidden flex flex-col">
        {workExperience.length > 0 && (
          <section className="min-w-0 min-h-0 overflow-hidden shrink-0">
            <h2 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1">Experience</h2>
            <ul className="space-y-0.5 [&>li:nth-child(n+3)]:hidden">
              {workExperience.map((w, i) => (
                <li key={i} className="flex justify-between gap-1 min-w-0">
                  <div className="min-w-0 truncate">
                    <span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && ` at ${w.company}`}
                    {w.description && <p className="text-gray-600 mt-0.5 line-clamp-1">{w.description}</p>}
                  </div>
                  {(w.startDate || w.endDate) && <span className="text-gray-500 text-xs shrink-0">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}
        <section className="border-t border-gray-100 pt-3 min-w-0 min-h-0 overflow-hidden flex-1">
          <h2 className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1.5">Education & Skills</h2>
          {education.length > 0 && (
            <ul className="space-y-0.5 mb-0.5 [&>li:nth-child(n+3)]:hidden">
              {education.map((e, i) => (
                <li key={i} className="truncate"><span className="font-medium">{e.qualification || "—"}</span>{e.institution && ` — ${e.institution}`}</li>
              ))}
            </ul>
          )}
          {keySkills.length > 0 && <p className="text-gray-700 line-clamp-2 truncate">{keySkills.map((s) => s.name).filter(Boolean).join(", ")}</p>}
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
    <div className={CARD_BASE}>
      <div className="h-2 w-full rounded-t-lg" style={{ backgroundColor: accent }} />
      <div className="p-5">
        <h1 className="text-xl font-bold" style={{ color: accent }}>{personal.fullName || "Your name"}</h1>
        {personal.jobTitle && <p className="text-sm text-gray-600">{personal.jobTitle}</p>}
        <p className="text-xs text-gray-500 mt-1"><ContactLinksContent personal={personal} /></p>
      </div>
      <div className="px-5 pb-5 space-y-3 text-sm border-t border-gray-100 pt-4">
        {overview && <section><h2 className="text-xs font-semibold uppercase tracking-wide pb-1 mb-1" style={{ color: accent }}>Summary</h2><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide pb-1 mb-1" style={{ color: accent }}>Experience</h2>
            <ul className="space-y-2">{workExperience.map((w, i) => (
              <li key={i}><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && ` at ${w.company}`}
                {(w.startDate || w.endDate) && <span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>}
                {w.description && <p className="text-gray-700 mt-0.5">{w.description}</p>}
              </li>
            ))}</ul>
          </section>
        )}
        {education.length > 0 && (
          <section><h2 className="text-xs font-semibold uppercase tracking-wide pb-1 mb-1" style={{ color: accent }}>Education</h2>
            <ul className="space-y-1">{education.map((e, i) => (
              <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>
            ))}</ul>
          </section>
        )}
        {keySkills.length > 0 && <section><h2 className="text-xs font-semibold uppercase tracking-wide pb-1 mb-1" style={{ color: accent }}>Skills</h2><p className="text-gray-700">{keySkills.map((s) => s.name).filter(Boolean).join(", ")}</p></section>}
        {certifications.length > 0 && <section><h2 className="text-xs font-semibold uppercase tracking-wide pb-1 mb-1" style={{ color: accent }}>Certifications</h2><ul className="space-y-0.5">{certifications.map((c, i) => <li key={i}>{c.name}</li>)}</ul></section>}
      </div>
    </div>
  );
}

// —— Template 5: Left Accent Border ——
function Template5({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills } = data;
  const accent = data.accentColor || ACCENT;
  return (
    <div className={`${CARD_BASE} flex`}>
      <div className="w-1.5 shrink-0 rounded-l-lg" style={{ backgroundColor: accent }} />
      <div className="flex-1 p-5">
        <h1 className="text-lg font-bold">{personal.fullName || "Your name"}</h1>
        {personal.jobTitle && <p className="text-sm text-gray-600">{personal.jobTitle}</p>}
        <p className="text-xs text-gray-500 mt-1"><ContactLinksContent personal={personal} /></p>
        <div className="mt-4 space-y-3 text-sm border-t border-gray-100 pt-4">
          {overview && <section><h2 className="text-xs font-bold text-gray-700 mb-1">Summary</h2><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
          {workExperience.length > 0 && (
            <section><h2 className="text-xs font-bold text-gray-700 mb-1">Experience</h2>
              <ul className="space-y-2">{workExperience.map((w, i) => (
                <li key={i}><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && ` at ${w.company}`}
                  {(w.startDate || w.endDate) && <span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>}
                  {w.description && <p className="text-gray-700 mt-0.5">{w.description}</p>}
                </li>
              ))}</ul>
            </section>
          )}
          {education.length > 0 && <section><h2 className="text-xs font-bold text-gray-700 mb-1">Education</h2><ul className="space-y-1">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
          {keySkills.length > 0 && <section><h2 className="text-xs font-bold text-gray-700 mb-1">Skills</h2><p className="text-gray-700">{keySkills.map((s) => s.name).filter(Boolean).join(", ")}</p></section>}
        </div>
      </div>
    </div>
  );
}

// —— Template 6: David Miller style – single column, photo left, name uppercase, contact right, dates left in exp/edu ——
function Template6({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills } = data;
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
          <p>{personal.phone}</p>
          <p>{personal.email}</p>
        </div>
      </div>
      <div className="p-4 text-sm space-y-3">
        {overview && <section><h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200 pb-1 mb-1">Summary</h2><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && (
          <section><h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200 pb-1 mb-1">Experience</h2>
            <ul className="space-y-2">{workExperience.map((w, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-gray-500 text-xs shrink-0 w-20">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>
                <div><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && `, ${w.company}`} {personal.currentLocation && <span className="text-gray-500">· {personal.currentLocation}</span>}
                  {w.description && <ul className="list-disc pl-4 mt-0.5 text-gray-700">{w.description.split(/[.\n]/).filter(Boolean).slice(0, 2).map((line, j) => <li key={j}>{line}</li>)}</ul>}
                </div>
              </li>
            ))}</ul>
          </section>
        )}
        {education.length > 0 && <section><h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200 pb-1 mb-1">Education</h2>
          <ul className="space-y-1">{education.map((e, i) => (
            <li key={i} className="flex gap-3"><span className="text-gray-500 text-xs shrink-0 w-20">{[e.startDate, e.endDate].filter(Boolean).join(" – ")}</span><span>{e.qualification || "—"}{e.institution && `, ${e.institution}`}</span></li>
          ))}</ul>
        </section>}
        {keySkills.length > 0 && <section><h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200 pb-1 mb-1">Skills</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-700">{keySkills.map((s, i) => <span key={i}>{s.name} — {s.level || "Expert"}</span>)}</div>
        </section>}
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
            <p className="text-xs text-gray-600">{personal.phone} · {personal.email}</p>
            {personal.website && <p className="text-xs text-gray-600">{personal.website}</p>}
          </div>
        </div>
        <div className="pt-3 space-y-3 text-sm">
          {overview && <section><h2 className="text-[10px] font-bold uppercase text-gray-500 mb-1">Summary</h2><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
          {workExperience.length > 0 && <section><h2 className="text-[10px] font-bold uppercase text-gray-500 mb-1">Work Experience</h2>
            <ul className="space-y-2">{workExperience.map((w, i) => (
              <li key={i} className="flex gap-2"><span className="text-gray-500 text-xs shrink-0 w-24">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>
                <div><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && `, ${w.company}`} {w.description && <p className="text-gray-700 mt-0.5">{w.description}</p>}</div>
              </li>
            ))}</ul>
          </section>}
          {education.length > 0 && <section><h2 className="text-[10px] font-bold uppercase text-gray-500 mb-1">Education</h2>
            <ul className="space-y-1">{education.map((e, i) => <li key={i} className="flex gap-2"><span className="text-gray-500 text-xs shrink-0 w-24">{[e.startDate, e.endDate].filter(Boolean).join(" – ")}</span>{e.qualification || "—"}{e.institution && `, ${e.institution}`}</li>)}</ul>
          </section>}
          {keySkills.length > 0 && <section><h2 className="text-[10px] font-bold uppercase text-gray-500 mb-1">Skills</h2><div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-700">{keySkills.map((s, i) => <span key={i}>{s.name} — {s.level || "Expert"}</span>)}</div></section>}
          {certifications.length > 0 && <section><h2 className="text-[10px] font-bold uppercase text-gray-500 mb-1">References</h2><p className="text-xs text-gray-600">Available on request</p></section>}
          <CustomSectionsBlock sections={data.customSections ?? []} accent={data.accentColor} className="mt-3" />
        </div>
      </div>
    </div>
  );
}

// —— Template 8: Helen Hart style – photo left, name + title, address; contact two columns right; light blue gradient ——
function Template8({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills } = data;
  const name = personal.fullName || "Your name";
  return (
    <div className={`${CARD_BASE} bg-gradient-to-b from-sky-50/80 to-white`}>
      <div className="p-4 flex items-start justify-between gap-4 border-b border-sky-100">
        <div className="flex items-start gap-3">
          <CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={data.accentColor} className="w-14 h-14" />
          <div>
            <h1 className="text-base font-bold">{name}{personal.jobTitle ? `, ${personal.jobTitle}` : ""}</h1>
            <p className="text-xs text-gray-600 mt-0.5">{personal.currentLocation}</p>
          </div>
        </div>
        <div className="flex gap-6 text-xs text-gray-600 text-right">
          <div><p>{personal.phone}</p></div>
          <div><p>{personal.email}</p></div>
        </div>
      </div>
      <div className="p-4 space-y-3 text-sm">
        {overview && <section><h2 className="text-[10px] font-bold uppercase text-gray-500 mb-1">Summary</h2><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && <section><h2 className="text-[10px] font-bold uppercase text-gray-500 mb-1">Work Experience</h2>
          <ul className="space-y-2">{workExperience.map((w, i) => (
            <li key={i} className="flex gap-2"><span className="text-gray-500 text-xs shrink-0 w-24">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>
              <div><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && `, ${w.company}`} {w.description && <p className="text-gray-700 mt-0.5">{w.description}</p>}</div>
            </li>
          ))}</ul>
        </section>}
        {education.length > 0 && <section><h2 className="text-[10px] font-bold uppercase text-gray-500 mb-1">Education</h2>
          <ul className="space-y-1">{education.map((e, i) => <li key={i} className="flex gap-2"><span className="text-gray-500 text-xs shrink-0 w-24">{[e.startDate, e.endDate].filter(Boolean).join(" – ")}</span>{e.qualification || "—"}{e.institution && `, ${e.institution}`}</li>)}</ul>
        </section>}
        {keySkills.length > 0 && <section><h2 className="text-[10px] font-bold uppercase text-gray-500 mb-1">Skills</h2><div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-700">{keySkills.map((s, i) => <span key={i}>{s.name} — {s.level || "Expert"}</span>)}</div></section>}
        <CustomSectionsBlock sections={data.customSections ?? []} accent={data.accentColor} className="mt-3" />
      </div>
    </div>
  );
}

// —— Template 9: Jack Clark style – minimal, small photo, name uppercase + title, contact below; Skills two-col Expert ——
function Template9({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills } = data;
  const name = personal.fullName || "Your name";
  return (
    <div className={CARD_BASE}>
      <div className="p-4 flex items-center gap-3 border-b border-gray-200">
        <CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={data.accentColor} className="w-11 h-11" />
        <div>
          <h1 className="text-xs font-bold uppercase tracking-wide">{name}</h1>
          {personal.jobTitle && <p className="text-xs font-bold uppercase tracking-wide text-gray-600 mt-0.5">{personal.jobTitle}</p>}
          <p className="text-xs text-gray-500 mt-1">{personal.currentLocation} · {personal.phone} · {personal.email}</p>
        </div>
      </div>
      <div className="p-4 space-y-3 text-sm">
        {overview && <section><h2 className="text-[10px] font-bold uppercase text-gray-500 border-b border-gray-200 pb-1 mb-1">Summary</h2><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {keySkills.length > 0 && <section><h2 className="text-[10px] font-bold uppercase text-gray-500 border-b border-gray-200 pb-1 mb-1">Skills</h2><div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-700">{keySkills.map((s, i) => <span key={i}>{s.name} — {s.level || "Expert"}</span>)}</div></section>}
        {workExperience.length > 0 && <section><h2 className="text-[10px] font-bold uppercase text-gray-500 border-b border-gray-200 pb-1 mb-1">Experience</h2><ul className="space-y-2">{workExperience.map((w, i) => <li key={i}><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && `, ${w.company}`} · {[w.startDate, w.endDate].filter(Boolean).join(" – ")} {w.description && <p className="text-gray-700 mt-0.5">{w.description}</p>}</li>)}</ul></section>}
        {education.length > 0 && <section><h2 className="text-[10px] font-bold uppercase text-gray-500 border-b border-gray-200 pb-1 mb-1">Education</h2><ul className="space-y-0.5">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        <CustomSectionsBlock sections={data.customSections ?? []} accent={data.accentColor} className="mt-3" />
      </div>
    </div>
  );
}

// —— Template 10: Maria Dean style – dark blue full-width header, photo in header, name + title + contact in white ——
function Template10({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills } = data;
  const name = personal.fullName || "Your name";
  const accent = data.accentColor || ACCENT;
  return (
    <div className={CARD_BASE}>
      <div className="py-4 px-4 text-white flex items-center gap-4" style={{ backgroundColor: accent }}>
        <CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={data.accentColor} className="w-16 h-16 border-white" ring="border-2 border-white" />
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold">{name}</h1>
          {personal.jobTitle && <p className="text-sm opacity-95">{personal.jobTitle}</p>}
          <p className="text-xs opacity-90 mt-1">{personal.currentLocation} · {personal.phone} · {personal.email}</p>
        </div>
      </div>
      <div className="p-4 space-y-3 text-sm">
        {overview && <section><h2 className="text-xs font-bold text-gray-900 mb-1">Summary</h2><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && <section><h2 className="text-xs font-bold text-gray-900 mb-1">Work Experience</h2><ul className="space-y-2">{workExperience.map((w, i) => (<li key={i}><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && `, ${w.company}`} <span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{w.description && <p className="text-gray-700 mt-0.5">{w.description}</p>}</li>))}</ul></section>}
        {education.length > 0 && <section><h2 className="text-xs font-bold text-gray-900 mb-1">Education</h2><ul className="space-y-0.5">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        {keySkills.length > 0 && <section><h2 className="text-xs font-bold text-gray-900 mb-1">Skills</h2><div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-700">{keySkills.map((s, i) => <span key={i}>{s.name} — {s.level || "Expert"}</span>)}</div></section>}
        <CustomSectionsBlock sections={data.customSections ?? []} accent={data.accentColor} className="mt-3" />
      </div>
    </div>
  );
}

// —— Template 11: Emma Carter style – single column, avatar left, name/title left + contact right; thin lines before sections; dates right-aligned ——
function Template11({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills } = data;
  const name = personal.fullName || "Your name";
  const Sect = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section><div className="border-t border-gray-300 pt-2 mt-2 first:border-0 first:pt-0 first:mt-0"><h2 className="text-[10px] font-bold uppercase text-gray-700 mb-1">{title}</h2>{children}</div></section>
  );
  return (
    <div className={CARD_BASE}>
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={data.accentColor} className="w-12 h-12 shrink-0" />
          <div>
            <h1 className="text-base font-bold uppercase tracking-tight">{name}</h1>
            {personal.jobTitle && <p className="text-xs text-gray-600 uppercase">{personal.jobTitle}</p>}
          </div>
        </div>
        <p className="text-[10px] text-gray-500 text-right shrink-0">{personal.currentLocation}<br />{personal.phone}<br />{personal.email}</p>
      </div>
      <div className="px-4 pb-4 text-sm">
        {overview && <Sect title="Summary"><p className="whitespace-pre-wrap text-gray-700">{overview}</p></Sect>}
        {workExperience.length > 0 && <Sect title="Experience"><ul className="space-y-2">{workExperience.map((w, i) => (<li key={i} className="flex justify-between gap-4"><div className="min-w-0"><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}{w.location && `, ${w.location}`}<br />{w.description && <span className="text-gray-700">{w.description}</span>}</div><span className="text-gray-500 text-xs shrink-0 text-right">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span></li>))}</ul></Sect>}
        {education.length > 0 && <Sect title="Education"><ul className="space-y-1">{education.map((e, i) => (<li key={i} className="flex justify-between gap-4"><span>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</span><span className="text-gray-500 text-xs shrink-0">{[e.startDate, e.endDate].filter(Boolean).join(" – ")}</span></li>))}</ul></Sect>}
        {keySkills.length > 0 && <Sect title="Skills"><div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-700">{keySkills.map((s, i) => <span key={i}>{s.name} — {s.level || "Expert"}</span>)}</div></Sect>}
        <CustomSectionsBlock sections={data.customSections ?? []} accent={data.accentColor} className="mt-3" />
      </div>
    </div>
  );
}

// —— Template 12: Helen Willis style – classic B&W, centered avatar above name, PROFESSIONAL SUMMARY, WORK EXPERIENCE, LANGUAGES, EDUCATION, SKILLS; serif feel ——
function Template12({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills } = data;
  const name = personal.fullName || "Your name";
  const H = ({ children }: { children: React.ReactNode }) => <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-600 border-b border-gray-200 pb-1 mb-1.5">{children}</h2>;
  return (
    <div className={`${CARD_BASE} font-serif`}>
      <div className="p-4 text-center">
        <div className="flex justify-center mb-2"><CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={data.accentColor} className="w-14 h-14" /></div>
        <h1 className="text-base font-bold uppercase tracking-wide">{name}</h1>
        {personal.jobTitle && <p className="text-xs text-gray-600 uppercase mt-0.5">{personal.jobTitle}</p>}
      </div>
      <div className="px-4 pb-4 text-sm space-y-3">
        {overview && <section><H>Professional Summary</H><p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{overview}</p></section>}
        {workExperience.length > 0 && <section><H>Work Experience</H><ul className="space-y-2">{workExperience.map((w, i) => (<li key={i}><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{w.description && <p className="text-gray-700 mt-0.5">{w.description}</p>}</li>))}</ul></section>}
        {education.length > 0 && <section><H>Education</H><ul className="space-y-0.5">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        {keySkills.length > 0 && <section><H>Skills</H><p className="text-gray-700">{keySkills.map((s) => s.name).filter(Boolean).join(", ")}</p></section>}
        <CustomSectionsBlock sections={data.customSections ?? []} accent={data.accentColor} className="mt-3" />
      </div>
    </div>
  );
}

// —— Template 13: Theo Ramos style – teal left sidebar (avatar, contact, SUMMARY, SKILLS); right white: WORK EXPERIENCE, EDUCATION, REFERENCES ——
function Template13({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  const accent = data.accentColor || "#0d9488";
  return (
    <div className={`${CARD_BASE} h-full flex min-w-0`}>
      <div className="w-[32%] min-w-0 p-2 text-white text-xs shrink-0 flex flex-col overflow-hidden" style={{ backgroundColor: accent }}>
        <div className="flex justify-center mb-1 shrink-0"><CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={data.accentColor} className="w-10 h-10 border-white" ring="border-2 border-white" /></div>
        <p className="opacity-95 truncate">{personal.currentLocation}</p>
        <p className="opacity-95 truncate">{personal.phone}</p>
        <p className="opacity-95 truncate">{personal.email}</p>
        {overview && <div className="mt-1.5 flex-1 min-h-0 overflow-hidden"><h2 className="text-[10px] font-bold uppercase tracking-wider opacity-90 mb-0.5">Summary</h2><p className="whitespace-pre-wrap opacity-95 line-clamp-3 text-[10px]">{overview}</p></div>}
        {keySkills.length > 0 && <div className="mt-1.5 shrink-0"><h2 className="text-[10px] font-bold uppercase tracking-wider opacity-90 mb-0.5">Skills</h2><ul className="space-y-0.5 opacity-95 [&>li:nth-child(n+4)]:hidden">{keySkills.map((s, i) => <li key={i} className="truncate">{s.name}</li>)}</ul></div>}
      </div>
      <div className="flex-1 p-2 text-sm min-w-0 overflow-hidden flex flex-col">
        <h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-100 pb-1 mb-1">Work Experience</h2>
        {workExperience.length > 0 ? <ul className="space-y-1 flex-1 min-h-0 overflow-hidden [&>li:nth-child(n+3)]:hidden">{workExperience.map((w, i) => (<li key={i}><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{w.description && <p className="text-gray-700 mt-0.5 line-clamp-2">{w.description}</p>}</li>))}</ul> : <p className="text-gray-500">—</p>}
        <h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-100 pb-1 mb-1 mt-1.5">Education</h2>
        {education.length > 0 ? <ul className="space-y-0.5">{education.slice(0, 2).map((e, i) => <li key={i} className="truncate">{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul> : <p className="text-gray-500">—</p>}
        <h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-100 pb-1 mb-0.5 mt-1">References</h2>
        <p className="text-gray-600 text-xs truncate">{certifications.length ? certifications.map((c) => c.name).join(" · ") : "Available upon request"}</p>
        <CustomSectionsBlock sections={data.customSections ?? []} accent={accent} className="mt-2" />
      </div>
    </div>
  );
}

// —— Template 14: Alisha Hill style – light green accent shape behind avatar, section titles with small green icons; light blue gradient ——
function Template14({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills } = data;
  const name = personal.fullName || "Your name";
  const accent = data.accentColor || "#16a34a";
  const Icon = () => <span className="inline-block w-2 h-2 rounded-full mr-1.5 shrink-0 mt-0.5 align-middle" style={{ backgroundColor: accent }} />;
  return (
    <div className={`${CARD_BASE} bg-gradient-to-b from-sky-50/80 to-white`}>
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
      <div className="px-4 pb-4 text-sm space-y-2.5">
        {overview && <section><h2 className="text-[10px] font-bold flex items-center" style={{ color: accent }}><Icon />Summary</h2><p className="whitespace-pre-wrap text-gray-700 mt-0.5">{overview}</p></section>}
        <section><h2 className="text-[10px] font-bold flex items-center" style={{ color: accent }}><Icon />Contacts</h2><p className="text-gray-600 text-xs mt-0.5">{personal.currentLocation} · {personal.phone} · {personal.email}</p></section>
        {keySkills.length > 0 && <section><h2 className="text-[10px] font-bold flex items-center" style={{ color: accent }}><Icon />Skills</h2><p className="text-gray-700 text-xs mt-0.5">{keySkills.map((s) => s.name).filter(Boolean).join(", ")}</p></section>}
        {workExperience.length > 0 && <section><h2 className="text-[10px] font-bold flex items-center" style={{ color: accent }}><Icon />Experience</h2><ul className="space-y-1 mt-0.5">{workExperience.map((w, i) => (<li key={i}><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`} <span className="text-gray-500 text-xs">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span></li>))}</ul></section>}
        {education.length > 0 && <section><h2 className="text-[10px] font-bold flex items-center" style={{ color: accent }}><Icon />Education</h2><ul className="space-y-0.5 mt-0.5">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        <section><h2 className="text-[10px] font-bold flex items-center" style={{ color: accent }}><Icon />References</h2><p className="text-gray-600 text-xs mt-0.5">Available upon request</p></section>
        <CustomSectionsBlock sections={data.customSections ?? []} accent={accent} className="mt-2" />
      </div>
    </div>
  );
}

// —— Template 15: Samantha Lewis style – two columns; left: contacts (icons), skills/languages as yellow-green rounded buttons; right: summary, experience, education; header yellow-green ——
function Template15({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills } = data;
  const name = personal.fullName || "Your name";
  const accent = data.accentColor || "#84cc16";
  return (
    <div className={`${CARD_BASE} flex`}>
      <div className="w-[36%] p-3 text-sm border-r border-gray-100">
        <div className="py-2 px-3 mb-2 text-white font-bold text-sm rounded" style={{ backgroundColor: accent }}>{name}</div>
        {personal.jobTitle && <p className="text-xs text-gray-700 mb-2">{personal.jobTitle}</p>}
        <p className="text-[10px] text-gray-600 mb-1">{personal.email}</p>
        <p className="text-[10px] text-gray-600 mb-1">{personal.currentLocation}</p>
        <p className="text-[10px] text-gray-600 mb-3">{personal.phone}</p>
        {keySkills.length > 0 && <><h2 className="text-[10px] font-bold uppercase text-gray-600 mb-1">Skills</h2><div className="flex flex-wrap gap-1">{keySkills.slice(0, 4).map((s, i) => <span key={i} className="text-[10px] px-2 py-0.5 rounded text-white" style={{ backgroundColor: accent }}>{s.name} — {s.level || "Expert"}</span>)}</div></>}
        <h2 className="text-[10px] font-bold uppercase text-gray-600 mt-2 mb-1">Languages</h2>
        <div className="flex flex-wrap gap-1"><span className="text-[10px] px-2 py-0.5 rounded text-white" style={{ backgroundColor: accent }}>English — Native</span></div>
      </div>
      <div className="flex-1 p-3 text-sm">
        {overview && <section className="mb-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 mb-0.5">Summary</h2><p className="whitespace-pre-wrap text-gray-700 line-clamp-3">{overview}</p></section>}
        {workExperience.length > 0 && <section><h2 className="text-[10px] font-bold uppercase text-gray-600 mb-0.5">Experience</h2><ul className="space-y-1.5">{workExperience.map((w, i) => (<li key={i}><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{w.description && <span className="text-gray-700">{w.description}</span>}</li>))}</ul></section>}
        {education.length > 0 && <section className="mt-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 mb-0.5">Education</h2><ul className="space-y-0.5">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        <CustomSectionsBlock sections={data.customSections ?? []} accent={accent} className="mt-2" />
      </div>
    </div>
  );
}

// —— Template 16: Mia Bennett style – dark blue/purple left sidebar (avatar, name, contact, skills, languages); right white: Summary, Work History, Education ——
function Template16({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills } = data;
  const name = personal.fullName || "Your name";
  const accent = data.accentColor || "#4338ca";
  return (
    <div className={`${CARD_BASE} flex`}>
      <div className="w-[35%] p-3 text-white text-xs" style={{ backgroundColor: accent }}>
        <div className="flex justify-center mb-2"><CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={data.accentColor} className="w-14 h-14 border-white" ring="border-2 border-white" /></div>
        <h1 className="text-center font-bold text-sm">{name}</h1>
        <p className="mt-2 opacity-90">{personal.currentLocation}</p>
        <p className="opacity-90">{personal.phone}</p>
        <p className="opacity-90">{personal.email}</p>
        {keySkills.length > 0 && <div className="mt-3"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-1">Skills</h2><ul className="space-y-0.5 opacity-90">{keySkills.map((s, i) => <li key={i}>{s.name} — {s.level || "Expert"}</li>)}</ul></div>}
        <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Languages</h2><p className="opacity-90">English — Native</p></div>
      </div>
      <div className="flex-1 p-4 text-sm">
        {overview && <section className="mb-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 mb-0.5">Summary</h2><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && <section><h2 className="text-[10px] font-bold uppercase text-gray-600 mb-0.5">Work History</h2><ul className="space-y-2">{workExperience.map((w, i) => (<li key={i}><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{w.description && <p className="text-gray-700 mt-0.5">{w.description}</p>}</li>))}</ul></section>}
        {education.length > 0 && <section className="mt-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 mb-0.5">Education</h2><ul className="space-y-0.5">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
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
    <div className={`${CARD_BASE} flex`}>
      <div className="flex-1 p-4 text-sm min-w-0">
        <h1 className="text-base font-bold uppercase tracking-tight">{name}</h1>
        {personal.jobTitle && <p className="text-xs text-gray-600">{personal.jobTitle}</p>}
        <p className="text-[10px] text-gray-500 mt-0.5">{personal.phone} · {personal.email} · {personal.currentLocation}</p>
        {overview && <section className="mt-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-100 pb-1 mb-0.5">Summary</h2><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && <section className="mt-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-100 pb-1 mb-0.5">Work Experience</h2><ul className="space-y-1.5">{workExperience.map((w, i) => (<li key={i}><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{w.description && <p className="text-gray-700 mt-0.5">{w.description}</p>}</li>))}</ul></section>}
        {education.length > 0 && <section className="mt-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-100 pb-1 mb-0.5">Education</h2><ul className="space-y-0.5">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        <section className="mt-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-100 pb-1 mb-0.5">References</h2><p className="text-gray-600 text-xs">{certifications.length ? certifications[0].name : "Available upon request"}</p></section>
        <CustomSectionsBlock sections={data.customSections ?? []} accent={data.accentColor} className="mt-2" />
      </div>
      <div className="w-[32%] p-3 text-white text-xs" style={{ backgroundColor: data.accentColor || ACCENT }}>
        <div className="flex justify-center mb-2"><CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={data.accentColor} className="w-12 h-12 border-white" ring="border-2 border-white" /></div>
        {keySkills.length > 0 && <div><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Skills</h2><ul className="space-y-0.5 opacity-90">{keySkills.map((s, i) => <li key={i}>{s.name} — {s.level || "Expert"}</li>)}</ul></div>}
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
  const accent = data.accentColor || "#0f766e";
  return (
    <div className={`${CARD_BASE} flex`}>
      <div className="w-[36%] p-3 text-white text-xs" style={{ backgroundColor: accent }}>
        <div className="flex justify-center mb-2"><CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={data.accentColor} className="w-14 h-14 border-white" ring="border-2 border-white" /></div>
        <h1 className="text-center font-bold text-sm">{name}</h1>
        {personal.jobTitle && <p className="text-center text-[10px] opacity-90 mt-0.5">{personal.jobTitle}</p>}
        <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Details</h2><p className="opacity-90">{personal.currentLocation}</p><p className="opacity-90">{personal.email}</p><p className="opacity-90">{personal.phone}</p></div>
        {keySkills.length > 0 && <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Skills</h2><ul className="space-y-0.5 opacity-90">{keySkills.map((s, i) => <li key={i}>{s.name}</li>)}</ul></div>}
        <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Languages</h2><p className="opacity-90">English</p></div>
        {(personal.linkedinUrl || personal.website || certifications.length > 0) && <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Links</h2><p className="opacity-90 text-[10px]">{[personal.linkedinUrl, personal.website, certifications[0]?.name].filter(Boolean).join(" · ")}</p></div>}
        <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Hobbies</h2><p className="opacity-90 text-[10px]">—</p></div>
      </div>
      <div className="flex-1 p-4 text-sm">
        {overview && <section className="mb-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-100 pb-1 mb-0.5">Summary</h2><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && <section><h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-100 pb-1 mb-0.5">Work Experience</h2><ul className="space-y-1.5">{workExperience.map((w, i) => (<li key={i}><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{w.description && <p className="text-gray-700 mt-0.5">{w.description}</p>}</li>))}</ul></section>}
        {education.length > 0 && <section className="mt-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-100 pb-1 mb-0.5">Education</h2><ul className="space-y-0.5">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        <section className="mt-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-100 pb-1 mb-0.5">References</h2><p className="text-gray-600 text-xs">Available upon request</p></section>
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
  const accent = data.accentColor || "#ea580c";
  return (
    <div className={`${CARD_BASE} flex`}>
      <div className="w-[30%] p-3 text-white text-xs" style={{ backgroundColor: grey }}>
        <div className="flex justify-center mb-2"><CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={data.accentColor} className="w-12 h-12 border-white" ring="border-2 border-white" /></div>
        <h2 className="text-[10px] font-bold uppercase mb-0.5">Contacts</h2>
        <p className="opacity-90">{personal.email}</p>
        <p className="opacity-90">{personal.currentLocation}</p>
        <p className="opacity-90">{personal.phone}</p>
        {education.length > 0 && <div className="mt-2"><h2 className="text-[10px] font-bold uppercase mb-0.5">Education</h2><ul className="space-y-0.5 opacity-90">{education.map((e, i) => <li key={i}>{e.qualification}{e.institution && ` — ${e.institution}`}</li>)}</ul></div>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="py-2 px-4 flex justify-between items-center text-white" style={{ backgroundColor: accent }}>
          <span className="text-xs font-bold">{personal.jobTitle || "Job Title"}</span>
          <span className="text-sm font-bold uppercase tracking-wide">{name}</span>
        </div>
        <div className="p-4 text-sm">
          {overview && <section className="mb-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 mb-0.5">Professional Summary</h2><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
          {keySkills.length > 0 && <section className="mb-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 mb-0.5">Skills</h2><div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-700">{keySkills.map((s, i) => <span key={i}>{s.name} — {s.level || "Expert"}</span>)}</div></section>}
          {workExperience.length > 0 && <section><h2 className="text-[10px] font-bold uppercase text-gray-600 mb-0.5">Work Experience</h2><ul className="space-y-1.5">{workExperience.map((w, i) => (<li key={i}><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{w.description && <p className="text-gray-700 mt-0.5">{w.description}</p>}</li>))}</ul></section>}
          {(certifications.length > 0 || personal.website) && <section className="mt-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 mb-0.5">Links</h2><p className="text-gray-600 text-xs">{[personal.website, certifications[0]?.name].filter(Boolean).join(" · ")}</p></section>}
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
    <div className={`${CARD_BASE} flex`}>
      <div className="flex-1 p-4 text-sm min-w-0">
        <div className="flex items-start gap-3">
          <CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={data.accentColor} className="w-12 h-12 shrink-0" />
          <div>
            <h1 className="text-base font-bold">{name}</h1>
            {personal.jobTitle && <p className="text-xs text-gray-600">{personal.jobTitle}</p>}
          </div>
        </div>
        {overview && <section className="mt-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-100 pb-1 mb-0.5">Summary</h2><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && <section className="mt-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-100 pb-1 mb-0.5">Work Experience</h2><ul className="space-y-1.5">{workExperience.map((w, i) => (<li key={i}><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{w.description && <p className="text-gray-700 mt-0.5">{w.description}</p>}</li>))}</ul></section>}
        {education.length > 0 && <section className="mt-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-100 pb-1 mb-0.5">Education</h2><ul className="space-y-0.5">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        <section className="mt-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-100 pb-1 mb-0.5">References</h2><p className="text-gray-600 text-xs">Available upon request</p></section>
        <section className="mt-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-100 pb-1 mb-0.5">Languages</h2><p className="text-gray-600 text-xs">English</p></section>
        {(personal.linkedinUrl || personal.website || certifications.length > 0) && <section className="mt-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-100 pb-1 mb-0.5">Links</h2><p className="text-gray-600 text-xs">{[personal.linkedinUrl, personal.website, certifications[0]?.name].filter(Boolean).join(" · ")}</p></section>}
        <CustomSectionsBlock sections={data.customSections ?? []} accent={data.accentColor} className="mt-2" />
      </div>
      <div className="w-[28%] p-3 text-white text-xs" style={{ backgroundColor: data.accentColor || ACCENT }}>
        <h2 className="text-[10px] font-bold uppercase opacity-90 mb-1">Details</h2>
        <p className="opacity-90">{personal.currentLocation}</p>
        <p className="opacity-90">{personal.phone}</p>
        <p className="opacity-90">{personal.email}</p>
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
  const content = (
    <div className={hasQr ? "relative" : ""}>
      <CvLinkTrackingContext.Provider value={onLinkClick ?? null}>
        <Component data={data} />
      {hasQr && (
        <div className="absolute bottom-2 right-2 flex flex-col items-center gap-0.5 bg-white/95 p-1.5 rounded border border-gray-200/80 shadow-sm">
          <CvQrCode url={data.cvOnlineUrl!} size={52} />
          <span className="text-[9px] text-gray-600 leading-tight text-center">Scan for online CV</span>
        </div>
      )}
      </CvLinkTrackingContext.Provider>
    </div>
  );
  if (compact) {
    return (
      <div className="cv-preview-compact h-full max-h-[373px] overflow-hidden text-[8px] [&_h1]:!text-[10px] [&_h2]:!text-[7px] [&_p]:!text-[8px] [&_li]:!text-[8px] [&_span]:!text-[8px] leading-[1.2] [&_*]:!leading-[1.2] [&_.p-5]:!p-2 [&_.p-4]:!p-2 [&_.px-5]:!px-2 [&_.pb-5]:!pb-2">
        {content}
      </div>
    );
  }
  return content;
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
