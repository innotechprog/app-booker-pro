import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Briefcase, MapPin, Building2, ExternalLink, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

interface JobItem {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  category: "general" | "professional";
  description: string;
  postedAt: string;
  applyUrl?: string;
}

// Placeholder: replace with API when backend has jobs
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
  },
  {
    id: "2",
    title: "Software Developer",
    company: "Tech Solutions SA",
    location: "Johannesburg / Remote",
    type: "Full-time",
    category: "professional",
    description: "Degree or diploma in IT/Computer Science. Experience with web or mobile development preferred.",
    postedAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Marketing Intern",
    company: "Growth Agency",
    location: "Pretoria",
    type: "Internship",
    category: "general",
    description: "Ideal for matriculants or recent graduates. Support marketing and social media.",
    postedAt: new Date().toISOString(),
  },
];

const Jobs = () => {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "general" | "professional">("all");

  useEffect(() => {
    setLoading(true);
    const filtered = filter === "all" ? MOCK_JOBS : MOCK_JOBS.filter((j) => j.category === filter);
    setJobs(filtered);
    setLoading(false);
  }, [filter]);

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
              onClick={() => setFilter("all")}
              className={filter === "all" ? "text-white hover:opacity-90" : "border-gray-300 text-gray-800 hover:bg-gray-50"}
              style={filter === "all" ? { backgroundColor: "#1e3a5f" } : undefined}
            >
              All
            </Button>
            <Button
              variant={filter === "general" ? "default" : "outline"}
              onClick={() => setFilter("general")}
              className={filter === "general" ? "text-white hover:opacity-90" : "border-gray-300 text-gray-800 hover:bg-gray-50"}
              style={filter === "general" ? { backgroundColor: "#1e3a5f" } : undefined}
            >
              General
            </Button>
            <Button
              variant={filter === "professional" ? "default" : "outline"}
              onClick={() => setFilter("professional")}
              className={filter === "professional" ? "text-white hover:opacity-90" : "border-gray-300 text-gray-800 hover:bg-gray-50"}
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
              {jobs.map((job) => (
                <Card key={job.id} className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg text-gray-900">{job.title}</CardTitle>
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
                    </div>
                    <p className="text-gray-700">{job.description}</p>
                    <div className="pt-2 flex gap-2">
                      <Button asChild size="sm" className="text-white hover:opacity-90" style={{ backgroundColor: "#1e3a5f" }}>
                        <Link to="/smart-apply/apply" className="inline-flex items-center gap-1.5">
                          <ExternalLink className="h-4 w-4" />
                          Apply with Smart Apply
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Jobs;
