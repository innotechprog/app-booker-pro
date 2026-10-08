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

// —— Template 20: Mike Beckinsale style – left: avatar, name, title, Summary, Work Experience, Education, References, Languages, Links; dark blue right sidebar: DETAILS, SKILLS ——
export function Template20({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  return (
    <div className={`${CARD_BASE} min-h-[980px] flex items-stretch font-sans antialiased`}>
      <div className="flex-1 p-4 text-sm min-w-0">
        <div className="flex items-start gap-3">
          <CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={data.accentColor} className="w-12 h-12 shrink-0" />
          <div>
            <h1 className="text-base font-bold">{name}</h1>
            {personal.jobTitle && <p className="text-xs text-gray-600">{personal.jobTitle}</p>}
          </div>
        </div>
        {overview && <section className="mt-2"><SectionHeader accent={data.accentColor || ACCENT}>Summary</SectionHeader><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && <section className="mt-2"><SectionHeader accent={data.accentColor || ACCENT}>Work Experience</SectionHeader><ul className="space-y-2">{workExperience.map((w, i) => { const bullets = w.description ? descriptionToBullets(w.description) : []; return (<li key={i}><span className="font-semibold text-gray-900">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{bullets.length > 0 && <p className="text-gray-700 text-[12px]">{bullets[0]}</p>}</li>); })}</ul></section>}
        {education.length > 0 && <section className="mt-2"><SectionHeader accent={data.accentColor || ACCENT}>Education</SectionHeader><ul className="space-y-0.5">{education.map((e, i) => <li key={i}><span className="font-medium text-gray-900">{e.qualification || "—"}</span>{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        <section className="mt-2"><SectionHeader accent={data.accentColor || ACCENT}>References</SectionHeader><p className="text-gray-600 text-xs">Available upon request</p></section>
        <section className="mt-2"><SectionHeader accent={data.accentColor || ACCENT}>Languages</SectionHeader><p className="text-gray-600 text-xs">English</p></section>
        {(personal.linkedinUrl || personal.website || certifications.length > 0) && <section className="mt-2"><SectionHeader accent={data.accentColor || ACCENT}>Links</SectionHeader><p className="text-gray-600 text-xs">{[personal.linkedinUrl, personal.website, certifications[0]?.name].filter(Boolean).join(" · ")}</p></section>}
        <CustomSectionsBlock sections={data.customSections ?? []} accent={data.accentColor} className="mt-2" />
      </div>
      <div className="cv-dark-sidebar w-[28%] p-3 text-white text-xs" style={{ backgroundColor: data.accentColor || ACCENT }}>
        <h2 className="text-[10px] font-bold uppercase opacity-90 mb-1">Details</h2>
        <p className="opacity-90">{personal.currentLocation}</p>
        <p className="opacity-90"><PhoneLink phone={personal.phone} className="text-inherit" /></p>
        <p className="opacity-90"><EmailLink email={personal.email} className="text-inherit" /></p>
        {keySkills.length > 0 && <div className="mt-3"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Skills</h2><ul className="space-y-0.5 opacity-90">{keySkills.map((s, i) => <li key={i}>{s.name}</li>)}</ul></div>}
      </div>
    </div>
  );
}
