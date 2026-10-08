import React from "react";
import type { CvPreviewData, CustomSection } from "./types";
import {
  CARD_BASE,
  EmailLink,
  PhoneLink,
  descriptionToBullets,
  PdfSafeBulletList,
  PdfSafeMetaRow,
} from "./shared";

const T2_TEXT = "#374151";
const T2_HEADING = "#1a2b4b";
const T2_MUTED = "#6b7280";
const T2_ACCENT = "#1a2b4b";
const T2_RULE = "#d1d5db";
const T2_SIDEBAR_BG = "#f3f4f6";

function parseLanguageLines(customSections?: CustomSection[]): { name: string; level: string }[] {
  const section = (customSections ?? []).find((s) => /language/i.test(s.title || ""));
  if (!section?.content?.trim()) return [];
  return section.content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s*[–—|:·-]\s*/);
      if (parts.length >= 2) return { name: parts[0].trim(), level: parts.slice(1).join(" – ").trim() };
      return { name: line, level: "" };
    });
}

function isSidebarCustomTitle(title: string): boolean {
  return /^(references?|interests?|hobbies|awards?)$/i.test((title || "").trim());
}

function contentLines(content: string): string[] {
  return (content || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

function CustomSectionBody({
  content,
  textColor,
}: {
  content: string;
  textColor: string;
}) {
  const lines = contentLines(content);
  if (lines.length > 1) {
    return (
      <PdfSafeBulletList items={lines} color={textColor} fontSize={13} lineHeight={1.5} gapY={3} />
    );
  }
  return (
    <p
      className="whitespace-pre-wrap"
      style={{ fontSize: 13, lineHeight: 1.55, color: textColor, margin: 0 }}
    >
      {content || "—"}
    </p>
  );
}

function hrefFor(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

/** PDF-safe diamond divider (no absolute / transform). */
function DiamondRule({ accent }: { accent: string }) {
  return (
    <div
      className="cv-pdf-meta-row"
      style={{
        display: "table",
        width: "100%",
        borderCollapse: "collapse",
        tableLayout: "fixed",
        marginTop: 8,
        marginBottom: 24,
      }}
    >
      <div style={{ display: "table-cell", verticalAlign: "middle", width: "46%" }}>
        <div style={{ borderTop: `1px solid ${T2_RULE}`, height: 0 }} />
      </div>
      <div
        style={{
          display: "table-cell",
          verticalAlign: "middle",
          textAlign: "center",
          width: "8%",
          fontSize: 8,
          lineHeight: 1,
          color: accent,
        }}
      >
        ◆
      </div>
      <div style={{ display: "table-cell", verticalAlign: "middle", width: "46%" }}>
        <div style={{ borderTop: `1px solid ${T2_RULE}`, height: 0 }} />
      </div>
    </div>
  );
}

function SectionTitle({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <div
      data-cv-heading=""
      style={{
        color: accent,
        fontWeight: 700,
        letterSpacing: "0.12em",
        fontSize: 14,
        textTransform: "uppercase",
        borderBottom: `1px solid ${T2_RULE}`,
        paddingBottom: 4,
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Contact row item — real HTML table (html2canvas-safe).
 * Symbol is plain text, not an SVG icon.
 */
function ContactCell({
  symbol,
  children,
  accent,
}: {
  symbol: string;
  children: React.ReactNode;
  accent: string;
}) {
  if (!children) return null;
  return (
    <td
      style={{
        padding: "3px 12px 3px 0",
        verticalAlign: "middle",
        fontSize: 13,
        lineHeight: "18px",
        color: T2_TEXT,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ color: accent, marginRight: 6, fontSize: 14 }}>{symbol}</span>
      {children}
    </td>
  );
}

/**
 * Template 2 — professional two-column resume (photo header + sidebar).
 * Layout uses CSS tables so PDF download via html2canvas stays aligned.
 */
export function Template2({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, certifications, keySkills } = data;
  const accent = data.accentColor || T2_ACCENT;
  const languages = parseLanguageLines(data.customSections);
  const nonLanguageCustom = (data.customSections ?? []).filter(
    (s) => !/language/i.test(s.title || "") && s.id !== "personal-details-auto"
  );
  const sidebarCustom = nonLanguageCustom.filter((s) => isSidebarCustomTitle(s.title));
  const mainCustom = nonLanguageCustom.filter((s) => !isSidebarCustomTitle(s.title));
  const showPhoto = !!personal.showProfilePictureOnCv && !!personal.profilePictureUrl;

  type ContactItem = { symbol: string; node: React.ReactNode; key: string };
  const contactItems: ContactItem[] = [];
  if (personal.email) {
    contactItems.push({
      key: "email",
      symbol: "✉",
      node: <EmailLink email={personal.email} className="text-inherit" />,
    });
  }
  if (personal.phone) {
    contactItems.push({
      key: "phone",
      symbol: "☎",
      node: <PhoneLink phone={personal.phone} className="text-inherit" />,
    });
  }
  if (personal.linkedinUrl) {
    contactItems.push({
      key: "linkedin",
      symbol: "in",
      node: (
        <a
          href={hrefFor(personal.linkedinUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-inherit no-underline hover:opacity-80"
        >
          {personal.linkedinUrl}
        </a>
      ),
    });
  }
  if (personal.currentLocation) {
    contactItems.push({
      key: "location",
      symbol: "⌖",
      node: <span>{personal.currentLocation}</span>,
    });
  }
  if (personal.website) {
    contactItems.push({
      key: "website",
      symbol: "www",
      node: (
        <a
          href={hrefFor(personal.website)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-inherit no-underline hover:opacity-80"
        >
          {personal.website}
        </a>
      ),
    });
  }
  const contactRows: ContactItem[][] = [];
  for (let i = 0; i < contactItems.length; i += 2) {
    contactRows.push(contactItems.slice(i, i + 2));
  }

  return (
    <div
      className={`${CARD_BASE} font-sans antialiased bg-white`}
      style={{ color: T2_TEXT, boxSizing: "border-box", padding: "28px 32px 16px" }}
    >
      {/* Header: photo + name/title + contact grid */}
      <div
        className="cv-pdf-meta-row"
        style={{
          display: "table",
          width: "100%",
          borderCollapse: "collapse",
          tableLayout: "fixed",
        }}
      >
        <div
          className="cv-pdf-meta-cell cv-t2-photo-cell"
          style={{
            display: "table-cell",
            width: 136,
            minWidth: 136,
            maxWidth: 136,
            verticalAlign: "middle",
            paddingRight: 24,
          }}
        >
          <div
            className="cv-t2-photo-frame"
            style={{
              width: 112,
              height: 112,
              minWidth: 112,
              minHeight: 112,
              maxWidth: 112,
              maxHeight: 112,
              borderRadius: "50%",
              overflow: "hidden",
              backgroundColor: "#e5e7eb",
              position: "relative",
            }}
          >
            {showPhoto ? (
              <img
                src={personal.profilePictureUrl}
                alt=""
                className="cv-t2-photo-img"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center center",
                  display: "block",
                  border: 0,
                  maxWidth: "none",
                  maxHeight: "none",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  color: T2_MUTED,
                  textAlign: "center",
                  lineHeight: "112px",
                  fontSize: 14,
                }}
              >
                Photo
              </div>
            )}
          </div>
        </div>
        <div className="cv-pdf-meta-cell" style={{ display: "table-cell", verticalAlign: "middle" }}>
          <div
            className="break-words"
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: accent,
              lineHeight: 1.15,
              marginBottom: 4,
              overflowWrap: "anywhere",
            }}
          >
            {personal.fullName || "Full Name"}
          </div>
          {personal.jobTitle ? (
            <div style={{ fontSize: 14, color: T2_MUTED, marginBottom: 12 }}>
              {personal.jobTitle}
            </div>
          ) : null}

          {contactRows.length > 0 && (
            <table
              className="cv-t2-contact-table"
              style={{ borderCollapse: "collapse", borderSpacing: 0, width: "100%" }}
            >
              <tbody>
                {contactRows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((item) => (
                      <ContactCell key={item.key} symbol={item.symbol} accent={accent}>
                        {item.node}
                      </ContactCell>
                    ))}
                    {row.length === 1 ? <td /> : null}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <DiamondRule accent={accent} />

      {/* Body: left main + right sidebar */}
      <div
        data-cv-columns=""
        className="cv-pdf-meta-row"
        style={{
          display: "table",
          width: "100%",
          borderCollapse: "collapse",
          tableLayout: "fixed",
        }}
      >
        {/* LEFT — summary, experience, education */}
        <div
          data-cv-column=""
          className="cv-pdf-meta-cell"
          style={{
            display: "table-cell",
            width: "66%",
            verticalAlign: "top",
            paddingRight: 28,
          }}
        >
          {overview ? (
            <section data-cv-block="" style={{ marginBottom: 24 }}>
              <SectionTitle accent={accent}>Professional Summary</SectionTitle>
              <p
                className="whitespace-pre-wrap"
                style={{ fontSize: 13, lineHeight: 1.55, color: T2_TEXT, margin: 0 }}
              >
                {overview}
              </p>
            </section>
          ) : null}

          {workExperience.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <SectionTitle accent={accent}>Work Experience</SectionTitle>
              {workExperience.map((w, i) => {
                const bullets = w.description ? descriptionToBullets(w.description) : [];
                const dates = [w.startDate, w.endDate].filter(Boolean).join(" – ");
                return (
                  <div key={i} data-cv-block="" style={{ marginBottom: i < workExperience.length - 1 ? 18 : 0 }}>
                    <PdfSafeMetaRow
                      left={
                        <span style={{ fontWeight: 700, fontSize: 13, color: T2_HEADING }}>
                          {w.jobTitle || "Job Title"}
                        </span>
                      }
                      right={
                        dates ? (
                          <span style={{ fontSize: 14, color: T2_MUTED }}>{dates}</span>
                        ) : null
                      }
                    />
                    {w.company ? (
                      <div
                        style={{
                          fontSize: 13,
                          fontStyle: "italic",
                          color: T2_MUTED,
                          marginTop: 2,
                          marginBottom: 6,
                        }}
                      >
                        {w.company}
                      </div>
                    ) : null}
                    {bullets.length > 0 && (
                      <PdfSafeBulletList
                        items={bullets}
                        color={T2_TEXT}
                        fontSize={13}
                        lineHeight={1.5}
                        gapY={3}
                      />
                    )}
                  </div>
                );
              })}
            </section>
          )}

          {education.length > 0 && (
            <section style={{ marginBottom: 16 }}>
              <SectionTitle accent={accent}>Education</SectionTitle>
              {education.map((e, i) => {
                const dateLabel =
                  e.endDate && e.startDate && e.endDate !== e.startDate
                    ? `${e.startDate} – ${e.endDate}`
                    : e.endDate || e.startDate || "";
                return (
                  <div key={i} data-cv-block="" style={{ marginBottom: i < education.length - 1 ? 12 : 0 }}>
                    <PdfSafeMetaRow
                      left={
                        <span style={{ fontWeight: 700, fontSize: 13, color: T2_HEADING }}>
                          {e.qualification || "Degree Name"}
                        </span>
                      }
                      right={
                        dateLabel ? (
                          <span style={{ fontSize: 14, color: T2_MUTED }}>{dateLabel}</span>
                        ) : null
                      }
                    />
                    {e.institution ? (
                      <div style={{ fontSize: 13, fontStyle: "italic", color: T2_MUTED, marginTop: 2 }}>
                        {e.institution}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </section>
          )}

          {mainCustom.map((s) =>
            s.title.trim() || s.content.trim() ? (
              <section key={s.id} data-cv-block="" style={{ marginBottom: 16 }}>
                <SectionTitle accent={accent}>{s.title || "Section"}</SectionTitle>
                <CustomSectionBody content={s.content} textColor={T2_TEXT} />
              </section>
            ) : null
          )}
        </div>

        {/* RIGHT — skills, languages, certifications */}
        <div
          data-cv-column=""
          className="cv-pdf-meta-cell"
          style={{
            display: "table-cell",
            width: "34%",
            verticalAlign: "top",
            backgroundColor: T2_SIDEBAR_BG,
            padding: "16px 14px 20px 16px",
            borderLeft: `1px solid ${T2_RULE}`,
          }}
        >
          {keySkills.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <SectionTitle accent={accent}>Skills</SectionTitle>
              <PdfSafeBulletList
                items={keySkills.map((s) => (s.name || "").trim()).filter(Boolean)}
                color={T2_TEXT}
                fontSize={13}
                lineHeight={1.5}
                gapY={4}
              />
            </section>
          )}

          {languages.length > 0 && (
            <section style={{ marginBottom: 24 }}>
              <SectionTitle accent={accent}>Languages</SectionTitle>
              {languages.map((lang, i) => (
                <div
                  key={i}
                  data-cv-block=""
                  className="cv-pdf-meta-row"
                  style={{
                    display: "table",
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: 6,
                    fontSize: 13,
                    lineHeight: 1.4,
                  }}
                >
                  <span
                    className="cv-pdf-meta-cell"
                    style={{
                      display: "table-cell",
                      verticalAlign: "middle",
                      fontWeight: 600,
                      color: T2_HEADING,
                    }}
                  >
                    {lang.name}
                  </span>
                  {lang.level ? (
                    <span
                      className="cv-pdf-meta-cell"
                      style={{
                        display: "table-cell",
                        verticalAlign: "middle",
                        textAlign: "right",
                        color: T2_MUTED,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {lang.level}
                    </span>
                  ) : null}
                </div>
              ))}
            </section>
          )}

          {certifications.length > 0 && (
            <section style={{ marginBottom: 8 }}>
              <SectionTitle accent={accent}>Certifications</SectionTitle>
              {certifications.map((c, i) => (
                <div key={i} data-cv-block="" style={{ marginBottom: 12 }}>
                  <PdfSafeMetaRow
                    left={
                      <span style={{ fontWeight: 700, fontSize: 13, lineHeight: "18px", color: T2_HEADING }}>
                        <span style={{ color: accent, marginRight: 6, fontWeight: 400 }}>◆</span>
                        {c.name}
                      </span>
                    }
                    right={
                      c.date ? (
                        <span style={{ fontSize: 14, lineHeight: "18px", color: T2_MUTED }}>{c.date}</span>
                      ) : null
                    }
                  />
                  {c.issuer ? (
                    <div style={{ fontSize: 14, lineHeight: "18px", color: T2_MUTED, paddingLeft: 16, marginTop: 1 }}>
                      {c.issuer}
                    </div>
                  ) : null}
                </div>
              ))}
            </section>
          )}

          {sidebarCustom.map((s) =>
            s.title.trim() || s.content.trim() ? (
              <section key={s.id} data-cv-block="" style={{ marginBottom: 20 }}>
                <SectionTitle accent={accent}>{s.title || "Section"}</SectionTitle>
                <CustomSectionBody content={s.content} textColor={T2_TEXT} />
              </section>
            ) : null
          )}
        </div>
      </div>

      {/* Bottom diamond */}
      <div style={{ textAlign: "center", paddingBottom: 16, color: accent, fontSize: 8 }}>◆</div>
    </div>
  );
}
