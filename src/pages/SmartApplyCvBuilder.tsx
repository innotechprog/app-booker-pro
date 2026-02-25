import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ArrowLeft, FileText, Check, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { smartApplyAPI } from "@/services/api";
import { CvPreviewByTemplate, SAMPLE_CV_PREVIEW_DATA } from "@/components/cv-templates/CvTemplatePreviews";

const DEEP_BLUE = "#1e3a5f";
const CV_UNLOCK_PREFIX = "cv_unlock_";
const CV_UNLOCK_DAY_MS = 24 * 60 * 60 * 1000;

// Pricing:
// - Template 1: always free (any length)
// - Templates 2–5: free if your info fits on 1 page; multi-page costs ZAR 10 / day
// - Templates 6–20: paid templates (ZAR 10 / day to use, any length)
function getTemplateBadge(templateId: number): { label: string; free: boolean } {
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

const SmartApplyCvBuilder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profileOverview, setProfileOverview] = useState("");
  const [profileSkills, setProfileSkills] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("smart_apply_token");
    if (!token) {
      navigate("/smart-apply/sign-in");
      return;
    }
    smartApplyAPI
      .getProfile()
      .then((res: { profile?: { overview?: string; keySkills?: string | { name?: string }[] } }) => {
        const p = res?.profile;
        const overview = p?.overview ?? "";
        const skills = Array.isArray(p?.keySkills)
          ? p.keySkills.map((s) => (typeof s === "string" ? s : (s as { name?: string }).name)).filter(Boolean).join(", ")
          : (p?.keySkills as string) ?? "";
        setProfileOverview(overview);
        setProfileSkills(skills);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleUseTemplate = (id: number) => {
    const pages = estimatePages(profileOverview, profileSkills);
    const isT1 = id === 1;
    const isFreeOnePage = id >= 2 && id <= 5;

    // For templates 2–5, only multi-page needs payment. For 6–20, all usage is paid.
    const needsPaidAccess =
      !isT1 &&
      (!isFreeOnePage || pages >= 2);

    const needPay = needsPaidAccess && !isUnlocked(id);

    if (needPay) {
      setSelectedTemplate(id);
      setPayModalOpen(true);
    } else {
      navigate(`/smart-apply/cv-builder/edit/${id}`);
    }
  };

  const handlePayZAR10 = () => {
    setPaying(true);
    setTimeout(() => {
      if (selectedTemplate != null) {
        setUnlockedUntil(selectedTemplate);
        setPayModalOpen(false);
        setPaying(false);
        toast({ title: "Access granted", description: "You have 1 day to edit and download this CV." });
        navigate(`/smart-apply/cv-builder/edit/${selectedTemplate}`);
      } else {
        setPayModalOpen(false);
        setPaying(false);
      }
    }, 800);
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
              Choose a template. <strong>Template 1</strong> is free. <strong>Templates 2–5</strong> are free if your info fits on 1 page – if it runs to more than one page, it’s <strong>ZAR 10 for 1 day</strong>. <strong>Templates 6–20</strong> are paid templates (ZAR 10 per day to use).
            </p>
          </div>

          <Card className="mb-6 border-2 border-gray-200 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-gray-900">Pricing</CardTitle>
              <CardDescription className="text-gray-700">
                <strong>Template 1:</strong> Free (any length).{" "}
                <strong>Templates 2–5:</strong> Free if your info fits on 1 page, otherwise pay ZAR 10 for 1 day to edit and download.{" "}
                <strong>Templates 6–20:</strong> Paid templates – ZAR 10 for 1 day access. Editing on a different day requires paying ZAR 10 again.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 20 }, (_, i) => i + 1).map((id) => {
              const badge = getTemplateBadge(id);
              const unlocked = isUnlocked(id);
              return (
                <Card
                  key={id}
                  className="border-2 border-gray-200 bg-white overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => handleUseTemplate(id)}
                >
                  {/* Template preview: scaled-down CV so the design is visible on the card */}
                  <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative pointer-events-none flex items-center justify-center p-1">
                    <div
                      className="absolute bg-white rounded-sm border border-gray-200 shadow-md overflow-hidden"
                      style={{
                        width: 280,
                        minHeight: 373,
                        transform: "scale(0.42)",
                        transformOrigin: "top center",
                      }}
                    >
                      <CvPreviewByTemplate templateId={id} data={SAMPLE_CV_PREVIEW_DATA} />
                    </div>
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
                    {unlocked && id !== 1 && (
                      <span className="text-xs text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Check className="h-3 w-3" /> Unlocked
                      </span>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedTemplate != null && (
            <Card className="mt-8 border-2 border-gray-200 bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-gray-900">Template {selectedTemplate} selected</CardTitle>
                <CardDescription className="text-gray-700">
                  Your CV is more than 1 page. Pay ZAR 10 for 1 day access to edit and download.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button
                  className="text-white hover:opacity-90"
                  style={{ backgroundColor: DEEP_BLUE }}
                  onClick={handlePayZAR10}
                  disabled={paying}
                >
                  {paying ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CreditCard className="h-4 w-4 mr-2" />}
                  Pay ZAR 10 to continue
                </Button>
                <Button variant="outline" onClick={() => setPayModalOpen(false)}>Cancel</Button>
                <Button variant="ghost" onClick={() => { setSelectedTemplate(null); setPayModalOpen(false); }}>
                  Choose another template
                </Button>
              </CardContent>
            </Card>
          )}

          <Dialog open={payModalOpen} onOpenChange={setPayModalOpen}>
            <DialogContent className="max-w-md bg-white border-2 border-gray-200">
              <DialogHeader>
                <DialogTitle className="text-gray-900">Pay ZAR 10 for 1 day access</DialogTitle>
                <DialogDescription className="text-gray-700">
                  Your CV is more than one page. Pay ZAR 10 to generate and download it. Access is for 1 day. If you need to edit on another day, you’ll need to pay ZAR 10 again.
                </DialogDescription>
              </DialogHeader>
              <div className="flex gap-3 pt-4">
                <Button
                  className="text-white flex-1"
                  style={{ backgroundColor: DEEP_BLUE }}
                  disabled={paying}
                  onClick={handlePayZAR10}
                >
                  {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : "Pay ZAR 10"}
                </Button>
                <Button variant="outline" onClick={() => setPayModalOpen(false)}>Cancel</Button>
              </div>
              <p className="text-xs text-gray-500 pt-2">Payment will be processed securely. Backend integration can be added later.</p>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
};

export default SmartApplyCvBuilder;
