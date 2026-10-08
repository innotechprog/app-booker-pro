import React from "react";
import type { CvPreviewData } from "./types";
import {
  ACCENT,
  CARD_BASE,
  SectionHeader,
  CustomSectionsBlock,
  EmailLink,
  PhoneLink,
  CvAvatar,
  descriptionToBullets,
} from "./shared";

// —— Template 6: David Miller style – single column, photo left, name uppercase, contact right, dates left in exp/edu ——
export function Template6({ data }: { data: CvPreviewData }) {
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
