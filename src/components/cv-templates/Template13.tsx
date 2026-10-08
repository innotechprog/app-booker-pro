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

// —— Template 13: Theo Ramos style – teal sidebar with clearer right-panel hierarchy ——
export function Template13({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  const accent = data.accentColor || ACCENT;
  return (
    <div className={`${CARD_BASE} h-full min-h-[980px] flex items-stretch min-w-0 font-sans antialiased`}>
      <div className="cv-dark-sidebar w-[32%] min-w-0 p-3 text-white text-xs shrink-0 flex flex-col overflow-hidden" style={{ backgroundColor: accent }}>
        <div className="flex justify-center mb-1.5 shrink-0"><CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={accent} className="w-11 h-11 border-white" ring="border-2 border-white" /></div>
        <p className="opacity-95 truncate">{personal.currentLocation}</p>
        <p className="opacity-95 truncate">{personal.phone}</p>
        <p className="opacity-95 truncate"><EmailLink email={personal.email} /></p>
        {overview && <div className="mt-1.5 flex-1 min-h-0 overflow-hidden"><h2 className="text-[10px] font-bold uppercase tracking-wider opacity-90 mb-0.5">Summary</h2><p className="whitespace-pre-wrap opacity-95 line-clamp-3 text-[10px]">{overview}</p></div>}
        {keySkills.length > 0 && <div className="mt-1.5 shrink-0"><h2 className="text-[10px] font-bold uppercase tracking-wider opacity-90 mb-0.5">Skills</h2><ul className="space-y-0.5 opacity-95 [&>li:nth-child(n+4)]:hidden">{keySkills.map((s, i) => <li key={i} className="truncate">{s.name}</li>)}</ul></div>}
      </div>
      <div className="flex-1 p-4 text-sm min-w-0 overflow-hidden flex flex-col">
        <SectionHeader accent={accent}>Work Experience</SectionHeader>
        {workExperience.length > 0 ? <ul className="space-y-1 flex-1 min-h-0 overflow-hidden [&>li:nth-child(n+3)]:hidden">{workExperience.map((w, i) => { const bullets = w.description ? descriptionToBullets(w.description) : []; return (<li key={i}><span className="font-semibold text-gray-900">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{bullets.length > 0 && <p className="text-gray-700 mt-0.5 line-clamp-2 text-[12px]">{bullets.join(" • ")}</p>}</li>); })}</ul> : <p className="text-gray-500">—</p>}
        <SectionHeader accent={accent}>Education</SectionHeader>
        {education.length > 0 ? <ul className="space-y-0.5">{education.slice(0, 2).map((e, i) => <li key={i} className="truncate">{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul> : <p className="text-gray-500">—</p>}
        <SectionHeader accent={accent}>References</SectionHeader>
        <p className="text-gray-600 text-xs truncate">{certifications.length ? certifications.map((c) => c.name).join(" · ") : "Available upon request"}</p>
        <CustomSectionsBlock sections={data.customSections ?? []} accent={accent} className="mt-2" />
      </div>
    </div>
  );
}
