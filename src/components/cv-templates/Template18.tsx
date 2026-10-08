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

// —— Template 18: Jenna Morales style – dark teal left sidebar (avatar, name, title, Details, Skills, Languages, Links, Hobbies); right: Summary, Work Experience, Education, References ——
export function Template18({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  const accent = data.accentColor || ACCENT;
  return (
    <div className={`${CARD_BASE} min-h-[980px] flex items-stretch font-sans antialiased`}>
      <div className="cv-dark-sidebar w-[36%] p-3 text-white text-xs" style={{ backgroundColor: accent }}>
        <div className="flex justify-center mb-2"><CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={data.accentColor} className="w-14 h-14 border-white" ring="border-2 border-white" /></div>
        <h1 className="text-center font-bold text-sm">{name}</h1>
        {personal.jobTitle && <p className="text-center text-[10px] opacity-90 mt-0.5">{personal.jobTitle}</p>}
        <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Details</h2><p className="opacity-90">{personal.currentLocation}</p><p className="opacity-90"><EmailLink email={personal.email} className="text-inherit" /></p><p className="opacity-90"><PhoneLink phone={personal.phone} className="text-inherit" /></p></div>
        {keySkills.length > 0 && <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Skills</h2><div className="flex flex-wrap gap-1 opacity-95">{keySkills.slice(0, 8).map((s, i) => <span key={i} className="px-1.5 py-0.5 rounded bg-white/15 border border-white/20 text-[10px]">{s.name}</span>)}</div></div>}
        <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Languages</h2><p className="opacity-90">English</p></div>
        {(personal.linkedinUrl || personal.website || certifications.length > 0) && <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Links</h2><p className="opacity-90 text-[10px]">{[personal.linkedinUrl, personal.website, certifications[0]?.name].filter(Boolean).join(" · ")}</p></div>}
        <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Hobbies</h2><p className="opacity-90 text-[10px]">—</p></div>
      </div>
      <div className="flex-1 p-4 text-sm">
        {overview && <section className="mb-2"><SectionHeader accent={accent}>Summary</SectionHeader><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && <section><SectionHeader accent={accent}>Work Experience</SectionHeader><ul className="space-y-2">{workExperience.map((w, i) => { const bullets = w.description ? descriptionToBullets(w.description) : []; return (<li key={i}><span className="font-semibold text-gray-900">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{bullets.length > 0 && <p className="text-gray-700 text-[12px]">{bullets[0]}</p>}</li>); })}</ul></section>}
        {education.length > 0 && <section className="mt-2"><SectionHeader accent={accent}>Education</SectionHeader><ul className="space-y-0.5">{education.map((e, i) => <li key={i}><span className="font-medium text-gray-900">{e.qualification || "—"}</span>{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        <section className="mt-2"><SectionHeader accent={accent}>References</SectionHeader><p className="text-gray-600 text-xs">Available upon request</p></section>
        <CustomSectionsBlock sections={data.customSections ?? []} accent={accent} className="mt-2" />
      </div>
    </div>
  );
}
