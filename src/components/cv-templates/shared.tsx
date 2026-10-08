import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import type { CvPreviewData, CustomSection } from "./types";

export const ACCENT = "#1e3a5f";

/** Shared base style applied to all templates */
export const CARD_BASE = "bg-white text-slate-900 overflow-hidden min-h-[280px]";
export const PROFESSIONAL_CANVAS =
  "font-sans antialiased [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:leading-tight [&_h1]:text-slate-900 [&_h2]:text-[10px] [&_h2]:font-semibold [&_h2]:uppercase [&_h2]:tracking-[0.16em] [&_h2]:text-slate-700 [&_p]:text-slate-700 [&_p]:leading-relaxed [&_li]:text-slate-700 [&_li]:leading-relaxed [&_.text-gray-900]:!text-slate-900 [&_.text-gray-800]:!text-slate-800 [&_.text-gray-700]:!text-slate-700 [&_.text-gray-600]:!text-slate-600 [&_.text-gray-500]:!text-slate-500 [&_.border-gray-100]:!border-slate-200/70 [&_.border-gray-200]:!border-slate-200 [&_.cv-dark-sidebar_h1]:!text-white [&_.cv-dark-sidebar_h2]:!text-white [&_.cv-dark-sidebar_p]:!text-white/90 [&_.cv-dark-sidebar_li]:!text-white/90 [&_.cv-dark-sidebar_.text-gray-900]:!text-white [&_.cv-dark-sidebar_.text-gray-800]:!text-white/90 [&_.cv-dark-sidebar_.text-gray-700]:!text-white/85 [&_.cv-dark-sidebar_.text-gray-600]:!text-white/80 [&_.cv-dark-sidebar_.text-gray-500]:!text-white/70";

/** Section header – clean uppercase with accent support */
export function SectionHeader({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <h2
      data-cv-heading=""
      className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600 border-b border-slate-200 pb-1.5 mb-2"
      style={accent ? { color: accent, borderColor: accent + "40" } : undefined}
    >
      {children}
    </h2>
  );
}

