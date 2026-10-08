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

// —— Template 11: Emma Carter style – clean single column, stronger header and section spacing ——
export function Template11({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const accent = data.accentColor || ACCENT;
  const name = personal.fullName || "Your name";
  const Sect = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="pt-3 mt-3 border-t border-slate-200 first:border-0 first:pt-0 first:mt-0">
      <h2 className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: accent }}>{title}</h2>
      {children}
    </section>
  );
  return (
    <div className={`${CARD_BASE} font-sans antialiased`}>
      <div className="h-1 w-full" style={{ backgroundColor: accent }} />
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={accent} className="w-12 h-12 shrink-0" ring="border-2 border-gray-200" />
          <div>
            <h1 className="text-lg font-bold uppercase tracking-tight">{name}</h1>
            {personal.jobTitle && <p className="text-xs text-gray-600 uppercase">{personal.jobTitle}</p>}
          </div>
        </div>
        <p className="text-[10px] leading-4 text-gray-500 text-right shrink-0 break-all">{personal.currentLocation}<br /><PhoneLink phone={personal.phone} /><br /><EmailLink email={personal.email} /></p>
      </div>
      <div className="px-4 pb-4 text-sm">
        {overview && <Sect title="Professional Summary"><p className="whitespace-pre-wrap text-gray-700">{overview}</p></Sect>}
        {workExperience.length > 0 && <Sect title="Experience"><ul className="space-y-3">{workExperience.map((w, i) => { const bullets = w.description ? descriptionToBullets(w.description) : []; return (<li key={i} className="flex justify-between gap-4"><div className="min-w-0"><span className="font-semibold text-gray-900">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}{bullets.length > 0 && <ul className="mt-1 list-disc list-inside text-gray-700 text-[12px] marker:text-gray-400 space-y-1">{bullets.map((line, j) => <li key={j}>{line}</li>)}</ul>}</div><span className="text-gray-500 text-xs shrink-0 text-right">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span></li>); })}</ul></Sect>}
        {education.length > 0 && <Sect title="Education"><ul className="space-y-1.5">{education.map((e, i) => (<li key={i} className="flex justify-between gap-4"><span className="font-medium text-gray-900">{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</span><span className="text-gray-500 text-xs shrink-0">{[e.startDate, e.endDate].filter(Boolean).join(" – ")}</span></li>))}</ul></Sect>}
        {keySkills.length > 0 && <Sect title="Skills"><div className="flex flex-wrap gap-1.5">{keySkills.map((s, i) => <span key={i} className="px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-[11px]">{s.name} {s.level ? `• ${s.level}` : ""}</span>)}</div></Sect>}
        {certifications.length > 0 && <Sect title="Certifications"><ul className="space-y-1 text-[12px] text-gray-700">{certifications.map((c, i) => <li key={i}><span className="font-medium text-gray-900">{c.name}</span>{c.issuer && ` (${c.issuer})`}{c.date && ` · ${c.date}`}</li>)}</ul></Sect>}
        <CustomSectionsBlock sections={data.customSections ?? []} accent={accent} className="mt-3" />
      </div>
    </div>
  );
}
