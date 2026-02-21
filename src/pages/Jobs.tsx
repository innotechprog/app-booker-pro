import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import Footer from "@/components/Footer";
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Available jobs</h1>
            <p className="text-lg text-gray-600">
              Browse openings. Use <strong>Apply to multiple emails</strong> in the header to send applications from your profile.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className={filter === "all" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
            >
              All
            </Button>
            <Button
              variant={filter === "general" ? "default" : "outline"}
              onClick={() => setFilter("general")}
              className={filter === "general" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
            >
              General
            </Button>
            <Button
              variant={filter === "professional" ? "default" : "outline"}
              onClick={() => setFilter("professional")}
              className={filter === "professional" ? "bg-indigo-600 hover:bg-indigo-700" : ""}
            >
              Professional
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : jobs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-600">
                No jobs found for this filter. Check back later or try another category.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
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
                      <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                        <Link to="/smart-apply/apply">
                          <ExternalLink className="mr-1 h-4 w-4" />
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
      <Footer />
    </Layout>
  );
};

export default Jobs;
