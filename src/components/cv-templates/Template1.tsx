import React from "react";
import type { CvPreviewData } from "./types";
import {
  CARD_BASE,
  normalizeEmail,
  normalizeText,
  CvLinkTrackingContext,
  descriptionToBullets,
  PdfSafeBulletList,
  PdfSafeMetaRow,
  PdfSafeSkillChips,
} from "./shared";

/** Pipe-separated contact row for Template 1 (email | phone | location | LinkedIn). */
function Template1ContactLine({ personal }: { personal: CvPreviewData["personal"] }) {
  const onLinkClick = React.useContext(CvLinkTrackingContext);
  const parts: React.ReactNode[] = [];
  const push = (node: React.ReactNode) => {
    if (parts.length) parts.push(<span key={`sep-${parts.length}`} className="px-1" style={{ color: "#111111" }}>|</span>);
    parts.push(node);
  };

  if (personal.email) {
    const cleanEmail = normalizeEmail(personal.email);
    if (cleanEmail) {
      push(
        <a
          key="e"
          href={`mailto:${cleanEmail}`}
          className="text-inherit no-underline hover:opacity-80"
          onClick={() => onLinkClick?.(`mailto:${cleanEmail}`)}
        >
          {cleanEmail}
        </a>
      );
    }
  }
  if (personal.phone) {
    const cleanPhone = normalizeText(personal.phone);
    if (cleanPhone) {
      push(
        <a
          key="p"
          href={`tel:${cleanPhone}`}
          className="text-inherit no-underline hover:opacity-80"
          onClick={() => onLinkClick?.(`tel:${cleanPhone}`)}
        >
          {cleanPhone}
        </a>
      );
    }
  }
  if (personal.currentLocation) {
    push(<span key="l">{normalizeText(personal.currentLocation)}</span>);
  }
  if (personal.linkedinUrl) {
    const href = /^https?:\/\//i.test(personal.linkedinUrl) ? personal.linkedinUrl : `https://${personal.linkedinUrl}`;
    const cleanLinkedin = normalizeText(personal.linkedinUrl);
    push(
      <a
        key="li"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-inherit no-underline hover:opacity-80"
        onClick={() => onLinkClick?.(href)}
      >
        {cleanLinkedin}
      </a>
    );
  } else if (personal.website) {
    const href = /^https?:\/\//i.test(personal.website) ? personal.website : `https://${personal.website}`;
    const cleanWebsite = normalizeText(personal.website);
    push(
      <a
        key="w"
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-inherit no-underline hover:opacity-80"
        onClick={() => onLinkClick?.(href)}
      >
        {cleanWebsite}
      </a>
    );
  }

  if (parts.length === 0) return null;
  return <>{parts}</>;
}

/** Template 1 colours */
const T1_TEXT = "#111111";
const T1_RULE = "#d1d5db";

