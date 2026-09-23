import fs from "fs";

const path = "src/components/cv-templates/CvTemplatePreviews.tsx";
let src = fs.readFileSync(path, "utf8");

if (!src.includes('from "lucide-react"')) {
  src = src.replace(
    'import React, { useState, useEffect } from "react";\nimport QRCode from "qrcode";',
    'import React, { useState, useEffect } from "react";\nimport QRCode from "qrcode";\nimport { Mail, Phone, MapPin, Linkedin, Globe, Award, Camera } from "lucide-react";'
  );
}

const start = src.indexOf("// —— Template 2:");
const end = src.indexOf("// —— Template 3:");
if (start < 0 || end < 0) {
  console.error("Template 2/3 markers not found", start, end);
  process.exit(1);
}

const template2 = `// —— Template 2: Professional two-column (photo header + sidebar) — paid R20 ——
const T2_TEXT = "#111111";
const T2_MUTED = "#4b5563";
const T2_ACCENT = "#1e3a8a";
const T2_RULE = "#d1d5db";
const T2_SIDEBAR_BG = "#f3f4f6";

function parseLanguageLines(customSections?: CustomSection[]): { name: string; level: string }[] {
  const section = (customSections ?? []).find((s) => /language/i.test(s.title || ""));
  if (!section?.content?.trim()) return [];
  return section.content
    .split(/\\r?\\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\\s*[–—|:·-]\\s*/);
      if (parts.length >= 2) return { name: parts[0].trim(), level: parts.slice(1).join(" – ").trim() };
      return { name: line, level: "" };
    });
}

function Template2({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, certifications, keySkills } = data;
  const accent = data.accentColor || T2_ACCENT;
  const text = T2_TEXT;
  const languages = parseLanguageLines(data.customSections);
  const otherCustom = (data.customSections ?? []).filter((s) => !/language/i.test(s.title || "") && s.id !== "personal-details-auto");
  const showPhoto = !!personal.showProfilePictureOnCv && !!personal.profilePictureUrl;

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.08em]" style={{ color: accent }}>
      {children}
    </div>
  );

  const DiamondRule = () => (
    <div className="relative my-3 flex items-center">
      <div className="h-px flex-1" style={{ backgroundColor: T2_RULE }} />
      <span className="mx-2 text-[8px] leading-none" style={{ color: accent }}>◆</span>
      <div className="h-px flex-1" style={{ backgroundColor: T2_RULE }} />
    </div>
  );

  const ContactItem = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => {
    if (!children) return null;
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px]" style={{ color: text }}>
        <span className="shrink-0" style={{ color: accent }}>{icon}</span>
        {children}
      </span>
    );
  };

  return (
    <div className={\`\${CARD_BASE} font-sans antialiased bg-white\`} style={{ color: text }}>
      {/* Header */}
      <div className="flex gap-4 px-6 pt-6 pb-4">
        <div className="shrink-0">
          {showPhoto ? (
            <img
              src={personal.profilePictureUrl}
              alt=""
              className="h-20 w-20 rounded-full object-cover border"
              style={{ borderColor: T2_RULE }}
            />
          ) : (
            <div
              className="flex h-20 w-20 flex-col items-center justify-center rounded-full border border-dashed text-[10px]"
              style={{ borderColor: T2_RULE, color: T2_MUTED, backgroundColor: "#fafafa" }}
            >
              <Camera className="mb-0.5 h-5 w-5" style={{ color: accent }} />
              Photo
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[26px] font-bold leading-tight tracking-tight" style={{ color: accent }}>
            {personal.fullName || "Full Name"}
          </div>
          {personal.jobTitle ? (
            <div className="mt-0.5 text-[13px]" style={{ color: T2_MUTED }}>
              {personal.jobTitle}
            </div>
          ) : null}
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
            <ContactItem icon={<Mail className="h-3 w-3" />}>
              {personal.email ? <EmailLink email={personal.email} className="text-inherit" /> : null}
            </ContactItem>
            <ContactItem icon={<Phone className="h-3 w-3" />}>
              {personal.phone ? <PhoneLink phone={personal.phone} className="text-inherit" /> : null}
            </ContactItem>
            {personal.currentLocation ? (
              <ContactItem icon={<MapPin className="h-3 w-3" />}>
                <span>{personal.currentLocation}</span>
              </ContactItem>
            ) : null}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1.5">
            {personal.linkedinUrl ? (
              <ContactItem icon={<Linkedin className="h-3 w-3" />}>
                <a
                  href={/^https?:\\/\\//i.test(personal.linkedinUrl) ? personal.linkedinUrl : \`https://\${personal.linkedinUrl}\`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-inherit no-underline hover:opacity-80"
                >
                  {personal.linkedinUrl}
                </a>
              </ContactItem>
            ) : null}
            {personal.website ? (
              <ContactItem icon={<Globe className="h-3 w-3" />}>
                <a
                  href={/^https?:\\/\\//i.test(personal.website) ? personal.website : \`https://\${personal.website}\`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-inherit no-underline hover:opacity-80"
                >
                  {personal.website}
                </a>
              </ContactItem>
            ) : null}
          </div>
        </div>
      </div>

      <div className="px-6">
        <DiamondRule />
      </div>

      {/* Body: left main + right sidebar */}
      <div className="grid grid-cols-[1.7fr_1fr] gap-0 px-6 pb-6">
        <div className="pr-5 border-r" style={{ borderColor: T2_RULE }}>
          {overview ? (
            <section className="mb-4">
              <SectionTitle>Professional Summary</SectionTitle>
              <p className="whitespace-pre-wrap text-[12.5px] leading-[1.55]" style={{ color: text }}>
                {overview}
              </p>
            </section>
          ) : null}

          {workExperience.length > 0 && (
            <section className="mb-4">
              <SectionTitle>Work Experience</SectionTitle>
              <div className="space-y-3.5">
                {workExperience.map((w, i) => {
                  const bullets = w.description ? descriptionToBullets(w.description) : [];
                  const dates = [w.startDate, w.endDate].filter(Boolean).join(" – ");
                  return (
                    <div key={i}>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[13px] font-bold" style={{ color: text }}>
                          {w.jobTitle || "Job Title"}
                        </span>
                        {dates ? (
                          <span className="shrink-0 text-[12px]" style={{ color: T2_MUTED }}>
                            {dates}
                          </span>
                        ) : null}
                      </div>
                      {w.company ? (
                        <div className="text-[12.5px]" style={{ color: T2_MUTED }}>
                          {w.company}
                        </div>
                      ) : null}
                      {bullets.length > 0 && (
                        <ul className="mt-1 ml-4 list-disc space-y-0.5 text-[12.5px] leading-[1.45]" style={{ color: text }}>
                          {bullets.map((line, j) => (
                            <li key={j}>{line}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section className="mb-2">
              <SectionTitle>Education</SectionTitle>
              <div className="space-y-3">
                {education.map((e, i) => {
                  const dateLabel =
                    e.endDate && e.startDate && e.endDate !== e.startDate
                      ? \`\${e.startDate} – \${e.endDate}\`
                      : e.endDate || e.startDate || "";
                  return (
                    <div key={i}>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[13px] font-bold" style={{ color: text }}>
                          {e.qualification || "Degree Name"}
                        </span>
                        {dateLabel ? (
                          <span className="shrink-0 text-[12px]" style={{ color: T2_MUTED }}>
                            {dateLabel}
                          </span>
                        ) : null}
                      </div>
                      {e.institution ? (
                        <div className="text-[12.5px]" style={{ color: T2_MUTED }}>
                          {e.institution}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {otherCustom.map((s) =>
            s.title.trim() || s.content.trim() ? (
              <section key={s.id} className="mt-4">
                <SectionTitle>{s.title || "Section"}</SectionTitle>
                <p className="whitespace-pre-wrap text-[12.5px] leading-[1.55]" style={{ color: text }}>
                  {s.content || "—"}
                </p>
              </section>
            ) : null
          )}
        </div>

        <aside className="pl-4" style={{ backgroundColor: "transparent" }}>
          <div className="-mr-6 -mt-1 min-h-full rounded-sm px-3 py-1" style={{ backgroundColor: T2_SIDEBAR_BG }}>
            {keySkills.length > 0 && (
              <section className="mb-4 pt-2">
                <SectionTitle>Skills</SectionTitle>
                <ul className="space-y-0">
                  {keySkills.map((s, i) => (
                    <li
                      key={i}
                      className="border-b py-1.5 text-[12px] pl-0 list-none flex items-start gap-1.5"
                      style={{ borderColor: T2_RULE, color: text }}
                    >
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                      <span>{(s.name || "").trim()}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {languages.length > 0 && (
              <section className="mb-4">
                <SectionTitle>Languages</SectionTitle>
                <ul className="space-y-1.5">
                  {languages.map((lang, i) => (
                    <li key={i} className="flex items-baseline justify-between gap-2 text-[12px]" style={{ color: text }}>
                      <span className="flex items-center gap-1.5">
                        <span className="h-1 w-1 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
                        {lang.name}
                      </span>
                      {lang.level ? <span style={{ color: T2_MUTED }}>{lang.level}</span> : null}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {certifications.length > 0 && (
              <section className="mb-3 pb-2">
                <SectionTitle>Certifications</SectionTitle>
                <ul className="space-y-2.5">
                  {certifications.map((c, i) => (
                    <li key={i} className="flex gap-2">
                      <Award className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: accent }} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[12px] font-bold" style={{ color: text }}>
                            {c.name}
                          </span>
                          {c.date ? (
                            <span className="shrink-0 text-[11px]" style={{ color: T2_MUTED }}>
                              {c.date}
                            </span>
                          ) : null}
                        </div>
                        {c.issuer ? (
                          <div className="text-[11.5px]" style={{ color: T2_MUTED }}>
                            {c.issuer}
                          </div>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </aside>
      </div>

      <div className="px-6 pb-5">
        <DiamondRule />
      </div>
    </div>
  );
}

`;

src = src.slice(0, start) + template2 + src.slice(end);

src = src.replace(
  /const TEMPLATES: Record<number, React\.FC<\{ data: CvPreviewData \}>> = \{[\s\S]*?\};/,
  `export const CV_TEMPLATE_COUNT = 5;

const TEMPLATES: Record<number, React.FC<{ data: CvPreviewData }>> = {
  1: Template1, 2: Template2, 3: Template3, 4: Template4, 5: Template5,
};`
);

src = src.replace(
  /const id = Math\.max\(1, Math\.min\(20, templateId\)\);/,
  "const id = Math.max(1, Math.min(CV_TEMPLATE_COUNT, templateId));"
);

fs.writeFileSync(path, src);
console.log("Template2 + registry updated");
