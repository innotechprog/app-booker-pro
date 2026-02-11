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
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

// Mock AI generation - replace with real API call when backend is ready
const generateEmailForRow = (
  companyEmail: string,
  topic: string,
  index: number,
  user?: UserDetails
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
  const [rows, setRows] = useState<ApplicationRow[]>([
    { id: crypto.randomUUID(), email: "", topic: "" },
  ]);
  const [emails, setEmails] = useState<GeneratedEmail[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    email: GeneratedEmail | null;
  }>({ open: false, email: null });
  const { toast } = useToast();

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

  const handleGenerate = () => {
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
      const generated = validRows.map((r, i) =>
        generateEmailForRow(r.email, r.topic.trim(), i, userDetails)
      );
      setEmails(generated.map((e) => ({ ...e, isExpanded: false })));
      setIsGenerating(false);
      toast({
        title: "Emails generated",
        description: `Created ${generated.length} email(s) for your review. You can view and edit each one before sending.`,
      });
    }, 1200);
  };

  const toggleExpand = (id: string) => {
    setEmails((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, isExpanded: !e.isExpanded } : e
      )
    );
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

  const handleSendAll = () => {
    if (emails.length === 0) {
      toast({
        title: "No emails to send",
        description: "Generate emails first, then review and send.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Coming soon",
      description:
        "Email sending will be available once connected to your email provider. For now, you can copy each email manually.",
    });
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
            Apply to many companies at once. Add rows with company email and
            topic/job—AI generates tailored subjects and bodies. View and edit
            each email before sending.
          </p>
        </div>
      </div>

      {/* Body - whole section white */}
      <div className="bg-white min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Card className="border-0 shadow-xl bg-[#f5f5f5]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-black">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              Setup your bulk application
            </CardTitle>
            <CardDescription className="text-gray-800">
              Add a row for each company. Enter their email and the topic/job
              you&apos;re applying for. AI generates a tailored email for each row.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
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
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate emails
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Emails */}
        {emails.length > 0 && (
          <div className="mt-12 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Generated emails ({emails.length})
              </h2>
              <Button
                onClick={handleSendAll}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Send className="mr-2 h-4 w-4" />
                Send all
              </Button>
            </div>

            <div className="space-y-4">
              {emails.map((email) => (
                <Card key={email.id} className="overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/50"
                    onClick={() => toggleExpand(email.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Mail className="h-5 w-5 text-indigo-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">
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
                      {email.isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {email.isExpanded && (
                    <CardContent className="pt-0 border-t bg-gray-50/50">
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-gray-500">Subject</Label>
                          <p className="text-sm font-medium text-gray-900">
                            {email.subject}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-gray-500">Body</Label>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {email.body}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(email)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit this email
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
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
