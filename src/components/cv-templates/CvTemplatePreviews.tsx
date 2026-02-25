import React from "react";
import type { WorkExperienceItem, EducationItem, CertificationItem, SkillItem } from "@/pages/SmartApplyProfile";

const ACCENT = "#1e3a5f";

export interface CvPreviewData {
  personal: {
    fullName: string;
    email: string;
    phone: string;
    currentLocation: string;
    jobTitle: string;
    linkedinUrl: string;
    website: string;
    dateOfBirth: string;
    gender: string;
    nationality: string;
  };
  overview: string;
  workExperience: WorkExperienceItem[];
  education: EducationItem[];
  certifications: CertificationItem[];
  keySkills: SkillItem[];
}

function contactLine(p: CvPreviewData["personal"]): string {
  return [p.email, p.phone, p.currentLocation].filter(Boolean).join(" • ");
}

function linksLine(p: CvPreviewData["personal"]): string {
  return [p.linkedinUrl, p.website].filter(Boolean).join(" • ");
}

function getInitials(fullName: string): string {
  if (!fullName || !fullName.trim()) return "?";
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0].slice(0, 2) || "?").toUpperCase();
}

function AvatarPlaceholder({ name, className = "w-12 h-12", ring = "border-2 border-emerald-500" }: { name: string; className?: string; ring?: string }) {
  return (
    <div className={`rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0 ${ring} ${className}`} style={{ backgroundColor: ACCENT }}>
      {getInitials(name)}
    </div>
  );
}

