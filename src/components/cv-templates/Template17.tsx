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

// —— Template 17: Ethan Cole style – main content left (name, title, contact, Summary, Work Experience, Education, References); dark blue right sidebar (avatar, Skills, Languages, Courses, Hobbies) ——
export function Template17({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  return (
    <div className={`${CARD_BASE} min-h-[980px] flex items-stretch font-sans antialiased`}>
      <div className="flex-1 p-4 text-sm min-w-0">
        <h1 className="text-lg font-bold uppercase tracking-tight">{name}</h1>
        {personal.jobTitle && <p className="text-xs text-gray-600">{personal.jobTitle}</p>}
        <p className="text-[10px] text-gray-500 mt-0.5"><PhoneLink phone={personal.phone} /> · <EmailLink email={personal.email} /> · {personal.currentLocation}</p>
        {overview && <section className="mt-2"><SectionHeader accent={data.accentColor || ACCENT}>Summary</SectionHeader><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && <section className="mt-2"><SectionHeader accent={data.accentColor || ACCENT}>Work Experience</SectionHeader><ul className="space-y-2">{workExperience.map((w, i) => { const bullets = w.description ? descriptionToBullets(w.description) : []; return (<li key={i}><span className="font-semibold text-gray-900">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{bullets.length > 0 && <p className="text-gray-700 text-[12px]">{bullets[0]}</p>}</li>); })}</ul></section>}
        {education.length > 0 && <section className="mt-2"><SectionHeader accent={data.accentColor || ACCENT}>Education</SectionHeader><ul className="space-y-0.5">{education.map((e, i) => <li key={i}><span className="font-medium text-gray-900">{e.qualification || "—"}</span>{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        <section className="mt-2"><SectionHeader accent={data.accentColor || ACCENT}>References</SectionHeader><p className="text-gray-600 text-xs">{certifications.length ? certifications[0].name : "Available upon request"}</p></section>
        <CustomSectionsBlock sections={data.customSections ?? []} accent={data.accentColor} className="mt-2" />
      </div>
      <div className="cv-dark-sidebar w-[32%] p-3 text-white text-xs" style={{ backgroundColor: data.accentColor || ACCENT }}>
        <div className="flex justify-center mb-2"><CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={data.accentColor} className="w-12 h-12 border-white" ring="border-2 border-white" /></div>
        {keySkills.length > 0 && <div><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Skills</h2><div className="flex flex-wrap gap-1 opacity-95">{keySkills.slice(0, 8).map((s, i) => <span key={i} className="px-1.5 py-0.5 rounded bg-white/15 border border-white/20 text-[10px]">{s.name}</span>)}</div></div>}
        <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Languages</h2><p className="opacity-90">English — Native</p></div>
        {certifications.length > 0 && <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Courses</h2><p className="opacity-90">{certifications[0].name}</p></div>}
        <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Hobbies</h2><p className="opacity-90 text-[10px]">—</p></div>
      </div>
    </div>
  );
}
