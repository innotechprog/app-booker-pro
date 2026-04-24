import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Briefcase, MapPin, Building2, ExternalLink, Loader2, Calendar, Clock, Monitor, Search } from "lucide-react";
import { Link, useNavigate, useSearchParams, useParams } from "react-router-dom";
import { smartApplyAPI } from "@/services/api";
import { recruiterApi } from "@/services/recruiterApi";
import { useToast } from "@/hooks/use-toast";

const DEEP_BLUE = "#1e3a5f";

const NEW_JOB_DAYS = 7;

interface JobItem {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  category: "general" | "professional";
  description: string;
  postedAt: string;
  closingDate?: string;
  workMethod?: string;
  applyUrl?: string;
  // Full job table fields (map from API)
  jobIntro?: string;
  jobTitle?: string;
  jobDesc?: string;
  reportingTo?: string;
  minSalary?: number;
  maxSalary?: number;
  jobSalary?: string;
  currency?: string;
  salInterval?: string;
  postType?: string;
  startDate?: string;
  qualification?: string;
  experience?: string;
  positionLevel?: string;
  numPos?: number;
  datePosted?: string;
}

function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week(s) ago`;
  return `${Math.floor(diffDays / 30)} month(s) ago`;
}

function isNewJob(postedAt: string): boolean {
  const date = new Date(postedAt);
  const now = new Date();
  const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays < NEW_JOB_DAYS;
}

function formatWorkMethod(method?: string): string {
  if (!method) return "";
  const m = method.toLowerCase();
  if (m === "remote") return "Remote";
  if (m === "hybrid") return "Hybrid";
  if (m === "onsite" || m === "on-site") return "On-site";
  return method;
}

function inferCategoryFromJob(job: Record<string, unknown>): "general" | "professional" {
  const text = [
    typeof job.title === "string" ? job.title : "",
    typeof job.job_title === "string" ? job.job_title : "",
    typeof job.description === "string" ? job.description : "",
    typeof job.job_desc === "string" ? job.job_desc : "",
    typeof job.qualification === "string" ? job.qualification : "",
    typeof job.experience === "string" ? job.experience : "",
  ]
    .join(" ")
    .toLowerCase();

  const professionalPattern = /\b(degree|diploma|bsc|btech|bcom|postgraduate|masters|mba|phd|engineer|developer|analyst|specialist|manager|3\+\s*years|5\+\s*years)\b/i;
  return professionalPattern.test(text) ? "professional" : "general";
}

function mapJobFromApi(raw: Record<string, unknown>, fallbackIndex = 0): JobItem {
  const postedAt =
    (typeof raw.date_posted === "string" && raw.date_posted) ||
    (typeof raw.created_at === "string" && raw.created_at) ||
    new Date().toISOString();

  const resolvedId =
    raw.job_id ||
    raw.id ||
    raw.recruiter_job_id ||
    raw.jobId ||
    raw.recruiterJobId ||
    `job-${fallbackIndex + 1}-${postedAt}`;

  const location = [
    typeof raw.city === "string" ? raw.city : "",
    typeof raw.state_region === "string" ? raw.state_region : "",
    typeof raw.country === "string" ? raw.country : "",
  ]
    .filter(Boolean)
    .join(", ");

  const rawCategory =
    typeof raw.category === "string"
      ? raw.category.trim().toLowerCase()
      : typeof raw.candidate_category === "string"
        ? raw.candidate_category.trim().toLowerCase()
        : "";

  const category: "general" | "professional" =
    rawCategory === "general" || rawCategory === "professional"
      ? rawCategory
      : inferCategoryFromJob(raw);

  return {
    id: String(resolvedId),
    title: String(raw.job_title || raw.title || "Untitled role"),
    company: String(raw.company || "Company"),
    location: location || "Location not specified",
    type: String(raw.post_type || "Not specified"),
    category,
    description: String(raw.job_desc || raw.description || "No job description provided."),
    postedAt,
    closingDate: typeof raw.closing_date === "string" ? raw.closing_date : undefined,
    workMethod: typeof raw.work_method === "string" ? raw.work_method : undefined,
    applyUrl: typeof raw.application_link === "string" ? raw.application_link : undefined,
    jobIntro: typeof raw.job_intro === "string" ? raw.job_intro : undefined,
    jobTitle: typeof raw.job_title === "string" ? raw.job_title : undefined,
    jobDesc: typeof raw.job_desc === "string" ? raw.job_desc : undefined,
    reportingTo: typeof raw.reporting_to === "string" ? raw.reporting_to : undefined,
    minSalary: typeof raw.min_salary === "number" ? raw.min_salary : undefined,
    maxSalary: typeof raw.max_salary === "number" ? raw.max_salary : undefined,
    jobSalary: typeof raw.job_salary === "string" ? raw.job_salary : undefined,
    currency: typeof raw.currency === "string" ? raw.currency : undefined,
    salInterval: typeof raw.sal_interval === "string" ? raw.sal_interval : undefined,
    postType: typeof raw.post_type === "string" ? raw.post_type : undefined,
    startDate: typeof raw.start_date === "string" ? raw.start_date : undefined,
    qualification: typeof raw.qualification === "string" ? raw.qualification : undefined,
    experience: typeof raw.experience === "string" ? raw.experience : undefined,
    positionLevel: typeof raw.position_level === "string" ? raw.position_level : undefined,
    numPos: typeof raw.num_pos === "number" ? raw.num_pos : undefined,
    datePosted: typeof raw.date_posted === "string" ? raw.date_posted : undefined,
  };
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function getRelatedJobs(pool: JobItem[], target: JobItem, count = 3): JobItem[] {
  const targetTokens = new Set(tokenize(`${target.title} ${target.description} ${target.company}`));

  const scored = pool
    .filter((job) => job.id !== target.id)
    .map((job) => {
      let score = 0;
      if (job.category === target.category) score += 3;
      if (job.company.toLowerCase() === target.company.toLowerCase()) score += 3;
      if ((job.workMethod || "").toLowerCase() === (target.workMethod || "").toLowerCase()) score += 1;

      const overlap = tokenize(`${job.title} ${job.description}`).reduce((acc, token) => {
        return acc + (targetTokens.has(token) ? 1 : 0);
      }, 0);
      score += Math.min(overlap, 4);

      return { job, score };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.job.postedAt).getTime() - new Date(a.job.postedAt).getTime();
    });

  const meaningful = scored.filter((s) => s.score > 0).slice(0, count).map((s) => s.job);
  if (meaningful.length > 0) return meaningful;

  return scored.slice(0, count).map((s) => s.job);
}

const PAGE_SIZE = 10;

const SMART_APPLY_TOKEN_KEY = "smart_apply_token";

const Jobs = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { jobId: jobIdFromPath } = useParams<{ jobId?: string }>();
  const { toast } = useToast();
  const [allJobs, setAllJobs] = useState<JobItem[]>([]);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "general" | "professional">("all");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const autoOpenedRef = useRef(false);
  const pendingJobIdFromUrl = searchParams.get("jobId") || jobIdFromPath || null;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    setLoading(true);
    smartApplyAPI
      .getJobs({
        // Fetch all posted jobs and filter/search client-side to avoid backend param mismatch hiding rows.
        limit: 100,
      })
      .then((res) => {
        const mapped = (res.jobs || [])
          .map((r, index) => {
            let row: Record<string, unknown>;
            if (typeof r === "string") {
              try {
                row = JSON.parse(r) as Record<string, unknown>;
              } catch {
                return null;
              }
            } else if (r && typeof r === "object" && !Array.isArray(r)) {
              row = r as Record<string, unknown>;
            } else {
              return null;
            }
            return mapJobFromApi(row, index);
          })
          .filter((j): j is JobItem => j != null && !!j.id);
        setAllJobs(mapped);
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Could not load jobs.";
        setAllJobs([]);
        toast({ title: "Could not load jobs", description: message, variant: "destructive" });
      })
      .finally(() => setLoading(false));
    // Load once; search/filter are applied client-side (see effects below).
  }, [toast]);

  useEffect(() => {
    const normalizedQuery = searchQuery.toLowerCase();
    const searched = !normalizedQuery
      ? allJobs
      : allJobs.filter((j) => {
          const haystack = [j.title, j.company, j.location, j.description, j.qualification, j.experience]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return haystack.includes(normalizedQuery);
        });

    const filtered = filter === "all" ? searched : searched.filter((j) => j.category === filter);
    setJobs(filtered);
    setVisibleCount(PAGE_SIZE);
  }, [filter, allJobs, searchQuery]);

  // Auto-open a job when redirected back after login (jobId in URL param)
  useEffect(() => {
    if (!pendingJobIdFromUrl || loading || allJobs.length === 0 || autoOpenedRef.current) return;
    const found = allJobs.find((j) => j.id === pendingJobIdFromUrl);
    if (found) {
      if (!localStorage.getItem(SMART_APPLY_TOKEN_KEY) && !recruiterApi.hasToken()) {
        sessionStorage.setItem("smart_apply_pending_job_id", found.id);
        navigate("/smart-apply/sign-in", { replace: true });
        return;
      }
      autoOpenedRef.current = true;
      setSelectedJob(found);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete("jobId");
          return next;
        },
        { replace: true }
      );
    }
  }, [pendingJobIdFromUrl, loading, allJobs, setSearchParams, navigate]);

  const hasMore = jobs.length > PAGE_SIZE && visibleCount < jobs.length;
  const jobsToShow = jobs.length <= PAGE_SIZE ? jobs : jobs.slice(0, visibleCount);
  const relatedJobs = selectedJob ? getRelatedJobs(allJobs, selectedJob) : [];

  useEffect(() => {
    if (!hasMore || !loadMoreRef.current) return;
    const el = loadMoreRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, jobs.length));
        }
      },
      { rootMargin: "100px", threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, jobs.length]);

  const openJobDetails = (job: JobItem) => {
    const hasCandidate = !!localStorage.getItem(SMART_APPLY_TOKEN_KEY);
    const hasRecruiter = recruiterApi.hasToken();
    if (!hasCandidate && !hasRecruiter) {
      sessionStorage.setItem("smart_apply_pending_job_id", job.id);
      navigate("/smart-apply/sign-in");
      return;
    }
    setSelectedJob(job);
  };

  return (
    <Layout>
      <SEO page="smartApply" />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Available jobs</h1>
            <p className="text-gray-600 mt-1">
              Browse openings. Use <strong>Apply to multiple emails</strong> in the header to send applications from your profile.
            </p>
          </div>

          <div className="mb-5">
            <label htmlFor="job-search" className="sr-only">Search jobs</label>
            <div className="relative">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="job-search"
                type="text"
                placeholder="Search by title, company, location, skills..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full h-11 rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="default"
              onClick={() => setFilter("all")}
              className={filter === "all" ? "text-white hover:opacity-90" : "border-2 border-gray-500 bg-white text-gray-900 hover:bg-gray-100 hover:border-gray-600 font-medium shadow-sm"}
              style={filter === "all" ? { backgroundColor: "#1e3a5f" } : undefined}
            >
              All
            </Button>
            <Button
              variant={filter === "general" ? "default" : "outline"}
              size="default"
              onClick={() => setFilter("general")}
              className={filter === "general" ? "text-white hover:opacity-90" : "border-2 border-gray-500 bg-white text-gray-900 hover:bg-gray-100 hover:border-gray-600 font-medium shadow-sm"}
              style={filter === "general" ? { backgroundColor: "#1e3a5f" } : undefined}
            >
              General
            </Button>
            <Button
              variant={filter === "professional" ? "default" : "outline"}
              size="default"
              onClick={() => setFilter("professional")}
              className={filter === "professional" ? "text-white hover:opacity-90" : "border-2 border-gray-500 bg-white text-gray-900 hover:bg-gray-100 hover:border-gray-600 font-medium shadow-sm"}
              style={filter === "professional" ? { backgroundColor: "#1e3a5f" } : undefined}
            >
              Professional
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
            </div>
          ) : jobs.length === 0 ? (
            <Card className="border border-gray-200 bg-white shadow-sm">
              <CardContent className="py-12 text-center text-gray-600">
                No job posted.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {jobsToShow.map((job) => (
                <Card
                  key={job.id}
                  role="button"
                  tabIndex={0}
                  className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e3a5f]"
                  onClick={() => openJobDetails(job)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter") return;
                    openJobDetails(job);
                  }}
                >
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="text-lg text-gray-900">{job.title}</CardTitle>
                          {isNewJob(job.postedAt) ? (
                            <Badge className="bg-green-600 hover:bg-green-600 shrink-0">New</Badge>
                          ) : (
                            <Badge variant="secondary" className="shrink-0">Old</Badge>
                          )}
                        </div>
                        <CardDescription className="flex items-center gap-2 mt-1 text-gray-600">
                          <Building2 className="h-4 w-4" />
                          {job.company}
                        </CardDescription>
                      </div>
                      <Badge variant={job.category === "professional" ? "default" : "secondary"} className="capitalize shrink-0">
                        {job.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-gray-600">
                    <div className="flex flex-wrap gap-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 shrink-0" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-4 w-4 shrink-0" />
                        {job.type}
                      </span>
                      {job.workMethod && (
                        <span className="flex items-center gap-1">
                          <Monitor className="h-4 w-4 shrink-0" />
                          {formatWorkMethod(job.workMethod)}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-gray-500">
                        <Clock className="h-4 w-4 shrink-0" />
                        {getTimeAgo(job.postedAt)}
                      </span>
                    </div>
                    <p className="text-gray-700 line-clamp-2">{job.description}</p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">Open full details and apply options.</p>
                      <div className="flex flex-wrap items-center gap-2 justify-end">
                        {job.closingDate && (
                          <p className="text-xs text-gray-600 shrink-0 flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Closes {new Date(job.closingDate).toLocaleDateString()}
                          </p>
                        )}
                        <Button
                          type="button"
                          size="sm"
                          className="shrink-0 border-0 text-white hover:opacity-90 hover:text-white focus-visible:text-white"
                          style={{ backgroundColor: DEEP_BLUE }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openJobDetails(job);
                          }}
                        >
                          View job
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {jobs.length > PAGE_SIZE && (
                <div
                  ref={loadMoreRef}
                  className="flex flex-col items-center justify-center py-8 text-center"
                  aria-hidden
                >
                  {hasMore ? (
                    <p className="text-sm text-gray-500">Scroll for more jobs...</p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Showing all {jobs.length} job{jobs.length !== 1 ? "s" : ""}.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Job detail dialog – all fields from jobs table */}
          <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto text-left">
              {selectedJob && (
                <div className="bg-white text-gray-900">
                  <DialogHeader className="text-left pb-3 border-b border-gray-200">
                    <DialogTitle className="text-xl font-bold text-gray-900 pr-8">
                      {selectedJob.jobTitle || selectedJob.title}
                    </DialogTitle>
                    <DialogDescription className="flex items-center gap-2 text-gray-700 font-medium">
                      <Building2 className="h-4 w-4 shrink-0" />
                      {selectedJob.company}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4 text-sm bg-white">
                    <div className="flex flex-wrap gap-2 text-gray-800">
                      <Badge variant={selectedJob.category === "professional" ? "default" : "secondary"} className="capitalize">
                        {selectedJob.category}
                      </Badge>
                      {isNewJob(selectedJob.postedAt) ? (
                        <Badge className="bg-green-600 hover:bg-green-600">New</Badge>
                      ) : (
                        <Badge variant="secondary">Old</Badge>
                      )}
                      <span className="flex items-center gap-1.5 text-gray-800">
                        <MapPin className="h-4 w-4 shrink-0" />
                        {selectedJob.location}
                      </span>
                      <span className="flex items-center gap-1.5 text-gray-800">
                        <Briefcase className="h-4 w-4 shrink-0" />
                        {selectedJob.postType || selectedJob.type}
                      </span>
                      {selectedJob.workMethod && (
                        <span className="flex items-center gap-1.5 text-gray-800">
                          <Monitor className="h-4 w-4 shrink-0" />
                          {formatWorkMethod(selectedJob.workMethod)}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5 text-gray-700">
                        <Clock className="h-4 w-4 shrink-0" />
                        {getTimeAgo(selectedJob.postedAt)}
                      </span>
                      {selectedJob.closingDate && (
                        <span className="flex items-center gap-1.5 text-gray-800">
                          <Calendar className="h-4 w-4 shrink-0" />
                          Closes {new Date(selectedJob.closingDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {selectedJob.jobIntro && (
                      <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1.5">Intro</h4>
                        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedJob.jobIntro}</p>
                      </div>
                    )}

                    <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1.5">Description</h4>
                      <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {selectedJob.jobDesc || selectedJob.description}
                      </p>
                    </div>

                    {selectedJob.reportingTo && (
                      <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Reporting to</h4>
                        <p className="text-gray-800">{selectedJob.reportingTo}</p>
                      </div>
                    )}

                    {(selectedJob.minSalary != null || selectedJob.maxSalary != null || selectedJob.jobSalary) && (
                      <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Salary</h4>
                        <p className="text-gray-800">
                          {selectedJob.jobSalary
                            ? selectedJob.jobSalary
                            : [selectedJob.minSalary, selectedJob.maxSalary].filter((n) => n != null).length > 0
                              ? [
                                  selectedJob.currency && `${selectedJob.currency} `,
                                  selectedJob.minSalary != null && selectedJob.minSalary.toLocaleString(),
                                  selectedJob.maxSalary != null && ` – ${selectedJob.maxSalary.toLocaleString()}`,
                                  selectedJob.salInterval && ` (${selectedJob.salInterval})`,
                                ].filter(Boolean).join("")
                              : "—"}
                        </p>
                      </div>
                    )}

                    {selectedJob.qualification && (
                      <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Qualification</h4>
                        <p className="text-gray-800 whitespace-pre-wrap">{selectedJob.qualification}</p>
                      </div>
                    )}

                    {selectedJob.experience && (
                      <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Experience</h4>
                        <p className="text-gray-800">{selectedJob.experience}</p>
                      </div>
                    )}

                    {selectedJob.positionLevel && (
                      <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Position level</h4>
                        <p className="text-gray-800">{selectedJob.positionLevel}</p>
                      </div>
                    )}

                    {selectedJob.numPos != null && selectedJob.numPos > 0 && (
                      <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Number of positions</h4>
                        <p className="text-gray-800">{selectedJob.numPos}</p>
                      </div>
                    )}

                    {selectedJob.startDate && (
                      <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Start date</h4>
                        <p className="text-gray-800">{new Date(selectedJob.startDate).toLocaleDateString()}</p>
                      </div>
                    )}

                    {(selectedJob.datePosted || selectedJob.postedAt) && (
                      <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Date posted</h4>
                        <p className="text-gray-800">
                          {new Date(selectedJob.datePosted || selectedJob.postedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {selectedJob.closingDate && (
                      <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Closing date</h4>
                        <p className="text-gray-800">{new Date(selectedJob.closingDate).toLocaleDateString()}</p>
                      </div>
                    )}

                    {relatedJobs.length > 0 && (
                      <div className="rounded-lg bg-gray-50 p-3 border border-gray-100">
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Related jobs</h4>
                        <div className="space-y-2">
                          {relatedJobs.map((job) => (
                            <button
                              key={job.id}
                              type="button"
                              className="w-full rounded-md border border-gray-200 bg-white p-2 text-left hover:bg-gray-100"
                              onClick={() => setSelectedJob(job)}
                            >
                              <div className="font-medium text-gray-900 line-clamp-1">{job.title}</div>
                              <div className="text-xs text-gray-600 mt-0.5">{job.company} • {job.location}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3 pt-4 border-t-2 border-gray-200 bg-white">
                      {localStorage.getItem(SMART_APPLY_TOKEN_KEY) ? (
                      <Button
                        className="text-white hover:opacity-90"
                        style={{ backgroundColor: DEEP_BLUE }}
                        onClick={() => {
                          setSelectedJob(null);
                          navigate("/smart-apply/apply");
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Multi Apply
                      </Button>
                      ) : recruiterApi.hasToken() ? (
                        <p className="text-sm text-gray-600 w-full sm:w-auto sm:flex-1 min-w-0">
                          You are signed in as a recruiter. Open Job Assistant with a candidate account to apply, or use the company apply link if available.
                        </p>
                      ) : null}
                      {selectedJob.applyUrl && (
                        <Button variant="outline" className="border-gray-300" asChild>
                          <a href={selectedJob.applyUrl} target="_blank" rel="noopener noreferrer">
                            Open company apply link
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" className="text-gray-800 hover:bg-gray-100" onClick={() => setSelectedJob(null)}>
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
};

export default Jobs;
