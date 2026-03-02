import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, FileText, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { smartApplyAPI } from "@/services/api";
import { CvPreviewByTemplate, SAMPLE_CV_PREVIEW_DATA, type CvPreviewData } from "@/components/cv-templates/CvTemplatePreviews";

const DEEP_BLUE = "#1e3a5f";
const CV_UNLOCK_PREFIX = "cv_unlock_";
const CV_UNLOCK_DAY_MS = 24 * 60 * 60 * 1000;

// Pricing:
// - Template 1: always free (any length)
// - Templates 2–5: free if your info fits on 1 page; multi-page costs ZAR 10 / day
// - Templates 6–20: paid templates (ZAR 10 / day to use, any length)
// - Premium (credits > 0): all templates free
function getTemplateBadge(templateId: number, isPremium: boolean): { label: string; free: boolean } {
  if (isPremium) return { label: "Free", free: true };
  if (templateId === 1) return { label: "Free", free: true };
  if (templateId >= 2 && templateId <= 5) return { label: "Free 1 page", free: true };
  return { label: "Paid", free: false };
}

function isUnlocked(templateId: number): boolean {
  const key = `${CV_UNLOCK_PREFIX}${templateId}`;
  const until = localStorage.getItem(key);
  if (!until) return false;
  return Date.now() < Number(until);
}

function setUnlockedUntil(templateId: number): void {
  const key = `${CV_UNLOCK_PREFIX}${templateId}`;
  const until = Date.now() + CV_UNLOCK_DAY_MS;
  localStorage.setItem(key, String(until));
}

// Rough heuristic: short profile = 1 page, long = 2+
function estimatePages(overview: string, skills: string): number {
  const total = (overview || "").length + (skills || "").length;
  if (total < 800) return 1;
  return 2;
}

const CV_PREVIEW_WIDTH = 280;
const CV_PREVIEW_HEIGHT = 373;

const PROFILE_PIC_KEY = "smart_apply_profile_picture";
const SHOW_PP_ON_CV_KEY = "smart_apply_show_pp_on_cv";

/** Scales the CV preview to fill the card container with a polished, eye-catching frame */
function CvPreviewCard({ templateId, data }: { templateId: number; data?: CvPreviewData }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateScale = () => {
      if (!el) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      const s = Math.min(w / CV_PREVIEW_WIDTH, h / CV_PREVIEW_HEIGHT, 1);
      setScale(s);
    };
    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-gray-50 to-slate-100 transition-transform duration-300 group-hover:scale-[1.03]"
    >
      {/* Paper-like frame with subtle 3D shadow */}
      <div
        className="shrink-0 rounded-md overflow-hidden"
        style={{
          width: CV_PREVIEW_WIDTH,
          height: CV_PREVIEW_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)",
        }}
      >
        <div className="w-full h-full bg-white rounded-md overflow-hidden border border-gray-200/80">
          <CvPreviewByTemplate templateId={templateId} data={data ?? SAMPLE_CV_PREVIEW_DATA} compact />
        </div>
      </div>
    </div>
  );
}