// —— Template 1: Classic One-Column ——
function Template1({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, certifications, keySkills } = data;
  return (
    <div className="bg-white text-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-200 min-h-[280px]">
      <div className="p-5">
        <h1 className="text-xl font-bold text-gray-900">{personal.fullName || "Your name"}</h1>
        {personal.jobTitle && <p className="text-sm text-gray-600 mt-0.5">{personal.jobTitle}</p>}
        {(contactLine(personal) || linksLine(personal)) && (
          <p className="text-xs text-gray-500 mt-2">{[contactLine(personal), linksLine(personal)].filter(Boolean).join(" | ")}</p>
        )}
      </div>
      <div className="px-5 pb-5 space-y-4 text-sm border-t border-gray-200 pt-4">
        {overview && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-300 pb-1 mb-2">Summary</h2>
            <p className="whitespace-pre-wrap text-gray-700">{overview}</p>
          </section>
        )}
        {workExperience.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-300 pb-1 mb-2">Experience</h2>
            <ul className="space-y-2">
              {workExperience.map((w, i) => (
                <li key={i}>
                  <span className="font-medium">{w.jobTitle || "Role"}</span>
                  {w.company && <span className="text-gray-600"> at {w.company}</span>}
                  {(w.startDate || w.endDate) && <span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>}
                  {w.description && <p className="text-gray-700 mt-0.5">{w.description}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}
        {education.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-300 pb-1 mb-2">Education</h2>
            <ul className="space-y-2">
              {education.map((e, i) => (
                <li key={i}>
                  <span className="font-medium">{e.qualification || "Qualification"}</span>
                  {e.institution && <span className="text-gray-600"> — {e.institution}</span>}
                  {(e.startDate || e.endDate) && <span className="text-gray-500 text-xs block">{[e.startDate, e.endDate].filter(Boolean).join(" – ")}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}
        {keySkills.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-300 pb-1 mb-2">Skills</h2>
            <p className="text-gray-700">{keySkills.map((s) => s.name).filter(Boolean).join(", ") || "—"}</p>
          </section>
        )}
        {certifications.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-300 pb-1 mb-2">Certifications</h2>
            <ul className="space-y-1 text-gray-700">
              {certifications.map((c, i) => (
                <li key={i}>{c.name}{c.issuer && ` (${c.issuer})`}{c.date && ` — ${c.date}`}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

// —— Template 2: Clean Lines (thin dividers, uppercase grey headings) ——
function Template2({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, certifications, keySkills } = data;
  const H = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 pb-1.5 mb-2 mt-4 first:mt-0">{children}</h2>
  );
  return (
    <div className="bg-white text-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-200 min-h-[280px]">
      <div className="p-5">
        <h1 className="text-lg font-bold text-gray-900">{personal.fullName || "Your name"}</h1>
        {personal.jobTitle && <p className="text-sm text-gray-600">{personal.jobTitle}</p>}
        {contactLine(personal) && <p className="text-xs text-gray-500 mt-1">{contactLine(personal)}</p>}
      </div>
      <div className="px-5 pb-5 text-sm">
        {overview && <><H>Summary</H><p className="whitespace-pre-wrap text-gray-700">{overview}</p></>}
        {workExperience.length > 0 && (
          <><H>Experience</H>
          <ul className="space-y-2">
            {workExperience.map((w, i) => (
              <li key={i}>
                <span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && ` at ${w.company}`}
                {(w.startDate || w.endDate) && <span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>}
                {w.description && <p className="text-gray-700 mt-0.5">{w.description}</p>}
              </li>
            ))}
          </ul></>
        )}
        {education.length > 0 && (
          <><H>Education</H>
          <ul className="space-y-1">
            {education.map((e, i) => (
              <li key={i}><span className="font-medium">{e.qualification || "—"}</span>{e.institution && ` — ${e.institution}`}</li>
            ))}
          </ul></>
        )}
        {keySkills.length > 0 && <><H>Skills</H><p className="text-gray-700">{keySkills.map((s) => s.name).filter(Boolean).join(", ")}</p></>}
        {certifications.length > 0 && <><H>Certifications</H><ul className="space-y-0.5 text-gray-700">{certifications.map((c, i) => <li key={i}>{c.name}{c.issuer && ` (${c.issuer})`}</li>)}</ul></>}
      </div>
    </div>
  );
}

// —— Template 3: Basic Two-Section (top block, then Experience, then Education & Skills) ——
function Template3({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills } = data;
  return (
    <div className="bg-white text-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-200 min-h-[280px]">
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h1 className="text-lg font-bold">{personal.fullName || "Your name"}</h1>
        <p className="text-xs text-gray-600 mt-1">{contactLine(personal)}</p>
        {personal.jobTitle && <p className="text-xs text-gray-500 mt-0.5">{personal.jobTitle}</p>}
      </div>
      <div className="p-4 space-y-4 text-sm">
        {workExperience.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-gray-700 mb-2">Experience</h2>
            <ul className="space-y-2">
              {workExperience.map((w, i) => (
                <li key={i} className="flex justify-between gap-2">
                  <div>
                    <span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && ` at ${w.company}`}
                    {w.description && <p className="text-gray-600 mt-0.5">{w.description}</p>}
                  </div>
                  {(w.startDate || w.endDate) && <span className="text-gray-500 text-xs shrink-0">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}
        <section className="border-t border-gray-200 pt-3">
          <h2 className="text-xs font-semibold text-gray-700 mb-2">Education & Skills</h2>
          {education.length > 0 && (
            <ul className="space-y-1 mb-2">
              {education.map((e, i) => (
                <li key={i}><span className="font-medium">{e.qualification || "—"}</span>{e.institution && ` — ${e.institution}`}</li>
              ))}
            </ul>
          )}
          {keySkills.length > 0 && <p className="text-gray-700">{keySkills.map((s) => s.name).filter(Boolean).join(", ")}</p>}
        </section>
      </div>
    </div>
  );
}

// —— Template 4: Subtle Accent Bar (thin colored bar at top) ——
function Template4({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  return (
    <div className="bg-white text-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-200 min-h-[280px]">
      <div className="h-1.5 w-full" style={{ backgroundColor: ACCENT }} />
      <div className="p-5">
        <h1 className="text-xl font-bold" style={{ color: ACCENT }}>{personal.fullName || "Your name"}</h1>
        {personal.jobTitle && <p className="text-sm text-gray-600">{personal.jobTitle}</p>}
        <p className="text-xs text-gray-500 mt-1">{contactLine(personal)}</p>
      </div>
      <div className="px-5 pb-5 space-y-3 text-sm border-t border-gray-100 pt-4">
        {overview && <section><h2 className="text-xs font-semibold uppercase tracking-wide pb-1 mb-1" style={{ color: ACCENT }}>Summary</h2><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide pb-1 mb-1" style={{ color: ACCENT }}>Experience</h2>
            <ul className="space-y-2">{workExperience.map((w, i) => (
              <li key={i}><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && ` at ${w.company}`}
                {(w.startDate || w.endDate) && <span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>}
                {w.description && <p className="text-gray-700 mt-0.5">{w.description}</p>}
              </li>
            ))}</ul>
          </section>
        )}
        {education.length > 0 && (
          <section><h2 className="text-xs font-semibold uppercase tracking-wide pb-1 mb-1" style={{ color: ACCENT }}>Education</h2>
            <ul className="space-y-1">{education.map((e, i) => (
              <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>
            ))}</ul>
          </section>
        )}
        {keySkills.length > 0 && <section><h2 className="text-xs font-semibold uppercase tracking-wide pb-1 mb-1" style={{ color: ACCENT }}>Skills</h2><p className="text-gray-700">{keySkills.map((s) => s.name).filter(Boolean).join(", ")}</p></section>}
        {certifications.length > 0 && <section><h2 className="text-xs font-semibold uppercase tracking-wide pb-1 mb-1" style={{ color: ACCENT }}>Certifications</h2><ul className="space-y-0.5">{certifications.map((c, i) => <li key={i}>{c.name}</li>)}</ul></section>}
      </div>
    </div>
  );
}

// —— Template 5: Left Accent Border ——
function Template5({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills } = data;
  return (
    <div className="bg-white text-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-200 min-h-[280px] flex">
      <div className="w-1.5 shrink-0 rounded-l-lg" style={{ backgroundColor: ACCENT }} />
      <div className="flex-1 p-5">
        <h1 className="text-lg font-bold">{personal.fullName || "Your name"}</h1>
        {personal.jobTitle && <p className="text-sm text-gray-600">{personal.jobTitle}</p>}
        <p className="text-xs text-gray-500 mt-1">{contactLine(personal)}</p>
        <div className="mt-4 space-y-3 text-sm border-t border-gray-100 pt-4">
          {overview && <section><h2 className="text-xs font-bold text-gray-700 mb-1">Summary</h2><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
          {workExperience.length > 0 && (
            <section><h2 className="text-xs font-bold text-gray-700 mb-1">Experience</h2>
              <ul className="space-y-2">{workExperience.map((w, i) => (
                <li key={i}><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && ` at ${w.company}`}
                  {(w.startDate || w.endDate) && <span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>}
                  {w.description && <p className="text-gray-700 mt-0.5">{w.description}</p>}
                </li>
              ))}</ul>
            </section>
          )}
          {education.length > 0 && <section><h2 className="text-xs font-bold text-gray-700 mb-1">Education</h2><ul className="space-y-1">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
          {keySkills.length > 0 && <section><h2 className="text-xs font-bold text-gray-700 mb-1">Skills</h2><p className="text-gray-700">{keySkills.map((s) => s.name).filter(Boolean).join(", ")}</p></section>}
        </div>
      </div>
    </div>
  );
}

// —— Template 6: David Miller style – single column, photo left, name uppercase, contact right, dates left in exp/edu ——
function Template6({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills } = data;
  const name = personal.fullName || "Your name";
  return (
    <div className="bg-white text-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-200 min-h-[280px]">
      <div className="p-4 flex items-start gap-3 border-b border-gray-200">
        <AvatarPlaceholder name={name} className="w-14 h-14" ring="border-2 border-emerald-500" />
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold uppercase tracking-wide">{name}</h1>
          {personal.jobTitle && <p className="text-xs text-gray-600 mt-0.5">{personal.jobTitle}</p>}
        </div>
        <div className="text-right text-xs text-gray-600 shrink-0">
          <p>{personal.currentLocation}</p>
          <p>{personal.phone}</p>
          <p>{personal.email}</p>
        </div>
      </div>
      <div className="p-4 text-sm space-y-3">
        {overview && <section><h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-300 pb-1 mb-1">Summary</h2><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && (
          <section><h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-300 pb-1 mb-1">Experience</h2>
            <ul className="space-y-2">{workExperience.map((w, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-gray-500 text-xs shrink-0 w-20">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>
                <div><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && `, ${w.company}`} {personal.currentLocation && <span className="text-gray-500">· {personal.currentLocation}</span>}
                  {w.description && <ul className="list-disc pl-4 mt-0.5 text-gray-700">{w.description.split(/[.\n]/).filter(Boolean).slice(0, 2).map((line, j) => <li key={j}>{line}</li>)}</ul>}
                </div>
              </li>
            ))}</ul>
          </section>
        )}
        {education.length > 0 && <section><h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-300 pb-1 mb-1">Education</h2>
          <ul className="space-y-1">{education.map((e, i) => (
            <li key={i} className="flex gap-3"><span className="text-gray-500 text-xs shrink-0 w-20">{[e.startDate, e.endDate].filter(Boolean).join(" – ")}</span><span>{e.qualification || "—"}{e.institution && `, ${e.institution}`}</span></li>
          ))}</ul>
        </section>}
        {keySkills.length > 0 && <section><h2 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-300 pb-1 mb-1">Skills</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-700">{keySkills.map((s, i) => <span key={i}>{s.name} — {s.level || "Expert"}</span>)}</div>
        </section>}
      </div>
    </div>
  );
}

// —— Template 7: Alex Simson style – two-column header, WORK EXPERIENCE / EDUCATION / SKILLS / REFERENCES / LANGUAGES ——
function Template7({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  return (
    <div className="bg-gray-100 text-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-200 min-h-[280px] p-3">
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-start gap-3 border-b border-gray-100 pb-3">
          <AvatarPlaceholder name={name} className="w-14 h-14" />
          <div className="flex-1">
            <h1 className="text-base font-bold">{name}{personal.jobTitle ? `, ${personal.jobTitle}` : ""}</h1>
            <p className="text-xs text-gray-600 mt-1">{personal.currentLocation}</p>
            <p className="text-xs text-gray-600">{personal.phone} · {personal.email}</p>
            {personal.website && <p className="text-xs text-gray-600">{personal.website}</p>}
          </div>
        </div>
        <div className="pt-3 space-y-3 text-sm">
          {overview && <section><h2 className="text-[10px] font-bold uppercase text-gray-500 mb-1">Summary</h2><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
          {workExperience.length > 0 && <section><h2 className="text-[10px] font-bold uppercase text-gray-500 mb-1">Work Experience</h2>
            <ul className="space-y-2">{workExperience.map((w, i) => (
              <li key={i} className="flex gap-2"><span className="text-gray-500 text-xs shrink-0 w-24">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>
                <div><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && `, ${w.company}`} {w.description && <p className="text-gray-700 mt-0.5">{w.description}</p>}</div>
              </li>
            ))}</ul>
          </section>}
          {education.length > 0 && <section><h2 className="text-[10px] font-bold uppercase text-gray-500 mb-1">Education</h2>
            <ul className="space-y-1">{education.map((e, i) => <li key={i} className="flex gap-2"><span className="text-gray-500 text-xs shrink-0 w-24">{[e.startDate, e.endDate].filter(Boolean).join(" – ")}</span>{e.qualification || "—"}{e.institution && `, ${e.institution}`}</li>)}</ul>
          </section>}
          {keySkills.length > 0 && <section><h2 className="text-[10px] font-bold uppercase text-gray-500 mb-1">Skills</h2><div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-700">{keySkills.map((s, i) => <span key={i}>{s.name} — {s.level || "Expert"}</span>)}</div></section>}
          {certifications.length > 0 && <section><h2 className="text-[10px] font-bold uppercase text-gray-500 mb-1">References</h2><p className="text-xs text-gray-600">Available on request</p></section>}
        </div>
      </div>
    </div>
  );
}

// —— Template 8: Helen Hart style – photo left, name + title, address; contact two columns right; light blue gradient ——
function Template8({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills } = data;
  const name = personal.fullName || "Your name";
  return (
    <div className="bg-gradient-to-b from-sky-50 to-white text-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-200 min-h-[280px]">
      <div className="p-4 flex items-start justify-between gap-4 border-b border-sky-100">
        <div className="flex items-start gap-3">
          <AvatarPlaceholder name={name} className="w-14 h-14" />
          <div>
            <h1 className="text-base font-bold">{name}{personal.jobTitle ? `, ${personal.jobTitle}` : ""}</h1>
            <p className="text-xs text-gray-600 mt-0.5">{personal.currentLocation}</p>
          </div>
        </div>
        <div className="flex gap-6 text-xs text-gray-600 text-right">
          <div><p>{personal.phone}</p></div>
          <div><p>{personal.email}</p></div>
        </div>
      </div>
      <div className="p-4 space-y-3 text-sm">
        {overview && <section><h2 className="text-[10px] font-bold uppercase text-gray-500 mb-1">Summary</h2><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && <section><h2 className="text-[10px] font-bold uppercase text-gray-500 mb-1">Work Experience</h2>
          <ul className="space-y-2">{workExperience.map((w, i) => (
            <li key={i} className="flex gap-2"><span className="text-gray-500 text-xs shrink-0 w-24">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>
              <div><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && `, ${w.company}`} {w.description && <p className="text-gray-700 mt-0.5">{w.description}</p>}</div>
            </li>
          ))}</ul>
        </section>}
        {education.length > 0 && <section><h2 className="text-[10px] font-bold uppercase text-gray-500 mb-1">Education</h2>
          <ul className="space-y-1">{education.map((e, i) => <li key={i} className="flex gap-2"><span className="text-gray-500 text-xs shrink-0 w-24">{[e.startDate, e.endDate].filter(Boolean).join(" – ")}</span>{e.qualification || "—"}{e.institution && `, ${e.institution}`}</li>)}</ul>
        </section>}
        {keySkills.length > 0 && <section><h2 className="text-[10px] font-bold uppercase text-gray-500 mb-1">Skills</h2><div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-700">{keySkills.map((s, i) => <span key={i}>{s.name} — {s.level || "Expert"}</span>)}</div></section>}
      </div>
    </div>
  );
}

// —— Template 9: Jack Clark style – minimal, small photo, name uppercase + title, contact below; Skills two-col Expert ——
function Template9({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills } = data;
  const name = personal.fullName || "Your name";
  return (
    <div className="bg-white text-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-200 min-h-[280px]">
      <div className="p-4 flex items-center gap-3 border-b border-gray-200">
        <AvatarPlaceholder name={name} className="w-11 h-11" />
        <div>
          <h1 className="text-xs font-bold uppercase tracking-wide">{name}</h1>
          {personal.jobTitle && <p className="text-xs font-bold uppercase tracking-wide text-gray-600 mt-0.5">{personal.jobTitle}</p>}
          <p className="text-xs text-gray-500 mt-1">{personal.currentLocation} · {personal.phone} · {personal.email}</p>
        </div>
      </div>
      <div className="p-4 space-y-3 text-sm">
        {overview && <section><h2 className="text-[10px] font-bold uppercase text-gray-500 border-b border-gray-200 pb-1 mb-1">Summary</h2><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {keySkills.length > 0 && <section><h2 className="text-[10px] font-bold uppercase text-gray-500 border-b border-gray-200 pb-1 mb-1">Skills</h2><div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-700">{keySkills.map((s, i) => <span key={i}>{s.name} — {s.level || "Expert"}</span>)}</div></section>}
        {workExperience.length > 0 && <section><h2 className="text-[10px] font-bold uppercase text-gray-500 border-b border-gray-200 pb-1 mb-1">Experience</h2><ul className="space-y-2">{workExperience.map((w, i) => <li key={i}><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && `, ${w.company}`} · {[w.startDate, w.endDate].filter(Boolean).join(" – ")} {w.description && <p className="text-gray-700 mt-0.5">{w.description}</p>}</li>)}</ul></section>}
        {education.length > 0 && <section><h2 className="text-[10px] font-bold uppercase text-gray-500 border-b border-gray-200 pb-1 mb-1">Education</h2><ul className="space-y-0.5">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
      </div>
    </div>
  );
}

// —— Template 10: Maria Dean style – dark blue full-width header, photo in header, name + title + contact in white ——
function Template10({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills } = data;
  const name = personal.fullName || "Your name";
  return (
    <div className="bg-white text-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-200 min-h-[280px]">
      <div className="py-4 px-4 text-white flex items-center gap-4" style={{ backgroundColor: ACCENT }}>
        <AvatarPlaceholder name={name} className="w-16 h-16 border-white" ring="border-2 border-white" />
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold">{name}</h1>
          {personal.jobTitle && <p className="text-sm opacity-95">{personal.jobTitle}</p>}
          <p className="text-xs opacity-90 mt-1">{personal.currentLocation} · {personal.phone} · {personal.email}</p>
        </div>
      </div>
      <div className="p-4 space-y-3 text-sm">
        {overview && <section><h2 className="text-xs font-bold text-gray-900 mb-1">Summary</h2><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && <section><h2 className="text-xs font-bold text-gray-900 mb-1">Work Experience</h2><ul className="space-y-2">{workExperience.map((w, i) => (<li key={i}><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && `, ${w.company}`} <span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{w.description && <p className="text-gray-700 mt-0.5">{w.description}</p>}</li>))}</ul></section>}
        {education.length > 0 && <section><h2 className="text-xs font-bold text-gray-900 mb-1">Education</h2><ul className="space-y-0.5">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        {keySkills.length > 0 && <section><h2 className="text-xs font-bold text-gray-900 mb-1">Skills</h2><div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-700">{keySkills.map((s, i) => <span key={i}>{s.name} — {s.level || "Expert"}</span>)}</div></section>}
      </div>
    </div>
  );
}

// —— Template 11: Emma Carter style – single column, avatar left, name/title left + contact right; thin lines before sections; dates right-aligned ——
function Template11({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills } = data;
  const name = personal.fullName || "Your name";
  const Sect = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section><div className="border-t border-gray-300 pt-2 mt-2 first:border-0 first:pt-0 first:mt-0"><h2 className="text-[10px] font-bold uppercase text-gray-700 mb-1">{title}</h2>{children}</div></section>
  );
  return (
    <div className="bg-white text-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-200 min-h-[280px]">
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <AvatarPlaceholder name={name} className="w-12 h-12 shrink-0" />
          <div>
            <h1 className="text-base font-bold uppercase tracking-tight">{name}</h1>
            {personal.jobTitle && <p className="text-xs text-gray-600 uppercase">{personal.jobTitle}</p>}
          </div>
        </div>
        <p className="text-[10px] text-gray-500 text-right shrink-0">{personal.currentLocation}<br />{personal.phone}<br />{personal.email}</p>
      </div>
      <div className="px-4 pb-4 text-sm">
        {overview && <Sect title="Summary"><p className="whitespace-pre-wrap text-gray-700">{overview}</p></Sect>}
        {workExperience.length > 0 && <Sect title="Experience"><ul className="space-y-2">{workExperience.map((w, i) => (<li key={i} className="flex justify-between gap-4"><div className="min-w-0"><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}{w.location && `, ${w.location}`}<br />{w.description && <span className="text-gray-700">{w.description}</span>}</div><span className="text-gray-500 text-xs shrink-0 text-right">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span></li>))}</ul></Sect>}
        {education.length > 0 && <Sect title="Education"><ul className="space-y-1">{education.map((e, i) => (<li key={i} className="flex justify-between gap-4"><span>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</span><span className="text-gray-500 text-xs shrink-0">{[e.startDate, e.endDate].filter(Boolean).join(" – ")}</span></li>))}</ul></Sect>}
        {keySkills.length > 0 && <Sect title="Skills"><div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-700">{keySkills.map((s, i) => <span key={i}>{s.name} — {s.level || "Expert"}</span>)}</div></Sect>}
      </div>
    </div>
  );
}

// —— Template 12: Helen Willis style – classic B&W, centered avatar above name, PROFESSIONAL SUMMARY, WORK EXPERIENCE, LANGUAGES, EDUCATION, SKILLS; serif feel ——
function Template12({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills } = data;
  const name = personal.fullName || "Your name";
  const H = ({ children }: { children: React.ReactNode }) => <h2 className="text-[10px] font-bold uppercase text-gray-700 border-b border-gray-300 pb-1 mb-1.5">{children}</h2>;
  return (
    <div className="bg-white text-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-200 min-h-[280px] font-serif">
      <div className="p-4 text-center">
        <div className="flex justify-center mb-2"><AvatarPlaceholder name={name} className="w-14 h-14" /></div>
        <h1 className="text-base font-bold uppercase tracking-wide">{name}</h1>
        {personal.jobTitle && <p className="text-xs text-gray-600 uppercase mt-0.5">{personal.jobTitle}</p>}
      </div>
      <div className="px-4 pb-4 text-sm space-y-3">
        {overview && <section><H>Professional Summary</H><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && <section><H>Work Experience</H><ul className="space-y-2">{workExperience.map((w, i) => (<li key={i}><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{w.description && <p className="text-gray-700 mt-0.5">{w.description}</p>}</li>))}</ul></section>}
        <section><H>Languages</H><p className="text-gray-700">English, —</p></section>
        {education.length > 0 && <section><H>Education</H><ul className="space-y-0.5">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        {keySkills.length > 0 && <section><H>Skills</H><p className="text-gray-700">{keySkills.map((s) => s.name).filter(Boolean).join(", ")}</p></section>}
      </div>
    </div>
  );
}

// —— Template 13: Theo Ramos style – teal left sidebar (avatar, contact, SUMMARY, SKILLS); right white: WORK EXPERIENCE, EDUCATION, REFERENCES ——
function Template13({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  const teal = "#0d9488";
  return (
    <div className="bg-white text-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-200 min-h-[280px] flex">
      <div className="w-[38%] p-3 text-white text-xs" style={{ backgroundColor: teal }}>
        <div className="flex justify-center mb-2"><AvatarPlaceholder name={name} className="w-14 h-14 border-white" ring="border-2 border-white" /></div>
        <p className="opacity-95">{personal.currentLocation}</p>
        <p className="opacity-95">{personal.phone}</p>
        <p className="opacity-95">{personal.email}</p>
        {overview && <div className="mt-3"><h2 className="text-[10px] font-bold uppercase tracking-wider opacity-90 mb-1">Summary</h2><p className="whitespace-pre-wrap opacity-95 line-clamp-4">{overview}</p></div>}
        {keySkills.length > 0 && <div className="mt-3"><h2 className="text-[10px] font-bold uppercase tracking-wider opacity-90 mb-1">Skills</h2><ul className="space-y-0.5 opacity-95">{keySkills.map((s, i) => <li key={i}>{s.name}</li>)}</ul></div>}
      </div>
      <div className="flex-1 p-4 text-sm">
        <h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-300 pb-1 mb-1.5">Work Experience</h2>
        {workExperience.length > 0 ? <ul className="space-y-2">{workExperience.map((w, i) => (<li key={i}><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{w.description && <p className="text-gray-700 mt-0.5">{w.description}</p>}</li>))}</ul> : <p className="text-gray-500">—</p>}
        <h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-300 pb-1 mb-1.5 mt-3">Education</h2>
        {education.length > 0 ? <ul className="space-y-0.5">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul> : <p className="text-gray-500">—</p>}
        <h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-300 pb-1 mb-1.5 mt-3">References</h2>
        <p className="text-gray-600 text-xs">{certifications.length ? certifications.map((c) => c.name).join(" · ") : "Available upon request"}</p>
      </div>
    </div>
  );
}

// —— Template 14: Alisha Hill style – light green accent shape behind avatar, section titles with small green icons; light blue gradient ——
function Template14({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills } = data;
  const name = personal.fullName || "Your name";
  const green = "#16a34a";
  const Icon = () => <span className="inline-block w-2 h-2 rounded-full mr-1.5 shrink-0 mt-0.5 align-middle" style={{ backgroundColor: green }} />;
  return (
    <div className="bg-gradient-to-b from-sky-50 to-white text-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-200 min-h-[280px]">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-full opacity-30" style={{ backgroundColor: green }} />
            <AvatarPlaceholder name={name} className="relative w-14 h-14 border-emerald-500" ring="border-2 border-emerald-500" />
          </div>
          <div>
            <h1 className="text-base font-bold">{name}</h1>
            {personal.jobTitle && <p className="text-sm text-gray-600">{personal.jobTitle}</p>}
          </div>
        </div>
      </div>
      <div className="px-4 pb-4 text-sm space-y-2.5">
        {overview && <section><h2 className="text-[10px] font-bold flex items-center" style={{ color: green }}><Icon />Summary</h2><p className="whitespace-pre-wrap text-gray-700 mt-0.5">{overview}</p></section>}
        <section><h2 className="text-[10px] font-bold flex items-center" style={{ color: green }}><Icon />Contacts</h2><p className="text-gray-600 text-xs mt-0.5">{personal.currentLocation} · {personal.phone} · {personal.email}</p></section>
        {keySkills.length > 0 && <section><h2 className="text-[10px] font-bold flex items-center" style={{ color: green }}><Icon />Skills</h2><p className="text-gray-700 text-xs mt-0.5">{keySkills.map((s) => s.name).filter(Boolean).join(", ")}</p></section>}
        {workExperience.length > 0 && <section><h2 className="text-[10px] font-bold flex items-center" style={{ color: green }}><Icon />Experience</h2><ul className="space-y-1 mt-0.5">{workExperience.map((w, i) => (<li key={i}><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`} <span className="text-gray-500 text-xs">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span></li>))}</ul></section>}
        {education.length > 0 && <section><h2 className="text-[10px] font-bold flex items-center" style={{ color: green }}><Icon />Education</h2><ul className="space-y-0.5 mt-0.5">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        <section><h2 className="text-[10px] font-bold flex items-center" style={{ color: green }}><Icon />References</h2><p className="text-gray-600 text-xs mt-0.5">Available upon request</p></section>
      </div>
    </div>
  );
}

// —— Template 15: Samantha Lewis style – two columns; left: contacts (icons), skills/languages as yellow-green rounded buttons; right: summary, experience, education; header yellow-green ——
function Template15({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills } = data;
  const name = personal.fullName || "Your name";
  const lime = "#84cc16";
  return (
    <div className="bg-white text-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-200 min-h-[280px] flex">
      <div className="w-[36%] p-3 text-sm border-r border-gray-100">
        <div className="py-2 px-3 mb-2 text-white font-bold text-sm rounded" style={{ backgroundColor: lime }}>{name}</div>
        {personal.jobTitle && <p className="text-xs text-gray-700 mb-2">{personal.jobTitle}</p>}
        <p className="text-[10px] text-gray-600 mb-1">{personal.email}</p>
        <p className="text-[10px] text-gray-600 mb-1">{personal.currentLocation}</p>
        <p className="text-[10px] text-gray-600 mb-3">{personal.phone}</p>
        {keySkills.length > 0 && <><h2 className="text-[10px] font-bold uppercase text-gray-600 mb-1">Skills</h2><div className="flex flex-wrap gap-1">{keySkills.slice(0, 4).map((s, i) => <span key={i} className="text-[10px] px-2 py-0.5 rounded text-white" style={{ backgroundColor: lime }}>{s.name} — {s.level || "Expert"}</span>)}</div></>}
        <h2 className="text-[10px] font-bold uppercase text-gray-600 mt-2 mb-1">Languages</h2>
        <div className="flex flex-wrap gap-1"><span className="text-[10px] px-2 py-0.5 rounded text-white" style={{ backgroundColor: lime }}>English — Native</span></div>
      </div>
      <div className="flex-1 p-3 text-sm">
        {overview && <section className="mb-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 mb-0.5">Summary</h2><p className="whitespace-pre-wrap text-gray-700 line-clamp-3">{overview}</p></section>}
        {workExperience.length > 0 && <section><h2 className="text-[10px] font-bold uppercase text-gray-600 mb-0.5">Experience</h2><ul className="space-y-1.5">{workExperience.map((w, i) => (<li key={i}><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{w.description && <span className="text-gray-700">{w.description}</span>}</li>))}</ul></section>}
        {education.length > 0 && <section className="mt-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 mb-0.5">Education</h2><ul className="space-y-0.5">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
      </div>
    </div>
  );
}

// —— Template 16: Mia Bennett style – dark blue/purple left sidebar (avatar, name, contact, skills, languages); right white: Summary, Work History, Education ——
function Template16({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills } = data;
  const name = personal.fullName || "Your name";
  const sidebar = "#4338ca";
  return (
    <div className="bg-white text-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-200 min-h-[280px] flex">
      <div className="w-[35%] p-3 text-white text-xs" style={{ backgroundColor: sidebar }}>
        <div className="flex justify-center mb-2"><AvatarPlaceholder name={name} className="w-14 h-14 border-white" ring="border-2 border-white" /></div>
        <h1 className="text-center font-bold text-sm">{name}</h1>
        <p className="mt-2 opacity-90">{personal.currentLocation}</p>
        <p className="opacity-90">{personal.phone}</p>
        <p className="opacity-90">{personal.email}</p>
        {keySkills.length > 0 && <div className="mt-3"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-1">Skills</h2><ul className="space-y-0.5 opacity-90">{keySkills.map((s, i) => <li key={i}>{s.name} — {s.level || "Expert"}</li>)}</ul></div>}
        <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Languages</h2><p className="opacity-90">English — Native</p></div>
      </div>
      <div className="flex-1 p-4 text-sm">
        {overview && <section className="mb-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 mb-0.5">Summary</h2><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && <section><h2 className="text-[10px] font-bold uppercase text-gray-600 mb-0.5">Work History</h2><ul className="space-y-2">{workExperience.map((w, i) => (<li key={i}><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{w.description && <p className="text-gray-700 mt-0.5">{w.description}</p>}</li>))}</ul></section>}
        {education.length > 0 && <section className="mt-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 mb-0.5">Education</h2><ul className="space-y-0.5">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
      </div>
    </div>
  );
}

// —— Template 17: Ethan Cole style – main content left (name, title, contact, Summary, Work Experience, Education, References); dark blue right sidebar (avatar, Skills, Languages, Courses, Hobbies) ——
function Template17({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  return (
    <div className="bg-white text-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-200 min-h-[280px] flex">
      <div className="flex-1 p-4 text-sm min-w-0">
        <h1 className="text-base font-bold uppercase tracking-tight">{name}</h1>
        {personal.jobTitle && <p className="text-xs text-gray-600">{personal.jobTitle}</p>}
        <p className="text-[10px] text-gray-500 mt-0.5">{personal.phone} · {personal.email} · {personal.currentLocation}</p>
        {overview && <section className="mt-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-200 pb-0.5 mb-0.5">Summary</h2><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && <section className="mt-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-200 pb-0.5 mb-0.5">Work Experience</h2><ul className="space-y-1.5">{workExperience.map((w, i) => (<li key={i}><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{w.description && <p className="text-gray-700 mt-0.5">{w.description}</p>}</li>))}</ul></section>}
        {education.length > 0 && <section className="mt-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-200 pb-0.5 mb-0.5">Education</h2><ul className="space-y-0.5">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        <section className="mt-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-200 pb-0.5 mb-0.5">References</h2><p className="text-gray-600 text-xs">{certifications.length ? certifications[0].name : "Available upon request"}</p></section>
      </div>
      <div className="w-[32%] p-3 text-white text-xs" style={{ backgroundColor: ACCENT }}>
        <div className="flex justify-center mb-2"><AvatarPlaceholder name={name} className="w-12 h-12 border-white" ring="border-2 border-white" /></div>
        {keySkills.length > 0 && <div><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Skills</h2><ul className="space-y-0.5 opacity-90">{keySkills.map((s, i) => <li key={i}>{s.name} — {s.level || "Expert"}</li>)}</ul></div>}
        <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Languages</h2><p className="opacity-90">English — Native</p></div>
        {certifications.length > 0 && <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Courses</h2><p className="opacity-90">{certifications[0].name}</p></div>}
        <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Hobbies</h2><p className="opacity-90 text-[10px]">—</p></div>
      </div>
    </div>
  );
}

// —— Template 18: Jenna Morales style – dark teal left sidebar (avatar, name, title, Details, Skills, Languages, Links, Hobbies); right: Summary, Work Experience, Education, References ——
function Template18({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  const teal = "#0f766e";
  return (
    <div className="bg-white text-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-200 min-h-[280px] flex">
      <div className="w-[36%] p-3 text-white text-xs" style={{ backgroundColor: teal }}>
        <div className="flex justify-center mb-2"><AvatarPlaceholder name={name} className="w-14 h-14 border-white" ring="border-2 border-white" /></div>
        <h1 className="text-center font-bold text-sm">{name}</h1>
        {personal.jobTitle && <p className="text-center text-[10px] opacity-90 mt-0.5">{personal.jobTitle}</p>}
        <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Details</h2><p className="opacity-90">{personal.currentLocation}</p><p className="opacity-90">{personal.email}</p><p className="opacity-90">{personal.phone}</p></div>
        {keySkills.length > 0 && <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Skills</h2><ul className="space-y-0.5 opacity-90">{keySkills.map((s, i) => <li key={i}>{s.name}</li>)}</ul></div>}
        <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Languages</h2><p className="opacity-90">English</p></div>
        {(personal.linkedinUrl || personal.website || certifications.length > 0) && <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Links</h2><p className="opacity-90 text-[10px]">{[personal.linkedinUrl, personal.website, certifications[0]?.name].filter(Boolean).join(" · ")}</p></div>}
        <div className="mt-2"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Hobbies</h2><p className="opacity-90 text-[10px]">—</p></div>
      </div>
      <div className="flex-1 p-4 text-sm">
        {overview && <section className="mb-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-200 pb-0.5 mb-0.5">Summary</h2><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && <section><h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-200 pb-0.5 mb-0.5">Work Experience</h2><ul className="space-y-1.5">{workExperience.map((w, i) => (<li key={i}><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{w.description && <p className="text-gray-700 mt-0.5">{w.description}</p>}</li>))}</ul></section>}
        {education.length > 0 && <section className="mt-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-200 pb-0.5 mb-0.5">Education</h2><ul className="space-y-0.5">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        <section className="mt-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-200 pb-0.5 mb-0.5">References</h2><p className="text-gray-600 text-xs">Available upon request</p></section>
      </div>
    </div>
  );
}

// —— Template 19: Anna Rodriguez style – dark grey left sidebar (avatar, CONTACTS with icons, EDUCATION); right: orange band (job title left, name right), PROFESSIONAL SUMMARY, SKILLS two-col, WORK EXPERIENCE, LINKS ——
function Template19({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  const grey = "#4b5563";
  const orange = "#ea580c";
  return (
    <div className="bg-white text-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-200 min-h-[280px] flex">
      <div className="w-[30%] p-3 text-white text-xs" style={{ backgroundColor: grey }}>
        <div className="flex justify-center mb-2"><AvatarPlaceholder name={name} className="w-12 h-12 border-white" ring="border-2 border-white" /></div>
        <h2 className="text-[10px] font-bold uppercase mb-0.5">Contacts</h2>
        <p className="opacity-90">{personal.email}</p>
        <p className="opacity-90">{personal.currentLocation}</p>
        <p className="opacity-90">{personal.phone}</p>
        {education.length > 0 && <div className="mt-2"><h2 className="text-[10px] font-bold uppercase mb-0.5">Education</h2><ul className="space-y-0.5 opacity-90">{education.map((e, i) => <li key={i}>{e.qualification}{e.institution && ` — ${e.institution}`}</li>)}</ul></div>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="py-2 px-4 flex justify-between items-center text-white" style={{ backgroundColor: orange }}>
          <span className="text-xs font-bold">{personal.jobTitle || "Job Title"}</span>
          <span className="text-sm font-bold uppercase tracking-wide">{name}</span>
        </div>
        <div className="p-4 text-sm">
          {overview && <section className="mb-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 mb-0.5">Professional Summary</h2><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
          {keySkills.length > 0 && <section className="mb-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 mb-0.5">Skills</h2><div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-gray-700">{keySkills.map((s, i) => <span key={i}>{s.name} — {s.level || "Expert"}</span>)}</div></section>}
          {workExperience.length > 0 && <section><h2 className="text-[10px] font-bold uppercase text-gray-600 mb-0.5">Work Experience</h2><ul className="space-y-1.5">{workExperience.map((w, i) => (<li key={i}><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{w.description && <p className="text-gray-700 mt-0.5">{w.description}</p>}</li>))}</ul></section>}
          {(certifications.length > 0 || personal.website) && <section className="mt-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 mb-0.5">Links</h2><p className="text-gray-600 text-xs">{[personal.website, certifications[0]?.name].filter(Boolean).join(" · ")}</p></section>}
        </div>
      </div>
    </div>
  );
}

// —— Template 20: Mike Beckinsale style – left: avatar, name, title, Summary, Work Experience, Education, References, Languages, Links; dark blue right sidebar: DETAILS, SKILLS ——
function Template20({ data }: { data: CvPreviewData }) {
  const { personal, overview, workExperience, education, keySkills, certifications } = data;
  const name = personal.fullName || "Your name";
  return (
    <div className="bg-white text-gray-900 shadow-lg rounded-lg overflow-hidden border border-gray-200 min-h-[280px] flex">
      <div className="flex-1 p-4 text-sm min-w-0">
        <div className="flex items-start gap-3">
          <AvatarPlaceholder name={name} className="w-12 h-12 shrink-0" />
          <div>
            <h1 className="text-base font-bold">{name}</h1>
            {personal.jobTitle && <p className="text-xs text-gray-600">{personal.jobTitle}</p>}
          </div>
        </div>
        {overview && <section className="mt-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-200 pb-0.5 mb-0.5">Summary</h2><p className="whitespace-pre-wrap text-gray-700">{overview}</p></section>}
        {workExperience.length > 0 && <section className="mt-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-200 pb-0.5 mb-0.5">Work Experience</h2><ul className="space-y-1.5">{workExperience.map((w, i) => (<li key={i}><span className="font-medium">{w.jobTitle || "Role"}</span>{w.company && ` — ${w.company}`}<span className="text-gray-500 text-xs block">{[w.startDate, w.endDate].filter(Boolean).join(" – ")}</span>{w.description && <p className="text-gray-700 mt-0.5">{w.description}</p>}</li>))}</ul></section>}
        {education.length > 0 && <section className="mt-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-200 pb-0.5 mb-0.5">Education</h2><ul className="space-y-0.5">{education.map((e, i) => <li key={i}>{e.qualification || "—"}{e.institution && ` — ${e.institution}`}</li>)}</ul></section>}
        <section className="mt-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-200 pb-0.5 mb-0.5">References</h2><p className="text-gray-600 text-xs">Available upon request</p></section>
        <section className="mt-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-200 pb-0.5 mb-0.5">Languages</h2><p className="text-gray-600 text-xs">English</p></section>
        {(personal.linkedinUrl || personal.website || certifications.length > 0) && <section className="mt-2"><h2 className="text-[10px] font-bold uppercase text-gray-600 border-b border-gray-200 pb-0.5 mb-0.5">Links</h2><p className="text-gray-600 text-xs">{[personal.linkedinUrl, personal.website, certifications[0]?.name].filter(Boolean).join(" · ")}</p></section>}
      </div>
      <div className="w-[28%] p-3 text-white text-xs" style={{ backgroundColor: ACCENT }}>
        <h2 className="text-[10px] font-bold uppercase opacity-90 mb-1">Details</h2>
        <p className="opacity-90">{personal.currentLocation}</p>
        <p className="opacity-90">{personal.phone}</p>
        <p className="opacity-90">{personal.email}</p>
        {keySkills.length > 0 && <div className="mt-3"><h2 className="text-[10px] font-bold uppercase opacity-90 mb-0.5">Skills</h2><ul className="space-y-0.5 opacity-90">{keySkills.map((s, i) => <li key={i}>{s.name}</li>)}</ul></div>}
      </div>
    </div>
  );
}

const TEMPLATES: Record<number, React.FC<{ data: CvPreviewData }>> = {
  1: Template1, 2: Template2, 3: Template3, 4: Template4, 5: Template5,
  6: Template6, 7: Template7, 8: Template8, 9: Template9, 10: Template10,
  11: Template11, 12: Template12, 13: Template13, 14: Template14, 15: Template15,
  16: Template16, 17: Template17, 18: Template18, 19: Template19, 20: Template20,
};

export function getCvTemplateComponent(templateId: number): React.FC<{ data: CvPreviewData }> {
  const id = Math.max(1, Math.min(20, templateId));
  return TEMPLATES[id] || Template1;
}

export function CvPreviewByTemplate({ templateId, data }: { templateId: number; data: CvPreviewData }) {
  const Component = getCvTemplateComponent(templateId);
  return <Component data={data} />;
}

/** Minimal data for template card previews on the CV builder grid */
export const SAMPLE_CV_PREVIEW_DATA: CvPreviewData = {
  personal: {
    fullName: "Your Name",
    email: "email@example.com",
    phone: "+27 00 000 0000",
    currentLocation: "City, Country",
    jobTitle: "Job Title",
    linkedinUrl: "",
    website: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
  },
  overview: "Brief professional summary or career objective.",
  workExperience: [{ jobTitle: "Role", company: "Company", startDate: "2020", endDate: "Present", description: "Key responsibilities." }],
  education: [{ qualification: "Degree", institution: "University", startDate: "2016", endDate: "2019" }],
  certifications: [{ name: "Certification", issuer: "Issuer", date: "2022" }],
  keySkills: [{ name: "Skill 1", level: "Expert" }, { name: "Skill 2", level: "Advanced" }, { name: "Skill 3", level: "" }],
};
