/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { useNavigate, useLocation, Link, useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import type { WorkExperienceItem, EducationItem, CertificationItem, SkillItem, AddressItem } from "@/features/smartApply/pages/SmartApplyProfilePage";
import { CvPreviewByTemplate, type CvPreviewData, type CustomSection } from "@/components/cv-templates/CvTemplatePreviews";
import { CvMultiPagePreview } from "@/components/cv-templates/CvMultiPagePreview";
import { CvPreviewScaler } from "@/components/cv-templates/CvPreviewScaler";
import { captureCvToPdf } from "@/components/cv-templates/cvPdfPages";
import { expandSkillRowsFromName } from "@/features/smartApply/utils/cvSkillParsing";

const DEEP_BLUE = "#1e3a5f";
/** Visible on white editor cards (site root uses a dark `--background`). */
const LIGHT_BTN_OUTLINE =
  "border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:text-gray-900 shadow-sm";
const PROFILE_PIC_KEY = "smart_apply_profile_picture";
const SHOW_PP_ON_CV_KEY = "smart_apply_show_pp_on_cv";
const CV_UNLOCK_PREFIX = "cv_unlock_";
const CV_UNLOCK_DAY_MS = 24 * 60 * 60 * 1000;
const CV_CUSTOM_SECTIONS_KEY = "cv_custom_sections_template_2";
const CUSTOM_SECTION_PRESETS = ["Languages", "Projects", "References", "Interests", "Awards"] as const;

function loadStoredCustomSections(): CustomSection[] {
  try {
    const raw = localStorage.getItem(CV_CUSTOM_SECTIONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((s): s is CustomSection => !!s && typeof s === "object" && typeof (s as CustomSection).id === "string")
      .map((s) => ({
        id: s.id,
        title: typeof s.title === "string" ? s.title : "",
        content: typeof s.content === "string" ? s.content : "",
      }));
  } catch {
    return [];
  }
}

function persistCustomSections(sections: CustomSection[]) {
  try {
    localStorage.setItem(CV_CUSTOM_SECTIONS_KEY, JSON.stringify(sections));
  } catch {
    /* ignore quota errors */
  }
}
/** Fee when a 1-page-free CV exceeds one page (templates 1, 3–5). */
const CV_MULTI_PAGE_FEE_ZAR = 15;
/** Template 2 paid unlock fee per day. */
const CV_TEMPLATE_2_FEE_ZAR = 20;
const CV_TEMPLATE_COUNT = 5;
const COMING_SOON_TEMPLATE_IDS = new Set([3, 4, 5]);

function isComingSoonTemplate(templateId: number): boolean {
  return COMING_SOON_TEMPLATE_IDS.has(templateId);
}

function getTemplateFee(templateId: number): number {
  return templateId === 2 ? CV_TEMPLATE_2_FEE_ZAR : CV_MULTI_PAGE_FEE_ZAR;
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

function estimatePages(overview: string, skills: string): number {
  const total = (overview || "").length + (skills || "").length;
  if (total < 800) return 1;
  return 2;
}

function normalizeEmail(email: string): string {
  if (!email) return "";
  const normalized = (email || "")
    .normalize("NFKC")
    .replace(/\s+/g, "")
    .trim();

  const [localPart, ...domainParts] = normalized.split("@");
  const cleanLocal = (localPart || "").replace(/[^A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]/g, "");
  const cleanDomain = domainParts
    .join("@")
    .replace(/[^A-Za-z0-9.-]/g, "")
    .replace(/\.{2,}/g, ".")
    .replace(/^-+|-+$/g, "");

  return cleanLocal && cleanDomain ? `${cleanLocal}@${cleanDomain}` : "";
}

function deriveLocation(personalLocation: string, addresses: AddressItem[]): string {
  const direct = (personalLocation || "").trim();
  if (direct) return direct;
  const list = Array.isArray(addresses) ? addresses : [];
  if (!list.length) return "";
  const primary = list.find((a) => a?.isPrimary) ?? list[0];
  if (!primary) return "";
  const parts = [
    primary.city,
    primary.stateRegion,
    primary.country,
  ]
    .map((p) => (p || "").trim())
    .filter(Boolean);
  if (parts.length) return parts.join(", ");
  const street = [primary.addressLine1, primary.addressLine2]
    .map((p) => (p || "").trim())
    .filter(Boolean)
    .join(", ");
  return street;
}

/** True if user can download (free 1-page CV, has paid unlock, or is premium with credits) */
function canDownload(templateId: number, overview: string, keySkills: SkillItem[], premiumCredits = 0): boolean {
  if (premiumCredits > 0) return true;
  if (templateId === 2) return isUnlocked(templateId);
  const skillsStr = keySkills.map((s) => s.name).filter(Boolean).join(" ");
  const pages = estimatePages(overview, skillsStr);
  if (templateId >= 1 && templateId <= CV_TEMPLATE_COUNT) return pages < 2 || isUnlocked(templateId);
  return isUnlocked(templateId);
}

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

function normalizeWorkExp(item: unknown): WorkExperienceItem {
  if (item && typeof item === "object" && ("company" in item || "jobTitle" in item || "position" in item)) {
    const obj = item as Record<string, unknown>;
    return {
      company: typeof obj.company === "string" ? obj.company : undefined,
      jobTitle: typeof obj.jobTitle === "string" ? obj.jobTitle : (typeof obj.position === "string" ? obj.position : undefined),
      startDate: typeof obj.startDate === "string" ? obj.startDate : (typeof obj.start_date === "string" ? obj.start_date : undefined),
      endDate: typeof obj.endDate === "string" ? obj.endDate : (typeof obj.end_date === "string" ? obj.end_date : undefined),
      description: typeof obj.description === "string" ? obj.description : undefined,
    };
  }
  if (typeof item === "string") return { description: item };
  return { description: (item as { text?: string })?.text || "" };
}

function normalizeEducation(item: unknown): EducationItem {
  if (item && typeof item === "object" && ("institution" in item || "qualification" in item || "degree" in item)) {
    const obj = item as Record<string, unknown>;
    return {
      institution: typeof obj.institution === "string" ? obj.institution : undefined,
      qualification: typeof obj.qualification === "string" ? obj.qualification : (typeof obj.degree === "string" ? obj.degree : undefined),
      startDate: typeof obj.startDate === "string" ? obj.startDate : (typeof obj.start_date === "string" ? obj.start_date : undefined),
      endDate: typeof obj.endDate === "string" ? obj.endDate : (typeof obj.end_date === "string" ? obj.end_date : undefined),
    };
  }
  if (typeof item === "string") return { qualification: item };
  return { qualification: (item as { text?: string })?.text || "" };
}

function normalizeCert(item: unknown): CertificationItem {
  if (item && typeof item === "object" && ("name" in item || "issuer" in item)) {
    const obj = item as Record<string, unknown>;
    return {
      name: typeof obj.name === "string" ? obj.name : undefined,
      issuer: typeof obj.issuer === "string" ? obj.issuer : undefined,
      date: typeof obj.date === "string" ? obj.date : undefined,
    };
  }
  if (typeof item === "string") return { name: item };
  return { name: (item as { text?: string })?.text || "" };
}

function normalizeSkill(item: unknown): SkillItem {
  if (item && typeof item === "object" && "name" in item) {
    const obj = item as Record<string, unknown>;
    return {
      name: typeof obj.name === "string" ? obj.name : "",
      level: typeof obj.level === "string" ? obj.level : "",
    };
  }
  if (typeof item === "string") return { name: item, level: "" };
  return { name: (item as { text?: string })?.text || "", level: "" };
}

type JobAssistCvEditorState = {
  jobAssistData?: {
    personal?: { jobTitle?: string };
    overview?: string;
    keySkills?: SkillItem[];
    workExperience?: WorkExperienceItem[];
    education?: EducationItem[];
    /** e.g. Projects from Job Assist */
    customSections?: CustomSection[];
  };
};

/** Normalize CV markup so html2canvas keeps bullets/chips/text aligned. */
function prepareCvExportStyles(rootEl: HTMLElement) {
  rootEl.querySelectorAll(".cv-preview-font-scale").forEach((node) => {
    const el = node as HTMLElement;
    el.style.zoom = "1";
    el.style.transform = "none";
  });

  rootEl.querySelectorAll(".cv-t1-skill-chip").forEach((node) => {
    const el = node as HTMLElement;
    el.style.display = "inline-block";
    el.style.textAlign = "center";
    el.style.verticalAlign = "top";
    el.style.color = "#111111";
    el.style.fontSize = "13px";
    el.style.lineHeight = "32px";
    el.style.height = "32px";
    el.style.minHeight = "32px";
    el.style.padding = "0 12px";
    el.style.boxSizing = "border-box";
    el.style.marginRight = "8px";
    el.style.marginBottom = "8px";
    el.style.alignItems = "";
    el.style.justifyContent = "";
  });
  rootEl.querySelectorAll(".cv-pdf-skill-wrap").forEach((node) => {
    const el = node as HTMLElement;
    el.style.display = "block";
    el.style.fontSize = "13px";
    el.style.lineHeight = "32px";
  });

  rootEl.querySelectorAll(".cv-pdf-meta-row").forEach((node) => {
    const el = node as HTMLElement;
    el.style.display = "table";
    el.style.width = "100%";
    el.style.borderCollapse = "collapse";
    el.style.tableLayout = "fixed";
  });
  rootEl.querySelectorAll(".cv-pdf-meta-cell").forEach((node) => {
    const el = node as HTMLElement;
    el.style.display = "table-cell";
    if (!el.style.verticalAlign) el.style.verticalAlign = "middle";
  });
  // Only force direct children that are intended cells (avoid nested contact tables)
  rootEl.querySelectorAll(".cv-pdf-meta-row").forEach((row) => {
    Array.from(row.children).forEach((child) => {
      const el = child as HTMLElement;
      if (el.classList.contains("cv-t2-contact-table") || el.tagName === "TABLE") return;
      el.style.display = "table-cell";
      if (!el.style.verticalAlign) el.style.verticalAlign = "middle";
    });
  });
  rootEl.querySelectorAll(".cv-t2-skill-row").forEach((node) => {
    const el = node as HTMLElement;
    el.style.display = "block";
    el.style.width = "100%";
    el.style.boxSizing = "border-box";
  });
  rootEl.querySelectorAll("table.cv-t2-contact-table").forEach((node) => {
    const el = node as HTMLElement;
    el.style.display = "table";
    el.style.borderCollapse = "collapse";
    el.style.borderSpacing = "0";
    el.style.width = "100%";
  });
  rootEl.querySelectorAll("table.cv-t2-contact-table td").forEach((node) => {
    const el = node as HTMLElement;
    el.style.display = "table-cell";
    el.style.verticalAlign = "middle";
    el.style.fontSize = "13px";
    el.style.lineHeight = "18px";
    el.style.padding = "0";
  });
  // Links inside PDF export must stay on the text baseline (no flex/inline-flex leftovers)
  rootEl.querySelectorAll("table.cv-t2-contact-table a").forEach((node) => {
    const el = node as HTMLElement;
    el.style.display = "inline";
    el.style.verticalAlign = "baseline";
    el.style.lineHeight = "18px";
    el.style.fontSize = "13px";
    el.style.textDecoration = "none";
  });

  rootEl.querySelectorAll(".cv-pdf-bullet-item").forEach((node) => {
    const el = node as HTMLElement;
    el.style.display = "block";
    el.style.boxSizing = "border-box";
    el.style.width = "auto";
    // Keep hanging indent so "•" stays beside the first line of text
    if (!el.style.paddingLeft) el.style.paddingLeft = "14px";
    if (!el.style.textIndent) el.style.textIndent = "-14px";
  });
  rootEl.querySelectorAll(".cv-pdf-bullet-dot, .cv-pdf-bullet-text, .cv-pdf-bullet-cell").forEach((node) => {
    const el = node as HTMLElement;
    el.style.display = "inline";
    el.style.verticalAlign = "baseline";
    el.style.width = "auto";
    el.style.height = "auto";
    el.style.padding = "0";
    el.style.margin = "0";
    el.style.lineHeight = "inherit";
    el.style.borderRadius = "0";
    el.style.backgroundColor = "transparent";
    el.style.position = "static";
  });

  rootEl.querySelectorAll(".cv-t2-photo-cell").forEach((node) => {
    const el = node as HTMLElement;
    el.style.width = "136px";
    el.style.minWidth = "136px";
    el.style.maxWidth = "136px";
    el.style.verticalAlign = "middle";
  });
  rootEl.querySelectorAll(".cv-t2-photo-frame").forEach((node) => {
    const el = node as HTMLElement;
    el.style.width = "112px";
    el.style.height = "112px";
    el.style.minWidth = "112px";
    el.style.minHeight = "112px";
    el.style.maxWidth = "112px";
    el.style.maxHeight = "112px";
    el.style.borderRadius = "50%";
    el.style.overflow = "hidden";
    el.style.position = "relative";
    el.style.backgroundColor = "#e5e7eb";
  });
  rootEl.querySelectorAll(".cv-t2-photo-img").forEach((node) => {
    const el = node as HTMLElement;
    el.style.position = "absolute";
    el.style.inset = "0";
    el.style.width = "100%";
    el.style.height = "100%";
    el.style.objectFit = "cover";
    el.style.objectPosition = "center center";
    el.style.display = "block";
    el.style.maxWidth = "none";
    el.style.maxHeight = "none";
  });

  rootEl.querySelectorAll(".truncate, .line-clamp-1, .line-clamp-2, .line-clamp-3").forEach((node) => {
    const el = node as HTMLElement;
    el.style.overflow = "visible";
    el.style.textOverflow = "clip";
    el.style.whiteSpace = "normal";
    el.style.display = "block";
    el.style.webkitLineClamp = "unset";
    el.style.maxHeight = "none";
  });
}

const JobAssistantCvEditor = () => {
  const { templateId: templateIdParam } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const jobAssistData = (location.state as JobAssistCvEditorState | null)?.jobAssistData;
  const { toast } = useToast();
  const templateId = Math.max(1, Math.min(CV_TEMPLATE_COUNT, parseInt(templateIdParam || "1", 10) || 1));
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
  /** Parallel to workExperience — unchecked entries stay on profile but are omitted from preview/PDF. */
  const [workIncludedOnCv, setWorkIncludedOnCv] = useState<boolean[]>([]);
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [keySkills, setKeySkills] = useState<SkillItem[]>([]);
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [accentColor, setAccentColor] = useState(DEEP_BLUE);
  const [customSections, setCustomSections] = useState<CustomSection[]>(() =>
    templateId === 2 ? loadStoredCustomSections() : []
  );
  const [cvOnlineUrl, setCvOnlineUrl] = useState<string | null>(null);
  const [creatingPublicLink, setCreatingPublicLink] = useState(false);
  const [premiumCredits, setPremiumCredits] = useState(0);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const initialDataRef = useRef<string>("");
  const previewCaptureRef = useRef<HTMLDivElement | null>(null);

  const workExperienceForCv = workExperience.filter((_, i) => workIncludedOnCv[i] !== false);

  const buildCvData = (): CvPreviewData => ({
    personal: {
      ...personal,
      email: normalizeEmail(personal.email),
      currentLocation: deriveLocation(personal.currentLocation, addresses),
      profilePictureUrl: personal.profilePictureBase64 ?? undefined,
      showProfilePictureOnCv: personal.showProfilePictureOnCv,
    },
    overview,
    workExperience: workExperienceForCv,
    education,
    certifications,
    keySkills,
    accentColor,
    customSections: templateId === 2 ? customSections : undefined,
    cvOnlineUrl: cvOnlineUrl ?? undefined,
  });

  useEffect(() => {
    const token = localStorage.getItem("smart_apply_token");
    if (!token) {
      navigate("/smart-apply/sign-in", { replace: true });
      return;
    }
    if (isComingSoonTemplate(templateId)) {
      toast({
        title: "Coming soon",
        description: `Template ${templateId} is not available yet. Please use Template 1 or 2.`,
      });
      navigate("/smart-apply/cv-builder", { replace: true });
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
              email: normalizeEmail(p.email ?? ""),
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
            setWorkExperience(ensureArray(p.workExperience).flatMap(parseMaybeJsonBlocks).map(normalizeWorkExp));
            setEducation(ensureArray(p.education).flatMap(parseMaybeJsonBlocks).map(normalizeEducation));
            setCertifications(ensureArray(p.certifications).flatMap(parseMaybeJsonBlocks).map(normalizeCert));
            setKeySkills(
              ensureArray(p.keySkills)
                .flatMap(parseMaybeJsonBlocks)
                .map(normalizeSkill)
                .flatMap((sk) => expandSkillRowsFromName(sk.name || "", sk.level || "")),
            );
            setAddresses(Array.isArray(p.addresses) ? p.addresses : []);
          }
        } catch (err) {
          console.error("Profile parse error:", err);
        }
        // If navigated from Job Assist, overlay AI-tailored content on top of profile data
        if (jobAssistData) {
          if (jobAssistData.overview) setOverview(jobAssistData.overview);
          if (jobAssistData.keySkills?.length) {
            setKeySkills(
              jobAssistData.keySkills.flatMap((s) => expandSkillRowsFromName(s.name || "", s.level || "")),
            );
          }
          if (jobAssistData.workExperience?.length) setWorkExperience(jobAssistData.workExperience);
          if (jobAssistData.education?.length) setEducation(jobAssistData.education);
          if (jobAssistData.personal?.jobTitle) setPersonal((prev) => ({ ...prev, jobTitle: jobAssistData.personal.jobTitle }));
          if (jobAssistData.customSections?.length) {
            setCustomSections((prev) => {
              const incoming = jobAssistData.customSections!;
              const dropIds = new Set(incoming.map((s) => s.id));
              return [...incoming, ...prev.filter((s) => !dropIds.has(s.id))];
            });
          }
        }
      })
      .catch((err) => {
        console.error("Profile load error:", err);
      })
      .finally(() => setLoading(false));
  // Job assist state is intentionally read on initial page load only.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, templateId]);

  // Persist Template 2 custom sections on this device
  useEffect(() => {
    if (templateId !== 2) return;
    persistCustomSections(customSections);
  }, [customSections, templateId]);

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
  // Take an initial snapshot only after first profile load.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  useEffect(() => {
    setWorkIncludedOnCv((prev) => {
      if (prev.length === workExperience.length) return prev;
      const next = prev.slice(0, workExperience.length);
      while (next.length < workExperience.length) next.push(true);
      return next;
    });
  }, [workExperience.length]);

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
    const nextValue = field === "email" ? normalizeEmail(value) : value;
    setPersonal((prev) => ({ ...prev, [field]: nextValue }));
  };

  const addWork = () => setWorkExperience((prev) => [...prev, {}]);
  const removeWork = (i: number) => {
    setWorkExperience((prev) => prev.filter((_, idx) => idx !== i));
    setWorkIncludedOnCv((prev) => prev.filter((_, idx) => idx !== i));
  };
  const updateWork = (i: number, field: keyof WorkExperienceItem, value: string) => {
    setWorkExperience((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));
  };
  const setWorkOnCv = (i: number, included: boolean) => {
    setWorkIncludedOnCv((prev) => {
      const next = [...prev];
      while (next.length < workExperience.length) next.push(true);
      next[i] = included;
      return next;
    });
  };
  const setAllWorkOnCv = (included: boolean) => {
    setWorkIncludedOnCv(workExperience.map(() => included));
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

  const addCustomSection = (presetTitle = "") => {
    setCustomSections((prev) => {
      const next = [
        ...prev,
        {
          id: `section-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          title: presetTitle,
          content: "",
        },
      ];
      persistCustomSections(next);
      return next;
    });
  };
  const removeCustomSection = (i: number) => {
    setCustomSections((prev) => {
      const next = prev.filter((_, idx) => idx !== i);
      persistCustomSections(next);
      return next;
    });
  };
  const updateCustomSection = (i: number, field: "title" | "content", value: string) => {
    setCustomSections((prev) => {
      const next = prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item));
      persistCustomSections(next);
      return next;
    });
  };

  const handleCreatePublicLink = async () => {
    setCreatingPublicLink(true);
    try {
      const cvData: Record<string, unknown> = buildCvData() as unknown as Record<string, unknown>;
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

  const handleDownload = async () => {
    if (canDownload(templateId, overview, keySkills, premiumCredits)) {
      setDownloadingPdf(true);
      const a4PxWidth = 794;
      const exportHost = document.createElement("div");
      exportHost.setAttribute("data-cv-export-host", "1");
      exportHost.style.position = "fixed";
      exportHost.style.left = "-100000px";
      exportHost.style.top = "0";
      exportHost.style.width = `${a4PxWidth}px`;
      exportHost.style.padding = "0";
      exportHost.style.margin = "0";
      exportHost.style.background = "#ffffff";
      exportHost.style.zIndex = "-1";
      exportHost.style.pointerEvents = "none";
      document.body.appendChild(exportHost);

      const mount = document.createElement("div");
      mount.style.width = `${a4PxWidth}px`;
      mount.style.maxWidth = `${a4PxWidth}px`;
      mount.style.minWidth = `${a4PxWidth}px`;
      mount.style.margin = "0";
      mount.style.background = "#ffffff";
      exportHost.appendChild(mount);

      let root: Root | null = null;
      try {
        // Render a fresh full-A4 CV (do not clone the narrow live preview — that breaks text wrap/alignment)
        root = createRoot(mount);
        const exportData = { ...buildCvData(), cvFontScale: 1 };
        root.render(
          <CvPreviewByTemplate templateId={templateId} data={exportData} />
        );

        await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
        if (document.fonts?.ready) await document.fonts.ready;
        await Promise.all(
          Array.from(mount.querySelectorAll("img")).map(
            (img) =>
              img.complete
                ? Promise.resolve()
                : new Promise<void>((resolve) => {
                    img.onload = () => resolve();
                    img.onerror = () => resolve();
                  })
          )
        );
        // Extra paint after images
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

        prepareCvExportStyles(mount);

        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "pt",
          format: "a4",
          compress: true,
        });
        await captureCvToPdf(mount, pdf, (viewport, width, height) =>
          html2canvas(viewport, {
            scale: 2,
            useCORS: true,
            backgroundColor: "#ffffff",
            width,
            height,
            windowWidth: width,
            scrollX: 0,
            scrollY: 0,
            onclone: (_doc, el) => prepareCvExportStyles(el as HTMLElement),
          })
        );

        const safeName = (personal.fullName || "smart-apply-cv")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        pdf.save(`${safeName || "smart-apply-cv"}-template-${templateId}.pdf`);
        toast({ title: "CV downloaded", description: "Your CV PDF has been downloaded." });
      } catch (err: any) {
        toast({ title: "Could not download CV", description: err?.message || "Please try again.", variant: "destructive" });
      } finally {
        try {
          root?.unmount();
        } catch {
          /* ignore */
        }
        if (document.body.contains(exportHost)) {
          document.body.removeChild(exportHost);
        }
        setDownloadingPdf(false);
      }
      return;
    }
    setPayModalOpen(true);
  };

  const handlePayMultiPageFee = () => {
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
      const payload = {
        category,
        fullName: personal.fullName?.trim() || null,
        email: normalizeEmail(personal.email) || null,
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
        workExperience: workExperience.length
          ? (workExperience.map((w) => ({ ...w })) as Record<string, unknown>[])
          : null,
        education: education.length
          ? (education.map((e) => ({ ...e })) as Record<string, unknown>[])
          : null,
        certifications: certifications.length
          ? (certifications.map((c) => ({ ...c })) as Record<string, unknown>[])
          : null,
        keySkills: keySkills.length
          ? keySkills.map((s) => ({ name: s.name ?? "", level: s.level ?? "" }))
          : null,
        addresses: addresses.length ? addresses : null,
      };
      await smartApplyAPI.saveProfile(payload as any);
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
      toast({ title: "Profile updated", description: "Your Job Assistant profile has been updated with the CV information." });
    } catch (err: any) {
      toast({ title: "Could not update profile", description: err?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <SEO title="Edit CV – Job Assistant" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-gray-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title={`Edit CV – Template ${templateId} – Job Assistant`} />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <Button asChild variant="outlineLight" size="sm" className={`rounded-lg ${LIGHT_BTN_OUTLINE} hover:border-gray-400 transition-colors`}>
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
                <CardHeader className="pb-2 flex flex-row items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base text-gray-900">Work experience</CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      Tick which roles to include on this CV preview and PDF download. Your profile still keeps every entry.
                    </CardDescription>
                  </div>
                  <Button type="button" size="sm" onClick={addWork} className="rounded-lg text-white font-medium shadow-sm hover:opacity-90 transition-opacity shrink-0" style={{ backgroundColor: DEEP_BLUE }}>
                    <Plus className="h-4 w-4 mr-1.5" /> Add
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {workExperience.length > 1 && (
                    <div className="flex flex-wrap gap-3 text-xs">
                      <button
                        type="button"
                        className="text-blue-700 hover:underline font-medium"
                        onClick={() => setAllWorkOnCv(true)}
                      >
                        Select all for CV
                      </button>
                      <button
                        type="button"
                        className="text-gray-600 hover:underline font-medium"
                        onClick={() => setAllWorkOnCv(false)}
                      >
                        Clear all from CV
                      </button>
                      <span className="text-gray-500">
                        {workExperienceForCv.length} of {workExperience.length} on CV
                      </span>
                    </div>
                  )}
                  {workExperience.map((w, i) => {
                    const included = workIncludedOnCv[i] !== false;
                    const roleLabel = [w.jobTitle, w.company].filter(Boolean).join(" at ") || `Role ${i + 1}`;
                    return (
                    <div
                      key={i}
                      className={`p-3 border rounded-lg space-y-2 ${included ? "border-gray-200 bg-white" : "border-gray-200 bg-gray-50/80 opacity-90"}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <label className="flex items-center gap-2 cursor-pointer min-w-0">
                          <Checkbox
                            checked={included}
                            onCheckedChange={(checked) => setWorkOnCv(i, checked === true)}
                            className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            aria-label={`Include ${roleLabel} on CV`}
                          />
                          <span className="text-sm font-medium text-gray-900 truncate">Include on CV</span>
                          <span className="text-xs text-gray-500 truncate hidden sm:inline">— {roleLabel}</span>
                        </label>
                        <Button type="button" variant="ghost" size="sm" className="rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors p-2 shrink-0" onClick={() => removeWork(i)}>
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
                          <Input type="month" value={(w.startDate ?? "").slice(0, 7)} onChange={(e) => updateWork(i, "startDate", e.target.value)} className="mt-1 bg-white border-gray-300" />
                        </div>
                        <div>
                          <Label className="text-xs">End date</Label>
                          <Input type="month" value={(w.endDate ?? "").slice(0, 7)} onChange={(e) => updateWork(i, "endDate", e.target.value)} className="mt-1 bg-white border-gray-300" />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs">Description</Label>
                        <Textarea value={w.description ?? ""} onChange={(e) => updateWork(i, "description", e.target.value)} className="mt-1 min-h-[60px] bg-white border-gray-300 resize-y" />
                      </div>
                    </div>
                  );
                  })}
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
                          <Input type="month" value={(e.startDate ?? "").slice(0, 7)} onChange={(e) => updateEdu(i, "startDate", e.target.value)} className="mt-1 bg-white border-gray-300" />
                        </div>
                        <div>
                          <Label className="text-xs">End</Label>
                          <Input type="month" value={(e.endDate ?? "").slice(0, 7)} onChange={(e) => updateEdu(i, "endDate", e.target.value)} className="mt-1 bg-white border-gray-300" />
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

              {templateId === 2 && (
                <Card className="border border-gray-200 bg-white">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-base text-gray-900">Custom sections</CardTitle>
                      <CardDescription className="text-sm text-gray-600">
                        Add extra fields for Template 2. <strong className="text-gray-900">Languages</strong> appear in the grey sidebar;
                        other sections (Projects, References, etc.) show on the main column. Use new lines for list items.
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => addCustomSection("")}
                      className="rounded-lg text-white font-medium shadow-sm hover:opacity-90 transition-opacity shrink-0"
                      style={{ backgroundColor: DEEP_BLUE }}
                    >
                      <Plus className="h-4 w-4 mr-1.5" /> Add section
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {CUSTOM_SECTION_PRESETS.map((preset) => (
                        <Button
                          key={preset}
                          type="button"
                          size="sm"
                          variant="outlineLight"
                          className={`rounded-md ${LIGHT_BTN_OUTLINE}`}
                          onClick={() => addCustomSection(preset)}
                        >
                          + {preset}
                        </Button>
                      ))}
                    </div>
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
                          <Textarea
                            value={s.content}
                            onChange={(e) => updateCustomSection(i, "content", e.target.value)}
                            className="mt-1 min-h-[80px] bg-white border-gray-300 resize-y"
                            placeholder={
                              /language/i.test(s.title)
                                ? "One language per line, e.g.\nEnglish — Native\nZulu — Fluent"
                                : "Enter your content. Use new lines for list items."
                            }
                          />
                        </div>
                      </div>
                    ))}
                    {customSections.length === 0 && (
                      <p className="text-sm text-gray-700">
                        No custom sections yet. Use a quick-add button above or click Add section.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right: Live preview – fills available space */}
            <div className="lg:sticky lg:top-6 lg:self-start flex flex-col min-h-[600px] min-w-0 w-full">
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
                    variant={cvOnlineUrl ? "outlineLight" : "default"}
                    size="sm"
                    onClick={handleCreatePublicLink}
                    disabled={creatingPublicLink}
                    className={`w-full sm:w-auto font-medium ${cvOnlineUrl ? LIGHT_BTN_OUTLINE : ""}`}
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
                <CardContent className="flex-1 min-h-0 min-w-0 overflow-auto p-3 sm:p-4">
                  <div ref={previewCaptureRef} className="w-full min-w-0 max-w-full">
                    <CvPreviewScaler>
                      <CvMultiPagePreview>
                        <CvPreviewByTemplate
                          templateId={templateId}
                          data={buildCvData()}
                          livePreview
                        />
                      </CvMultiPagePreview>
                    </CvPreviewScaler>
                  </div>
                </CardContent>
              </Card>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  size="default"
                  disabled={downloadingPdf}
                  className="rounded-lg text-white font-semibold shadow-md hover:opacity-90 hover:shadow-lg transition-all px-6"
                  style={{ backgroundColor: DEEP_BLUE }}
                  onClick={handleDownload}
                >
                  {downloadingPdf ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
                  {downloadingPdf ? "Preparing PDF..." : "Download CV"}
                </Button>
                {hasChanges() && (
                  <Button
                    variant="outlineLight"
                    size="default"
                    className={`rounded-lg border-2 font-medium transition-colors px-6 ${LIGHT_BTN_OUTLINE}`}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Pay R{getTemplateFee(templateId)} to download</DialogTitle>
            <DialogDescription className="text-gray-700">
              {templateId === 2
                ? `This is a paid template. Pay R${CV_TEMPLATE_2_FEE_ZAR} for 1 day access to download your CV as PDF.`
                : `Your CV is more than one page. Pay R${CV_MULTI_PAGE_FEE_ZAR} for 1 day access to download it.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button
              className="text-white flex-1"
              style={{ backgroundColor: DEEP_BLUE }}
              disabled={paying}
              onClick={handlePayMultiPageFee}
            >
              {paying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CreditCard className="h-4 w-4 mr-2" />}
              Pay R{getTemplateFee(templateId)}
            </Button>
            <Button variant="outlineLight" className={LIGHT_BTN_OUTLINE} onClick={() => setPayModalOpen(false)}>
              Cancel
            </Button>
          </div>
          <p className="text-xs text-gray-500 pt-2">Payment will be processed securely. Backend integration can be added later.</p>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default JobAssistantCvEditor;

