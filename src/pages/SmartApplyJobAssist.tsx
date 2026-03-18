/**
 * SmartApplyJobAssist.tsx
 *
 * "Job Assist" feature: upload a job spec (PDF / DOCX / TXT) or paste the
 * description, have OpenAI generate an ATS-friendly CV, preview it in the
 * chosen template, and download as PDF – all in one page.
 */

import { useState, useRef, useLayoutEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ArrowLeft,
  Sparkles,
  Upload,
  FileText,
  X,
  Loader2,
  Download,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Wand2,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { jobAssistAPI, smartApplyAPI } from "@/services/api";
import type { WorkExperienceItem, EducationItem, SkillItem } from "@/pages/SmartApplyProfile";
import {
  CvPreviewByTemplate,
  SAMPLE_CV_PREVIEW_DATA,
  type CvPreviewData,
} from "@/components/cv-templates/CvTemplatePreviews";

// ─── constants ────────────────────────────────────────────────────────────────
const DEEP_BLUE = "#1e3a5f";
const ACCEPTED_TYPES = ".pdf,.docx,.txt,.png,.jpg,.jpeg,.webp";
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_IMAGE_TYPES = "image/png,image/jpeg,image/jpg,image/webp";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
const PROFILE_ONLY_JOB_PROMPT = "Create an ATS-friendly professional CV using my existing profile data and optimize it for broad role compatibility.";

// All 20 templates; 1 always free, 2–5 free on 1 page, 6–20 paid
const ALL_TEMPLATES = Array.from({ length: 20 }, (_, i) => i + 1);

// A4 dimensions at 96 DPI (matches CvBuilder)
const CV_PREVIEW_WIDTH = 280;
const CV_PREVIEW_HEIGHT = 373;

function normalizeStoredProfilePicture(raw: unknown): string | undefined {
  if (typeof raw !== "string" || !raw.trim()) return undefined;
  if (raw.startsWith("data:image/")) return raw;
  return `data:image/jpeg;base64,${raw}`;
}

function isJobSpecImage(file: File): boolean {
  const ext = file.name.split(".").pop()?.toLowerCase();
  return file.type.startsWith("image/") || ["png", "jpg", "jpeg", "webp"].includes(ext || "");
}

async function extractJobTextFromImage(file: File): Promise<string> {
  const { recognize } = await import("tesseract.js");
  const result = await recognize(file, "eng");
  return result.data.text?.trim() || "";
}

// ─── mini template thumbnail (matches CvBuilder CvPreviewCard) ───────────────
function TemplateThumbnail({ templateId, data, selected, onClick }: {
  templateId: number;
  data?: CvPreviewData;
  selected: boolean;
  onClick: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const s = Math.min(w / CV_PREVIEW_WIDTH, h / CV_PREVIEW_HEIGHT, 1);
      setScale(s);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative rounded-lg border-2 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none ${
        selected
          ? "border-[#1e3a5f] shadow-md ring-2 ring-[#1e3a5f]/20"
          : "border-gray-200 hover:border-[#1e3a5f]/40"
      }`}
    >
      {/* Aspect ratio box */}
      <div className="aspect-[3/4] relative pointer-events-none bg-gradient-to-br from-slate-100 via-gray-50 to-slate-100">
        <div
          ref={containerRef}
          className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-[1.03]"
        >
          <div
            className="shrink-0 rounded-md overflow-hidden transition-transform duration-300 group-hover:scale-[1.03]"
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
        {selected && (
          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#1e3a5f] flex items-center justify-center">
            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
          </div>
        )}
      </div>
      <div className="px-2 py-1.5 flex flex-wrap items-center justify-between gap-1">
        <span className="text-xs font-medium text-gray-700">Template {templateId}</span>
        {templateId === 1 ? (
          <span className="text-xs font-semibold text-green-700 bg-green-100 px-1.5 py-0.5 rounded">Free</span>
        ) : templateId <= 5 ? (
          <span className="text-xs text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">Free/1pg</span>
        ) : (
          <span className="text-xs text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">Paid</span>
        )}
      </div>
    </button>
  );
}
function buildPreviewData(
  cvContent: { jobTitle?: string; overview?: string; keySkills?: { name: string; level?: string }[]; workExperience?: WorkExperienceItem[]; education?: EducationItem[] },
  personal: CvPreviewData["personal"]
): CvPreviewData {
  return {
    ...SAMPLE_CV_PREVIEW_DATA,
    personal: {
      ...SAMPLE_CV_PREVIEW_DATA.personal,
      ...personal,
      jobTitle: cvContent.jobTitle || personal.jobTitle || "",
    },
    overview: cvContent.overview || "",
    keySkills: (cvContent.keySkills || []).map((s) => ({
      name: s.name || "",
      level: s.level || "Intermediate",
    })),
    workExperience: (cvContent.workExperience || []).map((w) => ({
      company: w.company || "",
      jobTitle: w.jobTitle || "",
      startDate: w.startDate || "",
      endDate: w.endDate || "",
      description: w.description || "",
    })),
    education: (cvContent.education || []).map((e) => ({
      qualification: e.qualification || "",
      institution: e.institution || "",
      startDate: e.startDate || "",
      endDate: e.endDate || "",
    })),
    certifications: SAMPLE_CV_PREVIEW_DATA.certifications,
  };
}

// ─── live CV preview scaled into an A4-ratio container ──────────────────────
// The `previewRef` content is captured at full 794px width for PDF export.
// The visual wrapper uses overflow:hidden + transform to scale it down for display.
const CV_FULL_WIDTH = 794;

function ScaledCvPreview({
  templateId,
  data,
  captureRef,
}: {
  templateId: number;
  data: CvPreviewData;
  captureRef: React.RefObject<HTMLDivElement>;
}) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / CV_FULL_WIDTH);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Outer div sets width; height collapses to the scaled content height via padding trick
  return (
    <div ref={outerRef} className="w-full overflow-hidden">
      {/* Capture target: full-width, unscaled — used for PDF export */}
      <div
        ref={captureRef}
        style={{
          width: CV_FULL_WIDTH,
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          // Pull up the excess layout height so the parent collapses correctly
          marginBottom: `${-(CV_FULL_WIDTH * (1 - scale))}px`,
        }}
      >
        <CvPreviewByTemplate templateId={templateId} data={data} />
      </div>
    </div>
  );
}

// ─── main component ────────────────────────────────────────────────────────────
const SmartApplyJobAssist = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // ── input state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [jobText, setJobText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // ── template selector
  const [selectedTemplate, setSelectedTemplate] = useState(1);

  // ── generation state
  const [generating, setGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<CvPreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── download state
  const [downloading, setDownloading] = useState(false);

  // ── CV preview ref (for pdf capture) — now passed into ScaledCvPreview
  const previewRef = useRef<HTMLDivElement>(null);

  // ── full profile loaded from API
  const [personal, setPersonal] = useState<CvPreviewData["personal"]>(SAMPLE_CV_PREVIEW_DATA.personal);
  const [profileWorkExp, setProfileWorkExp] = useState<WorkExperienceItem[]>([]);
  const [profileEducation, setProfileEducation] = useState<EducationItem[]>([]);
  const [profileSkills, setProfileSkills] = useState<SkillItem[]>([]);
  const [profileOverview, setProfileOverview] = useState("");
  const profileLoadedRef = useRef(false);
  const canGenerate = !!uploadedFile || !!jobText.trim() || !!personal.profilePictureUrl;

  // Load full profile from SmartApply API once on mount
  if (!profileLoadedRef.current) {
    profileLoadedRef.current = true;
    smartApplyAPI.getProfile().then((res) => {
      const p = res?.profile as Record<string, unknown> | null;
      if (!p) return;
      setPersonal({
        fullName: (p.fullName as string) || SAMPLE_CV_PREVIEW_DATA.personal.fullName,
        email: (p.email as string) || "",
        phone: (p.phone as string) || "",
        currentLocation: (p.currentLocation as string) || "",
        jobTitle: (p.jobTitle as string) || "",
        linkedinUrl: (p.linkedinUrl as string) || "",
        website: (p.website as string) || "",
        dateOfBirth: (p.dateOfBirth as string) || "",
        gender: (p.gender as string) || "",
        nationality: (p.nationality as string) || "",
        profilePictureUrl: normalizeStoredProfilePicture(p.profilePicture),
        showProfilePictureOnCv: p.showProfilePictureOnCv !== false,
      });
      setProfileOverview((p.overview as string) || "");
      const rawWork = Array.isArray(p.workExperience) ? p.workExperience as Record<string, unknown>[] : [];
      setProfileWorkExp(rawWork.map((w) => ({
        company: (w.company as string) || "",
        jobTitle: (w.jobTitle as string) || "",
        startDate: (w.startDate as string) || "",
        endDate: (w.endDate as string) || "",
        description: (w.description as string) || "",
      })));
      const rawEdu = Array.isArray(p.education) ? p.education as Record<string, unknown>[] : [];
      setProfileEducation(rawEdu.map((e) => ({
        qualification: (e.qualification as string) || "",
        institution: (e.institution as string) || "",
        startDate: (e.startDate as string) || "",
        endDate: (e.endDate as string) || "",
      })));
      const rawSkills = Array.isArray(p.keySkills) ? p.keySkills as Record<string, unknown>[] : [];
      setProfileSkills(rawSkills.map((s) => ({
        name: typeof s === "string" ? s : (s.name as string) || "",
        level: typeof s === "object" ? (s.level as string) || "" : "",
      })));
    }).catch(() => {/* not logged in – use sample data */});
  }

  // ── drag & drop handlers ──────────────────────────────────────────────────
  const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };

  const applyFile = (file: File) => {
    if (file.size > MAX_FILE_BYTES) {
      toast({ title: "File too large", description: "Maximum file size is 10 MB.", variant: "destructive" });
      return;
    }
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx", "txt", "png", "jpg", "jpeg", "webp"].includes(ext || "")) {
      toast({ title: "Unsupported file", description: "Please upload PDF, DOCX, TXT, PNG, JPG, JPEG, or WEBP.", variant: "destructive" });
      return;
    }
    setUploadedFile(file);
    setJobText(""); // clear textarea when file is chosen
    setGeneratedData(null);
    setError(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) applyFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyFile(file);
    e.target.value = ""; // reset so same file can be re-selected
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Unsupported image", description: "Please upload PNG, JPG, JPEG, or WEBP.", variant: "destructive" });
      e.target.value = "";
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast({ title: "Image too large", description: "Maximum image size is 5 MB.", variant: "destructive" });
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result.startsWith("data:image/")) {
        toast({ title: "Invalid image", description: "Could not read the selected image.", variant: "destructive" });
        return;
      }
      setPersonal((prev) => ({
        ...prev,
        profilePictureUrl: result,
        showProfilePictureOnCv: true,
      }));
      setGeneratedData(null);
      toast({ title: "Image uploaded", description: "Your CV preview will include this profile image." });
    };
    reader.onerror = () => {
      toast({ title: "Upload failed", description: "Could not read image file.", variant: "destructive" });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── generate CV ───────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (!canGenerate) {
      toast({
        title: "Nothing to analyse",
        description: "Please upload a job spec file, paste the job description, or upload a profile image.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    setError(null);
    setGeneratedData(null);

    // Bundle existing profile so AI tailors it instead of inventing data
    const profileData = {
      overview: profileOverview,
      workExperience: profileWorkExp,
      education: profileEducation,
      keySkills: profileSkills,
    };

    try {
      let result;
      if (uploadedFile) {
        if (isJobSpecImage(uploadedFile)) {
          toast({ title: "Reading image", description: "Extracting text from your uploaded image..." });
          const ocrText = await extractJobTextFromImage(uploadedFile);
          if (!ocrText || ocrText.length < 30) {
            throw new Error("Could not extract enough text from the image. Try a clearer image or paste the job description.");
          }
          result = await jobAssistAPI.generate({ jobText: ocrText, profileData });
        } else {
          result = await jobAssistAPI.generate({ file: uploadedFile, profileData });
        }
      } else {
        result = await jobAssistAPI.generate({ jobText: jobText.trim() || PROFILE_ONLY_JOB_PROMPT, profileData });
      }

      if (!result.success || !result.cvContent) {
        throw new Error("The AI did not return valid CV content. Please try again.");
      }

      const preview = buildPreviewData(result.cvContent, personal);
      setGeneratedData(preview);

      toast({
        title: "CV generated!",
        description: "Review your AI-generated CV below, then download it.",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
      toast({ title: "Generation failed", description: message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  // ── download as PDF ────────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!previewRef.current) {
      toast({ title: "Preview not ready", description: "Please wait for the CV to fully render.", variant: "destructive" });
      return;
    }

    setDownloading(true);
    try {
      const source = previewRef.current;
      const a4Width = 794;

      // Create an off-screen clone at A4 width for high-fidelity capture
      const host = document.createElement("div");
      Object.assign(host.style, {
        position: "fixed",
        left: "-200000px",
        top: "0",
        width: `${a4Width}px`,
        background: "#ffffff",
        zIndex: "-1",
      });
      document.body.appendChild(host);

      const clone = source.cloneNode(true) as HTMLDivElement;
      Object.assign(clone.style, {
        width: `${a4Width}px`,
        maxWidth: "none",
        transform: "none",
        margin: "0",
        background: "#ffffff",
      });
      host.appendChild(clone);

      let canvas: HTMLCanvasElement;
      try {
        canvas = await html2canvas(clone, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          windowWidth: a4Width,
          scrollX: 0,
          scrollY: 0,
        });
      } finally {
        if (document.body.contains(host)) document.body.removeChild(host);
      }

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 0;
      const imgW = pageW - margin * 2;
      const imgH = (canvas.height * imgW) / canvas.width;

      let remaining = imgH;
      let yPos = margin;
      pdf.addImage(imgData, "PNG", margin, yPos, imgW, imgH);
      remaining -= pageH - margin * 2;

      while (remaining > 0) {
        yPos = margin + (remaining - imgH);
        pdf.addPage();
        pdf.addImage(imgData, "PNG", margin, yPos, imgW, imgH);
        remaining -= pageH - margin * 2;
      }

      const safeName = (personal.fullName || "job-assist-cv")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      pdf.save(`${safeName}-template-${selectedTemplate}.pdf`);

      toast({ title: "CV downloaded!", description: "Your PDF has been saved." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not generate PDF. Please try again.";
      toast({ title: "Download failed", description: msg, variant: "destructive" });
    } finally {
      setDownloading(false);
    }
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <SEO title="Job Assist – Smart Apply" />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* Back nav */}
          <Button asChild variant="ghost" size="sm" className="mb-6 text-gray-600 hover:text-gray-900">
            <Link to="/smart-apply/dashboard" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Wand2 className="h-7 w-7" style={{ color: DEEP_BLUE }} />
              Job Assist
              <Sparkles className="h-5 w-5 text-pink-500" />
            </h1>
            <p className="mt-1 text-gray-600 max-w-2xl">
              Upload a job specification or paste the job description. Our AI will generate an
              ATS-friendly CV tailored to the role – ready to download in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ── LEFT PANEL: input ──────────────────────────────────────── */}
            <div className="flex flex-col gap-6">

              {/* File upload drop zone */}
              <Card className="border border-gray-200 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-gray-800">Upload Job Specification</CardTitle>
                  <CardDescription className="text-gray-500 text-sm">
                    PDF, DOCX, TXT, PNG, JPG, JPEG, or WEBP &nbsp;•&nbsp; max 10 MB
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors
                      ${isDragging
                        ? "border-blue-400 bg-blue-50"
                        : uploadedFile
                        ? "border-green-400 bg-green-50"
                        : "border-gray-200 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
                      }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED_TYPES}
                      className="sr-only"
                      onChange={handleFileChange}
                    />

                    {uploadedFile ? (
                      <>
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-800 break-all">{uploadedFile.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {(uploadedFile.size / 1024).toFixed(0)} KB
                          </p>
                        </div>
                        <button
                          type="button"
                          className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
                          onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                          title="Remove file"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400" />
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-700">
                            Drag & drop or <span className="underline">browse</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">PDF, DOCX, TXT, PNG, JPG, JPEG, WEBP</p>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-gray-800">Upload Profile Image</CardTitle>
                  <CardDescription className="text-gray-500 text-sm">
                    Optional for CV assist &nbsp;•&nbsp; PNG, JPG, JPEG, WEBP &nbsp;•&nbsp; max 5 MB
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <Upload className="h-4 w-4" />
                      {personal.profilePictureUrl ? "Change image" : "Upload image"}
                    </button>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept={ACCEPTED_IMAGE_TYPES}
                      className="sr-only"
                      onChange={handleImageFileChange}
                    />
                    {personal.profilePictureUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setPersonal((prev) => ({
                            ...prev,
                            profilePictureUrl: undefined,
                            showProfilePictureOnCv: false,
                          }));
                          setGeneratedData(null);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-red-600 hover:bg-red-50"
                      >
                        <X className="h-3.5 w-3.5" />
                        Remove
                      </button>
                    )}
                  </div>
                  {personal.profilePictureUrl && (
                    <div className="mt-3 flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 p-2.5">
                      <img
                        src={personal.profilePictureUrl}
                        alt="Profile"
                        className="h-12 w-12 rounded-full object-cover border border-gray-200"
                      />
                      <p className="text-xs text-gray-600">Image is ready and will be used in the generated CV preview.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* OR divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Paste text area */}
              <Card className="border border-gray-200 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-gray-800">Paste Job Description</CardTitle>
                  <CardDescription className="text-gray-500 text-sm">
                    Copy and paste the full job ad text here.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="job-text" className="sr-only">Job description</Label>
                  <Textarea
                    id="job-text"
                    rows={10}
                    placeholder="Paste the job description here…"
                    value={jobText}
                    onChange={(e) => {
                      setJobText(e.target.value);
                      if (e.target.value) setUploadedFile(null);
                      setGeneratedData(null);
                      setError(null);
                    }}
                    className="resize-none text-sm text-gray-800 placeholder:text-gray-400 bg-white"
                  />
                </CardContent>
              </Card>

              {/* Template picker — full visual grid of all 20 templates */}
              <Card className="border border-gray-200 bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-gray-800">Choose a Template</CardTitle>
                  <CardDescription className="text-gray-500 text-sm">
                    Template 1 free • Templates 2–5 free (1 page) • Templates 6–20 paid (ZAR 10/day)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {ALL_TEMPLATES.map((id) => (
                      <TemplateThumbnail
                        key={id}
                        templateId={id}
                        data={generatedData ?? undefined}
                        selected={selectedTemplate === id}
                        onClick={() => setSelectedTemplate(id)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Error banner */}
              {error && (
                <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Generation failed</p>
                    <p className="text-sm text-red-700 mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              {/* Generate button */}
              <Button
                onClick={handleGenerate}
                disabled={generating || !canGenerate}
                className="w-full text-white font-semibold py-3 text-base gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: DEEP_BLUE }}
              >
                {generating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating your CV…
                  </>
                ) : generatedData ? (
                  <>
                    <RefreshCw className="h-5 w-5" />
                    Regenerate CV
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate CV
                  </>
                )}
              </Button>
            </div>

            {/* ── RIGHT PANEL: CV preview ────────────────────────────────── */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <FileText className="h-4 w-4" style={{ color: DEEP_BLUE }} />
                  CV Preview
                  {generatedData && (
                    <span className="ml-1 inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="h-3 w-3" />
                      AI Generated
                    </span>
                  )}
                </h2>

                {/* Download button (shown once CV is generated) */}
                {generatedData && (
                  <Button
                    onClick={handleDownload}
                    disabled={downloading}
                    size="sm"
                    className="text-white gap-1.5 text-sm"
                    style={{ backgroundColor: DEEP_BLUE }}
                  >
                    {downloading ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Downloading…</>
                    ) : (
                      <><Download className="h-4 w-4" /> Download PDF</>
                    )}
                  </Button>
                )}
              </div>

              {/* Preview card */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-md overflow-hidden">
                {generating ? (
                  /* Loading skeleton */
                  <div className="flex flex-col items-center justify-center gap-4 py-24 px-8 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Analysing job description…</p>
                      <p className="text-xs text-gray-400 mt-1">This usually takes 5–15 seconds</p>
                    </div>
                  </div>
                ) : generatedData ? (
                  /* Actual CV preview – ScaledCvPreview owns the capture ref */
                  <div className="bg-white">
                    <ScaledCvPreview templateId={selectedTemplate} data={generatedData} captureRef={previewRef} />
                  </div>
                ) : (
                  /* Empty state */
                  <div className="flex flex-col items-center justify-center gap-4 py-24 px-8 text-center">
                    <Wand2 className="h-10 w-10 text-gray-300" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Your AI-generated CV will appear here</p>
                      <p className="text-xs text-gray-400 mt-1">Upload a job spec or paste a description, then click Generate CV</p>
                    </div>
                  </div>
                )}
              </div>

              {/* After generation: helper actions */}
              {generatedData && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                  <p className="font-medium text-gray-800 mb-1">Next steps</p>
                  <ul className="space-y-1 list-disc list-inside text-gray-600">
                    <li>Review the generated content above and ensure it reflects your real experience.</li>
                    <li>
                      Want to personalise it further?{" "}
                      <button
                        type="button"
                        className="underline text-blue-600 hover:text-blue-800"
                        onClick={() =>
                          navigate(`/smart-apply/cv-builder/edit/${selectedTemplate}`, {
                            state: { jobAssistData: generatedData },
                          })
                        }
                      >
                        Open in CV Builder <ExternalLink className="inline h-3 w-3" />
                      </button>{" "}
                      to edit every field.
                    </li>
                    <li>Click <strong>Download PDF</strong> to save the ready-to-send CV.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SmartApplyJobAssist;
