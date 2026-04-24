import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { recruiterApi, type CreateJobPayload, type RecruiterJob, recruiterJobRouteId } from "@/services/recruiterApi";
import { RECRUITER_BUTTON_OUTLINE_LIGHT, RECRUITER_BUTTON_PRIMARY } from "@/features/recruiter/buttonStyles";

const DEEP_BLUE = "#1e3a5f";

const RecruiterJobCreatePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "posted">("draft");
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
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
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
      const created = (res as { job?: RecruiterJob }).job;
      toast({ title: "Job created" });
      const jobPk = created ? recruiterJobRouteId(created) : undefined;
      if (jobPk) {
        navigate(`/recruiter/jobs/${jobPk}`);
      } else {
        navigate("/recruiter/jobs");
      }
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed to create", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Layout>
      <SEO title="New job - Recruiter" />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Button asChild variant="ghost" size="sm" className="mb-6 text-gray-600">
            <Link to="/recruiter/jobs" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to jobs
            </Link>
          </Button>

          <Card className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">New job</CardTitle>
              <CardDescription className="text-gray-600">
                Add a job as draft or post it now. All fields are optional except title.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 text-gray-900 [&_label]:text-gray-900">
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Job title"
                    required
                    className="mt-1 rounded-lg bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div>
                  <Label>Description (optional)</Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Short description"
                    className="mt-1 rounded-lg bg-white border-gray-300 text-gray-900"
                  />
                </div>
                <div>
                  <Label>Job intro</Label>
                  <Input value={jobIntro} onChange={(e) => setJobIntro(e.target.value)} placeholder="Brief intro" className="mt-1 rounded-lg bg-white border-gray-300 text-gray-900" />
                </div>
                <div>
                  <Label>Job title (display)</Label>
                  <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Display job title" className="mt-1 rounded-lg bg-white border-gray-300 text-gray-900" />
                </div>
                <div>
                  <Label>Job description</Label>
                  <Input value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} placeholder="Full job description" className="mt-1 rounded-lg bg-white border-gray-300 text-gray-900" />
                </div>
                <div>
                  <Label>Status</Label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as "draft" | "posted")}
                    className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                  >
                    <option value="draft">Draft</option>
                    <option value="posted">Posted</option>
                  </select>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-800">Role details &amp; compensation</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Reporting to</Label>
                      <Input value={reportingTo} onChange={(e) => setReportingTo(e.target.value)} placeholder="Role or name" className="mt-1 rounded-lg bg-white border-gray-300 text-gray-900" />
                    </div>
                    <div>
                      <Label>Work method</Label>
                      <select value={workMethod} onChange={(e) => setWorkMethod(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900">
                        <option value="">-</option>
                        <option value="remote">Remote</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="onsite">On-site</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Min salary</Label>
                      <Input type="number" value={minSalary} onChange={(e) => setMinSalary(e.target.value)} placeholder="0" className="mt-1 rounded-lg bg-white border-gray-300 text-gray-900" />
                    </div>
                    <div>
                      <Label>Max salary</Label>
                      <Input type="number" value={maxSalary} onChange={(e) => setMaxSalary(e.target.value)} placeholder="0" className="mt-1 rounded-lg bg-white border-gray-300 text-gray-900" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Currency</Label>
                      <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900">
                        <option value="">-</option>
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
                      <select value={salInterval} onChange={(e) => setSalInterval(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900">
                        <option value="">-</option>
                        <option value="yearly">Yearly</option>
                        <option value="monthly">Monthly</option>
                        <option value="hourly">Hourly</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label>Salary (display text)</Label>
                    <Input value={jobSalary} onChange={(e) => setJobSalary(e.target.value)} placeholder="e.g. Competitive" className="mt-1 rounded-lg bg-white border-gray-300 text-gray-900" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Start date</Label>
                      <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 rounded-lg bg-white border-gray-300 text-gray-900" />
                    </div>
                    <div>
                      <Label>Number of positions</Label>
                      <Input type="number" min={1} value={numPos} onChange={(e) => setNumPos(e.target.value)} placeholder="1" className="mt-1 rounded-lg bg-white border-gray-300 text-gray-900" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Date posted</Label>
                      <Input type="date" value={datePosted} onChange={(e) => setDatePosted(e.target.value)} className="mt-1 rounded-lg bg-white border-gray-300 text-gray-900" />
                    </div>
                    <div>
                      <Label>Closing date</Label>
                      <Input type="date" value={closingDate} onChange={(e) => setClosingDate(e.target.value)} className="mt-1 rounded-lg bg-white border-gray-300 text-gray-900" />
                    </div>
                  </div>
                  <div>
                    <Label>Application link</Label>
                    <Input value={applicationLink} onChange={(e) => setApplicationLink(e.target.value)} placeholder="URL" className="mt-1 rounded-lg bg-white border-gray-300 text-gray-900" />
                  </div>
                  <div>
                    <Label>Qualification</Label>
                    <Input value={qualification} onChange={(e) => setQualification(e.target.value)} placeholder="Required qualification" className="mt-1 rounded-lg bg-white border-gray-300 text-gray-900" />
                  </div>
                  <div>
                    <Label>Experience</Label>
                    <select value={experience} onChange={(e) => setExperience(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900">
                      <option value="">-</option>
                      <option value="0-1 years">0-1 years</option>
                      <option value="1-2 years">1-2 years</option>
                      <option value="2-3 years">2-3 years</option>
                      <option value="3-5 years">3-5 years</option>
                      <option value="5-10 years">5-10 years</option>
                      <option value="10+ years">10+ years</option>
                    </select>
                  </div>
                  <div>
                    <Label>Position level</Label>
                    <select value={positionLevel} onChange={(e) => setPositionLevel(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900">
                      <option value="">-</option>
                      <option value="Entry">Entry / Junior</option>
                      <option value="Mid">Mid / Intermediate</option>
                      <option value="Senior">Senior</option>
                      <option value="Lead">Lead</option>
                      <option value="Executive">Executive</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>External job ID</Label>
                      <Input value={externalJobId} onChange={(e) => setExternalJobId(e.target.value)} placeholder="Legacy reference" className="mt-1 rounded-lg bg-white border-gray-300 text-gray-900" />
                    </div>
                    <div>
                      <Label>Post type</Label>
                      <Input value={postType} onChange={(e) => setPostType(e.target.value)} placeholder="-" className="mt-1 rounded-lg bg-white border-gray-300 text-gray-900" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2 pt-4 border-t border-gray-200">
                  <Button type="button" variant="outlineLight" className={RECRUITER_BUTTON_OUTLINE_LIGHT} asChild>
                    <Link to="/recruiter/jobs">Cancel</Link>
                  </Button>
                  <Button
                    type="submit"
                    disabled={creating}
                    className={`${RECRUITER_BUTTON_PRIMARY} inline-flex items-center gap-2`}
                    style={{ backgroundColor: DEEP_BLUE }}
                  >
                    {creating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                      </>
                    ) : (
                      "Create job"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default RecruiterJobCreatePage;
