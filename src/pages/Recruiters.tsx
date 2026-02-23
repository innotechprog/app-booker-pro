import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { smartApplyAPI } from "@/services/api";
import { Users, Mail, Phone, Briefcase, GraduationCap, Loader2 } from "lucide-react";

interface Candidate {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  category: string;
  createdAt: string;
}

const Recruiters = () => {
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
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Candidate pool</h1>
            <p className="text-lg text-gray-600">
              Smart Apply candidates. Filter by <strong>General</strong> (Grade 12 / matric) or <strong>Professional</strong> (higher qualifications).
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className={filter === "all" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50"}
            >
              <Users className="mr-2 h-4 w-4" />
              All
            </Button>
            <Button
              variant={filter === "general" ? "default" : "outline"}
              onClick={() => setFilter("general")}
              className={filter === "general" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50"}
            >
              <GraduationCap className="mr-2 h-4 w-4" />
              General
            </Button>
            <Button
              variant={filter === "professional" ? "default" : "outline"}
              onClick={() => setFilter("professional")}
              className={filter === "professional" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50"}
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
              <CardContent className="py-8 text-center text-red-700">
                {error}
              </CardContent>
            </Card>
          ) : candidates.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-600">
                No candidates found{filter !== "all" ? ` for ${filter}` : ""} yet. Candidates appear here after they complete Smart Apply and upload their CV.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {candidates.length} candidate{candidates.length !== 1 ? "s" : ""} found
              </p>
              {candidates.map((c) => (
                <Card key={c.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <CardTitle className="text-lg">{c.fullName}</CardTitle>
                      <Badge variant={c.category === "professional" ? "default" : "secondary"} className="capitalize">
                        {c.category === "professional" ? (
                          <><Briefcase className="mr-1 h-3 w-3" /> Professional</>
                        ) : (
                          <><GraduationCap className="mr-1 h-3 w-3" /> General</>
                        )}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                      <a href={`mailto:${c.email}`} className="text-indigo-600 hover:underline">
                        {c.email}
                      </a>
                    </div>
                    {c.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 shrink-0 text-gray-400" />
                        <a href={`tel:${c.phone}`} className="text-gray-700">
                          {c.phone}
                        </a>
                      </div>
                    )}
                    {c.createdAt && (
                      <p className="text-xs text-gray-500 pt-1">
                        Joined {new Date(c.createdAt).toLocaleDateString()}
                      </p>
                    )}
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

export default Recruiters;
