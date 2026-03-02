import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Briefcase, Target, UserCheck, UserX, ArrowRight, Mail, FileText, Eye, Download, Link2 } from "lucide-react";
import { smartApplyAPI } from "@/services/api";

interface DashboardData {
  jobsApplied: number;
  matchingJobs: number;
  profileStatus: "complete" | "incomplete";
}

const SmartApplyDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resumeAnalytics, setResumeAnalytics] = useState({ viewCount: 0, downloadCount: 0, linkClickCount: 0 });

  useEffect(() => {
    const token = localStorage.getItem("smart_apply_token");
    if (!token) {
      navigate("/smart-apply");
      return;
    }
    setError(null);
    Promise.all([
      smartApplyAPI.getDashboard(),
      smartApplyAPI.getResumeAnalytics().catch(() => ({ totals: { viewCount: 0, downloadCount: 0, linkClickCount: 0 } })),
    ])
      .then(([dashboardRes, analyticsRes]) => {
        const totals = (analyticsRes as { totals?: { viewCount?: number; downloadCount?: number; linkClickCount?: number } })?.totals;
        setResumeAnalytics({
          viewCount: totals?.viewCount ?? 0,
          downloadCount: totals?.downloadCount ?? 0,
          linkClickCount: totals?.linkClickCount ?? 0,
        });
        const res = dashboardRes as { dashboard?: DashboardData };
        const d = (res?.dashboard ?? res) as DashboardData | Record<string, unknown>;
        const jobs = Number(d?.jobsApplied);
        const matching = Number(d?.matchingJobs);
        setData({
          jobsApplied: Number.isFinite(jobs) && jobs >= 0 ? jobs : 0,
          matchingJobs: Number.isFinite(matching) && matching >= 0 ? matching : 0,
          profileStatus: (d?.profileStatus as string) === "complete" ? "complete" : "incomplete",
        });
      })
      .catch((err) => {
        setError(err?.message ?? "Failed to load dashboard");
        setData({ jobsApplied: 0, matchingJobs: 0, profileStatus: "incomplete" });
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <Layout>
        <SEO page="smartApply" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <SEO page="smartApply" />
        <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader>
              <CardTitle className="text-red-800">Could not load dashboard</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="border-gray-300" onClick={() => window.location.reload()}>
                Try again
              </Button>
            </CardContent>
          </Card>
        </div>
        </div>
      </Layout>
    );
  }

  const d = data ?? { jobsApplied: 0, matchingJobs: 0, profileStatus: "incomplete" as const };

  return (
    <Layout>
      <SEO page="smartApply" />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Smart Apply Dashboard</h1>
            <p className="text-gray-600 mt-1">Your application activity and profile status at a glance.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {/* Jobs applied */}
            <Card className="border border-gray-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-indigo-600" />
                  Jobs applied
                </CardTitle>
              </div>
              <CardDescription>Applications sent via Smart Apply</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{d.jobsApplied}</p>
              <div className="flex flex-wrap gap-3 mt-3">
                <Link to="/smart-apply/my-applications" className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  View my applications <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/smart-apply/apply" className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  Apply to more <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Matching jobs */}
            <Card className="border border-gray-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="h-5 w-5 text-amber-600" />
                  Matching jobs
                </CardTitle>
              </div>
              <CardDescription>Jobs that match your profile</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{d.matchingJobs}</p>
              <p className="text-xs text-gray-500 mt-2">Coming soon: jobs tailored to your category and skills.</p>
              <Button asChild variant="outline" size="sm" className="mt-3 border-gray-300 text-gray-800 hover:bg-gray-50 bg-white">
                <Link to="/smart-apply/jobs" className="inline-flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4" /> Find a job
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Profile status */}
            <Card className="border border-gray-200 bg-white shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  {d.profileStatus === "complete" ? (
                    <UserCheck className="h-5 w-5 text-green-600" />
                  ) : (
                    <UserX className="h-5 w-5 text-amber-600" />
                  )}
                  Profile status
                </CardTitle>
              </div>
              <CardDescription>Whether recruiters can see your full profile</CardDescription>
            </CardHeader>
            <CardContent>
              <p className={`text-lg font-semibold ${d.profileStatus === "complete" ? "text-green-700" : "text-amber-700"}`}>
                {d.profileStatus === "complete" ? "Complete" : "Incomplete"}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {d.profileStatus === "complete"
                  ? "Your category and CV sections are filled. Recruiters can match you to roles."
                  : "Add your category and at least one CV section (e.g. overview or skills) so recruiters can find you."}
              </p>
              <Link to="/smart-apply/profile" className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-700">
                {d.profileStatus === "complete" ? "View profile" : "Complete profile"} <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Resume analytics */}
        <Card className="mt-6 border border-indigo-200 bg-indigo-50/50 overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-indigo-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Resume analytics
            </CardTitle>
            <CardDescription>Views, downloads, and link clicks on your online CV</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-6 text-sm">
              <span className="flex items-center gap-2 text-indigo-800" title="CV views">
                <Eye className="h-5 w-5 text-indigo-600" />
                <strong className="text-indigo-900 text-xl">{resumeAnalytics.viewCount}</strong> views
              </span>
              <span className="flex items-center gap-2 text-indigo-800" title="Downloads">
                <Download className="h-5 w-5 text-indigo-600" />
                <strong className="text-indigo-900 text-xl">{resumeAnalytics.downloadCount}</strong> downloads
              </span>
              <span className="flex items-center gap-2 text-indigo-800" title="Link clicks">
                <Link2 className="h-5 w-5 text-indigo-600" />
                <strong className="text-indigo-900 text-xl">{resumeAnalytics.linkClickCount}</strong> link clicks
              </span>
            </div>
            <Link to="/smart-apply/cv-builder" className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Create or edit your CV <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>

        <div className="mt-10 flex flex-wrap gap-4">
          <Button asChild className="text-white hover:opacity-90" style={{ backgroundColor: "#1e3a5f" }}>
            <Link to="/smart-apply/apply" className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4" /> APPLY TO MULTIPLE EMAILS
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-gray-300 text-gray-800 hover:bg-gray-50 bg-white shrink-0">
            <Link to="/smart-apply/cv-builder" className="inline-flex items-center gap-2">
              <FileText className="h-4 w-4" /> Professional CV
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-gray-300 text-gray-800 hover:bg-gray-50 bg-white shrink-0">
            <Link to="/smart-apply/profile" className="inline-flex items-center gap-2">Edit profile</Link>
          </Button>
        </div>
        </div>
      </div>
    </Layout>
  );
};

export default SmartApplyDashboard;
