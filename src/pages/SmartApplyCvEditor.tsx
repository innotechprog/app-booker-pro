import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ArrowLeft, FileText, Plus, Trash2, UserPlus, Save, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { smartApplyAPI } from "@/services/api";
import type { WorkExperienceItem, EducationItem, CertificationItem, SkillItem, AddressItem } from "@/pages/SmartApplyProfile";
import { CvPreviewByTemplate, type CvPreviewData, type CustomSection } from "@/components/cv-templates/CvTemplatePreviews";

const DEEP_BLUE = "#1e3a5f";
const PROFILE_PIC_KEY = "smart_apply_profile_picture";
const SHOW_PP_ON_CV_KEY = "smart_apply_show_pp_on_cv";
const CV_UNLOCK_PREFIX = "cv_unlock_";
const CV_UNLOCK_DAY_MS = 24 * 60 * 60 * 1000;

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

function estimatePages(overview: string, skills: string): number {
  const total = (overview || "").length + (skills || "").length;
  if (total < 800) return 1;
  return 2;
}

/** True if user can download (free template, has paid, or is premium with credits) */
function canDownload(templateId: number, overview: string, keySkills: SkillItem[], premiumCredits = 0): boolean {
  if (premiumCredits > 0) return true;
  if (templateId === 1) return true;
  const skillsStr = keySkills.map((s) => s.name).filter(Boolean).join(" ");
  const pages = estimatePages(overview, skillsStr);
  if (templateId >= 2 && templateId <= 5) return pages < 2 || isUnlocked(templateId);
  return isUnlocked(templateId);
}

function ensureArray<T>(val: T[] | T | null | undefined): T[] {
  if (Array.isArray(val)) return val;
  if (val == null || val === "") return [];
  return [val as T];
}

function normalizeWorkExp(item: WorkExperienceItem | { text?: string }): WorkExperienceItem {
  if ("company" in item || "jobTitle" in item) return item as WorkExperienceItem;
  return { description: (item as { text?: string }).text || "" };
}

function normalizeEducation(item: EducationItem | { text?: string }): EducationItem {
  if ("institution" in item || "qualification" in item) return item as EducationItem;
  return { qualification: (item as { text?: string }).text || "" };
}

function normalizeCert(item: CertificationItem | { text?: string }): CertificationItem {
  if ("name" in item || "issuer" in item) return item as CertificationItem;
  return { name: (item as { text?: string }).text || "" };
}

function normalizeSkill(item: SkillItem | { text?: string }): SkillItem {
  if ("name" in item) return item as SkillItem;
  return { name: (item as { text?: string }).text || "", level: "" };
}

