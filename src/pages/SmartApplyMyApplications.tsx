import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Briefcase, ArrowLeft, Building2, Calendar } from "lucide-react";
import { smartApplyAPI } from "@/services/api";

const DEEP_BLUE = "#1e3a5f";

interface AppliedJob {
  id: string;
  jobId?: string;
  jobTitle: string;
  companyName?: string;
  appliedAt: string;
  status?: string;
}

const SmartApplyMyApplications = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<AppliedJob[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("smart_apply_token");
    if (!token) {
      navigate("/smart-apply/sign-in");
      return;
    }
    smartApplyAPI
      .getMyApplications()
      .then((res: { applications?: AppliedJob[] }) => {
        setApplications(res?.applications ?? []);
      })
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) {
    return (
      <Layout>
        <SEO title="My applications – Smart Apply" />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-gray-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO title="My applications – Smart Apply" />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <Button asChild variant="ghost" size="sm" className="mb-6 text-gray-700 hover:text-gray-900">
            <Link to="/smart-apply/dashboard" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
          </Button>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Jobs I applied for</h1>
            <p className="text-gray-600 mt-1">Applications you sent via Smart Apply or accepted from matching jobs.</p>
          </div>

          <Card className="border-2 border-gray-200 bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-gray-900">My applications</CardTitle>
              <CardDescription className="text-gray-700">
                {applications.length === 0
                  ? "You haven’t applied to any jobs yet."
                  : `${applications.length} application(s).`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="py-10 text-center">
                  <Briefcase className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-700 font-medium">No applications yet</p>
                  <p className="text-gray-600 text-sm mt-2 max-w-sm mx-auto">
                    Apply to jobs from the job list or use Apply to multiple emails. Your applications will appear here.
                  </p>
                  <Button asChild className="mt-4 text-white" style={{ backgroundColor: DEEP_BLUE }}>
                    <Link to="/smart-apply/jobs">Find a job</Link>
                  </Button>
                </div>
              ) : (
                <ul className="space-y-3">
                  {applications.map((app) => (
                    <li
                      key={app.id}
                      className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border-2 border-gray-200 bg-gray-50"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{app.jobTitle}</p>
                        {app.companyName && (
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                            <Building2 className="h-3.5 w-3.5" />
                            {app.companyName}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Applied {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      {app.status && (
                        <span className="text-xs font-medium px-2 py-1 rounded bg-gray-200 text-gray-700 capitalize">
                          {app.status}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default SmartApplyMyApplications;
