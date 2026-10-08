import React from "react";
import type { CvPreviewData } from "./types";
import {
  ACCENT,
  CARD_BASE,
  SectionHeader,
  CustomSectionsBlock,
  ContactLinksContent,
  descriptionToBullets,
  PdfSafeBulletList,
  PdfSafeMetaRow,
  PdfSafeSkillChips,
} from "./shared";

// —— Template 4: Subtle Accent Bar (thin colored bar at top) ——
export function Template4({ data }: { data: CvPreviewData }) {
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
            <ul className="space-y-2">
              {workExperience.map((w, i) => {
                const bullets = w.description ? descriptionToBullets(w.description) : [];
                return (
                  <li key={i}>
                    <PdfSafeMetaRow
                      left={
                        <span className="font-semibold text-gray-900">
                          {w.jobTitle || "Role"}
                          {w.company ? ` — ${w.company}` : ""}
                        </span>
                      }
                      right={
                        w.startDate || w.endDate ? (
                          <span className="text-gray-500 text-xs">
                            {[w.startDate, w.endDate].filter(Boolean).join(" – ")}
                          </span>
                        ) : null
                      }
                    />
                    {bullets.length > 0 && (
                      <PdfSafeBulletList items={bullets} color="#374151" fontSize={12} lineHeight={1.45} />
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
        {education.length > 0 && (
          <section>
            <SectionHeader accent={accent}>Education</SectionHeader>
            <ul className="space-y-1">
              {education.map((e, i) => (
                <li key={i}>
                  <PdfSafeMetaRow
                    left={
                      <span>
                        {e.qualification || "—"}
                        {e.institution ? ` — ${e.institution}` : ""}
                      </span>
                    }
                    right={
                      e.startDate || e.endDate ? (
                        <span className="text-gray-500 text-xs">
                          {[e.startDate, e.endDate].filter(Boolean).join(" – ")}
                        </span>
                      ) : null
                    }
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
        {keySkills.length > 0 && (
          <section>
            <SectionHeader accent={accent}>Skills</SectionHeader>
            <PdfSafeSkillChips
              skills={keySkills}
              chipClassName="rounded border border-gray-200 bg-gray-50"
              chipStyle={{ color: "#111111" }}
            />
          </section>
        )}
        {certifications.length > 0 && <section><SectionHeader accent={accent}>Certifications</SectionHeader><ul className="space-y-0.5">{certifications.map((c, i) => <li key={i}>{c.name}</li>)}</ul></section>}
        <CustomSectionsBlock sections={data.customSections ?? []} accent={accent} className="mt-2" />
      </div>
    </div>
  );
}
