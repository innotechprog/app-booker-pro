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

// Pricing (templates 1–2 available; 3–5 coming soon):
// - Template 1: free if fits on 1 page; multi-page costs R15 / day
// - Template 2: paid R20 / day
// - Premium (credits > 0): available templates free
const CV_TEMPLATE_COUNT = 5;
const CV_MULTI_PAGE_FEE_ZAR = 15;
const CV_TEMPLATE_2_FEE_ZAR = 20;
const COMING_SOON_TEMPLATE_IDS = new Set([3, 4, 5]);

function isComingSoonTemplate(templateId: number): boolean {
  return COMING_SOON_TEMPLATE_IDS.has(templateId);
}

function getTemplateBadge(templateId: number, isPremium: boolean): { label: string; free: boolean } {
  if (isComingSoonTemplate(templateId)) return { label: "Coming Soon", free: false };
  if (isPremium) return { label: "Free", free: true };
  if (templateId === 2) return { label: "R20", free: false };
  return { label: "Free 1 page", free: true };
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

/** Virtual A4-ish width; card scales this down for a crisp mini document preview */
const CV_PREVIEW_RENDER_WIDTH = 520;

/** Scales a full-fidelity CV into the card (avoids compact CSS that breaks inline styles). */
function CvPreviewCard({ templateId, data }: { templateId: number; data?: CvPreviewData }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateScale = () => {
      if (!el) return;
      const s = el.clientWidth / CV_PREVIEW_RENDER_WIDTH;
      setScale(Math.max(0.25, Math.min(s, 1)));
    };
    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const preview = data ?? SAMPLE_CV_PREVIEW_DATA;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden bg-gradient-to-b from-slate-100 to-slate-50 transition-transform duration-300 group-hover:scale-[1.01]"
    >
      <div
        className="pointer-events-none"
        style={{
          width: CV_PREVIEW_RENDER_WIDTH,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <div className="bg-white shadow-sm">
          <CvPreviewByTemplate templateId={templateId} data={preview} />
        </div>
      </div>
    </div>
  );
}

const JobAssistantCvBuilder = () => {
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
          ? (p.keySkills as Record<string, unknown>[])
              .map((s) => ({
                name: ((typeof s === "string" ? null : (s as { name?: string }).name) ?? (s as string)) ?? "",
                level: (typeof s === "object" && s && "level" in s ? (s as { level?: string }).level : "") ?? "",
              }))
              .filter((s) => (s.name || "").trim())
          : [];
        const sample = SAMPLE_CV_PREVIEW_DATA;
        setPreviewData({
          ...sample,
          personal: {
            ...sample.personal,
            fullName: (p?.fullName as string)?.trim() || sample.personal.fullName,
            email: (p?.email as string)?.trim() || sample.personal.email,
            phone: (p?.phone as string)?.trim() || sample.personal.phone,
            currentLocation: (p?.currentLocation as string)?.trim() || sample.personal.currentLocation,
            jobTitle: (p?.jobTitle as string)?.trim() || sample.personal.jobTitle,
            linkedinUrl: (p?.linkedinUrl as string)?.trim() || sample.personal.linkedinUrl,
            website: (p?.website as string)?.trim() || sample.personal.website,
            profilePictureUrl,
            showProfilePictureOnCv,
          },
          overview: overview?.trim() || sample.overview,
          workExperience: workArr.length > 0 ? workArr : sample.workExperience,
          education: eduArr.length > 0 ? eduArr : sample.education,
          certifications: certArr.length > 0 ? certArr : sample.certifications,
          keySkills: skillsArr.length > 0 ? skillsArr : sample.keySkills,
          customSections: sample.customSections,
          accentColor: sample.accentColor,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleUseTemplate = (id: number) => {
    if (isComingSoonTemplate(id)) {
      toast({
        title: "Coming soon",
        description: `Template ${id} is not available yet. Please use Template 1 or 2.`,
      });
      return;
    }
    navigate(`/smart-apply/cv-builder/edit/${id}`);
  };

  if (loading) {
    return (
      <Layout>
        <SEO title="CV Builder – Job Assistant" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-gray-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title="Professional CV Builder – Job Assistant" />
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
              Templates are free to edit. <strong>Premium</strong> candidates (with credits) get available templates free.{" "}
              <strong>Template 1</strong> is free if your info fits on 1 page – if it runs to more than one page, it’s{" "}
              <strong>R{CV_MULTI_PAGE_FEE_ZAR} for 1 day</strong>. <strong>Template 2</strong> is a paid template (
              <strong>R{CV_TEMPLATE_2_FEE_ZAR} per day</strong>). <strong>Templates 3–5</strong> are coming soon. Open a
              template to choose <strong>font size</strong> (10px, 12px, or 14px — next to CV colour); it’s remembered on
              this device and used for PDF download and your online CV link.
            </p>
          </div>

          <Card className="mb-6 border-2 border-gray-200 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-gray-900">Pricing</CardTitle>
              <CardDescription className="text-gray-700">
                <strong>Premium (credits &gt; 0):</strong> Available templates free to download.{" "}
                <strong>Template 1:</strong> Free if 1 page, else R{CV_MULTI_PAGE_FEE_ZAR}/day.{" "}
                <strong>Template 2:</strong> R{CV_TEMPLATE_2_FEE_ZAR}/day.{" "}
                <strong>Templates 3–5:</strong> Coming soon.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: CV_TEMPLATE_COUNT }, (_, i) => i + 1).map((id) => {
              const isPremium = premiumCredits > 0;
              const badge = getTemplateBadge(id, isPremium);
              const unlocked = isPremium || isUnlocked(id);
              const comingSoon = isComingSoonTemplate(id);
              return (
                <Card
                  key={id}
                  className={`border-2 border-gray-200 bg-white overflow-hidden group transition-all duration-300 ${
                    comingSoon
                      ? "opacity-80 cursor-not-allowed"
                      : "cursor-pointer hover:shadow-xl hover:border-[#1e3a5f]/30 hover:-translate-y-0.5"
                  }`}
                  onClick={() => handleUseTemplate(id)}
                >
                  {/* Template preview: fills the card, scales to fit */}
                  <div className="aspect-[3/4] relative pointer-events-none">
                    <CvPreviewCard templateId={id} data={previewData} />
                    {comingSoon && (
                      <div className="absolute inset-0 bg-white/55 flex items-center justify-center">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-800 bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-md shadow-sm">
                          Coming Soon
                        </span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-2 flex flex-wrap items-center justify-between gap-1">
                    <span className="text-xs font-medium text-gray-700">Template {id}</span>
                    {comingSoon ? (
                      <span className="text-xs text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">Coming Soon</span>
                    ) : badge.free ? (
                      <span className="text-xs text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">{badge.label}</span>
                    ) : (
                      <span className="text-xs text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">{badge.label}</span>
                    )}
                    {!comingSoon && unlocked && !isPremium && (
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

export default JobAssistantCvBuilder;
