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

// —— Template 19: Anna Rodriguez style – dark grey left sidebar (avatar, CONTACTS with icons, EDUCATION); right: orange band (job title left, name right), PROFESSIONAL SUMMARY, SKILLS two-col, WORK EXPERIENCE, LINKS ——
export function Template19({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  const grey = "#4b5563";
  const accent = data.accentColor || ACCENT;
  return (
    <div className={`${CARD_BASE} min-h-[980px] flex items-stretch font-sans antialiased`}>
      <div className="cv-dark-sidebar w-[30%] p-3 text-white text-xs" style={{ backgroundColor: grey }}>
        <div className="flex justify-center mb-2"><CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={data.accentColor} className="w-12 h-12 border-white" ring="border-2 border-white" /></div>
        <h2 className="text-[10px] font-bold uppercase mb-0.5">Contacts</h2>
        <p className="opacity-90"><EmailLink email={personal.email} className="text-white" /></p>
        <p className="opacity-90">{personal.currentLocation}</p>
        <p className="opacity-90"><PhoneLink phone={personal.phone} className="text-white" /></p>
        {education.length > 0 && <div className="mt-2"><h2 className="text-[10px] font-bold uppercase mb-0.5">Education</h2><ul className="space-y-0.5 opacity-90">{education.map((e, i) => <li key={i}>{e.qualification}{e.institution && ` — ${e.institution}`}</li>)}</ul></div>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="py-2 px-4 flex justify-between items-center text-white" style={{ backgroundColor: accent }}>
          <span className="text-xs font-bold">{personal.jobTitle || "Job Title"}</span>
          <span className="text-sm font-bold uppercase tracking-wide">{name}</span>
        </div>
        <div className="p-4 text-sm">
          {overview && <section className="mb-2"><SectionHeader accent={accent}>Professional Summary</SectionHeader><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
          {keySkills.length > 0 && <section className="mb-2"><SectionHeader accent={accent}>Skills</SectionHeader><div className="flex flex-wrap gap-1.5">{keySkills.map((s, i) => <span key={i} className="px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-[11px]">{s.name}</span>)}</div></section>}
          {workExperience.length > 0 && <section><SectionHeader accent={accent}>Work Experience</SectionHeader><ul className="space-y-2">{workExperience.map((w, i) => { const bullets = w.description ? descriptionToBullets(w.description) : []; return (<li key={i}><span className="font-semibold text-gray-900">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{bullets.length > 0 && <p className="text-gray-700 text-[12px]">{bullets[0]}</p>}</li>); })}</ul></section>}
          {(certifications.length > 0 || personal.website) && <section className="mt-2"><SectionHeader accent={accent}>Links</SectionHeader><p className="text-gray-600 text-xs">{[personal.website, certifications[0]?.name].filter(Boolean).join(" · ")}</p></section>}
          <CustomSectionsBlock sections={data.customSections ?? []} accent={accent} className="mt-2" />
        </div>
      </div>
    </div>
  );
}
