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
import { Loader2, ArrowLeft, UserPlus, User, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { recruiterApi, type RecruiterJobWithApplications, type RecruiterCandidateListItem } from "@/services/recruiterApi";

const DEEP_BLUE = "#1e3a5f";

const RecruiterJobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<RecruiterJobWithApplications | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<"draft" | "posted">("draft");
  const [saving, setSaving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [candidatesList, setCandidatesList] = useState<RecruiterCandidateListItem[]>([]);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const jobId = id ? parseInt(id, 10) : NaN;

  const loadJob = () => {
    if (!Number.isFinite(jobId)) return;
    recruiterApi
      .getJob(jobId)
      .then((res) => {
        setJob(res.job);
        setEditTitle(res.job.title);
        setEditDescription(res.job.description || "");
        setEditStatus(res.job.status);
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
    if (!Number.isFinite(jobId)) {
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

  const alreadyApplied = (candidateId: number) => job?.applications?.some((a) => a.candidateId === candidateId) ?? false;

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await recruiterApi.updateJob(jobId, { title: editTitle.trim(), description: editDescription.trim() || undefined, status: editStatus });
      loadJob();
      setEditOpen(false);
      toast({ title: "Job updated" });
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed to update", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleAccept = async (applicationId: number) => {
    setUpdatingId(applicationId);
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

  const handleReject = async (applicationId: number) => {
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

  if (loading || !job) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
        </div>
      </Layout>
    );
  }

  const appliedIds = new Set((job.applications || []).map((a) => a.candidateId));
  const availableToAdd = candidatesList.filter((c) => !appliedIds.has(c.id));

  return (
    <Layout>
      <SEO title={`${job.title} – Recruiter`} />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
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
                <Button variant="outline" size="sm" className="border-gray-300" onClick={() => setEditOpen(true)}>Edit job</Button>
              </div>
            </CardHeader>
          </Card>

          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Applicants</h2>
            <Button onClick={() => setAddOpen(true)} size="sm" className="text-white hover:opacity-90 inline-flex items-center gap-2" style={{ backgroundColor: DEEP_BLUE }}>
              <UserPlus className="h-4 w-4" /> Add applicant
            </Button>
          </div>

          {(job.applications?.length ?? 0) === 0 ? (
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardContent className="py-12 text-center text-gray-600">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No applicants yet. Add candidates from the talent pool.</p>
                <Button onClick={() => setAddOpen(true)} className="mt-4 text-white hover:opacity-90" style={{ backgroundColor: DEEP_BLUE }}>Add applicant</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {(job.applications || []).map((app) => (
                <Card key={app.id} className="border border-gray-200 bg-white shadow-sm">
                  <CardContent className="py-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{app.fullName}</p>
                        <p className="text-sm text-gray-600">{app.email}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded capitalize ${app.status === "accepted" ? "bg-green-100 text-green-800" : app.status === "rejected" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-700"}`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button asChild size="sm" variant="outline" className="border-gray-300">
                        <Link to={`/recruiter/candidates/${app.candidateId}`}>Profile</Link>
                      </Button>
                      {app.status === "pending" && (
                        <>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" disabled={updatingId === app.id} onClick={() => handleAccept(app.id)}>
                            {updatingId === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Accept
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" disabled={updatingId === app.id} onClick={() => handleReject(app.id)}>
                            {updatingId === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit job</DialogTitle>
            <DialogDescription>Update title, description, or status.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="Job title" required className="mt-1 bg-white border-gray-300" />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Description" className="mt-1 bg-white border-gray-300" />
            </div>
            <div>
              <Label>Status</Label>
              <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as "draft" | "posted")} className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                <option value="draft">Draft</option>
                <option value="posted">Posted</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving} className="text-white" style={{ backgroundColor: DEEP_BLUE }}>{saving ? "Saving…" : "Save"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add applicant</DialogTitle>
            <DialogDescription>Choose a candidate to add as an applicant for this job.</DialogDescription>
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
                  <Button size="sm" className="text-white shrink-0" style={{ backgroundColor: DEEP_BLUE }} onClick={() => handleAddApplicant(c.id)}>Add</Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default RecruiterJobDetail;