/** Renders a QR code that links to the online CV. */
export function CvQrCode({ url, size = 56, className = "" }: { url: string; size?: number; className?: string }) {
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
export function CvOnlineQrHeader({ url }: { url: string }) {
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

/** Renders custom sections block for paid templates */
export function CustomSectionsBlock({ sections, accent, className = "" }: { sections: CustomSection[]; accent?: string; className?: string }) {
  if (!sections?.length) return null;
  const color = accent || ACCENT;
  return (
    <>
      {sections.map((s) => (
        s.title.trim() || s.content.trim() ? (
          <section key={s.id} data-cv-block="" className={className}>
            <h2 className="text-[11px] font-semibold uppercase tracking-wider border-b border-gray-200 pb-1 mb-1.5" style={{ color }}>{s.title || "Section"}</h2>
            <p className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">{s.content || "—"}</p>
          </section>
        ) : null
      ))}
    </>
  );
}

export function contactLine(p: CvPreviewData["personal"]): string {
  return [p.email, p.phone, p.currentLocation].filter(Boolean).join(" • ");
}

export function normalizeEmail(email: string): string {
  if (!email) return "";
  const normalized = (email || "")
    .normalize("NFKC")
    // Strip format / invisible characters from pasted emails (explicit Unicode ranges)
    // eslint-disable-next-line no-control-regex, no-misleading-character-class -- intentional sanitization
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

export function normalizeText(value: string): string {
  return (value || "")
    .replace(/[\u00A0\u200B-\u200D\uFEFF]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeOptionalText(value?: string): string | undefined {
  if (value == null) return undefined;
  const normalized = normalizeText(value);
  return normalized || undefined;
}

export function linksLine(p: CvPreviewData["personal"]): string {
  return [p.linkedinUrl, p.website].filter(Boolean).join(" • ");
}

export function buildPersonalDetailsSection(personal: CvPreviewData["personal"]): CustomSection | null {
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

export const CvLinkTrackingContext = React.createContext<((url: string) => void) | null>(null);

/** Renders email as a clickable mailto link when onLinkClick is available */
export function EmailLink({ email, className = "text-inherit" }: { email: string; className?: string }) {
  const onLinkClick = React.useContext(CvLinkTrackingContext);
  if (!email) return null;
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) return null;
  return <a href={`mailto:${cleanEmail}`} className={`${className} no-underline hover:opacity-80`} onClick={() => onLinkClick?.(`mailto:${cleanEmail}`)}>{cleanEmail}</a>;
}

/** Renders phone as a clickable tel link when onLinkClick is available */
export function PhoneLink({ phone, className = "text-inherit" }: { phone: string; className?: string }) {
  const onLinkClick = React.useContext(CvLinkTrackingContext);
  if (!phone) return null;
  const cleanPhone = normalizeText(phone);
  if (!cleanPhone) return null;
  return <a href={`tel:${cleanPhone}`} className={`${className} no-underline hover:opacity-80`} onClick={() => onLinkClick?.(`tel:${cleanPhone}`)}>{cleanPhone}</a>;
}

/** Renders contact + links; links are clickable and optionally tracked */
export function ContactLinksContent({ personal }: { personal: CvPreviewData["personal"] }) {
  const onLinkClick = React.useContext(CvLinkTrackingContext);
  const parts: React.ReactNode[] = [];
  const sep = " • ";
  const sep2 = " · ";
  if (personal.email) {
    const cleanEmail = normalizeEmail(personal.email);
    parts.push(<a key="e" href={`mailto:${cleanEmail}`} className="text-inherit no-underline hover:opacity-80" onClick={() => onLinkClick?.(`mailto:${cleanEmail}`)}>{cleanEmail}</a>);
  }
  if (personal.phone) {
    const cleanPhone = normalizeText(personal.phone);
    parts.push(<a key="p" href={`tel:${cleanPhone}`} className="text-inherit no-underline hover:opacity-80" onClick={() => onLinkClick?.(`tel:${cleanPhone}`)}>{cleanPhone}</a>);
  }
  if (personal.currentLocation) parts.push(<span key="l">{normalizeText(personal.currentLocation)}</span>);
  const contactParts = parts;
  const linkParts: React.ReactNode[] = [];
  if (personal.linkedinUrl) {
    const href = /^https?:\/\//i.test(personal.linkedinUrl) ? personal.linkedinUrl : `https://${personal.linkedinUrl}`;
    const cleanLinkedin = normalizeText(personal.linkedinUrl);
    linkParts.push(<a key="li" href={href} target="_blank" rel="noopener noreferrer" className="text-inherit no-underline hover:opacity-80" onClick={() => onLinkClick?.(href)}>{cleanLinkedin}</a>);
  }
  if (personal.website) {
    const href = /^https?:\/\//i.test(personal.website) ? personal.website : `https://${personal.website}`;
    const cleanWebsite = normalizeText(personal.website);
    linkParts.push(<a key="w" href={href} target="_blank" rel="noopener noreferrer" className="text-inherit no-underline hover:opacity-80" onClick={() => onLinkClick?.(href)}>{cleanWebsite}</a>);
  }
  const hasContact = contactParts.length > 0;
  const hasLinks = linkParts.length > 0;
  if (!hasContact && !hasLinks) return null;
  const contactEl = hasContact ? contactParts.flatMap((p, i) => (i === 0 ? [p] : [sep, p])) : null;
  const linkEl = hasLinks ? linkParts.flatMap((p, i) => (i === 0 ? [p] : [sep, p])) : null;
  return <>{contactEl}{hasContact && hasLinks && sep2}{linkEl}</>;
}

export function getInitials(fullName: string): string {
  if (!fullName || !fullName.trim()) return "?";
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0].slice(0, 2) || "?").toUpperCase();
}

/** Shows profile picture when available and enabled, otherwise initials. */
export function CvAvatar({ name, profilePictureUrl, showProfilePictureOnCv, accentColor, className = "w-12 h-12", ring = "border-2 border-emerald-500" }: { name: string; profilePictureUrl?: string; showProfilePictureOnCv?: boolean; accentColor?: string; className?: string; ring?: string }) {
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
export function AvatarPlaceholder({ name, className = "w-12 h-12", ring = "border-2 border-emerald-500" }: { name: string; className?: string; ring?: string }) {
  return <CvAvatar name={name} className={className} ring={ring} />;
}

/** Split long description text into bullet-friendly lines */
export function descriptionToBullets(text: string): string[] {
  const t = text.trim();
  if (!t) return [];
  const byNewline = t.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  if (byNewline.length > 1) return byNewline;
  const bySentence = t.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  if (bySentence.length > 1 && t.length > 80) return bySentence;
  return [t];
}

/**
 * PDF-safe bullets (html2canvas breaks table-cell / CSS-circle markers).
 * Single text flow with hanging indent — bullet and copy stay on one baseline.
 */
export function PdfSafeBulletList({
  items,
  color = "#111111",
  bulletColor,
  className = "",
  fontSize = 12.5,
  lineHeight = 1.45,
  gapY = 2,
}: {
  items: string[];
  color?: string;
  bulletColor?: string;
  className?: string;
  fontSize?: number;
  lineHeight?: number;
  gapY?: number;
}) {
  if (!items.length) return null;
  const dotColor = bulletColor || color;
  const indent = Math.round(fontSize * 1.1);
  return (
    <ul className={`cv-pdf-bullets m-0 list-none p-0 ${className}`} style={{ marginTop: 4 }}>
      {items.map((line, j) => (
        <li
          key={j}
          data-cv-block=""
          className="cv-pdf-bullet-item"
          style={{
            display: "block",
            boxSizing: "border-box",
            color,
            fontSize,
            lineHeight,
            paddingLeft: indent,
            textIndent: -indent,
            marginBottom: j < items.length - 1 ? gapY : 0,
          }}
        >
          <span className="cv-pdf-bullet-dot" style={{ color: dotColor }}>
            •{"\u00A0"}
          </span>
          <span className="cv-pdf-bullet-text">{line}</span>
        </li>
      ))}
    </ul>
  );
}

/** Title left / date right — table layout (html2canvas breaks flex justify-between). */
export function PdfSafeMetaRow({
  left,
  right,
  leftClassName = "",
  rightClassName = "",
  leftStyle,
  rightStyle,
}: {
  left: React.ReactNode;
  right?: React.ReactNode | null;
  leftClassName?: string;
  rightClassName?: string;
  leftStyle?: React.CSSProperties;
  rightStyle?: React.CSSProperties;
}) {
  const hasRight = right != null && right !== false && right !== "";
  return (
    <div
      className="cv-pdf-meta-row"
      style={{ display: "table", width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}
    >
      <div
        className={`cv-pdf-meta-cell ${leftClassName}`}
        style={{ display: "table-cell", verticalAlign: "middle", width: hasRight ? "68%" : "100%", ...leftStyle }}
      >
        {left}
      </div>
      {hasRight ? (
        <div
          className={`cv-pdf-meta-cell ${rightClassName}`}
          style={{
            display: "table-cell",
            verticalAlign: "middle",
            textAlign: "right",
            whiteSpace: "nowrap",
            width: "32%",
            paddingLeft: 8,
            ...rightStyle,
          }}
        >
          {right}
        </div>
      ) : null}
    </div>
  );
}

/** Skill chips — inline-block wrap (html2canvas breaks flex-wrap alignment). */
export function PdfSafeSkillChips({
  skills,
  chipClassName = "",
  chipStyle,
}: {
  skills: { name?: string }[];
  chipClassName?: string;
  chipStyle?: React.CSSProperties;
}) {
  if (!skills.length) return null;
  return (
    <div
      className="cv-pdf-skill-wrap"
      style={{
        display: "block",
        fontSize: 13,
        lineHeight: "32px",
      }}
    >
      {skills.map((s, i) => (
        <span
          key={i}
          data-cv-block=""
          className={`cv-t1-skill-chip ${chipClassName}`}
          style={{
            display: "inline-block",
            textAlign: "center",
            verticalAlign: "top",
            fontSize: 13,
            lineHeight: "32px",
            height: 32,
            padding: "0 12px",
            boxSizing: "border-box",
            marginRight: 8,
            marginBottom: 8,
            minHeight: 32,
            ...chipStyle,
          }}
        >
          {(s.name || "").trim()}
        </span>
      ))}
    </div>
  );
}

/** Pick readable foreground for accent backgrounds. */
export function getReadableTextColor(bg: string): "#111827" | "#ffffff" {
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
