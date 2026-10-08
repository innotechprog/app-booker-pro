import React from "react";
import type { CvPreviewData } from "./types";
import {
  ACCENT,
  CARD_BASE,
  CustomSectionsBlock,
  contactLine,
  linksLine,
  ContactLinksContent,
  CvAvatar,
  descriptionToBullets,
} from "./shared";

// —— Template 12: Helen Willis style – classic serif profile with stronger hierarchy ——
export function Template12({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  const accent = data.accentColor || ACCENT;
  const H = ({ children }: { children: React.ReactNode }) => <h2 className="text-[11px] font-semibold uppercase tracking-wider border-b border-gray-200 pb-1 mb-1.5" style={{ color: accent }}>{children}</h2>;
  return (
    <div className={`${CARD_BASE} font-serif antialiased`}>
      <div className="p-4 text-center">
        <div className="flex justify-center mb-2"><CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={accent} className="w-14 h-14" ring="border-2 border-gray-300" /></div>
        <h1 className="text-base font-bold uppercase tracking-wide">{name}</h1>
        {personal.jobTitle && <p className="text-xs text-gray-600 uppercase mt-0.5">{personal.jobTitle}</p>}
        {(contactLine(personal) || linksLine(personal)) && <p className="text-[10px] text-gray-500 mt-1"><ContactLinksContent personal={personal} /></p>}
      </div>
      <div className="px-4 pb-4 text-sm space-y-3">
        {overview && <section><H>Professional Summary</H><p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{overview}</p></section>}
        {workExperience.length > 0 && <section><H>Work Experience</H><ul className="space-y-2">{workExperience.map((w, i) => { const bullets = w.description ? descriptionToBullets(w.description) : []; return (<li key={i}><span className="font-semibold text-gray-900">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{bullets.length > 0 && <ul className="list-disc list-inside mt-1 text-gray-700 text-[12px] marker:text-gray-400 space-y-1">{bullets.map((line, j) => <li key={j}>{line}</li>)}</ul>}</li>); })}</ul></section>}
        {education.length > 0 && <section><H>Education</H><ul className="space-y-0.5">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        {keySkills.length > 0 && <section><H>Skills</H><div className="flex flex-wrap gap-1.5">{keySkills.map((s, i) => <span key={i} className="px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-[11px]">{s.name}</span>)}</div></section>}
        {certifications.length > 0 && <section><H>Certifications</H><ul className="space-y-1 text-[12px] text-gray-700">{certifications.map((c, i) => <li key={i}><span className="font-medium text-gray-900">{c.name}</span>{c.issuer && ` (${c.issuer})`}{c.date && ` · ${c.date}`}</li>)}</ul></section>}
        <CustomSectionsBlock sections={data.customSections ?? []} accent={accent} className="mt-3" />
      </div>
    </div>
  );
}
