import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ArrowLeft, UserPlus, User, CheckCircle2, XCircle, ChevronRight, CalendarCheck, Send, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { recruiterApi, type RecruiterJobWithApplications, type RecruiterCandidateListItem } from "@/services/recruiterApi";
import { RECRUITER_BUTTON_OUTLINE_LIGHT, RECRUITER_BUTTON_PRIMARY } from "@/features/recruiter/buttonStyles";

const DEEP_BLUE = "#1e3a5f";

const RecruiterJobDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<RecruiterJobWithApplications | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<"draft" | "posted">("draft");
  const [editJobIntro, setEditJobIntro] = useState("");
  const [editWorkMethod, setEditWorkMethod] = useState("");
  const [editMinSalary, setEditMinSalary] = useState("");
  const [editMaxSalary, setEditMaxSalary] = useState("");
  const [editJobSalary, setEditJobSalary] = useState("");
  const [editCurrency, setEditCurrency] = useState("");
  const [editSalInterval, setEditSalInterval] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editNumPos, setEditNumPos] = useState("");
  const [editDatePosted, setEditDatePosted] = useState("");
  const [editClosingDate, setEditClosingDate] = useState("");
  const [editApplicationLink, setEditApplicationLink] = useState("");
  const [editQualification, setEditQualification] = useState("");
  const [editExperience, setEditExperience] = useState("");
  const [editPositionLevel, setEditPositionLevel] = useState("");
  const [saving, setSaving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [candidatesList, setCandidatesList] = useState<RecruiterCandidateListItem[]>([]);
  const [updatingId, setUpdatingId] = useState<number | string | null>(null);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageTarget, setMessageTarget] = useState<{ fullName: string; email: string } | null>(null);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");

  const jobId = id ?? "";

  const loadJob = () => {
    if (!jobId) return;
    recruiterApi
      .getJob(jobId)
      .then((res) => {
        setJob(res.job);
        setEditTitle(res.job.title);
        setEditDescription(res.job.description || "");
        setEditStatus(res.job.status);
        setEditJobIntro(res.job.jobIntro || "");
        setEditWorkMethod(res.job.workMethod || "");
        setEditMinSalary(res.job.minSalary != null ? String(res.job.minSalary) : "");
        setEditMaxSalary(res.job.maxSalary != null ? String(res.job.maxSalary) : "");
        setEditJobSalary(res.job.jobSalary || "");
        setEditCurrency(res.job.currency || "");
        setEditSalInterval(res.job.salInterval || "");
        setEditStartDate(res.job.startDate || "");
        setEditNumPos(res.job.numPos != null ? String(res.job.numPos) : "");
        setEditDatePosted(res.job.datePosted || "");
        setEditClosingDate(res.job.closingDate || "");
        setEditApplicationLink(res.job.applicationLink || "");
        setEditQualification(res.job.qualification || "");
        setEditExperience(res.job.experience || "");
        setEditPositionLevel(res.job.positionLevel || "");
      })
      .catch((err) => {
        if (err?.message === "Session expired" || !recruiterApi.hasToken()) navigate("/recruiter/sign-in");
        else navigate("/recruiter/jobs");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!recruiterApi.hasToken()) {
      navigate("/recruiter/sign-in");
      return;
    }
    if (!jobId) {
      navigate("/recruiter/jobs");
      return;
    }
    loadJob();
  }, [navigate, jobId]);

  useEffect(() => {
    if (addOpen) {
      recruiterApi.getCandidates().then((res) => setCandidatesList(res.candidates || [])).catch(() => setCandidatesList([]));
    }
  }, [addOpen]);

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await recruiterApi.updateJob(jobId, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        status: editStatus,
        jobIntro: editJobIntro.trim() || undefined,
        workMethod: editWorkMethod || undefined,
        minSalary: editMinSalary ? Number(editMinSalary) : undefined,
        maxSalary: editMaxSalary ? Number(editMaxSalary) : undefined,
        jobSalary: editJobSalary.trim() || undefined,
        currency: editCurrency || undefined,
        salInterval: editSalInterval || undefined,
        startDate: editStartDate || undefined,
        numPos: editNumPos ? Number(editNumPos) : undefined,
        datePosted: editDatePosted || undefined,
        closingDate: editClosingDate || undefined,
        applicationLink: editApplicationLink.trim() || undefined,
        qualification: editQualification.trim() || undefined,
        experience: editExperience || undefined,
        positionLevel: editPositionLevel || undefined,
      });
      loadJob();
      setEditOpen(false);
      toast({ title: "Job updated" });
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed to update", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleAccept = async (applicationId: number | string) => {
    setUpdatingId(applicationId as number);
    try {
      await recruiterApi.setApplicationStatus(jobId, applicationId, "accepted");
      loadJob();
      toast({ title: "Candidate accepted" });
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed to update", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async (applicationId: number | string) => {
    setUpdatingId(applicationId);
    try {
      await recruiterApi.setApplicationStatus(jobId, applicationId, "rejected");
      loadJob();
      toast({ title: "Candidate rejected" });
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed to update", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const PIPELINE_STAGES: { key: "applied" | "shortlisted" | "interview" | "hired"; label: string }[] = [
    { key: "applied", label: "Applied" },
    { key: "shortlisted", label: "Shortlisted" },
    { key: "interview", label: "Interview" },
    { key: "hired", label: "Hired" },
  ];

  const getApplicationsByStage = (stage: string) =>
    (job?.applications || []).filter((a) => (a.stage || "applied") === stage && a.status !== "rejected");
  const getRejected = () => (job?.applications || []).filter((a) => a.stage === "rejected" || a.status === "rejected");

  const handleShortlist = async (appId: number | string) => {
    setUpdatingId(appId);
    try {
      await recruiterApi.setApplicationStage(jobId, appId, "shortlisted");
      loadJob();
      toast({ title: "Candidate shortlisted" });
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed to shortlist", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMoveToNextStage = async (appId: number | string, currentStage: string) => {
    const nextMap: Record<string, "shortlisted" | "interview" | "hired"> = {
      applied: "shortlisted",
      shortlisted: "interview",
      interview: "hired",
    };
    const next = nextMap[currentStage];
    if (!next) return;
    setUpdatingId(appId as number);
    try {
      await recruiterApi.setApplicationStage(jobId, appId, next);
      loadJob();
      toast({ title: `Moved to ${PIPELINE_STAGES.find((s) => s.key === next)?.label || next}` });
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed to move", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSendInterviewInvite = async (appId: number | string) => {
    setUpdatingId(appId);
    try {
      await recruiterApi.sendInterviewInvitation(jobId, appId);
      loadJob();
      toast({ title: "Interview invitation sent" });
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed to send invitation", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAddApplicant = async (candidateId: number) => {
    try {
      await recruiterApi.addApplication(jobId, candidateId);
      loadJob();
      toast({ title: "Applicant added" });
      setAddOpen(false);
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed to add", variant: "destructive" });
    }
  };

  const openMessageDialog = (app: { fullName: string; email: string }) => {
    const safeName = app.fullName || "Candidate";
    const safeJobTitle = job?.title || "the role";
    setMessageTarget({ fullName: safeName, email: app.email });
    setMessageSubject(`Regarding your application: ${safeJobTitle}`);
    setMessageBody(`Hi ${safeName},

Thank you for applying for ${safeJobTitle}. I would like to discuss the next steps with you.

Best regards,`);
    setMessageOpen(true);
  };

  const handleSendMessage = () => {
    if (!messageTarget?.email) return;
    const subject = encodeURIComponent(messageSubject.trim());
    const body = encodeURIComponent(messageBody.trim());
    window.location.href = `mailto:${messageTarget.email}?subject=${subject}&body=${body}`;
    setMessageOpen(false);
    toast({ title: "Opening your email client" });
  };

  if (loading || !job) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
        </div>
      </>
    );
  }

  const appliedIds = new Set((job.applications || []).map((a) => a.candidateId));
  const availableToAdd = candidatesList.filter((c) => !appliedIds.has(c.id));

  return (
    <Layout>
      <SEO title={`${job.title} - Recruiter`} />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Button asChild variant="ghost" size="sm" className="mb-6 text-gray-600">
            <Link to="/recruiter/jobs" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to jobs
            </Link>
          </Button>

          <Card className="mb-6 border border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-xl">{job.title}</CardTitle>
                  <CardDescription className="capitalize mt-1">{job.status}</CardDescription>
                  {job.description && <p className="text-gray-700 mt-2 whitespace-pre-wrap">{job.description}</p>}
                </div>
                <Button variant="outlineLight" size="sm" className={RECRUITER_BUTTON_OUTLINE_LIGHT} onClick={() => setEditOpen(true)}>Edit job</Button>
              </div>
            </CardHeader>
          </Card>

          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Applicants</h2>
            <Button onClick={() => setAddOpen(true)} size="sm" className={`${RECRUITER_BUTTON_PRIMARY} inline-flex items-center gap-2`} style={{ backgroundColor: DEEP_BLUE }}>
              <UserPlus className="h-4 w-4" /> Add applicant
            </Button>
          </div>

          {(job.applications?.length ?? 0) === 0 ? (
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardContent className="py-12 text-center text-gray-600">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No applicants yet. Add candidates from the talent pool.</p>
                <Button onClick={() => setAddOpen(true)} className={`mt-4 ${RECRUITER_BUTTON_PRIMARY}`} style={{ backgroundColor: DEEP_BLUE }}>Add applicant</Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {PIPELINE_STAGES.map(({ key, label }) => {
                  const apps = getApplicationsByStage(key);
                  return (
                    <div key={key} className="rounded-lg border border-gray-200 bg-gray-50/50 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">{label}</span>
                        <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded">{apps.length}</span>
                      </div>
                      <div className="space-y-2 min-h-[60px]">
                        {apps.map((app) => (
                          <Card key={app.id} className="border border-gray-200 bg-white shadow-sm">
                            <CardContent className="py-2 px-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                                  <User className="h-4 w-4 text-gray-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-gray-900 text-sm truncate">{app.fullName}</p>
                                  <p className="text-xs text-gray-600 truncate">{app.email}</p>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-2">
                                <Button asChild size="sm" variant="ghost" className="h-7 text-xs p-1">
                                  <Link to={`/recruiter/candidates/${app.candidateId}`}>Profile</Link>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                  onClick={() => openMessageDialog(app)}
                                >
                                  <MessageSquare className="h-3 w-3 mr-1" /> Message
                                </Button>
                                {key === "applied" && (
                                  <Button size="sm" className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white" disabled={updatingId === app.id} onClick={() => handleShortlist(app.id)}>
                                    {updatingId === app.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Shortlist"}
                                  </Button>
                                )}
                                {key === "shortlisted" && (
                                  <>
                                    <Button size="sm" className={`h-7 text-xs ${RECRUITER_BUTTON_PRIMARY}`} style={{ backgroundColor: DEEP_BLUE }} disabled={updatingId === app.id} onClick={() => handleSendInterviewInvite(app.id)}>
                                      {updatingId === app.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />} Invite
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-7 text-xs" disabled={updatingId === app.id} onClick={() => handleMoveToNextStage(app.id, key)}>
                                      {updatingId === app.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <ChevronRight className="h-3 w-3" />}
                                    </Button>
                                  </>
                                )}
                                {key === "interview" && app.interviewInviteSentAt && (
                                  <span className="text-xs text-green-600 flex items-center gap-0.5">
                                    <CalendarCheck className="h-3 w-3" /> Invite sent
                                  </span>
                                )}
                                {key === "interview" && (
                                  <Button size="sm" variant="outline" className="h-7 text-xs" disabled={updatingId === app.id} onClick={() => handleMoveToNextStage(app.id, key)}>
                                    {updatingId === app.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <ChevronRight className="h-3 w-3" />}
                                  </Button>
                                )}
                                {key === "hired" && (
                                  <span className="text-xs text-green-600">Hired</span>
                                )}
                                {app.status === "pending" && (
                                  <>
                                    <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white" disabled={updatingId === app.id} onClick={() => handleAccept(app.id)}>
                                      {updatingId === app.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                                    </Button>
                                    <Button size="sm" variant="outline" className="h-7 text-xs text-red-600" disabled={updatingId === app.id} onClick={() => handleReject(app.id)}>
                                      {updatingId === app.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                                    </Button>
                                  </>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              {getRejected().length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-600 mb-2">Rejected</h3>
                  <div className="space-y-2">
                    {getRejected().map((app) => (
                      <Card key={app.id} className="border border-red-100 bg-red-50/50">
                        <CardContent className="py-2 px-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{app.fullName}</span>
                            <span className="text-xs text-red-600">Rejected</span>
                          </div>
                          <Button asChild size="sm" variant="ghost">
                            <Link to={`/recruiter/candidates/${app.candidateId}`}>Profile</Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            onClick={() => openMessageDialog(app)}
                          >
                            <MessageSquare className="h-3.5 w-3.5 mr-1" /> Message
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit job</DialogTitle>
            <DialogDescription>Update job details. Leave fields blank to keep them empty.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Job title" required className="mt-1 rounded-lg bg-white border-gray-300" />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Description" className="mt-1 rounded-lg bg-white border-gray-300" />
            </div>
            <div>
              <Label>Status</Label>
              <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as "draft" | "posted")} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                <option value="draft">Draft</option>
                <option value="posted">Posted</option>
              </select>
            </div>

            <div className="border-t border-gray-200 pt-3 space-y-3">
              <div>
                <Label>Job intro</Label>
                <Input value={editJobIntro} onChange={(e) => setEditJobIntro(e.target.value)} placeholder="Short intro" className="mt-1 rounded-lg bg-white border-gray-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Work method</Label>
                  <select value={editWorkMethod} onChange={(e) => setEditWorkMethod(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                    <option value="">-</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                  </select>
                </div>
                <div>
                  <Label>Position level</Label>
                  <select value={editPositionLevel} onChange={(e) => setEditPositionLevel(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                    <option value="">-</option>
                    <option value="Entry">Entry / Junior</option>
                    <option value="Mid">Mid / Intermediate</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Min salary</Label>
                  <Input type="number" value={editMinSalary} onChange={(e) => setEditMinSalary(e.target.value)} className="mt-1 rounded-lg bg-white border-gray-300" />
                </div>
                <div>
                  <Label>Max salary</Label>
                  <Input type="number" value={editMaxSalary} onChange={(e) => setEditMaxSalary(e.target.value)} className="mt-1 rounded-lg bg-white border-gray-300" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Currency</Label>
                  <select value={editCurrency} onChange={(e) => setEditCurrency(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                    <option value="">-</option>
                    <option value="ZAR">ZAR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
                <div>
                  <Label>Salary interval</Label>
                  <select value={editSalInterval} onChange={(e) => setEditSalInterval(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                    <option value="">-</option>
                    <option value="yearly">Yearly</option>
                    <option value="monthly">Monthly</option>
                    <option value="hourly">Hourly</option>
                  </select>
                </div>
              </div>
              <div>
                <Label>Salary (display text)</Label>
                <Input value={editJobSalary} onChange={(e) => setEditJobSalary(e.target.value)} placeholder="e.g. Competitive" className="mt-1 rounded-lg bg-white border-gray-300" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Start date</Label>
                  <Input type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} className="mt-1 rounded-lg bg-white border-gray-300" />
                </div>
                <div>
                  <Label>Number of positions</Label>
                  <Input type="number" min={1} value={editNumPos} onChange={(e) => setEditNumPos(e.target.value)} className="mt-1 rounded-lg bg-white border-gray-300" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Date posted</Label>
                  <Input type="date" value={editDatePosted} onChange={(e) => setEditDatePosted(e.target.value)} className="mt-1 rounded-lg bg-white border-gray-300" />
                </div>
                <div>
                  <Label>Closing date</Label>
                  <Input type="date" value={editClosingDate} onChange={(e) => setEditClosingDate(e.target.value)} className="mt-1 rounded-lg bg-white border-gray-300" />
                </div>
              </div>
              <div>
                <Label>Application link</Label>
                <Input value={editApplicationLink} onChange={(e) => setEditApplicationLink(e.target.value)} placeholder="URL" className="mt-1 rounded-lg bg-white border-gray-300" />
              </div>
              <div>
                <Label>Qualification</Label>
                <Input value={editQualification} onChange={(e) => setEditQualification(e.target.value)} placeholder="Required qualification" className="mt-1 rounded-lg bg-white border-gray-300" />
              </div>
              <div>
                <Label>Experience</Label>
                <select value={editExperience} onChange={(e) => setEditExperience(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                  <option value="">-</option>
                  <option value="0-1 years">0-1 years</option>
                  <option value="1-2 years">1-2 years</option>
                  <option value="2-3 years">2-3 years</option>
                  <option value="3-5 years">3-5 years</option>
                  <option value="5-10 years">5-10 years</option>
                  <option value="10+ years">10+ years</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving} className={RECRUITER_BUTTON_PRIMARY} style={{ backgroundColor: DEEP_BLUE }}>{saving ? "Saving..." : "Save"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Add applicant</DialogTitle>
            <DialogDescription className="text-gray-600">Choose a candidate to add as an applicant for this job.</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {availableToAdd.length === 0 ? (
              <p className="text-sm text-gray-500">All candidates are already applicants, or there are no candidates yet.</p>
            ) : (
              availableToAdd.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-2 py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{c.fullName}</p>
                    <p className="text-sm text-gray-600">{c.email}</p>
                  </div>
                  <Button size="sm" className={`${RECRUITER_BUTTON_PRIMARY} shrink-0`} style={{ backgroundColor: DEEP_BLUE }} onClick={() => handleAddApplicant(c.id)}>Add</Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Message candidate</DialogTitle>
            <DialogDescription>
              {messageTarget ? `Send a message to ${messageTarget.fullName}.` : "Compose your message."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>To</Label>
              <Input value={messageTarget?.email || ""} readOnly className="mt-1 rounded-lg bg-gray-50 border-gray-300 text-gray-700" />
            </div>
            <div>
              <Label>Subject</Label>
              <Input value={messageSubject} onChange={(e) => setMessageSubject(e.target.value)} className="mt-1 rounded-lg bg-white border-gray-300" />
            </div>
            <div>
              <Label>Message</Label>
              <textarea
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                rows={7}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setMessageOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                className={RECRUITER_BUTTON_PRIMARY}
                style={{ backgroundColor: DEEP_BLUE }}
                onClick={handleSendMessage}
                disabled={!messageTarget?.email || !messageSubject.trim() || !messageBody.trim()}
              >
                <Send className="h-4 w-4 mr-1.5" /> Send message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default RecruiterJobDetailPage;
