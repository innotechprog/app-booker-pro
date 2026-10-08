import React from "react";
import type { CvPreviewData } from "./types";
import {
  ACCENT,
  CARD_BASE,
  SectionHeader,
  CustomSectionsBlock,
  EmailLink,
  descriptionToBullets,
} from "./shared";

// —— Template 15: Samantha Lewis style – two columns; stronger professional contrast and spacing ——
export function Template15({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  const accent = data.accentColor || ACCENT;
  return (
    <div className={`${CARD_BASE} min-h-[980px] flex items-stretch font-sans antialiased`}>
      <div className="w-[36%] p-3 text-sm border-r border-gray-200 bg-slate-50/50">
        <div className="py-2 px-3 mb-2 text-white font-bold text-sm rounded" style={{ backgroundColor: accent }}>{name}</div>
        {personal.jobTitle && <p className="text-xs text-gray-700 mb-2">{personal.jobTitle}</p>}
        <p className="text-[10px] text-gray-600 mb-1"><EmailLink email={personal.email} /></p>
        <p className="text-[10px] text-gray-600 mb-1">{personal.currentLocation}</p>
        <p className="text-[10px] text-gray-600 mb-3">{personal.phone}</p>
        {keySkills.length > 0 && <><h2 className="text-[10px] font-bold uppercase text-gray-600 mb-1">Skills</h2><div className="flex flex-wrap gap-1">{keySkills.slice(0, 4).map((s, i) => <span key={i} className="text-[10px] px-2 py-0.5 rounded text-white" style={{ backgroundColor: accent }}>{s.name} — {s.level || "Expert"}</span>)}</div></>}
        <h2 className="text-[10px] font-bold uppercase text-gray-600 mt-2 mb-1">Languages</h2>
        <div className="flex flex-wrap gap-1"><span className="text-[10px] px-2 py-0.5 rounded text-white" style={{ backgroundColor: accent }}>English — Native</span></div>
        {certifications.length > 0 && <><h2 className="text-[10px] font-bold uppercase text-gray-600 mt-2 mb-1">Certifications</h2><ul className="space-y-1 text-[10px] text-gray-700">{certifications.slice(0, 3).map((c, i) => <li key={i} className="truncate"><span className="font-medium">{c.name}</span></li>)}</ul></>}
      </div>
      <div className="flex-1 p-4 text-sm">
        {overview && <section className="mb-2"><SectionHeader accent={accent}>Summary</SectionHeader><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && <section><SectionHeader accent={accent}>Experience</SectionHeader><ul className="space-y-1.5">{workExperience.map((w, i) => { const bullets = w.description ? descriptionToBullets(w.description) : []; return (<li key={i}><span className="font-semibold text-gray-900">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{bullets.length > 0 && <p className="text-gray-700 text-[12px]">{bullets[0]}</p>}</li>); })}</ul></section>}
        {education.length > 0 && <section className="mt-2"><SectionHeader accent={accent}>Education</SectionHeader><ul className="space-y-0.5">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        <CustomSectionsBlock sections={data.customSections ?? []} accent={accent} className="mt-2" />
      </div>
    </div>
  );
}
