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

// —— Template 16: Mia Bennett style – dark blue/purple left sidebar (avatar, name, contact, skills, languages); right white: Summary, Work History, Education ——
export function Template16({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  const accent = data.accentColor || ACCENT;
  return (
    <div className={`${CARD_BASE} min-h-[980px] flex items-stretch font-sans antialiased`}>
      <div className="cv-dark-sidebar w-[35%] p-3 text-white text-xs" style={{ backgroundColor: accent }}>
        <div className="flex justify-center mb-2"><CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={accent} className="w-14 h-14 border-white" ring="border-2 border-white" /></div>
        <h1 className="text-center font-bold text-sm tracking-wide">{name}</h1>
        {personal.jobTitle && <p className="text-center opacity-90 text-[10px] mt-0.5">{personal.jobTitle}</p>}
        <div className="mt-2 space-y-0.5 opacity-90">
          <p>{personal.currentLocation}</p>
          <p>{personal.phone}</p>
          <p className="break-words"><EmailLink email={personal.email} /></p>
        </div>
        {keySkills.length > 0 && <div className="mt-3"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-1">Core Skills</h2><ul className="space-y-0.5 opacity-90">{keySkills.slice(0, 8).map((s, i) => <li key={i}>{s.name}</li>)}</ul></div>}
        <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Languages</h2><p className="opacity-90">English — Professional</p></div>
      </div>
      <div className="flex-1 p-4 text-sm">
        {overview && <section className="mb-3"><SectionHeader accent={accent}>Executive Summary</SectionHeader><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && <section><SectionHeader accent={accent}>Work History</SectionHeader><ul className="space-y-3">{workExperience.map((w, i) => { const bullets = w.description ? descriptionToBullets(w.description) : []; return (<li key={i}><span className="font-semibold text-gray-900">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{bullets.length > 0 && <p className="text-gray-700 text-[12px]">{bullets[0]}</p>}</li>); })}</ul></section>}
        {education.length > 0 && <section className="mt-2"><SectionHeader accent={accent}>Education</SectionHeader><ul className="space-y-1">{education.map((e, i) => <li key={i}><span className="font-medium text-gray-900">{e.qualification || "—"}</span>{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        {certifications.length > 0 && <section className="mt-2"><SectionHeader accent={accent}>Certifications</SectionHeader><ul className="space-y-1 text-[12px] text-gray-700">{certifications.map((c, i) => <li key={i}>{c.name}</li>)}</ul></section>}
        <CustomSectionsBlock sections={data.customSections ?? []} accent={accent} className="mt-2" />
      </div>
    </div>
  );
}
