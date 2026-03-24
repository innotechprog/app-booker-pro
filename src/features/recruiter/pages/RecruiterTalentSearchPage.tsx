import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Search, User, Briefcase, ExternalLink, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { recruiterApi, type RecruiterCandidateListItem, type RecruiterRecruitment } from "@/services/recruiterApi";

const DEEP_BLUE = "#1e3a5f";

function parseSearchQuery(input: string): { search?: string; skills?: string; location?: string; experience?: string } {
  const t = input.trim();
  if (!t) return {};
  const result: { search?: string; skills?: string; location?: string; experience?: string } = {};
  const skillsM = t.match(/\bskills:\s*([^]+?)(?=\s+(?:skills|location|loc|experience|exp):|$)/i);
  if (skillsM) result.skills = skillsM[1].trim();
  const locM = t.match(/\b(?:location|loc):\s*([^]+?)(?=\s+(?:skills|location|loc|experience|exp):|$)/i);
  if (locM) result.location = locM[1].trim();
  const expM = t.match(/\b(?:experience|exp):\s*([^]+?)(?=\s+(?:skills|location|loc|experience|exp):|$)/i);
  if (expM) result.experience = expM[1].trim();
  const plain = t
    .replace(/\bskills:\s*[^]+?(?=\s+(?:skills|location|loc|experience|exp):|$)/gi, " ")
    .replace(/\b(?:location|loc):\s*[^]+?(?=\s+(?:skills|location|loc|experience|exp):|$)/gi, " ")
    .replace(/\b(?:experience|exp):\s*[^]+?(?=\s+(?:skills|location|loc|experience|exp):|$)/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain) result.search = plain;
  return result;
}

const RecruiterTalentSearchPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [candidates, setCandidates] = useState<RecruiterCandidateListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<"all" | "general" | "professional">("all");
  const [searchInput, setSearchInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [shortlistOpen, setShortlistOpen] = useState(false);
  const [shortlistCandidate, setShortlistCandidate] = useState<RecruiterCandidateListItem | null>(null);
  const [recruitments, setRecruitments] = useState<RecruiterRecruitment[]>([]);
  const [addingId, setAddingId] = useState<number | null>(null);

  useEffect(() => {
    if (!recruiterApi.hasToken()) {
      navigate("/recruiter/sign-in");
      return;
    }
    recruiterApi.getSearchSuggestions().then((res) => setSuggestions(res.suggestions || [])).catch(() => setSuggestions([]));
  }, [navigate]);

  const fetchCandidates = useCallback((overrideQuery?: string) => {
    const query = (overrideQuery ?? searchInput).trim();
    setLoading(true);
    setError(null);
    if (query) {
      recruiterApi.addSearchSuggestion(query).then(() => {
        recruiterApi.getSearchSuggestions().then((res) => setSuggestions(res.suggestions || []));
      }).catch(() => {});
    }
    const cat = category === "all" ? undefined : category;
    const filters = parseSearchQuery(query);
    recruiterApi
      .getCandidates({
        category: cat,
        search: filters.search,
        skills: filters.skills,
        location: filters.location,
        experience: filters.experience,
      })
      .then((res) => setCandidates(res.candidates || []))
      .catch((err) => setError(err?.message || "Failed to load candidates"))
      .finally(() => setLoading(false));
  }, [category, searchInput]);

  useEffect(() => {
    fetchCandidates();
  }, [category]);

  useEffect(() => {
    if (shortlistOpen) {
      recruiterApi.getRecruitments().then((res) => setRecruitments(res.recruitments || [])).catch(() => setRecruitments([]));
    }
  }, [shortlistOpen]);

  const openShortlist = (c: RecruiterCandidateListItem) => {
    setShortlistCandidate(c);
    setShortlistOpen(true);
  };

  const handleAddToRecruitment = async (recruitmentId: number) => {
    if (!shortlistCandidate) return;
    setAddingId(recruitmentId);
    try {
      await recruiterApi.addCandidateToRecruitment(recruitmentId, shortlistCandidate.id);
      toast({ title: `Added ${shortlistCandidate.fullName} to recruitment` });
      setShortlistOpen(false);
      setShortlistCandidate(null);
    } catch (err) {
      toast({ title: err instanceof Error ? err.message : "Failed to add", variant: "destructive" });
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Search for talent</h1>
          <p className="text-gray-600 mt-1">
            Search candidates by name, or use filters: <code className="text-sm bg-gray-100 px-1 rounded">skills:React</code>, <code className="text-sm bg-gray-100 px-1 rounded">location:Cape Town</code>, <code className="text-sm bg-gray-100 px-1 rounded">experience:Developer</code>
          </p>
        </div>

        <Card className="mb-6 border-gray-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Search</CardTitle>
            <CardDescription>One search field for all filters. Use prefixes or type freely to search names, emails, and job titles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="e.g. John, or skills:React location:Remote experience:Developer"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchCandidates()}
                  className="pl-9 bg-white border-gray-300"
                />
              </div>
              <Button
                onClick={fetchCandidates}
                disabled={loading}
                className="text-white hover:opacity-90 shrink-0"
                style={{ backgroundColor: DEEP_BLUE }}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {" "}Search
              </Button>
            </div>
            {suggestions.length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-2">
                  <History className="h-4 w-4" /> Recent searches
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions
                    .filter((s) => !searchInput.trim() || s.toLowerCase().includes(searchInput.trim().toLowerCase()))
                    .slice(0, 12)
                    .map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setSearchInput(s);
                          fetchCandidates(s);
                        }}
                        className="text-xs px-2.5 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                </div>
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500 mr-1">Category:</span>
              <div className="flex flex-wrap gap-1">
                <Button
                  variant={category === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategory("all")}
                  className={category === "all" ? "text-white" : "bg-white border-gray-300"}
                  style={category === "all" ? { backgroundColor: DEEP_BLUE } : undefined}
                >
                  All
                </Button>
                <Button
                  variant={category === "general" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategory("general")}
                  className={category === "general" ? "text-white" : "bg-white border-gray-300"}
                  style={category === "general" ? { backgroundColor: DEEP_BLUE } : undefined}
                >
                  General
                </Button>
                <Button
                  variant={category === "professional" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategory("professional")}
                  className={category === "professional" ? "text-white" : "bg-white border-gray-300"}
                  style={category === "professional" ? { backgroundColor: DEEP_BLUE } : undefined}
                >
                  Professional
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50/50">
            <CardContent className="py-4 text-red-800">{error}</CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : candidates.length === 0 ? (
          <Card className="border border-gray-200 bg-white shadow-sm">
            <CardContent className="py-12 text-center text-gray-600">
              No candidates found. Try a different category or search term.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {candidates.map((c) => (
              <Card
                key={c.id}
                className="border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                        {c.profilePicture ? (
                          <img
                            src={c.profilePicture.startsWith("data:") ? c.profilePicture : `data:image/jpeg;base64,${c.profilePicture}`}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg text-gray-900">{c.fullName || "- "}</CardTitle>
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
                  <div className="flex flex-wrap gap-2">
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
                    {c.publicCvUrl && (
                      <Button asChild size="sm" variant="outline" className="border-gray-300">
                        <a href={c.publicCvUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5">
                          <ExternalLink className="h-4 w-4" /> Online CV
                        </a>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-300"
                      onClick={() => openShortlist(c)}
                    >
                      <User className="h-4 w-4 mr-1.5" /> Add to recruitment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={shortlistOpen} onOpenChange={setShortlistOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add to recruitment</DialogTitle>
            <DialogDescription>
              {shortlistCandidate ? `Choose a recruitment for ${shortlistCandidate.fullName}.` : "Choose a recruitment."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {recruitments.length === 0 ? (
              <p className="text-sm text-gray-500">No recruitments found. Create one first.</p>
            ) : (
              recruitments.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-2 rounded-md border border-gray-200 p-2">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{r.name}</p>
                    {r.description && <p className="text-xs text-gray-500">{r.description}</p>}
                  </div>
                  <Button
                    size="sm"
                    disabled={addingId === r.id}
                    className="text-white"
                    style={{ backgroundColor: DEEP_BLUE }}
                    onClick={() => handleAddToRecruitment(r.id)}
                  >
                    {addingId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecruiterTalentSearchPage;
