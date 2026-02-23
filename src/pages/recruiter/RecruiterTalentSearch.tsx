import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, User, Briefcase } from "lucide-react";
import { recruiterApi, type RecruiterCandidateListItem } from "@/services/recruiterApi";

const DEEP_BLUE = "#1e3a5f";

const RecruiterTalentSearch = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<RecruiterCandidateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<"all" | "general" | "professional">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!recruiterApi.hasToken()) {
      navigate("/recruiter/sign-in");
      return;
    }
  }, [navigate]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const cat = category === "all" ? undefined : category;
    recruiterApi
      .getCandidates(cat)
      .then((res) => setCandidates(res.candidates || []))
      .catch((err) => setError(err?.message || "Failed to load candidates"))
      .finally(() => setLoading(false));
  }, [category]);

  const filtered = searchQuery.trim()
    ? candidates.filter(
        (c) =>
          (c.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.category || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : candidates;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Search for talent</h1>
          <p className="text-gray-600 mt-1">
            Browse Smart Apply candidates. Filter by category or search by name, email, or keyword.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Name, email, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white border-gray-300"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={category === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory("all")}
              className={category === "all" ? "text-white" : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50"}
              style={category === "all" ? { backgroundColor: DEEP_BLUE } : undefined}
            >
              All
            </Button>
            <Button
              variant={category === "general" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory("general")}
              className={category === "general" ? "text-white" : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50"}
              style={category === "general" ? { backgroundColor: DEEP_BLUE } : undefined}
            >
              General
            </Button>
            <Button
              variant={category === "professional" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory("professional")}
              className={category === "professional" ? "text-white" : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50"}
              style={category === "professional" ? { backgroundColor: DEEP_BLUE } : undefined}
            >
              Professional
            </Button>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50/50">
            <CardContent className="py-4 text-red-800">{error}</CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="py-12 text-center text-gray-600">
              No candidates found. Try a different category or search term.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((c) => (
              <Card
                key={c.id}
                className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-900">{c.fullName || "—"}</CardTitle>
                        <CardDescription className="text-gray-600">{c.email}</CardDescription>
                      </div>
                    </div>
                    {c.category && (
                      <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100 text-gray-700 capitalize shrink-0">
                        {c.category}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {c.phone && (
                    <p className="text-sm text-gray-600 mb-2">Phone: {c.phone}</p>
                  )}
                  <Button
                    asChild
                    size="sm"
                    className="text-white hover:opacity-90"
                    style={{ backgroundColor: DEEP_BLUE }}
                  >
                    <Link to={`/recruiter/candidates/${c.id}`} className="inline-flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4" /> View profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterTalentSearch;
