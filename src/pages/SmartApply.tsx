import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import SEO from "@/components/SEO";
import Layout from "@/components/Layout";
import Footer from "@/components/Footer";
import {
  Send,
  Sparkles,
  Mail,
  Pencil,
  Trash2,
  Loader2,
  Plus,
  FileText,
  Eye,
  EyeOff,
  ChevronRight,
  User,
  UserCheck,
  Building2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { smartApplyAPI } from "@/services/api";

interface GeneratedEmail {
  id: string;
  companyEmail: string;
  subject: string;
  body: string;
  isExpanded: boolean;
}

interface ApplicationRow {
  id: string;
  email: string;
  topic: string;
}

interface UserDetails {
  name: string;
  surname: string;
  contactNumber: string;
  email: string;
}

const inputClass =
  "h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg transition-all duration-300 bg-gray-50 focus:bg-white text-gray-900 text-sm";

// Generate email body using profile (overview, keySkills) or CV text when provided
const generateEmailForRow = (
  companyEmail: string,
  topic: string,
  index: number,
  user?: UserDetails,
  cvText?: string,
  cvExtract?: CvExtract | null
): Omit<GeneratedEmail, "isExpanded"> => {
  const baseSubjects = [
    `Application: ${topic} Position`,
    `Interest in ${topic} Opportunity`,
    `${topic} - Application for Consideration`,
  ];
  const baseBodies = [
    `Dear Hiring Manager,\n\nI am writing to express my interest in ${topic} opportunities at your company. I believe my experience and skills align well with what you are looking for.\n\nI would welcome the opportunity to discuss how I can contribute to your team. Please find my application attached for your consideration.\n\nThank you for your time.\n\nBest regards`,
    `Hello,\n\nI hope this email finds you well. I am reaching out regarding ${topic} positions. I am eager to bring my expertise to your organization and contribute to your continued success.\n\nI have attached my resume and would appreciate the opportunity to discuss potential openings. Thank you for considering my application.\n\nSincerely`,
    `Dear Recruitment Team,\n\nI am excited to apply for ${topic} roles within your organization. My background and enthusiasm for this field make me a strong candidate for consideration.\n\nI would be grateful for the opportunity to speak with you about how I can add value to your team. Please do not hesitate to contact me at your convenience.\n\nKind regards`,
  ];

  let body = baseBodies[index % baseBodies.length];

  const snippetFromProfile = cvExtract?.overview?.trim() || cvExtract?.keySkills?.trim();
  const snippetFromCv = cvText?.trim().replace(/\s+/g, " ").slice(0, 280);
  const snippet = (snippetFromProfile || snippetFromCv || "").slice(0, 280);
  if (snippet) {
    const label = cvExtract?.overview ? "Summary" : cvExtract?.keySkills ? "Key skills" : "Relevant experience";
    body = body.replace(
      /\n\n(Best regards|Sincerely|Kind regards)/,
      `\n\n${label}: ${snippet}${snippet.length === 280 ? "…" : ""}\n\n$1`
    );
  }

  if (user && (user.name.trim() || user.surname.trim() || user.email.trim() || user.contactNumber.trim())) {
    const parts = [user.name.trim(), user.surname.trim()].filter(Boolean);
    const signatureName = parts.length ? parts.join(" ") : "";
    const lines = signatureName ? [signatureName] : [];
    if (user.email.trim()) lines.push(user.email.trim());
    if (user.contactNumber.trim()) lines.push(user.contactNumber.trim());
    if (lines.length) body += "\n\n" + lines.join("\n");
  }

  return {
    id: `email-${Date.now()}-${index}`,
    companyEmail: companyEmail.trim().toLowerCase(),
    subject: baseSubjects[index % baseSubjects.length],
    body,
  };
};

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

/** Categorize candidate from CV text: Grade 12 / matric only → general; else → professional */
function categorizeFromCvText(cvText: string): "general" | "professional" {
  if (!cvText || !cvText.trim()) return "professional";
  const text = cvText.toLowerCase();
  const hasProfessional = /\b(bachelor|bsc|bcom|beng|btech|degree|diploma|certificate|postgraduate|masters|mba|phd|honours|nqf\s*[5678]|tertiary|university|college\s*(of|degree)|certified|qualification|graduated|b\.?tech|b\.?sc|b\.?com|ndip|national\s+diploma)\b/i.test(text);
  if (hasProfessional) return "professional";
  const hasGrade12 = /\b(grade\s*12|matric|nqf\s*4|high\s*school|secondary\s*school|national\s+senior\s+certificate)\b/i.test(text);
  if (hasGrade12) return "general";
  return "professional";
}

export interface CvExtract {
  overview: string;
  workExperience: string;
  education: string;
  certifications: string;
  keySkills: string;
}

const SECTION_HEADINGS = [
  { key: "overview" as const, patterns: [/^(summary|profile|about|objective|overview|career\s+summary)/im, /^[\d.]*\s*(summary|profile|about|objective)/im] },
  { key: "workExperience" as const, patterns: [/^(work\s+experience|employment|experience|professional\s+experience|career)/im, /^[\d.]*\s*(work\s+experience|employment|experience)/im] },
  { key: "education" as const, patterns: [/^(education|qualifications|academic|academics)/im, /^[\d.]*\s*(education|qualifications)/im] },
  { key: "certifications" as const, patterns: [/^(certifications|certificates|licenses|licences|professional\s+certifications)/im, /^[\d.]*\s*(certifications|certificates)/im] },
  { key: "keySkills" as const, patterns: [/^(key\s+skills|skills|competencies|core\s+skills|technical\s+skills)/im, /^[\d.]*\s*(skills|key\s+skills)/im] },
];

function extractCvSections(cvText: string): CvExtract {
  const out: CvExtract = { overview: "", workExperience: "", education: "", certifications: "", keySkills: "" };
  if (!cvText || !cvText.trim()) return out;
  const lines = cvText.split(/\r?\n/);
  let current: keyof CvExtract | null = null;
  const buffers: Record<keyof CvExtract, string[]> = { overview: [], workExperience: [], education: [], certifications: [], keySkills: [] };
  for (const line of lines) {
    const trimmed = line.trim();
    let matched = false;
    for (const { key, patterns } of SECTION_HEADINGS) {
      if (patterns.some((p) => p.test(trimmed))) {
        current = key;
        matched = true;
        break;
      }
    }
    if (matched) continue;
    if (current && trimmed) buffers[current].push(trimmed);
  }
  const firstParagraph = lines.map((l) => l.trim()).filter(Boolean).slice(0, 8).join(" ");
  if (!out.overview && firstParagraph.length > 20) out.overview = firstParagraph.slice(0, 500);
  for (const k of Object.keys(out) as (keyof CvExtract)[]) {
    const text = buffers[k].join("\n").trim();
    if (text) out[k] = text;
  }
  return out;
}

const SmartApply = () => {
  const location = useLocation();
  const [hasToken, setHasToken] = useState(false);
  const isApplyFlow = location.pathname === "/smart-apply/apply";
  const [authView, setAuthView] = useState<"login" | "signup">("login");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    name: "",
    surname: "",
    contactNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [userDetails, setUserDetails] = useState<UserDetails>({
    name: "",
    surname: "",
    contactNumber: "",
    email: "",
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvFileName, setCvFileName] = useState("");
  const [cvText, setCvText] = useState("");
  const [rows, setRows] = useState<ApplicationRow[]>([
    { id: crypto.randomUUID(), email: "", topic: "" },
  ]);
  const [emails, setEmails] = useState<GeneratedEmail[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState(1);
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [sentEmails, setSentEmails] = useState<GeneratedEmail[]>([]);
  const [failedEmails, setFailedEmails] = useState<{ email: GeneratedEmail; error: string }[]>([]);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    email: GeneratedEmail | null;
  }>({ open: false, email: null });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [candidateCategory, setCandidateCategory] = useState<"general" | "professional" | null>(null);
  const [cvExtract, setCvExtract] = useState<CvExtract>({ overview: "", workExperience: "", education: "", certifications: "", keySkills: "" });
  const [activeProfileSection, setActiveProfileSection] = useState<keyof CvExtract>("overview");
  const [savingProfile, setSavingProfile] = useState(false);
  const { toast } = useToast();

  // Smart Apply uses its own token (smart_apply_token) – independent from learner auth
  const SMART_APPLY_TOKEN_KEY = "smart_apply_token";
  useEffect(() => {
    setHasToken(!!localStorage.getItem(SMART_APPLY_TOKEN_KEY));
  }, []);

  // Pre-fill user details from Smart Apply profile when logged in (main flow)
  useEffect(() => {
    if (!hasToken || isApplyFlow) return;
    smartApplyAPI.getProfile().then((res: { profile?: { fullName?: string; email?: string; phone?: string } }) => {
      const p = res?.profile;
      if (!p) return;
      const parts = (p.fullName || "").trim().split(/\s+/);
      setUserDetails({
        name: parts[0] || "",
        surname: parts.slice(1).join(" ") || "",
        email: p.email || "",
        contactNumber: p.phone || "",
      });
    }).catch(() => {});
  }, [hasToken, isApplyFlow]);

  // "Apply to multiple emails" flow: load profile and jump to step 3 (Companies)
  useEffect(() => {
    if (!hasToken || !isApplyFlow) return;
    smartApplyAPI
      .getProfile()
      .then((res: { profile?: { fullName?: string; email?: string; phone?: string; category?: string; overview?: string; workExperience?: string; education?: string; certifications?: string; keySkills?: string } }) => {
        const p = res?.profile;
        if (!p) return;
        const parts = (p.fullName || "").trim().split(/\s+/);
        setUserDetails({
          name: parts[0] || "",
          surname: parts.slice(1).join(" ") || "",
          email: p.email || "",
          contactNumber: p.phone || "",
        });
        if (p.overview || p.workExperience || p.education || p.certifications || p.keySkills) {
          setCvExtract({
            overview: p.overview || "",
            workExperience: p.workExperience || "",
            education: p.education || "",
            certifications: p.certifications || "",
            keySkills: p.keySkills || "",
          });
        }
        if (p.category === "general" || p.category === "professional") setCandidateCategory(p.category);
        setStep(3);
      })
      .catch(() => {});
  }, [hasToken, isApplyFlow]);

  const handleAuthLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      await smartApplyAPI.login(loginForm.email, loginForm.password);
      setHasToken(true);
      toast({ title: "Signed in", description: "Welcome back to Smart Apply." });
    } catch (err: any) {
      setAuthError(err?.message || "Invalid email or password.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (signupForm.password.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      return;
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }
    setAuthLoading(true);
    try {
      const fullName = [signupForm.name, signupForm.surname].filter(Boolean).join(" ").trim() || signupForm.email;
      await smartApplyAPI.register({
        fullName,
        email: signupForm.email.trim(),
        password: signupForm.password,
        phone: signupForm.contactNumber.trim() || undefined,
      });
      setHasToken(true);
      setUserDetails({
        name: signupForm.name,
        surname: signupForm.surname,
        contactNumber: signupForm.contactNumber,
        email: signupForm.email,
      });
      toast({ title: "Account created", description: "You can log in next time with your email and password." });
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("already exists")) {
        setAuthError("An account with this email already exists. Sign in instead.");
      } else {
        setAuthError(msg || "Could not create account. Please try again.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  // Pre-fill user details when logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setProfileLoaded(true);
      return;
    }
    authAPI.getCurrentUser()
      .then((res: { user?: { fullName?: string; email?: string; phone?: string } }) => {
        const user = res?.user;
        if (!user) return;
        const parts = (user.fullName || "").trim().split(/\s+/);
        const name = parts[0] || "";
        const surname = parts.slice(1).join(" ") || "";
        setUserDetails({
          name,
          surname,
          email: user.email || "",
          contactNumber: user.phone || "",
        });
        setIsLoggedIn(true);
      })
      .catch(() => { /* invalid token or network */ })
      .finally(() => setProfileLoaded(true));
  }, []);

  const handleStep1Next = () => {
    if (!cvFile) {
      toast({ title: "CV required", description: "Please upload your CV.", variant: "destructive" });
      return;
    }
    const category = categorizeFromCvText(cvText);
    setCandidateCategory(category);
    setCvExtract(extractCvSections(cvText));
    setActiveProfileSection("overview");
    setStep(2);
  };

  const handleProfileContinue = async () => {
    if (!candidateCategory) return;
    setSavingProfile(true);
    try {
      await smartApplyAPI.saveProfile({
        category: candidateCategory,
        overview: cvExtract.overview || null,
        workExperience: cvExtract.workExperience || null,
        education: cvExtract.education || null,
        certifications: cvExtract.certifications || null,
        keySkills: cvExtract.keySkills || null,
      });
      toast({ title: "Profile saved", description: "Recruiters can now find you. Continue to apply to multiple emails." });
      setStep(3);
    } catch (err: any) {
      toast({ title: "Could not save profile", description: err?.message || "Please try again.", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: crypto.randomUUID(), email: "", topic: "" },
    ]);
  };

  const removeRow = (id: string) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  };

  const updateRow = (id: string, field: "email" | "topic", value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleCvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCvFile(file);
    setCvFileName(file.name);
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "txt") {
      const reader = new FileReader();
      reader.onload = () => {
        setCvText(String(reader.result ?? ""));
        toast({ title: "CV loaded", description: "AI will use your CV text to tailor the emails." });
      };
      reader.readAsText(file);
    } else if (ext === "pdf") {
      setCvText("");
    }
    e.target.value = "";
  };

  const handleGenerate = () => {
    if (!cvFile) {
      toast({
        title: "CV required",
        description: "Please upload your CV. It will be attached to each email sent.",
        variant: "destructive",
      });
      return;
    }

    const validRows = rows.filter(
      (r) => r.topic.trim() && isValidEmail(r.email)
    );

    if (validRows.length === 0) {
      toast({
        title: "Valid rows required",
        description:
          "Please add at least one row with a valid email and topic/job.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      const cvContent = cvText.trim() || undefined;
      const generated = validRows.map((r, i) =>
        generateEmailForRow(r.email, r.topic.trim(), i, userDetails, cvContent, cvExtract)
      );
      setEmails(generated.map((e, i) => ({ ...e, isExpanded: i === 0 })));
      setIsGenerating(false);
      setStep(4);
      toast({
        title: "Emails generated",
        description: `Created ${generated.length} email(s) for your review.`,
      });
    }, 1200);
  };

  const toggleExpand = (id: string) => {
    setEmails((prev) => {
      const clicked = prev.find((e) => e.id === id);
      if (!clicked) return prev;
      // If opening: close others, open this. If closing: just close this.
      return prev.map((e) => ({
        ...e,
        isExpanded: e.id === id ? !e.isExpanded : false,
      }));
    });
  };

  const updateEmail = (id: string, updates: Partial<GeneratedEmail>) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  const openEditDialog = (email: GeneratedEmail) => {
    setEditDialog({ open: true, email: { ...email } });
  };

  const saveEdit = () => {
    if (editDialog.email) {
      updateEmail(editDialog.email.id, {
        companyEmail: editDialog.email.companyEmail,
        subject: editDialog.email.subject,
        body: editDialog.email.body,
      });
      setEditDialog({ open: false, email: null });
      toast({ title: "Email updated", description: "Your changes have been saved." });
    }
  };

  const removeEmail = (id: string) => {
    setEmails((prev) => prev.filter((e) => e.id !== id));
    toast({ title: "Email removed", description: "The email has been removed from the list." });
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.includes(",") ? result.split(",")[1] : result;
        resolve(base64 ?? "");
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });

  const handleSendAll = async () => {
    if (emails.length === 0) {
      toast({ title: "No emails to send", description: "Generate emails first.", variant: "destructive" });
      return;
    }
    if (!userDetails.email?.trim()) {
      toast({ title: "Email required", description: "Add your email in Step 1 so companies can reply to you.", variant: "destructive" });
      return;
    }
    if (!cvFile) {
      toast({ title: "CV required", description: "CV is attached to each email. Please upload it in Step 1.", variant: "destructive" });
      return;
    }
    setStep(5);
    setIsSending(true);
    setSendProgress(0);
    setSentEmails([]);
    setFailedEmails([]);

    try {
      const cvBase64 = await fileToBase64(cvFile);
      const userName = [userDetails.name, userDetails.surname].filter(Boolean).join(" ").trim() || undefined;

      const payload = {
        emails: emails.map((e) => ({ to: e.companyEmail, subject: e.subject, body: e.body })),
        userEmail: userDetails.email.trim(),
        userName,
        cvBase64,
        cvFileName: cvFileName || cvFile.name,
      };

      setSendProgress(50);
      const result = await smartApplyAPI.sendEmails(payload);
      setSendProgress(100);

      const sentList = (result.sent || []).map((s: { to: string; subject: string }) => {
        const match = emails.find((e) => e.companyEmail === s.to);
        return match ?? { id: s.to, companyEmail: s.to, subject: s.subject, body: "", isExpanded: false };
      });
      const failedList = (result.failed || []).map((f: { to: string; error: string }) => {
        const match = emails.find((e) => e.companyEmail === f.to);
        return { email: match ?? { id: f.to, companyEmail: f.to, subject: "", body: "", isExpanded: false }, error: f.error };
      });

      setSentEmails(sentList);
      setFailedEmails(failedList);
      toast({
        title: "Send complete",
        description: `${sentList.length} sent, ${failedList.length} failed.`,
        variant: failedList.length > 0 ? "destructive" : "default",
      });
    } catch (err: any) {
      const msg = err?.message || "Failed to send emails.";
      setFailedEmails(emails.map((e) => ({ email: e, error: msg })));
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  // First screen: sign in / sign up (same layout as Learner Portal)
  if (!hasToken) {
    return (
      <div className="min-h-screen flex overflow-hidden">
        <SEO page="smartApply" />
        {/* Left – Branding */}
        <div className="hidden lg:flex lg:w-1/2 fixed left-0 top-0 h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 items-center justify-center p-12">
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="w-32 h-32 border-4 border-white rounded-full flex items-center justify-center">
                <Sparkles className="w-16 h-16 text-white" />
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-wider text-gray-400 font-semibold">Smart Apply</p>
              <h1 className="text-5xl font-bold text-white">Welcome Back</h1>
              <p className="text-xl text-gray-300">Apply to many companies at once</p>
            </div>
          </div>
        </div>
        {/* Right – Form */}
        <div className="w-full lg:w-1/2 lg:ml-[50%] flex items-center justify-center bg-white p-8 overflow-y-auto h-screen">
          <div className="w-full max-w-md space-y-8">
            <div className="lg:hidden text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 border-4 border-blue-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            </div>
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {authView === "login" ? "Sign in to your account" : "Create your account"}
              </h2>

              {authView === "login" ? (
                <>
                  <form className="space-y-4" onSubmit={handleAuthLogin}>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm((f) => ({ ...f, email: e.target.value }))}
                      required
                      className="h-12 text-gray-900 placeholder:text-gray-500 bg-white"
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm((f) => ({ ...f, password: e.target.value }))}
                      required
                      className="h-12 text-gray-900 placeholder:text-gray-500 bg-white"
                    />
                    {authError && <p className="text-sm text-red-600">{authError}</p>}
                    <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700" disabled={authLoading}>
                      {authLoading ? "Signing in..." : "Sign in"}
                    </Button>
                  </form>
                  <p className="text-sm text-center text-gray-600">
                    Don&apos;t have an account?{" "}
                    <button type="button" onClick={() => { setAuthView("signup"); setAuthError(""); }} className="text-blue-600 hover:underline font-medium">
                      Sign up
                    </button>
                  </p>
                </>
              ) : (
                <>
                  <form className="space-y-4" onSubmit={handleAuthSignup}>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="Name"
                        value={signupForm.name}
                        onChange={(e) => setSignupForm((f) => ({ ...f, name: e.target.value }))}
                        className="h-12 text-gray-900 placeholder:text-gray-500 bg-white"
                      />
                      <Input
                        placeholder="Surname"
                        value={signupForm.surname}
                        onChange={(e) => setSignupForm((f) => ({ ...f, surname: e.target.value }))}
                        className="h-12 text-gray-900 placeholder:text-gray-500 bg-white"
                      />
                    </div>
                    <Input
                      type="tel"
                      placeholder="Contact number"
                      value={signupForm.contactNumber}
                      onChange={(e) => setSignupForm((f) => ({ ...f, contactNumber: e.target.value }))}
                      className="h-12 text-gray-900 placeholder:text-gray-500 bg-white"
                    />
                    <Input
                      type="email"
                      placeholder="Email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm((f) => ({ ...f, email: e.target.value }))}
                      required
                      className="h-12 text-gray-900 placeholder:text-gray-500 bg-white"
                    />
                    <Input
                      type="password"
                      placeholder="Password (min 6 characters)"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm((f) => ({ ...f, password: e.target.value }))}
                      required
                      className="h-12 text-gray-900 placeholder:text-gray-500 bg-white"
                    />
                    <Input
                      type="password"
                      placeholder="Confirm password"
                      value={signupForm.confirmPassword}
                      onChange={(e) => setSignupForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                      required
                      className="h-12 text-gray-900 placeholder:text-gray-500 bg-white"
                    />
                    {authError && <p className="text-sm text-red-600">{authError}</p>}
                    <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700" disabled={authLoading}>
                      {authLoading ? "Creating account..." : "Sign up"}
                    </Button>
                  </form>
                  <p className="text-xs text-center text-gray-500">
                    By signing up, you agree to the{" "}
                    <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
                    {" "}and{" "}
                    <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
                    , including Cookie Use.
                  </p>
                  <p className="text-sm text-center text-gray-600">
                    Already have an account?{" "}
                    <button type="button" onClick={() => { setAuthView("login"); setAuthError(""); }} className="text-blue-600 hover:underline font-medium">
                      Sign in
                    </button>
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <SEO page="smartApply" />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden py-16">
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Smart Apply
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Send applications to multiple companies effortlessly. Add each company's
            email and the position or topic, and let AI craft tailored subject
            lines and personalized email content. Review and customize each email
            before sending to ensure a professional touch.
          </p>
        </div>
      </div>

      {/* Body - whole section white */}
      <div className="bg-white min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Card className="border-0 shadow-xl bg-[#f5f5f5] text-gray-900">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  Setup your bulk application
                </CardTitle>
                <CardDescription className="text-gray-800 mt-1">
                  {step === 1 && "Upload your CV"}
                  {step === 2 && "Your profile"}
                  {step === 3 && "Companies to apply to"}
                  {step === 4 && "Review generated emails"}
                  {step === 5 && "Sending results"}
                </CardDescription>
              </div>
              {/* Step indicator */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${step >= 1 ? "bg-indigo-100 text-indigo-700" : "bg-gray-200 text-gray-500"}`}>
                  <User className="h-4 w-4" /> 1
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${step >= 2 ? "bg-indigo-100 text-indigo-700" : "bg-gray-200 text-gray-500"}`}>
                  <UserCheck className="h-4 w-4" /> 2
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${step >= 3 ? "bg-indigo-100 text-indigo-700" : "bg-gray-200 text-gray-500"}`}>
                  <Building2 className="h-4 w-4" /> 3
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${step >= 4 ? "bg-indigo-100 text-indigo-700" : "bg-gray-200 text-gray-500"}`}>
                  <Eye className="h-4 w-4" /> 4
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${step >= 5 ? "bg-indigo-100 text-indigo-700" : "bg-gray-200 text-gray-500"}`}>
                  <Send className="h-4 w-4" /> 5
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Upload your CV (first screen after sign in / sign up) */}
            {step === 1 && (
            <div className="space-y-6">
              <p className="text-sm text-gray-600">
                Applying as: <span className="font-medium text-gray-900">{[userDetails.name, userDetails.surname].filter(Boolean).join(" ") || "—"}</span>
                {userDetails.email && <span className="text-gray-500"> ({userDetails.email})</span>}
              </p>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Upload your CV <span className="text-red-600">*</span>
                </h3>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Your CV will be attached to each application email.</Label>
                  <div className="flex flex-wrap items-center gap-3">
                    <Input
                      type="file"
                      accept=".pdf,.txt"
                      onChange={handleCvFileChange}
                      className={`${inputClass} max-w-xs file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100`}
                    />
                    {cvFileName && (
                      <span className="text-sm text-gray-600">
                        {cvFileName}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-1 h-6 px-1 text-red-600"
                          onClick={() => {
                            setCvFile(null);
                            setCvFileName("");
                            setCvText("");
                          }}
                        >
                          Remove
                        </Button>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF or .txt. .txt is used for AI tailoring; the file is attached to each email.
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleStep1Next} disabled={!cvFile} className="bg-indigo-600 hover:bg-indigo-700">
                  Next: Your profile <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
            )}

            {/* Step 2: Your profile (CV extract: Overview, Work Experience, Education, Certifications, Key Skills) */}
            {step === 2 && candidateCategory && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-gray-900">Your profile (extracted from CV)</h3>
              <p className="text-gray-600 text-sm">
                You’re categorized as a <strong>{candidateCategory === "general" ? "General" : "Professional"}</strong> candidate. Review the sections below—recruiters can see this.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <nav className="space-y-1 shrink-0">
                  {(["overview", "workExperience", "education", "certifications", "keySkills"] as const).map((key) => {
                    const label = key === "workExperience" ? "Work Experience" : key === "keySkills" ? "Key Skills" : key.charAt(0).toUpperCase() + key.slice(1);
                    const isActive = activeProfileSection === key;
                    const hasContent = !!cvExtract[key]?.trim();
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setActiveProfileSection(key)}
                        className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive ? "bg-[#F5F6FA] text-[#1A204C]" : "text-[#6D747F] hover:bg-gray-100"
                        } ${hasContent ? "" : "opacity-70"}`}
                      >
                        <span className="w-1 h-4 rounded bg-current shrink-0" />
                        {label}
                      </button>
                    );
                  })}
                </nav>
                <div className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-gray-50/50 p-4 min-h-[120px]">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {cvExtract[activeProfileSection]?.trim() || "No content extracted for this section. You can add it later in your profile."}
                  </p>
                </div>
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={handleProfileContinue} disabled={savingProfile} className="bg-indigo-600 hover:bg-indigo-700">
                  {savingProfile ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : <>Continue to applications <ChevronRight className="ml-2 h-4 w-4" /></>}
                </Button>
              </div>
            </div>
            )}

            {/* Step 3: Companies applying to */}
            {step === 3 && (
            <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Step 3: Companies applying to</h3>
              <div className="grid grid-cols-[1fr_1fr_auto] gap-4 items-end text-sm font-medium text-gray-600">
                <Label>Company email</Label>
                <Label>Topic / Job applying for</Label>
                <span className="w-10" />
              </div>
              {rows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[1fr_1fr_auto] gap-4 items-center"
                >
                  <Input
                    type="email"
                    placeholder="hr@company.com"
                    value={row.email}
                    onChange={(e) => updateRow(row.id, "email", e.target.value)}
                    className={`${inputClass} font-mono`}
                  />
                  <Input
                    placeholder="e.g. software developer, marketing intern"
                    value={row.topic}
                    onChange={(e) => updateRow(row.id, "topic", e.target.value)}
                    className={inputClass}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={addRow}
                className="w-full sm:w-auto border-dashed"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add row
              </Button>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={handleGenerate} disabled={isGenerating} className="bg-indigo-600 hover:bg-indigo-700">
                {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate emails</>}
              </Button>
            </div>
            </div>
            )}

            {/* Step 4: View generated emails */}
            {step === 4 && emails.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-gray-900">Step 4: View generated emails</h3>
            <div className="flex items-center justify-between">
              <p className="text-gray-600">Review and edit your {emails.length} generated email{emails.length !== 1 ? "s" : ""}.</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                <Button onClick={handleSendAll} className="bg-indigo-600 hover:bg-indigo-700">
                  <Send className="mr-2 h-4 w-4" />
                  Send all
                </Button>
              </div>
            </div>

            {/* First-time tip */}
              {!localStorage.getItem("smartApplyEmailsViewed") && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-indigo-50 text-indigo-800 text-sm">
                  <Eye className="h-4 w-4 shrink-0" />
                  <span>Tip: Click on an email card or the eye icon to view the full message.</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto shrink-0 text-indigo-600"
                    onClick={() => localStorage.setItem("smartApplyEmailsViewed", "true")}
                  >
                    Got it
                  </Button>
                </div>
              )}
            <div className="space-y-4">
              {emails.map((email) => (
                <Card key={email.id} className="overflow-hidden border border-gray-200 bg-white/80 shadow-sm text-gray-900">
                  <div
                    className="flex items-center justify-between p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50/50 transition-colors"
                    onClick={() => toggleExpand(email.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Mail className="h-5 w-5 text-indigo-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">
                          {email.companyEmail}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {email.subject}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-600 hover:text-indigo-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(email.id);
                        }}
                        title={email.isExpanded ? "Hide message" : "View message"}
                        aria-label={email.isExpanded ? "Hide message" : "View message"}
                      >
                        {email.isExpanded ? (
                          <EyeOff className="h-4 w-4" strokeWidth={2} />
                        ) : (
                          <Eye className="h-4 w-4" strokeWidth={2} />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(email);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeEmail(email.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {email.isExpanded && (
                    <CardContent className="p-4 pt-4 bg-gray-50/50">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500 font-medium">Message</Label>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {email.body}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(email)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit email
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
            <div className="flex justify-between pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
              <Button onClick={handleSendAll} className="bg-indigo-600 hover:bg-indigo-700">
                <Send className="mr-2 h-4 w-4" />
                Send all
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Emails will be sent from your email ({userDetails.email || "add in Step 1"}) so companies can reply directly to you.
            </p>
          </div>
            )}

            {/* Step 5: Sending results */}
            {step === 5 && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-gray-900">Step 5: Sending results</h3>
              {isSending ? (
                <div className="space-y-4">
                  <p className="text-gray-700">Sending emails from {userDetails.email}…</p>
                  <Progress value={sendProgress} className="h-3" />
                  <p className="text-sm text-gray-600">{sendProgress}%</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep(4)}>Back to emails</Button>
                    <Button onClick={() => { setStep(1); setEmails([]); setSentEmails([]); setFailedEmails([]); }} className="bg-indigo-600 hover:bg-indigo-700">
                      Start over
                    </Button>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-3">
                      <h4 className="flex items-center gap-2 font-medium text-green-700">
                        <CheckCircle2 className="h-5 w-5" /> Sent ({sentEmails.length})
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {sentEmails.length === 0 ? (
                          <p className="text-sm text-gray-500">No emails sent yet.</p>
                        ) : (
                          sentEmails.map((e) => (
                            <div key={e.id} className="flex items-center gap-2 p-2 rounded bg-green-50 text-sm text-gray-900">
                              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                              <span className="truncate">{e.companyEmail}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="flex items-center gap-2 font-medium text-red-700">
                        <XCircle className="h-5 w-5" /> Failed ({failedEmails.length})
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {failedEmails.length === 0 ? (
                          <p className="text-sm text-gray-500">No failed emails.</p>
                        ) : (
                          failedEmails.map(({ email, error }) => (
                            <div key={email.id} className="p-2 rounded bg-red-50 text-sm text-gray-900">
                              <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                                <span className="truncate font-medium">{email.companyEmail}</span>
                              </div>
                              <p className="text-xs text-red-600 mt-1">{error}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            )}
          </CardContent>
        </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={editDialog.open}
        onOpenChange={(open) =>
          setEditDialog((prev) => ({ ...prev, open }))
        }
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View & edit email</DialogTitle>
            <DialogDescription>
              Modify the subject and body, then save. Changes apply only to this
              email.
            </DialogDescription>
          </DialogHeader>
          {editDialog.email && (
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>To (company email)</Label>
                <Input
                  value={editDialog.email.companyEmail}
                  onChange={(e) =>
                    setEditDialog((prev) =>
                      prev.email
                        ? {
                            ...prev,
                            email: {
                              ...prev.email!,
                              companyEmail: e.target.value,
                            },
                          }
                        : prev
                    )
                  }
                  className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg transition-all duration-300 bg-gray-50 focus:bg-white text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={editDialog.email.subject}
                  onChange={(e) =>
                    setEditDialog((prev) =>
                      prev.email
                        ? {
                            ...prev,
                            email: {
                              ...prev.email!,
                              subject: e.target.value,
                            },
                          }
                        : prev
                    )
                  }
                  className="h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg transition-all duration-300 bg-gray-50 focus:bg-white text-gray-900"
                />
              </div>
              <div className="space-y-2">
                <Label>Body</Label>
                <Textarea
                  value={editDialog.email.body}
                  onChange={(e) =>
                    setEditDialog((prev) =>
                      prev.email
                        ? {
                            ...prev,
                            email: {
                              ...prev.email!,
                              body: e.target.value,
                            },
                          }
                        : prev
                    )
                  }
                  rows={10}
                  className="border-2 border-gray-200 focus:border-blue-500 rounded-lg transition-all duration-300 bg-gray-50 focus:bg-white text-gray-900 font-mono text-sm"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditDialog({ open: false, email: null })}
                >
                  Cancel
                </Button>
                <Button onClick={saveEdit} className="bg-indigo-600 hover:bg-indigo-700">
                  Save changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </Layout>
  );
};

export default SmartApply;
