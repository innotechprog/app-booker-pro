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

// —— Template 9: Jack Clark style – minimal, small photo, name uppercase + title, contact below; Skills two-col Expert ——
export function Template9({ data }: { data: CvPreviewData }) {
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
