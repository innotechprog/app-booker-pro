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
  getReadableTextColor,
} from "./shared";

// —— Template 10: Maria Dean style – dark blue full-width header, photo in header, name + title + contact in white ——
export function Template10({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  const accent = data.accentColor || ACCENT;
  const headerTextColor = getReadableTextColor(accent);
  return (
    <div className={`${CARD_BASE} font-sans antialiased`}>
      <div className="cv-dark-sidebar py-4 px-4 flex items-center gap-4" style={{ backgroundColor: accent, color: headerTextColor }}>
        <CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={data.accentColor} className="w-16 h-16 border-white" ring="border-2 border-white" />
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-inherit">{name}</h1>
          {personal.jobTitle && <p className="text-sm opacity-95" style={{ color: headerTextColor }}>{personal.jobTitle}</p>}
          <p className="text-xs opacity-90 mt-1" style={{ color: headerTextColor }}>{personal.currentLocation} · <PhoneLink phone={personal.phone} /> · <EmailLink email={personal.email} /></p>
        </div>
      </div>
      <div className="p-4 space-y-3 text-sm">
        {overview && <section><SectionHeader accent={accent}>Summary</SectionHeader><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && <section><SectionHeader accent={accent}>Work Experience</SectionHeader><ul className="space-y-2">{workExperience.map((w, i) => (<li key={i}><span className="font-semibold text-gray-900">{w.jobTitle || "Role"}</span>{w.company && `, ${w.company}`} <span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{w.description && <p className="text-gray-700 mt-0.5">{descriptionToBullets(w.description)[0]}</p>}</li>))}</ul></section>}
        {education.length > 0 && <section><SectionHeader accent={accent}>Education</SectionHeader><ul className="space-y-0.5">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        {keySkills.length > 0 && <section><SectionHeader accent={accent}>Skills</SectionHeader><div className="flex flex-wrap gap-1.5">{keySkills.map((s, i) => <span key={i} className="px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-[11px]">{s.name}</span>)}</div></section>}
        {certifications.length > 0 && <section><SectionHeader accent={accent}>Certifications</SectionHeader><ul className="space-y-0.5 text-[12px] text-gray-700">{certifications.map((c, i) => <li key={i}>{c.name}</li>)}</ul></section>}
        <CustomSectionsBlock sections={data.customSections ?? []} accent={data.accentColor} className="mt-3" />
      </div>
    </div>
  );
}
