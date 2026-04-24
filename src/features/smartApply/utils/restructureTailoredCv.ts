import type { JobAssistCvContent } from "@/services/api";
import type { WorkExperienceItem, EducationItem, SkillItem } from "@/features/smartApply/pages/SmartApplyProfilePage";
import type { CustomSection } from "@/components/cv-templates/CvTemplatePreviews";
import { expandSkillRowsFromName } from "@/features/smartApply/utils/cvSkillParsing";

function asString(v: unknown): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t || undefined;
}

/** Split a single-line or range-style date field into start/end when possible */
function parseDatesField(dates: unknown): { startDate?: string; endDate?: string } {
  const s = asString(dates);
  if (!s) return {};
  const parts = s.split(/\s*[-–—]\s*|\s+to\s+/i).map((x) => x.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { startDate: parts[0], endDate: parts[parts.length - 1] };
  }
  return { startDate: s };
}

function responsibilitiesToDescription(responsibilities: unknown, existing?: string): string | undefined {
  if (Array.isArray(responsibilities)) {
    const lines = responsibilities.map((r) => String(r).trim()).filter(Boolean);
    if (lines.length) return lines.join("\n");
  }
  return existing;
}

export interface RestructuredTailoredCv {
  personal: { jobTitle: string };
  overview: string;
  keySkills: SkillItem[];
  workExperience: WorkExperienceItem[];
  education: EducationItem[];
  customSections?: CustomSection[];
}

/**
 * Normalizes Job Assist API payloads (and close variants) into editor-ready CV data.
 * - Maps professional_summary / snake_case fields
 * - Turns responsibility arrays into newline-separated bullets (templates render as list)
 * - Optional projects → CustomSection "Projects"
 */
export function restructureTailoredCvForEditor(
  raw: JobAssistCvContent | Record<string, unknown> | null | undefined,
): RestructuredTailoredCv | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  const overview =
    asString(o.overview) ?? asString(o.professional_summary) ?? asString(o.summary) ?? asString(o.profile) ?? "";

  const jobTitle = asString(o.jobTitle) ?? asString(o.job_title) ?? asString(o.target_role) ?? "";

  const sk = o.keySkills ?? o.skills;
  const keySkills: SkillItem[] = [];
  if (Array.isArray(sk)) {
    for (const item of sk) {
      let name = "";
      let level = "";
      if (typeof item === "string") name = item.trim();
      else if (item && typeof item === "object" && "name" in item) {
        const row = item as { name?: unknown; level?: unknown };
        name = String(row.name ?? "").trim();
        level = String(row.level ?? "").trim();
      }
      if (!name) continue;
      keySkills.push(...expandSkillRowsFromName(name, level));
    }
  }

  const weRaw = o.workExperience ?? o.work_experience;
  const workExperience: WorkExperienceItem[] = [];
  if (Array.isArray(weRaw)) {
    for (const item of weRaw) {
      if (item == null) continue;
      if (typeof item !== "object") {
        const d = String(item).trim();
        if (d) workExperience.push({ description: d });
        continue;
      }
      const w = item as Record<string, unknown>;
      const jt = asString(w.jobTitle) ?? asString(w.job_title);
      const company = asString(w.company) ?? asString(w.employer);
      const location = asString(w.location);
      let startDate = asString(w.startDate) ?? asString(w.start_date);
      let endDate = asString(w.endDate) ?? asString(w.end_date);
      if (!startDate && !endDate) {
        const d = parseDatesField(w.dates);
        startDate = d.startDate;
        endDate = d.endDate;
      }
      let description = asString(w.description) ?? asString(w.text) ?? asString(w.summary);
      description = responsibilitiesToDescription(w.responsibilities, description) ?? description;
      if (!jt && !company && !description) continue;
      workExperience.push({
        jobTitle: jt,
        company,
        location,
        startDate,
        endDate,
        description,
      });
    }
  }

  const edRaw = o.education;
  const education: EducationItem[] = [];
  if (Array.isArray(edRaw)) {
    for (const item of edRaw) {
      if (item == null) continue;
      if (typeof item !== "object") {
        const q = String(item).trim();
        if (q) education.push({ qualification: q });
        continue;
      }
      const e = item as Record<string, unknown>;
      let startDate = asString(e.startDate) ?? asString(e.start_date);
      let endDate = asString(e.endDate) ?? asString(e.end_date);
      if (!startDate && !endDate) {
        const d = parseDatesField(e.dates);
        startDate = d.startDate;
        endDate = d.endDate;
      }
      const qualification =
        asString(e.qualification) ?? asString(e.degree) ?? asString(e.qual) ?? asString(e.field_of_study) ?? "";
      const institution = asString(e.institution) ?? asString(e.school) ?? asString(e.university) ?? "";
      if (!qualification && !institution) continue;
      education.push({ qualification, institution, startDate, endDate });
    }
  }

  const projRaw = o.projects;
  let customSections: CustomSection[] | undefined;
  if (Array.isArray(projRaw) && projRaw.length > 0) {
    const blocks: string[] = [];
    for (const p of projRaw) {
      if (!p || typeof p !== "object") continue;
      const pr = p as Record<string, unknown>;
      const title = asString(pr.project_name) ?? asString(pr.name) ?? asString(pr.title);
      const desc = asString(pr.description) ?? asString(pr.summary);
      const tech = pr.technologies;
      const techStr = Array.isArray(tech) ? tech.map((t) => String(t).trim()).filter(Boolean).join(", ") : asString(tech);
      const head = title || "Project";
      const body = [desc, techStr ? `Technologies: ${techStr}` : ""].filter(Boolean).join("\n");
      if (body) blocks.push(`${head}\n${body}`);
      else if (title) blocks.push(title);
    }
    if (blocks.length) {
      customSections = [
        {
          id: "job-assist-projects",
          title: "Projects",
          content: blocks.join("\n\n"),
        },
      ];
    }
  }

  return {
    personal: { jobTitle },
    overview,
    keySkills,
    workExperience,
    education,
    customSections,
  };
}

export function mergeTailoredAndSuggestedSkills(tailored: SkillItem[], suggested: SkillItem[]): SkillItem[] {
  const seen = new Set(tailored.map((s) => s.name.trim().toLowerCase()).filter(Boolean));
  const out = [...tailored];
  for (const s of suggested) {
    const k = s.name.trim().toLowerCase();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(s);
  }
  return out;
}
