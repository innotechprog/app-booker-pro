/**
 * Heuristics for CV "key skills" content: keep short tool/language/ability labels,
 * drop duties, prose bullets, and degree sentences that are not skill tags.
 */

const MAX_CV_SKILL_LEN = 52;
const MAX_CV_SKILL_WORDS = 7;

const DUTY_OR_PROSE_RE =
  /\b(responsible\s+for|duties\s+included|worked\s+with\s+a|managed\s+a\s+team|years\s+of\s+experience|experience\s+in|ability\s+to|including\s+but\s+not\s+limited|proven\s+track\s+record|day\s*to\s*day|on\s+a\s+daily\s+basis|collaborate\s+with|reporting\s+to)\b/i;

const DEGREE_LINE_RE =
  /\b(bachelor|b\.?sc|b\.?com|b\.?tech|master'?s?|mba|ph\.?d|diploma|ndip|national\s+diploma|honou?rs|matric|grade\s*\d+)\b/i;

export function isLikelyCvSkillLabel(raw: string): boolean {
  const s = raw
    .replace(/^[\s•·▪▸\u2022\-*]+/u, "")
    .replace(/^\d+[.)]\s*/, "")
    .trim();
  if (!s || s.length < 2 || s.length > MAX_CV_SKILL_LEN) return false;
  const words = s.split(/\s+/).filter(Boolean);
  if (words.length > MAX_CV_SKILL_WORDS) return false;
  if (DUTY_OR_PROSE_RE.test(s)) return false;
  if (DEGREE_LINE_RE.test(s) && (words.length > 2 || s.length > 28)) return false;
  if (/^\d{4}\s*[-–]\s*\d{2,4}\b/.test(s)) return false;
  return true;
}

/** Split free-text / pasted skill blocks into individual labels; drops non-skill lines. */
export function parseCvSkillsFromFreeText(text: string): string[] {
  if (!text?.trim()) return [];
  const parts = text
    .split(/[\n,;|/•·]+|<br\s*\/?>/gi)
    .map((p) => p.replace(/^[\s•·▪\u2022\-*\d.)]+\s*/u, "").trim())
    .filter(Boolean);
  const out: string[] = [];
  const seen = new Set<string>();
  for (const p of parts) {
    if (!isLikelyCvSkillLabel(p)) continue;
    const k = p.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(p);
  }
  return out;
}

/** One profile/API row may contain several comma- or newline-separated skills in `name`. */
export function expandSkillRowsFromName(name: string, level = ""): Array<{ name: string; level: string }> {
  const n = name.trim();
  if (!n) return [];
  const parts = parseCvSkillsFromFreeText(n);
  return parts.map((x) => ({ name: x, level }));
}
