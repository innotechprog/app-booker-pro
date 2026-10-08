import React from "react";
import type { CvPreviewData } from "./types";
import {
  ACCENT,
  CARD_BASE,
  CustomSectionsBlock,
  EmailLink,
  PhoneLink,
  CvAvatar,
  descriptionToBullets,
} from "./shared";

// —— Template 14: Alisha Hill style – icon-led sections with polished spacing ——
export function Template14({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  const accent = data.accentColor || ACCENT;
  const Icon = () => <span className="inline-block w-2 h-2 rounded-full mr-1.5 shrink-0 mt-0.5 align-middle" style={{ backgroundColor: accent }} />;
  return (
    <div className={`${CARD_BASE} bg-gradient-to-b from-sky-50/80 to-white font-sans antialiased`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-full opacity-30" style={{ backgroundColor: accent }} />
            <CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={data.accentColor} className="relative w-14 h-14 border-emerald-500" ring="border-2 border-emerald-500" />
          </div>
          <div>
            <h1 className="text-base font-bold">{name}</h1>
            {personal.jobTitle && <p className="text-sm text-gray-600">{personal.jobTitle}</p>}
          </div>
        </div>
      </div>
      <div className="px-4 pb-4 text-sm space-y-3">
        {overview && <section><h2 className="text-[10px] font-bold flex items-center" style={{ color: accent }}><Icon />Summary</h2><p className="whitespace-pre-wrap text-gray-700 mt-0.5">{overview}</p></section>}
        <section><h2 className="text-[10px] font-bold flex items-center" style={{ color: accent }}><Icon />Contacts</h2><p className="text-gray-600 text-xs mt-0.5">{personal.currentLocation} · <PhoneLink phone={personal.phone} /> · <EmailLink email={personal.email} /></p></section>
        {keySkills.length > 0 && <section><h2 className="text-[10px] font-bold flex items-center" style={{ color: accent }}><Icon />Skills</h2><div className="flex flex-wrap gap-1.5 mt-0.5">{keySkills.map((s, i) => <span key={i} className="px-2 py-0.5 rounded border border-emerald-100 bg-emerald-50 text-[11px] text-emerald-800">{s.name}</span>)}</div></section>}
        {workExperience.length > 0 && <section><h2 className="text-[10px] font-bold flex items-center" style={{ color: accent }}><Icon />Experience</h2><ul className="space-y-1 mt-0.5">{workExperience.map((w, i) => { const bullets = w.description ? descriptionToBullets(w.description) : []; return (<li key={i}><span className="font-semibold text-gray-900">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`} <span className="text-gray-500 text-xs">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{bullets.length > 0 && <p className="text-[12px] text-gray-700 mt-0.5">{bullets[0]}</p>}</li>); })}</ul></section>}
        {education.length > 0 && <section><h2 className="text-[10px] font-bold flex items-center" style={{ color: accent }}><Icon />Education</h2><ul className="space-y-0.5 mt-0.5">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        {certifications.length > 0 && <section><h2 className="text-[10px] font-bold flex items-center" style={{ color: accent }}><Icon />Certifications</h2><ul className="space-y-0.5 mt-0.5 text-[12px] text-gray-700">{certifications.map((c, i) => <li key={i}><span className="font-medium text-gray-900">{c.name}</span>{c.issuer && ` (${c.issuer})`}</li>)}</ul></section>}
        <section><h2 className="text-[10px] font-bold flex items-center" style={{ color: accent }}><Icon />References</h2><p className="text-gray-600 text-xs mt-0.5">Available upon request</p></section>
        <CustomSectionsBlock sections={data.customSections ?? []} accent={accent} className="mt-2" />
      </div>
    </div>
  );
}
