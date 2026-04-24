import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Briefcase, Plus, Users, Eye } from "lucide-react";
import { recruiterApi, type RecruiterJob, recruiterJobRouteId } from "@/services/recruiterApi";
import { RECRUITER_BUTTON_OUTLINE_LIGHT, RECRUITER_BUTTON_PRIMARY } from "@/features/recruiter/buttonStyles";

const DEEP_BLUE = "#1e3a5f";

const RecruiterJobsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<RecruiterJob[]>([]);
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
      <SEO title="Jobs - Recruiter" />
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
            </div>
            <Button asChild className={RECRUITER_BUTTON_PRIMARY} style={{ backgroundColor: DEEP_BLUE }}>
              <Link to="/recruiter/jobs/new" className="inline-flex items-center gap-2">
                <Plus className="h-4 w-4" /> New job
              </Link>
            </Button>
          </div>

          {jobs.length === 0 ? (
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardContent className="py-12 text-center text-gray-600">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No jobs yet. Create a draft or post a job.</p>
                <Button asChild className={`mt-4 ${RECRUITER_BUTTON_PRIMARY}`} style={{ backgroundColor: DEEP_BLUE }}>
                  <Link to="/recruiter/jobs/new">Create job</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const jobPk = recruiterJobRouteId(job);
                if (!jobPk) {
                  // Useful for figuring out what key name the backend actually returns.
                  // Remove once fixed.
                  console.warn("RecruiterJobsPage: missing job route id for job row", job);
                }
                return (
                <Card key={jobPk ?? `job-${job.title}`} className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-lg">
                          {jobPk ? (
                            <Link to={`/recruiter/jobs/${jobPk}`} className="text-gray-900 hover:underline">
                              {(job as { jobTitle?: string }).jobTitle || job.title}
                            </Link>
                          ) : (
                            <span className="text-gray-900">{(job as { jobTitle?: string }).jobTitle || job.title}</span>
                          )}
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
                      <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:shrink-0">
                        <span className="text-sm text-gray-600 flex items-center gap-1">
                          <Users className="h-4 w-4 shrink-0" /> {job.applicationCount ?? 0} applicants
                        </span>
                        {jobPk ? (
                          <Button
                            asChild
                            size="sm"
                            variant="outlineLight"
                            className={`${RECRUITER_BUTTON_OUTLINE_LIGHT} shadow-sm`}
                          >
                            <Link
                              to={`/recruiter/jobs/${jobPk}`}
                              className="inline-flex items-center gap-1.5 text-gray-900 no-underline hover:text-gray-900 focus-visible:text-gray-900 [&_svg]:text-gray-900"
                            >
                              <Eye className="h-4 w-4 shrink-0" aria-hidden />
                              View job
                            </Link>
                          </Button>
                        ) : (
                          <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
                            Missing job id — refresh or contact support
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ); })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RecruiterJobsPage;
