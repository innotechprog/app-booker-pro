import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { Loader2, ArrowLeft, Briefcase, Plus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { recruiterApi, type RecruiterJob } from "@/services/recruiterApi";

const DEEP_BLUE = "#1e3a5f";

const RecruiterJobs = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "posted">("draft");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recruiterApi.hasToken()) {
      navigate("/recruiter/sign-in");
      return;
    }
    setError(null);
    recruiterApi
      .getJobs()
      .then((res) => setJobs(res.jobs || []))
      .catch((err) => {
        if (err?.message === "Session expired" || !recruiterApi.hasToken()) navigate("/recruiter/sign-in");
        else setError(err?.message || "Failed to load jobs");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      const res = await recruiterApi.createJob({ title: title.trim(), description: description.trim() || undefined, status });
      setJobs((prev) => [{ ...res.job, applicationCount: 0 }, ...prev]);
      setCreateOpen(false);
      setTitle("");
      setDescription("");
      setStatus("draft");
      toast({ title: "Job created" });
      if (res.job?.id) navigate(`/recruiter/jobs/${res.job.id}`);
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed to create", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title="Jobs – Recruiter" />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Button asChild variant="ghost" size="sm" className="mb-6 text-gray-600">
            <Link to="/recruiter" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-800 text-sm">
              {error}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
              <p className="text-gray-600 mt-1">Post or save as draft. View applicants and accept or reject them.</p>
            </div>
            <Button
              onClick={() => setCreateOpen(true)}
              className="text-white hover:opacity-90 inline-flex items-center gap-2"
              style={{ backgroundColor: DEEP_BLUE }}
            >
              <Plus className="h-4 w-4" /> New job
            </Button>
          </div>

          {jobs.length === 0 ? (
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardContent className="py-12 text-center text-gray-600">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No jobs yet. Create a draft or post a job.</p>
                <Button onClick={() => setCreateOpen(true)} className="mt-4 text-white hover:opacity-90" style={{ backgroundColor: DEEP_BLUE }}>
                  Create job
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id} className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg">
                          <Link to={`/recruiter/jobs/${job.id}`} className="hover:underline">
                            {job.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="mt-1 capitalize">{job.status}</CardDescription>
                        {job.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{job.description}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Users className="h-4 w-4" /> {job.applicationCount ?? 0} applicants
                        </span>
                        <Button asChild size="sm" variant="outline" className="border-gray-300">
                          <Link to={`/recruiter/jobs/${job.id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New job</DialogTitle>
            <DialogDescription>Add a job as draft or post it now.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Job title" required className="mt-1 bg-white border-gray-300" />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" className="mt-1 bg-white border-gray-300" />
            </div>
            <div>
              <Label>Status</Label>
              <select value={status} onChange={(e) => setStatus(e.target.value as "draft" | "posted")} className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm">
                <option value="draft">Draft</option>
                <option value="posted">Posted</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={creating} className="text-white" style={{ backgroundColor: DEEP_BLUE }}>{creating ? "Creating…" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default RecruiterJobs;
