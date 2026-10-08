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

// —— Template 7: Alex Simson style – two-column header, WORK EXPERIENCE / EDUCATION / SKILLS / REFERENCES / LANGUAGES ——
export function Template7({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  return (
    <div className={`${CARD_BASE} bg-gray-50/50 p-4`}>
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div className="flex items-start gap-3 border-b border-gray-100 pb-3">
          <CvAvatar name={name} profilePictureUrl={personal.profilePictureUrl} showProfilePictureOnCv={personal.showProfilePictureOnCv} accentColor={data.accentColor} className="w-14 h-14" />
          <div className="flex-1">
            <h1 className="text-base font-bold">{name}{personal.jobTitle ? `, ${personal.jobTitle}` : ""}</h1>
            <p className="text-xs text-gray-600 mt-1">{personal.currentLocation}</p>
            <p className="text-xs text-gray-600"><PhoneLink phone={personal.phone} /> · <EmailLink email={personal.email} /></p>
            {personal.website && <p className="text-xs text-gray-600">{personal.website}</p>}
          </div>
        </div>
        <div className="pt-3 space-y-3 text-sm">
          {overview && <section><SectionHeader accent={data.accentColor || ACCENT}>Summary</SectionHeader><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
          {workExperience.length > 0 && <section><SectionHeader accent={data.accentColor || ACCENT}>Work Experience</SectionHeader>
            <ul className="space-y-2">{workExperience.map((w, i) => (
              <li key={i} className="flex gap-2"><span className="text-gray-500 text-xs shrink-0 w-24">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>
                <div><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && `, ${w.company}`} {w.description && <p className="text-gray-700 mt-0.5">{descriptionToBullets(w.description)[0]}</p>}</div>
              </li>
            ))}</ul>
          </section>}
          {education.length > 0 && <section><SectionHeader accent={data.accentColor || ACCENT}>Education</SectionHeader>
            <ul className="space-y-1">{education.map((e, i) => <li key={i} className="flex gap-2"><span className="text-gray-500 text-xs shrink-0 w-24">{[e.startDate, e.endDate].filter(Boolean).join(" – ")}</span>{e.qualification || "—"}{e.institution && `, ${e.institution}`}</li>)}</ul>
          </section>}
          {keySkills.length > 0 && <section><SectionHeader accent={data.accentColor || ACCENT}>Skills</SectionHeader><div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-700">{keySkills.map((s, i) => <span key={i}>{s.name} — {s.level || "Expert"}</span>)}</div></section>}
          {certifications.length > 0 && <section><SectionHeader accent={data.accentColor || ACCENT}>Certifications</SectionHeader><ul className="space-y-0.5 text-[12px] text-gray-700">{certifications.map((c, i) => <li key={i}>{c.name}</li>)}</ul></section>}
          <section><SectionHeader accent={data.accentColor || ACCENT}>References</SectionHeader><p className="text-xs text-gray-600">Available on request</p></section>
          <CustomSectionsBlock sections={data.customSections ?? []} accent={data.accentColor} className="mt-3" />
        </div>
      </div>
    </div>
  );
}
