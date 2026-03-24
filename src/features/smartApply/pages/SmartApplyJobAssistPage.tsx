import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { smartApplyAPI, jobAssistAPI, type JobAssistCvContent } from "@/services/api";
import { Sparkles, ArrowRight, Briefcase, Loader2, Upload, FileText, CheckCircle2, AlertTriangle } from "lucide-react";

type GapAnalysis = {
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
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

const getProfileSkills = (profile: unknown): string[] => {
  if (!profile || typeof profile !== "object") return [];
  const keySkills = (profile as { keySkills?: unknown[] }).keySkills;
  if (!Array.isArray(keySkills)) return [];
  return keySkills.map(normalizeSkill).filter(Boolean);
};

const getTargetSkills = (cvContent: JobAssistCvContent | null): string[] => {
  if (!cvContent?.keySkills?.length) return [];
  return cvContent.keySkills.map((s) => normalizeSkill(s.name)).filter(Boolean);
};

const createGapAnalysis = (profileSkills: string[], targetSkills: string[]): GapAnalysis => {
  const profileSet = new Set(profileSkills);
  const targetSet = Array.from(new Set(targetSkills));
  const matchedSkills = targetSet.filter((skill) => profileSet.has(skill));
  const missingSkills = targetSet.filter((skill) => !profileSet.has(skill));

  const suggestions: string[] = [];
  if (missingSkills.length) {
    suggestions.push(`Add evidence of ${missingSkills.slice(0, 4).join(", ")} in your recent work outcomes.`);
  }
  suggestions.push("Rewrite your professional summary to mirror the job title and top responsibilities.");
  suggestions.push("Prioritize job-relevant achievements in the first two experience entries.");
  suggestions.push("Adjust skill ordering so role-critical tools appear first.");

  return { matchedSkills, missingSkills, suggestions };
};

const SmartApplyJobAssistPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobText, setJobText] = useState("");
  const [jobFile, setJobFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JobAssistCvContent | null>(null);
  const [profileSkills, setProfileSkills] = useState<string[]>([]);

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
      const extractedProfileSkills = getProfileSkills(profile);
      setProfileSkills(extractedProfileSkills);

      const payload = jobFile
        ? {
            file: jobFile,
            profileData: {
              overview: (profile as { overview?: string | null })?.overview ?? "",
              workExperience: Array.isArray((profile as { workExperience?: unknown[] })?.workExperience)
                ? ((profile as { workExperience?: unknown[] }).workExperience as object[])
                : [],
              education: Array.isArray((profile as { education?: unknown[] })?.education)
                ? ((profile as { education?: unknown[] }).education as object[])
                : [],
              keySkills: Array.isArray((profile as { keySkills?: unknown[] })?.keySkills)
                ? ((profile as { keySkills?: unknown[] }).keySkills as object[])
                : [],
            },
          }
        : {
            jobText: jobText.trim(),
            profileData: {
              overview: (profile as { overview?: string | null })?.overview ?? "",
              workExperience: Array.isArray((profile as { workExperience?: unknown[] })?.workExperience)
                ? ((profile as { workExperience?: unknown[] }).workExperience as object[])
                : [],
              education: Array.isArray((profile as { education?: unknown[] })?.education)
                ? ((profile as { education?: unknown[] }).education as object[])
                : [],
              keySkills: Array.isArray((profile as { keySkills?: unknown[] })?.keySkills)
                ? ((profile as { keySkills?: unknown[] }).keySkills as object[])
                : [],
            },
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

  const gap = useMemo(() => createGapAnalysis(profileSkills, getTargetSkills(result)), [profileSkills, result]);

  const openCvEditor = () => {
    if (!result) return;
    navigate("/smart-apply/cv-editor/1", {
      state: {
        jobAssistData: {
          personal: { jobTitle: result.jobTitle ?? "" },
          overview: result.overview ?? "",
          keySkills: result.keySkills ?? [],
          workExperience: result.workExperience ?? [],
          education: result.education ?? [],
        },
      },
    });
  };

  return (
    <Layout>
      <SEO title="Smart Apply Job Assist" />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
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
                <Label htmlFor="job-file">Or upload JD file (PDF/JPG/PNG)</Label>
                <input
                  id="job-file"
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-indigo-700 hover:file:bg-indigo-100"
                  onChange={(e) => setJobFile(e.target.files?.[0] ?? null)}
                />
                <p className="text-xs text-gray-500">{fileLabel}</p>
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
                <div className="grid md:grid-cols-2 gap-4">
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

                <div className="flex flex-wrap gap-3 pt-1">
                  <Button onClick={openCvEditor} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Open tailored CV editor <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button asChild variant="outlineLight">
                    <Link to="/smart-apply/jobs">
                      Browse jobs <Briefcase className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
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
