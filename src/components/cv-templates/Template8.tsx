import React from "react";
import type { CvPreviewData } from "./types";
import {
  ACCENT,
  CARD_BASE,
  SectionHeader,
  CustomSectionsBlock,
  EmailLink,
  CvAvatar,
  descriptionToBullets,
} from "./shared";

// —— Template 8: Helen Hart style – photo left, name + title, address; contact two columns right; light blue gradient ——
export function Template8({ data }: { data: CvPreviewData }) {
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
