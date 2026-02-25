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
import { Loader2, ArrowLeft, FileText, Plus, Trash2, UserPlus, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { smartApplyAPI } from "@/services/api";
import type { WorkExperienceItem, EducationItem, CertificationItem, SkillItem, AddressItem } from "@/pages/SmartApplyProfile";
import { CvPreviewByTemplate, type CvPreviewData } from "@/components/cv-templates/CvTemplatePreviews";

const DEEP_BLUE = "#1e3a5f";
const CV_UNLOCK_PREFIX = "cv_unlock_";

function isUnlocked(templateId: number): boolean {
  // Template 1 and 2–5 are always accessible.
  if (templateId === 1) return true;
  if (templateId >= 2 && templateId <= 5) return true;
  const key = `${CV_UNLOCK_PREFIX}${templateId}`;
  const until = localStorage.getItem(key);
  if (!until) return false;
  return Date.now() < Number(until);
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
  });
  const [overview, setOverview] = useState("");
  const [category, setCategory] = useState<"general" | "professional">("professional");
  const [workExperience, setWorkExperience] = useState<WorkExperienceItem[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [keySkills, setKeySkills] = useState<SkillItem[]>([]);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const initialDataRef = useRef<string>("");

  useEffect(() => {
    const token = localStorage.getItem("smart_apply_token");
    if (!token) {
      navigate("/smart-apply");
      return;
    }
    if (templateId !== 1 && !isUnlocked(templateId)) {
      navigate("/smart-apply/cv-builder");
      return;
    }
    smartApplyAPI
      .getProfile()
      .then((res: { profile?: any }) => {
        const p = res?.profile;
        if (p) {
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
          });
          setCategory((p.category === "general" || p.category === "professional" ? p.category : "professional") as "general" | "professional");
          setOverview(p.overview ?? "");
          setWorkExperience(ensureArray(p.workExperience).map(normalizeWorkExp));
          setEducation(ensureArray(p.education).map(normalizeEducation));
          setCertifications(ensureArray(p.certifications).map(normalizeCert));
          setKeySkills(ensureArray(p.keySkills).map(normalizeSkill));
          setAddresses(Array.isArray(p.addresses) ? p.addresses : []);
        }
      })
      .catch(() => navigate("/smart-apply"))
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
            <Button asChild variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900">
              <Link to="/smart-apply/cv-builder" className="inline-flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to templates
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Template {templateId}</span>
              {hasChanges() && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-500 text-amber-700 hover:bg-amber-50"
                  onClick={handleUpdateProfile}
                  disabled={savingProfile}
                >
                  {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                  Update my profile
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Edit form – instant updates reflected in preview */}
            <div className="space-y-6">
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
                  <Button type="button" variant="outline" size="sm" onClick={addWork} className="border-gray-300">
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {workExperience.map((w, i) => (
                    <div key={i} className="p-3 border border-gray-200 rounded-lg space-y-2">
                      <div className="flex justify-end">
                        <Button type="button" variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => removeWork(i)}>
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
                  <Button type="button" variant="outline" size="sm" onClick={addEdu} className="border-gray-300">
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {education.map((e, i) => (
                    <div key={i} className="p-3 border border-gray-200 rounded-lg space-y-2">
                      <div className="flex justify-end">
                        <Button type="button" variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => removeEdu(i)}>
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
                  <Button type="button" variant="outline" size="sm" onClick={addCert} className="border-gray-300">
                    <Plus className="h-4 w-4 mr-1" /> Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {certifications.map((c, i) => (
                    <div key={i} className="flex flex-wrap items-center gap-2 p-2 border border-gray-100 rounded">
                      <Input value={c.name ?? ""} onChange={(e) => updateCert(i, "name", e.target.value)} placeholder="Certification name" className="flex-1 min-w-[120px] bg-white border-gray-300" />
                      <Input value={c.issuer ?? ""} onChange={(e) => updateCert(i, "issuer", e.target.value)} placeholder="Issuer" className="w-32 bg-white border-gray-300" />
                      <Input value={c.date ?? ""} onChange={(e) => updateCert(i, "date", e.target.value)} placeholder="Date" className="w-24 bg-white border-gray-300" />
                      <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => removeCert(i)}><Trash2 className="h-4 w-4" /></Button>
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
                  <Button type="button" variant="outline" size="sm" onClick={addSkill} className="border-gray-300">
                    <Plus className="h-4 w-4 mr-1" /> Add
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
                      <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => removeSkill(i)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  {keySkills.length === 0 && (
                    <p className="text-sm text-gray-500">No skills. Click Add to add skills.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: Live preview – updates instantly */}
            <div className="lg:sticky lg:top-6 lg:self-start">
              <Card className="border border-gray-200 bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-gray-900">Live preview</CardTitle>
                  <CardDescription className="text-sm">Changes appear here as you type.</CardDescription>
                </CardHeader>
                <CardContent>
                  <CvPreviewByTemplate
                    templateId={templateId}
                    data={{
                      personal,
                      overview,
                      workExperience,
                      education,
                      certifications,
                      keySkills,
                    } as CvPreviewData}
                  />
                </CardContent>
              </Card>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  className="text-white hover:opacity-90"
                  style={{ backgroundColor: DEEP_BLUE }}
                  onClick={() => toast({ title: "Download", description: "PDF download will be available when the backend is connected." })}
                >
                  <FileText className="h-4 w-4 mr-2" /> Download CV
                </Button>
                {hasChanges() && (
                  <Button variant="outline" className="border-gray-300" onClick={handleUpdateProfile} disabled={savingProfile}>
                    {savingProfile ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                    Save to profile
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SmartApplyCvEditor;