const SmartApplyCvBuilder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profileOverview, setProfileOverview] = useState("");
  const [profileSkills, setProfileSkills] = useState("");
  const [premiumCredits, setPremiumCredits] = useState(0);
  const [previewData, setPreviewData] = useState<CvPreviewData | undefined>(undefined);

  useEffect(() => {
    const token = localStorage.getItem("smart_apply_token");
    if (!token) {
      navigate("/smart-apply/sign-in");
      return;
    }
    Promise.all([
      smartApplyAPI.getProfile(),
      smartApplyAPI.getCredits().catch(() => ({ credits: 0 })),
    ])
      .then(([profileRes, creditsRes]) => {
        const credits = (creditsRes as { credits?: number })?.credits ?? 0;
        setPremiumCredits(credits);
        const res = profileRes as { profile?: Record<string, unknown> };
        const p = res?.profile;
        const overview = (p?.overview as string) ?? "";
        const skills = Array.isArray(p?.keySkills)
          ? (p.keySkills as { name?: string }[]).map((s) => (typeof s === "string" ? s : s?.name)).filter(Boolean).join(", ")
          : (p?.keySkills as string) ?? "";
        setProfileOverview(overview);
        setProfileSkills(skills);
        const rawPic = p?.profilePicture;
        const profilePictureUrl =
          typeof rawPic === "string" && rawPic
            ? rawPic.startsWith("data:")
              ? rawPic
              : `data:image/jpeg;base64,${rawPic}`
            : (() => {
                const stored = localStorage.getItem(PROFILE_PIC_KEY);
                return stored ? `data:image/jpeg;base64,${stored}` : undefined;
              })();
        const showProfilePictureOnCv =
          p?.showProfilePictureOnCv === true ||
          p?.showProfilePictureOnCv === "true" ||
          localStorage.getItem(SHOW_PP_ON_CV_KEY) === "true";
        const workArr = Array.isArray(p?.workExperience)
          ? (p.workExperience as Record<string, unknown>[]).map((w) => ({
              jobTitle: (w.jobTitle as string) ?? "",
              company: (w.company as string) ?? "",
              startDate: (w.startDate as string) ?? "",
              endDate: (w.endDate as string) ?? "",
              description: (w.description as string) ?? "",
              location: (w.location as string) ?? "",
            }))
          : SAMPLE_CV_PREVIEW_DATA.workExperience;
        const eduArr = Array.isArray(p?.education)
          ? (p.education as Record<string, unknown>[]).map((e) => ({
              qualification: (e.qualification as string) ?? "",
              institution: (e.institution as string) ?? "",
              startDate: (e.startDate as string) ?? "",
              endDate: (e.endDate as string) ?? "",
            }))
          : SAMPLE_CV_PREVIEW_DATA.education;
        const certArr = Array.isArray(p?.certifications)
          ? (p.certifications as Record<string, unknown>[]).map((c) => ({
              name: (c.name as string) ?? "",
              issuer: (c.issuer as string) ?? "",
              date: (c.date as string) ?? "",
            }))
          : SAMPLE_CV_PREVIEW_DATA.certifications;
        const skillsArr = Array.isArray(p?.keySkills)
          ? (p.keySkills as Record<string, unknown>[]).map((s) => ({
              name: ((typeof s === "string" ? null : (s as { name?: string }).name) ?? s as string) ?? "",
              level: (typeof s === "object" && s && "level" in s ? (s as { level?: string }).level : "") ?? "",
            }))
          : SAMPLE_CV_PREVIEW_DATA.keySkills;
        setPreviewData({
          ...SAMPLE_CV_PREVIEW_DATA,
          personal: {
            ...SAMPLE_CV_PREVIEW_DATA.personal,
            fullName: (p?.fullName as string) || "Your Name",
            email: (p?.email as string) || "",
            phone: (p?.phone as string) || "",
            currentLocation: (p?.currentLocation as string) || "",
            jobTitle: (p?.jobTitle as string) || "",
            linkedinUrl: (p?.linkedinUrl as string) || "",
            website: (p?.website as string) || "",
            profilePictureUrl,
            showProfilePictureOnCv,
          },
          overview: overview || SAMPLE_CV_PREVIEW_DATA.overview,
          workExperience: workArr.length > 0 ? workArr : SAMPLE_CV_PREVIEW_DATA.workExperience,
          education: eduArr.length > 0 ? eduArr : SAMPLE_CV_PREVIEW_DATA.education,
          certifications: certArr.length > 0 ? certArr : SAMPLE_CV_PREVIEW_DATA.certifications,
          keySkills: skillsArr.length > 0 ? skillsArr : SAMPLE_CV_PREVIEW_DATA.keySkills,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleUseTemplate = (id: number) => {
    // All templates are accessible for editing. Payment is only required for download (enforced in CV editor).
    navigate(`/smart-apply/cv-builder/edit/${id}`);
  };

  if (loading) {
    return (
      <Layout>
        <SEO title="CV Builder – Smart Apply" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-gray-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title="Professional CV Builder – Smart Apply" />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Button asChild variant="ghost" size="sm" className="mb-6 text-gray-700 hover:text-gray-900">
            <Link to="/smart-apply/dashboard" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
          </Button>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="h-8 w-8" style={{ color: DEEP_BLUE }} />
              Professional CV Builder
            </h1>
            <p className="text-gray-600 mt-1">
              All templates are free to edit. <strong>Premium</strong> candidates (with credits) get all templates free. <strong>Template 1</strong> is free to download. <strong>Templates 2–5</strong> are free if your info fits on 1 page – if it runs to more than one page, it’s <strong>ZAR 10 for 1 day</strong>. <strong>Templates 6–20</strong> are paid templates (ZAR 10 per day to use).
            </p>
          </div>

          <Card className="mb-6 border-2 border-gray-200 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-gray-900">Pricing</CardTitle>
              <CardDescription className="text-gray-700">
                <strong>Premium (credits &gt; 0):</strong> All templates free to download.{" "}
                <strong>Template 1:</strong> Always free.{" "}
                <strong>Templates 2–5:</strong> Free if 1 page, else ZAR 10/day.{" "}
                <strong>Templates 6–20:</strong> ZAR 10/day.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 20 }, (_, i) => i + 1).map((id) => {
              const isPremium = premiumCredits > 0;
              const badge = getTemplateBadge(id, isPremium);
              const unlocked = isPremium || isUnlocked(id);
              return (
                <Card
                  key={id}
                  className="border-2 border-gray-200 bg-white overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-xl hover:border-[#1e3a5f]/30 hover:-translate-y-0.5"
                  onClick={() => handleUseTemplate(id)}
                >
                  {/* Template preview: fills the card, scales to fit */}
                  <div className="aspect-[3/4] relative pointer-events-none">
                    <CvPreviewCard templateId={id} data={previewData} />
                  </div>
                  <CardContent className="p-2 flex flex-wrap items-center justify-between gap-1">
                    <span className="text-xs font-medium text-gray-700">Template {id}</span>
                    {id === 1 ? (
                      <span className="text-xs font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">Free</span>
                    ) : badge.free ? (
                      <span className="text-xs text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">{badge.label}</span>
                    ) : (
                      <span className="text-xs text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">{badge.label}</span>
                    )}
                    {unlocked && id !== 1 && !isPremium && (
                      <span className="text-xs text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Check className="h-3 w-3" /> Unlocked
                      </span>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SmartApplyCvBuilder;
