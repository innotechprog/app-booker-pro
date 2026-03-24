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
import { Briefcase, MapPin, Building2, ExternalLink, Loader2, Calendar, Clock, Monitor } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

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

const now = new Date();
const inTwoWeeks = new Date(now);
inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);
const fiveDaysAgo = new Date(now);
fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
const twoWeeksAgo = new Date(now);
twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

// Placeholder: replace with API when backend has jobs (align with jobs table)
const MOCK_JOBS: JobItem[] = [
  {
    id: "1",
    title: "Junior Admin Assistant",
    company: "IB Innovative Solutions",
    location: "Gauteng, South Africa",
    type: "Full-time",
    category: "general",
    description: "Entry-level role for candidates with Grade 12. General office support and administration.",
    postedAt: new Date().toISOString(),
    closingDate: inTwoWeeks.toISOString().slice(0, 10),
    workMethod: "onsite",
    jobIntro: "We are looking for a motivated Junior Admin Assistant to support our office operations.",
    jobTitle: "Junior Admin Assistant",
    jobDesc: "Entry-level role for candidates with Grade 12. General office support, filing, reception, and administration. You will report to the Office Manager and work with the broader admin team.",
    reportingTo: "Office Manager",
    minSalary: 120000,
    maxSalary: 180000,
    currency: "ZAR",
    salInterval: "yearly",
    postType: "Full-time",
    startDate: now.toISOString().slice(0, 10),
    qualification: "Grade 12 / Matric. Computer literacy essential.",
    experience: "0-1 years",
    positionLevel: "Entry",
    numPos: 1,
    datePosted: now.toISOString().slice(0, 10),
  },
  {
    id: "2",
    title: "Software Developer",
    company: "Tech Solutions SA",
    location: "Johannesburg / Remote",
    type: "Full-time",
    category: "professional",
    description: "Degree or diploma in IT/Computer Science. Experience with web or mobile development preferred.",
    postedAt: fiveDaysAgo.toISOString(),
    closingDate: inTwoWeeks.toISOString().slice(0, 10),
    workMethod: "remote",
    jobIntro: "Join our product engineering team to build and maintain web and mobile applications.",
    jobTitle: "Software Developer",
    jobDesc: "Degree or diploma in IT/Computer Science. Experience with web or mobile development preferred. You will work in an agile team, contribute to code reviews, and help shape our tech stack.",
    reportingTo: "Tech Lead",
    jobSalary: "Market related",
    currency: "ZAR",
    salInterval: "yearly",
    postType: "Full-time",
    startDate: fiveDaysAgo.toISOString().slice(0, 10),
    qualification: "BSc/BTech in Computer Science or equivalent.",
    experience: "2-5 years",
    positionLevel: "Mid",
    numPos: 2,
    datePosted: fiveDaysAgo.toISOString().slice(0, 10),
    applyUrl: "https://example.com/apply",
  },
  {
    id: "3",
    title: "Marketing Intern",
    company: "Growth Agency",
    location: "Pretoria",
    type: "Internship",
    category: "general",
    description: "Ideal for matriculants or recent graduates. Support marketing and social media.",
    postedAt: twoWeeksAgo.toISOString(),
    closingDate: inTwoWeeks.toISOString().slice(0, 10),
    workMethod: "hybrid",
    jobIntro: "Six-month internship for someone eager to learn digital marketing and content creation.",
    jobTitle: "Marketing Intern",
    jobDesc: "Ideal for matriculants or recent graduates. Support marketing and social media. Create content, assist with campaigns, and learn from our marketing team. Hybrid: 2 days in office.",
    reportingTo: "Marketing Manager",
    jobSalary: "Stipend",
    postType: "Internship",
    qualification: "Grade 12. Interest in marketing or communications.",
    experience: "0-1 years",
    positionLevel: "Entry",
    numPos: 1,
    datePosted: twoWeeksAgo.toISOString().slice(0, 10),
  },
];

const PAGE_SIZE = 10;

const Jobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "general" | "professional">("all");
  const [selectedJob, setSelectedJob] = useState<JobItem | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLoading(true);
    const filtered = filter === "all" ? MOCK_JOBS : MOCK_JOBS.filter((j) => j.category === filter);
    setJobs(filtered);
    setVisibleCount(PAGE_SIZE);
    setLoading(false);
  }, [filter]);

  const hasMore = jobs.length > PAGE_SIZE && visibleCount < jobs.length;
  const jobsToShow = jobs.length <= PAGE_SIZE ? jobs : jobs.slice(0, visibleCount);

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
                No jobs found for this filter. Check back later or try another category.
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
                  onClick={() => setSelectedJob(job)}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedJob(job)}
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
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-500">Click to view full details and apply</p>
                      {job.closingDate && (
                        <p className="text-xs text-gray-600 shrink-0 flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Closes {new Date(job.closingDate).toLocaleDateString()}
                        </p>
                      )}
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-2 border-gray-200 shadow-xl text-left">
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

                    <div className="flex flex-wrap gap-3 pt-4 border-t-2 border-gray-200 bg-white">
                      <Button
                        className="text-white hover:opacity-90"
                        style={{ backgroundColor: DEEP_BLUE }}
                        onClick={() => {
                          setSelectedJob(null);
                          navigate("/smart-apply/apply");
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Apply with Smart Apply
                      </Button>
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
