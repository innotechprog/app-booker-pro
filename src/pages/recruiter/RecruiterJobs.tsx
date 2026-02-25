import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import { Loader2, ArrowLeft, Briefcase, Plus, Users, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { recruiterApi, type RecruiterJob, type CreateJobPayload } from "@/services/recruiterApi";

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
  const [showMoreFields, setShowMoreFields] = useState(false);
  const [jobIntro, setJobIntro] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [reportingTo, setReportingTo] = useState("");
  const [minSalary, setMinSalary] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [jobSalary, setJobSalary] = useState("");
  const [currency, setCurrency] = useState("");
  const [salInterval, setSalInterval] = useState("");
  const [postType, setPostType] = useState("");
  const [workMethod, setWorkMethod] = useState("");
  const [startDate, setStartDate] = useState("");
  const [applicationLink, setApplicationLink] = useState("");
  const [qualification, setQualification] = useState("");
  const [experience, setExperience] = useState("");
  const [positionLevel, setPositionLevel] = useState("");
  const [numPos, setNumPos] = useState("");
  const [datePosted, setDatePosted] = useState("");
  const [closingDate, setClosingDate] = useState("");
  const [externalJobId, setExternalJobId] = useState("");

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

  const resetCreateForm = () => {
    setTitle("");
    setDescription("");
    setStatus("draft");
    setJobIntro("");
    setJobTitle("");
    setJobDesc("");
    setReportingTo("");
    setMinSalary("");
    setMaxSalary("");
    setJobSalary("");
    setCurrency("");
    setSalInterval("");
    setPostType("");
    setWorkMethod("");
    setStartDate("");
    setApplicationLink("");
    setQualification("");
    setExperience("");
    setPositionLevel("");
    setNumPos("");
    setDatePosted("");
    setClosingDate("");
    setExternalJobId("");
    setShowMoreFields(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      const payload: CreateJobPayload = {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        jobIntro: jobIntro.trim() || undefined,
        jobTitle: jobTitle.trim() || undefined,
        jobDesc: jobDesc.trim() || undefined,
        reportingTo: reportingTo.trim() || undefined,
        minSalary: minSalary ? Number(minSalary) : undefined,
        maxSalary: maxSalary ? Number(maxSalary) : undefined,
        jobSalary: jobSalary.trim() || undefined,
        currency: currency.trim() || undefined,
        salInterval: salInterval.trim() || undefined,
        postType: postType.trim() || undefined,
        workMethod: workMethod.trim() || undefined,
        startDate: startDate || undefined,
        applicationLink: applicationLink.trim() || undefined,
        qualification: qualification.trim() || undefined,
        experience: experience.trim() || undefined,
        positionLevel: positionLevel.trim() || undefined,
        numPos: numPos ? Number(numPos) : undefined,
        datePosted: datePosted || undefined,
        closingDate: closingDate || undefined,
        externalJobId: externalJobId.trim() || undefined,
      };
      const res = await recruiterApi.createJob(payload);
      setJobs((prev) => [{ ...res.job, applicationCount: 0 }, ...prev]);
      setCreateOpen(false);
      resetCreateForm();
      toast({ title: "Job created" });
      const jobId = (res.job as { id?: number; jobId?: string })?.jobId ?? (res.job as { id?: number })?.id;
      if (jobId) navigate(`/recruiter/jobs/${jobId}`);
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed to create", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
        </div>
      </>
    );
  }

  return (
    <>
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
              {jobs.map((job) => {
                const jobPk = (job as { jobId?: string; id?: number }).jobId ?? (job as { id?: number }).id;
                return (
                <Card key={String(jobPk)} className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg">
                          <Link to={`/recruiter/jobs/${jobPk}`} className="hover:underline">
                            {(job as { jobTitle?: string }).jobTitle || job.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="mt-1 capitalize">{job.status}</CardDescription>
                        {(job as { jobIntro?: string }).jobIntro && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{(job as { jobIntro?: string }).jobIntro}</p>
                        )}
                        {!((job as { jobIntro?: string }).jobIntro) && job.description && (
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{job.description}</p>
                        )}
                        {(job as { workMethod?: string }).workMethod && (
                          <p className="text-xs text-gray-500 mt-1">{(job as { workMethod?: string }).workMethod}</p>
                        )}
                        {(job as { closingDate?: string }).closingDate && (
                          <p className="text-xs text-gray-500">Closes: {(job as { closingDate?: string }).closingDate}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <Users className="h-4 w-4" /> {job.applicationCount ?? 0} applicants
                        </span>
                        <Button asChild size="sm" variant="outline" className="border-gray-300">
                          <Link to={`/recruiter/jobs/${jobPk}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ); })}
            </div>
          )}
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New job</DialogTitle>
            <DialogDescription>Add a job as draft or post it now. Fill in the fields you need.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Job title" required className="mt-1 bg-white border-gray-300 text-gray-900" />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" className="mt-1 bg-white border-gray-300 text-gray-900" />
            </div>
            <div>
              <Label>Job intro</Label>
              <Input value={jobIntro} onChange={(e) => setJobIntro(e.target.value)} placeholder="Brief intro" className="mt-1 bg-white border-gray-300 text-gray-900" />
            </div>
            <div>
              <Label>Job title (display)</Label>
              <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Display job title" className="mt-1 bg-white border-gray-300 text-gray-900" />
            </div>
            <div>
              <Label>Job description</Label>
              <Input value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} placeholder="Full job description" className="mt-1 bg-white border-gray-300 text-gray-900" />
            </div>
            <div>
              <Label>Status</Label>
              <select value={status} onChange={(e) => setStatus(e.target.value as "draft" | "posted")} className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900">
                <option value="draft">Draft</option>
                <option value="posted">Posted</option>
              </select>
            </div>

            <div>
              <Button type="button" variant="ghost" size="sm" className="flex items-center gap-1 text-gray-600" onClick={() => setShowMoreFields((v) => !v)}>
                <ChevronDown className={`h-4 w-4 transition-transform ${showMoreFields ? "rotate-180" : ""}`} />
                {showMoreFields ? "Hide" : "Show"} more fields
              </Button>
            </div>
            {showMoreFields && (
              <div className="space-y-4 pt-2 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Reporting to</Label>
                    <Input value={reportingTo} onChange={(e) => setReportingTo(e.target.value)} placeholder="Role or name" className="mt-1 bg-white border-gray-300 text-gray-900" />
                  </div>
                  <div>
                    <Label>Work method</Label>
                    <select value={workMethod} onChange={(e) => setWorkMethod(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900">
                      <option value="">—</option>
                      <option value="remote">Remote</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="onsite">On-site</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Min salary</Label>
                    <Input type="number" value={minSalary} onChange={(e) => setMinSalary(e.target.value)} placeholder="0" className="mt-1 bg-white border-gray-300 text-gray-900" />
                  </div>
                  <div>
                    <Label>Max salary</Label>
                    <Input type="number" value={maxSalary} onChange={(e) => setMaxSalary(e.target.value)} placeholder="0" className="mt-1 bg-white border-gray-300 text-gray-900" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Currency</Label>
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900">
                      <option value="">—</option>
                      <option value="ZAR">ZAR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="AUD">AUD</option>
                      <option value="CAD">CAD</option>
                      <option value="NGN">NGN</option>
                      <option value="KES">KES</option>
                      <option value="GHS">GHS</option>
                      <option value="BWP">BWP</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <Label>Salary interval</Label>
                    <select value={salInterval} onChange={(e) => setSalInterval(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900">
                      <option value="">—</option>
                      <option value="yearly">Yearly</option>
                      <option value="monthly">Monthly</option>
                      <option value="hourly">Hourly</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label>Salary (display text)</Label>
                  <Input value={jobSalary} onChange={(e) => setJobSalary(e.target.value)} placeholder="e.g. Competitive" className="mt-1 bg-white border-gray-300 text-gray-900" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start date</Label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 bg-white border-gray-300 text-gray-900" />
                  </div>
                  <div>
                    <Label>Number of positions</Label>
                    <Input type="number" min={1} value={numPos} onChange={(e) => setNumPos(e.target.value)} placeholder="1" className="mt-1 bg-white border-gray-300 text-gray-900" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date posted</Label>
                    <Input type="date" value={datePosted} onChange={(e) => setDatePosted(e.target.value)} className="mt-1 bg-white border-gray-300 text-gray-900" />
                  </div>
                  <div>
                    <Label>Closing date</Label>
                    <Input type="date" value={closingDate} onChange={(e) => setClosingDate(e.target.value)} className="mt-1 bg-white border-gray-300 text-gray-900" />
                  </div>
                </div>
                <div>
                  <Label>Application link</Label>
                  <Input value={applicationLink} onChange={(e) => setApplicationLink(e.target.value)} placeholder="URL" className="mt-1 bg-white border-gray-300 text-gray-900" />
                </div>
                <div>
                  <Label>Qualification</Label>
                  <Input value={qualification} onChange={(e) => setQualification(e.target.value)} placeholder="Required qualification" className="mt-1 bg-white border-gray-300 text-gray-900" />
                </div>
                <div>
                  <Label>Experience</Label>
                  <select value={experience} onChange={(e) => setExperience(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900">
                    <option value="">—</option>
                    <option value="0-1 years">0–1 years</option>
                    <option value="1-2 years">1–2 years</option>
                    <option value="2-3 years">2–3 years</option>
                    <option value="3-5 years">3–5 years</option>
                    <option value="5-10 years">5–10 years</option>
                    <option value="10+ years">10+ years</option>
                  </select>
                </div>
                <div>
                  <Label>Position level</Label>
                  <select value={positionLevel} onChange={(e) => setPositionLevel(e.target.value)} className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900">
                    <option value="">—</option>
                    <option value="Entry">Entry / Junior</option>
                    <option value="Mid">Mid / Intermediate</option>
                    <option value="Senior">Senior</option>
                    <option value="Lead">Lead</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>External job ID</Label>
                    <Input value={externalJobId} onChange={(e) => setExternalJobId(e.target.value)} placeholder="Legacy reference" className="mt-1 bg-white border-gray-300 text-gray-900" />
                  </div>
                  <div>
                    <Label>Post type</Label>
                    <Input value={postType} onChange={(e) => setPostType(e.target.value)} placeholder="—" className="mt-1 bg-white border-gray-300 text-gray-900" />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setCreateOpen(false); resetCreateForm(); }}>Cancel</Button>
              <Button type="submit" disabled={creating} className="text-white" style={{ backgroundColor: DEEP_BLUE }}>{creating ? "Creating…" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecruiterJobs;
