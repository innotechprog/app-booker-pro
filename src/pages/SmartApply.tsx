import { useState } from "react";
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

// Mock AI generation - uses CV text when provided to tailor the email (replace with real AI API when ready)
const generateEmailForRow = (
  companyEmail: string,
  topic: string,
  index: number,
  user?: UserDetails,
  cvText?: string
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

  // If AI has CV text, add a tailored line before the sign-off (mock: use first meaningful snippet; real AI would weave this in)
  if (cvText && cvText.trim()) {
    const snippet = cvText.trim().replace(/\s+/g, " ").slice(0, 280);
    if (snippet) {
      body = body.replace(
        /\n\n(Best regards|Sincerely|Kind regards)/,
        `\n\nRelevant experience: ${snippet}${snippet.length === 280 ? "…" : ""}\n\n$1`
      );
    }
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

const SmartApply = () => {
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
  const { toast } = useToast();

  const handleStep1Next = () => {
    if (!cvFile) {
      toast({ title: "CV required", description: "Please upload your CV.", variant: "destructive" });
      return;
    }
    setStep(2);
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
        generateEmailForRow(r.email, r.topic.trim(), i, userDetails, cvContent)
      );
      setEmails(generated.map((e, i) => ({ ...e, isExpanded: i === 0 })));
      setIsGenerating(false);
      setStep(3);
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
    setStep(4);
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
          <Card className="border-0 shadow-xl bg-[#f5f5f5]">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  Setup your bulk application
                </CardTitle>
                <CardDescription className="text-gray-800 mt-1">
                  {step === 1 && "Personal information"}
                  {step === 2 && "Companies to apply to"}
                  {step === 3 && "Review generated emails"}
                  {step === 4 && "Sending results"}
                </CardDescription>
              </div>
              {/* Step indicator */}
              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${step >= 1 ? "bg-indigo-100 text-indigo-700" : "bg-gray-200 text-gray-500"}`}>
                  <User className="h-4 w-4" /> 1
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${step >= 2 ? "bg-indigo-100 text-indigo-700" : "bg-gray-200 text-gray-500"}`}>
                  <Building2 className="h-4 w-4" /> 2
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${step >= 3 ? "bg-indigo-100 text-indigo-700" : "bg-gray-200 text-gray-500"}`}>
                  <Eye className="h-4 w-4" /> 3
                </span>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${step >= 4 ? "bg-indigo-100 text-indigo-700" : "bg-gray-200 text-gray-500"}`}>
                  <Send className="h-4 w-4" /> 4
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Personal information */}
            {step === 1 && (
            <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Step 1: Personal information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="user-name" className="text-gray-700 font-medium">Name</Label>
                  <Input
                    id="user-name"
                    placeholder="e.g. John"
                    value={userDetails.name}
                    onChange={(e) => setUserDetails((u) => ({ ...u, name: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-surname" className="text-gray-700 font-medium">Surname</Label>
                  <Input
                    id="user-surname"
                    placeholder="e.g. Doe"
                    value={userDetails.surname}
                    onChange={(e) => setUserDetails((u) => ({ ...u, surname: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-contact" className="text-gray-700 font-medium">Contact number</Label>
                  <Input
                    id="user-contact"
                    type="tel"
                    placeholder="e.g. 076 123 4567"
                    value={userDetails.contactNumber}
                    onChange={(e) => setUserDetails((u) => ({ ...u, contactNumber: e.target.value }))}
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-email" className="text-gray-700 font-medium">Email</Label>
                  <Input
                    id="user-email"
                    type="email"
                    placeholder="e.g. john@example.com"
                    value={userDetails.email}
                    onChange={(e) => setUserDetails((u) => ({ ...u, email: e.target.value }))}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* CV upload + summary for AI */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                CV <span className="text-red-600">*</span> (required – attached to emails)
              </h3>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Upload CV</Label>
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
                  Upload PDF or .txt. .txt is read for AI tailoring; CV file is attached to each email.
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleStep1Next} disabled={!cvFile} className="bg-indigo-600 hover:bg-indigo-700">
                Next: Companies <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            </div>
            )}

            {/* Step 2: Companies applying to */}
            {step === 2 && (
            <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Step 2: Companies applying to</h3>
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
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleGenerate} disabled={isGenerating} className="bg-indigo-600 hover:bg-indigo-700">
                {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate emails</>}
              </Button>
            </div>
            </div>
            )}

            {/* Step 3: View generated emails */}
            {step === 3 && emails.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-gray-900">Step 3: View generated emails</h3>
            <div className="flex items-center justify-between">
              <p className="text-gray-600">Review and edit your {emails.length} generated email{emails.length !== 1 ? "s" : ""}.</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
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
                <Card key={email.id} className="overflow-hidden border border-gray-200 bg-white/80 shadow-sm">
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
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
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

            {/* Step 4: Sending results */}
            {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-sm font-semibold text-gray-900">Step 4: Sending results</h3>
              {isSending ? (
                <div className="space-y-4">
                  <p className="text-gray-600">Sending emails from {userDetails.email}…</p>
                  <Progress value={sendProgress} className="h-3" />
                  <p className="text-sm text-gray-500">{sendProgress}%</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep(3)}>Back to emails</Button>
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
                            <div key={e.id} className="flex items-center gap-2 p-2 rounded bg-green-50 text-sm">
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
                            <div key={email.id} className="p-2 rounded bg-red-50 text-sm">
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
