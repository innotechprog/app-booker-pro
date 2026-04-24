import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { smartApplyAPI } from "@/services/api";
import { Users, Mail, Phone, Briefcase, GraduationCap, Loader2, ArrowRight, Calendar } from "lucide-react";
import { RECRUITER_BUTTON_OUTLINE_LIGHT, RECRUITER_BUTTON_PRIMARY } from "@/features/recruiter/buttonStyles";

const DEEP_BLUE = "#1e3a5f";

interface Candidate {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  category: string;
  createdAt: string;
}

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "NA";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const RecruitersPage = () => {
  const [filter, setFilter] = useState<"all" | "general" | "professional">("all");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const category = filter === "all" ? undefined : filter;
    smartApplyAPI
      .getCandidates(category)
      .then((res: { candidates?: Candidate[] }) => {
        setCandidates(res.candidates || []);
      })
      .catch((err: Error) => {
        setError(err.message || "Failed to load candidates");
        setCandidates([]);
      })
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <Layout>
      <SEO page="smartApply" />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <div className="mb-10 text-center">
            <h1 className="mb-2 text-4xl font-bold text-gray-900">Candidate pool</h1>
            <p className="text-lg text-gray-600">
              Job Assistant candidates. Filter by <strong>General</strong> (Grade 12 / matric) or <strong>Professional</strong> (higher qualifications).
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild className={RECRUITER_BUTTON_PRIMARY} style={{ backgroundColor: DEEP_BLUE }}>
                <Link to="/recruiter/sign-in" className="inline-flex items-center gap-2">
                  Recruiter sign in
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outlineLight" className={RECRUITER_BUTTON_OUTLINE_LIGHT}>
                <Link to="/recruiter/sign-in?mode=sign-up">Create recruiter account</Link>
              </Button>
            </div>
          </div>

          <div className="mb-8 flex flex-wrap justify-center gap-2">
            <Button
              variant={filter === "all" ? "default" : "outlineLight"}
              onClick={() => setFilter("all")}
              className={filter === "all" ? RECRUITER_BUTTON_PRIMARY : RECRUITER_BUTTON_OUTLINE_LIGHT}
              style={filter === "all" ? { backgroundColor: DEEP_BLUE } : undefined}
            >
              <Users className="mr-2 h-4 w-4" />
              All
            </Button>
            <Button
              variant={filter === "general" ? "default" : "outlineLight"}
              onClick={() => setFilter("general")}
              className={filter === "general" ? RECRUITER_BUTTON_PRIMARY : RECRUITER_BUTTON_OUTLINE_LIGHT}
              style={filter === "general" ? { backgroundColor: DEEP_BLUE } : undefined}
            >
              <GraduationCap className="mr-2 h-4 w-4" />
              General
            </Button>
            <Button
              variant={filter === "professional" ? "default" : "outlineLight"}
              onClick={() => setFilter("professional")}
              className={filter === "professional" ? RECRUITER_BUTTON_PRIMARY : RECRUITER_BUTTON_OUTLINE_LIGHT}
              style={filter === "professional" ? { backgroundColor: DEEP_BLUE } : undefined}
            >
              <Briefcase className="mr-2 h-4 w-4" />
              Professional
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : error ? (
            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="py-8 text-center text-red-700">{error}</CardContent>
            </Card>
          ) : candidates.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-600">
                No candidates found{filter !== "all" ? ` for ${filter}` : ""} yet. Candidates appear here after they complete Job Assistant and upload their CV.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {candidates.length} candidate{candidates.length !== 1 ? "s" : ""} found
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {candidates.map((c) => (
                  <Card key={c.id} className="h-full border-gray-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-lg">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-11 w-11 shrink-0 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-semibold">
                            {getInitials(c.fullName || "Candidate")}
                          </div>
                          <div className="min-w-0">
                            <CardTitle className="truncate text-lg text-gray-900">{c.fullName || "Candidate"}</CardTitle>
                            {c.createdAt && (
                              <p className="mt-1 inline-flex items-center gap-1 text-xs text-gray-500">
                                <Calendar className="h-3.5 w-3.5" />
                                Joined {new Date(c.createdAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge
                          variant={c.category === "professional" ? "default" : "secondary"}
                          className="capitalize shrink-0"
                        >
                          {c.category === "professional" ? (
                            <><Briefcase className="mr-1 h-3 w-3" /> Professional</>
                          ) : (
                            <><GraduationCap className="mr-1 h-3 w-3" /> General</>
                          )}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-gray-700">
                      <div className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2">
                        <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                        <a href={`mailto:${c.email}`} className="truncate text-indigo-600 hover:underline">
                          {c.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2">
                        <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                        {c.phone ? (
                          <a href={`tel:${c.phone}`} className="text-gray-700 hover:underline">
                            {c.phone}
                          </a>
                        ) : (
                          <span className="text-gray-500">Phone not provided</span>
                        )}
                      </div>
                      <div className="pt-1">
                        <Button asChild size="sm" className={`w-full ${RECRUITER_BUTTON_PRIMARY}`} style={{ backgroundColor: DEEP_BLUE }}>
                          <Link to="/recruiter/sign-in">Sign in to view full profile</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

export default RecruitersPage;
