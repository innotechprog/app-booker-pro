import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { smartApplyAPI, jobAssistAPI, type JobAssistCvContent } from "@/services/api";
import { Sparkles, ArrowRight, Briefcase, Loader2, Upload, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import { createWorker } from "tesseract.js";

type GapAnalysis = {
  matchPercentage: number;
  totalTargetSkills: number;
  totalMatchedSkills: number;
  experienceMatchPercentage: number;
  totalExperienceMatchedSkills: number;
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
};

type JobAssistProfileData = {
  jobTitle: string;
  overview: string;
  workExperience: Array<{
    jobTitle: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    qualification: string;
    institution: string;
    startDate: string;
    endDate: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  keySkills: Array<{ name: string; level: string }>;
  allSkills: string[];
};

const normalizeSkill = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value.trim().toLowerCase();
  if (typeof value === "object" && value !== null && "name" in value) {
    const name = (value as { name?: string }).name;
    return typeof name === "string" ? name.trim().toLowerCase() : "";
  }
  return "";
};

const normalizeText = (value: string): string => {
  return (value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s+#./-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const asString = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

function ensureArray<T>(val: T[] | T | null | undefined): T[] {
  if (Array.isArray(val)) return val;
  if (val == null || val === "") return [];
  return [val as T];
}

function parseMaybeJsonBlocks(value: unknown): unknown[] {
  if (typeof value !== "string") return [value];
  const text = value.trim();
  if (!text) return [];
  const blocks = text.split(/\n\s*\n+/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((block) => {
    try {
      return JSON.parse(block);
    } catch {
      return { text: block };
    }
  });
}

const redactPersonalData = (input: string): string => {
  return (input || "")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/(?:\+?\d[\d\s().-]{7,}\d)/g, "[redacted-phone]")
    .replace(/https?:\/\/\S+/gi, "[redacted-url]")
    .trim();
};

const splitSkillCandidates = (value: string): string[] => {
  return (value || "")
    .split(/[\n,;|/•·]+/g)
    .map((v) => v.trim())
    .filter(Boolean);
};

const canonicalSkillKey = (value: string): string => value.trim().toLowerCase();

const collectAllSkills = (
  keySkills: Array<{ name: string; level: string }>,
  workExperience: Array<{ jobTitle: string; company: string; location: string; startDate: string; endDate: string; description: string }>,
  education: Array<{ qualification: string; institution: string; startDate: string; endDate: string }>,
  certifications: Array<{ name: string; issuer: string; date: string }>,
): string[] => {
  const seen = new Set<string>();
  const ordered: string[] = [];

  const push = (candidate: string) => {
    const clean = candidate.trim();
    if (!clean) return;
    const key = canonicalSkillKey(clean);
    if (!key) return;
    if (seen.has(key)) return;
    seen.add(key);
    ordered.push(clean);
  };

  keySkills.forEach((s) => push(s.name));

  workExperience.forEach((w) => {
    splitSkillCandidates(w.jobTitle).forEach(push);
    splitSkillCandidates(w.description).forEach(push);
  });

  education.forEach((e) => splitSkillCandidates(e.qualification).forEach(push));

  certifications.forEach((c) => {
    splitSkillCandidates(c.name).forEach(push);
    splitSkillCandidates(c.issuer).forEach(push);
  });

  return ordered;
};

const buildProfileData = (profile: unknown): JobAssistProfileData => {
  const p = (profile && typeof profile === "object" ? profile : {}) as Record<string, unknown>;

  const workExperience = ensureArray(p.workExperience)
    .flatMap(parseMaybeJsonBlocks)
    .map((item) => {
      const obj = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
      return {
        jobTitle: asString(obj.jobTitle) || asString(obj.position),
        company: redactPersonalData(asString(obj.company)),
        location: redactPersonalData(asString(obj.location)),
        startDate: asString(obj.startDate) || asString(obj.start_date),
        endDate: asString(obj.endDate) || asString(obj.end_date),
        description: redactPersonalData(asString(obj.description) || asString(obj.text)),
      };
    })
    .filter((w) => Object.values(w).some(Boolean));

  const education = ensureArray(p.education)
    .flatMap(parseMaybeJsonBlocks)
    .map((item) => {
      const obj = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
      return {
        qualification: redactPersonalData(asString(obj.qualification) || asString(obj.degree) || asString(obj.text)),
        institution: redactPersonalData(asString(obj.institution)),
        startDate: asString(obj.startDate) || asString(obj.start_date),
        endDate: asString(obj.endDate) || asString(obj.end_date),
      };
    })
    .filter((e) => Object.values(e).some(Boolean));

  const certifications = ensureArray(p.certifications)
    .flatMap(parseMaybeJsonBlocks)
    .map((item) => {
      const obj = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
      return {
        name: redactPersonalData(asString(obj.name) || asString(obj.text)),
        issuer: redactPersonalData(asString(obj.issuer)),
        date: asString(obj.date),
      };
    })
    .filter((c) => Object.values(c).some(Boolean));

  const keySkills = ensureArray(p.keySkills)
    .flatMap(parseMaybeJsonBlocks)
    .map((item) => {
      const obj = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
      return {
        name: redactPersonalData(asString(obj.name) || asString(obj.text)),
        level: asString(obj.level),
      };
    })
    .filter((s) => !!s.name);

  const allSkills = collectAllSkills(keySkills, workExperience, education, certifications);

  return {
    jobTitle: asString(p.jobTitle),
    overview: redactPersonalData(asString(p.overview)),
    workExperience,
    education,
    certifications,
    keySkills,
    allSkills,
  };
};

const getProfileSkills = (profileData: JobAssistProfileData): string[] => {
  return profileData.keySkills.map((s) => normalizeSkill(s.name)).filter(Boolean);
};

const getTargetSkills = (cvContent: JobAssistCvContent | null): string[] => {
  if (!cvContent?.keySkills?.length) return [];
  return cvContent.keySkills.map((s) => normalizeSkill(s.name)).filter(Boolean);
};

const createGapAnalysis = (profileSkills: string[], targetSkills: string[], experienceCorpus: string): GapAnalysis => {
  const profileSet = new Set(profileSkills);
  const targetSet = Array.from(new Set(targetSkills));
  const matchedSkills = targetSet.filter((skill) => profileSet.has(skill));
  const missingSkills = targetSet.filter((skill) => !profileSet.has(skill));
  const totalTargetSkills = targetSet.length;
  const totalMatchedSkills = matchedSkills.length;
  const matchPercentage = totalTargetSkills > 0
    ? Math.round((totalMatchedSkills / totalTargetSkills) * 100)
    : 0;
  const normalizedCorpus = normalizeText(experienceCorpus);
  const totalExperienceMatchedSkills = targetSet.filter((skill) => {
    const normalizedSkill = normalizeText(skill);
    if (!normalizedSkill) return false;
    return normalizedCorpus.includes(normalizedSkill);
  }).length;
  const experienceMatchPercentage = totalTargetSkills > 0
    ? Math.round((totalExperienceMatchedSkills / totalTargetSkills) * 100)
    : 0;

  const suggestions: string[] = [];
  if (missingSkills.length) {
    suggestions.push(`Add evidence of ${missingSkills.slice(0, 4).join(", ")} in your recent work outcomes.`);
  }
  suggestions.push("Rewrite your professional summary to mirror the job title and top responsibilities.");
  suggestions.push("Prioritize job-relevant achievements in the first two experience entries.");
  suggestions.push("Adjust skill ordering so role-critical tools appear first.");

  return {
    matchPercentage,
    totalTargetSkills,
    totalMatchedSkills,
    experienceMatchPercentage,
    totalExperienceMatchedSkills,
    matchedSkills,
    missingSkills,
    suggestions,
  };
};

const IMAGE_EXT_RE = /\.(png|jpe?g|webp|bmp|gif|tiff?)$/i;

const isImageFile = (file: File): boolean => {
  const mime = (file.type || "").toLowerCase();
  if (mime.startsWith("image/")) return true;
  return IMAGE_EXT_RE.test(file.name || "");
};

const extractTextFromImage = async (file: File): Promise<string> => {
  const worker = await createWorker("eng");
  try {
    const result = await worker.recognize(file);
    return (result.data?.text || "").trim();
  } finally {
    await worker.terminate();
  }
};

const SmartApplyJobAssistPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobText, setJobText] = useState("");
  const [jobFile, setJobFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JobAssistCvContent | null>(null);
  const [profileSkills, setProfileSkills] = useState<string[]>([]);
  const [profileExperienceCorpus, setProfileExperienceCorpus] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("1");

  const fileLabel = useMemo(() => {
    if (!jobFile) return "Upload Job Description (PDF/Image)";
    return jobFile.name;
  }, [jobFile]);

  const runAnalysis = async () => {
    if (!jobText.trim() && !jobFile) {
      toast({
        title: "Job description needed",
        description: "Paste the job description or upload a PDF/image first.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const profileRes = await smartApplyAPI.getProfile().catch(() => ({ profile: null }));
      const profile = (profileRes as { profile?: unknown })?.profile;
      const profileData = buildProfileData(profile);
      const extractedProfileSkills = getProfileSkills(profileData);
      setProfileSkills(extractedProfileSkills);
      setProfileExperienceCorpus(
        [
          profileData.jobTitle,
          profileData.overview,
          ...profileData.workExperience.map((w) => [w.jobTitle, w.company, w.location, w.description].filter(Boolean).join(" ")),
          ...profileData.education.map((e) => [e.qualification, e.institution].filter(Boolean).join(" ")),
          ...profileData.certifications.map((c) => [c.name, c.issuer].filter(Boolean).join(" ")),
        ]
          .filter(Boolean)
          .join(" "),
      );

      const currentJobText = jobText.trim();
      const uploadedIsImage = !!jobFile && isImageFile(jobFile);
      let textForAnalysis = currentJobText;

      if (uploadedIsImage && jobFile) {
        toast({
          title: "Reading image",
          description: "Extracting text from your image before analysis...",
        });
        const ocrText = await extractTextFromImage(jobFile);
        if (!ocrText) {
          throw new Error("No readable text was found in the image. Please upload a clearer image or paste the job text.");
        }
        textForAnalysis = [currentJobText, ocrText].filter(Boolean).join("\n\n");
      }

      const payload = jobFile && !uploadedIsImage
        ? {
            file: jobFile,
            profileData,
          }
        : {
            jobText: textForAnalysis,
            profileData,
          };

      const data = await jobAssistAPI.generate(payload);
      setResult(data.cvContent);
      toast({
        title: "Analysis complete",
        description: "Your profile has been matched to the job description.",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to analyze job description.";
      toast({ title: "Job Assist failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const gap = useMemo(() => createGapAnalysis(profileSkills, getTargetSkills(result), profileExperienceCorpus), [profileSkills, result, profileExperienceCorpus]);

  const openCvEditor = () => {
    if (!result) return;
    navigate(`/smart-apply/cv-builder/edit/${selectedTemplate}`, {
      state: {
        jobAssistData: {
          personal: { jobTitle: result.jobTitle ?? "" },
          overview: result.overview ?? "",
          keySkills: result.keySkills ?? [],
          workExperience: result.workExperience ?? [],
          education: result.education ?? [],
          suggestedSkills: gap.missingSkills.map((skill) => ({ name: skill, level: "Suggested" })),
          suggestions: gap.suggestions,
        },
      },
    });
  };

  return (
    <Layout>
      <SEO title="Smart Apply Job Assist" />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Smart Apply Job Assist</h1>
            <p className="text-gray-600">
              Prepare your profile quickly, then apply to opportunities with better-tailored emails and a polished CV.
            </p>
          </div>

          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                Job Assist analysis
              </CardTitle>
              <CardDescription>
                Paste a job description or upload PDF/image. We compare it against your profile and suggest exactly what to improve.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="job-text">Paste job description</Label>
                <Textarea
                  id="job-text"
                  value={jobText}
                  onChange={(e) => setJobText(e.target.value)}
                  className="min-h-[160px] bg-white"
                  placeholder="Paste the full role requirements, responsibilities, and must-have skills..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job-file">Or upload JD file</Label>
                <input
                  id="job-file"
                  type="file"
                  accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp,.bmp,.gif,.tif,.tiff"
                  className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-indigo-700 hover:file:bg-indigo-100"
                  onChange={(e) => setJobFile(e.target.files?.[0] ?? null)}
                />
                <p className="text-xs text-gray-500">{fileLabel}</p>
                <p className="text-xs text-gray-500">Images are read with OCR before analysis. PDF, DOCX, and TXT are uploaded directly.</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button onClick={runAnalysis} className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  Analyze & tailor my CV
                </Button>
                <Button asChild variant="outlineLight">
                  <Link to="/smart-apply/profile">
                    Update profile <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {result && (
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  Match report & CV improvement plan
                </CardTitle>
                <CardDescription>
                  Use these updates before you download and submit your CV.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-indigo-900">Profile-to-job skill match</p>
                      <p className="text-lg font-bold text-indigo-900">{gap.matchPercentage}%</p>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-indigo-100">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all"
                        style={{ width: `${Math.max(0, Math.min(100, gap.matchPercentage))}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-indigo-800">
                      {gap.totalMatchedSkills} of {gap.totalTargetSkills || 0} required skills currently match your profile.
                    </p>
                  </div>

                  <div className="rounded-lg border border-sky-200 bg-sky-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-sky-900">Experience relevance match</p>
                      <p className="text-lg font-bold text-sky-900">{gap.experienceMatchPercentage}%</p>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-sky-100">
                      <div
                        className="h-full rounded-full bg-sky-600 transition-all"
                        style={{ width: `${Math.max(0, Math.min(100, gap.experienceMatchPercentage))}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-sky-800">
                      {gap.totalExperienceMatchedSkills} of {gap.totalTargetSkills || 0} required skills appear in your experience and background details.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Matching strengths
                    </p>
                    <ul className="mt-2 list-disc list-inside text-sm text-emerald-900 space-y-1">
                      {(gap.matchedSkills.length ? gap.matchedSkills : ["Core transferable skills identified"]).slice(0, 6).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Skills to strengthen
                    </p>
                    <ul className="mt-2 list-disc list-inside text-sm text-amber-900 space-y-1">
                      {(gap.missingSkills.length ? gap.missingSkills : ["No major skill gaps detected from provided profile"]).slice(0, 6).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">Recommended profile adjustments</p>
                  <ul className="mt-2 list-disc list-inside text-sm text-gray-700 space-y-1">
                    {gap.suggestions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="max-w-xs">
                    <Label htmlFor="job-assist-template">Choose CV template</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger id="job-assist-template" className="mt-2 bg-white">
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 20 }, (_, index) => {
                          const templateId = String(index + 1);
                          return (
                            <SelectItem key={templateId} value={templateId}>
                              Template {templateId}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-wrap gap-3">
                  <Button onClick={openCvEditor} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Open tailored CV editor <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button asChild variant="outlineLight">
                    <Link to="/smart-apply/jobs">
                      Browse jobs <Briefcase className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SmartApplyJobAssistPage;