// —— Template 1: Classic One-Column (exact match to provided mockup) ——
export function Template1({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, certifications, keySkills } = data;
  const text = T1_TEXT;
  const name = (personal.fullName || "Full Name").toUpperCase();
  const hasContact = !!(personal.email || personal.phone || personal.currentLocation || personal.linkedinUrl || personal.website);
  // Contact line already covers LinkedIn/website — don't duplicate via auto Personal Details
  const customSections = (data.customSections ?? []).filter((s) => s.id !== "personal-details-auto");

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div
      data-cv-heading=""
      className="cv-t1-section mb-2.5 text-[13px] font-bold uppercase tracking-[0.06em] leading-none"
      style={{ color: text }}
    >
      {children}
    </div>
  );

  const Rule = () => <div className="w-full" style={{ borderTop: `1px solid ${T1_RULE}` }} />;

  return (
    <div className={`${CARD_BASE} font-sans antialiased bg-white`} style={{ color: text }}>
      {/* Header — ALL CAPS name, pipe contact, no job title (matches mockup) */}
      <div className="px-7 pt-7 pb-4">
        <div
          className="cv-t1-name text-[28px] font-bold leading-tight tracking-tight uppercase"
          style={{ color: text }}
        >
          {name}
        </div>
        {hasContact && (
          <div className="cv-t1-body mt-2 text-[12px] leading-relaxed" style={{ color: text, fontSize: 12 }}>
            <Template1ContactLine personal={personal} />
          </div>
        )}
      </div>
      <div className="px-7">
        <Rule />
      </div>

      <div className="px-7 pb-7">
        {overview ? (
          <section data-cv-block="" className="pt-4">
            <SectionTitle>Professional Summary</SectionTitle>
            <p className="whitespace-pre-wrap text-[12.5px] leading-[1.55]" style={{ color: text }}>
              {overview}
            </p>
            <div className="mt-4">
              <Rule />
            </div>
          </section>
        ) : null}

        {workExperience.length > 0 && (
          <section className="pt-4">
            <SectionTitle>Work Experience</SectionTitle>
            <div className="space-y-4">
              {workExperience.map((w, i) => {
                const bullets = w.description ? descriptionToBullets(w.description) : [];
                const dates = [w.startDate, w.endDate].filter(Boolean).join(" – ");
                return (
                  <div key={i} data-cv-block="">
                    <PdfSafeMetaRow
                      left={
                        <span className="text-[13px] font-bold leading-snug" style={{ color: text }}>
                          {w.jobTitle || "Job Title"}
                        </span>
                      }
                      right={
                        dates ? (
                          <span className="text-[12px]" style={{ color: text, fontSize: 12 }}>
                            {dates}
                          </span>
                        ) : null
                      }
                    />
                    {w.company ? (
                      <div className="mt-0.5 text-[12.5px]" style={{ color: text }}>
                        {w.company}
                      </div>
                    ) : null}
                    {bullets.length > 0 && (
                      <>
                        <div className="mt-2 mb-2" style={{ borderTop: `1px dotted ${T1_RULE}` }} />
                        <PdfSafeBulletList items={bullets} color={text} fontSize={12.5} lineHeight={1.5} />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4">
              <Rule />
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section className="pt-4">
            <SectionTitle>Education</SectionTitle>
            <div className="space-y-3">
              {education.map((e, i) => {
                const dateLabel =
                  e.endDate && e.startDate && e.endDate !== e.startDate
                    ? `${e.startDate} – ${e.endDate}`
                    : e.endDate || e.startDate || "";
                return (
                  <div key={i} data-cv-block="">
                    <PdfSafeMetaRow
                      left={
                        <span className="text-[13px] font-bold leading-snug" style={{ color: text }}>
                          {e.qualification || "Degree, Field of Study"}
                        </span>
                      }
                      right={
                        dateLabel ? (
                          <span className="text-[12px]" style={{ color: text, fontSize: 12 }}>
                            {dateLabel}
                          </span>
                        ) : null
                      }
                    />
                    {e.institution ? (
                      <div className="mt-0.5 text-[12.5px]" style={{ color: text }}>
                        {e.institution}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div className="mt-4">
              <Rule />
            </div>
          </section>
        )}

        {keySkills.length > 0 && (
          <section className="pt-4">
            <SectionTitle>Skills</SectionTitle>
            <PdfSafeSkillChips
              skills={keySkills}
              chipClassName="rounded-md border bg-white"
              chipStyle={{
                borderColor: T1_RULE,
                color: text,
                fontSize: 13,
                lineHeight: "32px",
                height: 32,
                minHeight: 32,
                padding: "0 12px",
                marginRight: 8,
                marginBottom: 8,
                verticalAlign: "top",
              }}
            />
            {(certifications.length > 0 || customSections.length > 0) && (
              <div className="mt-4">
                <Rule />
              </div>
            )}
          </section>
        )}

        {certifications.length > 0 && (
          <section className="pt-4">
            <SectionTitle>Certifications</SectionTitle>
            <ul className="space-y-1 text-[12.5px]" style={{ color: text }}>
              {certifications.map((c, i) => (
                <li key={i}>
                  {c.name}
                  {c.issuer ? ` (${c.issuer})` : ""}
                  {c.date ? ` — ${c.date}` : ""}
                </li>
              ))}
            </ul>
            {customSections.length > 0 && (
              <div className="mt-4">
                <Rule />
              </div>
            )}
          </section>
        )}

        {customSections.length > 0 && (
          <div className="pt-4 space-y-4">
            {customSections.map((s) =>
              s.title.trim() || s.content.trim() ? (
                <section key={s.id} data-cv-block="">
                  <SectionTitle>{s.title || "Section"}</SectionTitle>
                  <p className="whitespace-pre-wrap text-[12.5px] leading-[1.55]" style={{ color: text }}>
                    {s.content || "—"}
                  </p>
                </section>
              ) : null
            )}
          </div>
        )}
      </div>
    </div>
  );
}
