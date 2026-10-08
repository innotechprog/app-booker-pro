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

// —— Template 3: Basic Two-Section (top block, then Experience, then Education & Skills) ——
export function Template3({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const accent = data.accentColor || ACCENT;
  return (
    <div className={`${CARD_BASE} font-sans antialiased`}>
      <div className="h-1.5 w-full" style={{ backgroundColor: accent }} />
      <div className="p-4 bg-gradient-to-b from-gray-50/80 to-white border-b border-gray-100">
        <h1 className="text-base font-bold leading-tight text-gray-900">{personal.fullName || "Your name"}</h1>
        <p className="text-xs text-gray-600 mt-1"><ContactLinksContent personal={personal} /></p>
        {personal.jobTitle && <p className="text-xs text-gray-500 mt-0.5">{personal.jobTitle}</p>}
      </div>
      <div className="p-4 space-y-3 text-sm">
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
        <section className="border-t border-gray-100 pt-3">
          <SectionHeader accent={accent}>Education</SectionHeader>
          {education.length > 0 && (
            <ul className="space-y-1 mb-2">
              {education.map((e, i) => (
                <li key={i}>
                  <PdfSafeMetaRow
                    left={
                      <span className="font-medium text-gray-900">
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
          )}
          {keySkills.length > 0 && (
            <>
              <SectionHeader accent={accent}>Skills</SectionHeader>
              <PdfSafeSkillChips
                skills={keySkills}
                chipClassName="rounded border border-gray-200 bg-gray-50"
                chipStyle={{ color: "#111111" }}
              />
            </>
          )}
          {certifications.length > 0 && (
            <>
              <SectionHeader accent={accent}>Certifications</SectionHeader>
              <ul className="space-y-0.5 text-[12px] text-gray-700">
                {certifications.map((c, i) => (
                  <li key={i}>{c.name}</li>
                ))}
              </ul>
            </>
          )}
          <CustomSectionsBlock sections={data.customSections ?? []} accent={accent} className="mt-2" />
        </section>
      </div>
    </div>
  );
}
