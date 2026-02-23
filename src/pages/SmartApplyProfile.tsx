import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2, User, FileText, Download, Eye, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { smartApplyAPI } from "@/services/api";

export interface WorkExperienceItem {
  company?: string;
  jobTitle?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  text?: string;
}

export interface EducationItem {
  institution?: string;
  qualification?: string;
  startDate?: string;
  endDate?: string;
  text?: string;
}

export interface CertificationItem {
  name?: string;
  issuer?: string;
  date?: string;
  text?: string;
}

export interface SkillItem {
  name?: string;
  level?: string;
  text?: string;
}

export interface AddressItem {
  id?: number;
  label?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateRegion?: string;
  postalCode?: string;
  country?: string;
  isPrimary?: boolean;
}

const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
const GENDER_OPTIONS = ["", "Male", "Female", "Non-binary", "Prefer not to say", "Other"];

/** Website primary color (Smart Apply / header) */
const PRIMARY_COLOR = "#1e3a5f";

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function getInitials(fullName: string | undefined): string {
  if (!fullName || !fullName.trim()) return "?";
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0].slice(0, 2) || "?").toUpperCase();
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
  if ("name" in item && "level" in item) return item as SkillItem;
  if ("name" in item) return item as SkillItem;
  return { name: (item as { text?: string }).text || "", level: "" };
}

const SmartApplyProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [overview, setOverview] = useState("");
  const [category, setCategory] = useState<"general" | "professional">("professional");
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
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [workExperience, setWorkExperience] = useState<WorkExperienceItem[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [keySkills, setKeySkills] = useState<SkillItem[]>([]);
  const [cvs, setCvs] = useState<{ id: number; label: string; roleOrCategory: string; fileName: string; createdAt?: string }[]>([]);
  const [primaryCvId, setPrimaryCvId] = useState<number | null>(null);
  const [cvLabel, setCvLabel] = useState("");
  const [cvRole, setCvRole] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [showLoaderOverlay, setShowLoaderOverlay] = useState(false);
  const loadingDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadCVs = () => {
    smartApplyAPI.listCVs().then((res: { cvs?: typeof cvs }) => setCvs(res?.cvs ?? [])).catch(() => setCvs([]));
  };

  useEffect(() => {
    const token = localStorage.getItem("smart_apply_token");
    if (!token) {
      navigate("/smart-apply");
      return;
    }
    let cancelled = false;
    smartApplyAPI
      .getProfile()
      .then((res: { profile?: any }) => {
        if (cancelled) return;
        const p = res?.profile;
        if (p) {
          if (p.fullName) localStorage.setItem("smart_apply_full_name", p.fullName);
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
          setPrimaryCvId(p.primaryCvId != null ? Number(p.primaryCvId) : null);
          setAddresses(Array.isArray(p.addresses) ? p.addresses.map((a: any) => ({
            id: a.id,
            label: a.label ?? "Current",
            addressLine1: a.addressLine1 ?? "",
            addressLine2: a.addressLine2 ?? "",
            city: a.city ?? "",
            stateRegion: a.stateRegion ?? "",
            postalCode: a.postalCode ?? "",
            country: a.country ?? "",
            isPrimary: !!a.isPrimary,
          })) : []);
          setWorkExperience(ensureArray(p.workExperience).map(normalizeWorkExp));
          setEducation(ensureArray(p.education).map(normalizeEducation));
          setCertifications(ensureArray(p.certifications).map(normalizeCert));
          setKeySkills(ensureArray(p.keySkills).map(normalizeSkill));
        }
        loadCVs();
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        if (!cancelled) navigate("/smart-apply");
      });
    return () => { cancelled = true; };
  }, [navigate]);

  // Show loader overlay only after a short delay to avoid blink on fast load or Strict Mode remount
  useEffect(() => {
    if (loading) {
      loadingDelayRef.current = setTimeout(() => setShowLoaderOverlay(true), 200);
      return () => {
        if (loadingDelayRef.current) clearTimeout(loadingDelayRef.current);
      };
    } else {
      setShowLoaderOverlay(false);
      if (loadingDelayRef.current) {
        clearTimeout(loadingDelayRef.current);
        loadingDelayRef.current = null;
      }
    }
  }, [loading]);

  const handleSave = async () => {
    if (!category || !["general", "professional"].includes(category)) {
      toast({ title: "Invalid category", variant: "destructive" });
      return;
    }
    if (personal.dateOfBirth && personal.dateOfBirth > todayISO()) {
      toast({ title: "Invalid date of birth", description: "Date of birth cannot be in the future.", variant: "destructive" });
      return;
    }
    setSaving(true);
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
        primaryCvId: primaryCvId ?? undefined,
        overview: overview.trim() || null,
        workExperience: workExperience.length ? workExperience : null,
        education: education.length ? education : null,
        certifications: certifications.length ? certifications : null,
        keySkills: keySkills.length ? keySkills : null,
        addresses: addresses.length ? addresses : null,
      });
      if (personal.fullName) localStorage.setItem("smart_apply_full_name", personal.fullName);
      toast({ title: "Profile saved", description: "Your profile has been updated." });
    } catch (err: any) {
      toast({ title: "Could not save profile", description: err?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const addWork = () => setWorkExperience((prev) => [...prev, {}]);
  const removeWork = (i: number) => setWorkExperience((prev) => prev.filter((_, idx) => idx !== i));
  const updateWork = (i: number, field: keyof WorkExperienceItem, value: string) => {
    setWorkExperience((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  };

  const addAddress = () => setAddresses((prev) => [...prev, { label: "Current", addressLine1: "", addressLine2: "", city: "", stateRegion: "", postalCode: "", country: "", isPrimary: prev.length === 0 }]);
  const removeAddress = (i: number) => setAddresses((prev) => prev.filter((_, idx) => idx !== i));
  const updateAddress = (i: number, field: keyof AddressItem, value: string | boolean) => {
    setAddresses((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
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

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.indexOf(",") >= 0 ? dataUrl.split(",")[1] : dataUrl;
        resolve(base64 || "");
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const handleViewCV = async (id: number) => {
    try {
      const blob = await smartApplyAPI.getCVBlob(id, false);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) {
      toast({ title: "Could not open CV", variant: "destructive" });
    }
  };

  const handleDownloadCV = async (id: number, fileName: string) => {
    try {
      const blob = await smartApplyAPI.getCVBlob(id, true);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "cv.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast({ title: "Could not download CV", variant: "destructive" });
    }
  };

  const handleDeleteCV = async (id: number) => {
    try {
      await smartApplyAPI.deleteCV(id);
      loadCVs();
      toast({ title: "CV deleted" });
    } catch (e) {
      toast({ title: "Could not delete CV", variant: "destructive" });
    }
  };

  const handleUploadCV = async () => {
    if (!cvLabel.trim()) {
      toast({ title: "Label required", description: "Give this CV a name (e.g. Software Developer CV).", variant: "destructive" });
      return;
    }
    const file = cvFile;
    if (!file) {
      toast({ title: "File required", description: "Choose a PDF file to upload.", variant: "destructive" });
      return;
    }
    setUploadingCV(true);
    try {
      const fileBase64 = await fileToBase64(file);
      if (!fileBase64 || fileBase64.length < 100) {
        toast({ title: "File could not be read", description: "Please choose a valid PDF and try again.", variant: "destructive" });
        return;
      }
      await smartApplyAPI.uploadCV({
        label: cvLabel.trim(),
        roleOrCategory: cvRole.trim() || undefined,
        fileName: file.name,
        fileBase64,
      });
      loadCVs();
      setCvLabel("");
      setCvRole("");
      setCvFile(null);
      toast({ title: "CV uploaded", description: "You can view, download or upload more CVs for different roles." });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err?.message ?? "Try again.", variant: "destructive" });
    } finally {
      setUploadingCV(false);
    }
  };

  const initials = getInitials(personal.fullName);

  return (
    <Layout>
      <SEO page="smartApply" />
      <div className="min-h-screen bg-white relative">
        {/* Loading overlay – only after short delay to avoid blink */}
        {showLoaderOverlay && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/95 min-h-[60vh]" aria-busy="true">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        )}
        <div className="max-w-3xl mx-auto px-4 py-10">
          {/* Avatar with initials (no profile picture) */}
          <div className="flex items-center gap-6 mb-8">
            <div
              className="w-20 h-20 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center text-2xl font-semibold text-gray-600 shrink-0"
              aria-hidden
            >
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{personal.fullName || "Your profile"}</h1>
              <p className="text-sm text-gray-500">{personal.email || "Add your email"}</p>
            </div>
          </div>

          {/* Personal details – separate section */}
          <Card className="mb-6 border border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" /> Personal details
              </CardTitle>
              <CardDescription>Your name, contact, date of birth and other details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Full name</Label>
                  <Input
                    value={personal.fullName}
                    onChange={(e) => setPersonal((p) => ({ ...p, fullName: e.target.value }))}
                    placeholder="Full name"
                    className="mt-1 bg-white border-gray-300"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={personal.email}
                    onChange={(e) => setPersonal((p) => ({ ...p, email: e.target.value }))}
                    placeholder="Email"
                    className="mt-1 bg-white border-gray-300"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Login email (read-only).</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    value={personal.phone}
                    onChange={(e) => setPersonal((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "") }))}
                    placeholder="Contact number"
                    className="mt-1 bg-white border-gray-300"
                  />
                </div>
                <div>
                  <Label>Date of birth</Label>
                  <Input
                    type="date"
                    max={todayISO()}
                    value={personal.dateOfBirth}
                    onChange={(e) => setPersonal((p) => ({ ...p, dateOfBirth: e.target.value }))}
                    className="mt-1 bg-white border-gray-300"
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <select
                    value={personal.gender}
                    onChange={(e) => setPersonal((p) => ({ ...p, gender: e.target.value }))}
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    {GENDER_OPTIONS.map((opt) => (
                      <option key={opt || "none"} value={opt}>{opt || "—"}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Nationality</Label>
                  <Input
                    value={personal.nationality}
                    onChange={(e) => setPersonal((p) => ({ ...p, nationality: e.target.value }))}
                    placeholder="e.g. British, Nigerian"
                    className="mt-1 bg-white border-gray-300"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Current location</Label>
                  <Input
                    value={personal.currentLocation}
                    onChange={(e) => setPersonal((p) => ({ ...p, currentLocation: e.target.value }))}
                    placeholder="e.g. London, UK"
                    className="mt-1 bg-white border-gray-300"
                  />
                </div>
                <div>
                  <Label>Job title / Headline</Label>
                  <Input
                    value={personal.jobTitle}
                    onChange={(e) => setPersonal((p) => ({ ...p, jobTitle: e.target.value }))}
                    placeholder="e.g. Software Developer"
                    className="mt-1 bg-white border-gray-300"
                  />
                </div>
                <div>
                  <Label>LinkedIn URL</Label>
                  <Input
                    type="url"
                    value={personal.linkedinUrl}
                    onChange={(e) => setPersonal((p) => ({ ...p, linkedinUrl: e.target.value }))}
                    placeholder="https://linkedin.com/in/..."
                    className="mt-1 bg-white border-gray-300"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Website</Label>
                  <Input
                    type="url"
                    value={personal.website}
                    onChange={(e) => setPersonal((p) => ({ ...p, website: e.target.value }))}
                    placeholder="https://..."
                    className="mt-1 bg-white border-gray-300"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Link to Security (change password) in Settings */}
          <Card className="mb-6 border border-gray-200 bg-white shadow-sm">
            <CardContent className="py-4">
              <p className="text-sm font-medium text-gray-900 mb-2">Password and security</p>
              <p className="text-sm text-gray-600 mb-3">Change your password in Settings.</p>
              <Button asChild size="sm" className="bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400">
                <Link to="/smart-apply/settings" className="inline-flex items-center gap-1.5 font-medium">
                  Manage in Settings → Security
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Addresses */}
          <Card className="mb-6 border border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" /> Addresses
              </CardTitle>
              <CardDescription>Add one or more addresses (e.g. current, permanent).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {addresses.map((addr, i) => (
                <div key={i} className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Input
                      placeholder="Label (e.g. Current, Permanent)"
                      value={addr.label ?? ""}
                      onChange={(e) => updateAddress(i, "label", e.target.value)}
                      className="w-40 bg-white border-gray-300"
                    />
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-normal flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={!!addr.isPrimary}
                          onChange={(e) => {
                            const primary = e.target.checked;
                            setAddresses((prev) => prev.map((a, idx) => ({ ...a, isPrimary: idx === i ? primary : false })));
                          }}
                        />
                        Primary
                      </Label>
                      <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => removeAddress(i)} title="Remove address">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input placeholder="Address line 1" value={addr.addressLine1 ?? ""} onChange={(e) => updateAddress(i, "addressLine1", e.target.value)} className="bg-white border-gray-300" />
                    <Input placeholder="Address line 2 (optional)" value={addr.addressLine2 ?? ""} onChange={(e) => updateAddress(i, "addressLine2", e.target.value)} className="bg-white border-gray-300" />
                    <Input placeholder="City" value={addr.city ?? ""} onChange={(e) => updateAddress(i, "city", e.target.value)} className="bg-white border-gray-300" />
                    <Input placeholder="State / Region" value={addr.stateRegion ?? ""} onChange={(e) => updateAddress(i, "stateRegion", e.target.value)} className="bg-white border-gray-300" />
                    <Input placeholder="Postal code" value={addr.postalCode ?? ""} onChange={(e) => updateAddress(i, "postalCode", e.target.value)} className="bg-white border-gray-300" />
                    <Input placeholder="Country" value={addr.country ?? ""} onChange={(e) => updateAddress(i, "country", e.target.value)} className="bg-white border-gray-300" />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                size="sm"
                onClick={addAddress}
                className="text-white hover:opacity-90"
                style={{ backgroundColor: PRIMARY_COLOR }}
              >
                <Plus className="h-4 w-4 mr-1" /> Add address
              </Button>
            </CardContent>
          </Card>

          {/* My CVs – view, download, upload multiple for different roles */}
          <Card className="mb-6 border border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" /> My CVs
              </CardTitle>
              <CardDescription>Keep multiple CVs for different roles or categories. View, download or upload new ones. Link a default CV for applications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {cvs.length > 0 && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Label className="text-sm font-medium">Default CV (linked for applications)</Label>
                    <select
                      value={primaryCvId ?? ""}
                      onChange={(e) => setPrimaryCvId(e.target.value === "" ? null : Number(e.target.value))}
                      className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
                    >
                      <option value="">None</option>
                      {cvs.map((cv) => (
                        <option key={cv.id} value={cv.id}>{cv.label || cv.fileName}</option>
                      ))}
                    </select>
                  </div>
                  <Label className="text-sm font-medium">Your CVs</Label>
                  <ul className="space-y-2">
                    {cvs.map((cv) => (
                      <li key={cv.id} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg border border-gray-200 bg-gray-50/50">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">{cv.label || cv.fileName}</p>
                          {(cv.roleOrCategory || cv.fileName) && (
                            <p className="text-xs text-gray-500 truncate">
                              {cv.roleOrCategory ? `${cv.roleOrCategory} · ${cv.fileName}` : cv.fileName}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 shrink-0 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            onClick={() => handleViewCV(cv.id)}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 shrink-0 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            onClick={() => handleDownloadCV(cv.id, cv.fileName)}
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 shrink-0 border-gray-300 bg-white text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => handleDeleteCV(cv.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Upload another CV</Label>
                <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                  <Input
                    placeholder="Label (e.g. Software Developer CV)"
                    value={cvLabel}
                    onChange={(e) => setCvLabel(e.target.value)}
                    className="sm:w-56 bg-white border-gray-300"
                  />
                  <Input
                    placeholder="Role or category (optional)"
                    value={cvRole}
                    onChange={(e) => setCvRole(e.target.value)}
                    className="sm:w-48 bg-white border-gray-300"
                  />
                  <Input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                    className="sm:w-44 bg-white border-gray-300 file:mr-2 file:rounded file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm"
                  />
                  <Button
                    type="button"
                    onClick={handleUploadCV}
                    disabled={uploadingCV || !cvLabel.trim() || !cvFile}
                    className="text-white hover:opacity-90"
                    style={{ backgroundColor: PRIMARY_COLOR }}
                  >
                    {uploadingCV ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                    {uploadingCV ? " Uploading…" : " Upload CV"}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">PDF only. Use a clear label and role so you can pick the right CV when applying.</p>
              </div>
            </CardContent>
          </Card>

          {/* Overview */}
          <Card className="mb-6 border border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Overview</CardTitle>
              <CardDescription>Short summary for recruiters.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                placeholder="e.g. Experienced developer..."
                className="min-h-[100px] bg-white border-gray-300"
              />
            </CardContent>
          </Card>

          {/* Work experience – multiple */}
          <Card className="mb-6 border border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Work experience</CardTitle>
                  <CardDescription>Add each role with company, title and dates.</CardDescription>
                </div>
                <Button type="button" size="sm" onClick={addWork} className="text-white hover:opacity-90" style={{ backgroundColor: PRIMARY_COLOR }}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {workExperience.length === 0 && (
                <p className="text-sm text-gray-500">No work experience added yet.</p>
              )}
              {workExperience.map((item, i) => (
                <div key={i} className="p-4 rounded-lg border border-gray-200 bg-gray-50/50 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Experience #{i + 1}</span>
                    <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => removeWork(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs">Company</Label>
                      <Input
                        value={item.company ?? ""}
                        onChange={(e) => updateWork(i, "company", e.target.value)}
                        placeholder="Company name"
                        className="mt-0.5 bg-white border-gray-300"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Job title</Label>
                      <Input
                        value={item.jobTitle ?? ""}
                        onChange={(e) => updateWork(i, "jobTitle", e.target.value)}
                        placeholder="Role / title"
                        className="mt-0.5 bg-white border-gray-300"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Start date</Label>
                      <Input
                        type="date"
                        value={item.startDate ?? ""}
                        onChange={(e) => updateWork(i, "startDate", e.target.value)}
                        className="mt-0.5 bg-white border-gray-300"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">End date</Label>
                      <Input
                        type="date"
                        value={item.endDate ?? ""}
                        onChange={(e) => updateWork(i, "endDate", e.target.value)}
                        placeholder="Present"
                        className="mt-0.5 bg-white border-gray-300"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Description</Label>
                    <Textarea
                      value={item.description ?? ""}
                      onChange={(e) => updateWork(i, "description", e.target.value)}
                      placeholder="Responsibilities and achievements"
                      className="mt-0.5 min-h-[80px] bg-white border-gray-300"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Education – multiple */}
          <Card className="mb-6 border border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Education</CardTitle>
                  <CardDescription>Institution, qualification and dates.</CardDescription>
                </div>
                <Button type="button" size="sm" onClick={addEdu} className="text-white hover:opacity-90" style={{ backgroundColor: PRIMARY_COLOR }}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {education.length === 0 && <p className="text-sm text-gray-500">No education added yet.</p>}
              {education.map((item, i) => (
                <div key={i} className="p-4 rounded-lg border border-gray-200 bg-gray-50/50 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Education #{i + 1}</span>
                    <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => removeEdu(i)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs">Institution</Label>
                      <Input
                        value={item.institution ?? ""}
                        onChange={(e) => updateEdu(i, "institution", e.target.value)}
                        placeholder="School / university"
                        className="mt-0.5 bg-white border-gray-300"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Qualification</Label>
                      <Input
                        value={item.qualification ?? ""}
                        onChange={(e) => updateEdu(i, "qualification", e.target.value)}
                        placeholder="Degree / diploma"
                        className="mt-0.5 bg-white border-gray-300"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Start date</Label>
                      <Input
                        type="date"
                        value={item.startDate ?? ""}
                        onChange={(e) => updateEdu(i, "startDate", e.target.value)}
                        className="mt-0.5 bg-white border-gray-300"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">End date</Label>
                      <Input
                        type="date"
                        value={item.endDate ?? ""}
                        onChange={(e) => updateEdu(i, "endDate", e.target.value)}
                        className="mt-0.5 bg-white border-gray-300"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Certifications – multiple */}
          <Card className="mb-6 border border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Certifications</CardTitle>
                  <CardDescription>Name, issuer and date.</CardDescription>
                </div>
                <Button type="button" size="sm" onClick={addCert} className="text-white hover:opacity-90" style={{ backgroundColor: PRIMARY_COLOR }}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {certifications.length === 0 && <p className="text-sm text-gray-500">No certifications added yet.</p>}
              {certifications.map((item, i) => (
                <div key={i} className="p-4 rounded-lg border border-gray-200 bg-gray-50/50 flex flex-wrap items-end gap-3">
                  <div className="flex-1 min-w-[140px]">
                    <Label className="text-xs">Name</Label>
                    <Input
                      value={item.name ?? ""}
                      onChange={(e) => updateCert(i, "name", e.target.value)}
                      placeholder="Certification name"
                      className="mt-0.5 bg-white border-gray-300"
                    />
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <Label className="text-xs">Issuer</Label>
                    <Input
                      value={item.issuer ?? ""}
                      onChange={(e) => updateCert(i, "issuer", e.target.value)}
                      placeholder="Issuing body"
                      className="mt-0.5 bg-white border-gray-300"
                    />
                  </div>
                  <div className="w-[140px]">
                    <Label className="text-xs">Date</Label>
                    <Input
                      type="date"
                      value={item.date ?? ""}
                      onChange={(e) => updateCert(i, "date", e.target.value)}
                      className="mt-0.5 bg-white border-gray-300"
                    />
                  </div>
                  <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => removeCert(i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Skills – multiple with level */}
          <Card className="mb-6 border border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Key skills</CardTitle>
                  <CardDescription>Skill name and your level.</CardDescription>
                </div>
                <Button type="button" size="sm" onClick={addSkill} className="text-white hover:opacity-90" style={{ backgroundColor: PRIMARY_COLOR }}>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {keySkills.length === 0 && <p className="text-sm text-gray-500">No skills added yet.</p>}
              {keySkills.map((item, i) => (
                <div key={i} className="flex flex-wrap items-end gap-3">
                  <div className="flex-1 min-w-[160px]">
                    <Label className="text-xs">Skill</Label>
                    <Input
                      value={item.name ?? ""}
                      onChange={(e) => updateSkill(i, "name", e.target.value)}
                      placeholder="e.g. JavaScript"
                      className="mt-0.5 bg-white border-gray-300"
                    />
                  </div>
                  <div className="w-[160px]">
                    <Label className="text-xs">Level</Label>
                    <Select
                      value={item.level ?? ""}
                      onValueChange={(v) => updateSkill(i, "level", v)}
                    >
                      <SelectTrigger className="mt-0.5 bg-white border-gray-300">
                        <SelectValue placeholder="Level" />
                      </SelectTrigger>
                      <SelectContent>
                        {SKILL_LEVELS.map((l) => (
                          <SelectItem key={l} value={l}>
                            {l}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => removeSkill(i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Category (for recruiters) */}
          <Card className="mb-6 border border-gray-200 bg-white shadow-sm">
            <CardContent className="pt-6">
              <Label className="text-sm font-medium">Candidate category (for recruiters)</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as "general" | "professional")}>
                <SelectTrigger className="mt-2 w-full max-w-xs bg-white border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="flex justify-end pb-10">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="text-white hover:opacity-90"
              style={{ backgroundColor: PRIMARY_COLOR }}
            >
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : "Save profile"}
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SmartApplyProfile;