const SmartApplyCvEditor = () => {
  const { templateId: templateIdParam } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const templateId = Math.max(1, Math.min(20, parseInt(templateIdParam || "1", 10) || 1));
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [personal, setPersonal] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    currentLocation: "",
    jobTitle: "",
    linkedinUrl: "",
    website: "",
    profilePictureBase64: null as string | null,
    showProfilePictureOnCv: false,
  });
  const [overview, setOverview] = useState("");
  const [category, setCategory] = useState<"general" | "professional">("professional");
  const [workExperience, setWorkExperience] = useState<WorkExperienceItem[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [keySkills, setKeySkills] = useState<SkillItem[]>([]);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [accentColor, setAccentColor] = useState(DEEP_BLUE);
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);
  const [cvOnlineUrl, setCvOnlineUrl] = useState<string | null>(null);
  const [creatingPublicLink, setCreatingPublicLink] = useState(false);
  const [premiumCredits, setPremiumCredits] = useState(0);
  const initialDataRef = useRef<string>("");

  useEffect(() => {
    const token = localStorage.getItem("smart_apply_token");
    if (!token) {
      navigate("/smart-apply/sign-in", { replace: true });
      return;
    }
    Promise.all([
      smartApplyAPI.getProfile(),
      smartApplyAPI.getCredits().catch(() => ({ credits: 0 })),
    ])
      .then(([profileRes, creditsRes]) => {
        const credits = (creditsRes as { credits?: number })?.credits ?? 0;
        setPremiumCredits(credits);
        const res = profileRes as { profile?: any };
        try {
          const p = res?.profile;
          if (p) {
            const rawPic = p.profilePicture;
            const profilePictureBase64 =
              typeof rawPic === "string" && rawPic
                ? rawPic.startsWith("data:")
                  ? rawPic
                  : `data:image/jpeg;base64,${rawPic}`
                : (() => {
                    const stored = localStorage.getItem(PROFILE_PIC_KEY);
                    return stored ? `data:image/jpeg;base64,${stored}` : null;
                  })();
            setPersonal({
              fullName: p.fullName ?? "",
              email: p.email ?? "",
              phone: p.phone ?? "",
              dateOfBirth: p.dateOfBirth ?? "",
              gender: p.gender ?? "",
              nationality: p.nationality ?? "",
              currentLocation: p.currentLocation ?? "",
              jobTitle: p.jobTitle ?? "",
              linkedinUrl: p.linkedinUrl ?? "",
              website: p.website ?? "",
              profilePictureBase64,
              showProfilePictureOnCv: p.showProfilePictureOnCv ?? (localStorage.getItem(SHOW_PP_ON_CV_KEY) === "true"),
            });
            setCategory((p.category === "general" || p.category === "professional" ? p.category : "professional") as "general" | "professional");
            setOverview(p.overview ?? "");
            setWorkExperience(ensureArray(p.workExperience).map(normalizeWorkExp));
            setEducation(ensureArray(p.education).map(normalizeEducation));
            setCertifications(ensureArray(p.certifications).map(normalizeCert));
            setKeySkills(ensureArray(p.keySkills).map(normalizeSkill));
            setAddresses(Array.isArray(p.addresses) ? p.addresses : []);
          }
        } catch (err) {
          console.error("Profile parse error:", err);
        }
      })
      .catch((err) => {
        console.error("Profile load error:", err);
      })
      .finally(() => setLoading(false));
  }, [navigate, templateId]);

  // Snapshot initial data for "has changes" comparison (after load)
  useEffect(() => {
    if (loading) return;
    initialDataRef.current = JSON.stringify({
      personal,
      overview,
      category,
      workExperience,
      education,
      certifications,
      keySkills,
    });
  }, [loading]);

  const hasChanges = () => {
    const current = JSON.stringify({
      personal,
      overview,
      category,
      workExperience,
      education,
      certifications,
      keySkills,
    });
    return current !== initialDataRef.current;
  };

  const updatePersonal = (field: keyof typeof personal, value: string) => {
    setPersonal((prev) => ({ ...prev, [field]: value }));
  };

  const addWork = () => setWorkExperience((prev) => [...prev, {}]);
  const removeWork = (i: number) => setWorkExperience((prev) => prev.filter((_, idx) => idx !== i));
  const updateWork = (i: number, field: keyof WorkExperienceItem, value: string) => {
    setWorkExperience((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  };

  const addEdu = () => setEducation((prev) => [...prev, {}]);
  const removeEdu = (i: number) => setEducation((prev) => prev.filter((_, idx) => idx !== i));
  const updateEdu = (i: number, field: keyof EducationItem, value: string) => {
    setEducation((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  };

  const addCert = () => setCertifications((prev) => [...prev, {}]);
  const removeCert = (i: number) => setCertifications((prev) => prev.filter((_, idx) => idx !== i));
  const updateCert = (i: number, field: keyof CertificationItem, value: string) => {
    setCertifications((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  };

  const addSkill = () => setKeySkills((prev) => [...prev, { name: "", level: "" }]);
  const removeSkill = (i: number) => setKeySkills((prev) => prev.filter((_, idx) => idx !== i));
  const updateSkill = (i: number, field: "name" | "level", value: string) => {
    setKeySkills((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  };

  const addCustomSection = () => setCustomSections((prev) => [...prev, { id: `section-${Date.now()}-${Math.random().toString(36).slice(2)}`, title: "", content: "" }]);

  const handleCreatePublicLink = async () => {
    setCreatingPublicLink(true);
    try {
      const cvData = {
        personal: {
          ...personal,
          profilePictureUrl: personal.profilePictureBase64 ?? undefined,
          showProfilePictureOnCv: personal.showProfilePictureOnCv,
        },
        overview,
        workExperience,
        education,
        certifications,
        keySkills,
        accentColor,
        customSections: templateId >= 6 ? customSections : undefined,
      };
      const res = await smartApplyAPI.createPublicCV(cvData, templateId);
      if (res?.url) {
        setCvOnlineUrl(res.url);
        toast({ title: "Online CV link created", description: "QR code will appear on your CV. Share the link or print your CV for others to scan." });
      } else {
        toast({ title: "Could not create link", variant: "destructive" });
      }
    } catch (err: any) {
      toast({ title: "Could not create link", description: err?.message, variant: "destructive" });
    } finally {
      setCreatingPublicLink(false);
    }
  };
  const removeCustomSection = (i: number) => setCustomSections((prev) => prev.filter((_, idx) => idx !== i));
  const updateCustomSection = (i: number, field: "title" | "content", value: string) => {
    setCustomSections((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  };

  const handleDownload = () => {
    if (canDownload(templateId, overview, keySkills, premiumCredits)) {
      toast({ title: "Download", description: "PDF download will be available when the backend is connected." });
      return;
    }
    setPayModalOpen(true);
  };

  const handlePayZAR10 = () => {
    setPaying(true);
    setTimeout(() => {
      setUnlockedUntil(templateId);
      setPayModalOpen(false);
      setPaying(false);
      toast({ title: "Access granted", description: "You can now download your CV. Click the Download CV button." });
    }, 800);
  };

  const handleUpdateProfile = async () => {
    setSavingProfile(true);
    try {
      await smartApplyAPI.saveProfile({
        category,
        fullName: personal.fullName?.trim() || null,
        phone: personal.phone?.trim() || null,
        dateOfBirth: personal.dateOfBirth?.trim() || null,
        gender: personal.gender?.trim() || null,
        nationality: personal.nationality?.trim() || null,
        currentLocation: personal.currentLocation?.trim() || null,
        jobTitle: personal.jobTitle?.trim() || null,
        linkedinUrl: personal.linkedinUrl?.trim() || null,
        website: personal.website?.trim() || null,
        overview: overview.trim() || null,
        profilePicture: personal.profilePictureBase64 ? (personal.profilePictureBase64.includes(",") ? personal.profilePictureBase64.split(",")[1] : personal.profilePictureBase64) : null,
        showProfilePictureOnCv: personal.showProfilePictureOnCv,
        workExperience: workExperience.length ? workExperience : null,
        education: education.length ? education : null,
        certifications: certifications.length ? certifications : null,
        keySkills: keySkills.length ? keySkills : null,
        addresses: addresses.length ? addresses : null,
      });
      if (personal.fullName) localStorage.setItem("smart_apply_full_name", personal.fullName);
      initialDataRef.current = JSON.stringify({
        personal,
        overview,
        category,
        workExperience,
        education,
        certifications,
        keySkills,
      });
      toast({ title: "Profile updated", description: "Your Smart Apply profile has been updated with the CV information." });
    } catch (err: any) {
      toast({ title: "Could not update profile", description: err?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <SEO title="Edit CV – Smart Apply" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-gray-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title={`Edit CV – Template ${templateId} – Smart Apply`} />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Button asChild variant="outline" size="sm" className="rounded-lg border-gray-300 bg-white text-gray-900 shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-colors">
              <Link to="/smart-apply/cv-builder" className="inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to templates
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">Template {templateId}</span>
              {hasChanges() && (
                <Button
                  size="sm"
                  className="rounded-lg text-white font-medium shadow-sm hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: DEEP_BLUE }}
                  onClick={handleUpdateProfile}
                  disabled={savingProfile}
                >
                  {savingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Save className="h-4 w-4 mr-1.5" />}
                  Update my profile
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr,minmax(320px,1fr)] gap-8">
            {/* Left: Edit form – instant updates reflected in preview */}
            <div className="space-y-6 min-w-0">
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" style={{ color: DEEP_BLUE }} />
                    Personal & contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm">Full name</Label>
                      <Input
                        value={personal.fullName}
                        onChange={(e) => updatePersonal("fullName", e.target.value)}
                        className="mt-1 bg-white border-gray-300"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Professional title</Label>
                      <Input
                        value={personal.jobTitle}
                        onChange={(e) => updatePersonal("jobTitle", e.target.value)}
                        className="mt-1 bg-white border-gray-300"
                        placeholder="e.g. Software Developer"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm">Email</Label>
                      <Input
                        type="email"
                        value={personal.email}
                        onChange={(e) => updatePersonal("email", e.target.value)}
                        className="mt-1 bg-white border-gray-300"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Phone</Label>
                      <Input
                        value={personal.phone}
                        onChange={(e) => updatePersonal("phone", e.target.value)}
                        className="mt-1 bg-white border-gray-300"
                        placeholder="+27..."
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm">Location</Label>
                    <Input
                      value={personal.currentLocation}
                      onChange={(e) => updatePersonal("currentLocation", e.target.value)}
                      className="mt-1 bg-white border-gray-300"
                      placeholder="City, Country"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm">LinkedIn</Label>
                      <Input
                        value={personal.linkedinUrl}
                        onChange={(e) => updatePersonal("linkedinUrl", e.target.value)}
                        className="mt-1 bg-white border-gray-300"
                        placeholder="https://linkedin.com/in/..."
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Website</Label>
                      <Input
                        value={personal.website}
                        onChange={(e) => updatePersonal("website", e.target.value)}
                        className="mt-1 bg-white border-gray-300"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm">Date of birth</Label>
                      <Input
                        type="date"
                        value={personal.dateOfBirth}
                        onChange={(e) => updatePersonal("dateOfBirth", e.target.value)}
                        className="mt-1 bg-white border-gray-300"
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Nationality</Label>
                      <Input
                        value={personal.nationality}
                        onChange={(e) => updatePersonal("nationality", e.target.value)}
                        className="mt-1 bg-white border-gray-300"
                        placeholder="e.g. South African"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Summary / Overview</CardTitle>
                  <CardDescription className="text-sm">Brief professional summary for your CV</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={overview}
                    onChange={(e) => setOverview(e.target.value)}
                    className="min-h-[100px] bg-white border-gray-300 resize-y"
                    placeholder="Write a short summary of your experience and goals..."
                  />
                </CardContent>
              </Card>

              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Work experience</CardTitle>
                  <Button type="button" size="sm" onClick={addWork} className="rounded-lg text-white font-medium shadow-sm hover:opacity-90 transition-opacity" style={{ backgroundColor: DEEP_BLUE }}>
                    <Plus className="h-4 w-4 mr-1.5" /> Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {workExperience.map((w, i) => (
                    <div key={i} className="p-3 border border-gray-200 rounded-lg space-y-2">
                      <div className="flex justify-end">
                        <Button type="button" variant="ghost" size="sm" className="rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors p-2" onClick={() => removeWork(i)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Job title</Label>
                          <Input value={w.jobTitle ?? ""} onChange={(e) => updateWork(i, "jobTitle", e.target.value)} className="mt-1 bg-white border-gray-300" />
                        </div>
                        <div>
                          <Label className="text-xs">Company</Label>
                          <Input value={w.company ?? ""} onChange={(e) => updateWork(i, "company", e.target.value)} className="mt-1 bg-white border-gray-300" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Start date</Label>
                          <Input type="month" value={w.startDate ?? ""} onChange={(e) => updateWork(i, "startDate", e.target.value)} className="mt-1 bg-white border-gray-300" />
                        </div>
                        <div>
                          <Label className="text-xs">End date</Label>
                          <Input type="month" value={w.endDate ?? ""} onChange={(e) => updateWork(i, "endDate", e.target.value)} className="mt-1 bg-white border-gray-300" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Description</Label>
                        <Textarea value={w.description ?? ""} onChange={(e) => updateWork(i, "description", e.target.value)} className="mt-1 min-h-[60px] bg-white border-gray-300 resize-y" />
                      </div>
                    </div>
                  ))}
                  {workExperience.length === 0 && (
                    <p className="text-sm text-gray-500">No experience added. Click Add to add an entry.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Education</CardTitle>
                  <Button type="button" size="sm" onClick={addEdu} className="rounded-lg text-white font-medium shadow-sm hover:opacity-90 transition-opacity" style={{ backgroundColor: DEEP_BLUE }}>
                    <Plus className="h-4 w-4 mr-1.5" /> Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {education.map((e, i) => (
                    <div key={i} className="p-3 border border-gray-200 rounded-lg space-y-2">
                      <div className="flex justify-end">
                        <Button type="button" variant="ghost" size="sm" className="rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors p-2" onClick={() => removeEdu(i)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <Label className="text-xs">Qualification</Label>
                        <Input value={e.qualification ?? ""} onChange={(e) => updateEdu(i, "qualification", e.target.value)} className="mt-1 bg-white border-gray-300" />
                      </div>
                      <div>
                        <Label className="text-xs">Institution</Label>
                        <Input value={e.institution ?? ""} onChange={(e) => updateEdu(i, "institution", e.target.value)} className="mt-1 bg-white border-gray-300" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Start</Label>
                          <Input type="month" value={e.startDate ?? ""} onChange={(e) => updateEdu(i, "startDate", e.target.value)} className="mt-1 bg-white border-gray-300" />
                        </div>
                        <div>
                          <Label className="text-xs">End</Label>
                          <Input type="month" value={e.endDate ?? ""} onChange={(e) => updateEdu(i, "endDate", e.target.value)} className="mt-1 bg-white border-gray-300" />
                        </div>
                      </div>
                    </div>
                  ))}
                  {education.length === 0 && (
                    <p className="text-sm text-gray-500">No education added. Click Add to add an entry.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Certifications</CardTitle>
                  <Button type="button" size="sm" onClick={addCert} className="rounded-lg text-white font-medium shadow-sm hover:opacity-90 transition-opacity" style={{ backgroundColor: DEEP_BLUE }}>
                    <Plus className="h-4 w-4 mr-1.5" /> Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {certifications.map((c, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-2 p-2 border border-gray-100 rounded">
                      <Input value={c.name ?? ""} onChange={(e) => updateCert(i, "name", e.target.value)} placeholder="Certification name" className="flex-1 min-w-[120px] bg-white border-gray-300" />
                      <Input value={c.issuer ?? ""} onChange={(e) => updateCert(i, "issuer", e.target.value)} placeholder="Issuer" className="w-32 bg-white border-gray-300" />
                      <Input value={c.date ?? ""} onChange={(e) => updateCert(i, "date", e.target.value)} placeholder="Date" className="w-24 bg-white border-gray-300" />
                      <Button type="button" variant="ghost" size="sm" className="rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors p-2 shrink-0" onClick={() => removeCert(i)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  {certifications.length === 0 && (
                    <p className="text-sm text-gray-500">No certifications. Click Add to add one.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-base">Key skills</CardTitle>
                  <Button type="button" size="sm" onClick={addSkill} className="rounded-lg text-white font-medium shadow-sm hover:opacity-90 transition-opacity" style={{ backgroundColor: DEEP_BLUE }}>
                    <Plus className="h-4 w-4 mr-1.5" /> Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  {keySkills.map((s, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <Input value={s.name ?? ""} onChange={(e) => updateSkill(i, "name", e.target.value)} placeholder="Skill" className="flex-1 bg-white border-gray-300" />
                      <Select value={s.level ?? ""} onValueChange={(v) => updateSkill(i, "level", v)}>
                        <SelectTrigger className="w-28 bg-white border-gray-300"><SelectValue placeholder="Level" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                          <SelectItem value="Expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button type="button" variant="ghost" size="sm" className="rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors p-2 shrink-0" onClick={() => removeSkill(i)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  {keySkills.length === 0 && (
                    <p className="text-sm text-gray-500">No skills. Click Add to add skills.</p>
                  )}
                </CardContent>
              </Card>

              {templateId >= 6 && (
                <Card className="border border-gray-200 bg-white">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Custom sections</CardTitle>
                      <CardDescription className="text-sm">Add Projects, Languages, References, or any custom section (paid templates only)</CardDescription>
                    </div>
                    <Button type="button" size="sm" onClick={addCustomSection} className="rounded-lg text-white font-medium shadow-sm hover:opacity-90 transition-opacity shrink-0" style={{ backgroundColor: DEEP_BLUE }}>
                      <Plus className="h-4 w-4 mr-1.5" /> Add section
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {customSections.map((s, i) => (
                      <div key={s.id} className="p-3 border border-gray-200 rounded-lg space-y-2">
                        <div className="flex justify-end">
                          <Button type="button" variant="ghost" size="sm" className="rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors p-2" onClick={() => removeCustomSection(i)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div>
                          <Label className="text-xs">Section title</Label>
                          <Input value={s.title} onChange={(e) => updateCustomSection(i, "title", e.target.value)} placeholder="e.g. Projects, Languages, References" className="mt-1 bg-white border-gray-300" />
                        </div>
                        <div>
                          <Label className="text-xs">Content</Label>
                          <Textarea value={s.content} onChange={(e) => updateCustomSection(i, "content", e.target.value)} className="mt-1 min-h-[80px] bg-white border-gray-300 resize-y" placeholder="Enter your content. Use new lines for list items." />
                        </div>
                      </div>
                    ))}
                    {customSections.length === 0 && (
                      <p className="text-sm text-gray-500">No custom sections. Click Add section to add Projects, Languages, References, or any other section.</p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right: Live preview – fills available space */}
            <div className="lg:sticky lg:top-6 lg:self-start flex flex-col min-h-[600px]">
              <Card className="border border-gray-200 bg-white flex-1 flex flex-col min-h-0">
                <CardHeader className="pb-3 shrink-0 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-base text-gray-900">Live preview</CardTitle>
                      <CardDescription className="text-sm">Changes appear here as you type.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Label className="text-xs text-gray-600 whitespace-nowrap">CV color</Label>
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-9 h-9 rounded cursor-pointer border border-gray-300 bg-white p-0.5"
                        title="Choose accent color"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant={cvOnlineUrl ? "secondary" : "default"}
                    size="sm"
                    onClick={handleCreatePublicLink}
                    disabled={creatingPublicLink}
                    className="w-full sm:w-auto font-medium"
                    style={!cvOnlineUrl ? { backgroundColor: DEEP_BLUE, color: "white" } : undefined}
                  >
                    {creatingPublicLink ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : cvOnlineUrl ? (
                      "✓ QR code added – scan for online CV"
                    ) : (
                      "Add QR code to CV"
                    )}
                  </Button>
                </CardHeader>
                <CardContent className="flex-1 min-h-0 overflow-auto p-4 flex items-start justify-center">
                  <div className="w-full max-w-full min-w-0" style={{ maxWidth: "min(100%, 340px)" }}>
                    <CvPreviewByTemplate
                      templateId={templateId}
                      data={{
                        personal: {
                          ...personal,
                          profilePictureUrl: personal.profilePictureBase64 ?? undefined,
                          showProfilePictureOnCv: personal.showProfilePictureOnCv,
                        },
                        overview,
                        workExperience,
                        education,
                        certifications,
                        keySkills,
                        accentColor,
                        customSections: templateId >= 6 ? customSections : undefined,
                        cvOnlineUrl: cvOnlineUrl ?? undefined,
                      } as CvPreviewData}
                    />
                  </div>
                </CardContent>
              </Card>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  size="default"
                  className="rounded-lg text-white font-semibold shadow-md hover:opacity-90 hover:shadow-lg transition-all px-6"
                  style={{ backgroundColor: DEEP_BLUE }}
                  onClick={handleDownload}
                >
                  <FileText className="h-4 w-4 mr-2" /> Download CV
                </Button>
                {hasChanges() && (
                  <Button
                    variant="outline"
                    size="default"
                    className="rounded-lg border-2 border-gray-200 font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors px-6"
                    onClick={handleUpdateProfile}
                    disabled={savingProfile}
                  >
                    {savingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                    Save to profile
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={payModalOpen} onOpenChange={setPayModalOpen}>
        <DialogContent className="max-w-md bg-white border-2 border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Pay ZAR 10 to download</DialogTitle>
            <DialogDescription className="text-gray-700">
              {templateId >= 6
                ? "This is a paid template. Pay ZAR 10 for 1 day access to download your CV as PDF."
                : "Your CV is more than one page. Pay ZAR 10 for 1 day access to download it."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button
              className="text-white flex-1"
              style={{ backgroundColor: DEEP_BLUE }}
              disabled={paying}
              onClick={handlePayZAR10}
            >
              {paying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
              Pay ZAR 10
            </Button>
            <Button variant="outline" onClick={() => setPayModalOpen(false)}>Cancel</Button>
          </div>
          <p className="text-xs text-gray-500 pt-2">Payment will be processed securely. Backend integration can be added later.</p>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default SmartApplyCvEditor;
